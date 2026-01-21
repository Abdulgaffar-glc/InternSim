from pydantic import BaseModel

class InternshipCreate(BaseModel):
    track: str
    level: str

class InternshipResponse(BaseModel):
    id: int
    track: str
    level: str
    status: str
