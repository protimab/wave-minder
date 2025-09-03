from typing import List
from fastapi import FastAPI,HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
import auth
import schemas

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

# ROOT ENDPOINT
@app.get("/")
def root():
    return {"message": "WaveMinder"}

# SIGNUP ENDPOINT
@app.post("/signup", response_model=schemas.UserResponse)
def signup(request: schemas.UserCreate):
    existing_user = database.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # hash password
    hashed_password = auth.get_password_hash(request.password)

    # creater user in database
    user_id = database.create_user(
        email=request.email,
        name=request.name,
        password=hashed_password,
        location=request.location
    )

    return schemas.UserResponse(
        id=user_id,
        email=request.email,
        name=request.name,
        location=request.location,
        created_at=""  
    )


# LOGIN ENDPOINT
@app.post("/login", response_model=schemas.Token)
def login(request: schemas.UserCreate):
    user = auth.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(user_email=user[1])  # index 1 -> email
    return schemas.Token(access_token=access_token, token_type="bearer")

# PROTECTED ENDPOINT
@app.get("/me", response_model=schemas.UserResponse)
def read_me(current_user=Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user[0],
        email=current_user[1],
        name=current_user[2],
        location=current_user[4],
        created_at=str(current_user[6])
    )

# CREATE MARINE SIGHTINGS
@app.post("/sightings", response_model=schemas.MarineSightingResponse)
def create_marine_sighting(
    sighting: schemas.MarineSightingCreate,
    current_user=Depends(auth.get_current_user)
):
    try:
        sighting_id = database.create_marine_sighting(
            user_id=current_user[0],  # user ID 
            species_name=sighting.species_name,
            species_type=sighting.species_type,
            location_name=sighting.location_name,
            latitude=sighting.latitude,
            longitude=sighting.longitude,
            date_spotted=sighting.date_spotted,
            time_spotted=sighting.time_spotted,
            group_size=sighting.group_size,
            behavior=sighting.behavior,
            notes=sighting.notes
        )
        
        new_sighting = database.get_sighting_by_id(sighting_id)
        if not new_sighting:
            raise HTTPException(status_code=500, detail="Failed to create sighting")
        
        return schemas.MarineSightingResponse(
            id=new_sighting[0],
            species_name=new_sighting[2],
            species_type=new_sighting[3],
            location_name=new_sighting[4],
            latitude=new_sighting[5],
            longitude=new_sighting[6],
            date_spotted=new_sighting[7],
            time_spotted=new_sighting[8],
            group_size=new_sighting[9],
            behavior=new_sighting[10],
            notes=new_sighting[12],
            verified=bool(new_sighting[13]),
            created_at=str(new_sighting[14]),
            user_name=new_sighting[15]
        )
        
    except Exception as e:
        print(f"Error creating sighting: {e}")
        raise HTTPException(status_code=500, detail="Failed to create marine sighting")


# GET ALL SIGHTINGS 
@app.get("/sightings", response_model=List[schemas.MarineSightingResponse])
def get_all_sightings(limit: int = 50, offset: int = 0):
    """Get all marine sightings with page"""
    try:
        sightings = database.get_all_sightings(limit=limit, offset=offset)
        result = []
        
        for sighting in sightings:
            result.append(schemas.MarineSightingResponse(
                id=sighting[0],
                species_name=sighting[2],
                species_type=sighting[3],
                location_name=sighting[4],
                latitude=sighting[5],
                longitude=sighting[6],
                date_spotted=sighting[7],
                time_spotted=sighting[8],
                group_size=sighting[9],
                behavior=sighting[10],
                notes=sighting[12],
                verified=bool(sighting[13]),
                created_at=str(sighting[14]),
                user_name=sighting[15]
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting sightings: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sightings")

# GET USER'S SIGHTINGS
@app.get("/my-sightings", response_model=List[schemas.MarineSightingResponse])
def get_my_sightings(current_user=Depends(auth.get_current_user)):
    """Get user's marine sightings"""
    try:
        sightings = database.get_user_sightings(current_user[0])
        result = []
        
        for sighting in sightings:
            result.append(schemas.MarineSightingResponse(
                id=sighting[0],
                species_name=sighting[2],
                species_type=sighting[3],
                location_name=sighting[4],
                latitude=sighting[5],
                longitude=sighting[6],
                date_spotted=sighting[7],
                time_spotted=sighting[8],
                group_size=sighting[9],
                behavior=sighting[10],
                notes=sighting[12],
                verified=bool(sighting[13]),
                created_at=str(sighting[14]),
                user_name=current_user[2]  # current user name
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting user sightings: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve your sightings")

# GET SINGLE SIGHTING BY ID
@app.get("/sightings/{sighting_id}", response_model=schemas.MarineSightingResponse)
def get_sighting(sighting_id: int):
    """Get a marine sighting by its ID"""
    try:
        sighting = database.get_sighting_by_id(sighting_id)
        if not sighting:
            raise HTTPException(status_code=404, detail="Sighting not found")
        
        return schemas.MarineSightingResponse(
            id=sighting[0],
            species_name=sighting[2],
            species_type=sighting[3],
            location_name=sighting[4],
            latitude=sighting[5],
            longitude=sighting[6],
            date_spotted=sighting[7],
            time_spotted=sighting[8],
            group_size=sighting[9],
            behavior=sighting[10],
            notes=sighting[12],
            verified=bool(sighting[13]),
            created_at=str(sighting[14]),
            user_name=sighting[15]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting sighting: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sighting")

# UPDATE SIGHTING (Only by owner)
@app.put("/sightings/{sighting_id}", response_model=schemas.MarineSightingResponse)
def update_sighting(
    sighting_id: int,
    sighting_update: schemas.MarineSightingCreate,
    current_user=Depends(auth.get_current_user)
):
    """Update a marine sighting -> only allowed by user who made it"""
    try:
        # check if sighting exists + belongs to current user
        existing_sighting = database.get_sighting_by_id(sighting_id)
        if not existing_sighting:
            raise HTTPException(status_code=404, detail="Sighting not found")
        
        if existing_sighting[1] != current_user[0]:  # user_id check
            raise HTTPException(status_code=403, detail=" You are not authorized to update this sighting")
        
        # update the sighting
        success = database.update_marine_sighting(
            sighting_id=sighting_id,
            species_name=sighting_update.species_name,
            species_type=sighting_update.species_type,
            location_name=sighting_update.location_name,
            latitude=sighting_update.latitude,
            longitude=sighting_update.longitude,
            date_spotted=sighting_update.date_spotted,
            time_spotted=sighting_update.time_spotted,
            group_size=sighting_update.group_size,
            behavior=sighting_update.behavior,
            notes=sighting_update.notes
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update sighting")
        
        # return updated sighting
        updated_sighting = database.get_sighting_by_id(sighting_id)
        return schemas.MarineSightingResponse(
            id=updated_sighting[0],
            species_name=updated_sighting[2],
            species_type=updated_sighting[3],
            location_name=updated_sighting[4],
            latitude=updated_sighting[5],
            longitude=updated_sighting[6],
            date_spotted=updated_sighting[7],
            time_spotted=updated_sighting[8],
            group_size=updated_sighting[9],
            behavior=updated_sighting[10],
            notes=updated_sighting[12],
            verified=bool(updated_sighting[13]),
            created_at=str(updated_sighting[14]),
            user_name=updated_sighting[15]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating sighting: {e}")
        raise HTTPException(status_code=500, detail="Failed to update sighting")

# DELETE SIGHTING (Only by owner)
@app.delete("/sightings/{sighting_id}")
def delete_sighting(
    sighting_id: int,
    current_user=Depends(auth.get_current_user)
):
    """Delete a marine sighting -> only be user who created it"""
    try:
        # check if sighting exists + belongs to current user
        existing_sighting = database.get_sighting_by_id(sighting_id)
        if not existing_sighting:
            raise HTTPException(status_code=404, detail="Sighting not found")
        
        if existing_sighting[1] != current_user[0]:  # user_id check
            raise HTTPException(status_code=403, detail="You are not authorized to delete this sighting")
        
        # Delete the sighting
        success = database.delete_marine_sighting(sighting_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete sighting")
        
        return {"message": "Sighting deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting sighting: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete sighting")

# GET SIGHTINGS BY LOCATION
@app.get("/sightings/location/{location_name}")
def get_sightings_by_location(location_name: str, limit: int = 20):
    """Get sightings by location"""
    try:
        sightings = database.get_sightings_by_location(location_name, limit)
        result = []
        
        for sighting in sightings:
            result.append(schemas.MarineSightingResponse(
                id=sighting[0],
                species_name=sighting[2],
                species_type=sighting[3],
                location_name=sighting[4],
                latitude=sighting[5],
                longitude=sighting[6],
                date_spotted=sighting[7],
                time_spotted=sighting[8],
                group_size=sighting[9],
                behavior=sighting[10],
                notes=sighting[12],
                verified=bool(sighting[13]),
                created_at=str(sighting[14]),
                user_name=sighting[15]
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting sightings by location: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sightings by location")

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)