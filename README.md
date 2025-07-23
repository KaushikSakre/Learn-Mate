# LearnMate 🧠📚

**LearnMate** is an AI-powered, multimodal educational tutor that helps middle and high school students understand science and math concepts through diagrams, equations, and natural language queries.

It supports queries in Hinglish and uses vision-language models, retrieval-augmented generation (RAG), and LLMs hosted on Groq to deliver clear, curriculum-aligned, student-friendly answers.

---

## 🚀 Features

- 📸 **Image Understanding**: Upload science/math diagrams for automatic captioning using BLIP-2.
- 🔍 **Curriculum-Aware Retrieval**: Context is fetched from NCERT-like content using embeddings and ChromaDB.
- 🤖 **LLM-Powered QA**: Groq-hosted models (Mixtral, LLaMA-3) explain diagrams or solve equations clearly.
- 💬 **Multilingual Queries**: Supports Hinglish and informal student-style questions.
- ⚙️ **Modular & Portable**: Built with FastAPI, React, LangChain, and can be deployed with Docker.

---

## 🧱 Tech Stack

| Component          | Tool / Framework                           |
|--------------------|---------------------------------------------|
| Image Captioning   | [BLIP-2 via LAVIS](https://github.com/salesforce/LAVIS) |
| Text Embeddings    | sentence-transformers                      |
| Vector DB          | [ChromaDB](https://www.trychroma.com/)     |
| LLMs               | Groq-hosted Mixtral-8x7B / LLaMA-3          |
| RAG Orchestration  | LangChain                                  |
| Backend API        | FastAPI                     |
| Frontend UI        | React + TypeScript                     |
| Deployment         | Docker, Docker Compose                     |
| Dev Platform       | Google Colab + GitHub Codespaces           |

---

## 📁 Project Structure

```bash
learnmate/
├── core/          # Core logic: vision, retrieval, LLM, FastAPI app
├── ui/            # React frontend
├── data/
│   └── raw_pdfs/
│       ├── science_class9/
│       │   ├── ch1.pdf
│       │   ├── ch2.pdf
│       ├── science_class10/
│       │   ├── ch1.pdf
│       │   ├── ch2.pdf
│       ├── math_class9/
│       │   ├── ch1.pdf
│       └── math_class10/
│           ├── ch1.pdf
│           └── ch2.pdf
│    └── docs/
│        ├── science_class9/
│        │   ├── ch1.txt
│        │   ├── ch2.txt
│        ├── math_class10/
│        │   ├── ch1.txt
│        │   └── ch2.txt
├── notebooks/     # Colab notebooks for prototyping
├── Dockerfile
├── .dockerignore
├── README.md
└── .gitignore


```

---

## 🛠️ Setup & Run

### Without Docker

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/learnmate.git
   cd learnmate
   ```

2. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add your `HF_API_TOKEN` and `GROQ_API_KEY`.

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend**:
    ```bash
    uvicorn core.main:app --reload
    ```

5. **Install frontend dependencies**:
    ```bash
    cd ui
    npm install
    ```

6. **Run the frontend**:
    ```bash
    npm start
    ```

### With Docker

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/learnmate.git
   cd learnmate
   ```

2. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add your `HF_API_TOKEN` and `GROQ_API_KEY`.

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Access**:
   - **Backend**: `http://localhost:8000`
   - **Frontend**: `http://localhost:3000`

---

## 📝 TODO & Next Steps

- [ ] **Frontend**: Build out the React UI for chat and file handling.
- [ ] **RAG**: Fine-tune retrieval with better chunking and metadata.
- [ ] **Deployment**: Set up a production-ready Docker Compose config.
- [ ] **Testing**: Add unit and integration tests.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🙏 Acknowledgements

- [Hugging Face](https://huggingface.co/) for the models and libraries.
- [Groq](https://groq.com/) for the fast LLM inference.
- [LangChain](https://www.langchain.com/) for the RAG framework.
- [ChromaDB](https://www.trychroma.com/) for the vector store.

---