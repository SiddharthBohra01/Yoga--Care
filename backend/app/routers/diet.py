from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.diet import DietLog
from app.utils.deps import get_current_user
from app.services.plan_generator import calculate_bmi

router = APIRouter(prefix="/api/diet", tags=["Diet"])

class DietLogCreate(BaseModel):
    meal_type: str  # Breakfast, Lunch, Snack, Dinner
    food_name: str
    calories: float
    protein_g: float
    logged_at: Optional[date] = None

@router.get("/plan")
def get_diet_plan(
    current_user: User = Depends(get_current_user)
):
    bmi = calculate_bmi(current_user.height_cm, current_user.weight_kg)
    goal = current_user.fitness_goal
    
    # Calculate recommended targets
    # Baseline calorie estimate
    # Underweight: higher calories, higher protein
    # Overweight/Belly Fat/Weight Loss: lower calories, high protein
    # Strength: high protein, balanced calories
    if bmi < 18.5:
        target_calories = 2400
        target_protein = round(current_user.weight_kg * 1.8, 1)
        diet_type = "High-Calorie Muscle Builder"
        meals = {
            "breakfast": "Banana & Peanut Butter Oatmeal with almonds (550 kcal, 20g protein)",
            "lunch": "Quinoa Bowl with Paneer/Tofu, mixed veggies, and olive oil (750 kcal, 28g protein)",
            "snack": "Mixed nuts & seeds, Greek yogurt, or protein shake (350 kcal, 22g protein)",
            "dinner": "Lentil soup (Dal) with brown rice and roasted broccoli (750 kcal, 30g protein)"
        }
    elif goal in ["weight_loss", "belly_fat"]:
        target_calories = 1600
        target_protein = round(current_user.weight_kg * 1.5, 1)
        diet_type = "Calorie Deficit / Fat Burner"
        meals = {
            "breakfast": "Egg white / Sprouted moong chilla with mint chutney (350 kcal, 18g protein)",
            "lunch": "Grilled chicken salad or roasted chickpea bowl with leafy greens (500 kcal, 35g protein)",
            "snack": "Apple slices with 1 tbsp peanut butter or roasted chana (150 kcal, 7g protein)",
            "dinner": "Baked salmon or grilled tofu with steamed asparagus and cauliflower rice (600 kcal, 38g protein)"
        }
    elif goal == "strength":
        target_calories = 2200
        target_protein = round(current_user.weight_kg * 2.0, 1)
        diet_type = "High Protein Strength Plan"
        meals = {
            "breakfast": "Scrambled eggs or tofu bhurji with whole wheat toast (500 kcal, 30g protein)",
            "lunch": "Soy chunks curry or chicken breast with sweet potato and broccoli (700 kcal, 45g protein)",
            "snack": "Whey protein shake with milk and 1 banana (350 kcal, 30g protein)",
            "dinner": "Lentil pasta or cottage cheese stir-fry with quinoa (650 kcal, 35g protein)"
        }
    else:  # balanced / flexibility / meditation
        target_calories = 1900
        target_protein = round(current_user.weight_kg * 1.2, 1)
        diet_type = "Balanced Holistic Nutrition"
        meals = {
            "breakfast": "Chia seed pudding with berries and honey (400 kcal, 12g protein)",
            "lunch": "Mixed vegetable wrap with chickpea hummus and avocado (600 kcal, 20g protein)",
            "snack": "Handful of almonds and walnuts with green tea (200 kcal, 5g protein)",
            "dinner": "Stir-fried tofu/chicken with mixed vegetables and quinoa (700 kcal, 30g protein)"
        }

    return {
        "bmi": bmi,
        "fitness_goal": goal,
        "diet_type": diet_type,
        "target_calories": target_calories,
        "target_protein_g": target_protein,
        "target_water_ml": 3000,
        "suggested_meals": meals
    }

@router.get("/history")
def get_diet_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(DietLog).filter(DietLog.user_id == current_user.id).order_by(DietLog.logged_at.desc(), DietLog.id.desc()).limit(30).all()
    
    # Calculate today's totals
    today = date.today()
    totals = db.query(
        func.coalesce(func.sum(DietLog.calories), 0),
        func.coalesce(func.sum(DietLog.protein_g), 0)
    ).filter(DietLog.user_id == current_user.id, DietLog.logged_at == today).first()
    
    return {
        "today_calories": float(totals[0] or 0),
        "today_protein": float(totals[1] or 0),
        "meals": [
            {
                "id": m.id,
                "meal_type": m.meal_type,
                "food_name": m.food_name,
                "calories": m.calories,
                "protein_g": m.protein_g,
                "logged_at": m.logged_at.isoformat()
            }
            for m in logs
        ]
    }

@router.post("")
def log_meal(
    data: DietLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_date = data.logged_at or date.today()
    log = DietLog(
        user_id=current_user.id,
        meal_type=data.meal_type,
        food_name=data.food_name,
        calories=data.calories,
        protein_g=data.protein_g,
        logged_at=log_date
    )
    db.add(log)
    
    # Award 10 XP for logging a meal!
    current_user.xp += 10
    if current_user.xp >= 500:
        current_user.level = "Yoga Master"
    elif current_user.xp >= 150:
        current_user.level = "Intermediate"

    db.commit()
    return {"message": "Meal logged successfully", "id": log.id, "xp_earned": 10}

@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(DietLog).filter(DietLog.id == meal_id, DietLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Meal log not found")
    db.delete(log)
    db.commit()
    return {"message": "Meal log deleted"}
