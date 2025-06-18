# Development Guide 🛠️

## Overview

This guide provides information for developers who want to contribute to the PDF Processing project. It covers setup, development workflow, testing, and best practices.

## Prerequisites

- Python 3.12 or higher
- Docker and Docker Compose
- Git
- OpenAI API key

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pdf-processing
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   .\venv\Scripts\activate  # Windows
   ```

3. Install development dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Project Structure

```
pdf-processing/
├── app/
│   ├── api/
│   │   └── endpoints/
│   ├── core/
│   ├── services/
│   └── cli.py
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Development Workflow

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests:
   ```bash
   pytest
   ```

4. Format code:
   ```bash
   black .
   isort .
   ```

5. Check code quality:
   ```bash
   flake8
   mypy .
   ```

6. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

7. Push and create a pull request

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_pdf_service.py

# Run with coverage
pytest --cov=app tests/
```

### Writing Tests

1. Unit Tests:
   - Place in `tests/unit/`
   - Test individual components
   - Use mocks for external dependencies

2. Integration Tests:
   - Place in `tests/integration/`
   - Test component interactions
   - Use test fixtures

Example test:
```python
def test_pdf_processing():
    # Arrange
    pdf_service = PDFService()
    test_file = "tests/fixtures/test.pdf"

    # Act
    result = pdf_service.process_pdf(test_file)

    # Assert
    assert result is not None
    assert len(result) > 0
```

## Code Style

We use:
- Black for code formatting
- isort for import sorting
- flake8 for linting
- mypy for type checking

### Pre-commit Hooks

Install pre-commit hooks:
```bash
pre-commit install
```

## Docker Development

### Building

```bash
docker-compose build
```

### Running

```bash
docker-compose up
```

### Development Mode

```bash
docker-compose -f docker-compose.dev.yml up
```

## API Development

### Adding New Endpoints

1. Create a new file in `app/api/endpoints/`
2. Define your endpoint using FastAPI
3. Register the endpoint in `app/api/api.py`

Example:
```python
from fastapi import APIRouter, UploadFile

router = APIRouter()

@router.post("/new-endpoint")
async def new_endpoint(file: UploadFile):
    # Your implementation
    return {"message": "Success"}
```

## CLI Development

### Adding New Commands

1. Add a new command function in `app/cli.py`
2. Register the command with Typer
3. Add tests in `tests/unit/test_cli.py`

Example:
```python
@app.command()
def new_command(file_path: str):
    # Your implementation
    pass
```

## Documentation

### Updating Documentation

1. Update relevant markdown files in `docs/`
2. Update docstrings in code
3. Update README.md if necessary

### Building Documentation

```bash
mkdocs build
```

### Serving Documentation

```bash
mkdocs serve
```

## Best Practices

1. **Code Quality**
   - Write clean, readable code
   - Add type hints
   - Write comprehensive tests
   - Follow PEP 8

2. **Git Workflow**
   - Use meaningful commit messages
   - Keep commits focused
   - Rebase before merging

3. **Security**
   - Never commit secrets
   - Validate user input
   - Handle errors gracefully

4. **Performance**
   - Profile code when needed
   - Use async/await appropriately
   - Optimize database queries

## Common Issues

### Debugging

1. Check logs:
   ```bash
   docker-compose logs -f
   ```

2. Use debugger:
   ```python
   import pdb; pdb.set_trace()
   ```

3. Check environment:
   ```bash
   python -c "import sys; print(sys.path)"
   ```

### Performance Issues

1. Profile code:
   ```bash
   python -m cProfile -o output.prof your_script.py
   ```

2. Check memory usage:
   ```bash
   python -m memory_profiler your_script.py
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Release Process

1. Update version in `pyproject.toml`
2. Update CHANGELOG.md
3. Create a release tag
4. Build and publish package

## Support

- Create an issue for bugs
- Use discussions for questions
- Join our community chat