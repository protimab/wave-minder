import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, List

# API CONFIGS
NOAA_TIDES_BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
API_TIMEOUT = 10

# NOAA tide stations
TIDE_STATIONS = {
    # California
    "san_diego": "9410230", "la_jolla": "9410230", "santa_monica": "9410840",
    "los_angeles": "9410660", "long_beach": "9410680", "newport_beach": "9410580",
    "huntington_beach": "9410580", "santa_barbara": "9411340",
    "monterey": "9413450", "san_francisco": "9414290",
    # Pacific Northwest
    "seattle": "9447130", "portland": "9439040",
    # East Coast
    "boston": "8443970", "new_york": "8518750", "miami": "8723214"
}

def safe_api_call(url: str, params: dict, timeout: int = API_TIMEOUT) -> dict:
    """wrapper API calls w error handling"""
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return {"success": False, "error": str(e)}
    
def get_tide_data(station_id: str, date: str = None, days: int = 1) -> dict:
    """get the tide predictions from NOAA
        *station_id: NOAA station ID 
        *date: YYYYMMDD format (default: today)
        *days: number of days to retrieve (1-30)
       returns a dict with tide predictions
    """
    if not date:
        date = datetime.now().strftime("%Y%m%d")
    end_date = (datetime.strptime(date, "%Y%m%d") + timedelta(days=days)).strftime("%Y%m%d")
    
    params = {
        "product": "predictions",
        "application": "WaveMinder",
        "begin_date": date,
        "end_date": end_date,
        "datum": "MLLW",  # mean lower Low Water
        "station": station_id,
        "time_zone": "lst_ldt",  # ;ocal time
        "units": "english",
        "interval": "hilo",  # high + low tides only
        "format": "json"
    }
    
    result = safe_api_call(NOAA_TIDES_BASE_URL, params)
    if not result["success"]:
        return {"error": result["error"], "station_id": station_id}
    data = result["data"]

    if "predictions" not in data:
        return {"error": "No tide data available", "station_id": station_id}
        
    tides = [
        {
            "time": pred["t"],
            "height_feet": float(pred["v"]),
            "type": pred["type"]  # "H" = high, "L" = low
        }
        for pred in data["predictions"]
    ]
        
    return {
        "station_id": station_id,
        "tides": tides,
        "units": "feet",
        "datum": "MLLW"
    }
        
# MARINE WEATHER 
def get_marine_weather(latitude: float, longitude: float, days: int = 3) -> dict:
    """ get marine weather forecast
        returns dict with marine weather data
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height",
        "daily": "wave_height_max,wave_direction_dominant,wave_period_max",
        "timezone": "auto",
        "forecast_days": min(days, 7)
    }
        
    result = safe_api_call(OPEN_METEO_MARINE_URL, params)
    
    if not result["success"]:
        return {"error": result["error"]}
    data = result["data"]
        
    # parse current conditions (first hourly entry)
    current_conditions = {}
    if "hourly" in data and data["hourly"]["time"]:
        current_conditions = {
            "wave_height_m": data["hourly"]["wave_height"][0],
            "wave_direction": data["hourly"]["wave_direction"][0],
            "wave_period_s": data["hourly"]["wave_period"][0],
            "wind_wave_height_m": data["hourly"]["wind_wave_height"][0],
            "swell_wave_height_m": data["hourly"]["swell_wave_height"][0],
            "timestamp": data["hourly"]["time"][0]
        }
        
    # parse the daily forecast
    daily_forecast = []
    if "daily" in data:
        for i in range(len(data["daily"]["time"])):
            daily_forecast.append({
                "date": data["daily"]["time"][i],
                "max_wave_height_m": data["daily"]["wave_height_max"][i],
                "dominant_wave_direction": data["daily"]["wave_direction_dominant"][i],
                "max_wave_period_s": data["daily"]["wave_period_max"][i]
            })
    
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "current_conditions": current_conditions,
        "daily_forecast": daily_forecast,
        "units": "metric"
    }

# WATER TEMPERATURE 
def get_water_temperature(latitude: float, longitude: float, days: int = 7) -> dict:
    """ get ocean water temperature data
    return dict with water temperature data """

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "ocean_surface_temperature_mean,ocean_surface_temperature_max,ocean_surface_temperature_min",
        "timezone": "auto",
        "forecast_days": min(days, 7)
    }
        
    result = safe_api_call(OPEN_METEO_MARINE_URL, params)
    
    if not result["success"]:
        return {"error": result["error"]}
    data = result["data"]
        
    temperature_data = []
    if "daily" in data:
        for i in range(len(data["daily"]["time"])):
            temperature_data.append({
                "date": data["daily"]["time"][i],
                "mean_temp_c": data["daily"]["ocean_surface_temperature_mean"][i],
                "max_temp_c": data["daily"]["ocean_surface_temperature_max"][i],
                "min_temp_c": data["daily"]["ocean_surface_temperature_min"][i]
            })
    
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "temperature_data": temperature_data,
        "units": "celsius"
    }
        
# LOCATION QUERIES

def find_nearest_tide_station(location_name: str) -> Optional[str]:
    """ find nearest tide station for given location
    return station ID or None """
    location_name = location_name.lower().replace(" ", "_")
    
    # exact match
    if location_name in TIDE_STATIONS:
        return TIDE_STATIONS[location_name]
    # partial match
    for key, station_id in TIDE_STATIONS.items():
        if location_name in key or key in location_name:
            return station_id
    
    return None

def get_ocean_conditions_for_location(location_name: str, latitude: float, 
                                     longitude: float, days: int = 3) -> dict:
    """ get complete ocean conditions for a location
    return dict with all the ocean data (tides, weather, temperature) """

    result = {
        "location": {"name": location_name,"latitude": latitude,"longitude": longitude},
        "timestamp": datetime.now().isoformat(),
        "data": {}
    }
        
    # get tide data if station available
    station_id = find_nearest_tide_station(location_name)
    if station_id:
        tide_data = get_tide_data(station_id, days=days)
        if "error" not in tide_data:
            result["data"]["tides"] = tide_data
    
    # get marine weather
    marine_weather = get_marine_weather(latitude, longitude, days=days)
    if "error" not in marine_weather:
        result["data"]["marine_weather"] = marine_weather
    
    # get water temp
    water_temp = get_water_temperature(latitude, longitude, days=days)
    if "error" not in water_temp:
        result["data"]["water_temperature"] = water_temp
    
    # conditions summary
    result["summary"] = generate_conditions_summary(result["data"])
    
    return result
        
def generate_conditions_summary(data: dict) -> dict:
    """summary of current ocean conditions"""
    summary = {
        "overall_rating": "unknown",
        "best_for": [],
        "warnings": []
    }
    
    try:
        # check wave conditions
        if "marine_weather" in data:
            current = data["marine_weather"].get("current_conditions", {})
            wave_height = current.get("wave_height_m", 0)
            
        conditions = [
            (0.5, "calm", ["swimming", "paddleboarding"], []),
            (1.5, "moderate", ["surfing", "kayaking"], []),
            (3.0, "active", ["experienced surfing"], ["Strong waves - be cautious!"]),
            (float('inf'), "rough", [], ["High surf conditions - experienced swimmers only"])
        ]
        
        for threshold, rating, activities, warns in conditions:
                if wave_height < threshold:
                    summary["overall_rating"] = rating
                    summary["best_for"].extend(activities)
                    summary["warnings"].extend(warns)
                    break
       
       
        # check water temp
        if "water_temperature" in data:
            temp_data = data["water_temperature"].get("temperature_data", [])
            if temp_data:
                current_temp = temp_data[0].get("mean_temp_c", 0)
                if current_temp < 15:
                    summary["warnings"].append("Cold water - wetsuit attire recommended")
                elif current_temp > 24:
                    summary["best_for"].append("warm water activities")
        
        # check tides
        if "tides" in data:
            tides = data["tides"].get("tides", [])
            if tides:
                next_tide = tides[0]
                summary["next_tide"] = {
                    "type": "high" if next_tide["type"] == "H" else "low",
                    "time": next_tide["time"],
                    "height_feet": next_tide["height_feet"]
                }
        
    except Exception as e:
        print(f"Error generating summary: {e}")
    
    return summary

# HELPER
def validate_coordinates(latitude: float, longitude: float) -> bool:
    """validate latitude and longitude"""
    return -90 <= latitude <= 90 and -180 <= longitude <= 180

def get_available_tide_stations() -> dict:
    """list of all available tide stations"""
    return {"stations": TIDE_STATIONS,"total_count": len(TIDE_STATIONS)}