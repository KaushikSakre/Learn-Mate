# core/db.py
import sqlite3
from datetime import datetime

DB_PATH = "chat_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            created_at TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            role TEXT,
            content TEXT,
            timestamp TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
    """)
    conn.commit()
    conn.close()

def get_or_create_session(name):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM sessions WHERE name = ?", (name,))
    row = c.fetchone()
    if row:
        session_id = row[0]
    else:
        now = datetime.now().isoformat()
        c.execute("INSERT INTO sessions (name, created_at) VALUES (?, ?)", (name, now))
        session_id = c.lastrowid
        conn.commit()
    conn.close()
    return session_id

def save_message(session_id, role, content):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.now().isoformat()
    c.execute("INSERT INTO messages (session_id, role, content, timestamp) VALUES (?, ?, ?, ?)", 
              (session_id, role, content, now))
    conn.commit()
    conn.close()

def get_chat_history(session_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id", (session_id,))
    history = [{"role": role, "content": content} for role, content in c.fetchall()]
    conn.close()
    return history
