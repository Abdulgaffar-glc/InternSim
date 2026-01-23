import os
import requests
import json
from dotenv import load_dotenv
from pathlib import Path

# .env yolunu garantiye alıyoruz
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("IOINTELLIGENCE_API_KEY")
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

def evaluate_submission_content(submission_content: str, task_title: str, task_desc: str, task_difficulty: str):
    """
    Öğrenci kodunu analiz eder ve senin Evaluation modeline uygun (score, feedback) döner.
    """
    
    # 1. System Prompt
    system_prompt_path = os.path.join(BASE_DIR, "ai", "system_prompt.txt")
    
    if os.path.exists(system_prompt_path):
        with open(system_prompt_path, encoding="utf-8") as f:
            base_system_prompt = f.read()
    else:
        base_system_prompt = "You are a senior software engineer mentor."

    # 2. JSON Formatı Zorlama
    format_instruction = """
    IMPORTANT: Respond with a purely JSON object.
    Structure:
    {
        "score": 85,
        "feedback": "Short constructive feedback text here..."
    }
    """
    
    final_system_prompt = base_system_prompt + "\n\n" + format_instruction

    # 3. User Prompt
    user_prompt = f"""
    Task: {task_title} ({task_difficulty})
    Description: {task_desc}
    
    Code:
    {submission_content}
    
    Evaluate this code based on correctness and clean code.
    """

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": [
            {"role": "system", "content": final_system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.5
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

        ai_response = response.json()
        content_str = ai_response["choices"][0]["message"]["content"]

        # Markdown temizliği
        if "```json" in content_str:
            content_str = content_str.split("```json")[1].split("```")[0].strip()
        elif "```" in content_str:
            content_str = content_str.strip("```")

        return json.loads(content_str)

    except Exception as e:
        print(f"AI Eval Error: {e}")
        return {
            "score": 0,
            "feedback": "AI evaluation failed. Please verify API Key."
        }