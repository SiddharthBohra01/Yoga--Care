from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LiveClass(Base):
    __tablename__ = "live_classes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    trainer_name: Mapped[str] = mapped_column(String(120))
    start_time: Mapped[datetime] = mapped_column(DateTime)
    meeting_link: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)
    max_participants: Mapped[int] = mapped_column(Integer, default=20)
    current_participants: Mapped[int] = mapped_column(Integer, default=0)

    bookings = relationship("ClassBooking", back_populates="live_class", cascade="all, delete-orphan")


class ClassBooking(Base):
    __tablename__ = "class_bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("live_classes.id"), index=True)
    booked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    live_class = relationship("LiveClass", back_populates="bookings")
