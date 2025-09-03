from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

# USER SCHEMAS
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    location: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    location: Optional[str] = None
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

#MARINE SIGHTINGS SCHEMAS
class MarineSightingCreate(BaseModel):
    species_name: str
    species_type: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date_spotted: date
    time_spotted: Optional[str] = None
    group_size: Optional[int] = 1
    behavior: Optional[str] = None
    notes: Optional[str] = None


class MarineSightingResponse(BaseModel):
    id: int
    species_name: str
    species_type: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date_spotted: date
    time_spotted: Optional[str] = None
    group_size: int
    behavior: Optional[str] = None
    notes: Optional[str] = None
    verified: bool
    created_at: str
    user_name: Optional[str] = None

# BEACH REPORT SCHEMAS
class BeachReportCreate(BaseModel):
    beach_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_quality: int  # 1-5 scale 
    pollution_level: int  # 1-5 scale 
    water_temp: Optional[float] = None  # Celsius
    wildlife_activity: Optional[str] = None  # "high", "medium", "low", "none"
    weather_conditions: Optional[str] = None
    notes: Optional[str] = None
    report_date: date
    photo_url: Optional[str] = None

class BeachReportResponse(BaseModel):
    id: int
    beach_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_quality: int
    pollution_level: int
    water_temp: Optional[float] = None
    wildlife_activity: Optional[str] = None
    weather_conditions: Optional[str] = None
    notes: Optional[str] = None
    report_date: date
    photo_url: Optional[str] = None
    created_at: str
    user_name: Optional[str] = None
    quality_score: Optional[float] = None 