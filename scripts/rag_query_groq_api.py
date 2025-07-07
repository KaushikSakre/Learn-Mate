import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.documents import Document

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
        model="llama3-8b-8192",
        api_key=GROQ_API_KEY,
        temperature=0.3

    )

    prompt = f"""You are an educational assistant helping middle and high school students. 
Use the provided context from textbooks to answer the question clearly, in simple language.
\n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer:"""

    return llm.invoke(prompt)

# ----------- MAIN -----------
if __name__ == "__main__":
    user_query = input("🔎 Enter your question: ")
    answer = ask_question(user_query)
    print(f"\n📘 Answer:\n{answer}")
