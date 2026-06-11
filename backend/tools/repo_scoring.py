from tools.repo_tool import get_repo_info
from services.ai_service import ask_judgelens
from services.mongo_service import save_project, update_overall_score
import json
import re


def evaluate_repo(
    project_name,
    repo_url
):
    # Fetch detailed codebase data from the new pipeline
    repo_data = get_repo_info(repo_url)

    if "error" in repo_data:
        raise ValueError(repo_data["error"])

    # Build readable representation of repo data for the prompt
    languages_str = ", ".join([f"{k} ({v} bytes)" for k, v in repo_data.get("languages", {}).items()])
    topics_str = ", ".join(repo_data.get("topics", []))
    
    commits_str = ""
    for c in repo_data.get("commits", []):
        commits_str += f"- [{c['date']}] {c['author']}: {c['message']}\n"
        
    structure_str = "\n".join(repo_data.get("folder_structure", []))
    
    deps_str = ""
    for fname, fcontent in repo_data.get("dependencies", {}).items():
        deps_str += f"=== File: {fname} ===\n{fcontent}\n\n"
        
    sources_str = ""
    for filepath, fcontent in repo_data.get("source_files", {}).items():
        sources_str += f"=== File: {filepath} ===\n{fcontent}\n\n"

    prompt = f"""
You are JudgeLens, an elite staff software engineer, technical architect, and hackathon judge.

Analyze this GitHub repository's structure, files, dependencies, code quality, and documentation to perform a comprehensive evaluation of the project.

Here is the retrieved repository metadata:
- Name: {repo_data.get("name")}
- Description: {repo_data.get("description")}
- Stars: {repo_data.get("stars")} | Forks: {repo_data.get("forks")}
- Languages: {languages_str}
- Topics: {topics_str}

=== README.md Content ===
{repo_data.get("readme")}

=== Folder Structure (Filtered) ===
{structure_str}

=== Dependency Configurations ===
{deps_str}

=== Primary Source Code Entry Points ===
{sources_str}

=== Recent Commits ===
{commits_str}

Evaluate the codebase and provide a score from 0 to 100 for each of the following:
1. documentation_score: Score the quality of the README.md, documentation clarity, comments, setup instructions, and code readability.
2. technical_quality_score: Score the architectural choices, use of modern frameworks/libraries, code structure, styling, separation of concerns, and clean coding standards.
3. project_completeness_score: Score how finished the project is. Does it contain a functional client and server? Are there configurations, tests, or missing placeholders?
4. innovation_score: Score the uniqueness, technical complexity of the solutions, and innovative engineering patterns used in the codebase.
5. overall_score: A weighted overall score representing the quality of this codebase repository.

Return ONLY valid JSON. Do not write markdown blocks (like ```json). Do not explain. Do not write text before or after the JSON.

JSON Schema:
{{
  "scores": {{
    "documentation_score": 0,
    "technical_quality_score": 0,
    "project_completeness_score": 0,
    "innovation_score": 0,
    "overall_score": 0
  }},
  "summary": "A brief overview summarizing the codebase structure, quality, and choice of technologies.",
  "strengths": ["list of key technical strengths and architecture positives"],
  "weaknesses": ["list of technical flaws, code smells, or missing configurations"],
  "recommendation": "A detailed, actionable recommendation on how to clean up code, improve architecture, or fix bugs."
}}
"""

    response = ask_judgelens(prompt)

    cleaned = response.strip()
    cleaned = cleaned.replace("```json", "")
    cleaned = cleaned.replace("```", "")
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
    except Exception:
        # Fallback: extract first matching JSON block
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception:
                raise ValueError(f"Failed to parse codebase evaluation JSON: {cleaned}")
        else:
            raise ValueError(f"Failed to parse codebase evaluation JSON: {cleaned}")

    # Add repository URL to evaluation data for record keeping
    parsed["repo_url"] = repo_url

    save_project(
        project_name,
        {
            "repo_evaluation": parsed
        }
    )
    update_overall_score(project_name)

    return parsed
