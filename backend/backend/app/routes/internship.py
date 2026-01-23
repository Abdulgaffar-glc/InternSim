from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.internship import Internship
from backend.app.schemas.internship import InternshipCreate

router = APIRouter(prefix="/internship", tags=["Internship"])

@router.post("/start")
def start_internship(data: InternshipCreate,
                     db: Session = Depends(get_db),
                     user = Depends(get_current_user)):

    existing = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    if existing:
        raise HTTPException(400, "Active internship already exists")

    internship = Internship(
        user_id=user["sub"],
        track=data.track,
        level=data.level
    )

    db.add(internship)
    db.commit()
    db.refresh(internship)

    return internship

@router.get("/me")
def my_internship(db: Session = Depends(get_db),
                  user = Depends(get_current_user)):

    internship = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    if not internship:
        return {"status": "no_active_internship"}

    return internship