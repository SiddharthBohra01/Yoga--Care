from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.yoga import YogaPlan, YogaDay, YogaExercise
from app.schemas.yoga import PlanResponse, DayResponse, ExerciseResponse, CompleteExerciseRequest
from app.utils.deps import get_current_user
from app.services.yoga_service import (
    create_personalized_plan,
    get_completed_exercise_ids,
    complete_exercise,
    get_exercise_navigation,
)

router = APIRouter(prefix="/api/plans", tags=["Yoga Plans"])


def _enrich_day(db: Session, user_id: int, day: YogaDay) -> DayResponse:
    completed_ids = get_completed_exercise_ids(db, user_id, day.id)
    exercises = []
    for ex in sorted(day.exercises, key=lambda e: e.order_index):
        ex_resp = ExerciseResponse.model_validate(ex)
        exercises.append(ex_resp.model_copy(update={"is_completed": ex.id in completed_ids}))
    return DayResponse(
        id=day.id,
        plan_id=day.plan_id,
        day_number=day.day_number,
        title=day.title,
        focus=day.focus,
        total_calories=day.total_calories,
        is_unlocked=day.is_unlocked,
        is_completed=day.is_completed,
        completed_at=day.completed_at,
        exercises=exercises,
        completed_count=len(completed_ids),
        total_exercises=len(exercises),
    )


@router.get("/my-plan", response_model=PlanResponse)
def get_my_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(YogaPlan).filter(YogaPlan.user_id == current_user.id, YogaPlan.is_active == True).first()
    if not plan:
        plan = create_personalized_plan(db, current_user)
    days = db.query(YogaDay).filter(YogaDay.plan_id == plan.id).order_by(YogaDay.day_number).all()
    day_responses = [_enrich_day(db, current_user.id, d) for d in days]
    completed_days = sum(1 for d in days if d.is_completed)
    current_day = next((d.day_number for d in days if d.is_unlocked and not d.is_completed), 30)
    return PlanResponse(
        id=plan.id,
        title=plan.title,
        description=plan.description,
        bmi_at_start=plan.bmi_at_start,
        fitness_goal=plan.fitness_goal,
        experience_level=plan.experience_level,
        total_days=plan.total_days,
        is_active=plan.is_active,
        days=day_responses,
        completed_days=completed_days,
        current_day=current_day,
    )


@router.get("/days/{day_number}", response_model=DayResponse)
def get_day(
    day_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(YogaPlan).filter(YogaPlan.user_id == current_user.id, YogaPlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    day = db.query(YogaDay).filter(YogaDay.plan_id == plan.id, YogaDay.day_number == day_number).first()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    if not day.is_unlocked:
        raise HTTPException(status_code=403, detail="Complete previous days first")
    return _enrich_day(db, current_user.id, day)


@router.get("/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exercise = db.query(YogaExercise).filter(YogaExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    completed_ids = get_completed_exercise_ids(db, current_user.id, exercise.day_id)
    return ExerciseResponse.model_validate(exercise).model_copy(
        update={"is_completed": exercise.id in completed_ids}
    )


@router.get("/exercises/{exercise_id}/navigation")
def get_exercise_nav(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = get_exercise_navigation(db, current_user, exercise_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/exercises/complete")
def mark_exercise_complete(
    data: CompleteExerciseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = complete_exercise(db, current_user, data.exercise_id, data.duration_seconds)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/generate")
def generate_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = create_personalized_plan(db, current_user)
    return {"message": "Plan generated", "plan_id": plan.id}
