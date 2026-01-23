"""
AI Mentor Route - Chat system with database persistence
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

import httpx

from backend.app.db_dep import get_db
from backend.app.models import ChatSession, ChatMessage
from backend.app.core.config import settings
from backend.app.core.prompts import MENTOR_SYSTEM_PROMPT
from backend.app.auth_dep import get_current_user


router = APIRouter(prefix="/ai-mentor", tags=["AI Mentor"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    session_id: int


class SessionInfo(BaseModel):
    id: int
    title: str
    created_at: str
    message_count: int


@router.post("/chat", response_model=ChatResponse)
async def chat_with_mentor(
    req: ChatRequest, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with AI Mentor. Creates or continues a session.
    Messages are persisted to database.
    """
    user_id = current_user["sub"]
    API_KEY = settings.IO_NET_API_KEY
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    # Get or create session
    if req.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == req.session_id,
            ChatSession.user_id == user_id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        # Create new session with first message as title
        title = req.message[:50] + "..." if len(req.message) > 50 else req.message
        session = ChatSession(user_id=user_id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Get conversation history
    history = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    # Build messages for AI
    messages = [{"role": "system", "content": MENTOR_SYSTEM_PROMPT}]
    for msg in history[-10:]:  # Last 10 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})
    
    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    
    # Call AI API
    payload = {
        "model": settings.IO_NET_MODEL_ID,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.IO_NET_API_URL,
                headers=headers,
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            
            if "choices" not in result or len(result["choices"]) == 0:
                raise HTTPException(status_code=500, detail="No response from AI")
            
            ai_response = result["choices"][0]["message"]["content"]
            
            # Save AI response
            ai_msg = ChatMessage(
                session_id=session.id,
                role="assistant",
                content=ai_response
            )
            db.add(ai_msg)
            
            # Update session timestamp
            session.updated_at = datetime.utcnow()
            db.commit()
            
            return ChatResponse(response=ai_response, session_id=session.id)
            
    except httpx.HTTPStatusError as e:
        db.rollback()
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/sessions", response_model=List[SessionInfo])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all chat sessions for the authenticated user.
    """
    user_id = current_user["sub"]
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    result = []
    for s in sessions:
        msg_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == s.id
        ).count()
        
        result.append(SessionInfo(
            id=s.id,
            title=s.title,
            created_at=s.created_at.isoformat() if s.created_at else "",
            message_count=msg_count
        ))
    
    return result


@router.get("/sessions/{session_id}")
def get_session_messages(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all messages from a specific session.
    """
    user_id = current_user["sub"]
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return {
        "session": {
            "id": session.id,
            "title": session.title,
            "created_at": session.created_at.isoformat() if session.created_at else None
        },
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ]
    }


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a chat session and all its messages.
    """
    user_id = current_user["sub"]
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete all messages first
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    
    # Delete session
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted"}


@router.get("/health")
async def health_check():
    """Health check endpoint for AI Mentor service"""
    return {"status": "ok", "service": "ai-mentor"}
