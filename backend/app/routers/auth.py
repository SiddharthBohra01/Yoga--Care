from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from datetime import date
from app.models.user import User
from app.models.progress import WeightLog
from app.schemas.auth import UserSignup, ForgotPassword, ResetPassword, Token
from app.schemas.user import UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=Token)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        age=data.age,
        gender=data.gender,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
        fitness_goal=data.fitness_goal,
        experience_level=data.experience_level,
    )
    db.add(user)
    db.flush()
    db.add(WeightLog(user_id=user.id, weight_kg=data.weight_kg, logged_at=date.today()))
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If that email exists, reset instructions were sent."}
    return {
        "message": "Password reset link sent to your email.",
        "dev_note": "In production, send email. Use /reset-password with email + new_password.",
    }


@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    from app.services.plan_generator import calculate_bmi
    bmi = calculate_bmi(current_user.height_cm, current_user.weight_kg)
    resp = UserResponse.model_validate(current_user)
    return resp.model_copy(update={"bmi": bmi})
