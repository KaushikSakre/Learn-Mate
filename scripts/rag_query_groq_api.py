import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.documents import Document
from core.image_utils import query_image, query_equation

# ----------- Load Environment Variables -----------
load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print(f"Debug - GROQ_API_KEY loaded: {'Yes' if GROQ_API_KEY else 'No'}")
print(f"Debug - API key starts with: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'None'}...")

if not HF_API_TOKEN or not GROQ_API_KEY:
    raise ValueError("Missing required API key(s)!")

# ----------- Config -----------
VECTOR_DB_DIR = "vectorstore/chroma_db/"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# ----------- Embed Query using HF pipeline -----------
def embed_query(text):
    extractor = pipeline(
        "feature-extraction",
        model=MODEL_NAME,
        token=HF_API_TOKEN,
        truncation=True
    )
    output = extractor(text, truncation=True)
    embedding = [sum(col) / len(col) for col in zip(*output[0])]
    return embedding

# ----------- Initialize Vectorstore -----------
vectordb = Chroma(
    persist_directory=VECTOR_DB_DIR,
    embedding_function=None  # We will manually embed queries
)

# ----------- Query Handling -----------
def retrieve_relevant_docs(query, k=4):
    query_embedding = embed_query(query)
    return vectordb.similarity_search_by_vector(query_embedding, k=k)

# ----------- QA Chain with Groq LLM -----------
def ask_question(query):
    docs = retrieve_relevant_docs(query)
    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGroq(
        model="llama3-70b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.9
    )

    

    prompt = f"""You MUST respond ONLY in Hinglish (Hindi + English mix). DO NOT use pure English. You are a desi bhai/didi who teaches students in a fun, casual way.

IMPORTANT: Use Hindi words mixed with English like this example:
"Arre yaar, quadratic equations toh bilkul simple hai! Dekho, jaise ghar mein chai banate time sugar aur milk ka perfect balance chahiye, waise hi x² + bx + c = 0 mein bhi balance chahiye. Formula yaad karo: x = (-b ± √(b²-4ac))/2a. Bas isme values substitute kar do aur answer mil jayega!"

REQUIRED Hinglish words to use:
- yaar, arre, dekho, samjho, kya, hai, hoga, hogaya, bilkul, simple, easy
- bas, toh, waise, jaise, matlab, yaad, karo, kar do, mil jayega
- ghar, school, chai, khana, paani, time, problem, solution
- baat, cheez, concept, formula, method, step, answer

Your response style:
1. Start with VARIED greetings: "Dekho", "Samjho", "Accha", "Theek hai", "Chalo", "Suno", "Baat ye hai" (avoid repeating "Arre yaar")
2. Mix Hindi-English throughout (NOT just at the beginning)
3. Use analogies from daily Indian life (chai, cricket, Bollywood, ghar, school)
4. End with encouraging Hinglish phrases like "bas itna hi!", "samjh gaya na?", "clear hai?", "ho gaya!"

Context: {context}
Question: {query}

STRICT RULE: If you respond in pure English, you FAIL. Use VARIED starters like "Dekho", "Samjho", "Accha", "Chalo" and mix Hindi words like hai, mein, ka, ki, ye, bas, toh, bilkul in EVERY sentence!

Example templates: 
- "Dekho yaar, [concept] toh simple hai! Jaise [analogy]..."
- "Samjho, [topic] ka matlab ye hai ki [explanation]..."
- "Accha toh [concept] mein [explanation]. Bas [method] karo..."

NOW RESPOND IN HINGLISH ONLY:"""

    return llm.invoke(prompt)

def answer_from_image(image_path):
    caption = query_image(image_path)
    ocr_text = query_equation(image_path)
    query_text = f"{caption}. {ocr_text}"
    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.9
    )

    embedding = embed_query(query_text)
    docs = vectordb.similarity_search_by_vector(embedding, k=4)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""You MUST respond ONLY in Hinglish (Hindi + English mix). DO NOT use pure English. You are a desi bhai/didi explaining images to students.

COMPULSORY Hinglish mixing example:
"Arre yaar, is image mein maine dekha ki ye quadratic equation hai! Dekho, jaise mummy kitchen mein recipe follow karti hai step-by-step, waise hi hum bhi is problem ko solve karenge. Pehle discriminant nikaalte hai, phir formula apply karte hai. Bas itna simple hai!"

REQUIRED Hindi words to mix:
- arre, yaar, dekho, samjho, kya, hai, mein, se, ka, ki, ye, is, bas, toh
- pehle, phir, ab, bilkul, simple, easy, problem, solution, answer
- image, photo, equation, formula, method, step

For images:
1. Start with VARIETY: "Dekho, is image mein...", "Samjho, yahan...", "Accha, is photo mein..."
2. Explain what you see in Hinglish
3. Solve step-by-step mixing Hindi-English
4. End: "Bas ho gaya!", "Samjh gaya na?", "Clear hai?", "Simple tha na?"

Context: {context}
Image Caption: {caption}
Equation/Text: {ocr_text}

REMEMBER: Use continuous Hinglish mixing throughout, not just at start!"""

    return llm.invoke(prompt)

# ----------- Greeting Detection -----------
def is_greeting_or_general(message):
    """Check if message is a greeting or general conversation starter"""
    greetings = [
        'hi', 'hello', 'hey', 'namaste', 'hola', 'good morning', 'good evening', 
        'good afternoon', 'how are you', 'what\'s up', 'whats up', 'sup',
        'hii', 'hiii', 'hiiii', 'heyyy', 'heyy', 'helloo', 'helloooo'
    ]
    
    general_queries = [
        'what can you do', 'help me', 'what are you', 'who are you',
        'what is this', 'how does this work', 'can you help', 'tell me about yourself'
    ]
    
    message_lower = message.lower().strip()
    return any(greeting in message_lower for greeting in greetings + general_queries)

def get_showcase_response():
    """Return a response that showcases the model's capabilities"""
    return """Namaste! 👋 Main hoon tumhara desi LearnMate tutor! 

Dekho yaar, mujhse tum ye sab puch sakte ho:

📚 **Maths aur Science ke topics:**
- "Quadratic equations kaise solve karte hai bhai?"
- "Photosynthesis ka concept samjha do yaar"
- "Triangles ki properties kya hai?"

🖼️ **Images ka analysis:**
- Math problems ki photos upload karo yaar
- Diagrams aur graphs explain kar dunga bilkul
- Equations solve kar deta hoon step-by-step

💬 **Mera teaching style:**
- Bilkul simple Hinglish mein samjhata hoon
- Real-life examples deta hoon ghar se, school se
- Step-by-step solution provide karta hoon bas

Koi bhi Class 9-10 ka Maths ya Science ka sawal poocho - main bilkul detail mein samjhaunga! ✨

Toh batao yaar, aaj kya seekhna hai? Kya problem solve karni hai? 🤔"""

def is_inappropriate(message):
    """Basic inappropriate content detection"""
    inappropriate_words = [
        'stupid', 'idiot', 'hate', 'kill', 'die', 'death', 'violence',
        'abuse', 'harassment', 'offensive', 'racist', 'sexist'
    ]
    
    message_lower = message.lower()
    return any(word in message_lower for word in inappropriate_words)

def get_inappropriate_response():
    """Response for inappropriate inputs"""
    return """Sorry, but I'm here to help with your studies in a positive way! 😊

Let's focus on learning Math and Science topics. Ask me about:
- Algebra, Geometry, Trigonometry
- Physics, Chemistry, Biology
- Problem solving and concepts

Koi study-related question poocho - I'm here to help! 📚✨"""

# ----------- Query with Groq (for API) -----------
def query_with_groq(user_message, history=None):
    """Main function to query with Groq - used by the API"""
    try:
        # Check for inappropriate content first
        if is_inappropriate(user_message):
            return get_inappropriate_response()
        
        # Check if it's a greeting or general query
        if is_greeting_or_general(user_message):
            return get_showcase_response()
        
        # Regular subject-specific query
        result = ask_question(user_message)
        return result.content if hasattr(result, 'content') else str(result)
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"

# ----------- MAIN -----------
if __name__ == "__main__":
    choice = input("📝 Type 'text' for question or 'image' for diagram/equation: ").strip().lower()

    if choice == "text":
        user_query = input("🔎 Enter your question: ")
        answer = ask_question(user_query)
    elif choice == "image":
        image_path = input("🖼️ Enter path to image (e.g. sample.png): ")
        answer = answer_from_image(image_path)
    else:
        answer = "❌ Invalid input. Please type 'text' or 'image'."

    print(f"\n📘 Answer:\n{answer}")
