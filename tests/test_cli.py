import shutil
from typer.testing import CliRunner
from app.cli import app
import pytest
from pathlib import Path

runner = CliRunner()

@pytest.fixture
def sample_pdf(tmp_path):
    # Copy the sample PDF to a temp location
    src = Path('cypress/fixtures/sample.pdf')
    dst = tmp_path / 'sample.pdf'
    shutil.copy(src, dst)
    return dst

def test_upload_pdf(sample_pdf):
    result = runner.invoke(app, ["upload", str(sample_pdf)])
    assert result.exit_code == 0
    assert "Successfully processed PDF" in result.output

def test_extract_text(sample_pdf, tmp_path):
    output_file = tmp_path / "output.txt"
    result = runner.invoke(app, ["extract-text", str(sample_pdf), "--output-file", str(output_file)])
    assert result.exit_code == 0
    assert f"Text saved to {output_file}" in result.output
    # Check that the output file was created and contains text
    assert output_file.exists()
    assert output_file.read_text(encoding="utf-8").strip() != ""