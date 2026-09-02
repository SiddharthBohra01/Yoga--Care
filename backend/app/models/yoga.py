from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class YogaPlan(Base):
    __tablename__ = "yoga_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    bmi_at_start: Mapped[float] = mapped_column(Float)
    fitness_goal: Mapped[str] = mapped_column(String(50))
    experience_level: Mapped[str] = mapped_column(String(30))
    total_days: Mapped[int] = mapped_column(Integer, default=30)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="yoga_plans")
    days = relationship("YogaDay", back_populates="plan", cascade="all, delete-orphan", order_by="YogaDay.day_number")


class YogaDay(Base):
    __tablename__ = "yoga_days"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("yoga_plans.id"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    focus: Mapped[str] = mapped_column(String(100))
    total_calories: Mapped[float] = mapped_column(Float, default=0)
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    plan = relationship("YogaPlan", back_populates="days")
    exercises = relationship("YogaExercise", back_populates="day", cascade="all, delete-orphan", order_by="YogaExercise.order_index")


class YogaExercise(Base):
    __tablename__ = "yoga_exercises"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    day_id: Mapped[int] = mapped_column(ForeignKey("yoga_days.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(120))
    image_url: Mapped[str] = mapped_column(String(500))
    duration_seconds: Mapped[int] = mapped_column(Integer)
    reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    calories_burned: Mapped[float] = mapped_column(Float)
    difficulty: Mapped[str] = mapped_column(String(20))
    instructions: Mapped[str] = mapped_column(Text)
    benefits: Mapped[str] = mapped_column(Text)
    common_mistakes: Mapped[str] = mapped_column(Text)
    steps: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    day = relationship("YogaDay", back_populates="exercises")
