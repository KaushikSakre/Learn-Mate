import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os

def extract_text_with_tesseract(image):
    return pytesseract.image_to_string(image)

def extract_text_from_pdf(pdf_path, chapter_number, image_output_dir):
    all_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and len(text.strip()) > 50:
                    all_text += text + "\n\n"
                else:
                    # Fallback to OCR if pdfplumber fails or returns very little text
                    print(f"⚠️  Using OCR on page {i+1} of {chapter_number}")
                    images = convert_from_path(pdf_path, dpi=300, first_page=i+1, last_page=i+1)
                    ocr_text = extract_text_with_tesseract(images[0])
                    all_text += ocr_text + "\n\n"

                    # Save the page image for later diagram analysis
                    image_path = os.path.join(image_output_dir, f"{chapter_number}_page{i+1}.jpg")
                    images[0].save(image_path)
    except Exception as e:
        print(f"❌ Error reading {pdf_path}: {e}")
    return all_text

def main():
    input_root = "data/raw_pdfs/"
    output_text_root = "data/docs/"
    output_image_root = "data/images/"

    for subject_class_folder in os.listdir(input_root):
        folder_path = os.path.join(input_root, subject_class_folder)
        if not os.path.isdir(folder_path):
            continue

        subject, class_name = subject_class_folder.split("_class")
        output_text_folder = os.path.join(output_text_root, subject_class_folder)
        output_image_folder = os.path.join(output_image_root, subject_class_folder)
        os.makedirs(output_text_folder, exist_ok=True)
        os.makedirs(output_image_folder, exist_ok=True)

        for pdf_file in os.listdir(folder_path):
            if not pdf_file.endswith(".pdf"):
                continue

            chapter_number = pdf_file.replace(".pdf", "")  # e.g., ch1
            input_path = os.path.join(folder_path, pdf_file)
            output_text_path = os.path.join(output_text_folder, f"{chapter_number}.txt")

            print(f"🔍 Processing {pdf_file}...")
            text = extract_text_from_pdf(input_path, chapter_number, output_image_folder)

            with open(output_text_path, "w", encoding="utf-8") as f:
                f.write(text)

            print(f"✅ Extracted: {output_text_path}")

if __name__ == "__main__":
    main()
