from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from typing import List, Dict
import os

class PDFService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def process_pdf(self, file_path: str) -> List[Dict]:
        """
        Process a PDF file and return its content in chunks
        """
        try:
            # Load PDF
            loader = PyPDFLoader(file_path)
            pages = loader.load()

            # Split text into chunks
            chunks = self.text_splitter.split_documents(pages)

            # Convert chunks to dictionary format
            processed_chunks = []
            for chunk in chunks:
                processed_chunks.append({
                    "content": chunk.page_content,
                    "metadata": chunk.metadata
                })

            return processed_chunks

        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    async def extract_text(self, file_path: str) -> str:
        """
        Extract raw text from PDF
        """
        try:
            loader = PyPDFLoader(file_path)
            pages = loader.load()
            return "\n".join([page.page_content for page in pages])
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")