import vertexai
from vertexai.generative_models import GenerativeModel
from config import PROJECT_ID, LOCATION

vertexai.init(
    project=PROJECT_ID,
    location=LOCATION
)

model = GenerativeModel("gemini-2.5-flash")

def ask_judgelens(prompt):

    response = model.generate_content(prompt)

    return response.text