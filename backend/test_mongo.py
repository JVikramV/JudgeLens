from services.database import db

projects = db["projects"]

project = {
    "project_name": "EggBucket",
    "overall_score": 90
}

projects.insert_one(project)

print("Inserted")