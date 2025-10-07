from groq import AsyncGroq
from typing import Dict, List, Optional
from app.core.config import settings
import json

class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None

    async def get_travel_recommendations(self, search_data: Dict) -> Dict:
        """Get AI-powered travel recommendations based on search"""
        if not self.api_key:
            return {"recommendations": [], "insights": "AI features require Grok API key"}

        try:
            prompt = f"""
            Based on this flight search: {json.dumps(search_data, indent=2)}

            Provide 3 personalized travel recommendations and insights:
            1. Best time to travel to destination
            2. Alternative destinations similar to the searched one
            3. Travel tips and cost-saving advice

            Format as JSON with keys: recommendations (array), insights (string)
            """

            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=500,
                temperature=0.7
            )

            content = completion.choices[0].message.content
            return json.loads(content)

        except Exception as e:
            return {
                "recommendations": ["Check local events and festivals", "Consider nearby destinations", "Look for flexible booking options"],
                "insights": f"AI recommendations unavailable: {str(e)}"
            }

    async def analyze_price_trends(self, prices: List[Dict]) -> Dict:
        """Analyze price trends and provide insights"""
        if not self.api_key:
            return {"trend": "neutral", "analysis": "Price trend analysis requires Grok API key"}

        try:
            prices_text = "\n".join([f"{p['currency']}: {p['price']}" for p in prices])

            prompt = f"""
            Analyze these flight prices across currencies:
            {prices_text}

            Provide analysis on:
            1. Which currency offers the best value
            2. Price trend insights
            3. Recommendations for booking

            Format as JSON with keys: best_value_currency, trend_analysis, booking_recommendation
            """

            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=300,
                temperature=0.6
            )

            content = completion.choices[0].message.content
            return json.loads(content)

        except Exception as e:
            return {
                "best_value_currency": prices[0]['currency'] if prices else "Unknown",
                "trend_analysis": "Price analysis temporarily unavailable",
                "booking_recommendation": "Consider booking soon if prices are favorable"
            }

    async def get_destination_insights(self, destination: str) -> Dict:
        """Get AI insights about a destination"""
        if not self.api_key:
            return {"insights": "Destination insights require Grok API key"}

        try:
            prompt = f"""
            Provide travel insights for {destination} airport/destination:
            1. Best time to visit
            2. Popular attractions nearby
            3. Travel tips
            4. Local transportation options

            Format as JSON with keys: best_time_to_visit, attractions, travel_tips, transportation
            """

            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=400,
                temperature=0.7
            )

            content = completion.choices[0].message.content
            return json.loads(content)

        except Exception as e:
            return {
                "best_time_to_visit": "Check local weather and events",
                "attractions": ["Local sightseeing", "Cultural experiences"],
                "travel_tips": ["Research visa requirements", "Check local customs"],
                "transportation": ["Airport taxis", "Public transport", "Ride-sharing services"]
            }

    async def process_natural_language_query(self, query: str) -> Dict:
        """Process natural language flight search queries"""
        if not self.api_key:
            return {"parsed": False, "message": "Natural language processing requires Grok API key"}

        try:
            prompt = f"""
            Parse this natural language flight search query: "{query}"

            Extract:
            - Origin airport/city
            - Destination airport/city
            - Departure date (if mentioned)
            - Number of passengers (if mentioned)
            - Preferred currency (if mentioned)
            - Any special requirements

            Format as JSON with keys: origin, destination, departure_date, passengers, currency, requirements, confidence_score
            If information is not available, use null values.
            """

            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=200,
                temperature=0.3
            )

            content = completion.choices[0].message.content
            result = json.loads(content)

            # Validate airport codes if they look like codes
            if result.get('origin') and len(result['origin']) == 3 and result['origin'].isupper():
                result['origin_type'] = 'airport_code'
            if result.get('destination') and len(result['destination']) == 3 and result['destination'].isupper():
                result['destination_type'] = 'airport_code'

            return result

        except Exception as e:
            return {
                "parsed": False,
                "message": f"Could not parse query: {str(e)}",
                "confidence_score": 0
            }