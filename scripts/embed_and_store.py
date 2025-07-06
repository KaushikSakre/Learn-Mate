import os
import glob
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import TextLoader
from langchain.schema import Document

# ----------- Config -----------
DATA_DIR = "data/docs/"
VECTOR_DB_DIR = "vectorstore/chroma_db/"
EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# ----------- Load and Chunk Texts -----------
def load_and_chunk_all_docs():
    all_docs = []

    for subject_class_folder in os.listdir(DATA_DIR):
        folder_path = os.path.join(DATA_DIR, subject_class_folder)
        if not os.path.isdir(folder_path):
            continue

        subject, class_name = subject_class_folder.split("_class")

        for txt_file in glob.glob(os.path.join(folder_path, "*.txt")):
            chapter_name = os.path.splitext(os.path.basename(txt_file))[0]

            loader = TextLoader(txt_file, encoding='utf-8')
            docs = loader.load()

            # Add metadata to each document
            for doc in docs:
                doc.metadata = {
                    "subject": subject,
                    "class": class_name,
                    "chapter": chapter_name
                }

            all_docs.extend(docs)

    print(f"✅ Loaded {len(all_docs)} documents.")
    return all_docs

# ----------- Split into Chunks -----------
def chunk_documents(docs, chunk_size=300, chunk_overlap=30):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunked_docs = splitter.split_documents(docs)
    print(f"🧩 Split into {len(chunked_docs)} chunks.")
    return chunked_docs

# ----------- Embed and Store in ChromaDB -----------
def embed_and_store(docs):
    embedding_model = SentenceTransformerEmbeddings(model_name=EMBED_MODEL)

    if not os.path.exists(VECTOR_DB_DIR):
        os.makedirs(VECTOR_DB_DIR)

    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embedding_model,
        persist_directory=VECTOR_DB_DIR
    )

    vectordb.persist()
    print(f"✅ Stored chunks in ChromaDB at: {VECTOR_DB_DIR}")

# ----------- MAIN -----------
def main():
    all_docs = load_and_chunk_all_docs()
    chunks = chunk_documents(all_docs)
    embed_and_store(chunks)

if __name__ == "__main__":
    main()
