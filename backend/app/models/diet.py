from datetime import date
from sqlalchemy import Float, String, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class DietLog(Base):
    __tablename__ = "diet_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    meal_type: Mapped[str] = mapped_column(String(50))  # Breakfast, Lunch, Snack, Dinner
    food_name: Mapped[str] = mapped_column(String(200))
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float)
    logged_at: Mapped[date] = mapped_column(Date, default=date.today, index=True)
