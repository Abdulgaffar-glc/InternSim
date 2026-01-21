from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

from ai.prompt_builder import build_mentor_prompt

load_dotenv()

router = APIRouter(prefix="/mentor", tags=["Mentor"])

API_KEY = os.getenv("IOINTELLIGENCE_API_KEY")

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(__file__)
        )
    )
)

SYSTEM_PROMPT = open(
    os.path.join(BASE_DIR, "ai", "system_prompt.txt"),
    encoding="utf-8"
).read()


class MentorRequest(BaseModel):
    domain: str
    task: str
    requirements: list[str]
    submission: str


@router.post("/evaluate")
def evaluate_mentor(req: MentorRequest):

    prompt = build_mentor_prompt(
        domain=req.domain,
        task=req.task,
        requirements=req.requirements,
        submission=req.submission
    )

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(
            "https://api.intelligence.io.solutions/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

    return response.json()
