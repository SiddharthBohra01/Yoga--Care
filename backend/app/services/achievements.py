from sqlalchemy.orm import Session
from app.models.user import User
from app.models.progress import Achievement

BADGES = {
    "first_pose": ("First Flow", "Completed your first yoga pose", "🌱"),
    "day_1": ("Day One Champion", "Completed Day 1 of your challenge", "🏆"),
    "streak_3": ("3-Day Streak", "Practiced 3 days in a row", "🔥"),
    "streak_7": ("Week Warrior", "7-day practice streak", "⚡"),
    "streak_14": ("Fortnight Flow", "14-day streak achieved", "💎"),
    "halfway": ("Halfway Hero", "Completed 15 days of your plan", "🎯"),
    "water_goal": ("Hydration Master", "Reached daily water goal", "💧"),
    "calories_500": ("Calorie Crusher", "Burned 500+ total calories", "🔥"),
}


def award_badge(db: Session, user: User, badge_key: str) -> Achievement | None:
    if badge_key not in BADGES:
        return None
    existing = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id, Achievement.badge_key == badge_key)
        .first()
    )
    if existing:
        return None
    title, desc, icon = BADGES[badge_key]
    badge = Achievement(
        user_id=user.id,
        badge_key=badge_key,
        title=title,
        description=desc,
        icon=icon,
    )
    db.add(badge)
    return badge
