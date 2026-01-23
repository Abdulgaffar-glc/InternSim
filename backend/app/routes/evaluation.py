from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.submission import Submission
from backend.app.models.evaluation import Evaluation
from backend.app.services.evaluator_agent import evaluate_submission_content as evaluate_submission

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

@router.post("/{submission_id}")
def evaluate(submission_id: int,
             db: Session = Depends(get_db),
             user = Depends(get_current_user)):

    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(404, "Submission not found")

    result = evaluate_submission(submission.content)

    evaluation = Evaluation(
        submission_id=submission.id,
        score=result["score"],
        feedback=result["feedback"],
        agent_name=result["agent_name"]
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation

