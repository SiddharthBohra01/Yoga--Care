from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.yoga import YogaPlan, YogaDay, YogaExercise
from app.models.content import Review, Feedback
from app.schemas.yoga import ExerciseCreate, DayCreate
from app.schemas.content import ReviewResponse, FeedbackResponse
from app.utils.deps import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "fitness_goal": u.fitness_goal,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active")
def toggle_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}


@router.get("/feedback", response_model=list[FeedbackResponse])
def list_feedback(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


@router.put("/feedback/{feedback_id}/read")
def mark_feedback_read(feedback_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404)
    fb.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.get("/reviews", response_model=list[ReviewResponse])
def admin_reviews(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.put("/reviews/{review_id}/approve")
def approve_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404)
    review.is_approved = True
    db.commit()
    return {"message": "Approved"}


@router.post("/exercises")
def add_exercise(data: ExerciseCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    exercise = YogaExercise(**data.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return {"id": exercise.id, "name": exercise.name}


@router.put("/exercises/{exercise_id}")
def edit_exercise(
    exercise_id: int,
    data: ExerciseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    exercise = db.query(YogaExercise).filter(YogaExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404)
    for k, v in data.model_dump().items():
        setattr(exercise, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    exercise = db.query(YogaExercise).filter(YogaExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404)
    db.delete(exercise)
    db.commit()
    return {"message": "Deleted"}


@router.get("/plans")
def list_plans(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    plans = db.query(YogaPlan).order_by(YogaPlan.created_at.desc()).limit(50).all()
    return [{"id": p.id, "user_id": p.user_id, "title": p.title, "is_active": p.is_active} for p in plans]


@router.post("/days")
def add_day(data: DayCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    day = YogaDay(**data.model_dump(), is_unlocked=False)
    db.add(day)
    db.commit()
    return {"id": day.id}
