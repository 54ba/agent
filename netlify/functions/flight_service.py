import httpx
import requests
from typing import List, Dict, Optional
from config import settings
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

    def parse_flight_offer(self, offer: Dict) -> Dict:
        """Parse raw Amadeus flight offer into user-friendly format"""
        try:
            itinerary = offer["itineraries"][0]  # Take first itinerary
            segment = itinerary["segments"][0]   # Take first segment
            price_info = offer["price"]
            traveler_pricing = offer["travelerPricings"][0] if offer.get("travelerPricings") else {}

            # Parse departure/arrival times
            departure = segment["departure"]
            arrival = segment["arrival"]

            # Parse flight details
            carrier_code = segment["carrierCode"]
            flight_number = segment["number"]
            aircraft = segment.get("aircraft", {}).get("code", "N/A")

            # Parse baggage info
            fare_details = traveler_pricing.get("fareDetailsBySegment", [{}])[0]
            included_bags = fare_details.get("includedCheckedBags", {})
            cabin_bags = fare_details.get("includedCabinBags", {})

            # Parse amenities
            amenities = []
            if fare_details.get("amenities"):
                for amenity in fare_details["amenities"]:
                    if amenity.get("description"):
                        amenities.append({
                            "description": amenity["description"],
                            "chargeable": amenity.get("isChargeable", False),
                            "type": amenity.get("amenityType", "OTHER")
                        })

            return {
                "flight_info": {
                    "airline": carrier_code,
                    "flight_number": f"{carrier_code}{flight_number}",
                    "aircraft": aircraft,
                    "duration": itinerary["duration"]
                },
                "departure": {
                    "airport": departure["iataCode"],
                    "terminal": departure.get("terminal"),
                    "time": departure["at"]
                },
                "arrival": {
                    "airport": arrival["iataCode"],
                    "terminal": arrival.get("terminal"),
                    "time": arrival["at"]
                },
                "baggage": {
                    "checked_bags": {
                        "quantity": included_bags.get("quantity", 0),
                        "additional_fee": price_info.get("additionalServices", [])
                    },
                    "cabin_bags": {
                        "quantity": cabin_bags.get("quantity", 0)
                    }
                },
                "pricing": {
                    "total": float(price_info["total"]),
                    "base_fare": float(price_info["base"]),
                    "taxes_fees": float(price_info["total"]) - float(price_info["base"]),
                    "currency": price_info["currency"]
                },
                "amenities": amenities,
                "booking_info": {
                    "last_ticketing_date": offer.get("lastTicketingDate"),
                    "seats_available": offer.get("numberOfBookableSeats", 0),
                    "instant_ticketing": offer.get("instantTicketingRequired", False)
                }
            }
        except (KeyError, IndexError, ValueError) as e:
            # Fallback to basic info if parsing fails
            return {
                "flight_info": {"airline": "Unknown", "flight_number": "Unknown"},
                "departure": {"airport": None, "time": None},
                "arrival": {"airport": None, "time": None},
                "pricing": {"total": float(offer.get("price", {}).get("total", 0))},
                "error": f"Parsing failed: {str(e)}"
            }

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
                parsed_offer = self.parse_flight_offer(cheapest)
                return {
                    "currency": currency,
                    "price": float(cheapest["price"]["total"]),
                    "parsed_offer": parsed_offer,
                    "raw_offer": cheapest  # Keep raw data for debugging
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