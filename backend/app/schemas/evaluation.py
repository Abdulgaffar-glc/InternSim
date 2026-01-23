from pydantic import BaseModel

class EvaluationResponse(BaseModel):
    id: int
    score: int
    feedback: str
    agent_name: str
