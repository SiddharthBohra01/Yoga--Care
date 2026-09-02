from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not = "prefer_not"


class FitnessGoal(str, enum.Enum):
    weight_loss = "weight_loss"
    flexibility = "flexibility"
    meditation = "meditation"
    strength = "strength"
    belly_fat = "belly_fat"
    full_body = "full_body"


class ExperienceLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str] = mapped_column(String(30))
    height_cm: Mapped[float] = mapped_column(Float)
    weight_kg: Mapped[float] = mapped_column(Float)
    fitness_goal: Mapped[str] = mapped_column(String(50))
    experience_level: Mapped[str] = mapped_column(String(30))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    trial_started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trial_days: Mapped[int] = mapped_column(Integer, default=30)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_workout_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    reminder_time: Mapped[str] = mapped_column(String(10), default="07:00")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[str] = mapped_column(String(50), default="Beginner")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    yoga_plans = relationship("YogaPlan", back_populates="user", cascade="all, delete-orphan")
    completed_exercises = relationship("CompletedExercise", back_populates="user", cascade="all, delete-orphan")
    calories_logs = relationship("CaloriesTracking", back_populates="user", cascade="all, delete-orphan")
    water_logs = relationship("WaterIntake", back_populates="user", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    feedback_items = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("DailyReminder", back_populates="user", cascade="all, delete-orphan")
