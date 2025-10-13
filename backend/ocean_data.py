import requests
from datetime import datetime, timedelta
from typing import Optional

# API CONFIGS
NOAA_TIDES_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
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
    end_date = (datetime.now() + timedelta(days=days)).strftime("%Y%m%d")
    
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
    
    result = safe_api_call(NOAA_TIDES_URL, params)
    if not result["success"] or "predictions" not in result["data"]:
        return {"error": "No tide data available", "station_id": station_id}
    data = result["data"]
        
    tides = [
        {
            "time": pred["t"],
            "height_feet": float(pred["v"]),
            "type": "high" if pred["type"] == "H" else "low"
        }
        for pred in data["predictions"]
    ]
        
    return {"station_id": station_id, "tides": tides, "units": "feet", "datum": "MLLW"}
        
# MARINE WEATHER 
def get_marine_weather(latitude: float, longitude: float, days: int = 3) -> dict:
    """ get marine weather forecast
        returns dict with marine weather data
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "wave_height,wave_direction,wave_period",
        "daily": "wave_height_max,wave_direction_dominant",
        "timezone": "auto",
        "forecast_days": min(days, 7)
    }
        
    result = safe_api_call(OPEN_METEO_MARINE_URL, params)
    
    if not result["success"]:
        return {"error": result["error"]}
    data = result["data"]
        
    # parse current conditions (first hourly entry)
    current = {}
    if "hourly" in data and data["hourly"]["time"]:
        current = {
            "wave_height_m": data["hourly"]["wave_height"][0],
            "wave_direction": data["hourly"]["wave_direction"][0],
            "wave_period_s": data["hourly"]["wave_period"][0],
            "wind_wave_height_m": data["hourly"]["wind_wave_height"][0],
            "swell_wave_height_m": data["hourly"]["swell_wave_height"][0],
            "timestamp": data["hourly"]["time"][0]
        }
        
    # parse the daily forecast
    daily  = []
    if "daily" in data:
        for i in range(len(data["daily"]["time"])):
            daily.append({
                "date": data["daily"]["time"][i],
                "max_wave_height_m": data["daily"]["wave_height_max"][i],
                "dominant_direction": data["daily"]["wave_direction_dominant"][i],
            })
    
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "current": current,
        "forecast": daily,
    }

# WATER TEMPERATURE 
def get_water_temperature(latitude: float, longitude: float, days: int = 7) -> dict:
    """ get ocean water temperature data
    return dict with water temperature data """

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "ocean_surface_temperature_mean",
        "timezone": "auto",
        "forecast_days": min(days, 7)
    }
        
    result = safe_api_call(OPEN_METEO_MARINE_URL, params)
    
    if not result["success"]:
        return {"error": result["error"]}
    data = result["data"]
        
    temps = []
    if "daily" in data:
        for i in range(len(data["daily"]["time"])):
            temps.append({
                "date": data["daily"]["time"][i],
                "temp_c": data["daily"]["ocean_surface_temperature_mean"][i],
            })
    
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "temperature_data": temps,
    }
        
# LOCATION QUERIES
def find_tide_station(location_name: str) -> Optional[str]:
    """ find tide station for given location
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

def get_ocean_conditions(location_name: str, latitude: float, 
                                     longitude: float, days: int = 3) -> dict:
    """ get complete ocean conditions for a location
    return dict with all the ocean data (tides, weather, temperature) """

    result = {
        "location": {"name": location_name,"latitude": latitude,"longitude": longitude},
        "timestamp": datetime.now().isoformat(),
        "data": {}
    }
        
    # get tide data if station available
    station_id = find_tide_station(location_name)
    if station_id:
        tide_data = get_tide_data(station_id, days)
        if "error" not in tide_data:
            result["data"]["tides"] = tide_data
    
    # get marine weather
    weather = get_marine_weather(latitude, longitude, days)
    if "error" not in weather:
        result["data"]["weather"] = weather
    
    # get water temp
    temp = get_water_temperature(latitude, longitude, days)
    if "error" not in temp:
        result["data"]["temperature"] = temp
    
    return result

# HELPER
def validate_coordinates(latitude: float, longitude: float) -> bool:
    """validate latitude and longitude"""
    return -90 <= latitude <= 90 and -180 <= longitude <= 180

