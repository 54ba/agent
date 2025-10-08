describe('Comprehensive Edge Cases and Error Conditions', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should handle network failures gracefully', () => {
    // Test complete network failure
    cy.intercept('GET', '/api/flights/search*', { forceNetworkError: true }).as('networkError');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-06-15');
    cy.get('#searchBtn').click();

    cy.wait('@networkError');

    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'Connection Error');
    cy.get('#errorMessage').should('contain', 'Unable to connect to the flight search service');
  });

  it('should handle malformed API responses', () => {
    // Test various malformed responses
    const malformedResponses = [
      { statusCode: 200, body: null },
      { statusCode: 200, body: {} },
      { statusCode: 200, body: { lowest_price: 'invalid' } },
      { statusCode: 200, body: { all_results: 'not an array' } }
    ];

    malformedResponses.forEach((response, index) => {
      cy.intercept('GET', '/api/flights/search*', response).as(`malformed${index}`);

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();

      cy.wait(`@malformed${index}`);

      // Should handle gracefully without crashing
      cy.get('body').should('be.visible'); // Basic check that page still works

      if (index < malformedResponses.length - 1) {
        cy.reload();
      }
    });
  });

  it('should handle extremely long airport codes', () => {
    // Test with very long strings
    const longCode = 'A'.repeat(10);

    cy.get('#origin').type(longCode);
    cy.get('#origin').should('have.value', longCode.substring(0, 3)); // Should be limited by maxlength

    // Test with special characters
    cy.get('#origin').clear().type('JFK!@#');
    cy.get('#origin').should('have.value', 'JFK!@#'); // Should allow but validation will catch
  });

  it('should handle rapid successive searches', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Intercept with delay to simulate real API
      cy.intercept('GET', '/api/flights/search*', (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ statusCode: 200, body: responses.success_response });
          }, 500);
        });
      }).as('delayedSearch');

      // Perform multiple rapid searches
      for (let i = 0; i < 3; i++) {
        cy.get('#searchBtn').click();
        cy.wait(100); // Small delay between clicks
      }

      // Should handle multiple requests without issues
      cy.get('@delayedSearch.all').should('have.length', 3);
    });
  });

  it('should handle browser back/forward navigation', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

      // Perform search
      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();

      cy.wait('@flightSearch');

      // Navigate away and back
      cy.url().then((currentUrl) => {
        cy.visit('/static/index.html'); // Navigate away
        cy.go('back'); // Go back

        // Should maintain state or handle gracefully
        cy.url().should('include', '/static/index.html');
      });
    });
  });

  it('should handle localStorage corruption', () => {
    // Corrupt localStorage data
    cy.window().then((win) => {
      win.localStorage.setItem('flightSearchHistory', 'invalid json');
      win.localStorage.setItem('lastSearchData', 'also invalid');
    });

    // Reload page
    cy.reload();

    // Should handle corrupted data gracefully
    cy.get('body').should('be.visible');
    cy.get('#historyList').should('contain', 'No recent searches');
  });

  it('should handle very large result sets', () => {
    // Create a large result set
    const largeResults = [];
    for (let i = 0; i < 50; i++) {
      largeResults.push({
        currency: 'USD',
        price: 400 + i * 10,
        price_usd: 400 + i * 10,
        parsed_offer: {
          flight_info: {
            airline: `Airline ${i}`,
            flight_number: `FL${i}`,
            duration: '8h 30m'
          }
        }
      });
    }

    const largeResponse = {
      lowest_price: 400,
      lowest_currency: 'USD',
      all_results: largeResults
    };

    cy.intercept('GET', '/api/flights/search*', largeResponse).as('largeResultsSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-06-15');
    cy.get('#searchBtn').click();

    cy.wait('@largeResultsSearch');

    // Should handle large result set without performance issues
    cy.get('.result-card').should('have.length', 50);
    cy.get('#results').should('be.visible');
  });

  it('should handle concurrent AI requests', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

        // Mock all AI endpoints with delays
        cy.intercept('GET', '/api/ai/destination-insights/*', (req) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ statusCode: 200, body: aiResponses.destination_insights }), 1000);
          });
        }).as('destinationInsights');

        cy.intercept('POST', '/api/ai/analyze-prices', (req) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ statusCode: 200, body: aiResponses.price_analysis }), 800);
          });
        }).as('priceAnalysis');

        cy.intercept('POST', '/api/ai/recommendations', (req) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ statusCode: 200, body: aiResponses.travel_tips }), 600);
          });
        }).as('travelTips');

        // Perform search
        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');
        cy.get('#departureDate').type('2025-06-15');
        cy.get('#searchBtn').click();

        cy.wait('@flightSearch');

        // Click all AI buttons simultaneously
        cy.get('#getDestinationInsights').click();
        cy.get('#analyzePrices').click();
        cy.get('#getTravelTips').click();

        // Wait for all responses
        cy.wait('@destinationInsights');
        cy.wait('@priceAnalysis');
        cy.wait('@travelTips');

        // Should handle concurrent requests without issues
        cy.get('.ai-response').should('have.length', 3);
      });
    });
  });

  it('should handle extreme form input values', () => {
    // Test with maximum passenger count
    cy.get('#passengers').select('4');

    // Test with very far future dates
    const farFutureDate = new Date();
    farFutureDate.setFullYear(farFutureDate.getFullYear() + 2);
    const farFutureString = farFutureDate.toISOString().split('T')[0];

    cy.get('#departureDate').type(farFutureString);

    // Should still work
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('extremeSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#searchBtn').click();

      cy.wait('@extremeSearch');
      cy.get('#results').should('be.visible');
    });
  });

  it('should handle page refresh during operations', () => {
    // Start a search
    cy.intercept('GET', '/api/flights/search*', (req) => {
      // Long delay to simulate slow request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            statusCode: 200,
            body: { lowest_price: 500, lowest_currency: 'USD', all_results: [] }
          });
        }, 3000);
      });
    }).as('slowSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-06-15');
    cy.get('#searchBtn').click();

    // Refresh page before request completes
    cy.wait(500);
    cy.reload();

    // Should handle page refresh gracefully
    cy.get('body').should('be.visible');
    cy.get('#searchBtn').should('not.be.disabled');
  });

  it('should handle invalid date formats', () => {
    // Test various invalid date inputs
    const invalidDates = ['invalid', '2025-13-45', 'abcd-ef-gh', ''];

    invalidDates.forEach((invalidDate) => {
      cy.get('#departureDate').clear().type(invalidDate);
      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#searchBtn').click();

      // Should show validation error
      cy.get('#error').should('be.visible');
    });
  });

  it('should handle API timeout scenarios', () => {
    // Mock timeout
    cy.intercept('GET', '/api/flights/search*', (req) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ statusCode: 408, body: { detail: 'Request timeout' } }), 10000);
      });
    }).as('timeoutSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-06-15');
    cy.get('#searchBtn').click();

    cy.wait('@timeoutSearch', { timeout: 11000 });

    // Should handle timeout gracefully
    cy.get('#error').should('be.visible');
  });

  it('should handle memory-intensive operations', () => {
    // Create very large AI responses
    const largeAIResponse = {
      recommendations: Array(100).fill().map((_, i) => `Recommendation ${i}: This is a very detailed recommendation with lots of text to test memory handling.`),
      insights: 'x'.repeat(10000) // 10KB of text
    };

    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');
      cy.intercept('POST', '/api/ai/recommendations', largeAIResponse).as('largeAIResponse');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();

      cy.wait('@flightSearch');
      cy.wait('@largeAIResponse');

      // Should handle large responses without crashing
      cy.get('#aiInsights').should('be.visible');
      cy.get('.ai-response').should('exist');
    });
  });

  it('should handle accessibility features', () => {
    // Test keyboard navigation
    cy.get('#origin').focus().type('JFK').tab();
    cy.get('#destination').should('be.focused');

    // Test ARIA labels and roles (if implemented)
    cy.get('#searchBtn').should('have.attr', 'type', 'submit');

    // Test form validation messages
    cy.get('#searchBtn').click();
    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'Missing Information');
  });

  it('should handle cross-browser compatibility edge cases', () => {
    // Test with different user agents or viewport sizes
    cy.viewport('iphone-6');
    cy.contains('Flight Price Comparison').should('be.visible');

    // Test touch interactions (simulated)
    cy.get('#searchBtn').click({ force: true });

    cy.viewport('macbook-15');
    cy.contains('Flight Price Comparison').should('be.visible');
  });
});