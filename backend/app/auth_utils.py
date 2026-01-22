import bcrypt
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
from backend.app.jwt_utils import SECRET_KEY, ALGORITHM


ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    pw = password.encode("utf-8")
    pw = pw[:72]   # bcrypt limit
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    pw = password.encode("utf-8")
    pw = pw[:72]
    return bcrypt.checkpw(pw, hashed.encode())

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    print(f"DEBUG_KEY: [{SECRET_KEY}] | Length: {len(SECRET_KEY)}")
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
