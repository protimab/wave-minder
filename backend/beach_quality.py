from typing import Optional, List

# Beach quality scoring 
WILDLIFE_SCORES = {"high": 0.5, "medium": 0.3, "low": 0.1, "none": 0}

GRADE_THRESHOLDS = [
    (4.5, "A+", "Excellent beach conditions"),
    (4.0, "A", "Very good beach conditions"),
    (3.5, "B+", "Good beach conditions"),
    (3.0, "B", "Fair beach conditions"),
    (2.5, "C", "Poor beach conditions"),
    (0, "D", "Very poor beach conditions")
]

WATER_QUALITY_LABELS = {
    1: "Very Poor", 2: "Poor", 3: "Fair", 4: "Good", 5: "Excellent"
}

POLLUTION_LABELS = {
    1: "Heavy Pollution", 2: "Moderate Pollution", 3: "Light Pollution",
    4: "Minimal Pollution", 5: "Clean"
}


def calculate_beach_quality_score(water_quality: int, pollution_level: int, 
                                wildlife_activity: str = None) -> dict:
    """ calculate the overall beach quality score based on these factors: 
        - water_quality: 1-5 scale 
        - pollution_level: 1-5 scale 
        - wildlife_activity: "high", "medium", "low", "none" (optional)
    returns dict with score, grade, + description """
    
    # base score 
    base_score = (water_quality * 0.4) + (pollution_level * 0.5)
    
    # wildlife activity bonus 
    wildlife_bonus = 0
    if wildlife_activity:
        wildlife_scores = {"high": 0.5,"medium": 0.3,"low": 0.1,"none": 0}
        wildlife_bonus = wildlife_scores.get(wildlife_activity.lower(), 0)
    
    # final score (out of 5)
    final_score = min(5.0, max(1.0, base_score + wildlife_bonus)) 
    
    # convert to grade
    grade, description = next(
        (g[1], g[2]) for g in GRADE_THRESHOLDS if final_score >= g[0]
    )
    
    return {
        "score": round(final_score, 2),
        "grade": grade,
        "description": description,
        "water_quality": water_quality,
        "pollution_level": pollution_level,
        "wildlife_activity": wildlife_activity
    }

def validate_range(value, name: str, min_val, max_val, errors: List[str]) -> List[str]:
    """range validation"""
    if not (min_val <= value <= max_val):
        errors.append(f"{name} must be between {min_val} and {max_val}")
    return errors


def validate_beach_report_data(water_quality: int, pollution_level: int, wildlife_activity: str = None, water_temp: float = None):
    """validate the beach report input data"""
    errors = []
    
    validate_range(water_quality, "Water quality", 1, 5, errors)
    validate_range(pollution_level, "Pollution level", 1, 5, errors)
    
    if wildlife_activity and wildlife_activity.lower() not in ["high", "medium", "low", "none"]:
        errors.append("Wildlife activity must be 'high', 'medium', 'low', or 'none'")
    
    if water_temp is not None:
        validate_range(water_temp, "Water temperature", -2, 50, errors)
    
    return errors