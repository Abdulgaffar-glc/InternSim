import inspect
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db_dep import get_db
from ..models import User
from ..auth_utils import hash_password, verify_password, create_access_token
from backend.app.auth_dep import get_current_user
from backend.app.schemas.auth import LoginSchema, RegisterSchema

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User exists")

    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    print(f"FUNCTION LOCATION: {inspect.getfile(create_access_token)}")
    
    token = create_access_token({
        "sub":  str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role
    })


    return {
        "access_token": token,
        "token_type": "bearer"
    }
    
    
@router.get("/protected")
def protected(user = Depends(get_current_user)):
    return user