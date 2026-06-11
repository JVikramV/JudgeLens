import requests
import base64
import os
import re
from dotenv import load_dotenv

# Load environment variables explicitly
load_dotenv()

def get_repo_info(repo_url):
    try:
        # Normalize and extract owner and repo
        url_clean = repo_url.rstrip("/")
        parts = url_clean.split("/")
        if len(parts) < 2:
            return {"error": "Invalid GitHub repository URL format."}
        
        owner = parts[-2]
        repo = parts[-1]

        # Read GITHUB_TOKEN from env variables
        GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

        # Set standard headers
        headers = {
            "Accept": "application/vnd.github+json"
        }
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"

        base_api = f"https://api.github.com/repos/{owner}/{repo}"

        # Helper to make requests with error checks
        def make_request(url):
            response = requests.get(url, headers=headers)
            
            # Rate limit check (403 Forbidden with empty rate limit header, or 429 Too Many Requests)
            if response.status_code in [403, 429]:
                limit_remaining = response.headers.get("X-RateLimit-Remaining")
                if limit_remaining == "0" or "rate limit" in response.text.lower():
                    return {"error": "GitHub API rate limit exceeded. Please configure GITHUB_TOKEN in backend/.env to increase rate limits."}
            
            # Repository Not Found check
            if response.status_code == 404:
                return {"error": "GitHub repository not found. Please verify the URL."}
            
            # General API failure check
            if response.status_code != 200:
                return {"error": f"GitHub API failure: status code {response.status_code} during lookup."}
                
            return response.json()

        # 1. Basic repository info
        repo_data = make_request(base_api)
        if isinstance(repo_data, dict) and "error" in repo_data:
            return repo_data
        
        default_branch = repo_data.get("default_branch", "main")

        # 2. Fetch languages list
        languages = make_request(f"{base_api}/languages")
        if isinstance(languages, dict) and "error" in languages:
            if "rate limit" in languages["error"]:
                return languages
            languages = {}  # Fallback to empty dict on general failure

        # 3. Fetch recent commits (last 5)
        commits_data = make_request(f"{base_api}/commits?per_page=5")
        commits = []
        if isinstance(commits_data, list):
            for c in commits_data:
                if isinstance(c, dict):
                    commit_info = c.get("commit", {})
                    commits.append({
                        "message": commit_info.get("message", "").strip(),
                        "author": commit_info.get("author", {}).get("name", "Unknown"),
                        "date": commit_info.get("author", {}).get("date", "")
                    })
        elif isinstance(commits_data, dict) and "error" in commits_data:
            if "rate limit" in commits_data["error"]:
                return commits_data

        # Helper to fetch and decode a text file
        def fetch_file_content(path, max_chars=4000):
            file_response = requests.get(f"{base_api}/contents/{path}", headers=headers)
            
            # Check rate limit specifically
            if file_response.status_code in [403, 429]:
                limit_remaining = file_response.headers.get("X-RateLimit-Remaining")
                if limit_remaining == "0" or "rate limit" in file_response.text.lower():
                    return "__RATE_LIMIT_EXCEEDED__"
            
            if file_response.status_code == 200:
                file_data = file_response.json()
                if isinstance(file_data, dict) and file_data.get("encoding") == "base64":
                    try:
                        decoded = base64.b64decode(file_data["content"]).decode("utf-8", errors="ignore")
                        return decoded[:max_chars]
                    except Exception:
                        return "[Error decoding file contents]"
            return None

        # 4. Fetch README.md
        readme = fetch_file_content("README.md", max_chars=10000)
        if readme == "__RATE_LIMIT_EXCEEDED__":
            return {"error": "GitHub API rate limit exceeded during file extraction. Please set a valid GITHUB_TOKEN in backend/.env."}
        if not readme:
            readme = fetch_file_content("readme.md", max_chars=10000)
            if readme == "__RATE_LIMIT_EXCEEDED__":
                return {"error": "GitHub API rate limit exceeded during file extraction. Please set a valid GITHUB_TOKEN in backend/.env."}
        
        # 5. Fetch recursive file tree to understand folder structure
        tree_api = f"{base_api}/git/trees/{default_branch}?recursive=1"
        tree_response = requests.get(tree_api, headers=headers)
        
        # Check rate limit on tree lookup
        if tree_response.status_code in [403, 429]:
            limit_remaining = tree_response.headers.get("X-RateLimit-Remaining")
            if limit_remaining == "0" or "rate limit" in tree_response.text.lower():
                return {"error": "GitHub API rate limit exceeded during tree analysis. Please set a valid GITHUB_TOKEN in backend/.env."}

        folder_structure = []
        dep_files = {}
        source_files = {}

        if tree_response.status_code == 200:
            tree_data = tree_response.json()
            tree = tree_data.get("tree", [])
            
            ignored_patterns = re.compile(
                r'node_modules/|\.git/|venv/|\.env|build/|dist/|public/|assets/|\.png|\.jpg|\.webp|\.ico|\.svg|\.pdf'
            )
            
            tree_paths = [t.get("path") for t in tree if t.get("type") == "blob"]
            filtered_paths = [p for p in tree_paths if not ignored_patterns.search(p)]
            
            folder_structure = filtered_paths[:50]

            # Find dependencies config
            deps_candidates = ["package.json", "requirements.txt", "go.mod", "Cargo.toml"]
            for path in filtered_paths:
                base_name = path.split("/")[-1]
                if base_name in deps_candidates:
                    content = fetch_file_content(path, max_chars=3000)
                    if content == "__RATE_LIMIT_EXCEEDED__":
                        return {"error": "GitHub API rate limit exceeded during config extraction. Please set a valid GITHUB_TOKEN in backend/.env."}
                    if content:
                        dep_files[base_name] = content

            # Find main source files
            source_candidates = [
                r'(^|/)main\.py$', r'(^|/)app\.py$', r'(^|/)index\.js$', 
                r'(^|/)main\.jsx$', r'(^|/)App\.jsx$', r'(^|/)App\.tsx$',
                r'(^|/)index\.html$'
            ]
            source_patterns = [re.compile(pat) for pat in source_candidates]
            
            for path in filtered_paths:
                for pat in source_patterns:
                    if pat.search(path):
                        content = fetch_file_content(path, max_chars=3000)
                        if content == "__RATE_LIMIT_EXCEEDED__":
                            return {"error": "GitHub API rate limit exceeded during source code extraction. Please set a valid GITHUB_TOKEN in backend/.env."}
                        if content:
                            source_files[path] = content
                        break  # Only save one copy of matching path
                    
        return {
            "name": repo_data.get("name"),
            "description": repo_data.get("description"),
            "stars": repo_data.get("stars", 0),
            "forks": repo_data.get("forks", 0),
            "languages": languages,
            "topics": repo_data.get("topics", []),
            "default_branch": default_branch,
            "readme": readme or "[No README.md found in repository]",
            "folder_structure": folder_structure,
            "dependencies": dep_files,
            "commits": commits,
            "source_files": source_files
        }

    except Exception as e:
        return {"error": f"Error running GitHub analysis: {str(e)}"}