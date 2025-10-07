import pytest
from app.services.flight_service import FlightService
from unittest.mock import patch, MagicMock, AsyncMock
import httpx

@pytest.mark.asyncio
async def test_get_access_token_success():
    service = FlightService()
    mock_response = MagicMock()
    mock_response.json.return_value = {"access_token": "fake_token"}

    with patch("httpx.AsyncClient") as MockClient:
        instance = MockClient.return_value.__aenter__.return_value
        instance.post = AsyncMock(return_value=mock_response)

        token = await service.get_access_token()
        assert token == "fake_token"

@pytest.mark.asyncio
async def test_search_flights_success():
    service = FlightService()
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [
            {
                "price": {"total": "500.00"},
                "id": "flight1"
            }
        ]
    }

    with patch("httpx.AsyncClient") as MockClient, \
         patch.object(service, "get_access_token", return_value="fake_token"):
        instance = MockClient.return_value.__aenter__.return_value
        instance.get = AsyncMock(return_value=mock_response)

        result = await service.search_flights("JFK", "LAX", "2025-12-01", "USD")
        assert result["currency"] == "USD"
        assert result["price"] == 500.0
        assert "offer" in result

@pytest.mark.asyncio
async def test_search_flights_no_data():
    service = FlightService()
    mock_response = MagicMock()
    mock_response.json.return_value = {"data": []}

    with patch("httpx.AsyncClient") as MockClient, \
         patch.object(service, "get_access_token", return_value="fake_token"):
        instance = MockClient.return_value.__aenter__.return_value
        instance.get = AsyncMock(return_value=mock_response)

        result = await service.search_flights("JFK", "LAX", "2025-12-01", "USD")
        assert result is None

@pytest.mark.asyncio
async def test_get_exchange_rates_success():
    service = FlightService()
    mock_response = MagicMock()
    mock_response.json.return_value = {"rates": {"EUR": 0.85, "GBP": 0.73}}

    with patch("requests.get", return_value=mock_response):
        rates = service.get_exchange_rates("USD")
        assert rates["EUR"] == 0.85
        assert rates["GBP"] == 0.73

@pytest.mark.asyncio
async def test_compare_prices_success():
    service = FlightService()
    service.currencies = ["USD", "EUR"]  # Reduce for test

    # Mock search_flights
    async def mock_search(origin, dest, date, currency, adults=1):
        prices = {"USD": 500.0, "EUR": 450.0}
        return {
            "currency": currency,
            "price": prices[currency],
            "offer": {"id": f"flight_{currency}"}
        }

    # Mock exchange rates
    mock_rates_response = MagicMock()
    mock_rates_response.json.return_value = {"rates": {"EUR": 0.9}}  # 1 USD = 0.9 EUR

    with patch.object(service, "search_flights", side_effect=mock_search), \
         patch("requests.get", return_value=mock_rates_response):

        result = await service.compare_prices("JFK", "LAX", "2025-12-01")

        assert "lowest_currency" in result
        assert "lowest_price" in result
        assert "lowest_price_usd" in result
        assert "all_results" in result
        assert len(result["all_results"]) == 2

@pytest.mark.asyncio
async def test_compare_prices_no_flights():
    service = FlightService()
    service.currencies = ["USD"]

    with patch.object(service, "search_flights", return_value=None):
        result = await service.compare_prices("JFK", "LAX", "2025-12-01")
        assert result["error"] == "No flight offers found"