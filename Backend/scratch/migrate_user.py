import sqlite3

db_path = 'd:\\Lingofy\\Backend\\instance\\lingofy.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE user ADD COLUMN study_time INTEGER DEFAULT 0")
    print("Added study_time column")
except Exception as e:
    print(f"study_time column might already exist: {e}")

try:
    cursor.execute("ALTER TABLE user ADD COLUMN streak INTEGER DEFAULT 1")
    print("Added streak column")
except Exception as e:
    print(f"streak column might already exist: {e}")

conn.commit()
conn.close()
