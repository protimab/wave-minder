from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import database
import auth
import schemas
import ocean_data

# FASTAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_database()
    yield

app = FastAPI(title="WaveMinder", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_beach_quality(water_quality: int, pollution_level: int, wildlife_activity: str = None) -> float:
    """calculate beach quality score(1-5)"""
    base = (water_quality * 0.4) + (pollution_level * 0.5)
    wildlife_bonus = {"high": 0.5, "medium": 0.3, "low": 0.1, "none": 0}.get(wildlife_activity or "none", 0)
    return round(min(5.0, max(1.0, base + wildlife_bonus)), 2)

# HELPER FUNCTIONS - Convert DB tuples to response models
def sighting_to_response(s):
    """convert sighting tuple to response model"""
    return schemas.MarineSightingResponse(
        id=s[0], species_name=s[2], species_type=s[3], location_name=s[4],
        latitude=s[5], longitude=s[6], date_spotted=s[7], time_spotted=s[8],
        group_size=s[9], behavior=s[10], notes=s[11], created_at=str(s[12]), user_name=s[13]
    )

def beach_report_to_response(r):
    """convert beach report tuple to response model"""
    quality_score = calculate_beach_quality(r[5], r[6], r[8])
    return schemas.BeachReportResponse(
        id=r[0], beach_name=r[2], latitude=r[3], longitude=r[4],
        water_quality=r[5], pollution_level=r[6], water_temp=r[7],
        wildlife_activity=r[8], notes=r[9], report_date=r[10], created_at=str(r[11]),
        user_name=r[12], quality_score=quality_score
    )

def conservation_to_response(a):
    """convert conservation action tuple to response model"""
    return schemas.ConservationActionResponse(
        id=a[0], action_type=a[2], title=a[3], description=a[4],
        location_name=a[5], latitude=a[6], longitude=a[7], participants=a[8],
        waste_collected=a[9], area_covered=a[10],date_completed=a[11],
        created_at=str(a[12]), user_name=a[13]
    )

# AUTH ENDPOINTS
@app.get("/")
def root():
    return {"message": "WaveMinder"}

@app.post("/signup", response_model=schemas.UserResponse)
def signup(request: schemas.UserCreate):
    if database.get_user_by_email(request.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = database.create_user(
        email=request.email,
        name=request.name,
        password=auth.get_password_hash(request.password),
        location=request.location
    )
    if not user_id:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    return schemas.UserResponse(
        id=user_id, email=request.email, name=request.name,
        location=request.location, created_at=""
    )

@app.post("/login", response_model=schemas.Token)
def login(request: schemas.UserCreate):
    user = auth.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return schemas.Token(
        access_token=auth.create_access_token(user_email=user[1]),
        token_type="bearer"
    )

@app.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user=Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user[0], email=current_user[1], name=current_user[2],
        location=current_user[4], created_at=str(current_user[5])
    )

# MARINE SIGHTINGS ENDPOINTS
@app.post("/sightings", response_model=schemas.MarineSightingResponse)
def create_sighting(sighting: schemas.MarineSightingCreate, current_user=Depends(auth.get_current_user)):
    sighting_id = database.create_marine_sighting(user_id=current_user[0], **sighting.dict())
    if not sighting_id:
        raise HTTPException(status_code=500, detail="Failed to create sighting")
    
    new_sighting = database.get_sighting_by_id(sighting_id)
    return sighting_to_response(new_sighting)

@app.get("/sightings", response_model=List[schemas.MarineSightingResponse])
def get_sightings(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    """get all sightings"""
    sightings = database.get_user_sightings(user_id) if user_id else database.get_all_sightings(limit, offset)
    return [sighting_to_response(s) for s in sightings]

@app.get("/sightings/{sighting_id}", response_model=schemas.MarineSightingResponse)
def get_sighting(sighting_id: int):
    "get all sightings for specific user ID"
    sighting = database.get_sighting_by_id(sighting_id)
    if not sighting:
        raise HTTPException(status_code=404, detail="Sighting not found")
    return sighting_to_response(sighting)

@app.delete("/sightings/{sighting_id}")
def delete_sighting(sighting_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_sighting_by_id(sighting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Sighting not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    database.delete_marine_sighting(sighting_id)
    return {"message": "Sighting deleted"}

# BEACH REPORTS ENDPOINTS
@app.post("/beach-reports", response_model=schemas.BeachReportResponse)
def create_beach_report(report: schemas.BeachReportCreate, current_user=Depends(auth.get_current_user)):
     # validate inputs
    if not (1 <= report.water_quality <= 5):
        raise HTTPException(status_code=400, detail="Water quality must be 1-5")
    if not (1 <= report.pollution_level <= 5):
        raise HTTPException(status_code=400, detail="Pollution level must be 1-5")
    if report.wildlife_activity and report.wildlife_activity.lower() not in ["high", "medium", "low", "none"]:
        raise HTTPException(status_code=400, detail="Wildlife activity must be high, medium, low, or none")
    
    report_id = database.create_beach_report(user_id=current_user[0], **report.dict())
    if not report_id:
        raise HTTPException(status_code=500, detail="Failed to create report")
    
    new_report = database.get_beach_report_by_id(report_id)
    return beach_report_to_response(new_report)

@app.get("/beach-reports", response_model=List[schemas.BeachReportResponse])
def get_beach_reports(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    reports = database.get_user_beach_reports(user_id) if user_id else database.get_all_beach_reports(limit, offset)
    return [beach_report_to_response(r) for r in reports]

@app.get("/beach-reports/{report_id}", response_model=schemas.BeachReportResponse)
def get_beach_report(report_id: int):
    report = database.get_beach_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return beach_report_to_response(report)

@app.delete("/beach-reports/{report_id}")
def delete_beach_report(report_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_beach_report_by_id(report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Report not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    database.delete_beach_report(report_id)
    return {"message": "Report deleted"}

# CONSERVATION ACTIONS ENDPOINTS
@app.post("/conservation-actions", response_model=schemas.ConservationActionResponse)
def create_conservation_action(action: schemas.ConservationActionCreate, current_user=Depends(auth.get_current_user)):
    # validate inputs
    valid_types = ["beach_cleanup", "citizen_science", "education", "restoration", "monitoring", "policy_advocacy"]
    if action.action_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Action type must be one of: {', '.join(valid_types)}")
    if action.participants < 1 or action.participants > 10000:
        raise HTTPException(status_code=400, detail="Participants must be between 1 and 10,000")
    if action.waste_collected < 0 or action.waste_collected > 10000:
        raise HTTPException(status_code=400, detail="Waste collected must be between 0 and 10,000 kg")
    if action.area_covered < 0 or action.area_covered > 1000000:
        raise HTTPException(status_code=400, detail="Area covered must be between 0 and 1,000,000 sqm") 
        
    action_id = database.create_conservation_action(user_id=current_user[0], **action.dict())
    if not action_id:
        raise HTTPException(status_code=500, detail="Failed to create action")
    new_action = database.get_conservation_action_by_id(action_id)
    return conservation_to_response(new_action)

@app.get("/conservation-actions", response_model=List[schemas.ConservationActionResponse])
def get_conservation_actions(limit: int = 50, offset: int = 0, user_id: Optional[int] = None):
    actions = database.get_user_conservation_actions(user_id) if user_id else database.get_all_conservation_actions(limit, offset)
    return [conservation_to_response(a) for a in actions]
   
@app.get("/conservation-actions/{action_id}", response_model=schemas.ConservationActionResponse)
def get_conservation_action(action_id: int):
    action = database.get_conservation_action_by_id(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return conservation_to_response(action)

@app.delete("/conservation-actions/{action_id}")
def delete_conservation_action(action_id: int, current_user=Depends(auth.get_current_user)):
    existing = database.get_conservation_action_by_id(action_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Action not found")
    if existing[1] != current_user[0]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    database.delete_conservation_action(action_id)
    return {"message": "Action deleted"}

# OCEAN DATA ENDPOINTS
@app.get("/ocean-data/tides/{station_id}")
def get_tide_data(station_id: str, days: int = 1):
    if days < 1 or days > 30:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 30")
    
    tide_data = ocean_data.get_tide_data(station_id, days)
    if "error" in tide_data:
        raise HTTPException(status_code=404, detail=tide_data["error"])
    return tide_data

@app.get("/ocean-data/weather")
def get_marine_weather(latitude: float, longitude: float, days: int = 3):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    weather_data = ocean_data.get_marine_weather(latitude, longitude, days)
    if "error" in weather_data:
        raise HTTPException(status_code=503, detail=weather_data["error"])
    return weather_data

@app.get("/ocean-data/temperature")
def get_water_temperature(latitude: float, longitude: float, days: int = 7):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    temp_data = ocean_data.get_water_temperature(latitude, longitude, days)
    if "error" in temp_data:
        raise HTTPException(status_code=503, detail=temp_data["error"])
    return temp_data

@app.get("/ocean-data/conditions")
def get_ocean_conditions(location_name: str, latitude: float, longitude: float, days: int = 3):
    if not ocean_data.validate_coordinates(latitude, longitude):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    if days < 1 or days > 7:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 7")
    
    conditions = ocean_data.get_ocean_conditions(location_name, latitude, longitude, days)
    return conditions

# COMMUNITY STATS
@app.get("/stats/community")
def get_community_stats():
    return database.get_community_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)