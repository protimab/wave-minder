VALID_ACTION_TYPES = {
    "beach_cleanup": {
        "name": "Beach Cleanup",
        "base_multiplier": 1.5,
        "description": "Removing waste and debris from beaches"
    },
    "citizen_science": {
        "name": "Citizen Science",
        "base_multiplier": 1.2,
        "description": "Data collection and monitoring activities"
    },
    "education": {
        "name": "Education & Outreach",
        "base_multiplier": 1.0,
        "description": "Teaching and raising awareness"
    },
    "restoration": {
        "name": "Habitat Restoration",
        "base_multiplier": 2.0,
        "description": "Restoring marine habitats and ecosystems"
    },
    "monitoring": {
        "name": "Environmental Monitoring",
        "base_multiplier": 1.3,
        "description": "Tracking environmental conditions"
    },
    "policy_advocacy": {
        "name": "Policy Advocacy",
        "base_multiplier": 1.1,
        "description": "Advocating for marine conservation policies"
    }
}

def calculate_impact_score(action_type: str, participants: int, 
                          waste_collected: float = 0, area_covered: float = 0,
                          duration_hours: float = None) -> dict:
    """
    calculate impact score for a specific conservation action

        *action_type: type of action
        *participants: # participants
        *waste_collected: waste collected (kg) 
        *area_covered: area covered (sqm)
        duration_hours: hours
    
    returns:
        dict with impact score, grade, and breakdown
    """
    
    if action_type not in VALID_ACTION_TYPES:
        action_type = "education"  # default
    
    base_multiplier = VALID_ACTION_TYPES[action_type]["base_multiplier"]
    
    # nase score from participants (1 point per participant)
    participant_score = participants * 1.0
    
    # waste collection bonus (2 points per kg)
    waste_score = waste_collected * 2.0
    
    # area coverage bonus (0.01 point per square meter)
    area_score = area_covered * 0.01
    
    # duration bonus (0.5 point per hour)
    duration_score = (duration_hours * 0.5) if duration_hours else 0
    
    # calculating raw score
    raw_score = (participant_score + waste_score + area_score + duration_score)
    
    # apply action type multiplier
    final_score = raw_score * base_multiplier
    
    # final impact grade
    if final_score >= 100:
        grade = "Exceptional"
        level = 5
    elif final_score >= 50:
        grade = "High Impact"
        level = 4
    elif final_score >= 25:
        grade = "Significant"
        level = 3
    elif final_score >= 10:
        grade = "Moderate"
        level = 2
    else:
        grade = "Basic"
        level = 1
    
    return {
        "impact_score": round(final_score, 2),
        "impact_grade": grade,
        "impact_level": level,
        "breakdown": {
            "participant_contribution": round(participant_score, 2),
            "waste_collection_contribution": round(waste_score, 2),
            "area_coverage_contribution": round(area_score, 2),
            "duration_contribution": round(duration_score, 2),
            "action_type_multiplier": base_multiplier
        }
    }

def validate_conservation_action(action_type: str, participants: int,
                                waste_collected: float, area_covered: float,
                                duration_hours: float = None) -> list:
    """Validate the conservation action input data"""
    errors = []
    
    if action_type not in VALID_ACTION_TYPES:
        valid_types = ", ".join(VALID_ACTION_TYPES.keys())
        errors.append(f"Invalid action type. Must be one of: {valid_types}")
    
    if participants < 1:
        errors.append("Participants must be at least 1")
    
    if participants > 10000:
        errors.append("Participants seems unrealistic (max 10,000)")
    
    if waste_collected < 0:
        errors.append("Waste collected cannot be negative!")
    
    if waste_collected > 10000:
        errors.append("Waste collected seems unrealistic (max 10,000 kg)")
    
    if area_covered < 0:
        errors.append("Area covered cannot be negative")
    
    if area_covered > 1000000:
        errors.append("Area covered seems unrealistic (max 1,000,000 sqm)")
    
    if duration_hours is not None:
        if duration_hours < 0:
            errors.append("Duration cannot be negative")
        if duration_hours > 24:
            errors.append("Duration exceeds 24 hours")
    
    return errors

def get_action_type_info(action_type: str) -> dict:
    """Get information about an action type"""
    if action_type in VALID_ACTION_TYPES:
        return VALID_ACTION_TYPES[action_type]
    return {
        "name": "Unknown",
        "base_multiplier": 1.0,
        "description": "Unknown action type"
    }

def calculate_community_impact(actions: list) -> dict:
    """
    calculate aggregate community impact from multiple actions
        *actions: list of action tuples from datbase
    
    returns:
        dict with community overall stats
    """
    if not actions:
        return {
            "total_actions": 0,
            "total_impact_score": 0,
            "average_impact_score": 0,
            "total_participants": 0,
            "total_waste_kg": 0,
            "total_area_sqm": 0
        }
    
    total_impact = 0
    total_participants = 0
    total_waste = 0
    total_area = 0
    
    for action in actions:
        # [7] = impact_score, [6] = participants, [8] = waste, [9] = area
        total_impact += action[7] if action[7] else 0
        total_participants += action[6] if action[6] else 0
        total_waste += action[8] if action[8] else 0
        total_area += action[9] if action[9] else 0
    
    avg_impact = total_impact / len(actions) if actions else 0
    
    return {
        "total_actions": len(actions),
        "total_impact_score": round(total_impact, 2),
        "average_impact_score": round(avg_impact, 2),
        "total_participants": total_participants,
        "total_waste_kg": round(total_waste, 2),
        "total_area_sqm": round(total_area, 2)
    }