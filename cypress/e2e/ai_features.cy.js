describe('AI Features', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
  });

  it('should handle AI natural language search without API key', () => {
    // Intercept AI parse query and mock no API key response
    cy.intercept('POST', '/api/ai/parse-query', {
      statusCode: 200,
      body: {
        parsed: false,
        message: 'Natural language processing requires Groq API key'
      }
    }).as('aiParseQuery');

    // Fill AI query
    cy.get('#naturalLanguageQuery').type('Find flights from New York to Paris');
    cy.get('#aiSearchBtn').click();

    cy.wait('@aiParseQuery');

    // Should show error
    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'Could Not Understand');
  });

  it('should parse natural language query successfully', () => {
    // Mock successful AI parsing
    cy.intercept('POST', '/api/ai/parse-query', {
      statusCode: 200,
      body: {
        parsed: true,
        origin: 'JFK',
        destination: 'CDG',
        departure_date: '2025-06-15',
        passengers: 2,
        currency: 'EUR',
        confidence_score: 0.9
      }
    }).as('aiParseSuccess');

    // Mock flight search
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 600,
        lowest_currency: 'EUR',
        all_results: [
          { currency: 'EUR', price: 600, price_usd: 650 },
          { currency: 'USD', price: 650, price_usd: 650 }
        ]
      }
    }).as('flightSearch');

    // Fill AI query and submit
    cy.get('#naturalLanguageQuery').type('Find flights from New York to Paris in June for 2 people');
    cy.get('#aiSearchBtn').click();

    cy.wait('@aiParseSuccess');

    // Should show success message
    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'AI Parsed Your Request');
    cy.contains('Found: JFK to CDG').should('be.visible');

    // Should auto-submit flight search
    cy.wait('@flightSearch');
  });

  it('should show AI insights after flight search', () => {
    // Mock flight search
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [
          { currency: 'USD', price: 500, price_usd: 500 },
          { currency: 'EUR', price: 450, price_usd: 500 }
        ]
      }
    }).as('flightSearch');

    // Mock AI recommendations
    cy.intercept('POST', '/api/ai/recommendations', {
      statusCode: 200,
      body: {
        recommendations: [
          'Consider booking 2-3 months in advance for best rates',
          'Tuesday and Wednesday flights are usually cheaper',
          'Consider nearby airports for better deals'
        ],
        insights: 'Current market trends show stable pricing with potential for slight increases in peak season.'
      }
    }).as('aiRecommendations');

    // Perform flight search
    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');
    cy.wait('@aiRecommendations');

    // Check AI insights are displayed
    cy.get('#aiInsights').should('be.visible');
    cy.contains('AI Travel Insights').should('be.visible');
    cy.contains('Travel Recommendations').should('be.visible');
    cy.contains('Consider booking 2-3 months in advance').should('be.visible');
  });

  it('should handle AI recommendations error gracefully', () => {
    // Mock flight search success
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
      }
    }).as('flightSearch');

    // Mock AI recommendations failure
    cy.intercept('POST', '/api/ai/recommendations', {
      statusCode: 500,
      body: { detail: 'AI service error' }
    }).as('aiRecommendationsError');

    // Perform search
    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');
    cy.wait('@aiRecommendationsError');

    // Should still show results without AI insights
    cy.get('#results').should('be.visible');
    cy.get('#aiInsights').should('not.be.visible');
  });

  it('should fetch destination insights', () => {
    // Mock destination insights
    cy.intercept('GET', '/api/ai/destination-insights/LAX', {
      statusCode: 200,
      body: {
        best_time_to_visit: 'September to November for mild weather',
        attractions: ['Hollywood Walk of Fame', 'Santa Monica Pier', 'Griffith Observatory'],
        travel_tips: ['Use public transportation', 'Book attractions in advance'],
        transportation: ['LAX FlyAway bus', 'Metro Rail', 'Ride-sharing services']
      }
    }).as('destinationInsights');

    // Perform search first to enable AI buttons
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
      }
    }).as('flightSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');

    // Click destination insights button
    cy.get('#getDestinationInsights').click();

    cy.wait('@destinationInsights');

    // Check insights are displayed
    cy.contains('Destination Intelligence').should('be.visible');
    cy.contains('Hollywood Walk of Fame').should('be.visible');
    cy.contains('September to November').should('be.visible');
  });

  it('should analyze price trends', () => {
    // Mock price analysis
    cy.intercept('POST', '/api/ai/analyze-prices', {
      statusCode: 200,
      body: {
        best_value_currency: 'EUR',
        trend_analysis: 'EUR offers 10% better value currently',
        booking_recommendation: 'Book within 2 weeks for best rates'
      }
    }).as('priceAnalysis');

    // Perform search first
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [
          { currency: 'USD', price: 500, price_usd: 500 },
          { currency: 'EUR', price: 450, price_usd: 500 }
        ]
      }
    }).as('flightSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');

    // Click price analysis button
    cy.get('#analyzePrices').click();

    cy.wait('@priceAnalysis');

    // Check analysis is displayed
    cy.contains('Smart Price Analysis').should('be.visible');
    cy.contains('EUR offers 10% better value').should('be.visible');
    cy.contains('Book within 2 weeks').should('be.visible');
  });

  it('should get travel tips', () => {
    // Mock travel tips
    cy.intercept('POST', '/api/ai/recommendations', {
      statusCode: 200,
      body: {
        recommendations: [
          'Pack comfortable walking shoes for airport navigation',
          'Download offline maps for your destination',
          'Keep important documents in a separate pouch'
        ],
        insights: 'Traveling during holidays may have increased security lines.'
      }
    }).as('travelTips');

    // Perform search first
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
      }
    }).as('flightSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');

    // Click travel tips button
    cy.get('#getTravelTips').click();

    cy.wait('@travelTips');

    // Check tips are displayed
    cy.contains('Personalized Travel Tips').should('be.visible');
    cy.contains('Pack comfortable walking shoes').should('be.visible');
  });

  it('should handle AI service unavailability', () => {
    // Mock all AI endpoints to fail
    cy.intercept('POST', '/api/ai/*', { statusCode: 500 }).as('aiError');
    cy.intercept('GET', '/api/ai/*', { statusCode: 500 }).as('aiError');

    // Perform search
    cy.intercept('GET', '/api/flights/search*', {
      statusCode: 200,
      body: {
        lowest_price: 500,
        lowest_currency: 'USD',
        all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
      }
    }).as('flightSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearch');

    // Try AI features - should show error messages
    cy.get('#getDestinationInsights').click();
    cy.contains('AI service temporarily unavailable').should('be.visible');

    cy.get('#analyzePrices').click();
    cy.contains('AI analysis service temporarily unavailable').should('be.visible');
  });
});