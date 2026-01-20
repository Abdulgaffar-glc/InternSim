from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

from ai.prompt_builder import build_mentor_prompt

# -------------------------------------------------
# ENV
# -------------------------------------------------
load_dotenv()
API_KEY = os.getenv("IOINTELLIGENCE_API_KEY")

if not API_KEY:
    raise RuntimeError("IOINTELLIGENCE_API_KEY not found in .env")

SYSTEM_PROMPT = open(
    "ai/system_prompt.txt", "r", encoding="utf-8"
).read()

# -------------------------------------------------
# FASTAPI APP
# -------------------------------------------------
app = FastAPI(
    title="AI Mentor Agent",
    description="Evaluates student submissions using an AI mentor",
    version="1.0.0"
)

# -------------------------------------------------
# REQUEST SCHEMA
# -------------------------------------------------
class MentorRequest(BaseModel):
    domain: str
    task: str
    requirements: list[str]
    submission: str

# -------------------------------------------------
# CORE ENDPOINT
# -------------------------------------------------
@app.post("/mentor/evaluate")
def evaluate_mentor(req: MentorRequest):

    # 🔍 DEBUG: prompt gerçekten dolu mu?
    prompt = build_mentor_prompt(
        domain=req.domain,
        task=req.task,
        requirements=req.requirements,
        submission=req.submission
    )

    print("===== FINAL PROMPT =====")
    print(prompt)
    print("========================")

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            "https://api.intelligence.io.solutions/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

    return response.json()
