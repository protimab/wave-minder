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
            area_covered REAL DEFAULT 0,
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

# USER FUNCTIONS
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

# MARINE SIGHTING FUNCTIONS
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
    sighting_id = cursor.lastrowid #store id of newly created row
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

def update_marine_sighting(sighting_id, species_name, species_type, location_name, 
                          latitude, longitude, date_spotted, time_spotted=None, 
                          group_size=1, behavior=None, notes=None):
    """Update an existing marine sighting"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE marine_sightings 
            SET species_name=?, species_type=?, location_name=?, latitude=?, 
                longitude=?, date_spotted=?, time_spotted=?, group_size=?, 
                behavior=?, notes=?
            WHERE id=?
        ''', (
            species_name, species_type, location_name, latitude, longitude, 
            date_spotted, time_spotted, group_size, behavior, notes, sighting_id
        ))
        
        success = cursor.rowcount > 0 #checks if any row was updated
        conn.commit()
        conn.close()
        
        if success:
            print(f"Updated marine sighting ID: {sighting_id}")
        return success
        
    except Exception as e:
        print(f"Error updating sighting: {e}")
        conn.rollback()
        conn.close()
        return False

def delete_marine_sighting(sighting_id):
    """Delete a marine sighting"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM marine_sightings WHERE id=?', (sighting_id,))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            print(f"Deleted marine sighting ID: {sighting_id}")
        return success
        
    except Exception as e:
        print(f"Error deleting sighting: {e}")
        conn.rollback()
        conn.close()
        return False

def get_sightings_by_location(location_name, limit=20):
    """Get marine sightings by location"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        WHERE ms.location_name LIKE ? 
        ORDER BY ms.date_spotted DESC 
        LIMIT ?
    ''', (f'%{location_name}%', limit)) #allow partial matching substring
    sightings = cursor.fetchall()
    conn.close()
    return sightings

def get_sightings_by_species(species_name, limit=20):
    """Get marine sightings by species"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        WHERE ms.species_name LIKE ? 
        ORDER BY ms.date_spotted DESC 
        LIMIT ?
    ''', (f'%{species_name}%', limit))
    sightings = cursor.fetchall()
    conn.close()
    return sightings

def verify_sighting(sighting_id, verified=True):
    """mark sighting as verified or not"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'UPDATE marine_sightings SET verified=? WHERE id=?', 
            (verified, sighting_id)
        )
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            status = "verified" if verified else "unverified"
            print(f"Sighting ID {sighting_id} marked as {status}")
        return success
        
    except Exception as e:
        print(f"Error updating the verification status: {e}")
        conn.rollback()
        conn.close()
        return False

# BEACH REPORT FUNCTIONS
def create_beach_report(user_id, beach_name, latitude, longitude, water_quality, 
                       pollution_level, report_date, water_temp=None, wildlife_activity=None,
                       weather_conditions=None, notes=None, photo_url=None):
    """Create a new beach report"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO beach_reports 
            (user_id, beach_name, latitude, longitude, water_quality, pollution_level,
             water_temp, wildlife_activity, weather_conditions, notes, photo_url, report_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, beach_name, latitude, longitude, water_quality, pollution_level,
            water_temp, wildlife_activity, weather_conditions, notes, photo_url, report_date
        ))
        
        report_id = cursor.lastrowid
        conn.commit()
        conn.close()
        print(f"Created beach report: {beach_name} (ID: {report_id})")
        return report_id
        
    except Exception as e:
        print(f"Error creating beach report: {e}")
        conn.rollback()
        conn.close()
        return None

def get_beach_report_by_id(report_id: int):
    """Get a beach report by its ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        WHERE br.id = ?
    ''', (report_id,))
    report = cursor.fetchone()
    conn.close()
    return report

def get_all_beach_reports(limit: int = 100, offset: int = 0):
    """Get all beach reports within page"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        ORDER BY br.report_date DESC, br.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))
    reports = cursor.fetchall()
    conn.close()
    return reports

def get_user_beach_reports(user_id):
    """Get all beach reports made by a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM beach_reports WHERE user_id = ? ORDER BY report_date DESC',
        (user_id,)
    )
    reports = cursor.fetchall()
    conn.close()
    return reports

def get_beach_reports_by_location(beach_name, limit=20):
    """Get beach reports by beach name"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        WHERE br.beach_name LIKE ? 
        ORDER BY br.report_date DESC 
        LIMIT ?
    ''', (f'%{beach_name}%', limit))
    reports = cursor.fetchall()
    conn.close()
    return reports

def update_beach_report(report_id, beach_name, latitude, longitude, water_quality, 
                       pollution_level, report_date, water_temp=None, wildlife_activity=None,
                       weather_conditions=None, notes=None, photo_url=None):
    """Update an existing beach report"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE beach_reports 
            SET beach_name=?, latitude=?, longitude=?, water_quality=?, pollution_level=?,
                water_temp=?, wildlife_activity=?, weather_conditions=?, notes=?, 
                photo_url=?, report_date=?
            WHERE id=?
        ''', (
            beach_name, latitude, longitude, water_quality, pollution_level,
            water_temp, wildlife_activity, weather_conditions, notes, photo_url, 
            report_date, report_id
        ))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            print(f"Updated beach report ID: {report_id}")
        return success
        
    except Exception as e:
        print(f"Error updating beach report: {e}")
        conn.rollback()
        conn.close()
        return False

def delete_beach_report(report_id):
    """Delete a beach report"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM beach_reports WHERE id=?', (report_id,))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            print(f"Deleted beach report ID: {report_id}")
        return success
        
    except Exception as e:
        print(f"Error deleting beach report: {e}")
        conn.rollback()
        conn.close()
        return False

def get_beach_condition_trends(beach_name, days=30):
    """Get beach condition trends over a period of time for analysis"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT report_date, water_quality, pollution_level, wildlife_activity, water_temp
        FROM beach_reports 
        WHERE beach_name LIKE ? 
        AND report_date >= date('now', '-{} days')
        ORDER BY report_date DESC
    '''.format(days), (f'%{beach_name}%',))
    
    trends = cursor.fetchall()
    conn.close()
    return trends

# CONSERVATION ACTION FUNCTIONS
def create_conservation_action(user_id, action_type, title, description, location_name,
                              latitude, longitude, participants, impact_score,
                              waste_collected, area_covered, date_completed,
                              duration_hours=None, photo_url=None):
    """create a new conservation action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO conservation_actions 
            (user_id, action_type, title, description, location_name, latitude, longitude,
             participants, impact_score, waste_collected, area_covered_, date_completed,
             duration_hours, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, action_type, title, description, location_name, latitude, longitude,
            participants, impact_score, waste_collected, area_covered, date_completed,
            duration_hours, photo_url
        ))
        
        action_id = cursor.lastrowid
        conn.commit()
        conn.close()
        print(f"Created conservation action: {title} (ID: {action_id})")
        return action_id
        
    except Exception as e:
        print(f"Error creating conservation action: {e}")
        conn.rollback()
        conn.close()
        return None

def get_conservation_action_by_id(action_id: int):
    """get a conservation action by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.id = ?
    ''', (action_id,))
    action = cursor.fetchone()
    conn.close()
    return action

def get_all_conservation_actions(limit: int = 100, offset: int = 0):
    """Get all conservation actions within page"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        ORDER BY ca.date_completed DESC, ca.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))
    actions = cursor.fetchall()
    conn.close()
    return actions

def get_user_conservation_actions(user_id):
    """get all conservation actions by a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM conservation_actions WHERE user_id = ? ORDER BY date_completed DESC',
        (user_id,)
    )
    actions = cursor.fetchall()
    conn.close()
    return actions

def get_conservation_actions_by_type(action_type, limit=50):
    """get conservation actions by type"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.action_type = ? 
        ORDER BY ca.date_completed DESC 
        LIMIT ?
    ''', (action_type, limit))
    actions = cursor.fetchall()
    conn.close()
    return actions

def get_conservation_actions_by_location(location_name, limit=50):
    """get conservation actions by location"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.location_name LIKE ? 
        ORDER BY ca.date_completed DESC 
        LIMIT ?
    ''', (f'%{location_name}%', limit))
    actions = cursor.fetchall()
    conn.close()
    return actions

def update_conservation_action(action_id, action_type, title, description, location_name,
                              latitude, longitude, participants, impact_score,
                              waste_collected, area_covered, date_completed,
                              duration_hours=None, photo_url=None):
    """update existing conservation action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE conservation_actions 
            SET action_type=?, title=?, description=?, location_name=?, latitude=?, longitude=?,
                participants=?, impact_score=?, waste_collected=?, area_covered_=?, 
                date_completed=?, duration_hours=?, photo_url=?
            WHERE id=?
        ''', (
            action_type, title, description, location_name, latitude, longitude,
            participants, impact_score, waste_collected, area_covered, date_completed,
            duration_hours, photo_url, action_id
        ))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            print(f"Updated conservation action ID: {action_id}")
        return success
        
    except Exception as e:
        print(f"Error updating conservation action: {e}")
        conn.rollback()
        conn.close()
        return False

def delete_conservation_action(action_id):
    """delete a conservation action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM conservation_actions WHERE id=?', (action_id,))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if success:
            print(f"Deleted conservation action ID: {action_id}")
        return success
        
    except Exception as e:
        print(f"Error deleting conservation action: {e}")
        conn.rollback()
        conn.close()
        return False

def get_community_conservation_stats(days: int = 30):
    """get community conservation stats"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # get all actions in the time frame
    cursor.execute('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.date_completed >= date('now', '-{} days')
        ORDER BY ca.date_completed DESC
    '''.format(days))
    
    actions = cursor.fetchall()
    
    # get actions by type
    cursor.execute('''
        SELECT action_type, COUNT(*) as count, 
               SUM(participants) as total_participants,
               SUM(waste_collected) as total_waste,
               SUM(impact_score) as total_impact
        FROM conservation_actions 
        WHERE date_completed >= date('now', '-{} days')
        GROUP BY action_type
    '''.format(days))
    
    actions_by_type = cursor.fetchall()
    
    # get top contributors
    cursor.execute('''
        SELECT u.name, u.id, COUNT(*) as action_count,
               SUM(ca.impact_score) as total_impact,
               SUM(ca.participants) as total_participants
        FROM conservation_actions ca
        JOIN users u ON ca.user_id = u.id
        WHERE ca.date_completed >= date('now', '-{} days')
        GROUP BY u.id
        ORDER BY total_impact DESC
        LIMIT 10
    '''.format(days))
    
    top_contributors = cursor.fetchall()
    
    conn.close()
    
    return {
        "actions": actions,
        "actions_by_type": actions_by_type,
        "top_contributors": top_contributors
    }

def get_user_impact_stats(user_id):
    """get impact statistics for a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            COUNT(*) as total_actions,
            SUM(participants) as total_participants,
            SUM(waste_collected) as total_waste,
            SUM(area_covered_) as total_area,
            SUM(impact_score) as total_impact,
            AVG(impact_score) as avg_impact
        FROM conservation_actions 
        WHERE user_id = ?
    ''', (user_id,))
    
    stats = cursor.fetchone()
    
    # get actions by type for this user
    cursor.execute('''
        SELECT action_type, COUNT(*) as count
        FROM conservation_actions 
        WHERE user_id = ?
        GROUP BY action_type
    ''', (user_id,))
    
    actions_by_type = cursor.fetchall()
    
    conn.close()
    
    return {
        "stats": stats,
        "actions_by_type": actions_by_type
    }
    
if __name__ == "__main__":
    init_database()