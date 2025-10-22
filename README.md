# WaveMinder
Welcome to my marine conservation platform :

## 📍 Core Features

  🐳 Marine Wildlife Sightings - Users report dolphin, whale, turtle sightings with photos


  🏝️ Beach Condition Reports - Water quality, pollution levels, cleanup events 

  
  📈 Ocean Data Dashboard - Real-time marine weather, temperatures, tides 

  
  📖 Conservation Actions - Beach cleanups, education, participation 

  
  🗺️ Community Impact Map - Visual representation of all conservation activities


 ## 🔧 Technology Stack
   
  ### Backend:
  - FastAPI, SQLite, JWT, Passlib, Requests 
  
  ### Frontend:
  - React, Axios, Lucide React, CSS
    

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


