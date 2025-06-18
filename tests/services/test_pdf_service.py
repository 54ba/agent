import pytest
from app.services.pdf_service import PDFService
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_process_pdf_success():
    service = PDFService()
    fake_file_path = "fake.pdf"
    fake_pages = [MagicMock(page_content="Page 1", metadata={"page": 1}), MagicMock(page_content="Page 2", metadata={"page": 2})]
    
    with patch("app.services.pdf_service.PyPDFLoader") as MockLoader:
        instance = MockLoader.return_value
        instance.load.return_value = fake_pages
        chunks = await service.process_pdf(fake_file_path)
        assert isinstance(chunks, list)
        assert len(chunks) > 0
        assert "content" in chunks[0]
        assert "metadata" in chunks[0]

@pytest.mark.asyncio
async def test_extract_text_success():
    service = PDFService()
    fake_file_path = "fake.pdf"
    fake_pages = [MagicMock(page_content="Page 1"), MagicMock(page_content="Page 2")]
    
    with patch("app.services.pdf_service.PyPDFLoader") as MockLoader:
        instance = MockLoader.return_value
        instance.load.return_value = fake_pages
        text = await service.extract_text(fake_file_path)
        assert text == "Page 1\nPage 2"

@pytest.mark.asyncio
async def test_process_pdf_error():
    service = PDFService()
    fake_file_path = "fake.pdf"
    with patch("app.services.pdf_service.PyPDFLoader", side_effect=Exception("Load error")):
        with pytest.raises(Exception) as exc:
            await service.process_pdf(fake_file_path)
        assert "Error processing PDF" in str(exc.value)

@pytest.mark.asyncio
async def test_extract_text_error():
    service = PDFService()
    fake_file_path = "fake.pdf"
    with patch("app.services.pdf_service.PyPDFLoader", side_effect=Exception("Load error")):
        with pytest.raises(Exception) as exc:
            await service.extract_text(fake_file_path)
        assert "Error extracting text from PDF" in str(exc.value)
