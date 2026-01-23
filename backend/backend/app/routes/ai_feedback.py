"""
AI Feedback Route - Task Evaluation System with Database Persistence
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import json
from datetime import datetime

from backend.app.db_dep import get_db
from backend.app.models import UserTask, User
from backend.app.ai.prompt_builder import build_mentor_prompt
from backend.app.core.config import settings
from backend.app.auth_dep import get_current_user

import httpx


router = APIRouter(prefix="/ai-feedback", tags=["AI Feedback"])


class EvaluationRequest(BaseModel):
    task_id: int  # Required - which task is being submitted
    submission: str  # The code submission
    time_spent_minutes: Optional[int] = None  # How long did it take


class EvaluationResponse(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]
    mentor_feedback: str
    task_id: int
    xp_earned: int


# System prompt for evaluation
def get_evaluation_prompt(language: str = "en") -> str:
    if language == "tr":
        return """Sen uzman bir yazılım mentorsun. Stajyerin görev teslimini değerlendiriyorsun.

PUANLAMA KRİTERLERİ (100 üzerinden):

1. GEREKSİNİMLER (40 puan)
   - Her gereksinim karşılandı mı kontrol et
   - Kısmen karşılanan gereksinimler için yarım puan ver
   - Eksik gereksinimler için 0 puan

2. KOD KALİTESİ (25 puan)
   - Temiz ve okunabilir kod
   - Değişken/fonksiyon isimlendirmeleri
   - Best practices uyumu
   - DRY prensibi

3. FONKSİYONELLİK (20 puan)
   - Kod çalışıyor mu?
   - Bekleneni yapıyor mu?
   - Edge case'ler düşünülmüş mü?

4. HATA YÖNETİMİ (10 puan)
   - try/catch blokları
   - Hata mesajları
   - Girdi validasyonu

5. DOKÜMANTASYON (5 puan)
   - Yorumlar
   - README veya açıklamalar

ÖNEMLİ:
- Her güçlü yön için somut örnek ver
- Her zayıf yön için iyileştirme önerisi sun
- Geri bildirim yapıcı ve eğitici olsun

SADECE geçerli JSON formatında yanıt ver:
{
    "score": 75,
    "strengths": ["Somut güçlü yön 1", "Somut güçlü yön 2", "Somut güçlü yön 3"],
    "weaknesses": ["Geliştirme önerisi 1", "Geliştirme önerisi 2"],
    "mentor_feedback": "Detaylı ve yapıcı mentor geri bildirimi. Neler iyi yapılmış, neler geliştirilebilir, ve bir sonraki adımlar için öneriler. 2-3 paragraf."
}"""
    else:
        return """You are an expert software mentor evaluating student work.

SCORING CRITERIA (out of 100):

1. REQUIREMENTS COMPLIANCE (40 points)
   - Check if each requirement is met
   - Partial credit for partially met requirements
   - 0 points for missing requirements

2. CODE QUALITY (25 points)
   - Clean and readable code
   - Variable/function naming conventions
   - Best practices compliance
   - DRY principle

3. FUNCTIONALITY (20 points)
   - Does the code work?
   - Does it do what's expected?
   - Are edge cases considered?

4. ERROR HANDLING (10 points)
   - try/catch blocks
   - Error messages
   - Input validation

5. DOCUMENTATION (5 points)
   - Comments
   - README or explanations

IMPORTANT:
- Give concrete examples for each strength
- Provide improvement suggestions for each weakness
- Feedback should be constructive and educational

Return ONLY valid JSON:
{
    "score": 75,
    "strengths": ["Concrete strength 1", "Concrete strength 2", "Concrete strength 3"],
    "weaknesses": ["Improvement suggestion 1", "Improvement suggestion 2"],
    "mentor_feedback": "Detailed and constructive mentor feedback. What was done well, what can be improved, and suggestions for next steps. 2-3 paragraphs."
}"""


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_submission(
    req: EvaluationRequest, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Evaluate student task submission using AI mentor.
    Saves evaluation results to database and updates user XP.
    """
    user_id = current_user["sub"]
    API_KEY = settings.IO_NET_API_KEY
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    # Get the task
    task = db.query(UserTask).filter(
        UserTask.id == req.task_id,
        UserTask.user_id == user_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Parse requirements
    try:
        requirements = json.loads(task.requirements) if task.requirements else []
    except:
        requirements = []
    
    # Detect language from task title
    language = "tr" if any(c in task.title for c in "şğüıöçŞĞÜİÖÇ") else "en"
    
    # Build evaluation prompt
    if language == "tr":
        user_prompt = f"""Görev: {task.title}

Açıklama: {task.description}

Gereksinimler:
{chr(10).join(f'- {r}' for r in requirements)}

Stajyerin Teslimi:
```
{req.submission}
```

Bu teslimi değerlendir ve JSON formatında sonuç ver."""
    else:
        user_prompt = f"""Task: {task.title}

Description: {task.description}

Requirements:
{chr(10).join(f'- {r}' for r in requirements)}

Student Submission:
```
{req.submission}
```

Evaluate this submission and return JSON result."""
    
    system_prompt = get_evaluation_prompt(language)
    
    payload = {
        "model": settings.IO_NET_MODEL_ID,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,  # Lower temperature for consistent evaluation
        "max_tokens": 2048
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.IO_NET_API_URL,
                headers=headers,
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            
            if "choices" not in result or len(result["choices"]) == 0:
                raise HTTPException(status_code=500, detail="No response from AI")
            
            ai_content = result["choices"][0]["message"]["content"]
            
            # Parse JSON response
            try:
                if "```json" in ai_content:
                    ai_content = ai_content.split("```json")[1].split("```")[0]
                elif "```" in ai_content:
                    ai_content = ai_content.split("```")[1].split("```")[0]
                
                evaluation = json.loads(ai_content.strip())
            except json.JSONDecodeError:
                evaluation = {
                    "score": 50,
                    "strengths": ["Teslim alındı" if language == "tr" else "Submission received"],
                    "weaknesses": ["Değerlendirme ayrıştırılamadı" if language == "tr" else "Could not parse evaluation"],
                    "mentor_feedback": ai_content[:500]
                }
            
            # Extract values
            score = int(evaluation.get("score", 50))
            score = max(0, min(100, score))  # Clamp to 0-100
            strengths = evaluation.get("strengths", [])
            weaknesses = evaluation.get("weaknesses", [])
            mentor_feedback = evaluation.get("mentor_feedback", "Evaluation complete.")
            
            # Calculate XP earned (base XP * score percentage)
            xp_earned = int((task.xp or 100) * (score / 100))
            
            # Update task in database
            task.submission = req.submission
            task.score = score
            task.ai_feedback = mentor_feedback
            task.strengths = json.dumps(strengths)
            task.weaknesses = json.dumps(weaknesses)
            task.status = "done"
            task.completed_at = datetime.utcnow()
            if req.time_spent_minutes:
                task.time_spent_minutes = req.time_spent_minutes
            
            # Update user XP
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.total_xp = (user.total_xp or 0) + xp_earned
            
            db.commit()
            
            return EvaluationResponse(
                score=score,
                strengths=strengths if isinstance(strengths, list) else [strengths],
                weaknesses=weaknesses if isinstance(weaknesses, list) else [weaknesses],
                mentor_feedback=mentor_feedback,
                task_id=task.id,
                xp_earned=xp_earned
            )
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.get("/evaluations")
def list_evaluations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all task evaluations for the authenticated user.
    """
    user_id = current_user["sub"]
    tasks = db.query(UserTask).filter(
        UserTask.user_id == user_id,
        UserTask.score.isnot(None)
    ).order_by(UserTask.completed_at.desc()).all()
    
    result = []
    for task in tasks:
        result.append({
            "id": task.id,
            "title": task.title,
            "domain": task.field,
            "score": task.score,
            "xp": task.xp,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        })
    
    return result


@router.get("/evaluations/{task_id}")
def get_evaluation_detail(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed evaluation for a specific task.
    """
    user_id = current_user["sub"]
    task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == user_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "domain": task.field,
        "score": task.score,
        "xp_earned": int((task.xp or 100) * (task.score / 100)) if task.score else 0,
        "strengths": json.loads(task.strengths) if task.strengths else [],
        "weaknesses": json.loads(task.weaknesses) if task.weaknesses else [],
        "mentor_feedback": task.ai_feedback,
        "submission": task.submission,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None
    }


@router.get("/health")
async def health_check():
    """Health check endpoint for AI Feedback service"""
    return {"status": "ok", "service": "ai-feedback"}
