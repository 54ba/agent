from fastapi import APIRouter, HTTPException, Query
from app.services.flight_service import FlightService
from typing import Dict
import datetime

router = APIRouter()
flight_service = FlightService()

@router.get("/search", response_model=Dict)
async def search_flights(
    origin: str = Query(..., description="Origin airport code (e.g., JFK)"),
    destination: str = Query(..., description="Destination airport code (e.g., LAX)"),
    departure_date: str = Query(..., description="Departure date in YYYY-MM-DD format"),
    adults: int = Query(1, description="Number of adult passengers", ge=1, le=9)
):
    """
    Search for flight offers and compare prices across currencies
    """
    try:
        # Validate date format
        datetime.datetime.strptime(departure_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        result = await flight_service.compare_prices(origin, destination, departure_date, adults)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching flights: {str(e)}")