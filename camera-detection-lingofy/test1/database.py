import sqlite3

# Single persistent connection — fine for single-threaded Flask dev server
conn = sqlite3.connect("lingofy.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS words (
    word      TEXT PRIMARY KEY,
    translation TEXT,
    example   TEXT
)
""")
conn.commit()


def get_word(word: str):
    cursor.execute("SELECT word, translation, example FROM words WHERE word = ?", (word,))
    return cursor.fetchone()


def save_word(word: str, translation: str, example: str):
    cursor.execute(
        "INSERT OR REPLACE INTO words VALUES (?, ?, ?)",
        (word, translation, example)
    )
    conn.commit()
