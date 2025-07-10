import os
import tempfile
import datetime
import json

from core.rag_pipeline import (
    ask_question,
    answer_from_image,
    embed_query,
    vectordb,
    query_image,
    query_equation
)

def save_to_history(user_input, bot_reply):
    log = {
        "timestamp": datetime.datetime.now().isoformat(),
        "user": user_input,
        "bot": bot_reply
    }
    with open("chat_logs.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(log) + "\n")

async def handle_query(message, image):
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    load_dotenv()

    # 🧠 Case 1: Both message and image provided
    if message and image:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            contents = await image.read()
            tmp.write(contents)
            tmp_path = tmp.name

        caption = query_image(tmp_path)
        ocr_text = query_equation(tmp_path)
        query_text = f"{message}. {caption}. {ocr_text}"

        embedding = embed_query(query_text)
        docs = vectordb.similarity_search_by_vector(embedding, k=4)
        context = "\n\n".join([doc.page_content for doc in docs])

        prompt = f"""You are an educational assistant helping students.
Context: {context}
Image Caption: {caption}
Equation: {ocr_text}
Question: {message}
Answer in simple terms:"""

        llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
        response = llm.invoke(prompt)
        answer = response.content
        save_to_history(query_text, answer)
        return answer

    # 💬 Case 2: Only message
    elif message:
        answer = ask_question(message).content
        save_to_history(message, answer)
        return answer

    # 🖼️ Case 3: Only image
    elif image:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            contents = await image.read()
            tmp.write(contents)
            tmp_path = tmp.name

        answer = answer_from_image(tmp_path).content
        save_to_history("(image only)", answer)
        return answer

    else:
        return "❌ Please provide a question or image."
