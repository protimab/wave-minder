import sqlite3
from typing import List, Optional, Dict, Tuple
from datetime import datetime

DB_NAME = "waveminder.db"


# DATABASE CONNECTION & INITIALIZATION
def get_db():
    """get database connection with row factory"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # access columns by name
    return conn

def execute_query(query: str, params: tuple = (), fetch_one: bool = False, commit: bool = False):
    """query executor"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        if commit:
            conn.commit()
            result = cursor.lastrowid if cursor.lastrowid else cursor.rowcount > 0
        else:
            result = cursor.fetchone() if fetch_one else cursor.fetchall()
        conn.close()
        return result
    except Exception as e:
        print(f"Database error: {e}")
        conn.rollback()
        conn.close()
        return None if fetch_one or commit else []

def init_database():
    """initialize all database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # USERS TABLE
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
    
    # MARINE SIGHTINGS TABLE
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
    
    # BEACH REPORTS TABLE
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
    
    # CONSERVATION ACTIONS TABLE
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
def create_user(email: str, name: str, password: str, location: str = None) -> int:
    """create new user and return ID"""
    return execute_query(
        'INSERT INTO users (email, name, password, location) VALUES (?, ?, ?, ?)',
        (email, name, password, location),
        commit=True
    )

def get_user_by_email(email: str) -> Optional[Tuple]:
    """get user by email"""
    return execute_query('SELECT * FROM users WHERE email = ?', (email,), fetch_one=True)

def get_user_by_id(user_id: int) -> Optional[Tuple]:
    """get user by ID"""
    return execute_query('SELECT * FROM users WHERE id = ?', (user_id,), fetch_one=True)


# MARINE SIGHTINGS FUNCTIONS
def create_marine_sighting(user_id: int, species_name: str, species_type: str, 
                          location_name: str, latitude: float, longitude: float, 
                          date_spotted: str, time_spotted: str = None, group_size: int = 1, 
                          behavior: str = None, notes: str = None) -> int:
    """create marine sighting"""
    return execute_query('''
        INSERT INTO marine_sightings 
        (user_id, species_name, species_type, location_name, latitude, longitude, 
         date_spotted, time_spotted, group_size, behavior, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, species_name, species_type, location_name, latitude, longitude, 
          date_spotted, time_spotted, group_size, behavior, notes), commit=True)

def get_all_sightings(limit: int = 100, offset: int = 0) -> List[Tuple]:
    """get all sightings with pagination"""
    return execute_query('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        ORDER BY ms.date_spotted DESC, ms.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))

def get_user_sightings(user_id: int) -> List[Tuple]:
    """get all sightings by user"""
    return execute_query('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        WHERE ms.user_id = ? 
        ORDER BY ms.date_spotted DESC
    ''', (user_id,))

def get_sighting_by_id(sighting_id: int) -> Optional[Tuple]:
    """get sighting by ID"""
    return execute_query('''
        SELECT ms.*, u.name as user_name 
        FROM marine_sightings ms 
        JOIN users u ON ms.user_id = u.id 
        WHERE ms.id = ?
    ''', (sighting_id,), fetch_one=True)

def update_marine_sighting(sighting_id: int, species_name: str, species_type: str,
                          location_name: str, latitude: float, longitude: float,
                          date_spotted: str, time_spotted: str = None, group_size: int = 1,
                          behavior: str = None, notes: str = None) -> bool:
    """update marine sighting"""
    return execute_query('''
        UPDATE marine_sightings 
        SET species_name=?, species_type=?, location_name=?, latitude=?, longitude=?,
            date_spotted=?, time_spotted=?, group_size=?, behavior=?, notes=?
        WHERE id=?
    ''', (species_name, species_type, location_name, latitude, longitude,
          date_spotted, time_spotted, group_size, behavior, notes, sighting_id), commit=True)

def delete_marine_sighting(sighting_id: int) -> bool:
    """delete marine sighting"""
    return execute_query('DELETE FROM marine_sightings WHERE id=?', (sighting_id,), commit=True)

# BEACH REPORTS FUNCTIONS
def create_beach_report(user_id: int, beach_name: str, latitude: float, longitude: float,
                       water_quality: int, pollution_level: int, report_date: str,
                       water_temp: float = None, wildlife_activity: str = None,
                       weather_conditions: str = None, notes: str = None, 
                       photo_url: str = None) -> int:
    """create beach report"""
    return execute_query('''
        INSERT INTO beach_reports 
        (user_id, beach_name, latitude, longitude, water_quality, pollution_level,
         water_temp, wildlife_activity, weather_conditions, notes, photo_url, report_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, beach_name, latitude, longitude, water_quality, pollution_level,
          water_temp, wildlife_activity, weather_conditions, notes, photo_url, report_date), 
    commit=True)

def get_all_beach_reports(limit: int = 100, offset: int = 0) -> List[Tuple]:
    """get all beach reports with pagination"""
    return execute_query('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        ORDER BY br.report_date DESC, br.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))

def get_user_beach_reports(user_id: int) -> List[Tuple]:
    """get all beach reports by user"""
    return execute_query('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        WHERE br.user_id = ? 
        ORDER BY br.report_date DESC
    ''', (user_id,))

def get_beach_report_by_id(report_id: int) -> Optional[Tuple]:
    """get beach report by ID"""
    return execute_query('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        WHERE br.id = ?
    ''', (report_id,), fetch_one=True)

def update_beach_report(report_id: int, beach_name: str, latitude: float, longitude: float,
                       water_quality: int, pollution_level: int, report_date: str,
                       water_temp: float = None, wildlife_activity: str = None,
                       weather_conditions: str = None, notes: str = None,
                       photo_url: str = None) -> bool:
    """update beach report"""
    return execute_query('''
        UPDATE beach_reports 
        SET beach_name=?, latitude=?, longitude=?, water_quality=?, pollution_level=?,
            water_temp=?, wildlife_activity=?, weather_conditions=?, notes=?, 
            photo_url=?, report_date=?
        WHERE id=?
    ''', (beach_name, latitude, longitude, water_quality, pollution_level,
          water_temp, wildlife_activity, weather_conditions, notes, photo_url,
          report_date, report_id), commit=True)

def delete_beach_report(report_id: int) -> bool:
    """delete beach report"""
    return execute_query('DELETE FROM beach_reports WHERE id=?', (report_id,), commit=True)

def get_beach_reports_by_location(beach_name: str, limit: int = 20) -> List[Tuple]:
    """get beach reports by location name"""
    return execute_query('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        WHERE br.beach_name LIKE ? 
        ORDER BY br.report_date DESC 
        LIMIT ?
    ''', (f'%{beach_name}%', limit))

def get_beach_condition_trends(beach_name: str, days: int = 30) -> List[Tuple]:
    """get beach condition trends for analysis"""
    return execute_query(f'''
        SELECT report_date, water_quality, pollution_level, wildlife_activity, water_temp
        FROM beach_reports 
        WHERE beach_name LIKE ? 
        AND report_date >= date('now', '-{days} days')
        ORDER BY report_date DESC
    ''', (f'%{beach_name}%',))


# CONSERVATION ACTIONS FUNCTIONS
def create_conservation_action(user_id: int, action_type: str, title: str, description: str,
                              location_name: str, latitude: float, longitude: float,
                              participants: int, impact_score: float, waste_collected: float,
                              area_covered: float, date_completed: str,
                              duration_hours: float = None, photo_url: str = None) -> int:
    """create conservation action"""
    return execute_query('''
        INSERT INTO conservation_actions 
        (user_id, action_type, title, description, location_name, latitude, longitude,
         participants, impact_score, waste_collected, area_covered, date_completed,
         duration_hours, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, action_type, title, description, location_name, latitude, longitude,
          participants, impact_score, waste_collected, area_covered, date_completed,
          duration_hours, photo_url), commit=True)

def get_all_conservation_actions(limit: int = 100, offset: int = 0) -> List[Tuple]:
    """get all conservation actions with pagination"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        ORDER BY ca.date_completed DESC, ca.created_at DESC 
        LIMIT ? OFFSET ?
    ''', (limit, offset))

def get_user_conservation_actions(user_id: int) -> List[Tuple]:
    """get all conservation actions by user"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.user_id = ? 
        ORDER BY ca.date_completed DESC
    ''', (user_id,))

def get_conservation_action_by_id(action_id: int) -> Optional[Tuple]:
    """get conservation action by ID"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.id = ?
    ''', (action_id,), fetch_one=True)

def update_conservation_action(action_id: int, action_type: str, title: str, description: str,
                              location_name: str, latitude: float, longitude: float,
                              participants: int, impact_score: float, waste_collected: float,
                              area_covered: float, date_completed: str,
                              duration_hours: float = None, photo_url: str = None) -> bool:
    """update conservation action"""
    return execute_query('''
        UPDATE conservation_actions 
        SET action_type=?, title=?, description=?, location_name=?, latitude=?, longitude=?,
            participants=?, impact_score=?, waste_collected=?, area_covered=?, 
            date_completed=?, duration_hours=?, photo_url=?
        WHERE id=?
    ''', (action_type, title, description, location_name, latitude, longitude,
          participants, impact_score, waste_collected, area_covered, date_completed,
          duration_hours, photo_url, action_id), commit=True)

def delete_conservation_action(action_id: int) -> bool:
    """delete conservation action"""
    return execute_query('DELETE FROM conservation_actions WHERE id=?', (action_id,), commit=True)

def get_conservation_actions_by_type(action_type: str, limit: int = 50) -> List[Tuple]:
    """get conservation actions by type"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.action_type = ? 
        ORDER BY ca.date_completed DESC 
        LIMIT ?
    ''', (action_type, limit))

def get_conservation_actions_by_location(location_name: str, limit: int = 50) -> List[Tuple]:
    """get conservation actions by location"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.location_name LIKE ? 
        ORDER BY ca.date_completed DESC 
        LIMIT ?
    ''', (f'%{location_name}%', limit))

# STATS CALC
def get_community_conservation_stats(days: int = 30) -> Dict:
    """get community conservation statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # get all actions in a timeframe
    cursor.execute(f'''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        WHERE ca.date_completed >= date('now', '-{days} days')
        ORDER BY ca.date_completed DESC
    ''')
    actions = cursor.fetchall()
    
    # get actions by type
    cursor.execute(f'''
        SELECT action_type, COUNT(*) as count, 
               SUM(participants) as total_participants,
               SUM(waste_collected) as total_waste,
               SUM(impact_score) as total_impact
        FROM conservation_actions 
        WHERE date_completed >= date('now', '-{days} days')
        GROUP BY action_type
    ''')
    actions_by_type = cursor.fetchall()
    
    # get top contributors
    cursor.execute(f'''
        SELECT u.name, u.id, COUNT(*) as action_count,
               SUM(ca.impact_score) as total_impact,
               SUM(ca.participants) as total_participants
        FROM conservation_actions ca
        JOIN users u ON ca.user_id = u.id
        WHERE ca.date_completed >= date('now', '-{days} days')
        GROUP BY u.id
        ORDER BY total_impact DESC
        LIMIT 10
    ''')
    top_contributors = cursor.fetchall()
    
    conn.close()
    
    return {
        "actions": actions,
        "actions_by_type": actions_by_type,
        "top_contributors": top_contributors
    }

def get_user_impact_stats(user_id: int) -> Dict:
    """get impact statistics for specific user"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            COUNT(*) as total_actions,
            SUM(participants) as total_participants,
            SUM(waste_collected) as total_waste,
            SUM(area_covered) as total_area,
            SUM(impact_score) as total_impact,
            AVG(impact_score) as avg_impact
        FROM conservation_actions 
        WHERE user_id = ?
    ''', (user_id,))
    stats = cursor.fetchone()
    
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