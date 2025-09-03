def calculate_beach_quality_score(water_quality: int, pollution_level: int, 
                                wildlife_activity: str = None) -> dict:
    """
    calculate the overall beach quality score based on these factors: 
        - water_quality: 1-5 scale 
        - pollution_level: 1-5 scale 
        - wildlife_activity: "high", "medium", "low", "none" (optional)
    Returns:
        dict with score, grade, + description
    """
    
    # a starting score from water quality (40% weight) and pollution (50% weight)
    base_score = (water_quality * 0.4) + (pollution_level * 0.5)
    
    # wildlife activity (10% weight)
    wildlife_bonus = 0
    if wildlife_activity:
        wildlife_scores = {
            "high": 0.5,
            "medium": 0.3,
            "low": 0.1,
            "none": 0
        }
        wildlife_bonus = wildlife_scores.get(wildlife_activity.lower(), 0)
    
    # final score (out of 5)
    final_score = base_score + wildlife_bonus
    final_score = min(5.0, max(1.0, final_score))  # must be between 1-5
    
    # convert to grade
    if final_score >= 4.5:
        grade = "A+"
        description = "Excellent beach conditions"
    elif final_score >= 4.0:
        grade = "A"
        description = "Very good beach conditions"
    elif final_score >= 3.5:
        grade = "B+"
        description = "Good beach conditions"
    elif final_score >= 3.0:
        grade = "B"
        description = "Fair beach conditions"
    elif final_score >= 2.5:
        grade = "C"
        description = "Poor beach conditions"
    else:
        grade = "D"
        description = "Very poor beach conditions"
    
    return {
        "score": round(final_score, 2),
        "grade": grade,
        "description": description,
        "water_quality": water_quality,
        "pollution_level": pollution_level,
        "wildlife_activity": wildlife_activity
    }

def validate_beach_report_data(water_quality: int, pollution_level: int, 
                              wildlife_activity: str = None, water_temp: float = None):
    """validate the beach report input data"""
    errors = []
    
    if not (1 <= water_quality <= 5):
        errors.append("Water quality must be between 1 and 5")
    
    if not (1 <= pollution_level <= 5):
        errors.append("Pollution level must be between 1 and 5")
    
    if wildlife_activity and wildlife_activity.lower() not in ["high", "medium", "low", "none"]:
        errors.append("Wildlife activity must be 'high', 'medium', 'low', or 'none'")
    
    if water_temp is not None and (water_temp < -2 or water_temp > 50):
        errors.append("The water temperature seems unrealistic! It should be between -2°C and 50°C)")
    
    return errors

# Beach condition categories
WATER_QUALITY_LABELS = {
    1: "Very Poor",
    2: "Poor", 
    3: "Fair",
    4: "Good",
    5: "Excellent"
}

POLLUTION_LABELS = {
    1: "Heavy Pollution",
    2: "Moderate Pollution",
    3: "Light Pollution", 
    4: "Minimal Pollution",
    5: "Clean"
}