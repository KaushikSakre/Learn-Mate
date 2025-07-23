
import pytest
from unittest.mock import patch, MagicMock
from core.rag_pipeline import (
    embed_query,
    retrieve_relevant_docs,
    ask_question,
    answer_from_image,
    web_search_context
)
from scripts.rag_query_groq_api import (
    is_greeting_or_general,
    get_showcase_response,
    is_inappropriate,
    get_inappropriate_response,
    query_with_groq
)

# ------------------- MOCKS -------------------

@pytest.fixture
def mock_hf_pipeline():
    """Mock the Hugging Face feature-extraction pipeline."""
    with patch('core.rag_pipeline.pipeline') as mock_pipeline:
        mock_instance = MagicMock()
        # Mock the output to be a list of lists of floats, which is what the pipeline returns
        mock_embedding = [[[i * 0.1 for i in range(384)]]]
        mock_instance.return_value = mock_embedding
        mock_pipeline.return_value = mock_instance
        yield mock_pipeline

@pytest.fixture
def mock_chromadb():
    """Mock the ChromaDB vectorstore."""
    with patch('langchain_chroma.Chroma') as mock_chroma:
        mock_instance = MagicMock()
        mock_doc = MagicMock()
        mock_doc.page_content = "This is a test document."
        mock_instance.similarity_search_by_vector.return_value = [mock_doc]
        mock_chroma.return_value = mock_instance
        yield mock_chroma

@pytest.fixture
def mock_groq():
    """Mock the ChatGroq LLM."""
    with patch('core.rag_pipeline.ChatGroq') as mock_groq:
        mock_instance = MagicMock()
        mock_instance.invoke.return_value.content = "This is a mock LLM response."
        mock_groq.return_value = mock_instance
        yield mock_groq

@pytest.fixture
def mock_image_utils():
    """Mock the image utility functions."""
    with patch('core.rag_pipeline.query_image') as mock_query_image:
        with patch('core.rag_pipeline.query_equation') as mock_query_equation:
            mock_query_image.return_value = "A diagram of a circuit."
            mock_query_equation.return_value = "V = IR"
            yield mock_query_image, mock_query_equation

@pytest.fixture
def mock_duckduckgo():
    """Mock the DuckDuckGo search API."""
    with patch('core.rag_pipeline.DuckDuckGoSearchAPIWrapper') as mock_search:
        mock_instance = MagicMock()
        mock_instance.run.return_value = "This is a web search result."
        mock_search.return_value = mock_instance
        yield mock_search

# ------------------- TESTS -------------------

def test_embed_query(mock_hf_pipeline):
    """Test the query embedding function."""
    embedding = embed_query("test query")
    assert isinstance(embedding, list)
    assert len(embedding) > 0

def test_retrieve_relevant_docs(mock_hf_pipeline):
    """Test retrieving relevant documents from ChromaDB."""
    with patch('core.rag_pipeline.vectordb') as mock_vectordb:
        mock_doc = MagicMock()
        mock_doc.page_content = "This is a test document."
        mock_vectordb.similarity_search_by_vector.return_value = [mock_doc]
        docs = retrieve_relevant_docs("test query")
        assert len(docs) > 0
        assert docs[0].page_content == "This is a test document."

def test_ask_question(mock_hf_pipeline, mock_chromadb, mock_groq):
    """Test the main question-answering function."""
    response = ask_question("What is Ohm's Law?")
    assert response.content == "This is a mock LLM response."

def test_answer_from_image(mock_hf_pipeline, mock_chromadb, mock_groq, mock_image_utils):
    """Test the image-based question-answering function."""
    response = answer_from_image("test_image.png")
    assert response == "This is a mock LLM response."

def test_web_search_context(mock_duckduckgo):
    """Test the web search fallback."""
    context = web_search_context("unusual query")
    assert context == "This is a web search result."

def test_greeting_detection():
    """Test the greeting detection logic."""
    assert is_greeting_or_general("hello")
    assert is_greeting_or_general("what can you do?")
    assert not is_greeting_or_general("What is photosynthesis?")

def test_inappropriate_detection():
    """Test the inappropriate content detection logic."""
    assert is_inappropriate("you are stupid")
    assert not is_inappropriate("you are smart")

def test_query_with_groq():
    """Test the main query function for the API."""
    with patch('scripts.rag_query_groq_api.ask_question') as mock_ask:
        mock_ask.return_value = "Mocked response"
        # Test normal query
        response = query_with_groq("some question")
        assert response == "Mocked response"

        # Test greeting
        response_greeting = query_with_groq("hi")
        assert response_greeting == get_showcase_response()

        # Test inappropriate
        response_inappropriate = query_with_groq("you are an idiot")
        assert response_inappropriate == get_inappropriate_response()
