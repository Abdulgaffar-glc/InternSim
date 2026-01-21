from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from backend.app.database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, index=True)
    score = Column(Integer)
    feedback = Column(Text)
    agent_name = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
