import pytest
from app.services.ai_service import AIService
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_ai_service_without_api_key():
    """Test AI service behavior without OpenAI API key"""
    service = AIService()
    service.api_key = None  # Ensure no API key
    service.client = None

    # Test recommendations without API key
    result = await service.get_travel_recommendations({"origin": "JFK", "destination": "LAX"})
    assert "AI features require OpenAI API key" in result["insights"]

    # Test price analysis without API key
    result = await service.analyze_price_trends([])
    assert "Price trend analysis requires OpenAI API key" in result["analysis"]

    # Test destination insights without API key
    result = await service.get_destination_insights("LAX")
    assert "Destination insights require OpenAI API key" in result["insights"]

    # Test natural language parsing without API key
    result = await service.process_natural_language_query("Find flights to Paris")
    assert result["parsed"] == False
    assert "Natural language processing requires OpenAI API key" in result["message"]

@pytest.mark.asyncio
async def test_ai_service_with_mock_api():
    """Test AI service with mocked OpenAI API"""
    service = AIService()
    service.api_key = "fake_key"  # Set API key to pass the check
    service.client = AsyncMock()  # Mock the client

    # Mock successful recommendation response
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = '{"recommendations": ["Check local events"], "insights": "Great destination"}'
    service.client.chat.completions.create = AsyncMock(return_value=mock_response)

    result = await service.get_travel_recommendations({"origin": "JFK", "destination": "LAX"})
    assert "recommendations" in result
    assert "insights" in result
    assert result["recommendations"] == ["Check local events"]

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
    """Test natural language query parsing"""
    service = AIService()
    service.api_key = "fake_key"  # Set API key to pass the check
    service.client = AsyncMock()

    # Mock parsing response
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = '{"origin": "JFK", "destination": "LAX", "departure_date": "2025-12-01", "passengers": 2, "confidence_score": 0.9}'
    service.client.chat.completions.create = AsyncMock(return_value=mock_response)

    result = await service.process_natural_language_query("Book 2 tickets from New York to Los Angeles for December")
    assert result["parsed"] == True
    assert result["origin"] == "JFK"
    assert result["destination"] == "LAX"
    assert result["passengers"] == 2
    assert result["confidence_score"] == 0.9