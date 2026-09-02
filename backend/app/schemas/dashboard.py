from pydantic import BaseModel
from typing import Optional
from datetime import date


class DashboardStats(BaseModel):
    calories_today: float
    calories_total: float
    completed_exercises: int
    completed_days: int
    remaining_days: int
    current_streak: int
    longest_streak: int
    bmi: float
    bmi_category: str
    trial_days_left: int
    motivational_quote: str
    water_glasses_today: int
    water_goal: int = 8


class WeightLogRequest(BaseModel):
    weight_kg: float
    logged_at: Optional[date] = None


class WeightLog(BaseModel):
    weight_kg: float
    logged_at: date


class WeightHistory(BaseModel):
    dates: list[str]
    weights: list[float]
    bmis: list[float]


class CaloriesDayLog(BaseModel):
    date: str
    calories: float


class ShareProgress(BaseModel):
    message: str
    streak: int
    completed_days: int
    total_calories: float


class WaterLogRequest(BaseModel):
    glasses: int = 1
    ml_amount: int = 250


class ReminderUpdate(BaseModel):
    reminder_time: str
    is_enabled: bool
    message: Optional[str] = None
