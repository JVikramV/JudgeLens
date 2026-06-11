from fastapi import FastAPI, UploadFile, File, HTTPException
from services.ai_service import ask_judgelens
from fastapi.middleware.cors import CORSMiddleware
import os

from tools.ppt_scoring import evaluate_ppt
from tools.repo_scoring import evaluate_repo
from tools.image_scoring import evaluate_screenshot
from services.mongo_service import (
    get_all_projects,
    get_project
)

app = FastAPI()

# Make sure uploads directory exists
os.makedirs("uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://judge-lens.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "project": "JudgeLens",
        "status": "running"
    }


@app.get("/test-ai")
def test_ai():
    try:
        result = ask_judgelens(
            "You are JudgeLens. Evaluate a hackathon project that solves food delivery logistics."
        )
        return {"response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service error: {str(e)}")


@app.post("/evaluate-ppt")
async def evaluate_presentation(
    project_name: str,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pptx"):
        raise HTTPException(status_code=400, detail="Only PowerPoint files (.pptx) are supported.")

    filepath = f"uploads/{file.filename}"

    try:
        with open(filepath, "wb") as f:
            f.write(await file.read())

        report = evaluate_ppt(
            project_name,
            filepath
        )
        return {"evaluation": report}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up local file after processing
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass


@app.get("/evaluate-repo")
def repo_analysis(
    project_name: str,
    url: str
):
    try:
        result = evaluate_repo(
            project_name,
            url
        )
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/evaluate-ui")
async def evaluate_ui(
    project_name: str,
    file: UploadFile = File(...)
):
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Supported image formats are: .png, .jpg, .jpeg, .webp")

    filepath = f"uploads/{file.filename}"

    try:
        with open(filepath, "wb") as f:
            f.write(await file.read())

        result = evaluate_screenshot(
            project_name,
            filepath
        )
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up local file after processing
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass


@app.get("/leaderboard")
def leaderboard():
    try:
        return get_all_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


@app.get("/project/{project_name}")
def project_details(project_name: str):
    try:
        details = get_project(project_name)
        if not details:
            raise HTTPException(status_code=404, detail="Project not found")
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")