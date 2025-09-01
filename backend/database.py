import sqlite3
from typing import List, Optional, Dict
from datetime import datetime, date
import os


def get_db_connection():
    """create/connect to db"""
    conn = sqlite3.connect("waveminder.db")
    return conn

def init_database():
    """initialize database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # USERS
    cursor.execute('''
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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marine_sightings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            species_name TEXT NOT NULL,
            species_type TEXT NOT NULL,
            location_name TEXT,
            latitude REAL,
            longitude REAL,
            date_spotted DATE NOT NULL,
            time_spotted TEXT,
            group_size INTEGER DEFAULT 1,
            behavior TEXT, 
            photo_url TEXT,
            notes TEXT,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    # BEACH REPORTS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS beach_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            beach_name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            water_quality INTEGER,
            pollution_level INTEGER,
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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conservation_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
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
def create_user(email, name, password, location):
    """add user & return their ids"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO users (email, name, password, location) VALUES (?, ?, ?, ?)',
        (email, name, password, location)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    print(f"user: {name} (ID: {user_id})")
    return user_id

def get_user_by_email(email):
    """get the user id by their email address"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    """get user by id"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

# basic marine sighting functions
def create_marine_sighting(user_id, species_name, species_type, 
                          location_name, latitude, longitude, date_spotted,
                          time_spotted=None, group_size=1, behavior=None, notes=None):
    """add a marine sighting"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO marine_sightings 
        (user_id, species_name, species_type, location_name, latitude, longitude, date_spotted,
         time_spotted, group_size, behavior, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id, species_name, species_type, location_name, latitude, longitude, date_spotted,
        time_spotted, group_size, behavior, notes
    ))
    sighting_id = cursor.lastrowid
    conn.commit()
    conn.close()
    print(f"created marine sighting: {species_name} (ID: {sighting_id})")
    return sighting_id

def get_user_sightings(user_id):
    """get all sightings by a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM marine_sightings WHERE user_id = ? ORDER BY date_spotted DESC',
        (user_id,)
    )
    sightings = cursor.fetchall()
    conn.close()
    return sightings

def get_all_sightings(limit: int = 100, offset: int = 0):
    """Get all marine sightings """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        ORDER BY ms.date_spotted DESC, ms.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))
    sightings = cursor.fetchall()
    conn.close()
    return sightings

def get_sighting_by_id(sighting_id: int):
    """Get a marine sighting by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        WHERE ms.id = ?
    ''', (sighting_id,))
    sighting = cursor.fetchone()
    conn.close()
    return sighting



if __name__ == "__main__":
    init_database()