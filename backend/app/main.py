from fastapi import FastAPI

app = FastAPI(title="Intern Sim API")

@app.get("/")
def root():
    return {"status": "Intern Sim Backend Running"}
