# API Documentation 📚

## Overview

The PDF Processing API provides endpoints for uploading, processing, and extracting text from PDF files. The API is built with FastAPI and provides automatic OpenAPI documentation.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. However, for production use, it's recommended to implement proper authentication.

## Endpoints

### Upload and Process PDF

Uploads a PDF file and processes it into chunks for further analysis.

```http
POST /api/pdf/upload
```

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: PDF file (required)

#### Response

```json
[
  {
    "content": "Text content of the chunk",
    "metadata": {
      "page": 1,
      "source": "filename.pdf"
    }
  }
]
```

#### Status Codes

- `200 OK`: Successfully processed PDF
- `400 Bad Request`: Invalid file type or missing file
- `500 Internal Server Error`: Server error during processing

### Extract Text from PDF

Extracts raw text from a PDF file.

```http
POST /api/pdf/extract-text
```

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: PDF file (required)

#### Response

```json
{
  "text": "Extracted text from the PDF"
}
```

#### Status Codes

- `200 OK`: Successfully extracted text
- `400 Bad Request`: Invalid file type or missing file
- `500 Internal Server Error`: Server error during extraction

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing rate limiting to prevent abuse.

## File Size Limits

- Maximum file size: 10MB (10485760 bytes)
- Supported file types: PDF only

## Examples

### Using cURL

```bash
# Upload and process PDF
curl -X POST "http://localhost:8000/api/pdf/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"

# Extract text from PDF
curl -X POST "http://localhost:8000/api/pdf/extract-text" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

### Using Python

```python
import requests

# Upload and process PDF
files = {'file': open('document.pdf', 'rb')}
response = requests.post('http://localhost:8000/api/pdf/upload', files=files)
chunks = response.json()

# Extract text from PDF
files = {'file': open('document.pdf', 'rb')}
response = requests.post('http://localhost:8000/api/pdf/extract-text', files=files)
text = response.json()['text']
```

## Best Practices

1. **File Size**: Keep PDF files under 10MB for optimal performance
2. **Error Handling**: Always handle potential errors in your client code
3. **Content Type**: Ensure you're sending the correct content type
4. **File Validation**: Validate PDF files before sending them to the API

## Future Improvements

- Authentication and authorization
- Rate limiting
- Batch processing
- Advanced NLP features
- Caching support