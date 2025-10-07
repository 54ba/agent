import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

@patch("app.api.ai_routes.ai_service")
def test_get_recommendations_success(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.get_travel_recommendations = AsyncMock(return_value={
        "recommendations": ["Check local events", "Book in advance"],
        "insights": "Great travel destination with rich culture"
    })

    response = client.post("/api/ai/recommendations", json={"origin": "JFK", "destination": "LAX"})
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "insights" in data
    assert len(data["recommendations"]) == 2

@patch("app.api.ai_routes.ai_service")
def test_get_recommendations_error(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.get_travel_recommendations = AsyncMock(side_effect=Exception("AI Error"))

    response = client.post("/api/ai/recommendations", json={"origin": "JFK", "destination": "LAX"})
    assert response.status_code == 500
    assert "AI recommendation error" in response.json()["detail"]

@patch("app.api.ai_routes.ai_service")
def test_analyze_prices_success(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.analyze_price_trends = AsyncMock(return_value={
        "best_value_currency": "EUR",
        "trend_analysis": "Prices are stable",
        "booking_recommendation": "Book within 2 weeks"
    })

    response = client.post("/api/ai/analyze-prices", json={"prices": []})
    assert response.status_code == 200
    data = response.json()
    assert data["best_value_currency"] == "EUR"
    assert "trend_analysis" in data

@patch("app.api.ai_routes.ai_service")
def test_get_destination_insights_success(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.get_destination_insights = AsyncMock(return_value={
        "best_time_to_visit": "Spring and Fall",
        "attractions": ["Museums", "Beaches"],
        "travel_tips": ["Learn basic phrases", "Carry cash"],
        "transportation": ["Metro", "Taxis"]
    })

    response = client.get("/api/ai/destination-insights/LAX")
    assert response.status_code == 200
    data = response.json()
    assert "best_time_to_visit" in data
    assert "attractions" in data
    assert len(data["attractions"]) == 2

@patch("app.api.ai_routes.ai_service")
def test_parse_query_success(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.process_natural_language_query = AsyncMock(return_value={
        "parsed": True,
        "origin": "JFK",
        "destination": "LAX",
        "departure_date": "2025-12-01",
        "passengers": 2,
        "confidence_score": 0.9
    })

    response = client.post("/api/ai/parse-query", json={"query": "Find flights from New York to LA"})
    assert response.status_code == 200
    data = response.json()
    assert data["parsed"] == True
    assert data["origin"] == "JFK"
    assert data["destination"] == "LAX"

def test_parse_query_missing_query():
    response = client.post("/api/ai/parse-query", json={})
    assert response.status_code == 400  # Bad request - query required
    assert "Query is required" in response.json()["detail"]

@patch("app.api.ai_routes.ai_service")
def test_parse_query_error(mock_ai_service):
    mock_instance = mock_ai_service
    mock_instance.process_natural_language_query = AsyncMock(side_effect=Exception("Parse Error"))

    response = client.post("/api/ai/parse-query", json={"query": "invalid query"})
    assert response.status_code == 500
    assert "Query parsing error" in response.json()["detail"]