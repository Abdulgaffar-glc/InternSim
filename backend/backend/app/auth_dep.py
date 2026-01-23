from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from backend.app.jwt_utils import SECRET_KEY, ALGORITHM

security = HTTPBearer()
async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    """
    Extract and validate JWT token from request header.
    Returns payload with user_id in 'sub' field.
    """
    token = res.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        payload["sub"] = int(payload["sub"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        # This catches "Signature verification failed" and other malformed tokens
        raise HTTPException(status_code=401, detail="Invalid token")
        