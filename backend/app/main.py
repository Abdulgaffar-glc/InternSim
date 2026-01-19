from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .db_dep import get_db

app = FastAPI(title="Intern Sim API")

@app.get("/")
def root():
    return {"status": "Intern Sim Backend Running"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {"db": "connected"}
