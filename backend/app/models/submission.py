from sqlalchemy import TIMESTAMP, Column, Integer, Text
from sqlalchemy.sql import func
from backend.app.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    content = Column(Text)
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
