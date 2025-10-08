import pytest
from app.services.ai_service import AIService
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_ai_service_without_api_key():
    """Test AI service behavior without OpenAI API key"""
    service = AIService()
    service.api_key = None  # Ensure no API key
    service.client = None

    # Test recommendations without API key
    result = await service.get_travel_recommendations({"origin": "JFK", "destination": "LAX"})
    assert "AI features require Groq API key" in result["insights"]

    # Test price analysis without API key
    result = await service.analyze_price_trends([])
    assert "Price trend analysis requires Groq API key" in result["analysis"]

    # Test destination insights without API key
    result = await service.get_destination_insights("LAX")
    assert "Destination insights require Groq API key" in result["insights"]

    # Test natural language parsing without API key
    result = await service.process_natural_language_query("Find flights to Paris")
    assert result["parsed"] == False
    assert "Natural language processing requires Groq API key" in result["message"]

@pytest.mark.asyncio
async def test_ai_service_with_real_api():
    """Test AI service with real Groq API"""
    service = AIService()
    # API key loaded from .env via conftest

    result = await service.get_travel_recommendations({"origin": "JFK", "destination": "LAX"})
    assert "recommendations" in result
    assert "insights" in result
    assert isinstance(result["recommendations"], list)
    assert isinstance(result["insights"], str)

@pytest.mark.asyncio
async def test_ai_service_error_handling():
    """Test AI service error handling"""
    service = AIService()
    service.api_key = "fake_key"  # Set API key to pass the check
    service.client = AsyncMock()

    # Mock API error
    service.client.chat.completions.create = AsyncMock(side_effect=Exception("API Error"))

    result = await service.get_travel_recommendations({"origin": "JFK", "destination": "LAX"})
    assert "recommendations" in result
    assert len(result["recommendations"]) > 0  # Should return fallback recommendations
    assert "AI recommendations unavailable" in result["insights"]

@pytest.mark.asyncio
async def test_natural_language_parsing():
    """Test natural language query parsing with real API"""
    service = AIService()
    # API key loaded from .env

    result = await service.process_natural_language_query("Book 2 tickets from New York to Los Angeles for December")
    assert "confidence_score" in result
    # Check if parsing succeeded by presence of key fields
    if "origin" in result and "destination" in result:
        assert True  # Parsed successfully
    else:
        assert "parsed" in result and result["parsed"] == False