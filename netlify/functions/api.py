import json
import os
from app.services.flight_service import FlightService
from app.services.ai_service import AIService

# Initialize services
flight_service = FlightService()
ai_service = AIService()

def handler(event, context):
    """Netlify function handler for API routes"""

    try:
        # Get the path and method
        path = event.get('path', '').replace('/.netlify/functions/api', '')
        method = event.get('httpMethod', 'GET')

        # Parse request body if present
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except:
                body = {}

        # Route handling
        if path.startswith('/flights/search') and method == 'GET':
            return handle_flight_search(event)
        elif path.startswith('/ai/recommendations') and method == 'POST':
            return handle_ai_recommendations(body)
        elif path.startswith('/ai/analyze-prices') and method == 'POST':
            return handle_ai_analyze_prices(body)
        elif path.startswith('/ai/parse-query') and method == 'POST':
            return handle_ai_parse_query(body)
        elif path.startswith('/ai/destination-insights/') and method == 'GET':
            destination = path.replace('/ai/destination-insights/', '')
            return handle_destination_insights(destination)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Endpoint not found'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }

def handle_flight_search(event):
    """Handle flight search requests"""
    query_params = event.get('queryStringParameters', {}) or {}

    origin = query_params.get('origin')
    destination = query_params.get('destination')
    departure_date = query_params.get('departure_date')

    if not all([origin, destination, departure_date]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing required parameters: origin, destination, departure_date'})
        }

    try:
        # This would need to be made async in a real implementation
        # For Netlify functions, we might need to handle this differently
        result = {"error": "Flight search requires backend server. Please use Docker deployment for full functionality."}

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Flight search failed: {str(e)}'})
        }

def handle_ai_recommendations(body):
    """Handle AI recommendations requests"""
    try:
        # This would need to be made async in a real implementation
        result = {"recommendations": [], "insights": "AI features require OpenAI API key configuration"}

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'AI recommendations failed: {str(e)}'})
        }

def handle_ai_analyze_prices(body):
    """Handle AI price analysis requests"""
    try:
        result = {"trend": "neutral", "analysis": "Price trend analysis requires OpenAI API key"}

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Price analysis failed: {str(e)}'})
        }

def handle_ai_parse_query(body):
    """Handle natural language query parsing"""
    query = body.get('query', '')

    if not query:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'detail': 'Query is required'})
        }

    try:
        result = {"parsed": False, "message": "Natural language processing requires OpenAI API key"}

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Query parsing failed: {str(e)}'})
        }

def handle_destination_insights(destination):
    """Handle destination insights requests"""
    try:
        result = {"insights": "Destination insights require OpenAI API key"}

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Destination insights failed: {str(e)}'})
        }