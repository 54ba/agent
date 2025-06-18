import typer
import httpx
import os
from rich.console import Console
from rich.progress import Progress
from rich.panel import Panel
from rich.table import Table
from typing import Optional

app = typer.Typer()
console = Console()

def create_client(base_url: str = "http://localhost:8000") -> httpx.Client:
    return httpx.Client(base_url=base_url)

@app.command()
def upload(
    file_path: str = typer.Argument(..., help="Path to the PDF file to upload"),
    server_url: str = typer.Option("http://localhost:8000", help="Server URL")
):
    """Upload and process a PDF file."""
    if not os.path.exists(file_path):
        console.print(f"[red]Error: File {file_path} does not exist[/red]")
        raise typer.Exit(1)

    if not file_path.lower().endswith('.pdf'):
        console.print("[red]Error: Only PDF files are supported[/red]")
        raise typer.Exit(1)

    with Progress() as progress:
        task = progress.add_task("[cyan]Uploading PDF...", total=100)

        try:
            with create_client(server_url) as client:
                with open(file_path, "rb") as f:
                    response = client.post(
                        "/api/pdf/upload",
                        files={"file": (os.path.basename(file_path), f, "application/pdf")}
                    )
                    progress.update(task, completed=100)

                if response.status_code == 200:
                    chunks = response.json()
                    console.print(Panel.fit(
                        f"[green]Successfully processed PDF![/green]\n"
                        f"Number of chunks: {len(chunks)}",
                        title="Upload Complete"
                    ))

                    # Display chunks in a table
                    table = Table(title="PDF Content Chunks")
                    table.add_column("Chunk #", style="cyan")
                    table.add_column("Content Preview", style="green")

                    for i, chunk in enumerate(chunks, 1):
                        content = chunk["content"][:100] + "..." if len(chunk["content"]) > 100 else chunk["content"]
                        table.add_row(str(i), content)

                    console.print(table)
                else:
                    console.print(f"[red]Error: {response.json()['detail']}[/red]")
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
            raise typer.Exit(1)

@app.command()
def extract_text(
    file_path: str = typer.Argument(..., help="Path to the PDF file to extract text from"),
    server_url: str = typer.Option("http://localhost:8000", help="Server URL"),
    output_file: Optional[str] = typer.Option(None, help="Path to save the extracted text")
):
    """Extract text from a PDF file."""
    if not os.path.exists(file_path):
        console.print(f"[red]Error: File {file_path} does not exist[/red]")
        raise typer.Exit(1)

    if not file_path.lower().endswith('.pdf'):
        console.print("[red]Error: Only PDF files are supported[/red]")
        raise typer.Exit(1)

    with Progress() as progress:
        task = progress.add_task("[cyan]Extracting text...", total=100)

        try:
            with create_client(server_url) as client:
                with open(file_path, "rb") as f:
                    response = client.post(
                        "/api/pdf/extract-text",
                        files={"file": (os.path.basename(file_path), f, "application/pdf")}
                    )
                    progress.update(task, completed=100)

                if response.status_code == 200:
                    text = response.json()["text"]

                    if output_file:
                        with open(output_file, "w", encoding="utf-8") as f:
                            f.write(text)
                        console.print(f"[green]Text saved to {output_file}[/green]")
                    else:
                        console.print(Panel(text, title="Extracted Text"))
                else:
                    console.print(f"[red]Error: {response.json()['detail']}[/red]")
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
            raise typer.Exit(1)

if __name__ == "__main__":
    app()