from fastapi import APIRouter
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

from ai.task_prompt_builder import build_task_prompt

load_dotenv()

router = APIRouter(prefix="/tasks", tags=["Tasks"])

API_KEY = os.getenv("IOINTELLIGENCE_API_KEY")

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(__file__)
        )
    )
)


class TaskGenerateRequest(BaseModel):
    domain: str
    level: str  # beginner | intermediate


@router.post("/generate")
def generate_task(req: TaskGenerateRequest):

    prompt = build_task_prompt(
        domain=req.domain,
        level=req.level
    )

    system_prompt = open(
        os.path.join(BASE_DIR, "ai", "task_generator.txt"),
        encoding="utf-8"
    ).read()

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8
    }

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
    return response.json()
