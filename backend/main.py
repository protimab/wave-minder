from typing import List
from fastapi import FastAPI,HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
import auth
import schemas
import backend.beach_quality as beach_quality

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
    current_user=Depends(auth.get_current_user) #ensure user logged in
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

# CREATE BEACH REPORT
@app.post("/beach-reports", response_model=schemas.BeachReportResponse)
def create_beach_report(
    report: schemas.BeachReportCreate,
    current_user=Depends(auth.get_current_user)
):
    """Create a new beach report"""
    try:
        # validate report data
        from beach_quality import validate_beach_report_data, calculate_beach_quality_score
        
        errors = validate_beach_report_data(
            report.water_quality, 
            report.pollution_level,
            report.wildlife_activity,
            report.water_temp
        )
        
        if errors:
            raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
        
        # create report
        report_id = database.create_beach_report(
            user_id=current_user[0],
            beach_name=report.beach_name,
            latitude=report.latitude,
            longitude=report.longitude,
            water_quality=report.water_quality,
            pollution_level=report.pollution_level,
            water_temp=report.water_temp,
            wildlife_activity=report.wildlife_activity,
            weather_conditions=report.weather_conditions,
            notes=report.notes,
            photo_url=report.photo_url,
            report_date=report.report_date
        )
        
        if not report_id:
            raise HTTPException(status_code=500, detail="Failed to create beach report")
        
        # get created report
        new_report = database.get_beach_report_by_id(report_id)
        if not new_report:
            raise HTTPException(status_code=500, detail="Failed to retrieve created report")
        
        # calculate quality score
        quality_data = calculate_beach_quality_score(
            new_report[4],  # water_quality
            new_report[5],  # pollution_level
            new_report[7]   # wildlife_activity
        )
        
        return schemas.BeachReportResponse(
            id=new_report[0],
            beach_name=new_report[2],
            latitude=new_report[3],
            longitude=new_report[4],
            water_quality=new_report[5],
            pollution_level=new_report[6],
            water_temp=new_report[7],
            wildlife_activity=new_report[8],
            weather_conditions=new_report[9],
            notes=new_report[11],
            photo_url=new_report[10],
            report_date=new_report[12],
            created_at=str(new_report[13]),
            user_name=new_report[14],
            quality_score=quality_data["score"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating beach report: {e}")
        raise HTTPException(status_code=500, detail="Failed to create beach report")

# GET ALL BEACH REPORTS
@app.get("/beach-reports", response_model=List[schemas.BeachReportResponse])
def get_all_beach_reports(limit: int = 50, offset: int = 0):
    """Get all beach reports within page"""
    try:
        from beach_quality import calculate_beach_quality_score
        
        reports = database.get_all_beach_reports(limit=limit, offset=offset)
        result = []
        
        for report in reports:
            # calculate quality score for each report
            quality_data = calculate_beach_quality_score(
                report[5],  # water_quality
                report[6],  # pollution_level  
                report[8]   # wildlife_activity
            )
            
            result.append(schemas.BeachReportResponse(
                id=report[0],
                beach_name=report[2],
                latitude=report[3],
                longitude=report[4],
                water_quality=report[5],
                pollution_level=report[6],
                water_temp=report[7],
                wildlife_activity=report[8],
                weather_conditions=report[9],
                notes=report[11],
                photo_url=report[10],
                report_date=report[12],
                created_at=str(report[13]),
                user_name=report[14],
                quality_score=quality_data["score"]
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting beach reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve beach reports")

# GET USER'S BEACH REPORTS
@app.get("/my-beach-reports", response_model=List[schemas.BeachReportResponse])
def get_my_beach_reports(current_user=Depends(auth.get_current_user)):
    """Get the current user's beach reports"""
    try:
        from beach_quality import calculate_beach_quality_score
        
        reports = database.get_user_beach_reports(current_user[0])
        result = []
        
        for report in reports:
            quality_data = calculate_beach_quality_score(
                report[5],  # water_quality
                report[6],  # pollution_level
                report[8]   # wildlife_activity
            )
            
            result.append(schemas.BeachReportResponse(
                id=report[0],
                beach_name=report[2],
                latitude=report[3],
                longitude=report[4],
                water_quality=report[5],
                pollution_level=report[6],
                water_temp=report[7],
                wildlife_activity=report[8],
                weather_conditions=report[9],
                notes=report[11],
                photo_url=report[10],
                report_date=report[12],
                created_at=str(report[13]),
                user_name=current_user[2],
                quality_score=quality_data["score"]
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting user beach reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve your beach reports")

# GET SINGLE BEACH REPORT
@app.get("/beach-reports/{report_id}", response_model=schemas.BeachReportResponse)
def get_beach_report(report_id: int):
    """Get a specific beach report by a specific ID"""
    try:
        from beach_quality import calculate_beach_quality_score
        
        report = database.get_beach_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Beach report not found")
        
        quality_data = calculate_beach_quality_score(
            report[5],  # water_quality
            report[6],  # pollution_level
            report[8]   # wildlife_activity
        )
        
        return schemas.BeachReportResponse(
            id=report[0],
            beach_name=report[2],
            latitude=report[3],
            longitude=report[4],
            water_quality=report[5],
            pollution_level=report[6],
            water_temp=report[7],
            wildlife_activity=report[8],
            weather_conditions=report[9],
            notes=report[11],
            photo_url=report[10],
            report_date=report[12],
            created_at=str(report[13]),
            user_name=report[14],
            quality_score=quality_data["score"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting beach report: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve beach report")

# UPDATE BEACH REPORT 
@app.put("/beach-reports/{report_id}", response_model=schemas.BeachReportResponse)
def update_beach_report(
    report_id: int,
    report_update: schemas.BeachReportCreate,
    current_user=Depends(auth.get_current_user)
):
    """Update a beach report -> only by oenrt"""
    try:
        from beach_quality import validate_beach_report_data, calculate_beach_quality_score
        
        # check if report exists + belongs to current user
        existing_report = database.get_beach_report_by_id(report_id)
        if not existing_report:
            raise HTTPException(status_code=404, detail="Beach report not found")
        
        if existing_report[1] != current_user[0]:  # user_id check
            raise HTTPException(status_code=403, detail="Not authorized to update this report")
        
        # validate updated data
        errors = validate_beach_report_data(
            report_update.water_quality,
            report_update.pollution_level,
            report_update.wildlife_activity,
            report_update.water_temp
        )
        
        if errors:
            raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
        
        # update report
        success = database.update_beach_report(
            report_id=report_id,
            beach_name=report_update.beach_name,
            latitude=report_update.latitude,
            longitude=report_update.longitude,
            water_quality=report_update.water_quality,
            pollution_level=report_update.pollution_level,
            water_temp=report_update.water_temp,
            wildlife_activity=report_update.wildlife_activity,
            weather_conditions=report_update.weather_conditions,
            notes=report_update.notes,
            photo_url=report_update.photo_url,
            report_date=report_update.report_date
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update beach report")
        
        # return
        updated_report = database.get_beach_report_by_id(report_id)
        quality_data = calculate_beach_quality_score(
            updated_report[5],
            updated_report[6],
            updated_report[8]
        )
        
        return schemas.BeachReportResponse(
            id=updated_report[0],
            beach_name=updated_report[2],
            latitude=updated_report[3],
            longitude=updated_report[4],
            water_quality=updated_report[5],
            pollution_level=updated_report[6],
            water_temp=updated_report[7],
            wildlife_activity=updated_report[8],
            weather_conditions=updated_report[9],
            notes=updated_report[11],
            photo_url=updated_report[10],
            report_date=updated_report[12],
            created_at=str(updated_report[13]),
            user_name=updated_report[14],
            quality_score=quality_data["score"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating beach report: {e}")
        raise HTTPException(status_code=500, detail="Failed to update beach report")

# DELETE BEACH REPORT
@app.delete("/beach-reports/{report_id}")
def delete_beach_report(
    report_id: int,
    current_user=Depends(auth.get_current_user)
):
    """Delete a beach report -> only owner"""
    try:
        # Check if report exists + belongs to current user
        existing_report = database.get_beach_report_by_id(report_id)
        if not existing_report:
            raise HTTPException(status_code=404, detail="Beach report not found")
        
        if existing_report[1] != current_user[0]:  # user_id check
            raise HTTPException(status_code=403, detail="Not authorized to delete this report")
        
        # Delete the report
        success = database.delete_beach_report(report_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete beach report")
        
        return {"message": "Beach report deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting beach report: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete beach report")

# GET BEACH REPORTS BY A LOCATION
@app.get("/beach-reports/location/{beach_name}")
def get_beach_reports_by_location(beach_name: str, limit: int = 20):
    """Get beach reports by the loction name"""
    try:
        from beach_quality import calculate_beach_quality_score
        
        reports = database.get_beach_reports_by_location(beach_name, limit)
        result = []
        
        for report in reports:
            quality_data = calculate_beach_quality_score(
                report[5],  # water_quality
                report[6],  # pollution_level
                report[8]   # wildlife_activity
            )
            
            result.append(schemas.BeachReportResponse(
                id=report[0],
                beach_name=report[2],
                latitude=report[3],
                longitude=report[4],
                water_quality=report[5],
                pollution_level=report[6],
                water_temp=report[7],
                wildlife_activity=report[8],
                weather_conditions=report[9],
                notes=report[11],
                photo_url=report[10],
                report_date=report[12],
                created_at=str(report[13]),
                user_name=report[14],
                quality_score=quality_data["score"]
            ))
        
        return result
        
    except Exception as e:
        print(f"Error getting beach reports by location: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve beach reports by location")

# BEACH CONDITION TRENDS ANALYSIS
@app.get("/beach-reports/trends/{beach_name}")
def get_beach_condition_trends(beach_name: str, days: int = 30):
    """Get beach condition trends over time for the analysis"""
    try:
        from beach_quality import calculate_beach_quality_score, WATER_QUALITY_LABELS, POLLUTION_LABELS
        
        # check days
        if days < 1 or days > 365:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
        
        trends_data = database.get_beach_condition_trends(beach_name, days)
        
        if not trends_data:
            return {
                "beach_name": beach_name,
                "analysis_period_days": days,
                "total_reports": 0,
                "message": "No reports found for this beach in this period"
            }
        
        # calc trend stats
        water_qualities = [row[1] for row in trends_data]  # water_quality values
        pollution_levels = [row[2] for row in trends_data]  # pollution_level values
        water_temps = [row[4] for row in trends_data if row[4] is not None]  # water_temp values
        
        # calc quality scores for each value
        quality_scores = []
        for row in trends_data:
            quality_data = calculate_beach_quality_score(row[1], row[2], row[3])
            quality_scores.append(quality_data["score"])
        
        # calc avg. + trends
        avg_water_quality = sum(water_qualities) / len(water_qualities)
        avg_pollution_level = sum(pollution_levels) / len(pollution_levels)
        avg_quality_score = sum(quality_scores) / len(quality_scores)
        avg_water_temp = sum(water_temps) / len(water_temps) if water_temps else None
        
        # determine overall trend (compare first half vs second half of data)
        mid_point = len(quality_scores) // 2
        if mid_point > 0:
            first_half_avg = sum(quality_scores[:mid_point]) / mid_point
            second_half_avg = sum(quality_scores[mid_point:]) / (len(quality_scores) - mid_point)
            
            if second_half_avg > first_half_avg + 0.2:
                trend_direction = "improving"
            elif second_half_avg < first_half_avg - 0.2:
                trend_direction = "declining"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "insufficient_data"
        
        # create trend analysis
        analysis = {
            "beach_name": beach_name,
            "analysis_period_days": days,
            "total_reports": len(trends_data),
            "date_range": {
                "from": trends_data[-1][0] if trends_data else None,  # oldest report
                "to": trends_data[0][0] if trends_data else None      # newest report
            },
            "averages": {
                "water_quality": round(avg_water_quality, 2),
                "water_quality_label": WATER_QUALITY_LABELS.get(round(avg_water_quality)),
                "pollution_level": round(avg_pollution_level, 2),
                "pollution_label": POLLUTION_LABELS.get(round(avg_pollution_level)),
                "overall_quality_score": round(avg_quality_score, 2),
                "water_temperature_celsius": round(avg_water_temp, 1) if avg_water_temp else None
            },
            "trend": {
                "direction": trend_direction,
                "quality_change": round(second_half_avg - first_half_avg, 2) if mid_point > 0 else 0
            },
            "data_points": [
                {
                    "date": row[0],
                    "water_quality": row[1],
                    "pollution_level": row[2],
                    "wildlife_activity": row[3],
                    "water_temp": row[4],
                    "quality_score": round(quality_scores[i], 2)
                } for i, row in enumerate(trends_data)
            ]
        }
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing beach trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze beach condition trends")

# BEACH QUALITY SUMMARY (get the overall stats for a beach)
@app.get("/beach-reports/summary/{beach_name}")
def get_beach_quality_summary(beach_name: str):
    """Get a summary of beach quality"""
    try:
        from beach_quality import calculate_beach_quality_score, WATER_QUALITY_LABELS, POLLUTION_LABELS
        
        # get recent reports (in last 90 days)
        recent_reports = database.get_beach_condition_trends(beach_name, 90)
        
        if not recent_reports:
            raise HTTPException(status_code=404, detail="No reports found for this beach")
        
        # calc summary statistics
        total_reports = len(recent_reports)
        water_qualities = [row[1] for row in recent_reports]
        pollution_levels = [row[2] for row in recent_reports]
        
        # count wildlife activity levels
        wildlife_counts = {"high": 0, "medium": 0, "low": 0, "none": 0, "unknown": 0}
        for row in recent_reports:
            activity = row[3].lower() if row[3] else "unknown"
            if activity in wildlife_counts:
                wildlife_counts[activity] += 1
            else:
                wildlife_counts["unknown"] += 1
        
        # calc overall quality scores
        quality_scores = []
        for row in recent_reports:
            quality_data = calculate_beach_quality_score(row[1], row[2], row[3])
            quality_scores.append(quality_data["score"])
        
        avg_quality_score = sum(quality_scores) / len(quality_scores)
        
        # determine overall grade
        if avg_quality_score >= 4.5:
            overall_grade = "A+"
        elif avg_quality_score >= 4.0:
            overall_grade = "A"
        elif avg_quality_score >= 3.5:
            overall_grade = "B+"
        elif avg_quality_score >= 3.0:
            overall_grade = "B"
        elif avg_quality_score >= 2.5:
            overall_grade = "C"
        else:
            overall_grade = "D"
        
        return {
            "beach_name": beach_name,
            "report_period": "Last 90 days",
            "total_reports": total_reports,
            "overall_quality_score": round(avg_quality_score, 2),
            "overall_grade": overall_grade,
            "average_water_quality": round(sum(water_qualities) / len(water_qualities), 1),
            "average_pollution_level": round(sum(pollution_levels) / len(pollution_levels), 1),
            "wildlife_activity_distribution": wildlife_counts,
            "latest_report_date": recent_reports[0][0] if recent_reports else None,
            "recommendations": generate_beach_recommendations(avg_quality_score, water_qualities, pollution_levels)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting beach summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get beach quality summary")

# helper function for recs
def generate_beach_recommendations(avg_score: float, water_qualities: list, pollution_levels: list):
    """Generate recs based on beach conditions"""
    recommendations = []
    
    avg_water_quality = sum(water_qualities) / len(water_qualities)
    avg_pollution = sum(pollution_levels) / len(pollution_levels)
    
    if avg_score >= 4.0:
        recommendations.append("Wonderful conditions for swimming and water activities!")
    elif avg_score >= 3.0:
        recommendations.append("Good conditions for most beach activities.")
    else:
        recommendations.append("Exercise caution - consider water quality before swimming.")
    
    if avg_water_quality < 3.0:
        recommendations.append("Water quality concerns - check recent reports before swimming.")
    
    if avg_pollution < 3.0:
        recommendations.append("High pollution levels reported - consider beach cleanup participation!")
    
    if avg_pollution >= 4.0 and avg_water_quality >= 4.0:
        recommendations.append(" Great conditions for marine wildlife observation.")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)