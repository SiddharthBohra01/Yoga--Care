from datetime import date
from sqlalchemy import Float, Integer, ForeignKey, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    sleep_hours: Mapped[float] = mapped_column(Float)
    sleep_quality: Mapped[str] = mapped_column(String(50))  # e.g., Poor, Fair, Good, Excellent
    logged_at: Mapped[date] = mapped_column(Date, default=date.today, index=True)
