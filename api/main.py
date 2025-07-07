from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from core.image_utils import process_diagram, process_equation, process_question

app = FastAPI()

@app.post("/upload/diagram")
async def upload_diagram(file: UploadFile = File(...)):
    caption = await process_diagram(file)
    return JSONResponse({"caption": caption})

@app.post("/upload/equation")
async def upload_equation(file: UploadFile = File(...)):
    equation = await process_equation(file)
    return JSONResponse({"equation": equation})

@app.post("/upload/question")
async def upload_question(file: UploadFile = File(...)):
    answer = await process_question(file)
    return JSONResponse({"answer": answer})
