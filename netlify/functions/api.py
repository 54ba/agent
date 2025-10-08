import json
import asyncio
from flight_service import FlightService
from ai_service import AIService
import datetime

flight_service = FlightService()
ai_service = AIService()

async def handler(event, context):
    """Main Netlify Function handler"""
    print(f"Handler called with path: {event.get('path', '')}, method: {event.get('httpMethod', 'GET')}")
    try:
        # Get the path and method
        path = event.get('path', '')
        http_method = event.get('httpMethod', 'GET')

        # Remove /api prefix if present
        if path.startswith('/api'):
            path = path[4:] or '/'

        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}

        # Parse request body for POST requests
        body = {}
        if http_method == 'POST' and event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Invalid JSON in request body'})
                }

        # Route to appropriate handler
        print(f"Routing path: {path}, method: {http_method}")
        if path == '/flights/search' and http_method == 'GET':
            print("Calling handle_flight_search")
            return await handle_flight_search(query_params)
        elif path == '/ai/recommendations' and http_method == 'POST':
            return await handle_recommendations(body)
        elif path == '/ai/analyze-prices' and http_method == 'POST':
            return await handle_price_analysis(body)
        elif path.startswith('/ai/destination-insights/') and http_method == 'GET':
            destination = path.replace('/ai/destination-insights/', '')
            return await handle_destination_insights(destination)
        elif path == '/ai/parse-query' and http_method == 'POST':
            return await handle_parse_query(body)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Endpoint not found'})
            }

    except Exception as e:
        print(f"Exception in handler: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }

async def handle_flight_search(query_params):
    """Handle flight search requests"""
    print(f"handle_flight_search called with params: {query_params}")
    try:
        origin = query_params.get('origin')
        destination = query_params.get('destination')
        departure_date = query_params.get('departure_date')
        adults = int(query_params.get('adults', 1))
        print(f"Parsed params: origin={origin}, dest={destination}, date={departure_date}, adults={adults}")

        if not all([origin, destination, departure_date]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing required parameters: origin, destination, departure_date'})
            }

        # Validate date format
        try:
            datetime.datetime.strptime(departure_date, "%Y-%m-%d")
        except ValueError:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid date format. Use YYYY-MM-DD'})
            }

        print("Calling flight_service.compare_prices")
        result = await flight_service.compare_prices(origin, destination, departure_date, adults)
        print(f"compare_prices returned: {result}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Error searching flights: {str(e)}'})
        }

async def handle_recommendations(body):
    """Handle AI recommendations requests"""
    try:
        search_data = body.get('search_data', {})
        if not search_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'search_data is required'})
            }

        recommendations = await ai_service.get_travel_recommendations(search_data)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(recommendations)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'AI recommendation error: {str(e)}'})
        }

async def handle_price_analysis(body):
    """Handle price analysis requests"""
    try:
        prices = body.get('prices', [])
        if not prices:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'prices array is required'})
            }

        analysis = await ai_service.analyze_price_trends(prices)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(analysis)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Price analysis error: {str(e)}'})
        }

async def handle_destination_insights(destination):
    """Handle destination insights requests"""
    try:
        if not destination:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Destination is required'})
            }

        insights = await ai_service.get_destination_insights(destination)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(insights)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Destination insights error: {str(e)}'})
        }

async def handle_parse_query(body):
    """Handle natural language query parsing"""
    try:
        query = body.get('query', '')
        if not query:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Query is required'})
            }

        result = await ai_service.process_natural_language_query(query)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Query parsing error: {str(e)}'})
        }