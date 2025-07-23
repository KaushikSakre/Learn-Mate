import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
from core.image_utils import query_image, query_equation

# ----------- Load Environment Variables -----------
load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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
    output = extractor(text)
    embedding = [sum(col) / len(col) for col in zip(*output[0])]
    return embedding

# ----------- Initialize Vectorstore -----------
vectordb = Chroma(
    persist_directory=VECTOR_DB_DIR,
    embedding_function=None
)

# ----------- Query Handling -----------
def retrieve_relevant_docs(query, k=4):
    query_embedding = embed_query(query)
    return vectordb.similarity_search_by_vector(query_embedding, k=k)

# ----------- Web Fallback -----------
def web_search_context(query):
    search = DuckDuckGoSearchAPIWrapper()
    return search.run(query)

# ----------- QA Chain with Groq LLM -----------
def ask_question(query: str) -> str:
    docs = retrieve_relevant_docs(query)
    if docs:
        context = "\n\n".join([doc.page_content for doc in docs])
    else:
        context = web_search_context(query)

    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.9
    )

    prompt = f"""
    
    You are a cool and accessible tutor who talks to schoolchildren about Science and Maths in the Hinglish (a Lebanized form of Hindi and English), a friendly elder sibling.
    Make it conversational, interactive, and use easy comparisons, and emojis. There is no need to use prose of textbooks. The tone with which you use it should be as though you are conversing with a friend on chai.

        When explaining any topic:
        1. Start with a fun or friendly hook.
        2. Give a simple, intuitive explanation in Hinglish.
        3. Add 1-2 real-life or funny examples that students can relate to.
        4. End with a short recap or punchy line.

        Now explain the following concept in this Hinglish, friend-style tone:
Context:
{context}

Question: {query}

Answer:"""

    return llm.invoke(prompt)

# ----------- Handle Image-Based Questions -----------
def answer_from_image(image_path: str) -> str:
    caption = query_image(image_path)
    ocr_text = query_equation(image_path)
    query_text = f"{caption}. {ocr_text}"

    embedding = embed_query(query_text)
    docs = vectordb.similarity_search_by_vector(embedding, k=4)
    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.9
    )

    prompt = f"""You MUST respond ONLY in Hinglish (Hindi + English mix). DO NOT use pure English. You are a desi tutor.

COMPULSORY Hinglish style example:
"Arre yaar, is image mein maine dekha ki ye physics ka problem hai! Dekho, jaise ghar mein light switch on karte hai toh current flow hota hai, waise hi circuit mein bhi hota hai. Ohm's law yaad hai na? V = IR. Bas isme values substitute kar do aur answer mil jayega!"

MUST use these Hindi words mixed with English:
- arre, yaar, dekho, samjho, hai, mein, se, ka, ye, is, bas, toh, bilkul
- pehle, phir, ab, simple, problem, solution, answer, yaad, karo

Context: {context}
Image Caption: {caption}
Equation: {ocr_text}

CRITICAL: Mix Hindi-English continuously throughout your response!"""

    return llm.invoke(prompt).content
