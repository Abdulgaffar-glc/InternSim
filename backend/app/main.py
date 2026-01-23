from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.mentor import mentor_service
from app.services.history_manager import history_manager
from app.models import ReviewRequest, ReviewResponse

app = FastAPI(title="mentorunAI Backend", version="1.0.0")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/review", response_model=ReviewResponse)
async def review_code(request: ReviewRequest):
    """
    Endpoint for the AI Mentor to review code logic with history support.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code snippet cannot be empty.")
    
    # 1. Get or Create Session
    session_id = request.session_id
    if not session_id:
        session_id = history_manager.create_session()
    
    # 2. Add User Message to History
    if request.context.strip():
        user_content = f"Context: {request.context}\n\n{request.code}"
    else:
        user_content = request.code # Direct message if no context
        
    history_manager.append_message(session_id, "user", user_content)
    
    # 3. Get Full History
    history = history_manager.get_history(session_id)
    
    # 4. Get Response from Mentor (passing full history)
    feedback = await mentor_service.get_review(history)
    
    if feedback.startswith("System Error") or feedback.startswith("API Error"):
        raise HTTPException(status_code=500, detail=feedback)
        
    # 5. Save Mentor Response
    history_manager.append_message(session_id, "assistant", feedback)
        
    return ReviewResponse(feedback=feedback, session_id=session_id)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
