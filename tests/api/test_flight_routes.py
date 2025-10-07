import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

@patch("app.api.flight_routes.flight_service")
def test_search_flights_success(mock_flight_service):
    mock_flight_service.compare_prices = AsyncMock(return_value={
        "lowest_currency": "USD",
        "lowest_price": 500.0,
        "lowest_price_usd": 500.0,
        "all_results": []
    })

    response = client.get("/api/flights/search?origin=JFK&destination=LAX&departure_date=2025-12-01")
    assert response.status_code == 200
    data = response.json()
    assert "lowest_currency" in data
    assert data["lowest_currency"] == "USD"

def test_search_flights_missing_params():
    response = client.get("/api/flights/search?origin=JFK&destination=LAX")
    assert response.status_code == 422  # Validation error

def test_search_flights_invalid_date():
    response = client.get("/api/flights/search?origin=JFK&destination=LAX&departure_date=invalid")
    assert response.status_code == 400
    assert "Invalid date format" in response.json()["detail"]

@patch("app.api.flight_routes.flight_service")
def test_search_flights_service_error(mock_flight_service):
    mock_flight_service.compare_prices = AsyncMock(side_effect=Exception("API error"))

    response = client.get("/api/flights/search?origin=JFK&destination=LAX&departure_date=2025-12-01")
    assert response.status_code == 500
    assert "Error searching flights" in response.json()["detail"]