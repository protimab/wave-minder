# WaveMinder
Welcome to my marine conservation platform :)

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
    

# Impact Scoring System Guide
The impact scoring system quantifies the environmental and social impact of conservation actions, encouraging individuals to participate and recognizing any contributions.

How Impact Score is Calculated

Base Score Components
**Participant Score**: 1 point per participant
**Waste Collection Bonus**: 2 points per kg of waste collected
**Area Coverage Bonus**: 0.01 point per square meter covered
**Duration Bonus**: 0.5 point per hour spent

Formula
Raw Score = (Participants × 1.0) + (Waste_kg × 2.0) + (Area_sqm × 0.01) + (Hours × 0.5)
Final Impact Score = Raw Score × Action Type Multiplier
