# CLI Documentation 🖥️

## Overview

The PDF Processing CLI provides a user-friendly interface to interact with the PDF Processing API. It features a rich terminal interface with progress bars, colorful output, and formatted tables.

## Installation

The CLI is included in the main package. After installing the package, you can use the CLI directly:

```bash
# Make the CLI script executable
chmod +x run_cli.py

# Run the CLI
./run_cli.py
```

## Commands

### Upload PDF

Uploads a PDF file and processes it into chunks.

```bash
./run_cli.py upload <file_path>
```

#### Arguments

- `file_path`: Path to the PDF file (required)

#### Options

- `--help`: Show help message and exit

#### Example

```bash
./run_cli.py upload documents/sample.pdf
```

#### Output

The command will show:
1. A progress bar for the upload
2. A table with the processed chunks
3. Error messages if something goes wrong

### Extract Text

Extracts text from a PDF file.

```bash
./run_cli.py extract-text <file_path> [--output-file OUTPUT_FILE]
```

#### Arguments

- `file_path`: Path to the PDF file (required)

#### Options

- `--output-file`: Path to save the extracted text (optional)
- `--help`: Show help message and exit

#### Examples

```bash
# Display text in terminal
./run_cli.py extract-text documents/sample.pdf

# Save text to file
./run_cli.py extract-text documents/sample.pdf --output-file output.txt
```

## Features

### Rich Terminal Interface

The CLI uses the `rich` library to provide:
- Progress bars for long operations
- Colorful output for better readability
- Formatted tables for structured data
- Clear error messages

### Error Handling

The CLI includes comprehensive error handling:
- File existence checks
- File type validation
- API error handling
- Network error handling

### Help System

Each command includes detailed help messages:

```bash
# Show general help
./run_cli.py --help

# Show command-specific help
./run_cli.py upload --help
./run_cli.py extract-text --help
```

## Configuration

The CLI uses the following default configuration:
- API base URL: `http://localhost:8000`
- Maximum file size: 10MB
- Supported file types: PDF only

## Best Practices

1. **File Paths**: Use absolute or relative paths to PDF files
2. **Output Files**: Use the `--output-file` option for large PDFs
3. **Error Handling**: Check the error messages for troubleshooting
4. **API Server**: Ensure the API server is running before using the CLI

## Examples

### Basic Usage

```bash
# Upload a PDF
./run_cli.py upload ~/Documents/report.pdf

# Extract text and save to file
./run_cli.py extract-text ~/Documents/report.pdf --output-file report.txt
```

### Advanced Usage

```bash
# Upload multiple PDFs
for pdf in ~/Documents/*.pdf; do
    ./run_cli.py upload "$pdf"
done

# Extract text from multiple PDFs
for pdf in ~/Documents/*.pdf; do
    output="${pdf%.pdf}.txt"
    ./run_cli.py extract-text "$pdf" --output-file "$output"
done
```

## Troubleshooting

### Common Issues

1. **File Not Found**
   - Check if the file path is correct
   - Ensure you have read permissions

2. **Invalid File Type**
   - Ensure the file is a valid PDF
   - Check the file extension

3. **API Connection Error**
   - Verify the API server is running
   - Check the API base URL

4. **Permission Denied**
   - Make the CLI script executable: `chmod +x run_cli.py`
   - Check file permissions

## Future Improvements

- Batch processing support
- Configuration file support
- More output formats
- Interactive mode
- Progress tracking for multiple files