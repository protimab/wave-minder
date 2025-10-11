from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import database
import auth
import schemas
import backend.beach_quality as beach_quality
import ocean_data

# FASTAPI
async def lifespan(app: FastAPI):
    database.init_database()
    yield

app = FastAPI(title="WaveMinder", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# HELPER FUNCTIONS - Convert DB tuples to response models
def sighting_to_response(s):
    """convert sighting tuple to response model"""
    return schemas.MarineSightingResponse(
        id=s[0], species_name=s[2], species_type=s[3], location_name=s[4],
        latitude=s[5], longitude=s[6], date_spotted=s[7], time_spotted=s[8],
        group_size=s[9], behavior=s[10], notes=s[12], verified=bool(s[13]),
        created_at=str(s[14]), user_name=s[15]
    )

def beach_report_to_response(r):
    """convert beach report tuple to response model"""
    quality_data = beach_quality.calculate_beach_quality_score(r[5], r[6], r[8])
    return schemas.BeachReportResponse(
        id=r[0], beach_name=r[2], latitude=r[3], longitude=r[4],
        water_quality=r[5], pollution_level=r[6], water_temp=r[7],
        wildlife_activity=r[8], weather_conditions=r[9], notes=r[11],
        photo_url=r[10], report_date=r[12], created_at=str(r[13]),
        user_name=r[14], quality_score=quality_data["score"]
    )

def conservation_action_to_response(a):
    """convert conservation action tuple to response model"""
    return schemas.ConservationActionResponse(
        id=a[0], action_type=a[2], title=a[3], description=a[4],
        location_name=a[5], latitude=a[6], longitude=a[7], participants=a[8],
        impact_score=a[9], waste_collected=a[10], area_covered=a[11],
        date_completed=a[12], duration_hours=a[13], photo_url=a[14],
        created_at=str(a[15]), user_name=a[16]
    )

# AUTH ENDPOINTS
@app.get("/")
def root():
    return {"message": "WaveMinder"}

@app.post("/signup", response_model=schemas.UserResponse)
def signup(request: schemas.UserCreate):
    if database.get_user_by_email(request.email):
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = database.create_user(
        email=request.email,
        name=request.name,
        password=auth.get_password_hash(request.password),
        location=request.location
    )
    return schemas.UserResponse(
        id=user_id, email=request.email, name=request.name,
        location=request.location, created_at=""
    )

@app.post("/login", response_model=schemas.Token)
def login(request: schemas.UserCreate):
    user = auth.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return schemas.Token(
        access_token=auth.create_access_token(user_email=user[1]),
        token_type="bearer"
    )

@app.get("/me", response_model=schemas.UserResponse)
def read_me(current_user=Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user[0], email=current_user[1], name=current_user[2],
        location=current_user[4], created_at=str(current_user[6])
    )

# MARINE SIGHTINGS ENDPOINTS
@app.post("/sightings", response_model=schemas.MarineSightingResponse)
def create_sighting(sighting: schemas.MarineSightingCreate, current_user=Depends(auth.get_current_user)):
    try:
        sighting_id = database.create_marine_sighting(
            user_id=current_user[0], **sighting.dict()
        )
        new_sighting = database.get_sighting_by_id(sighting_id)
        if not new_sighting:
            raise HTTPException(status_code=500, detail="Failed to create sighting")
        return sighting_to_response(new_sighting)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create sighting")

@app.get("/sightings", response_model=List[schemas.MarineSightingResponse])
def get_sightings(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    """get all sightings"""
    try:
        sightings = database.get_user_sightings(user_id) if user_id else database.get_all_sightings(limit, offset)
        return [sighting_to_response(s) for s in sightings]
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sightings")

@app.get("/sightings/{sighting_id}", response_model=schemas.MarineSightingResponse)
def get_sighting(sighting_id: int):
    "get all sightings for specific user ID"
    sighting = database.get_sighting_by_id(sighting_id)
    if not sighting:
        raise HTTPException(status_code=404, detail="Sighting not found")
    return sighting_to_response(sighting)

@app.put("/sightings/{sighting_id}", response_model=schemas.MarineSightingResponse)
def update_sighting(sighting_id: int, update: schemas.MarineSightingCreate, current_user=Depends(auth.get_current_user)):
    existing = database.get_sighting_by_id(sighting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Sighting not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not database.update_marine_sighting(sighting_id, **update.dict()):
        raise HTTPException(status_code=500, detail="Failed to update")
    return sighting_to_response(database.get_sighting_by_id(sighting_id))

@app.delete("/sightings/{sighting_id}")
def delete_sighting(sighting_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_sighting_by_id(sighting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Sighting not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not database.delete_marine_sighting(sighting_id):
        raise HTTPException(status_code=500, detail="Failed to delete")
    return {"message": "Sighting deleted"}

# BEACH REPORTS ENDPOINTS
@app.post("/beach-reports", response_model=schemas.BeachReportResponse)
def create_beach_report(report: schemas.BeachReportCreate, current_user=Depends(auth.get_current_user)):
    try:
        errors = beach_quality.validate_beach_report_data(
            report.water_quality, report.pollution_level,
            report.wildlife_activity, report.water_temp
        )
        if errors:
            raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
        
        report_id = database.create_beach_report(
            user_id=current_user[0], **report.dict()
        )
        new_report = database.get_beach_report_by_id(report_id)
        if not new_report:
            raise HTTPException(status_code=500, detail="Failed to create report")
        return beach_report_to_response(new_report)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create beach report")

@app.get("/beach-reports", response_model=List[schemas.BeachReportResponse])
def get_beach_reports(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    try:
        reports = database.get_user_beach_reports(user_id) if user_id else database.get_all_beach_reports(limit, offset)
        return [beach_report_to_response(r) for r in reports]
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve reports")

@app.get("/beach-reports/{report_id}", response_model=schemas.BeachReportResponse)
def get_beach_report(report_id: int):
    report = database.get_beach_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return beach_report_to_response(report)

@app.put("/beach-reports/{report_id}", response_model=schemas.BeachReportResponse)
def update_beach_report(report_id: int, update: schemas.BeachReportCreate, current_user=Depends(auth.get_current_user)):
    existing = database.get_beach_report_by_id(report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Report not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    errors = beach_quality.validate_beach_report_data(
        update.water_quality, update.pollution_level,
        update.wildlife_activity, update.water_temp
    )
    if errors:
        raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
    
    if not database.update_beach_report(report_id, **update.dict()):
        raise HTTPException(status_code=500, detail="Failed to update")
    return beach_report_to_response(database.get_beach_report_by_id(report_id))

@app.delete("/beach-reports/{report_id}")
def delete_beach_report(report_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_beach_report_by_id(report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Report not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not database.delete_beach_report(report_id):
        raise HTTPException(status_code=500, detail="Failed to delete")
    return {"message": "Report deleted"}

# CONSERVATION ACTIONS ENDPOINTS
@app.post("/conservation-actions", response_model=schemas.ConservationActionResponse)
def create_conservation_action(action: schemas.ConservationActionCreate, current_user=Depends(auth.get_current_user)):
    try:
        from conservation_impact import validate_conservation_action, calculate_impact_score
        
        errors = validate_conservation_action(
            action.action_type, action.participants, action.waste_collected,
            action.area_covered, action.duration_hours
        )
        if errors:
            raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
        
        impact_data = calculate_impact_score(
            action.action_type, action.participants, action.waste_collected,
            action.area_covered, action.duration_hours
        )
        
        action_dict = action.dict()
        action_dict["impact_score"] = impact_data["impact_score"]
        action_id = database.create_conservation_action(user_id=current_user[0], **action_dict)
        
        new_action = database.get_conservation_action_by_id(action_id)
        if not new_action:
            raise HTTPException(status_code=500, detail="Failed to create action")
        return conservation_action_to_response(new_action)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conservation action")

@app.get("/conservation-actions", response_model=List[schemas.ConservationActionResponse])
def get_conservation_actions(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    try:
        actions = database.get_user_conservation_actions(user_id) if user_id else database.get_all_conservation_actions(limit, offset)
        return [conservation_action_to_response(a) for a in actions]
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve actions")

@app.get("/conservation-actions/{action_id}", response_model=schemas.ConservationActionResponse)
def get_conservation_action(action_id: int):
    action = database.get_conservation_action_by_id(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return conservation_action_to_response(action)

@app.put("/conservation-actions/{action_id}", response_model=schemas.ConservationActionResponse)
def update_conservation_action(action_id: int, update: schemas.ConservationActionCreate, current_user=Depends(auth.get_current_user)):
    from conservation_impact import validate_conservation_action, calculate_impact_score
    
    existing = database.get_conservation_action_by_id(action_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Action not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    errors = validate_conservation_action(
        update.action_type, update.participants, update.waste_collected,
        update.area_covered, update.duration_hours
    )
    if errors:
        raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
    
    impact_data = calculate_impact_score(
        update.action_type, update.participants, update.waste_collected,
        update.area_covered, update.duration_hours
    )
    
    action_dict = update.dict()
    action_dict["impact_score"] = impact_data["impact_score"]
    if not database.update_conservation_action(action_id, **action_dict):
        raise HTTPException(status_code=500, detail="Failed to update")
    return conservation_action_to_response(database.get_conservation_action_by_id(action_id))

@app.delete("/conservation-actions/{action_id}")
def delete_conservation_action(action_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_conservation_action_by_id(action_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Action not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not database.delete_conservation_action(action_id):
        raise HTTPException(status_code=500, detail="Failed to delete")
    return {"message": "Action deleted"}

# OCEAN DATA ENDPOINTS
@app.get("/ocean-data/tides/{station_id}")
def get_tide_data(station_id: str, days: int = 1):
    if days < 1 or days > 30:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 30")
    
    tide_data = ocean_data.get_tide_data(station_id, days=days)
    if "error" in tide_data:
        raise HTTPException(status_code=404, detail=tide_data["error"])
    return tide_data

@app.get("/ocean-data/marine-weather")
def get_marine_weather(latitude: float, longitude: float, days: int = 3):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    weather_data = ocean_data.get_marine_weather(latitude, longitude, days=days)
    if "error" in weather_data:
        raise HTTPException(status_code=503, detail=f"Weather service error: {weather_data['error']}")
    return weather_data

@app.get("/ocean-data/water-temperature")
def get_water_temperature(latitude: float, longitude: float, days: int = 7):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    temp_data = ocean_data.get_water_temperature(latitude, longitude, days=days)
    if "error" in temp_data:
        raise HTTPException(status_code=503, detail=f"Temperature service error: {temp_data['error']}")
    return temp_data

@app.get("/ocean-data/conditions")
def get_ocean_conditions(location_name: str, latitude: float, longitude: float, days: int = 3):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    conditions = ocean_data.get_ocean_conditions_for_location(
        location_name, latitude, longitude, days
    )
    if "error" in conditions:
        raise HTTPException(status_code=503, detail=conditions["error"])
    return conditions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)