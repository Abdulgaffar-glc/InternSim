from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# --- Importlar ---
from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user

# Modeller
from backend.app.models.submission import Submission
from backend.app.models.task import Task
# DİKKAT: Evaluation modelini doğru import ettiğinden emin ol
from backend.app.models.evaluation import Evaluation 
from backend.app.schemas.submission import SubmissionCreate

# Servis (Az önce yazdığımız kod)
from backend.app.services.evaluator_agent import evaluate_submission_content

router = APIRouter(prefix="/submission", tags=["Submission"])

@router.post("/submit")
def submit_task(data: SubmissionCreate,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    
    # 1. Görev kontrolü
    task = db.query(Task).filter(Task.id == data.task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    # 2. Kodu veritabanına kaydet (Submission)
    new_submission = Submission(
        task_id=data.task_id,
        user_id=user["sub"],
        content=data.content
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission) 

    # 3. AI Değerlendirmesini Başlat
    print(f"Task '{task.title}' için AI puanlaması başlıyor...")
    
    eval_result = evaluate_submission_content(
        submission_content=data.content,
        task_title=task.title,
        task_desc=task.description,
        task_difficulty=task.difficulty
    )

    # 4. Değerlendirmeyi Kaydet (Evaluation)
    # Senin modelindeki sütun isimleri: id, submission_id, score, feedback, agent_name
    new_evaluation = Evaluation(
        submission_id=new_submission.id,
        score=eval_result.get("score", 0),
        feedback_text=eval_result.get("feedback", "No feedback."), # Modelindeki 'feedback' sütunu
        agent_name="AI_Mentor"
    )
    
    db.add(new_evaluation)
    
    # 5. Task Statüsünü Güncelle
    if new_evaluation.score >= 60: # Örnek baraj puanı
        task.status = "completed"
    else:
        task.status = "submitted"

    db.commit()
    db.refresh(new_evaluation)

    return {
        "status": "success",
        "submission_id": new_submission.id,
        "ai_score": new_evaluation.score,
        "ai_feedback": new_evaluation.feedback_text
    }

@router.get("/my")
def my_submissions(db: Session = Depends(get_db),
                   user = Depends(get_current_user)):

    submissions = db.query(Submission).filter(
        Submission.user_id == user["sub"]
    ).order_by(Submission.submitted_at.desc()).all()

    return submissions