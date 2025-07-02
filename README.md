# LearnMate 🧠📚

**LearnMate** is an AI-powered, multimodal educational tutor that helps middle and high school students understand science and math concepts through diagrams, equations, and natural language queries.

It supports queries in Hinglish and uses vision-language models, retrieval-augmented generation (RAG), and LLMs hosted on Groq to deliver clear, curriculum-aligned, student-friendly answers.

---

## 🚀 Features

- 📸 **Image Understanding**: Upload science/math diagrams for automatic captioning using BLIP-2.
- 🔍 **Curriculum-Aware Retrieval**: Context is fetched from NCERT-like content using embeddings and ChromaDB.
- 🤖 **LLM-Powered QA**: Groq-hosted models (Mixtral, LLaMA-3) explain diagrams or solve equations clearly.
- 💬 **Multilingual Queries**: Supports Hinglish and informal student-style questions.
- ⚙️ **Modular & Portable**: Built with Django, React, LangChain, Docker — easy to extend and deploy.

---

## 🧱 Tech Stack

| Component          | Tool / Framework                           |
|--------------------|---------------------------------------------|
| Image Captioning   | [BLIP-2 via LAVIS](https://github.com/salesforce/LAVIS) |
| Text Embeddings    | sentence-transformers                      |
| Vector DB          | [ChromaDB](https://www.trychroma.com/)     |
| LLMs               | Groq-hosted Mixtral-8x7B / LLaMA-3          |
| RAG Orchestration  | LangChain                                  |
| Backend API        | Django / FastAPI (WIP)                     |
| Frontend UI        | React + TypeScript (WIP)                   |
| Deployment         | Docker, Docker Compose                     |
| Dev Platform       | Google Colab + GitHub Codespaces           |

---

## 📁 Project Structure (WIP)

```bash
learnmate/
├── core/          # Core logic: vision, retrieval, LLM
├── api/           # Django backend
├── ui/            # React frontend
├── data/          # Diagrams, equations, documents
├── notebooks/     # Colab notebooks for prototyping
├── docker/        # Docker-related config
├── README.md
└── .gitignore
