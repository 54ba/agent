import httpx
import requests
from typing import List, Dict, Optional
from app.core.config import settings
import datetime

class FlightService:
    def __init__(self):
        self.api_key = settings.AMADEUS_API_KEY
        self.api_secret = settings.AMADEUS_API_SECRET
        self.base_url = "https://test.api.amadeus.com"
        self.currencies = ["USD", "EUR", "GBP", "CAD", "AUD"]  # Common currencies to compare

    async def get_access_token(self) -> str:
        """Get Amadeus access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/security/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.api_key,
                    "client_secret": self.api_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            return response.json()["access_token"]

    async def search_flights(self, origin: str, destination: str, departure_date: str, currency: str = "USD", adults: int = 1) -> Dict:
        """Search for flight offers in specified currency"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        params = {
            "originLocationCode": origin,
            "destinationLocationCode": destination,
            "departureDate": departure_date,
            "adults": adults,
            "currencyCode": currency,
            "max": 10  # Get top 10 offers
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v2/shopping/flight-offers",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            data = response.json()

            # Get the cheapest offer
            if data.get("data"):
                cheapest = min(data["data"], key=lambda x: float(x["price"]["total"]))
                return {
                    "currency": currency,
                    "price": float(cheapest["price"]["total"]),
                    "offer": cheapest
                }
            return None

    def get_exchange_rates(self, base: str = "USD") -> Dict:
        """Get exchange rates from free API"""
        response = requests.get(f"https://api.exchangerate-api.com/v4/latest/{base}")
        response.raise_for_status()
        return response.json()["rates"]

    async def compare_prices(self, origin: str, destination: str, departure_date: str, adults: int = 1) -> Dict:
        """Compare flight prices across currencies and find lowest"""
        results = []
        for currency in self.currencies:
            try:
                result = await self.search_flights(origin, destination, departure_date, currency, adults)
                if result:
                    results.append(result)
            except Exception as e:
                print(f"Error for {currency}: {e}")
                continue

        if not results:
            return {"error": "No flight offers found"}

        # Convert all prices to USD for comparison
        rates = self.get_exchange_rates("USD")
        converted_results = []
        for result in results:
            currency = result["currency"]
            price = result["price"]
            if currency == "USD":
                converted_price = price
            else:
                rate = rates.get(currency)
                if rate:
                    converted_price = price / rate  # Convert to USD
                else:
                    converted_price = price  # Fallback
            converted_results.append({
                **result,
                "price_usd": converted_price
            })

        # Find the lowest price in USD
        lowest = min(converted_results, key=lambda x: x["price_usd"])
        return {
            "lowest_currency": lowest["currency"],
            "lowest_price": lowest["price"],
            "lowest_price_usd": lowest["price_usd"],
            "all_results": converted_results
        }