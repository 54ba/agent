#!/bin/bash

# Netlify Deployment Script for Air Travel Price Comparison Service

echo "🚀 Preparing for Netlify deployment..."

# Check if required files exist
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found"
    exit 1
fi

if [ ! -f "netlify/functions/api.py" ]; then
    echo "❌ Error: Netlify function not found"
    exit 1
fi

if [ ! -d "app/static" ]; then
    echo "❌ Error: Static files directory not found"
    exit 1
fi

echo "✅ Deployment files verified"

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "📦 Deploying to Netlify..."
netlify deploy --prod --dir app/static

echo "🎉 Deployment complete!"
echo "📝 Don't forget to set environment variables in Netlify dashboard:"
echo "   - AMADEUS_API_KEY"
echo "   - AMADEUS_API_SECRET"
echo "   - OPENAI_API_KEY"