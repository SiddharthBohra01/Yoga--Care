from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.live_class import LiveClass, ClassBooking
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/classes", tags=["Live Classes"])

def seed_default_classes_if_empty(db: Session):
    if db.query(LiveClass).count() == 0:
        now = datetime.utcnow()
        # Seed 4 classes
        classes = [
            LiveClass(
                title="Morning Vinyasa Flow",
                trainer_name="Anjali Sharma",
                start_time=now + timedelta(days=1, hours=2),  # Tomorrow at +2 hrs
                meeting_link="https://meet.google.com/abc-defg-hij",
                description="Start your day with an energizing flow designed to wake up the spine, stretch the limbs, and build heat.",
                max_participants=25,
                current_participants=3
            ),
            LiveClass(
                title="Stress Relief & Yin Yoga",
                trainer_name="David Vance",
                start_time=now + timedelta(days=2, hours=5),
                meeting_link="https://meet.google.com/klm-nopq-rst",
                description="A deeply relaxing Yin practice focusing on slow holding of postures to ease anxiety and loosen tight joints.",
                max_participants=30,
                current_participants=12
            ),
            LiveClass(
                title="Advanced Core & Strength Yoga",
                trainer_name="Rohan Mehra",
                start_time=now + timedelta(days=3, hours=1),
                meeting_link="https://meet.google.com/uvw-xyz1-234",
                description="Power yoga focused on core activation, arm balances, and full-body stability. Pre-requisite: intermediate experience.",
                max_participants=15,
                current_participants=8
            ),
            LiveClass(
                title="Pranayama & Meditation Masterclass",
                trainer_name="Swami Bodhi",
                start_time=now + timedelta(days=5, hours=4),
                meeting_link="https://meet.google.com/xyz-abcd-efg",
                description="Learn deep yogic breathing techniques to reduce stress, expand lung capacity, and enter a state of peaceful meditation.",
                max_participants=50,
                current_participants=21
            )
        ]
        db.add_all(classes)
        db.commit()

@router.get("")
def get_live_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_default_classes_if_empty(db)
    classes = db.query(LiveClass).all()
    
    # Check what user has booked
    bookings = db.query(ClassBooking.class_id).filter(ClassBooking.user_id == current_user.id).all()
    booked_ids = {b[0] for b in bookings}
    
    result = []
    for c in classes:
        result.append({
            "id": c.id,
            "title": c.title,
            "trainer_name": c.trainer_name,
            "start_time": c.start_time.isoformat(),
            "meeting_link": c.meeting_link,
            "description": c.description,
            "max_participants": c.max_participants,
            "current_participants": c.current_participants,
            "is_booked": c.id in booked_ids
        })
    return result

@router.post("/{class_id}/book")
def book_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    live_class = db.query(LiveClass).filter(LiveClass.id == class_id).first()
    if not live_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    existing = db.query(ClassBooking).filter(
        ClassBooking.class_id == class_id,
        ClassBooking.user_id == current_user.id
    ).first()
    
    if existing:
        # Cancel booking
        db.delete(existing)
        live_class.current_participants = max(0, live_class.current_participants - 1)
        db.commit()
        return {"booked": False, "message": "Booking cancelled", "current_participants": live_class.current_participants}
    
    if live_class.current_participants >= live_class.max_participants:
        raise HTTPException(status_code=400, detail="Class is full")
        
    booking = ClassBooking(user_id=current_user.id, class_id=class_id)
    db.add(booking)
    live_class.current_participants += 1
    
    # Award XP!
    current_user.xp += 20
    if current_user.xp >= 500:
        current_user.level = "Yoga Master"
    elif current_user.xp >= 150:
        current_user.level = "Intermediate"

    db.commit()
    return {"booked": True, "message": "Class booked successfully! Zoom link is active.", "current_participants": live_class.current_participants, "xp_earned": 20}
