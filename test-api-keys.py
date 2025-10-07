#!/usr/bin/env python3
"""
Test script to verify Amadeus API keys are working
"""
import os
import sys
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_amadeus_keys():
    """Test Amadeus API key authentication"""
    api_key = os.getenv('AMADEUS_API_KEY')
    api_secret = os.getenv('AMADEUS_API_SECRET')

    if not api_key or not api_secret:
        print("❌ ERROR: Amadeus API keys not found in .env file")
        print("Please set AMADEUS_API_KEY and AMADEUS_API_SECRET in your .env file")
        return False

    if api_key == 'your_amadeus_api_key_here' or api_secret == 'your_amadeus_api_secret_here':
        print("❌ ERROR: Amadeus API keys are still placeholder values")
        print("Please replace with real API keys from https://developers.amadeus.com/")
        return False

    try:
        # Test authentication
        base_url = "https://test.api.amadeus.com"
        response = httpx.post(
            f"{base_url}/v1/security/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": api_key,
                "client_secret": api_secret
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print("✅ SUCCESS: Amadeus API keys are valid!")
                print(f"Access token obtained: {data['access_token'][:20]}...")
                return True
        else:
            print(f"❌ ERROR: Authentication failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ ERROR: Connection failed: {str(e)}")
        return False

def test_grok_key():
    """Test Grok API key (optional)"""
    api_key = os.getenv('GROK_API_KEY')

    if not api_key or api_key == 'your_grok_api_key_here':
        print("⚠️  WARNING: Grok API key not set or is placeholder")
        print("AI features (natural language search, recommendations) will be limited.")
        print("Get a free key from: https://console.x.ai/")
        print("Note: Grok is completely free with no usage limits!")
        return False

    try:
        # Simple test request to Grok API
        response = httpx.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-beta",
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 5
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("choices") and len(data["choices"]) > 0:
                print("✅ SUCCESS: Grok API key is valid!")
                print("🤖 AI features are now fully enabled with Grok!")
                return True
            else:
                print("❌ ERROR: Grok API returned invalid response")
                return False
        elif response.status_code == 401:
            print("❌ ERROR: Grok API key is invalid")
            return False
        elif response.status_code == 429:
            print("⚠️  WARNING: Grok API rate limited (shouldn't happen with free tier)")
            return False
        else:
            print(f"❌ ERROR: Grok API test failed with status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"❌ ERROR: Grok API test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Testing API Keys for Air Travel Price Comparison Service")
    print("=" * 60)

    amadeus_ok = test_amadeus_keys()
    print()
    grok_ok = test_grok_key()

    print()
    print("=" * 60)
    if amadeus_ok:
        print("🎉 Ready to search flights!")
        if grok_ok:
            print("🤖 AI features fully enabled with Grok!")
        else:
            print("⚠️  AI features limited (Grok API key needed)")
    else:
        print("❌ Please fix Amadeus API keys before using the service")
        sys.exit(1)