from services.database import db
from datetime import datetime

projects = db["projects"]


def save_project(project_name, data):
    projects.update_one(
        {"project_name": project_name},
        {
            "$set": {
                "project_name": project_name,
                "last_updated": datetime.now().isoformat(),
                **data
            }
        },
        upsert=True
    )
    update_overall_score(project_name)


def get_all_projects():
    # Recalculate ranks to ensure accuracy
    recalculate_ranks()
    return list(
        projects.find(
            {},
            {"_id": 0}
        ).sort(
            "overall_score",
            -1
        )
    )


def get_project(project_name):
    # Recalculate ranks first to ensure this project has the correct rank
    recalculate_ranks()
    return projects.find_one(
        {"project_name": project_name},
        {"_id": 0}
    )


def update_overall_score(project_name):
    project = projects.find_one(
        {"project_name": project_name}
    )

    if not project:
        return

    available_scores = []
    available_weights = []

    repo_score = None
    ppt_score = None
    ui_score = None

    if "repo_evaluation" in project and "scores" in project["repo_evaluation"]:
        repo_score = project["repo_evaluation"]["scores"].get("overall_score")
        if repo_score is not None:
            available_scores.append(repo_score)
            available_weights.append(0.4)

    if "ppt_evaluation" in project:
        ppt_score = project["ppt_evaluation"].get("overall_score")
        if ppt_score is not None:
            available_scores.append(ppt_score)
            available_weights.append(0.3)

    if "ui_evaluation" in project:
        ui_score = project["ui_evaluation"].get("overall_score")
        if ui_score is not None:
            available_scores.append(ui_score)
            available_weights.append(0.3)

    if available_weights:
        total_weight = sum(available_weights)
        overall_score = round(sum(s * w for s, w in zip(available_scores, available_weights)) / total_weight, 2)
    else:
        overall_score = 0.0

    # Badge System calculation
    if overall_score >= 95:
        badge = "Platinum"
    elif overall_score >= 85:
        badge = "Gold"
    elif overall_score >= 75:
        badge = "Silver"
    elif overall_score >= 60:
        badge = "Bronze"
    else:
        badge = "Needs Improvement"

    # Verdict System calculation
    if overall_score >= 90:
        verdict = "Potential Winner"
    elif overall_score >= 75 and repo_score is not None and repo_score >= 80:
        verdict = "Strong Technical Project"
    elif overall_score >= 75:
        verdict = "Solid Contender"
    else:
        verdict = "Needs Refinement"

    projects.update_one(
        {"project_name": project_name},
        {
            "$set": {
                "overall_score": overall_score,
                "badge": badge,
                "verdict": verdict,
                "last_updated": datetime.now().isoformat()
            }
        }
    )
    recalculate_ranks()


def recalculate_ranks():
    all_projects = list(projects.find({}, {"_id": 0, "project_name": 1}).sort("overall_score", -1))
    for index, project in enumerate(all_projects):
        projects.update_one(
            {"project_name": project["project_name"]},
            {"$set": {"rank": index + 1}}
        )