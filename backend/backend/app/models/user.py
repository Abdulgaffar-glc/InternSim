from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")
    
    # Profile fields
    name = Column(String(100), nullable=True)
    internship_field = Column(String(50), nullable=True)  # frontend, backend, ai, cybersecurity
    internship_level = Column(String(20), nullable=True)  # junior, mid, senior
    total_xp = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("UserTask", back_populates="user", cascade="all, delete-orphan")
