import sqlite3
from typing import List, Optional, Tuple

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
            result = cursor.lastrowid if cursor.lastrowid else True
        else:
            result = cursor.fetchone() if fetch_one else cursor.fetchall()
        return result
    except Exception as e:
        print(f"Database error: {e}")
        conn.rollback()
        return None if fetch_one or commit else []
    finally:
        conn.close()

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
            notes TEXT,
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
            waste_collected REAL DEFAULT 0,
            area_covered REAL DEFAULT 0,
            date_completed DATE NOT NULL,
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
        (email, name, password, location), commit=True
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

def delete_marine_sighting(sighting_id: int) -> bool:
    """delete marine sighting"""
    return execute_query('DELETE FROM marine_sightings WHERE id=?', (sighting_id,), commit=True)

# BEACH REPORTS FUNCTIONS
def create_beach_report(user_id: int, beach_name: str, latitude: float, longitude: float,
                       water_quality: int, pollution_level: int, report_date: str,
                       water_temp: float = None, wildlife_activity: str = None,
                       notes: str = None) -> int:
    """create beach report"""
    return execute_query('''
        INSERT INTO beach_reports 
        (user_id, beach_name, latitude, longitude, water_quality, pollution_level,
         water_temp, wildlife_activity, notes, report_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, beach_name, latitude, longitude, water_quality, pollution_level,
          water_temp, wildlife_activity,notes, report_date), commit=True)

def get_all_beach_reports(limit: int = 100, offset: int = 0) -> List[Tuple]:
    """get all beach reports with pagination"""
    return execute_query('''
        SELECT br.*, u.name as user_name 
        FROM beach_reports br 
        JOIN users u ON br.user_id = u.id 
        ORDER BY br.report_date DESC
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

def delete_beach_report(report_id: int) -> bool:
    """delete beach report"""
    return execute_query('DELETE FROM beach_reports WHERE id=?', (report_id,), commit=True)

# CONSERVATION ACTIONS FUNCTIONS
def create_conservation_action(user_id: int, action_type: str, title: str, description: str,
                              location_name: str, latitude: float, longitude: float,
                              participants: int, waste_collected: float,
                              area_covered: float, date_completed: str) -> int:
    """create conservation action"""
    return execute_query('''
        INSERT INTO conservation_actions 
        (user_id, action_type, title, description, location_name, latitude, longitude,
         participants, waste_collected, area_covered, date_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, action_type, title, description, location_name, latitude, longitude,
          participants, waste_collected, area_covered, date_completed), commit=True)

def get_all_conservation_actions(limit: int = 100, offset: int = 0) -> List[Tuple]:
    """get all conservation actions with pagination"""
    return execute_query('''
        SELECT ca.*, u.name as user_name 
        FROM conservation_actions ca 
        JOIN users u ON ca.user_id = u.id 
        ORDER BY ca.date_completed DESC
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

def delete_conservation_action(action_id: int) -> bool:
    """delete conservation action"""
    return execute_query('DELETE FROM conservation_actions WHERE id=?', (action_id,), commit=True)

# STATS CALC
def get_community_stats() -> dict:
    """Get overall community statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            COUNT(*) as total_actions,
            SUM(participants) as total_participants,
            SUM(waste_collected) as total_waste,
            SUM(area_covered) as total_area
        FROM conservation_actions
    ''')
    stats = cursor.fetchone()
    
    cursor.execute('''
        SELECT action_type, COUNT(*) as count
        FROM conservation_actions
        GROUP BY action_type
    ''')
    by_type = cursor.fetchall()
    
    conn.close()
    
    return {
        "total_actions": stats[0] or 0,
        "total_participants": stats[1] or 0,
        "total_waste_kg": stats[2] or 0,
        "total_area_sqm": stats[3] or 0,
        "actions_by_type": {row[0]: row[1] for row in by_type}
    }

if __name__ == "__main__":
    init_database()