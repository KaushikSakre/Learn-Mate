import os
import tempfile
import datetime
import json
from langchain_groq import ChatGroq
from core.rag_pipeline import (
    ask_question,
    answer_from_image,
    embed_query,
    vectordb,
    query_image,
    query_equation
)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def save_to_history(user_input, bot_reply):
    log = {
        "timestamp": datetime.datetime.now().isoformat(),
        "user": user_input,
        "bot": bot_reply
    }
    with open("chat_logs.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(log) + "\n")

from core.db import init_db, get_or_create_session, save_message, get_chat_history
init_db()  # ensure db exists

async def handle_query(message, image, session_name):
    from langchain.schema import AIMessage, HumanMessage
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    load_dotenv()

    session_id = get_or_create_session(session_name)

    if message and image:
        # same as before...
        # combine caption + ocr + message into prompt
        # ...
        prompt = f"..."  # from earlier

    elif message:
        history = get_chat_history(session_id)
        messages = [HumanMessage(content=h['content']) if h['role'] == 'user' 
                    else AIMessage(content=h['content']) for h in history]
        messages.append(HumanMessage(content=message))

        llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
        response = llm.invoke(messages)

        save_message(session_id, "user", message)
        save_message(session_id, "assistant", response.content)

        return response.content

    elif image:
        # use image + ocr and return answer, optionally save to history
        # ...
        return "🖼️ Answer from image..."

    return "❌ No input."

