from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from core.query_handler import handle_query
from fastapi.responses import JSONResponse

app = FastAPI()

# Allow local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = []

@app.post("/query")
async def query_api(
    session_name: str = Form(...),
    message: str = Form(None),
    image: UploadFile = File(None)
):
    try:
        result = await handle_query(message, image, session_name)
        return JSONResponse(content={"answer": result})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/sessions")
def get_sessions():
    from core.db import sqlite3, DB_PATH
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name FROM sessions ORDER BY created_at DESC")
    return {"sessions": [row[0] for row in c.fetchall()]}


@app.get("/history")
async def get_history():
    return JSONResponse(content={"history": chat_history})

