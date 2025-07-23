
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from core.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="module")
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture(autouse=True)
def override_get_current_user():
    """Override get_current_user dependency for testing."""
    def _override():
        return {"id": "test_user_id", "username": "testuser"}
    app.dependency_overrides[get_current_user] = _override
    yield
    app.dependency_overrides.clear() # Clean up after test

# Import get_current_user from core.main for dependency override
from core.main import get_current_user

@pytest.fixture
def mock_rag_functions():
    """Mock RAG and image processing functions."""
    with patch('core.main.query_with_groq') as mock_query_with_groq:
        with patch('core.main.answer_from_image') as mock_answer_from_image:
            mock_query_with_groq.return_value = "This is a RAG response."
            mock_answer_from_image.return_value = "This is an image response."
            yield

def test_register_endpoint():
    """Test the /register endpoint."""
    with patch('core.main.register_user') as mock_register_user:
        mock_register_user.return_value = {
            "success": True,
            "user_id": "new_user_id",
            "username": "newuser",
            "email": "new@example.com",
            "full_name": "New User",
            "token": "new_token"
        }
        response = client.post("/register", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        assert "token" in response.json()

def test_login_endpoint():
    """Test the /login endpoint."""
    with patch('core.main.login_user') as mock_login_user:
        mock_login_user.return_value = {
            "success": True,
            "user_id": "test_user_id",
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "token": "test_token"
        }
        response = client.post("/login", json={
            "username": "testuser",
            "password": "password"
        })
        assert response.status_code == 200
        assert "token" in response.json()

def test_chat_endpoint(mock_rag_functions):
    """Test the /chat endpoint."""
    with patch('core.main.verify_session_owner', return_value=True):
        with patch('core.main.sqlite3.connect', return_value=MagicMock()) as mock_connect:
            mock_cursor = MagicMock()
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            mock_connect.return_value.__enter__.return_value.execute.return_value.fetchall.return_value = []

            response = client.post("/chat", json={
                "session_id": "test_session",
                "user_message": "Hello, world!"
            })
            assert response.status_code == 200
            assert response.json() == {"response": "This is a RAG response."}

def test_session_endpoints():
    """Test the /session endpoints."""
    with patch('core.main.create_user_session') as mock_create:
        with patch('core.main.get_user_sessions') as mock_get:
            with patch('core.main.verify_session_owner', return_value=True):
                with patch('core.main.sqlite3.connect', return_value=MagicMock()) as mock_connect:
                    mock_cursor = MagicMock()
                    mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
                    mock_connect.return_value.__enter__.return_value.execute.return_value.fetchall.return_value = []

                    # Create session
                    mock_create.return_value = {"session_id": "new_session", "name": "New Chat"}
                    response_create = client.post("/session")
                    assert response_create.status_code == 200
                    assert response_create.json()["session_id"] == "new_session"

                    # Get sessions
                    mock_get.return_value = [{"id": "session1", "name": "Chat 1"}]
                    response_get = client.get("/sessions")
                    assert response_get.status_code == 200
                    assert len(response_get.json()) == 1

                    # Get messages for a session
                    response_msgs = client.get("/session/session1")
                    assert response_msgs.status_code == 200

                    # Delete a session
                    response_delete = client.delete("/session/session1")
                    assert response_delete.status_code == 200
