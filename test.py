from scripts.rag_query_groq_api import ask_question, answer_from_image
from dotenv import load_dotenv
import os
load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def test_text_query():
    query = "What is the function of the nucleus in a cell?"
    print("\n🔍 Text Query:", query)
    answer = ask_question(query)
    print("📘 Answer:", answer)

def test_image_query():
    image_path = "sample_diagram.jpg"  # Update with a valid image path
    print("\n🖼️ Image Query:", image_path)
    answer = answer_from_image(image_path)
    print("📘 Answer:", answer)

if __name__ == "__main__":
    print("🔧 Running LearnMate Tests...\n")
    
    print("=== Test 1: Text Query ===")
    test_text_query()
    
    print("\n=== Test 2: Image Query ===")
    test_image_query()
