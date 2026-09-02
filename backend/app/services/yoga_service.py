from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.yoga import YogaPlan, YogaDay, YogaExercise
from app.models.progress import CompletedExercise, CaloriesTracking, WaterIntake
from app.services.plan_generator import (
    calculate_bmi,
    select_poses_for_day,
    get_day_title,
    generate_plan_description,
)
from app.services.achievements import award_badge


def create_personalized_plan(db: Session, user: User) -> YogaPlan:
    existing = (
        db.query(YogaPlan)
        .filter(YogaPlan.user_id == user.id, YogaPlan.is_active == True)
        .first()
    )
    if existing:
        return existing

    bmi = calculate_bmi(user.height_cm, user.weight_kg)
    plan = YogaPlan(
        user_id=user.id,
        title=f"YogaCare 30-Day {user.fitness_goal.replace('_', ' ').title()} Journey",
        description=generate_plan_description(user, bmi),
        bmi_at_start=bmi,
        fitness_goal=user.fitness_goal,
        experience_level=user.experience_level,
        total_days=30,
        is_active=True,
    )
    db.add(plan)
    db.flush()

    for day_num in range(1, 31):
        title, focus = get_day_title(day_num)
        exercises_data = select_poses_for_day(user, day_num, bmi)
        total_cal = sum(e["calories_burned"] for e in exercises_data)
        day = YogaDay(
            plan_id=plan.id,
            day_number=day_num,
            title=title,
            focus=focus,
            total_calories=total_cal,
            is_unlocked=(day_num == 1),
            is_completed=False,
        )
        db.add(day)
        db.flush()

        for ex_data in exercises_data:
            exercise = YogaExercise(day_id=day.id, **ex_data)
            db.add(exercise)

    if not user.trial_started_at:
        user.trial_started_at = datetime.utcnow()
    user.onboarding_complete = True
    db.commit()
    db.refresh(plan)
    return plan


def get_completed_exercise_ids(db: Session, user_id: int, day_id: int) -> set[int]:
    rows = (
        db.query(CompletedExercise.exercise_id)
        .filter(CompletedExercise.user_id == user_id, CompletedExercise.day_id == day_id)
        .all()
    )
    return {r[0] for r in rows}


def find_next_exercise(db: Session, user_id: int, day: YogaDay, current_exercise_id: int | None = None) -> YogaExercise | None:
    completed_ids = get_completed_exercise_ids(db, user_id, day.id)
    exercises = (
        db.query(YogaExercise)
        .filter(YogaExercise.day_id == day.id)
        .order_by(YogaExercise.order_index)
        .all()
    )
    for ex in exercises:
        if ex.id not in completed_ids:
            return ex
    return None


def get_exercise_navigation(db: Session, user: User, exercise_id: int) -> dict:
    exercise = db.query(YogaExercise).filter(YogaExercise.id == exercise_id).first()
    if not exercise:
        return {"error": "Exercise not found"}
    day = db.query(YogaDay).filter(YogaDay.id == exercise.day_id).first()
    if not day:
        return {"error": "Day not found"}
    completed_ids = get_completed_exercise_ids(db, user.id, day.id)
    next_ex = find_next_exercise(db, user.id, day)
    total = db.query(YogaExercise).filter(YogaExercise.day_id == day.id).count()
    return {
        "next_exercise_id": next_ex.id if next_ex else None,
        "day_completed": day.is_completed or len(completed_ids) >= total,
        "completed_count": len(completed_ids),
        "total_exercises": total,
        "is_current_completed": exercise_id in completed_ids,
    }


def complete_exercise(
    db: Session, user: User, exercise_id: int, duration_seconds: int
) -> dict:
    exercise = db.query(YogaExercise).filter(YogaExercise.id == exercise_id).first()
    if not exercise:
        return {"error": "Exercise not found"}

    day = db.query(YogaDay).filter(YogaDay.id == exercise.day_id).first()
    if not day or not day.is_unlocked:
        return {"error": "Day is locked"}

    existing = (
        db.query(CompletedExercise)
        .filter(
            CompletedExercise.user_id == user.id,
            CompletedExercise.exercise_id == exercise_id,
        )
        .first()
    )
    if not existing:
        completed = CompletedExercise(
            user_id=user.id,
            exercise_id=exercise_id,
            day_id=day.id,
            duration_seconds=duration_seconds,
            calories_burned=exercise.calories_burned,
        )
        db.add(completed)
        db.add(
            CaloriesTracking(
                user_id=user.id,
                calories=exercise.calories_burned,
                source="yoga",
                logged_at=date.today(),
            )
        )
        award_badge(db, user, "first_pose")
        db.flush()

    total_exercises = db.query(YogaExercise).filter(YogaExercise.day_id == day.id).count()
    completed_ids = get_completed_exercise_ids(db, user.id, day.id)
    completed_count = len(completed_ids)
    day_completed = False

    if completed_count >= total_exercises:
        day.is_completed = True
        day.completed_at = datetime.utcnow()
        if day.day_number == 1:
            award_badge(db, user, "day_1")
        if day.day_number == 15:
            award_badge(db, user, "halfway")
        next_day = (
            db.query(YogaDay)
            .filter(YogaDay.plan_id == day.plan_id, YogaDay.day_number == day.day_number + 1)
            .first()
        )
        if next_day:
            next_day.is_unlocked = True
        day_completed = True
        _update_streak(db, user)

    db.commit()
    db.refresh(day)

    next_exercise = find_next_exercise(db, user.id, day) if not day_completed else None

    return {
        "day_completed": day_completed,
        "completed_count": completed_count,
        "total_exercises": total_exercises,
        "next_exercise_id": next_exercise.id if next_exercise else None,
    }


def _update_streak(db: Session, user: User):
    today = date.today()
    if user.last_workout_date:
        last = user.last_workout_date.date() if isinstance(user.last_workout_date, datetime) else user.last_workout_date
        if last == today:
            return
        if last == today - timedelta(days=1):
            user.current_streak += 1
        else:
            user.current_streak = 1
    else:
        user.current_streak = 1
    user.last_workout_date = datetime.utcnow()
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak
    if user.current_streak >= 3:
        award_badge(db, user, "streak_3")
    if user.current_streak >= 7:
        award_badge(db, user, "streak_7")
    if user.current_streak >= 14:
        award_badge(db, user, "streak_14")


def get_dashboard_stats(db: Session, user: User) -> dict:
    bmi = calculate_bmi(user.height_cm, user.weight_kg)
    if bmi < 18.5:
        bmi_cat = "Underweight"
    elif bmi < 25:
        bmi_cat = "Normal"
    elif bmi < 30:
        bmi_cat = "Overweight"
    else:
        bmi_cat = "Obese"

    calories_today = (
        db.query(func.coalesce(func.sum(CaloriesTracking.calories), 0))
        .filter(CaloriesTracking.user_id == user.id, CaloriesTracking.logged_at == date.today())
        .scalar()
    )
    calories_total = (
        db.query(func.coalesce(func.sum(CaloriesTracking.calories), 0))
        .filter(CaloriesTracking.user_id == user.id)
        .scalar()
    )
    if calories_total >= 500:
        award_badge(db, user, "calories_500")

    completed_exercises = (
        db.query(CompletedExercise).filter(CompletedExercise.user_id == user.id).count()
    )

    plan = db.query(YogaPlan).filter(YogaPlan.user_id == user.id, YogaPlan.is_active == True).first()
    completed_days = 0
    remaining_days = 30
    if plan:
        completed_days = db.query(YogaDay).filter(YogaDay.plan_id == plan.id, YogaDay.is_completed == True).count()
        remaining_days = 30 - completed_days

    water_today = (
        db.query(func.coalesce(func.sum(WaterIntake.glasses), 0))
        .filter(WaterIntake.user_id == user.id, WaterIntake.logged_at == date.today())
        .scalar()
    )
    if water_today >= 8:
        award_badge(db, user, "water_goal")

    trial_days_left = user.trial_days
    if user.trial_started_at:
        elapsed = (datetime.utcnow() - user.trial_started_at).days
        trial_days_left = max(0, user.trial_days - elapsed)

    quotes = [
        "Breathe deeply. Move mindfully. Grow daily.",
        "Your body hears everything your mind says.",
        "Yoga is the journey of the self, through the self, to the self.",
        "Small daily improvements lead to stunning results.",
        "Inhale the future, exhale the past.",
    ]
    quote = quotes[user.id % len(quotes)]

    db.commit()

    return {
        "calories_today": float(calories_today or 0),
        "calories_total": float(calories_total or 0),
        "completed_exercises": completed_exercises,
        "completed_days": completed_days,
        "remaining_days": remaining_days,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "trial_days_left": trial_days_left,
        "motivational_quote": quote,
        "water_glasses_today": int(water_today or 0),
        "water_goal": 8,
    }
