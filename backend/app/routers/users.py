from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, OnboardingComplete
from app.utils.deps import get_current_user
from app.services.plan_generator import calculate_bmi
from app.services.yoga_service import create_personalized_plan

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    bmi = calculate_bmi(current_user.height_cm, current_user.weight_kg)
    return UserResponse.model_validate(current_user).model_copy(update={"bmi": bmi})


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    bmi = calculate_bmi(current_user.height_cm, current_user.weight_kg)
    return UserResponse.model_validate(current_user).model_copy(update={"bmi": bmi})


@router.post("/onboarding/complete")
def complete_onboarding(
    data: OnboardingComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.start_trial:
        create_personalized_plan(db, current_user)
    return {"message": "Onboarding complete", "plan_created": data.start_trial}


@router.get("/fitness-twin")
def get_fitness_twin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.progress import CompletedExercise, CaloriesTracking
    from app.models.yoga import YogaExercise

    # Fetch all completed exercises for this user
    completed = (
        db.query(CompletedExercise.exercise_id)
        .filter(CompletedExercise.user_id == current_user.id)
        .all()
    )
    completed_ids = [c[0] for c in completed]

    # Analyze muscle categories worked on
    # Standard body regions
    regions = {
        "Core & Abs": {"count": 0, "poses": ["Plank Pose", "Boat Pose", "Warrior I", "Chair Pose"]},
        "Back & Spine": {"count": 0, "poses": ["Cobra Pose", "Bridge Pose", "Cat-Cow Stretch"]},
        "Hamstrings & Legs": {"count": 0, "poses": ["Downward Dog", "Seated Forward Bend", "Pigeon Pose", "Triangle Pose"]},
        "Shoulders & Arms": {"count": 0, "poses": ["Plank Pose", "Downward Dog", "Warrior II"]},
        "Balance & Balance": {"count": 0, "poses": ["Tree Pose", "Mountain Pose"]}
    }

    # Count matching completed poses
    if completed_ids:
        exercises = db.query(YogaExercise.name).filter(YogaExercise.id.in_(completed_ids)).all()
        completed_names = [e[0] for e in exercises]
        for name in completed_names:
            for region, data in regions.items():
                for pose in data["poses"]:
                    if pose.lower() in name.lower():
                        data["count"] += 1

    # Classify trained and weak areas
    weak_areas = []
    trained_areas = []
    for region, data in regions.items():
        if data["count"] == 0:
            weak_areas.append(region)
        else:
            trained_areas.append(region)

    # Calculate flexibility score
    # Baseline 45%, +5% for every unique exercise completed, capped at 98%
    unique_completed_count = len(set(completed_ids))
    flexibility_score = min(98.0, 45.0 + (unique_completed_count * 5.0))

    # Calculate fat loss prediction (7700 kcal = 1kg fat)
    total_calories = db.query(func.coalesce(func.sum(CaloriesTracking.calories), 0)).filter(CaloriesTracking.user_id == current_user.id).scalar()
    fat_loss_prediction_kg = round(float(total_calories or 0) / 7700.0, 3)

    return {
        "flexibility_score": flexibility_score,
        "fat_loss_prediction_kg": fat_loss_prediction_kg,
        "weak_areas": weak_areas if weak_areas else ["None! Full body balanced"],
        "trained_areas": trained_areas,
        "regions_data": {r: min(100, d["count"] * 20) for r, d in regions.items()},
        "total_calories": float(total_calories or 0)
    }
