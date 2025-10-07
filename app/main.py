from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.flight_routes import router as flight_router
from app.api.ai_routes import router as ai_router
from app.core.config import settings

app = FastAPI(
    title="Air Travel Tickets Price Comparison API",
    description="API for comparing air travel ticket prices across currencies",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(flight_router, prefix="/api/flights", tags=["flights"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to Air Travel Tickets Price Comparison API"}

@app.get("/api/config")
async def get_config():
    return {
        "api_base_url": settings.API_BASE_URL,
        "environment": "development" if settings.API_HOST == "0.0.0.0" else "production"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )