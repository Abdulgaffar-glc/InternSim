from sqlalchemy import TIMESTAMP, Column, Integer, String
from sqlalchemy.sql import func
from backend.app.database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    track = Column(String)
    level = Column(String)
    status = Column(String, default="active")
    started_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
