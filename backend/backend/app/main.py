from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db_dep import get_db
from .core.config import settings
from .routes import auth
from backend.app.models.user import Base
from backend.app.models import User, ChatSession, ChatMessage, UserTask, Internship, Task, Submission, Evaluation
from backend.app.database import engine
from backend.app.routes import internship
from backend.app.routes import task
from backend.app.routes import submission
from backend.app.routes import evaluation
from backend.app.routes import dashboard
from backend.app.routes import ai_mentor
from backend.app.routes import ai_feedback
from backend.app.routes import task_generator
from backend.app.routes import users


app = FastAPI(title="Intern Sim API", version="2.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "status": "Intern Sim Backend Running",
        "version": "1.0.0",
        "services": ["auth", "internship", "task", "submission", "evaluation", "dashboard", "ai-mentor", "ai-feedback"]
    }

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {"db": "connected"}

# Include all routers
app.include_router(auth.router)
app.include_router(internship.router)
app.include_router(task.router)
app.include_router(submission.router)
app.include_router(evaluation.router)
app.include_router(dashboard.router)
app.include_router(ai_mentor.router)
app.include_router(ai_feedback.router)
app.include_router(task_generator.router)
app.include_router(users.router)