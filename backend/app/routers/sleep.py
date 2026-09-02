from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.sleep import SleepLog
from app.utils.deps import get_current_user
from app.services.achievements import award_badge

router = APIRouter(prefix="/api/sleep", tags=["Sleep"])

class SleepLogCreate(BaseModel):
    sleep_hours: float
    sleep_quality: str  # Poor, Fair, Good, Excellent
    logged_at: Optional[date] = None

@router.get("/history")
def get_sleep_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(SleepLog).filter(SleepLog.user_id == current_user.id).order_by(SleepLog.logged_at.desc()).limit(14).all()
    return [
        {
            "id": log.id,
            "sleep_hours": log.sleep_hours,
            "sleep_quality": log.sleep_quality,
            "logged_at": log.logged_at.isoformat()
        }
        for log in logs
    ]

@router.post("")
def log_sleep(
    data: SleepLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_date = data.logged_at or date.today()
    existing = db.query(SleepLog).filter(SleepLog.user_id == current_user.id, SleepLog.logged_at == log_date).first()
    
    if existing:
        existing.sleep_hours = data.sleep_hours
        existing.sleep_quality = data.sleep_quality
        log = existing
    else:
        log = SleepLog(
            user_id=current_user.id,
            sleep_hours=data.sleep_hours,
            sleep_quality=data.sleep_quality,
            logged_at=log_date
        )
        db.add(log)

    # Award XP for tracking sleep!
    current_user.xp += 10
    if current_user.xp >= 500:
        current_user.level = "Yoga Master"
    elif current_user.xp >= 150:
        current_user.level = "Intermediate"

    # If sleep quality is logged, award badge checking can happen
    if data.sleep_hours >= 7 and data.sleep_quality in ["Good", "Excellent"]:
        award_badge(db, current_user, "sleep_master")  # Custom check if we want, or simple database log

    db.commit()
    return {"message": "Sleep logged successfully", "id": log.id, "xp_earned": 10}

@router.get("/recommendations")
def get_sleep_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find latest sleep log
    latest_log = db.query(SleepLog).filter(SleepLog.user_id == current_user.id).order_by(SleepLog.logged_at.desc()).first()
    
    if not latest_log:
        return {
            "sleep_quality": "Unknown",
            "message": "No sleep logged recently. Log sleep to get personalized recommendations.",
            "recommendation_type": "balanced",
            "poses": ["Mountain Pose", "Downward Dog", "Tree Pose"],
            "meditation": "Relaxing Breathwork"
        }
    
    quality = latest_log.sleep_quality.lower()
    
    if quality in ["poor", "fair"]:
        return {
            "sleep_quality": latest_log.sleep_quality,
            "message": f"Your sleep was rated {latest_log.sleep_quality}. We recommend a soothing, restorative routine to help recover and calm your nervous system.",
            "recommendation_type": "restorative",
            "poses": ["Child's Pose", "Seated Forward Bend", "Pigeon Pose", "Cat-Cow Stretch"],
            "meditation": "Deep Sleep Yoga Nidra"
        }
    else:
        return {
            "sleep_quality": latest_log.sleep_quality,
            "message": f"Awesome! You had {latest_log.sleep_hours} hours of {latest_log.sleep_quality} sleep. Your body is well-rested and ready for an energetic, strength-building flow.",
            "recommendation_type": "dynamic",
            "poses": ["Sun Salutation A", "Plank Pose", "Warrior I", "Warrior II", "Boat Pose"],
            "meditation": "Focus & Productivity Mindfulness"
        }
