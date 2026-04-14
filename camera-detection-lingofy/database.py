import sqlite3

conn = sqlite3.connect("lingofy.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS words (
    word TEXT PRIMARY KEY,
    translation TEXT,
    example TEXT
)
""")
conn.commit()


def get_word(word):
    cursor.execute("SELECT * FROM words WHERE word=?", (word,))
    return cursor.fetchone()


def save_word(word, translation, example):
    cursor.execute(
        "INSERT OR REPLACE INTO words VALUES (?, ?, ?)",
        (word, translation, example)
    )
    conn.commit()