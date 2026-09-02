from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    fitness_goal: str
    experience_level: str
    is_admin: bool
    onboarding_complete: bool
    trial_started_at: Optional[datetime]
    trial_days: int
    current_streak: int
    longest_streak: int
    dark_mode: bool
    daily_reminder_enabled: bool
    reminder_time: str
    xp: int = 0
    level: str = "Beginner"
    bmi: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    dark_mode: Optional[bool] = None
    daily_reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None


class OnboardingComplete(BaseModel):
    start_trial: bool = True
