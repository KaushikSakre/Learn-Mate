import os
from PIL import Image
import pytesseract
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
from dotenv import load_dotenv

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not HF_API_TOKEN or not GROQ_API_KEY:
    raise ValueError("Missing required API key(s)!")

# ✅ Set fallback path to tesseract executable (Windows-specific)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"✅ Device set to: {device}")

# Load BLIP model and processor
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

def extract_text(image_path):
    image = Image.open(image_path).convert("RGB")
    return pytesseract.image_to_string(image)

def generate_caption(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    out = model.generate(**inputs, max_new_tokens=50)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption

def query_image(image_path: str) -> str:
    caption = generate_caption(image_path)
    print(f"🖼️ Image Caption: {caption}")
    return caption

def query_equation(image_path: str) -> str:
    text = extract_text(image_path)
    print(f"🔤 OCR Text: {text}")
    return text
