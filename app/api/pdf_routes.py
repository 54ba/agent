from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_service import PDFService
from app.core.config import settings
import os
import shutil
from typing import List, Dict

router = APIRouter()
pdf_service = PDFService()

@router.post("/upload", response_model=List[Dict])
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload and process a PDF file
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Check file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    while chunk := await file.read(chunk_size):
        file_size += len(chunk)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

    # Reset file pointer
    await file.seek(0)

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save the uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    try:
        # Process the PDF
        chunks = await pdf_service.process_pdf(file_path)
        return chunks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    finally:
        # Clean up the uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract raw text from a PDF file
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Check file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    while chunk := await file.read(chunk_size):
        file_size += len(chunk)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

    # Reset file pointer
    await file.seek(0)

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save the uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    try:
        # Extract text from PDF
        text = await pdf_service.extract_text(file_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")
    finally:
        # Clean up the uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)