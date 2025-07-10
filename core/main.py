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
    message: str = Form(None),
    image: UploadFile = File(None)
):
    try:
        from core.query_handler import handle_query
        result = await handle_query(message, image)

        # Record chat message
        chat_history.append({"type": "user", "text": message or "(image)"})
        chat_history.append({"type": "bot", "text": result})

        return JSONResponse(content={"answer": result})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/history")
async def get_history():
    return JSONResponse(content={"history": chat_history})

