import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.documents import Document
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
        temperature=0.3

    )

    

    prompt = f"""You are a friendly and helpful tutor who explains Science and Maths concepts to school students in Hinglish (a mix of Hindi and English), like a cool and relatable elder friend.
      Use casual, engaging language, simple analogies, and emoji where helpful. Avoid formal textbook language. Your tone should feel like you're chatting with a friend over chai.

        When explaining any topic:
        1. Start with a fun or friendly hook.
        2. Give a simple, intuitive explanation in Hinglish.
        3. Add 1-2 real-life or funny examples that students can relate to.
        4. End with a short recap or punchy line.

        Now explain the following concept in this Hinglish, friend-style tone:

        \n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer:"""

    return llm.invoke(prompt)

def answer_from_image(image_path):
    caption = query_image(image_path)
    ocr_text = query_equation(image_path)
    query_text = f"{caption}. {ocr_text}"
    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.3

    )

    embedding = embed_query(query_text)
    docs = vectordb.similarity_search_by_vector(embedding, k=4)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""You are an educational assistant helping students.
                Context:\n{context}
                Image Caption:\n{caption}
                Equation:\n{ocr_text}
                Answer in simple terms:"""

    return llm.invoke(prompt)


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
