import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

@pytest.fixture
def fake_pdf_file(tmp_path):
    file_path = tmp_path / "test.pdf"
    file_path.write_bytes(b"%PDF-1.4 test content")
    return file_path

@patch("app.api.pdf_routes.PDFService")
def test_upload_pdf_success(MockPDFService, fake_pdf_file):
    instance = MockPDFService.return_value
    instance.process_pdf = AsyncMock(return_value=[{"content": "chunk1", "metadata": {}}])
    with open(fake_pdf_file, "rb") as f:
        response = client.post("/api/pdf/upload", files={"file": ("test.pdf", f, "application/pdf")})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "content" in response.json()[0]

@patch("app.api.pdf_routes.PDFService")
def test_upload_pdf_invalid_file(MockPDFService, fake_pdf_file):
    with open(fake_pdf_file, "rb") as f:
        response = client.post("/api/pdf/upload", files={"file": ("test.txt", f, "text/plain")})
    assert response.status_code == 400
    assert response.json()["detail"] == "Only PDF files are allowed"

@patch("app.api.pdf_routes.PDFService")
def test_extract_text_success(MockPDFService, fake_pdf_file):
    instance = MockPDFService.return_value
    instance.extract_text = AsyncMock(return_value="some text")
    with open(fake_pdf_file, "rb") as f:
        response = client.post("/api/pdf/extract-text", files={"file": ("test.pdf", f, "application/pdf")})
    assert response.status_code == 200
    assert "text" in response.json()

@patch("app.api.pdf_routes.PDFService")
def test_extract_text_invalid_file(MockPDFService, fake_pdf_file):
    with open(fake_pdf_file, "rb") as f:
        response = client.post("/api/pdf/extract-text", files={"file": ("test.txt", f, "text/plain")})
    assert response.status_code == 400
    assert response.json()["detail"] == "Only PDF files are allowed"
