import sqlite3
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt

DB_PATH = "chat_history.db"
SECRET_KEY = "learnmate_secret_key_2024"  # In production, use environment variable
TOKEN_EXPIRY_HOURS = 24

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    try:
        salt, password_hash = hashed.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except:
        return False

def generate_token(user_id: str) -> str:
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def init_auth_db():
    """Initialize authentication tables"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # Check if migrations have been run by looking for a specific table
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        is_migrated = c.fetchone()

        # Users table
        c.execute("""CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TEXT NOT NULL,
            last_login TEXT,
            is_active BOOLEAN DEFAULT 1
        )""")

        # Sessions table
        c.execute("""CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )""")

        # Messages table
        c.execute("""CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )""")

        conn.commit()

def register_user(username: str, email: str, password: str, full_name: str = None) -> Dict:
    """Register a new user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if username or email already exists
        c.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
        if c.fetchone():
            return {"success": False, "error": "Username or email already exists"}
        
        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        c.execute("""INSERT INTO users (id, username, email, password_hash, full_name, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?)""",
                 (user_id, username, email, password_hash, full_name, datetime.now().isoformat()))
        
        conn.commit()
        
        # Generate token
        token = generate_token(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "username": username,
            "email": email,
            "full_name": full_name,
            "token": token
        }

def login_user(username: str, password: str) -> Dict:
    """Login user and return token"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Find user by username or email
        c.execute("""SELECT id, username, email, password_hash, full_name, is_active 
                    FROM users WHERE (username = ? OR email = ?) AND is_active = 1""", 
                 (username, username))
        
        user = c.fetchone()
        if not user:
            return {"success": False, "error": "Invalid credentials"}
        
        user_id, db_username, email, password_hash, full_name, is_active = user
        
        # Verify password
        if not verify_password(password, password_hash):
            return {"success": False, "error": "Invalid credentials"}
        
        # Update last login
        c.execute("UPDATE users SET last_login = ? WHERE id = ?", 
                 (datetime.now().isoformat(), user_id))
        conn.commit()
        
        # Generate token
        token = generate_token(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "username": db_username,
            "email": email,
            "full_name": full_name,
            "token": token
        }

def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user information by ID"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""SELECT id, username, email, full_name, created_at, last_login 
                    FROM users WHERE id = ? AND is_active = 1""", (user_id,))
        
        user = c.fetchone()
        if user:
            return {
                "id": user[0],
                "username": user[1],
                "email": user[2],
                "full_name": user[3],
                "created_at": user[4],
                "last_login": user[5]
            }
        return None

def get_user_sessions(user_id: str):
    """Get all sessions for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""SELECT id, name, created_at FROM sessions 
                    WHERE user_id = ? ORDER BY created_at DESC""", (user_id,))
        
        sessions = c.fetchall()
        return [{"id": s[0], "name": s[1], "created_at": s[2]} for s in sessions]

def create_user_session(user_id: str, session_name: str = None) -> Dict:
    """Create a new session for user"""
    session_id = str(uuid.uuid4())
    
    # Generate friendly default name
    friendly_names = [
        "New Chat", "Study Session", "Learning Chat", "Help Session",
        "Q&A Chat", "Study Help", "Math & Science Chat", "Learning Time"
    ]
    import random
    default_name = random.choice(friendly_names)
    
    session_name = session_name or default_name
    
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", 
                    (session_id, user_id, session_name, datetime.now().isoformat()))
        conn.commit()
    
    return {"session_id": session_id, "name": session_name}

def verify_session_owner(session_id: str, user_id: str) -> bool:
    """Verify that session belongs to user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT user_id FROM sessions WHERE id = ?", (session_id,))
        result = c.fetchone()
        return result and result[0] == user_id