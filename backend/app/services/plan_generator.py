"""Personalized 30-day yoga plan generator based on user profile."""

from app.models.user import User

# Yoga pose library with online images (Unsplash)
POSE_LIBRARY = [
    {
        "name": "Mountain Pose",
        "slug": "mountain-pose",
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "base_duration": 45,
        "calories": 12,
        "difficulty": "easy",
        "focus": ["full_body", "meditation", "flexibility"],
    },
    {
        "name": "Downward Dog",
        "slug": "downward-dog",
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        "base_duration": 60,
        "calories": 25,
        "difficulty": "medium",
        "focus": ["flexibility", "strength", "full_body"],
    },
    {
        "name": "Warrior I",
        "slug": "warrior-1",
        "image": "https://images.unsplash.com/photo-1599901860904-17fb12c0b4b5?w=600&q=80",
        "base_duration": 50,
        "calories": 30,
        "difficulty": "medium",
        "focus": ["strength", "weight_loss", "belly_fat"],
    },
    {
        "name": "Warrior II",
        "slug": "warrior-2",
        "image": "https://images.unsplash.com/photo-1575052814086-3859abfb93f3?w=600&q=80",
        "base_duration": 50,
        "calories": 28,
        "difficulty": "medium",
        "focus": ["strength", "full_body"],
    },
    {
        "name": "Tree Pose",
        "slug": "tree-pose",
        "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
        "base_duration": 40,
        "calories": 15,
        "difficulty": "easy",
        "focus": ["meditation", "flexibility", "balance"],
    },
    {
        "name": "Child's Pose",
        "slug": "childs-pose",
        "image": "https://images.unsplash.com/photo-1593811167568-9cef47bfc41e?w=600&q=80",
        "base_duration": 60,
        "calories": 8,
        "difficulty": "easy",
        "focus": ["meditation", "flexibility", "recovery"],
    },
    {
        "name": "Cobra Pose",
        "slug": "cobra-pose",
        "image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80",
        "base_duration": 45,
        "calories": 18,
        "difficulty": "easy",
        "focus": ["flexibility", "belly_fat", "strength"],
    },
    {
        "name": "Bridge Pose",
        "slug": "bridge-pose",
        "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
        "base_duration": 50,
        "calories": 22,
        "difficulty": "medium",
        "focus": ["strength", "weight_loss", "full_body"],
    },
    {
        "name": "Boat Pose",
        "slug": "boat-pose",
        "image": "https://images.unsplash.com/photo-1574680096145-d05b474e3a85?w=600&q=80",
        "base_duration": 40,
        "calories": 35,
        "difficulty": "hard",
        "focus": ["belly_fat", "strength", "weight_loss"],
    },
    {
        "name": "Plank Pose",
        "slug": "plank-pose",
        "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        "base_duration": 45,
        "calories": 40,
        "difficulty": "hard",
        "focus": ["strength", "belly_fat", "weight_loss"],
    },
    {
        "name": "Cat-Cow Stretch",
        "slug": "cat-cow",
        "image": "https://images.unsplash.com/photo-1599901860904-17fb12c0b4b5?w=600&q=80",
        "base_duration": 50,
        "calories": 14,
        "difficulty": "easy",
        "focus": ["flexibility", "full_body", "recovery"],
    },
    {
        "name": "Triangle Pose",
        "slug": "triangle-pose",
        "image": "https://images.unsplash.com/photo-1593810450967-847c65e05748?w=600&q=80",
        "base_duration": 55,
        "calories": 26,
        "difficulty": "medium",
        "focus": ["flexibility", "weight_loss", "full_body"],
    },
    {
        "name": "Chair Pose",
        "slug": "chair-pose",
        "image": "https://images.unsplash.com/photo-1575052814086-3859abfb93f3?w=600&q=80",
        "base_duration": 45,
        "calories": 32,
        "difficulty": "medium",
        "focus": ["weight_loss", "strength", "belly_fat"],
    },
    {
        "name": "Seated Forward Bend",
        "slug": "seated-forward-bend",
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "base_duration": 55,
        "calories": 16,
        "difficulty": "easy",
        "focus": ["flexibility", "meditation"],
    },
    {
        "name": "Pigeon Pose",
        "slug": "pigeon-pose",
        "image": "https://images.unsplash.com/photo-1599901860904-17fb12c0b4b5?w=600&q=80",
        "base_duration": 60,
        "calories": 20,
        "difficulty": "medium",
        "focus": ["flexibility", "recovery"],
    },
    {
        "name": "Sun Salutation A",
        "slug": "sun-salutation-a",
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        "base_duration": 90,
        "calories": 55,
        "difficulty": "medium",
        "focus": ["full_body", "weight_loss", "strength"],
    },
]

DAY_THEMES = [
    ("Foundation & Breath", "breathwork"),
    ("Core Awakening", "core"),
    ("Hip Opening Flow", "hips"),
    ("Spine Flexibility", "spine"),
    ("Balance & Focus", "balance"),
    ("Strength Building", "strength"),
    ("Restorative Recovery", "restorative"),
    ("Full Body Flow", "flow"),
    ("Warrior Sequence", "warriors"),
    ("Deep Stretch", "stretch"),
]

GOAL_DESCRIPTIONS = {
    "weight_loss": "calorie-burning dynamic flows",
    "flexibility": "deep stretching and mobility",
    "meditation": "mindful breath-centered practice",
    "strength": "power poses and core engagement",
    "belly_fat": "core-focused fat burning sequences",
    "full_body": "balanced total-body wellness",
}


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m**2), 1)


def bmi_multiplier(bmi: float) -> float:
    if bmi < 18.5:
        return 0.85
    if bmi < 25:
        return 1.0
    if bmi < 30:
        return 1.1
    return 1.2


def experience_multiplier(level: str) -> float:
    return {"beginner": 0.8, "intermediate": 1.0, "advanced": 1.25}.get(level, 1.0)


def select_poses_for_day(user: User, day_number: int, bmi: float) -> list[dict]:
    goal = user.fitness_goal
    exp_mult = experience_multiplier(user.experience_level)
    bmi_mult = bmi_multiplier(bmi)
    day_intensity = min(1.0 + (day_number - 1) * 0.02, 1.5)

    scored = []
    for pose in POSE_LIBRARY:
        score = 0
        if goal in pose["focus"] or "full_body" in pose["focus"]:
            score += 3
        if day_number <= 7 and pose["difficulty"] == "easy":
            score += 2
        elif day_number > 14 and pose["difficulty"] == "hard":
            score += 2
        elif pose["difficulty"] == "medium":
            score += 1
        score += (day_number + hash(pose["slug"] + str(user.id))) % 5
        scored.append((score, pose))

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [p for _, p in scored[:8]]

    exercises = []
    for i, pose in enumerate(selected):
        duration = int(pose["base_duration"] * exp_mult * bmi_mult * day_intensity)
        calories = round(pose["calories"] * exp_mult * bmi_mult * day_intensity, 1)
        exercises.append(
            {
                "name": pose["name"],
                "slug": f"{pose['slug']}-d{day_number}",
                "image_url": pose["image"],
                "duration_seconds": max(30, min(duration, 120)),
                "reps": 3 if pose["difficulty"] != "easy" else None,
                "calories_burned": calories,
                "difficulty": pose["difficulty"],
                "instructions": _instructions(pose["name"]),
                "benefits": _benefits(pose["name"], goal),
                "common_mistakes": _mistakes(pose["name"]),
                "steps": _steps(pose["name"]),
                "order_index": i,
            }
        )
    return exercises


def _instructions(name: str) -> str:
    return f"Focus on steady breathing while holding {name}. Keep your core engaged and move with control."


def _benefits(name: str, goal: str) -> str:
    goal_text = GOAL_DESCRIPTIONS.get(goal, "overall wellness")
    return f"{name} improves flexibility, balance, and supports your {goal_text} journey."


def _mistakes(name: str) -> str:
    return f"Avoid rushing {name}. Don't hold your breath. Keep shoulders relaxed and spine aligned."


def _steps(name: str) -> str:
    return (
        f"1. Find a quiet space and roll out your mat.\n"
        f"2. Warm up with 3 deep breaths.\n"
        f"3. Enter {name} slowly with proper alignment.\n"
        f"4. Hold the pose, breathing steadily.\n"
        f"5. Release gently and rest for 10 seconds."
    )


def get_day_title(day_number: int) -> tuple[str, str]:
    theme = DAY_THEMES[(day_number - 1) % len(DAY_THEMES)]
    return f"Day {day_number}: {theme[0]}", theme[1]


def generate_plan_description(user: User, bmi: float) -> str:
    goal_desc = GOAL_DESCRIPTIONS.get(user.fitness_goal, "holistic wellness")
    return (
        f"Your personalized 30-day YogaCare plan targets {goal_desc}. "
        f"Based on BMI {bmi}, {user.experience_level} level, and your profile, "
        f"each day unlocks progressively to build lasting habits."
    )
