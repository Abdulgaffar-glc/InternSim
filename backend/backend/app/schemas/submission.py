from pydantic import BaseModel

class SubmissionCreate(BaseModel):
    task_id: int
    content: str

class SubmissionResponse(BaseModel):
    id: int
    task_id: int
    content: str
