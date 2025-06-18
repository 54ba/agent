# PDF Processing API with LangChain 🚀

A modern, scalable API for processing PDF documents using FastAPI, LangChain, and advanced NLP capabilities. This project provides both a REST API and a beautiful CLI interface for PDF processing tasks.

![Python Version](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-green)
![LangChain](https://img.shields.io/badge/LangChain-0.3.25-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **PDF Processing**
  - Upload and process PDF files
  - Extract text with metadata
  - Intelligent text chunking for better processing
  - LangChain integration for advanced NLP tasks

- **Modern API**
  - FastAPI-based REST API
  - Async processing
  - Automatic API documentation (Swagger/ReDoc)
  - CORS support
  - File upload handling

- **Beautiful CLI**
  - Rich terminal UI
  - Progress bars and tables
  - Colorful output
  - Interactive commands

- **Docker Support**
  - Containerized application
  - Easy deployment
  - Volume management for uploads

## 📋 Prerequisites

- Python 3.12+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key (for advanced NLP features)

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-processing-api
```

2. Create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

3. Start the application:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:8000`

### Using Python Directly

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the API server:
```bash
python -m app.main
```

## 📚 Usage

### API Endpoints

#### PDF Processing

- `POST /api/pdf/upload`
  - Upload and process a PDF file
  - Returns processed chunks of the PDF content
  - Accepts PDF files only

- `POST /api/pdf/extract-text`
  - Extract raw text from a PDF file
  - Returns the extracted text
  - Accepts PDF files only

### CLI Interface

The CLI provides a user-friendly interface for interacting with the API:

```bash
# Upload and process a PDF
./run_cli.py upload path/to/your/file.pdf

# Extract text from a PDF
./run_cli.py extract-text path/to/your/file.pdf --output-file output.txt

# Show help
./run_cli.py --help
```

## 🏗️ Project Structure

```
pdf-processing-api/
├── app/
│   ├── api/
│   │   └── pdf_routes.py      # API endpoints
│   ├── core/
│   │   └── config.py          # Configuration
│   ├── services/
│   │   └── pdf_service.py     # PDF processing logic
│   ├── cli.py                 # CLI interface
│   └── main.py               # FastAPI application
├── tests/
│   ├── api/
│   │   └── test_pdf_routes.py # API tests
│   └── services/
│       └── test_pdf_service.py # Service tests
├── uploads/                   # Upload directory
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 🔧 Configuration

The application can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| API_HOST | API server host | 0.0.0.0 |
| API_PORT | API server port | 8000 |
| OPENAI_API_KEY | OpenAI API key | - |
| UPLOAD_DIR | Upload directory | uploads |
| MAX_UPLOAD_SIZE | Maximum file size (bytes) | 10485760 |

## 📖 API Documentation

Once the server is running, access the API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [LangChain](https://python.langchain.com/)
- [Typer](https://typer.tiangolo.com/)
- [Rich](https://rich.readthedocs.io/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.