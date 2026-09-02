from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.progress import Achievement, CaloriesTracking, WaterIntake, WeightLog
from app.schemas.dashboard import DashboardStats, WaterLogRequest, ReminderUpdate, ShareProgress, WeightLogRequest
from app.utils.deps import get_current_user
from app.services.yoga_service import get_dashboard_stats
from app.models.reminder import DailyReminder

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_stats(db, current_user)


@router.get("/achievements")
def get_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    badges = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    return [
        {
            "id": b.id,
            "badge_key": b.badge_key,
            "title": b.title,
            "description": b.description,
            "icon": b.icon,
            "earned_at": b.earned_at.isoformat(),
        }
        for b in badges
    ]


@router.get("/weight-history")
def weight_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.plan_generator import calculate_bmi

    logs = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(WeightLog.logged_at.asc())
        .limit(30)
        .all()
    )

    if not logs:
        today = date.today()
        logs_data = [{
            "date": today.isoformat(),
            "weight": round(current_user.weight_kg, 1),
            "bmi": calculate_bmi(current_user.height_cm, current_user.weight_kg),
            "label": today.strftime("%b %d"),
        }]
    else:
        logs_data = [
            {
                "date": log.logged_at.isoformat(),
                "weight": round(log.weight_kg, 1),
                "bmi": calculate_bmi(current_user.height_cm, log.weight_kg),
                "label": log.logged_at.strftime("%b %d"),
            }
            for log in logs
        ]

    weights = [d["weight"] for d in logs_data]
    return {
        "history": logs_data,
        "current_weight": round(current_user.weight_kg, 1),
        "current_bmi": calculate_bmi(current_user.height_cm, current_user.weight_kg),
        "min_weight": min(weights) if weights else current_user.weight_kg,
        "max_weight": max(weights) if weights else current_user.weight_kg,
        "goal_weight": round(current_user.weight_kg - 2, 1),
    }


@router.post("/weight")
def log_weight(
    data: WeightLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.plan_generator import calculate_bmi

    log_date = data.logged_at or date.today()
    existing = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id, WeightLog.logged_at == log_date)
        .first()
    )
    if existing:
        existing.weight_kg = data.weight_kg
    else:
        db.add(WeightLog(user_id=current_user.id, weight_kg=data.weight_kg, logged_at=log_date))
    current_user.weight_kg = data.weight_kg
    db.commit()
    bmi = calculate_bmi(current_user.height_cm, data.weight_kg)
    return {
        "weight_kg": data.weight_kg,
        "bmi": bmi,
        "message": "Weight logged successfully",
    }


@router.get("/calories-chart")
def calories_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = []
    for i in range(7):
        d = date.today() - timedelta(days=6 - i)
        total = (
            db.query(func.coalesce(func.sum(CaloriesTracking.calories), 0))
            .filter(CaloriesTracking.user_id == current_user.id, CaloriesTracking.logged_at == d)
            .scalar()
        )
        data.append({"date": d.isoformat(), "calories": float(total or 0)})
    return data


@router.post("/water")
def log_water(
    data: WaterLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = WaterIntake(
        user_id=current_user.id,
        glasses=data.glasses,
        ml_amount=data.ml_amount,
        logged_at=date.today(),
    )
    db.add(entry)
    db.commit()
    total = (
        db.query(func.coalesce(func.sum(WaterIntake.glasses), 0))
        .filter(WaterIntake.user_id == current_user.id, WaterIntake.logged_at == date.today())
        .scalar()
    )
    return {"glasses_today": int(total or 0), "goal": 8}


@router.put("/reminder")
def update_reminder(
    data: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.daily_reminder_enabled = data.is_enabled
    current_user.reminder_time = data.reminder_time
    reminder = db.query(DailyReminder).filter(DailyReminder.user_id == current_user.id).first()
    if not reminder:
        reminder = DailyReminder(user_id=current_user.id)
        db.add(reminder)
    reminder.reminder_time = data.reminder_time
    reminder.is_enabled = data.is_enabled
    if data.message:
        reminder.message = data.message
    db.commit()
    return {"message": "Reminder updated"}


@router.get("/share", response_model=ShareProgress)
def share_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stats = get_dashboard_stats(db, current_user)
    return ShareProgress(
        message=f"I've completed {stats['completed_days']} days on YogaCare with a {stats['current_streak']}-day streak! 🧘",
        streak=stats["current_streak"],
        completed_days=stats["completed_days"],
        total_calories=stats["calories_total"],
    )


@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch real users
    users = db.query(User).order_by(User.xp.desc()).limit(10).all()
    
    # Generate some nice seed mock users if we are alone, to keep it fun and social
    mock_yogis = [
        {"full_name": "Aarav Mehta", "xp": 480, "current_streak": 12, "calories": 1420},
        {"full_name": "Priya Sharma", "xp": 360, "current_streak": 8, "calories": 980},
        {"full_name": "Kabir Verma", "xp": 280, "current_streak": 6, "calories": 750},
        {"full_name": "Ananya Sen", "xp": 120, "current_streak": 3, "calories": 420},
        {"full_name": "Rohan Das", "xp": 50, "current_streak": 1, "calories": 150}
    ]
    
    leaderboard = []
    # Add real users first
    for u in users:
        # Sum calories for user
        from app.models.progress import CaloriesTracking
        tot_cal = db.query(func.coalesce(func.sum(CaloriesTracking.calories), 0)).filter(CaloriesTracking.user_id == u.id).scalar()
        leaderboard.append({
            "name": u.full_name,
            "xp": u.xp,
            "current_streak": u.current_streak,
            "calories": int(tot_cal or 0),
            "is_me": u.id == current_user.id
        })
        
    # Append mock yogis to populate
    for mock in mock_yogis:
        if not any(x["name"] == mock["full_name"] for x in leaderboard):
            leaderboard.append({
                "name": mock["full_name"],
                "xp": mock["xp"],
                "current_streak": mock["current_streak"],
                "calories": mock["calories"],
                "is_me": False
            })
            
    # Sort again by XP
    leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    
    # Add rankings
    for index, item in enumerate(leaderboard):
        item["rank"] = index + 1
        
    return leaderboard
