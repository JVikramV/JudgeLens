from tools.ppt_tool import extract_ppt_text
from services.ai_service import ask_judgelens
from services.mongo_service import save_project, update_overall_score
import json
import re


def evaluate_ppt(
    project_name,
    filepath
):
    ppt_content = extract_ppt_text(filepath)

    with open(
        "prompts/ppt_prompt.txt",
        "r",
        encoding="utf-8"
    ) as f:
        prompt = f.read()

    final_prompt = prompt + "\n\n" + ppt_content
    response = ask_judgelens(final_prompt)

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
                raise ValueError(f"Failed to parse presentation evaluation JSON: {cleaned}")
        else:
            raise ValueError(f"Failed to parse presentation evaluation JSON: {cleaned}")

    save_project(
        project_name,
        {
            "ppt_evaluation": parsed
        }
    )
    update_overall_score(project_name)

    return parsed