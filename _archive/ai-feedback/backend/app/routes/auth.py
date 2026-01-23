from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.get("/ping")
def auth_ping():
    return {"status": "auth ok"}
