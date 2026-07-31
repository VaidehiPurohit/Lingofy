import sqlite3
import os

db_path = os.path.join("instance", "lingofy.db")
print("Connecting to", db_path)
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE progress ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
    print("Added created_at column")
except Exception as e:
    print("Column might already exist or error:", e)

try:
    c.execute("ALTER TABLE user ADD COLUMN level VARCHAR(50) DEFAULT 'Beginner'")
    print("Added level column")
except Exception as e:
    print("Column might already exist or error:", e)

conn.commit()

print("Schema of progress:")
print(c.execute("PRAGMA table_info(progress)").fetchall())
conn.close()
