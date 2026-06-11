import vertexai
import json
import re
from services.mongo_service import save_project, update_overall_score
from vertexai.generative_models import GenerativeModel, Image, Part
from config import PROJECT_ID, LOCATION

vertexai.init(
    project=PROJECT_ID,
    location=LOCATION
)

model = GenerativeModel("gemini-2.5-flash")


def evaluate_screenshot(
    project_name,
    image_path
):
    image = Image.load_from_file(image_path)

    prompt = """
You are JudgeLens, a premier product designer and user experience expert.

Analyze the uploaded screenshot or mockup of this application's user interface.

Evaluate the design across the following categories and return a score from 0 to 100 for each:
- visual_design: Colors, typography, spacing, consistency, aesthetic appeal, and layout.
- user_experience: Hierarchy, readability, clarity of features, structure, and navigation clues.
- accessibility: Text contrast, size readability, layout clarity, and compliance indicators.
- professionalism: Overall polish, alignment, icon choice, and feel of a premium SaaS application.
- overall_score: A holistic score representing the aesthetic quality of the UI.

Return ONLY valid JSON. Do not write markdown blocks (like ```json). Do not explain. Do not write text before or after the JSON.

Format:
{
  "visual_design": 0,
  "user_experience": 0,
  "accessibility": 0,
  "professionalism": 0,
  "overall_score": 0,
  "feedback": []
}
"""

    response = model.generate_content(
        [
            prompt,
            Part.from_image(image)
        ]
    )

    cleaned = response.text.strip()
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
                raise ValueError(f"Failed to parse UI evaluation JSON: {cleaned}")
        else:
            raise ValueError(f"Failed to parse UI evaluation JSON: {cleaned}")

    save_project(
        project_name,
        {
            "ui_evaluation": parsed
        }
    )
    update_overall_score(project_name)

    return parsed