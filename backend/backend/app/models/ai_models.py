from pydantic import BaseModel
from typing import Optional

class ReviewRequest(BaseModel):
    code: str
    context: str = ""
    session_id: Optional[str] = None

class ReviewResponse(BaseModel):
    feedback: str
    session_id: str
