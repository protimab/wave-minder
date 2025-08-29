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