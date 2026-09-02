from datetime import datetime, date
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class CompletedExercise(Base):
    __tablename__ = "completed_exercises"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("yoga_exercises.id"), index=True)
    day_id: Mapped[int] = mapped_column(ForeignKey("yoga_days.id"), index=True)
    duration_seconds: Mapped[int] = mapped_column(Integer)
    calories_burned: Mapped[float] = mapped_column(Float)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="completed_exercises")


class CaloriesTracking(Base):
    __tablename__ = "calories_tracking"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    calories: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(50), default="yoga")
    logged_at: Mapped[date] = mapped_column(Date, default=date.today)

    user = relationship("User", back_populates="calories_logs")


class WaterIntake(Base):
    __tablename__ = "water_intake"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    glasses: Mapped[int] = mapped_column(Integer, default=1)
    ml_amount: Mapped[int] = mapped_column(Integer, default=250)
    logged_at: Mapped[date] = mapped_column(Date, default=date.today)

    user = relationship("User", back_populates="water_logs")


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    weight_kg: Mapped[float] = mapped_column(Float)
    logged_at: Mapped[date] = mapped_column(Date, default=date.today, index=True)

    user = relationship("User", back_populates="weight_logs")


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    badge_key: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(30))
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
