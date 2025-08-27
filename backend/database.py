import sqlite3
from typing import List, Optional, Dict
from datetime import datetime, date
import os

DATABASE_PATH = "waveminder.db"

def get_db_connection():
    """create db"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

def init_database():
    """initialize database"""
    conn = get_db_connection()
    
    # USERS
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            location TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # MARING SIGHTINGS
    conn.execute('''
        CREATE TABLE IF NOT EXISTS marine_sightings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            species_name TEXT NOT NULL,
            species_type TEXT NOT NULL, -- 'whale', 'dolphin', 'turtle', 'fish', 'other'
            location_name TEXT,
            latitude REAL,
            longitude REAL,
            date_spotted DATE NOT NULL,
            time_spotted TEXT,
            group_size INTEGER DEFAULT 1,
            behavior TEXT, -- 'feeding', 'playing', 'migrating', 'resting'
            photo_url TEXT,
            notes TEXT,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    # BEACH REPORTS
    conn.execute('''
        CREATE TABLE IF NOT EXISTS beach_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            beach_name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            water_quality INTEGER CHECK(water_quality BETWEEN 1 AND 5),
            pollution_level INTEGER CHECK(pollution_level BETWEEN 1 AND 5),
            water_temp REAL,
            wildlife_activity TEXT,
            weather_conditions TEXT,
            photo_url TEXT,
            notes TEXT,
            report_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    # CONSERVATION ACTIONS
    conn.execute('''
        CREATE TABLE IF NOT EXISTS conservation_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action_type TEXT NOT NULL, -- 'beach_cleanup', 'advocacy', 'education', 'research'
            title TEXT NOT NULL,
            description TEXT,
            location_name TEXT,
            latitude REAL,
            longitude REAL,
            participants INTEGER DEFAULT 1,
            impact_score REAL DEFAULT 1.0,
            waste_collected REAL DEFAULT 0,
            area_covered_ REAL DEFAULT 0,
            date_completed DATE NOT NULL,
            duration_hours REAL,
            photo_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized")

# basic user functions
def create_user(email: str, name: str, password: str, location: str = None) -> int:
    """create user & return their ids"""
    conn = get_db_connection()
    cursor = conn.execute(
        'INSERT INTO users (email, name, password, location) VALUES (?, ?, ?, ?)',
        (email, name, password, location)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    print(f"user: {name} (ID: {user_id})")
    return user_id

def get_user_by_email(email: str) -> Optional[Dict]:
    """get the user id by their email address"""
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE email = ?', (email,)
    ).fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id: int) -> Optional[Dict]:
    """get user by id"""
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE id = ?', (user_id,)
    ).fetchone()
    conn.close()
    return dict(user) if user else None

# basic marine sighting functions
def create_marine_sighting(user_id: int, species_name: str, species_type: str, 
                          location_name: str, latitude: float, longitude: float,
                          date_spotted: str, **kwargs) -> int:
    """create a marine sighting"""
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO marine_sightings 
        (user_id, species_name, species_type, location_name, latitude, longitude, date_spotted,
         time_spotted, group_size, behavior, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id, species_name, species_type, location_name, latitude, longitude, date_spotted,
        kwargs.get('time_spotted'), kwargs.get('group_size', 1), 
        kwargs.get('behavior'), kwargs.get('notes')
    ))
    sighting_id = cursor.lastrowid
    conn.commit()
    conn.close()
    print(f"created marine sighting: {species_name} (ID: {sighting_id})")
    return sighting_id

def get_user_sightings(user_id: int) -> List[Dict]:
    """get all sightings by a specific user"""
    conn = get_db_connection()
    sightings = conn.execute(
        'SELECT * FROM marine_sightings WHERE user_id = ? ORDER BY date_spotted DESC',
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(sighting) for sighting in sightings]

if __name__ == "__main__":
    init_database()