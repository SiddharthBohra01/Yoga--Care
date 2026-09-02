from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.content import Review
from app.utils.security import get_password_hash
from app.config import get_settings

settings = get_settings()

SAMPLE_REVIEWS = [
    {
        "author_name": "Sarah Mitchell",
        "author_role": "Yoga Enthusiast",
        "avatar_url": "https://i.pravatar.cc/150?img=1",
        "rating": 5,
        "content": "YogaCare transformed my morning routine. The personalized 30-day plan is incredible!",
        "is_featured": True,
    },
    {
        "author_name": "James Chen",
        "author_role": "Fitness Coach",
        "avatar_url": "https://i.pravatar.cc/150?img=3",
        "rating": 5,
        "content": "Premium UI and smooth animations. My clients love the progress tracking features.",
        "is_featured": True,
    },
    {
        "author_name": "Emma Rodriguez",
        "author_role": "Wellness Blogger",
        "avatar_url": "https://i.pravatar.cc/150?img=5",
        "rating": 5,
        "content": "The AI-generated plans actually adapt to my goals. Lost 5kg in 30 days!",
        "is_featured": False,
    },
    {
        "author_name": "Michael Torres",
        "author_role": "Beginner Yogi",
        "avatar_url": "https://i.pravatar.cc/150?img=8",
        "rating": 4,
        "content": "Perfect for beginners. Day-by-day unlock keeps me motivated every single morning.",
        "is_featured": False,
    },
]


def seed_database():
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.admin_email).first()
        if not admin:
            admin = User(
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                full_name="YogaCare Admin",
                age=30,
                gender="other",
                height_cm=170,
                weight_kg=70,
                fitness_goal="full_body",
                experience_level="advanced",
                is_admin=True,
                onboarding_complete=True,
            )
            db.add(admin)

        if db.query(Review).count() == 0:
            for r in SAMPLE_REVIEWS:
                db.add(Review(**r, is_approved=True))

        db.commit()
    finally:
        db.close()
