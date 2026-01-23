from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum


class TaskStatus(str, enum.Enum):
    todo = "todo"
    progress = "progress"
    done = "done"


class UserTask(Base):
    __tablename__ = "user_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Task definition
    title = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20), default="mid")  # junior, mid, senior
    xp = Column(Integer, default=100)
    field = Column(String(50), nullable=False)  # frontend, backend, ai, cybersecurity
    
    # Progress tracking
    status = Column(String(20), default="todo")  # todo, progress, done
    due_days = Column(Integer, default=3)
    
    # Task Requirements (JSON array)
    requirements = Column(Text, nullable=True)  # JSON array of requirement strings
    
    # Submission & Evaluation
    submission = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)  # 0-100
    ai_feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)  # JSON array
    weaknesses = Column(Text, nullable=True)  # JSON array
    
    # Performance tracking
    time_spent_minutes = Column(Integer, nullable=True)  # Time spent on task
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
