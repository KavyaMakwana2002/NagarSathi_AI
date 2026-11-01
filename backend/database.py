import sqlite3
import os
from config import Config

def get_db_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database tables and creates initial admin & citizen accounts if not present."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Complaints Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            area TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            original_language TEXT DEFAULT 'gu',
            translated_text TEXT,
            photo TEXT,
            priority TEXT DEFAULT 'Medium',
            ai_confidence REAL DEFAULT 0.85,
            ai_reasoning TEXT,
            status TEXT DEFAULT 'Pending',
            is_duplicate INTEGER DEFAULT 0,
            duplicate_parent_id TEXT,
            upvotes_count INTEGER DEFAULT 1,
            latitude REAL,
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Admins Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'Municipal Officer',
            department TEXT DEFAULT 'Central Command',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Citizens Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS citizens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            area TEXT NOT NULL,
            password TEXT DEFAULT '123456',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Safe Table Migrations for existing DB
    migrations = [
        ("resolved_photo", "TEXT"),
        ("resolved_notes", "TEXT"),
        ("resolved_at", "TIMESTAMP"),
        ("source", "TEXT DEFAULT 'Web'"),
        ("vision_verified", "INTEGER DEFAULT 1"),
        ("vision_tags", "TEXT"),
        ("latitude", "REAL"),
        ("longitude", "REAL")
    ]
    for col, col_type in migrations:
        try:
            cursor.execute(f"ALTER TABLE complaints ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass

    # Seed Default Admin if table empty
    cursor.execute("SELECT COUNT(*) as cnt FROM admins")
    if cursor.fetchone()["cnt"] == 0:
        cursor.execute("""
            INSERT INTO admins (username, password, name, role, department)
            VALUES (?, ?, ?, ?, ?)
        """, ("admin", "admin123", "City Administrator", "Super Admin", "Central Municipal Command"))
        print("[Database] Default admin seeded: username=admin, password=admin123")

    # Seed Default Citizen if table empty
    cursor.execute("SELECT COUNT(*) as cnt FROM citizens")
    if cursor.fetchone()["cnt"] == 0:
        cursor.execute("""
            INSERT INTO citizens (name, mobile, area, password)
            VALUES (?, ?, ?, ?)
        """, ("Ramesh Patel", "9876543210", "Navrangpura (Ward 7)", "123456"))
        print("[Database] Default citizen seeded: mobile=9876543210, password=123456")

    # Seed initial demo complaints if empty or missing coordinates
    cursor.execute("SELECT COUNT(*) as cnt FROM complaints")
    comp_count = cursor.fetchone()["cnt"]
    if comp_count == 0:
        demo_complaints = [
            (
                "NS-RD8821", "Ramesh Patel", "9876543210", "Navrangpura (Ward 7)", "Road & Potholes",
                "નવરંગપુરા મેઈન રોડ પર ૨ ફૂટ ઊંડો ખાડો હતો, વાહનો સ્લિપ થતા હતા.",
                "gu", "Deep 2-ft pothole on Navrangpura main road causing two-wheeler skids.",
                "pothole_before.jpg", "High", 0.98,
                "Gemini Vision verified: severe road cavity with traffic accident risk.",
                "Resolved", 0, None, 14, 23.0365, 72.5611,
                "pothole_after.jpg", "Ward 7 Asphalt team deployed. Pothole filled with hot mix bituminous asphalt, compacted and leveled.", "Web", 1, "Pothole, Damaged Asphalt, High Accident Hazard"
            ),
            (
                "NS-GB4012", "Priya Shah", "9825012345", "Satellite (Ward 12)", "Garbage & Sanitation",
                "જોધપુર ચાર રસ્તા પાસે જાહેર કચરાપેટી ઉભરાઈ ગઈ છે, ભારે દુર્ગંધ ફેલાય છે.",
                "gu", "Public garbage dumpster overflowing near Jodhpur crossroads, terrible stench.",
                "garbage_before.jpg", "Medium", 0.94,
                "AI Vision detected municipal waste pile overflowing sidewalk.",
                "In Progress", 0, None, 8, 23.0322, 72.5186,
                None, "Sanitation truck assigned for immediate clearance.", "WhatsApp", 1, "Garbage Overflow, Public Health, Sanitation Delay"
            ),
            (
                "NS-WT5093", "Kishore Mehta", "9712345678", "Vastrapur (Ward 10)", "Water Supply",
                "વસ્ત્રાપુર તળાવ રોડ પર પીવાની મેઈન પાઇપલાઇન લીક થતાં લાખો લીટર પાણી વહી રહ્યું છે.",
                "gu", "Main drinking water pipeline ruptured on Vastrapur Lake Road, heavy clean water wastage.",
                None, "High", 0.97,
                "Critical infrastructure drinking water pipeline rupture detected.",
                "Pending", 0, None, 19, 23.0350, 72.5293,
                None, None, "Web", 1, "Water Leakage, Pressure Drop, Resource Waste"
            ),
            (
                "NS-LT3194", "Ankit Dave", "9909012345", "Maninagar (Ward 14)", "Street Light",
                "કાંકરિયા ગેટ નંબર 3 પાસે 4 સ્ટ્રીટ લાઈટો છેલ્લા 3 દિવસથી બંધ છે, અંધારપટ્ટ છે.",
                "gu", "4 street light poles non-functional near Kankaria Gate 3 for 3 days, complete darkness.",
                None, "Medium", 0.91,
                "Safety risk at night due to dark pedestrian stretch.",
                "Pending", 0, None, 5, 22.9978, 72.6033,
                None, None, "WhatsApp", 1, "Street Light Failure, Night Vision Hazard"
            ),
            (
                "NS-DN6723", "Bhavik Joshi", "9898123456", "Paldi (Ward 8)", "Drainage & Sewage",
                "મહાલક્ષ્મી ચાર રસ્તા પાસે ગટરનું ઢાંકણ તૂટેલું છે, ગંદુ પાણી રોડ પર આવી રહ્યું છે.",
                "gu", "Broken manhole cover near Mahalaxmi crossroads with sewage overflow onto main road.",
                None, "High", 0.99,
                "Severe biological hazard and open manhole vehicle trap.",
                "Pending", 0, None, 12, 23.0130, 72.5625,
                None, None, "Web", 1, "Broken Manhole, Sewage Overflow, Urgent Danger"
            ),
            (
                "NS-RD9024", "Jignesh Soni", "9876543210", "Bopal (Ward 16)", "Road & Potholes",
                "એસપી રિંગ રોડ સર્કલ નજીક મોટો ખાડો પડ્યો છે.",
                "gu", "Large crater near SP Ring Road circle in Bopal.",
                None, "Medium", 0.89,
                "Moderate road surface damage near ring road junction.",
                "In Progress", 0, None, 3, 23.0354, 72.4646,
                None, "Assigned to Bopal road repair contractor.", "Web", 1, "Asphalt Crack, Ring Road Traffic"
            )
        ]
        cursor.executemany("""
            INSERT INTO complaints (
                complaint_id, name, mobile, area, category, description,
                original_language, translated_text, photo, priority,
                ai_confidence, ai_reasoning, status, is_duplicate,
                duplicate_parent_id, upvotes_count, latitude, longitude,
                resolved_photo, resolved_notes, source, vision_verified, vision_tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_complaints)
        print("[Database] 6 realistic Gujarat demo complaints with coordinates seeded!")

    conn.commit()
    conn.close()
    print("[Database] NagarSathi AI SQLite database initialized successfully at:", Config.DATABASE_PATH)

if __name__ == "__main__":
    init_db()
