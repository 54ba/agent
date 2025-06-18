# Testing Guide 🧪

## Overview

This project uses both unit tests (pytest) and end-to-end tests (Cypress) to ensure code quality and functionality. This guide explains how to run and write tests for the project.

## Test Types

### Unit Tests (pytest)

Unit tests are located in the `tests/` directory and use pytest as the testing framework.

```bash
# Run all unit tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/unit/test_pdf_service.py
```

### End-to-End Tests (Cypress)

End-to-end tests are located in the `cypress/e2e/` directory and use Cypress as the testing framework.

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/e2e/pdf_processing.cy.js"
```

## Test Structure

### Unit Tests

```
tests/
├── unit/
│   ├── test_pdf_service.py
│   └── test_cli.py
└── integration/
    └── test_api.py
```

### Cypress Tests

```
cypress/
├── e2e/
│   └── pdf_processing.cy.js
├── fixtures/
│   └── sample.pdf
└── support/
    ├── commands.js
    └── e2e.js
```

## Writing Tests

### Unit Tests

Example unit test:
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

### Cypress Tests

Example Cypress test:
```javascript
describe('PDF Processing', () => {
  it('should upload and process a PDF file', () => {
    cy.intercept('POST', '/api/pdf/upload').as('uploadPdf');
    cy.uploadPdf('sample.pdf');
    cy.wait('@uploadPdf').then((interception) => {
      expect(interception.response.status).to.eq(200);
    });
  });
});
```

## Test Coverage

The project aims for high test coverage. You can check the coverage report by running:

```bash
pytest --cov=app tests/ --cov-report=html
```

This will generate an HTML coverage report in the `htmlcov/` directory.

## Best Practices

1. **Unit Tests**
   - Test one thing at a time
   - Use meaningful test names
   - Follow the Arrange-Act-Assert pattern
   - Mock external dependencies

2. **Cypress Tests**
   - Test user flows
   - Use custom commands for common operations
   - Handle asynchronous operations properly
   - Use fixtures for test data

3. **General**
   - Keep tests independent
   - Clean up after tests
   - Use meaningful assertions
   - Document complex test scenarios

## Running Tests in CI/CD

The project includes GitHub Actions workflows for running tests in CI/CD:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      - name: Run unit tests
        run: pytest
      - name: Run Cypress tests
        run: npm run cypress:run
```

## Troubleshooting

### Common Issues

1. **Cypress Tests Failing**
   - Check if the API server is running
   - Verify the base URL in cypress.config.js
   - Check for network errors in the Cypress console

2. **Unit Tests Failing**
   - Check if all dependencies are installed
   - Verify test data in fixtures
   - Check for environment variables

3. **Coverage Issues**
   - Run coverage with debug flag: `pytest --cov=app --cov-report=term-missing`
   - Check for untested code paths
   - Verify test assertions

## Adding New Tests

1. **Unit Tests**
   - Create test file in appropriate directory
   - Import necessary modules
   - Write test functions
   - Run tests locally

2. **Cypress Tests**
   - Create test file in cypress/e2e/
   - Add test fixtures if needed
   - Write test scenarios
   - Run tests in Cypress Test Runner

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Python Testing Best Practices](https://docs.python-guide.org/writing/tests/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)