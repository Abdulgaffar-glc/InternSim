from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.submission import Submission
from backend.app.models.task import Task
from backend.app.schemas.submission import SubmissionCreate, SubmissionResponse

router = APIRouter(prefix="/submission", tags=["Submission"])

@router.post("/submit")
def submit_task(data: SubmissionCreate,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):

    task = db.query(Task).filter(Task.id == data.task_id).first()

    if not task:
        raise HTTPException(404, "Task not found")

    submission = Submission(
        task_id=data.task_id,
        user_id=user["sub"],
        content=data.content
    )

    task.status = "submitted"

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission

@router.get("/my")
def my_submissions(db: Session = Depends(get_db),
                   user = Depends(get_current_user)):

    submissions = db.query(Submission).filter(
        Submission.user_id == user["sub"]
    ).order_by(Submission.submitted_at.desc()).all()

    return submissions
