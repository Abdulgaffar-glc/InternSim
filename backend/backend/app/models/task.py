from sqlalchemy import TIMESTAMP, Column, Integer, String, Text
from sqlalchemy.sql import func
from backend.app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, index=True)
    title = Column(String)
    description = Column(Text)
    difficulty = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    status = Column(String, default="active")

