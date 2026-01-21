from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from backend.app.jwt_utils import SECRET_KEY, ALGORITHM

security = HTTPBearer()
async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    token = res.credentials
    try:
        print(f"DEBUG_KEY: [{SECRET_KEY}] | Length: {len(SECRET_KEY)}")
        # PyJWT requires the algorithms list
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        payload["sub"] = int(payload["sub"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        # This catches "Signature verification failed" and other malformed tokens
        raise HTTPException(status_code=401, detail="Invalid token")
        