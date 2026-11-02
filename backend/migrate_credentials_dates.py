import sqlite3
from datetime import datetime

conn = sqlite3.connect('backend/nagarsathi.db')
cur = conn.cursor()

# 1. Update or Insert Kavya Makwana
cur.execute("SELECT id FROM citizens WHERE mobile = '9824929296'")
existing = cur.fetchone()

if existing:
    cur.execute("""
        UPDATE citizens 
        SET name = 'Kavya Makwana', password = 'K@vya', area = 'Navrangpura (Ward 7)'
        WHERE id = ?
    """, (existing[0],))
else:
    cur.execute("""
        UPDATE citizens 
        SET name = 'Kavya Makwana', mobile = '9824929296', password = 'K@vya', area = 'Navrangpura (Ward 7)'
        WHERE mobile = '9876543210' OR name LIKE '%Ramesh%'
    """)
    if cur.rowcount == 0:
        cur.execute("""
            INSERT INTO citizens (name, mobile, area, password)
            VALUES ('Kavya Makwana', '9824929296', 'Navrangpura (Ward 7)', 'K@vya')
        """)

# Delete any old Ramesh records
cur.execute("DELETE FROM citizens WHERE name LIKE '%Ramesh%' OR mobile = '9876543210'")

# 2. Update complaints to replace Ramesh with Kavya Makwana
cur.execute("""
    UPDATE complaints 
    SET name = 'Kavya Makwana', mobile = '9824929296'
    WHERE mobile = '9876543210' OR name LIKE '%Ramesh%'
""")

# 3. Update all complaints to today's real date (02 Nov 2026) with realistic timestamps
cur.execute("SELECT id FROM complaints ORDER BY id ASC")
rows = cur.fetchall()
today = datetime.now().strftime("%Y-%m-%d")
hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

for idx, r in enumerate(rows):
    cid = r[0]
    h = hours[idx % len(hours)]
    m = (idx * 7 + 12) % 60
    s = (idx * 13 + 5) % 60
    new_dt = f"{today} {h:02d}:{m:02d}:{s:02d}"
    cur.execute("UPDATE complaints SET created_at = ?, updated_at = ? WHERE id = ?", (new_dt, new_dt, cid))

conn.commit()

# Verify
cur.execute("SELECT name, mobile, password FROM citizens")
print("Citizens in DB:", cur.fetchall())

cur.execute("SELECT complaint_id, name, mobile, created_at FROM complaints LIMIT 5")
print("Sample Complaints:", cur.fetchall())

conn.close()
print("Migration completed successfully.")
