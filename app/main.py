from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.pdf_routes import router as pdf_router
from app.core.config import settings

app = FastAPI(
    title="PDF Processing API",
    description="API for processing PDFs using LangChain and NLP",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(pdf_router, prefix="/api/pdf", tags=["pdf"])

@app.get("/")
async def root():
    return {"message": "Welcome to PDF Processing API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )