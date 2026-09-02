from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.content import Review, Feedback
from app.schemas.content import ReviewCreate, ReviewResponse, FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/api", tags=["Content"])


@router.get("/reviews", response_model=list[ReviewResponse])
def get_reviews(db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.is_approved == True)
        .order_by(Review.is_featured.desc(), Review.created_at.desc())
        .limit(20)
        .all()
    )


@router.post("/reviews", response_model=ReviewResponse)
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    review = Review(
        user_id=None,
        author_name=data.author_name,
        author_role=data.author_role,
        avatar_url=data.avatar_url or "https://i.pravatar.cc/150",
        rating=data.rating,
        content=data.content,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.post("/feedback")
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    fb = Feedback(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(fb)
    db.commit()
    return {"message": "Thank you for your feedback!"}


@router.get("/meditation-tracks")
def meditation_tracks():
    return [
        {
            "id": 1,
            "title": "Morning Calm",
            "duration": "10:00",
            "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "cover": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        },
        {
            "id": 2,
            "title": "Deep Relaxation",
            "duration": "15:00",
            "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            "cover": "https://images.unsplash.com/photo-1518241353330-45f970b6d5eb?w=400",
        },
        {
            "id": 3,
            "title": "Sleep Yoga Nidra",
            "duration": "20:00",
            "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            "cover": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400",
        },
    ]
