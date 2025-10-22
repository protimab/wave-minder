# WaveMinder
Welcome to my marine conservation platform :

📍 **Core Features**:  

  🐳 Marine Wildlife Sightings - Users report dolphin, whale, turtle sightings with photos


  🏝️ Beach Condition Reports - Water quality, pollution levels, cleanup events 

  
  📈 Ocean Data Dashboard - Real-time marine weather, temperatures, tides 

  
  📖 Conservation Actions - Beach cleanups, education, participation 

  
  🗺️ Community Impact Map - Visual representation of all conservation activities


🔧 **Technology Stack** 
   
    Backend: FastAPI, SQLite/SQL, JWT Authentication, Pillow, Requests
    Frontend: React, Leaflet, Chart.js
    External APIs: Marine Weather API (https://open-meteo.com/en/docs/marine-weather-api), Tide API (https://www.worldtides.info/apidocs), Species Database API (https://techdocs.gbif.org/en/openapi/v1/species)
    

## Backend Setup

### 1. Create Python Virtual Environment

```
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```
### 2. Install Dependencies
```
pip install -r requirements.txt
```

### 3. Initialize Database (create all required tables)
```
python database.py
```

### 4. Start Backend Server
```
python main.py
# Or
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

## Frontend Setup

### 1. Install Node Dependencies
```
cd frontend
npm install
```

### 2. Start Development Server
```
npm start
```

## Access Application

- **Frontend:** http://localhost:3000

- **Backend API:** http://localhost:8000
  
- **API Docs:** http://localhost:8000/docs


