from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.task import Task
from backend.app.models.internship import Internship
from backend.app.services.task_agent import generate_task

router = APIRouter(prefix="/task", tags=["Task"])


@router.post("/new")
def create_new_task(db: Session = Depends(get_db),
                    user = Depends(get_current_user)):

    internship = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    if not internship:
        return {"status": "no_active_internship"}

    data = generate_task(internship.track, internship.level)

    task = Task(
        internship_id=internship.id,
        title=data["title"],
        description=data["description"],
        difficulty=data["difficulty"],
        status="active"
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/list")
def list_tasks(db: Session = Depends(get_db),
               user = Depends(get_current_user)):

    internship = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    if not internship:
        return []

    tasks = db.query(Task).filter(
        Task.internship_id == internship.id
    ).order_by(Task.created_at.desc()).all()

    return tasks

