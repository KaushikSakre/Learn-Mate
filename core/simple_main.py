from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid
import os
from datetime import datetime

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "chat_history.db"

# ------------------- DB SETUP -------------------

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            name TEXT,
            created_at TEXT
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp TEXT
        )""")
        conn.commit()

init_db()

# ------------------- MODELS -------------------

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

# ------------------- SIMPLE RESPONSES -------------------

def simple_tutor_response(user_message: str) -> str:
    """Simple response function for testing without ML models"""
    message_lower = user_message.lower()
    
    if any(word in message_lower for word in ['photosynthesis', 'plant', 'chlorophyll']):
        return """🌱 Arre yaar, photosynthesis ka matlab hai plants apna khana banate hain! 

Imagine karo ki plants ke paas ek magic kitchen hai called chloroplast. Yahan pe:
- Sunlight = cooking fuel 🌞
- Carbon dioxide = main ingredient (from air) 🌬️
- Water = liquid ingredient (from roots) 💧

Plant ye sab mix karke glucose (sugar) banata hai, jo uska food hai! Aur as a bonus, oxygen bhi release karta hai jo humein saans lene ke liye milta hai.

Formula yaad rakho: 6CO₂ + 6H₂O + sunlight → C₆H₁₂O₆ + 6O₂

Simple hai na? Plants humare liye oxygen banate hain, aur hum unke liye CO₂! Perfect partnership! 🤝"""

    elif any(word in message_lower for word in ['math', 'algebra', 'equation', 'solve']):
        return """📊 Math mein problem ho rahi hai? No worries yaar!

Algebra solve karne ka basic mantra:
1. **Pehle simplify karo** - brackets open karo, like terms collect karo
2. **Variable ko ek side rakho** - numbers dusri side
3. **Step by step** - ek baar mein sab kuch mat karo

Example: 2x + 5 = 15
- Pehle 5 ko right side bhejo: 2x = 15 - 5
- 2x = 10
- Dono sides ko 2 se divide: x = 5

Pro tip: Jo bhi operation left side pe karo, same right side pe bhi karo! Balance maintain rakho, jaise see-saw! ⚖️

Koi specific problem hai? Share karo, solve kar denge! 💪"""

    elif any(word in message_lower for word in ['force', 'motion', 'newton', 'physics']):
        return """⚡ Physics ka sawaal? Mazaa aa gaya!

Newton ke laws yaad rakho:
1. **First Law**: Agar koi force nahi laga rahe, toh object rest mein rest, motion mein motion rahega
   - Example: Moving bus mein sudden brake = you move forward! 🚌

2. **Second Law**: F = ma (Force = mass × acceleration)
   - Heavy cricket ball vs tennis ball - same force, different acceleration! 🏏

3. **Third Law**: Every action has equal and opposite reaction
   - Tum wall ko push karo, wall tumhe wapas push karegi! 🤲

Real life examples:
- Walking = you push ground, ground pushes you forward
- Rocket = gases neeche, rocket upar! 🚀

Physics is everywhere around us, bas observe karna hai! What specific concept explain karoon? 🤔"""

    elif any(word in message_lower for word in ['hello', 'hi', 'namaste', 'hey']):
        return """🙋‍♂️ Namaste! LearnMate yahan hai! 

Main tumhara AI dost hoon jo Science aur Math sikhata hai Hinglish mein. Bilkul chill environment mein, jaise friend ke saath chai pe baat kar rahe ho! ☕

Kuch bhi pooch sakte ho:
📚 **Science**: Biology, Chemistry, Physics
🔢 **Math**: Algebra, Geometry, Calculus
🖼️ **Images**: Diagrams, equations, graphs upload kar sakte ho!

Koi specific topic chahiye? Just ask! Main explain karunga simple examples ke saath. Let's make learning fun! 🎉"""

    else:
        return f"""🤔 Interesting question about "{user_message}"!

Main samjh gaya ki tum ye jaanna chahte ho. Lekin abhi main sirf basic Science aur Math topics pe help kar sakta hoon.

Try karo ye topics:
🧬 **Biology**: Photosynthesis, Respiration, Cells
⚗️ **Chemistry**: Atoms, Molecules, Reactions  
⚡ **Physics**: Force, Motion, Energy
📐 **Math**: Algebra, Geometry, Equations

Ya phir koi specific diagram upload karo, main explain kar dunga! Image bhi bhej sakte ho for better understanding.

Koi aur question? Main ready hoon! 💪"""

# ------------------- ROUTES -------------------

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        session_id = request.session_id
        user_message = request.user_message

        if not user_message.strip():
            return JSONResponse(
                status_code=400,
                content={"error": "Message cannot be empty"}
            )

        # Save user message
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "user", user_message, datetime.now().isoformat())
            )

        # Get simple tutor response
        response = simple_tutor_response(user_message)

        # Save assistant reply
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "assistant", response, datetime.now().isoformat())
            )

        return {"response": response}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/session")
def create_session(name: Optional[str] = None):
    try:
        session_id = str(uuid.uuid4())
        session_name = name or f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO sessions VALUES (?, ?, ?)", 
                        (session_id, session_name, datetime.now().isoformat()))
        return {"session_id": session_id, "name": session_name}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to create session: {str(e)}"}
        )

@app.get("/sessions")
def get_sessions():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            sessions = conn.execute("SELECT id, name, created_at FROM sessions ORDER BY created_at DESC").fetchall()
        return [{"id": s[0], "name": s[1], "created_at": s[2]} for s in sessions]
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to retrieve sessions: {str(e)}"}
        )

@app.get("/session/{session_id}")
def get_session_messages(session_id: str):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            msgs = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp", (session_id,)).fetchall()
        return [{"role": r, "content": c} for r, c in msgs]
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to retrieve messages: {str(e)}"}
        )

@app.post("/chat/image")
async def chat_with_image(
    session_id: str = Form(...),
    user_message: str = Form(""),
    file: UploadFile = File(...)
):
    try:
        if not file.content_type.startswith('image/'):
            return JSONResponse(
                status_code=400,
                content={"error": "Only image files are supported"}
            )

        # For now, just acknowledge the image upload
        user_content = f"{user_message} [Image: {file.filename}]" if user_message else f"[Image: {file.filename}]"
        
        response = """🖼️ Image upload detected! 

Main dekh sakta hoon ki tumne ek image bheja hai. Abhi main basic text responses de sakta hoon, lekin image processing feature jaldi add hoga!

Meanwhile, agar koi specific question hai image ke baare mein, toh text mein describe kar sakte ho:
- Kya hai image mein? (diagram, equation, graph?)
- Kaunsa topic related hai?
- Kya samajhna hai exactly?

Main try karunga best explanation dene ki! 💪

Image processing feature coming soon... stay tuned! 🚀"""
        
        # Save user message
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "user", user_content, datetime.now().isoformat())
            )

        # Save assistant reply
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), session_id, "assistant", response, datetime.now().isoformat())
            )

        return {"response": response}
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process image: {str(e)}"}
        )

@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            # Delete messages first
            conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            # Delete session
            conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            conn.commit()
        return {"message": "Session deleted successfully"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to delete session: {str(e)}"}
        )

@app.get("/")
def root():
    return {"message": "LearnMate API is running! 🧠📚", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)