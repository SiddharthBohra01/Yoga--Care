import mediapipe as mp
import cv2
import numpy as np

# MediaPipe pose solution
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False,
                     model_complexity=1,
                     enable_segmentation=False,
                     min_detection_confidence=0.5,
                     min_tracking_confidence=0.5)

def detect_pose(frame: np.ndarray) -> dict:
    """Detect pose landmarks in an OpenCV frame.
    Returns a dictionary with landmark coordinates normalized to [0,1] and visibility.
    """
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)
    if not results.pose_landmarks:
        return {"landmarks": []}
    landmarks = []
    for idx, lm in enumerate(results.pose_landmarks.landmark):
        landmarks.append({
            "id": idx,
            "x": lm.x,
            "y": lm.y,
            "z": lm.z,
            "visibility": lm.visibility,
        })
    return {"landmarks": landmarks}

def evaluate_posture(landmarks: list[dict]) -> list[str]:
    """Simple rule‑based posture evaluator.
    Returns a list of correction strings, e.g. ['back_straight', 'raise_hands'].
    This is a placeholder – replace with a ML model for production.
    """
    feedback = []
    # Example: check if shoulder height is roughly equal (simple heuristic)
    left_shoulder = next((l for l in landmarks if l["id"] == mp_pose.PoseLandmark.LEFT_SHOULDER.value), None)
    right_shoulder = next((l for l in landmarks if l["id"] == mp_pose.PoseLandmark.RIGHT_SHOULDER.value), None)
    if left_shoulder and right_shoulder:
        diff = abs(left_shoulder["y"] - right_shoulder["y"])
        if diff > 0.05:
            feedback.append("align_shoulders")
    # Placeholder for hands up detection
    left_wrist = next((l for l in landmarks if l["id"] == mp_pose.PoseLandmark.LEFT_WRIST.value), None)
    right_wrist = next((l for l in landmarks if l["id"] == mp_pose.PoseLandmark.RIGHT_WRIST.value), None)
    if left_wrist and right_wrist and left_wrist["y"] < 0.3 and right_wrist["y"] < 0.3:
        feedback.append("hands_up")
    return feedback
