"""
User Profile Route - User data management and XP tracking
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta

from backend.app.db_dep import get_db
from backend.app.models import User, UserTask
from backend.app.auth_dep import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    internship_field: Optional[str] = None
    internship_level: Optional[str] = None


class UserProfile(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    internship_field: Optional[str]
    internship_level: Optional[str]
    total_xp: int


# Level calculation based on XP
def calculate_level(xp: int) -> dict:
    """Calculate level from XP using a progressive system"""
    levels = [
        (0, 500),      # Level 1: 0-500
        (500, 1000),   # Level 2: 500-1500
        (1500, 1500),  # Level 3: 1500-3000
        (3000, 2000),  # Level 4: 3000-5000
        (5000, 2500),  # Level 5: 5000-7500
        (7500, 3000),  # Level 6: 7500-10500
        (10500, 3500), # Level 7: ...
        (14000, 4000),
        (18000, 4500),
        (22500, 5000),
        (27500, 5500),
        (33000, 6000),
        (39000, 6500),
        (45500, 7000),
        (52500, 7500),
    ]
    
    current_level = 1
    for i, (threshold, xp_needed) in enumerate(levels):
        if xp >= threshold:
            current_level = i + 1
        else:
            break
    
    # Get current and next level thresholds
    if current_level <= len(levels):
        level_start = levels[current_level - 1][0]
        xp_for_next = levels[current_level - 1][1]
        next_level_xp = level_start + xp_for_next
    else:
        level_start = levels[-1][0] + levels[-1][1]
        xp_for_next = 8000  # Default for very high levels
        next_level_xp = level_start + xp_for_next
    
    return {
        "level": current_level,
        "current_xp": xp,
        "level_start_xp": level_start,
        "next_level_xp": next_level_xp,
        "xp_progress": xp - level_start,
        "xp_needed": xp_for_next
    }


@router.get("/me", response_model=UserProfile)
def get_current_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user's profile using JWT token.
    """
    user_id = current_user["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        internship_field=user.internship_field,
        internship_level=user.internship_level,
        total_xp=user.total_xp or 0
    )


@router.put("/me")
def update_profile(
    update: UserProfileUpdate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update user profile (for onboarding flow).
    """
    user_id = current_user["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.name is not None:
        user.name = update.name
    if update.internship_field is not None:
        user.internship_field = update.internship_field
    if update.internship_level is not None:
        user.internship_level = update.internship_level
    
    db.commit()
    
    return {"message": "Profile updated successfully"}


@router.get("/me/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive user statistics for dashboard.
    Returns XP, level, metrics, skills, and weekly progress.
    """
    user_id = current_user["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all user tasks
    tasks = db.query(UserTask).filter(UserTask.user_id == user_id).all()
    
    completed_tasks = [t for t in tasks if t.status == "done"]
    in_progress_tasks = [t for t in tasks if t.status == "progress"]
    pending_tasks = [t for t in tasks if t.status == "todo"]
    
    # Calculate total XP from completed tasks (score-weighted)
    # XP earned = task.xp * (score / 100)
    earned_xp = 0
    for t in completed_tasks:
        if t.score and t.xp:
            earned_xp += int(t.xp * (t.score / 100))
        elif t.xp:
            # If no score, assume 70% (shouldn't happen normally)
            earned_xp += int(t.xp * 0.7)
    
    # Sync user XP with calculated earned XP
    if earned_xp != (user.total_xp or 0):
        user.total_xp = earned_xp
        db.commit()
    
    # Calculate level info
    level_info = calculate_level(earned_xp)
    
    # Get date ranges for this week and last week
    today = datetime.utcnow()
    this_week_start = today - timedelta(days=7)
    last_week_start = today - timedelta(days=14)
    
    # Separate tasks by week
    this_week_tasks = [
        t for t in completed_tasks 
        if t.completed_at and t.completed_at >= this_week_start
    ]
    last_week_tasks = [
        t for t in completed_tasks 
        if t.completed_at and last_week_start <= t.completed_at < this_week_start
    ]
    
    # Calculate this week's metrics
    this_week_scores = [t.score for t in this_week_tasks if t.score is not None]
    this_week_avg = sum(this_week_scores) / len(this_week_scores) if this_week_scores else 0
    
    # Calculate last week's metrics
    last_week_scores = [t.score for t in last_week_tasks if t.score is not None]
    last_week_avg = sum(last_week_scores) / len(last_week_scores) if last_week_scores else 0
    
    # All time average score
    all_scores = [t.score for t in completed_tasks if t.score is not None]
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    # Code Quality = average score (0-100), starts from 0
    code_quality = round(avg_score) if avg_score else 0
    code_quality_this = round(this_week_avg) if this_week_avg else 0
    code_quality_last = round(last_week_avg) if last_week_avg else 0
    code_quality_change = code_quality_this - code_quality_last if (this_week_avg and last_week_avg) else 0
    
    # Speed metric based on time spent - starts from 0 if no data
    def calc_speed(task_list):
        if not task_list:
            return 0
        times = [t.time_spent_minutes for t in task_list if t.time_spent_minutes and t.time_spent_minutes > 0]
        if not times:
            # If tasks exist but no time recorded, use score as proxy
            task_scores = [t.score for t in task_list if t.score]
            if task_scores:
                return min(90, round(sum(task_scores) / len(task_scores) * 0.9))
            return 0
        avg_time = sum(times) / len(times)
        # Lower time = higher speed (0-100 scale)
        if avg_time <= 15:
            return 100
        elif avg_time <= 30:
            return 95
        elif avg_time <= 45:
            return 90
        elif avg_time <= 60:
            return 85
        elif avg_time <= 90:
            return 75
        elif avg_time <= 120:
            return 65
        else:
            return max(40, 100 - int(avg_time / 2))
    
    speed_this = calc_speed(this_week_tasks)
    speed_last = calc_speed(last_week_tasks)
    speed_metric = calc_speed(completed_tasks)  # Now starts from 0
    speed_change = speed_this - speed_last if (speed_this > 0 and speed_last > 0) else 0
    
    # Requirements match = average score, starts from 0
    requirements_match = round(avg_score) if avg_score else 0
    req_this = round(this_week_avg) if this_week_avg else 0
    req_last = round(last_week_avg) if last_week_avg else 0
    req_change = req_this - req_last if (this_week_avg and last_week_avg) else 0
    
    # Skills based on field-specific scores and overall performance
    field_scores = {}
    for t in completed_tasks:
        if t.score and t.field:
            if t.field not in field_scores:
                field_scores[t.field] = []
            field_scores[t.field].append(t.score)
    
    def get_field_avg(field):
        if field in field_scores and field_scores[field]:
            return round(sum(field_scores[field]) / len(field_scores[field]))
        return 0
    
    # Calculate skills - ALL start from 0 if no tasks
    total_tasks = len(completed_tasks)
    
    if total_tasks == 0:
        # No tasks = all skills are 0
        skills = {
            "problem_solving": 0,
            "code_quality": 0,
            "communication": 0,
            "time_management": 0,
            "teamwork": 0,
            "learning_speed": 0
        }
    else:
        # Skills grow with task count and score
        skills = {
            # Problem solving: base from score + bonus from task count
            "problem_solving": min(95, round(avg_score * 0.8) + min(15, total_tasks * 3)),
            # Code quality: directly from average score
            "code_quality": code_quality,
            # Communication: starts low, grows with tasks (simulates experience)
            "communication": min(90, 20 + total_tasks * 7),
            # Time management: from speed metric
            "time_management": speed_metric,
            # Teamwork: grows with experience
            "teamwork": min(85, 15 + total_tasks * 6),
            # Learning speed: score weighted + task bonus
            "learning_speed": min(95, round(avg_score * 0.7) + min(25, total_tasks * 4))
        }
    
    # Weekly progress - last 7 weeks with real data
    weekly_progress = []
    for week_num in range(7, 0, -1):
        week_start = today - timedelta(weeks=week_num)
        week_end = today - timedelta(weeks=week_num - 1)
        
        week_tasks = [
            t for t in completed_tasks 
            if t.completed_at and week_start <= t.completed_at < week_end
        ]
        
        # Calculate XP earned that week (score-weighted)
        week_xp = 0
        for t in week_tasks:
            if t.score and t.xp:
                week_xp += int(t.xp * (t.score / 100))
            elif t.xp:
                week_xp += int(t.xp * 0.7)
        
        weekly_progress.append({
            "week": 8 - week_num,  # 1 = oldest, 7 = most recent
            "xp": week_xp,
            "tasks": len(week_tasks)
        })
    
    # Calculate cumulative XP for chart
    cumulative_xp = 0
    for wp in weekly_progress:
        cumulative_xp += wp["xp"]
        wp["cumulative_xp"] = cumulative_xp
    
    return {
        "user": {
            "name": user.name or "Stajyer",
            "email": user.email,
            "internship_field": user.internship_field,
            "internship_level": user.internship_level
        },
        "level": level_info["level"],
        "current_xp": level_info["current_xp"],
        "next_level_xp": level_info["next_level_xp"],
        "xp_progress": level_info["xp_progress"],
        "xp_needed": level_info["xp_needed"],
        "metrics": {
            "code_quality": code_quality if code_quality else 0,
            "code_quality_change": code_quality_change,
            "speed": speed_metric if speed_metric else 0,
            "speed_change": speed_change,
            "requirements_match": requirements_match if requirements_match else 0,
            "requirements_match_change": req_change
        },
        "skills": skills,
        "weekly_progress": weekly_progress,
        "task_stats": {
            "completed": len(completed_tasks),
            "in_progress": len(in_progress_tasks),
            "pending": len(pending_tasks),
            "average_score": round(avg_score, 1) if avg_score else 0
        }
    }


@router.post("/me/add-xp")
def add_xp(
    amount: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Add XP to user's total.
    """
    user_id = current_user["sub"]
    if amount < 0:
        raise HTTPException(status_code=400, detail="XP amount must be positive")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.total_xp = (user.total_xp or 0) + amount
    db.commit()
    
    return {"total_xp": user.total_xp}
