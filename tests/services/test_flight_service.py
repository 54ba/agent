import pytest
from app.services.flight_service import FlightService

@pytest.mark.asyncio
async def test_get_access_token_success():
    service = FlightService()
    token = await service.get_access_token()
    assert isinstance(token, str)
    assert len(token) > 0

@pytest.mark.asyncio
async def test_search_flights_success():
    service = FlightService()
    result = await service.search_flights("JFK", "LAX", "2025-12-01", "USD")
    assert result is not None
    assert "currency" in result
    assert "price" in result
    assert isinstance(result["price"], (int, float))
    assert "parsed_offer" in result
    assert "raw_offer" in result

@pytest.mark.asyncio
async def test_search_flights_no_data():
    service = FlightService()
    # Use invalid destination to ensure no data
    result = await service.search_flights("JFK", "XXX", "2025-12-01", "USD")
    assert result is None

def test_get_exchange_rates_success():
    service = FlightService()
    rates = service.get_exchange_rates("USD")
    assert "EUR" in rates
    assert "GBP" in rates
    assert isinstance(rates["EUR"], (int, float))
    assert isinstance(rates["GBP"], (int, float))

@pytest.mark.asyncio
async def test_compare_prices_success():
    service = FlightService()
    service.currencies = ["USD", "EUR"]  # Reduce for test

    result = await service.compare_prices("JFK", "LAX", "2025-12-01")

    assert "lowest_currency" in result
    assert "lowest_price" in result
    assert "lowest_price_usd" in result
    assert "all_results" in result
    assert len(result["all_results"]) >= 1  # At least one result

@pytest.mark.asyncio
async def test_compare_prices_no_flights():
    service = FlightService()
    service.currencies = ["USD"]

    result = await service.compare_prices("JFK", "XXX", "2025-12-01")
    assert result["error"] == "No flight offers found"