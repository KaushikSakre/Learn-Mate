
import pytest
import sqlite3
import os
from core.auth import (
    hash_password,
    verify_password,
    generate_token,
    verify_token,
    register_user,
    login_user,
    get_user_by_id,
    init_auth_db,
    create_user_session,
    get_user_sessions,
    verify_session_owner
)

DB_PATH = "test_chat_history.db"

@pytest.fixture(scope="module")
def db():
    """Fixture to set up and tear down a test database."""
    # Use a separate test database
    original_db_path = "core.auth.DB_PATH"
    with pytest.MonkeyPatch.context() as m:
        m.setattr("core.auth.DB_PATH", DB_PATH)
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        
        init_auth_db()
        yield
        
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)

def test_password_hashing():
    """Test password hashing and verification."""
    password = "testpassword123"
    hashed_password = hash_password(password)
    assert hashed_password is not None
    assert ":" in hashed_password
    assert verify_password(password, hashed_password)
    assert not verify_password("wrongpassword", hashed_password)

def test_jwt_token_handling():
    """Test JWT token generation and verification."""
    user_id = "test_user_id"
    token = generate_token(user_id)
    assert token is not None
    
    decoded_user_id = verify_token(token)
    assert decoded_user_id == user_id

def test_user_registration(db):
    """Test user registration success and failure cases."""
    # Successful registration
    result = register_user("testuser", "test@example.com", "password123", "Test User")
    assert result["success"]
    assert "token" in result
    assert result["username"] == "testuser"

    # Duplicate username
    result_fail = register_user("testuser", "another@example.com", "password123")
    assert not result_fail["success"]
    assert "already exists" in result_fail["error"]

    # Duplicate email
    result_fail_2 = register_user("anotheruser", "test@example.com", "password123")
    assert not result_fail_2["success"]
    assert "already exists" in result_fail_2["error"]

def test_user_login(db):
    """Test user login success and failure cases."""
    register_user("loginuser", "login@example.com", "loginpass")
    
    # Successful login
    result = login_user("loginuser", "loginpass")
    assert result["success"]
    assert "token" in result
    assert result["username"] == "loginuser"

    # Wrong password
    result_fail = login_user("loginuser", "wrongpass")
    assert not result_fail["success"]
    assert "Invalid credentials" in result_fail["error"]

    # Non-existent user
    result_fail_2 = login_user("nosuchuser", "password")
    assert not result_fail_2["success"]
    assert "Invalid credentials" in result_fail_2["error"]

def test_get_user_by_id(db):
    """Test retrieving a user by their ID."""
    reg_result = register_user("getuser", "get@example.com", "password")
    user_id = reg_result["user_id"]
    
    user = get_user_by_id(user_id)
    assert user is not None
    assert user["id"] == user_id
    assert user["username"] == "getuser"

    # Non-existent user
    user_none = get_user_by_id("nonexistentid")
    assert user_none is None

def test_session_management(db):
    """Test session creation, retrieval, and ownership verification."""
    reg_result = register_user("sessionuser", "session@example.com", "password")
    user_id = reg_result["user_id"]

    # Create a session
    session_result = create_user_session(user_id, "My First Session")
    assert "session_id" in session_result
    session_id = session_result["session_id"]

    # Get user sessions
    sessions = get_user_sessions(user_id)
    assert len(sessions) == 1
    assert sessions[0]["id"] == session_id
    assert sessions[0]["name"] == "My First Session"

    # Verify session owner
    assert verify_session_owner(session_id, user_id)
    assert not verify_session_owner(session_id, "another_user_id")
    assert not verify_session_owner("nonexistent_session", user_id)
