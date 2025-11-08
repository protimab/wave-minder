# 🌊 WaveMinder

WaveMinder is a comprehensive ocean conservation platform that encourages users to track marine life, monitor beach conditions, and participate in 
environmental protection efforts. Built with React and FastAPI, WaveMinder creates a community dedicated to protecting our oceans.

## 📍 Features

### 🐋 Marine Life Tracking

Documentation: Capture any encounters with whales, dolphins, sea turtles, and many other marine species. 

Jot down species type, location, group size, behavior, and observations.

Filter & Search: Easily find sightings by species type or user.


### 🏖️ Beach Monitoring

Condition Reports: Record water quality, pollution levels, temperature, and wildlife activity.

Quality Scoring: Automatic beach quality calculations based on multiple factors

### ♻️ Conservation Actions

Activity Logging: Document beach cleanups, restoration projects, and educational events.

Impact Tracking: Record participants, waste collected, and area covered.

Action Types: Support for cleanups, citizen science, education, restoration, monitoring, and advocacy.

Community Stats: View collective environmental impact.

### 📊 Analytics Dashboard

Community Metrics: Visualize total contributions across all activities.

Species Distribution: Interactive charts showing marine life diversity.

Environmental Impact: Track waste collected and areas restored.

Personal Stats: Monitor your individual contributions.

### 🌊 Live Ocean Data

Tide Predictions: Real-time tide information from NOAA stations.

Wave Conditions: Current wave height, direction, and period.

Water Temperature: Daily ocean surface temperature data.

Weather Forecasts: Marine weather conditions and forecasts.

### 🗺️ Interactive Mapping

Geographic Visualization: All sightings, reports, and actions on an interactive map

Custom Markers: Distinct icons for different activity types

Detailed Popups: View full information by clicking map markers

Filter Controls: Toggle between sightings, reports, and conservation actions


 ## 🔧 Technologies
   
  ### Backend:

  - FastAPI, SQLite, JWT 
  
  ### Frontend:

  - React, Leaflet, Recharts, Tailwind CSS
  
  ### External APIs

  - NOAA Tides & Currents: Real-time tide predictions

  - Open-Meteo Marine API: Wave conditions and water temperature

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

## Troubleshooting

### Backend Issues

- Ensure Python 3.8+ is installed
  
- Check all dependencies are installed: ``` pip list ```
  
- Verify database was initialized: check for waveminder.db file

### Frontend Issues

- Clear npm cache: ``` npm cache clean --force ```
  
- Delete node_modules and reinstall: ``` rm -rf node_modules && npm install ```
  
- Check console for errors in browser 

## CORS Issues

- Ensure backend CORS is configured for http://localhost:3000
  
- Check that both servers are running


## Future Enhhancements
 - Photo uploads for sightings and reports

 - Social features (follow users, like content)

 - Email notifications for nearby events

 - Advanced filtering and search
 
 - Data export (CSV, PDF reports)
 
 - Gamification (badges, achievements)