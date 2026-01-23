
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)

from fastapi import FastAPI
from .routes import tasks, auth, mentor

app = FastAPI(title="Intern Sim API")

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(mentor.router)

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .db_dep import get_db
from .routes import auth
from backend.app.models.user import Base
from backend.app.database import engine
from backend.app.routes import internship
from backend.app.routes import task
from backend.app.routes import submission
from backend.app.routes import evaluation
from backend.app.routes import dashboard


app = FastAPI(title="Intern Sim API")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)



@app.get("/")
def root():
    return {"status": "Intern Sim Backend Running"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {"db": "connected"}

app.include_router(auth.router)

app.include_router(internship.router)

app.include_router(task.router)

app.include_router(submission.router)

app.include_router(evaluation.router)

app.include_router(dashboard.router)