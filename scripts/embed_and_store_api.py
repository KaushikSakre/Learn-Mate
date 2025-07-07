import os
import glob
from dotenv import load_dotenv
from transformers import pipeline
from langchain_core.embeddings import Embeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.schema import Document

# ----------- Load API Key -----------
load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
if not HF_API_TOKEN:
    raise ValueError("❌ HF_API_TOKEN not found in environment!")

# ----------- Config -----------
DATA_DIR = "data/docs/"
VECTOR_DB_DIR = "vectorstore/chroma_db/"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# ----------- Custom Wrapper -----------
class HFAPIEmbeddingWrapper(Embeddings):
    def __init__(self, model_id: str, hf_token: str):
        self.extractor = pipeline(
            "feature-extraction",
            model=model_id,
            token=hf_token,
            return_tensors=False
        )

    def embed_documents(self, texts):
        return [self.extractor(text)[0][0] for text in texts]

    def embed_query(self, text):
        return self.extractor(text)[0][0]

# ----------- Load & Chunk -----------
def load_and_chunk_all_docs():
    all_docs = []
    for subject_class_folder in os.listdir(DATA_DIR):
        folder_path = os.path.join(DATA_DIR, subject_class_folder)
        if not os.path.isdir(folder_path):
            continue
        subject, class_name = subject_class_folder.split("_class")
        for txt_file in glob.glob(os.path.join(folder_path, "*.txt")):
            chapter = os.path.splitext(os.path.basename(txt_file))[0]
            loader = TextLoader(txt_file, encoding='utf-8')
            docs = loader.load()
            for doc in docs:
                doc.metadata = {
                    "subject": subject,
                    "class": class_name,
                    "chapter": chapter
                }
            all_docs.extend(docs)
    print(f"✅ Loaded {len(all_docs)} documents.")
    return all_docs

def chunk_documents(docs, chunk_size=300, chunk_overlap=30):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunks = splitter.split_documents(docs)
    print(f"🧩 Split into {len(chunks)} chunks.")
    return chunks

# ----------- Embed & Store -----------
def embed_and_store(docs):
    embedding_model = HFAPIEmbeddingWrapper(
        model_id=MODEL_NAME,
        hf_token=HF_API_TOKEN
    )
    if not os.path.exists(VECTOR_DB_DIR):
        os.makedirs(VECTOR_DB_DIR)

    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embedding_model,
        persist_directory=VECTOR_DB_DIR
    )
    
    print(f"✅ Stored chunks in ChromaDB at: {VECTOR_DB_DIR}")

# ----------- Main -----------
def main():
    docs = load_and_chunk_all_docs()
    chunks = chunk_documents(docs)
    embed_and_store(chunks)

if __name__ == "__main__":
    main()
