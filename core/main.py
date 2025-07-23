from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid
import os
from datetime import datetime

# Your RAG imports here (e.g. load_vectorstore, run_query etc.)
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.rag_query_groq_api import query_with_groq
from core.rag_pipeline import answer_from_image
from core.auth import (
    init_auth_db, register_user, login_user, verify_token, get_user_by_id,
    get_user_sessions, create_user_session, verify_session_owner
)

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

DB_PATH = "chat_history.db"

# ------------------- DB SETUP -------------------
init_auth_db()

# ------------------- AUTH MIDDLEWARE -------------------

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# ------------------- MODELS -------------------

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class SessionCreateRequest(BaseModel):
    name: Optional[str] = None

# ------------------- AUTH ROUTES -------------------

@app.post("/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    result = register_user(
        username=request.username,
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return {
        "message": "User registered successfully",
        "user": {
            "id": result["user_id"],
            "username": result["username"],
            "email": result["email"],
            "full_name": result["full_name"]
        },
        "token": result["token"]
    }

@app.post("/login")
async def login(request: LoginRequest):
    """Login user"""
    result = login_user(request.username, request.password)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"]
        )
    
    return {
        "message": "Login successful",
        "user": {
            "id": result["user_id"],
            "username": result["username"],
            "email": result["email"],
            "full_name": result["full_name"]
        },
        "token": result["token"]
    }

@app.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {"user": current_user}

# ------------------- CHAT ROUTES -------------------

@app.post("/chat")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_id = request.session_id
        user_message = request.user_message

        if not user_message.strip():
            return JSONResponse(
                status_code=400,
                content={"error": "Message cannot be empty"}
            )

        # Verify session belongs to user
        if not verify_session_owner(session_id, current_user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this session"
            )

        # Save user message
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "user", user_message, datetime.now().isoformat())
            )

        # Get previous history
        with sqlite3.connect(DB_PATH) as conn:
            messages = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp", 
                (session_id,)).fetchall()

        history = [{"role": role, "content": content} for role, content in messages]

        # Run RAG + LLM
        response = query_with_groq(user_message, history)

        # Save assistant reply
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "assistant", response, datetime.now().isoformat())
            )

        return {"response": response}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )


@app.post("/session")
def create_session(request: SessionCreateRequest = None, current_user: dict = Depends(get_current_user)):
    """Create new session for authenticated user"""
    session_name = request.name if request else None
    result = create_user_session(current_user["id"], session_name)
    return result

@app.get("/sessions")
def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for authenticated user"""
    return get_user_sessions(current_user["id"])

@app.get("/session/{session_id}")
def get_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a specific session"""
    try:
        # Verify session belongs to user
        if not verify_session_owner(session_id, current_user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this session"
            )
        
        with sqlite3.connect(DB_PATH) as conn:
            msgs = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp", (session_id,)).fetchall()
        return [{"role": r, "content": c} for r, c in msgs]
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to retrieve messages: {str(e)}"}
        )

@app.post("/chat/image")
async def chat_with_image(
    session_id: str = Form(...),
    user_message: str = Form(""),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verify session belongs to user
        if not verify_session_owner(session_id, current_user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this session"
            )
        
        if not file.content_type.startswith('image/'):
            return JSONResponse(
                status_code=400,
                content={"error": "Only image files are supported"}
            )

        # Save uploaded file temporarily
        temp_file_path = f"temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        try:
            # Process image and get response
            response = answer_from_image(temp_file_path)
            
            # Combine user message with file info
            user_content = f"{user_message} [Image: {file.filename}]" if user_message else f"[Image: {file.filename}]"
            
            # Save user message
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                    (str(uuid.uuid4()), session_id, "user", user_content, datetime.now().isoformat())
                )

            # Save assistant reply
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                    (str(uuid.uuid4()), session_id, "assistant", response, datetime.now().isoformat())
                )

            return {"response": response}
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process image: {str(e)}"}
        )

@app.delete("/session/{session_id}")
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a session (only if owned by user)"""
    try:
        # Verify session belongs to user
        if not verify_session_owner(session_id, current_user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this session"
            )
        
        with sqlite3.connect(DB_PATH) as conn:
            # Delete messages first
            conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            # Delete session
            conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            conn.commit()
        return {"message": "Session deleted successfully"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to delete session: {str(e)}"}
        )
