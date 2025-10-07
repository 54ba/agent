from fastapi import APIRouter, HTTPException
from app.services.ai_service import AIService
from typing import Dict
import json

router = APIRouter()
ai_service = AIService()

@router.post("/recommendations", response_model=Dict)
async def get_recommendations(search_data: Dict):
    """Get AI-powered travel recommendations"""
    try:
        recommendations = await ai_service.get_travel_recommendations(search_data)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI recommendation error: {str(e)}")

@router.post("/analyze-prices", response_model=Dict)
async def analyze_prices(prices: Dict):
    """Analyze price trends and provide insights"""
    try:
        analysis = await ai_service.analyze_price_trends(prices.get("prices", []))
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price analysis error: {str(e)}")

@router.get("/destination-insights/{destination}", response_model=Dict)
async def get_destination_insights(destination: str):
    """Get AI insights about a destination"""
    try:
        insights = await ai_service.get_destination_insights(destination)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Destination insights error: {str(e)}")

@router.post("/parse-query", response_model=Dict)
async def parse_natural_language_query(query_data: Dict):
    """Parse natural language flight search queries"""
    query = query_data.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        result = await ai_service.process_natural_language_query(query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query parsing error: {str(e)}")