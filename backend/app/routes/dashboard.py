from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.task import Task
from backend.app.models.submission import Submission
from backend.app.models.evaluation import Evaluation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def dashboard(db: Session = Depends(get_db),
              user = Depends(get_current_user)):

    total_tasks = db.query(Task).count()

    submitted = db.query(Submission).filter(
        Submission.user_id == user["sub"]
    ).count()

    evaluated = db.query(Evaluation).join(
        Submission, Evaluation.submission_id == Submission.id
    ).filter(
        Submission.user_id == user["sub"]
    ).count()

    avg_score = db.query(func.avg(Evaluation.score)).join(
        Submission, Evaluation.submission_id == Submission.id
    ).filter(
        Submission.user_id == user["sub"]
    ).scalar()

    last_eval = db.query(Evaluation).join(
        Submission, Evaluation.submission_id == Submission.id
    ).filter(
        Submission.user_id == user["sub"]
    ).order_by(Evaluation.created_at.desc()).first()

    return {
        "total_tasks": total_tasks,
        "submitted": submitted,
        "evaluated": evaluated,
        "average_score": round(avg_score or 0, 2),
        "last_feedback": last_eval.feedback if last_eval else None
    }
