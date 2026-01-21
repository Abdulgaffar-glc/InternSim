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

@app.get("/")
def root():
    return {"status": "Intern Sim Backend Running"}
