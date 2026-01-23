"""
Task Generator Route - AI-generated internship tasks with language support
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import json

import httpx

from backend.app.db_dep import get_db
from backend.app.models import UserTask
from backend.app.ai.task_prompt_builder import build_task_prompt
from backend.app.core.config import settings
from backend.app.auth_dep import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


class GenerateTaskRequest(BaseModel):
    domain: str  # frontend, backend, ai, cybersecurity
    level: str   # junior, mid, senior
    language: Optional[str] = "en"  # "tr" for Turkish, "en" for English


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    requirements: List[str]
    difficulty: str
    xp: int
    status: str
    field: str


# System prompts for task generation
TASK_GENERATOR_PROMPT_EN = """You are a professional internship task designer.

Your job is to generate realistic internship-level tasks based on:
- Domain
- Intern level

Rules:
- Tasks must be clear, scoped, and achievable.
- Include 4-6 specific, measurable requirements that the intern must fulfill.
- Requirements should be concrete technical objectives.
- Do NOT include solutions.
- Do NOT include hints.
- Do NOT include evaluation or scoring.
- Tasks should simulate real-world internship work.

Difficulty Levels:
- junior: fundamentals, small scope, guided objectives.
- mid: more autonomy, multiple components, real-world constraints.
- senior: complex problems, system design, production-ready code.

Return ONLY valid JSON in this exact format:
{
    "title": "Task Title",
    "description": "Detailed task description explaining what needs to be built",
    "requirements": [
        "Specific requirement 1",
        "Specific requirement 2",
        "Specific requirement 3",
        "Specific requirement 4"
    ]
}"""

TASK_GENERATOR_PROMPT_TR = """Sen profesyonel bir staj görev tasarımcısısın.

Görevin, verilen alan ve seviyeye göre gerçekçi staj görevleri oluşturmak:
- Alan (Domain)
- Stajyer seviyesi

Kurallar:
- Görevler açık, kapsamlı ve başarılabilir olmalı.
- Stajyerin yerine getirmesi gereken 4-6 spesifik, ölçülebilir gereksinim (ister) ekle.
- Gereksinimler somut teknik hedefler olmalı.
- Çözüm EKLEME.
- İpucu EKLEME.
- Değerlendirme veya puanlama EKLEME.
- Görevler gerçek iş ortamı staj deneyimini simüle etmeli.

Zorluk Seviyeleri:
- junior (Başlangıç): Temel konular, küçük kapsam, yönlendirilmiş hedefler.
- mid (Orta): Daha fazla özerklik, birden fazla bileşen, gerçek dünya kısıtlamaları.
- senior (İleri): Karmaşık problemler, sistem tasarımı, üretime hazır kod.

SADECE geçerli JSON formatında yanıt ver:
{
    "title": "Görev Başlığı (Türkçe)",
    "description": "Neyin yapılması gerektiğini açıklayan detaylı görev açıklaması (Türkçe)",
    "requirements": [
        "Spesifik gereksinim 1 (Türkçe)",
        "Spesifik gereksinim 2 (Türkçe)",
        "Spesifik gereksinim 3 (Türkçe)",
        "Spesifik gereksinim 4 (Türkçe)"
    ]
}"""


def get_task_prompt(domain: str, level: str, language: str) -> str:
    """Build the user prompt for task generation based on language"""
    if language == "tr":
        domain_names = {
            "frontend": "Frontend Geliştirme",
            "backend": "Backend Geliştirme",
            "ai": "Yapay Zeka / Makine Öğrenmesi",
            "cybersecurity": "Siber Güvenlik"
        }
        level_names = {
            "junior": "Başlangıç Seviye",
            "mid": "Orta Seviye",
            "senior": "İleri Seviye"
        }
        return f"""Alan: {domain_names.get(domain, domain)}
Seviye: {level_names.get(level, level)}

Bu alan ve seviye için uygun bir staj görevi oluştur. Görev Türkçe olmalı."""
    else:
        return build_task_prompt(domain, level)


@router.post("/generate", response_model=TaskResponse)
async def generate_task(
    req: GenerateTaskRequest, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a new task using AI based on domain and level.
    Saves the task to database with requirements.
    """
    user_id = current_user["sub"]
    API_KEY = settings.IO_NET_API_KEY
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    # Select system prompt based on language
    system_prompt = TASK_GENERATOR_PROMPT_TR if req.language == "tr" else TASK_GENERATOR_PROMPT_EN
    
    # Build user prompt
    user_prompt = get_task_prompt(req.domain, req.level, req.language)
    
    # Calculate XP based on difficulty
    xp_map = {"junior": 100, "mid": 200, "senior": 350}
    xp = xp_map.get(req.level, 150)
    
    payload = {
        "model": settings.IO_NET_MODEL_ID,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.8,  # Higher for variety
        "max_tokens": 1024
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
            
            # Parse JSON
            try:
                if "```json" in ai_content:
                    ai_content = ai_content.split("```json")[1].split("```")[0]
                elif "```" in ai_content:
                    ai_content = ai_content.split("```")[1].split("```")[0]
                
                task_data = json.loads(ai_content.strip())
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Failed to parse AI response")
            
            # Extract requirements
            requirements = task_data.get("requirements", [])
            if not requirements:
                # Generate default requirements if missing
                requirements = [
                    "Kod temiz ve okunabilir olmalı" if req.language == "tr" else "Code should be clean and readable",
                    "Proje çalışır durumda olmalı" if req.language == "tr" else "Project should be functional",
                    "Dokümantasyon eklenmeli" if req.language == "tr" else "Documentation should be added"
                ]
            
            # Create task in database
            new_task = UserTask(
                user_id=user_id,
                title=task_data.get("title", "New Task"),
                description=task_data.get("description", ""),
                requirements=json.dumps(requirements),  # Store as JSON
                difficulty=req.level,
                xp=xp,
                field=req.domain,
                status="todo",
                due_days=3 if req.level == "junior" else (4 if req.level == "mid" else 5)
            )
            db.add(new_task)
            db.commit()
            db.refresh(new_task)
            
            return TaskResponse(
                id=new_task.id,
                title=new_task.title,
                description=new_task.description,
                requirements=requirements,
                difficulty=new_task.difficulty,
                xp=new_task.xp,
                status=new_task.status,
                field=new_task.field
            )
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task generation failed: {str(e)}")


@router.get("/")
def list_tasks(
    field: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all tasks for the authenticated user, optionally filtered by field.
    """
    user_id = current_user["sub"]
    query = db.query(UserTask).filter(UserTask.user_id == user_id)
    
    if field:
        query = query.filter(UserTask.field == field)
    
    tasks = query.order_by(UserTask.created_at.desc()).all()
    
    result = []
    for t in tasks:
        # Parse requirements JSON
        try:
            requirements = json.loads(t.requirements) if t.requirements else []
        except:
            requirements = []
        
        result.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "requirements": requirements,
            "difficulty": t.difficulty,
            "xp": t.xp,
            "status": t.status,
            "field": t.field,
            "score": t.score,
            "due_days": t.due_days
        })
    
    return result


@router.get("/{task_id}")
def get_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific task by ID.
    """
    user_id = current_user["sub"]
    task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == user_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Parse requirements
    try:
        requirements = json.loads(task.requirements) if task.requirements else []
    except:
        requirements = []
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "requirements": requirements,
        "difficulty": task.difficulty,
        "xp": task.xp,
        "status": task.status,
        "field": task.field,
        "score": task.score,
        "ai_feedback": task.ai_feedback,
        "submission": task.submission
    }


@router.patch("/{task_id}/status")
def update_task_status(
    task_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update task status.
    Only allows: todo -> progress transition.
    Status 'done' is set automatically when task is submitted and evaluated.
    """
    user_id = current_user["sub"]
    
    # Only allow todo and progress status changes from this endpoint
    if status not in ["todo", "progress"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid status. Use /ai-feedback/evaluate to complete tasks."
        )
    
    task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == user_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Prevent changing status if task is already done
    if task.status == "done":
        raise HTTPException(
            status_code=400, 
            detail="Cannot change status of completed task"
        )
    
    task.status = status
    db.commit()
    
    return {"message": "Status updated", "status": status}

