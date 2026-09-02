from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExerciseResponse(BaseModel):
    id: int
    day_id: int
    name: str
    slug: str
    image_url: str
    duration_seconds: int
    reps: Optional[int]
    calories_burned: float
    difficulty: str
    instructions: str
    benefits: str
    common_mistakes: str
    steps: str
    order_index: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class DayResponse(BaseModel):
    id: int
    plan_id: int
    day_number: int
    title: str
    focus: str
    total_calories: float
    is_unlocked: bool
    is_completed: bool
    completed_at: Optional[datetime]
    exercises: list[ExerciseResponse] = []
    completed_count: int = 0
    total_exercises: int = 0

    class Config:
        from_attributes = True


class PlanResponse(BaseModel):
    id: int
    title: str
    description: str
    bmi_at_start: float
    fitness_goal: str
    experience_level: str
    total_days: int
    is_active: bool
    days: list[DayResponse] = []
    completed_days: int = 0
    current_day: int = 1

    class Config:
        from_attributes = True


class CompleteExerciseRequest(BaseModel):
    exercise_id: int
    duration_seconds: int


class ExerciseCreate(BaseModel):
    day_id: int
    name: str
    slug: str
    image_url: str
    duration_seconds: int
    reps: Optional[int] = None
    calories_burned: float
    difficulty: str
    instructions: str
    benefits: str
    common_mistakes: str
    steps: str
    order_index: int = 0


class DayCreate(BaseModel):
    plan_id: int
    day_number: int
    title: str
    focus: str


class PlanCreate(BaseModel):
    user_id: int
    title: str
    description: str
