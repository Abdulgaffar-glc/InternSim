from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .db_dep import get_db
from .routes import auth
from backend.app.models.user import Base
from backend.app.database import engine
from backend.app.routes import internship



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