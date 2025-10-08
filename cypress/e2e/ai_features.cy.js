describe('AI Features', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
    // Clear localStorage to ensure clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should handle AI natural language search without API key', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      // Intercept AI parse query and mock no API key response
      cy.intercept('POST', '/api/ai/parse-query', aiResponses.parse_query_failure).as('aiParseQuery');

      // Fill AI query
      cy.get('#naturalLanguageQuery').type('Find flights from New York to Paris');
      cy.get('#aiSearchBtn').click();

      cy.wait('@aiParseQuery');

      // Should show error
      cy.get('#error').should('be.visible');
      cy.get('#errorTitle').should('contain', 'Could Not Understand');
    });
  });

  it('should parse natural language queries with different confidence levels', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.fixture('test_data.json').then((testData) => {
        // Test high confidence parsing
        cy.intercept('POST', '/api/ai/parse-query', aiResponses.parse_query_success).as('aiParseSuccess');

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

        // Test multiple queries
        testData.search_queries.slice(0, 3).forEach((query) => {
          cy.get('#naturalLanguageQuery').clear().type(query);
          cy.get('#aiSearchBtn').click();

          cy.wait('@aiParseSuccess');

          // Should show success message with confidence indicator
          cy.get('#error').should('be.visible');
          cy.get('#errorTitle').should('contain', 'AI Parsed Your Request');
          cy.contains('Found: JFK to CDG').should('be.visible');
          cy.contains('High confidence').should('be.visible');

          // Should auto-submit flight search
          cy.wait('@flightSearch');

          cy.reload();
        });
      });
    });
  });

  it('should handle low confidence AI parsing', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.intercept('POST', '/api/ai/parse-query', aiResponses.parse_query_low_confidence).as('aiParseLowConfidence');

      cy.intercept('GET', '/api/flights/search*', {
        statusCode: 200,
        body: {
          lowest_price: 500,
          lowest_currency: 'USD',
          all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
        }
      }).as('flightSearch');

      cy.get('#naturalLanguageQuery').type('Find cheap flights somewhere');
      cy.get('#aiSearchBtn').click();

      cy.wait('@aiParseLowConfidence');

      // Should show medium confidence indicator
      cy.contains('Medium confidence').should('be.visible');

      // Should still proceed with search
      cy.wait('@flightSearch');
    });
  });

  it('should show AI insights after flight search with dynamic data', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.fixture('flight_search_responses.json').then((flightResponses) => {
        // Mock flight search
        cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

        // Mock AI recommendations
        cy.intercept('POST', '/api/ai/recommendations', aiResponses.ai_recommendations).as('aiRecommendations');

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

        // Verify all recommendations are displayed
        aiResponses.ai_recommendations.recommendations.forEach((rec) => {
          cy.contains(rec).should('be.visible');
        });

        // Check insights content
        cy.contains(aiResponses.ai_recommendations.insights).should('be.visible');
      });
    });
  });

  it('should handle AI recommendations error gracefully', () => {
    cy.fixture('flight_search_responses.json').then((flightResponses) => {
      // Mock flight search success
      cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

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
  });

  it('should fetch destination insights for multiple destinations', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.fixture('test_data.json').then((testData) => {
        // Test different destinations
        const destinations = ['LAX', 'CDG', 'LHR'];

        destinations.forEach((dest, index) => {
          // Mock destination insights with dynamic data
          const insightsResponse = {
            ...aiResponses.destination_insights,
            best_time_to_visit: `Best time for ${dest}: September to November`
          };

          cy.intercept('GET', `/api/ai/destination-insights/${dest}`, insightsResponse).as(`destinationInsights${index}`);

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
          cy.get('#destination').type(dest);
          cy.get('#departureDate').type('2025-12-25');
          cy.get('#searchBtn').click();

          cy.wait('@flightSearch');

          // Click destination insights button
          cy.get('#getDestinationInsights').click();

          cy.wait(`@destinationInsights${index}`);

          // Check insights are displayed
          cy.contains('Destination Intelligence').should('be.visible');
          cy.contains(`Best time for ${dest}`).should('be.visible');

          // Check attractions are listed
          aiResponses.destination_insights.attractions.forEach((attraction) => {
            cy.contains(attraction).should('be.visible');
          });

          if (index < destinations.length - 1) {
            cy.reload();
          }
        });
      });
    });
  });

  it('should analyze price trends with different scenarios', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.fixture('flight_search_responses.json').then((flightResponses) => {
        // Mock price analysis
        cy.intercept('POST', '/api/ai/analyze-prices', aiResponses.price_analysis).as('priceAnalysis');

        // Perform search first
        cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

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
        cy.contains(aiResponses.price_analysis.best_value_currency).should('be.visible');
        cy.contains(aiResponses.price_analysis.trend_analysis).should('be.visible');
        cy.contains(aiResponses.price_analysis.booking_recommendation).should('be.visible');
      });
    });
  });

  it('should get personalized travel tips', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      cy.fixture('flight_search_responses.json').then((flightResponses) => {
        // Mock travel tips
        cy.intercept('POST', '/api/ai/recommendations', aiResponses.travel_tips).as('travelTips');

        // Perform search first
        cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

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

        // Verify all tips are shown
        aiResponses.travel_tips.recommendations.forEach((tip) => {
          cy.contains(tip).should('be.visible');
        });

        // Check insights
        cy.contains(aiResponses.travel_tips.insights).should('be.visible');
      });
    });
  });

  it('should handle AI service unavailability for all features', () => {
    cy.fixture('flight_search_responses.json').then((flightResponses) => {
      // Mock all AI endpoints to fail
      cy.intercept('POST', '/api/ai/*', { statusCode: 500 }).as('aiPostError');
      cy.intercept('GET', '/api/ai/*', { statusCode: 500 }).as('aiGetError');

      // Perform search
      cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-12-25');
      cy.get('#searchBtn').click();

      cy.wait('@flightSearch');

      // Test each AI feature button
      const aiButtons = [
        { id: '#getDestinationInsights', errorText: 'AI service temporarily unavailable' },
        { id: '#analyzePrices', errorText: 'AI analysis service temporarily unavailable' },
        { id: '#getTravelTips', errorText: 'Unable to load travel tips' }
      ];

      aiButtons.forEach((button) => {
        cy.get(button.id).click();
        cy.contains(button.errorText).should('be.visible');
      });
    });
  });

  it('should handle AI button loading states', () => {
    cy.fixture('flight_search_responses.json').then((flightResponses) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        // Perform search first
        cy.intercept('GET', '/api/flights/search*', flightResponses.success_response).as('flightSearch');

        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');
        cy.get('#departureDate').type('2025-12-25');
        cy.get('#searchBtn').click();

        cy.wait('@flightSearch');

        // Mock delayed AI response
        cy.intercept('GET', '/api/ai/destination-insights/LAX', (req) => {
          // Delay response by 2 seconds
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                statusCode: 200,
                body: aiResponses.destination_insights
              });
            }, 2000);
          });
        }).as('delayedDestinationInsights');

        // Click destination insights button
        cy.get('#getDestinationInsights').click();

        // Check loading state
        cy.get('#getDestinationInsights').should('be.disabled');
        cy.get('#getDestinationInsights').should('contain', 'Loading...');

        cy.wait('@delayedDestinationInsights');

        // Check button is re-enabled
        cy.get('#getDestinationInsights').should('not.be.disabled');
        cy.get('#getDestinationInsights').should('contain', 'Destination Guide');
      });
    });
  });

  it('should validate destination before AI insights', () => {
    // Try to get destination insights without entering destination
    cy.get('#getDestinationInsights').should('be.disabled');

    // Enter destination and search
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

    // Now button should be enabled
    cy.get('#getDestinationInsights').should('not.be.disabled');
  });

  it('should handle AI search suggestions', () => {
    // Test search suggestions appear
    cy.get('#naturalLanguageQuery').type('Find flights to');

    // Should show suggestions
    cy.get('#searchSuggestions').should('be.visible');
    cy.contains('Find flights from Find flights to to').should('be.visible');

    // Click on suggestion
    cy.contains('Find flights from Find flights to to').click();
    cy.get('#naturalLanguageQuery').should('have.value', 'Find flights from Find flights to to');

    // Clear and test focus/blur
    cy.get('#naturalLanguageQuery').clear().type('Paris');
    cy.get('#naturalLanguageQuery').blur();

    // Suggestions should hide
    cy.get('#searchSuggestions').should('not.be.visible');
  });

  it('should integrate AI parsing with form validation', () => {
    cy.fixture('ai_responses.json').then((aiResponses) => {
      // Mock successful parsing with invalid airport
      const invalidParseResponse = {
        ...aiResponses.parse_query_success,
        origin: 'INVALID',
        destination: 'ALSOINVALID'
      };

      cy.intercept('POST', '/api/ai/parse-query', invalidParseResponse).as('invalidAiParse');

      cy.get('#naturalLanguageQuery').type('Find flights from nowhere to nowhere');
      cy.get('#aiSearchBtn').click();

      cy.wait('@invalidAiParse');

      // Should show success message but then validation error
      cy.get('#error').should('be.visible');
      cy.contains('AI Parsed Your Request').should('be.visible');

      // When auto-submit happens, should show validation error
      cy.get('#errorTitle').should('contain', 'Invalid Airport Codes');
    });
  });
});