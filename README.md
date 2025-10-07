# Air Travel Tickets Price Comparison API ✈️

A modern, scalable API for comparing air travel ticket prices across multiple currencies using the Amadeus API. This project provides both a REST API and a beautiful web interface for flight price comparison.

![Python Version](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-green)
![Amadeus API](https://img.shields.io/badge/Amadeus-API-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **Flight Price Comparison**
  - Search flights between airports
  - Compare prices across multiple currencies (USD, EUR, GBP, CAD, AUD)
  - Find the lowest cost currency for tickets
  - Real-time price data from Amadeus API

- **AI-Powered Travel Assistant with Grok** 🤖
  - Natural language flight search ("Find cheap flights to Paris next month")
  - Grok AI travel recommendations and insights
  - Smart destination suggestions
  - Personalized travel advice
  - Price trend analysis and booking recommendations
  - Completely free AI assistance!

- **Modern API**
  - FastAPI-based REST API
  - Async processing
  - Automatic API documentation (Swagger/ReDoc)
  - CORS support
  - AI and currency conversion integration

- **Beautiful Web Interface**
  - Simple and intuitive UI with AI chat features
  - Real-time search results with AI insights
  - Responsive design with modern animations
  - Search history and quick access

- **Docker Support**
  - Containerized application
  - Easy deployment
  - Environment variable management

## 📋 Prerequisites

- Python 3.12+
- Docker and Docker Compose (for containerized deployment)
- Amadeus API key and secret (free developer account)
- Grok API key (for AI features, optional - completely free!)

### Getting Amadeus API Keys (Free)

1. **Sign up for Amadeus Developer Account:**
   - Go to https://developers.amadeus.com/
   - Click "Register" and create your account
   - Verify your email

2. **Create an Application:**
   - Go to "My Apps" in your dashboard
   - Click "Create a new app"
   - Fill in the details (any name/description)
   - Select "Flight Offers Search" API

3. **Get Your API Keys:**
   - Your API Key and API Secret will be displayed
   - Copy them to your `.env` file

**Note:** Amadeus provides 2000 free API calls per month for developers.

### Getting Grok API Key (Optional, for AI features)

**Note:** AI features are optional. The flight search works without them, but you'll get enhanced experiences with Grok.

1. **Go to xAI Console:**
   - Visit https://console.x.ai/
   - Sign up or log in to your account

2. **Create API Key:**
   - Generate a new API key from your dashboard
   - Copy the key (save it securely)

3. **Update .env file:**
```bash
GROK_API_KEY=your-grok-api-key-here
```

4. **Test the key:**
```bash
python test-api-keys.py
```

**Cost:** Grok is completely FREE with no usage limits or hidden costs! 🎉
- OpenAI API key (for AI features at https://platform.openai.com/)

## 🚀 Quick Start

### Using Netlify (Recommended for Static Deployment)

1. **Connect to Netlify:**
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Netlify will automatically detect the `netlify.toml` configuration

2. **Environment Variables:**
   Set these in your Netlify dashboard:
   ```
   AMADEUS_API_KEY=your_amadeus_key
   AMADEUS_API_SECRET=your_amadeus_secret
   OPENAI_API_KEY=your_openai_key
   ```

3. **Deploy:**
   - Netlify will build and deploy automatically
   - Your site will be available at the generated URL

### Using Docker (Recommended for Full Server)

1. Clone the repository:
```bash
git clone <repository-url>
cd air-travel-price-comparison
```

2. Create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your Amadeus API key and secret
```

3. **Test your API keys (recommended):**
```bash
python test-api-keys.py
```

4. Start the application:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:8000`

### Using Python Directly

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. **Test your API keys (recommended):**
```bash
python test-api-keys.py
```

4. Start the API server:
```bash
python -m app.main
```

## 📚 Usage

### API Endpoints

#### Flight Search

- `GET /api/flights/search`
  - Search for flights and compare prices across currencies
  - Query parameters: origin, destination, departure_date
  - Returns price comparison results with lowest cost currency

### Web Interface

Access the web interface at `http://localhost:8000` to:
- **AI-Powered Search**: Describe your trip in plain English (e.g., "Find cheap flights from New York to London next month")
- **Traditional Search**: Enter origin and destination airport codes with detailed options
- **Smart Comparisons**: View price comparisons across currencies with AI insights
- **Personalized Recommendations**: Get AI-powered travel advice and destination insights
- **Search History**: Quick access to your recent searches

## 🏗️ Project Structure

```
air-travel-price-comparison/
├── app/
│   ├── api/
│   │   └── flight_routes.py   # API endpoints for flight search
│   ├── core/
│   │   └── config.py          # Configuration
│   ├── services/
│   │   └── flight_service.py  # Flight search and price comparison logic
│   ├── static/
│   │   └── index.html         # Web interface
│   └── main.py               # FastAPI application
├── tests/
│   ├── api/
│   │   └── test_flight_routes.py # API tests
│   └── services/
│       └── test_flight_service.py # Service tests
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 🔧 Configuration

The application can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| API_HOST | API server host | 0.0.0.0 |
| API_PORT | API server port | 8000 |
| AMADEUS_API_KEY | Amadeus API key | - |
| AMADEUS_API_SECRET | Amadeus API secret | - |
| OPENAI_API_KEY | OpenAI API key (for AI features) | - |

## 📖 API Documentation

Once the server is running, access the API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Amadeus for Developers](https://developers.amadeus.com/)
- [OpenAI](https://openai.com/)
- [ExchangeRate-API](https://exchangerate-api.com/)
- [httpx](https://www.python-httpx.org/)

## 🚀 Deployment Options

### Netlify Deployment (Static + Serverless)

The project includes full Netlify configuration for easy deployment:

**Files included:**
- `netlify.toml` - Build configuration
- `netlify/functions/api.py` - Serverless API functions
- `netlify/requirements.txt` - Python dependencies for functions
- `app/static/_redirects` - SPA routing

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically

**Limitations:** Full flight search requires backend server. Use Docker for complete functionality.

### Docker Deployment (Full Server)

Use Docker for complete server-side functionality with real-time API integrations.

## 🔧 Troubleshooting

### API Key Issues

**"Connection Error - Unable to connect to the flight search service"**

This error occurs when Amadeus API keys are not properly configured:

1. **Check your `.env` file:**
```bash
python test-api-keys.py
```

2. **Get real Amadeus API keys:**
   - Visit https://developers.amadeus.com/
   - Create a free developer account
   - Generate API Key and Secret
   - Update your `.env` file

3. **Restart the service:**
```bash
# Stop the current service (Ctrl+C)
python -m app.main
```

**"AI Search Failed - Unable to process your natural language query"**

This occurs when Grok API access is limited:

**Possible causes:**
1. **No API key configured** - Add Grok key to `.env`
2. **Invalid API key** - Verify the key is correct
3. **Network issues** - Check internet connection

**Solutions:**

1. **For missing/invalid API key:**
```bash
# Get free key from: https://console.x.ai/
# Add to .env: GROK_API_KEY=your-grok-key-here
python test-api-keys.py
```

2. **Restart service:**
```bash
python -m app.main
```

**Note:** AI features are optional. The regular flight search form works without Grok. Plus, Grok is completely free!

**"AI features not available"**

This is normal if OpenAI API key is not configured. The service will work without AI features.

### Common Issues

- **"Module not found"**: Run `pip install -r requirements.txt`
- **"Port already in use"**: Change port in `app/core/config.py`
- **"Permission denied"**: Check file permissions for `.env`

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.