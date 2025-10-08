describe('UI Interactions and Result Actions', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
    // Clear localStorage to ensure clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should handle result action buttons', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Mock successful search
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

      // Perform search
      cy.get('#origin').type('JFK');
      cy.get('#destination').type('CDG');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();

      cy.wait('@flightSearch');

      // Test "Book Best Deal" button (placeholder functionality)
      cy.get('#bookBestDeal').click();
      cy.get('#error').should('be.visible');
      cy.contains('Booking Service').should('be.visible');
      cy.contains('External booking integration would be implemented here').should('be.visible');

      // Test "Compare All Options" button
      cy.get('#compareAllOptions').click();
      // Should toggle detailed view (implementation may vary)

      // Test "Save Search" button
      cy.get('#saveSearch').click();
      cy.contains('Search Saved!').should('be.visible');
      cy.contains('Your search has been saved to your account').should('be.visible');
    });
  });

  it('should handle loading states properly', () => {
    // Test search button loading state
    cy.intercept('GET', '/api/flights/search*', (req) => {
      // Delay response to test loading state
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            statusCode: 200,
            body: {
              lowest_price: 500,
              lowest_currency: 'USD',
              all_results: [{ currency: 'USD', price: 500, price_usd: 500 }]
            }
          });
        }, 2000);
      });
    }).as('delayedFlightSearch');

    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    // Check loading states
    cy.get('#loading').should('be.visible');
    cy.get('#searchBtn').should('be.disabled');
    cy.get('#searchBtn').should('contain', 'Searching...');

    cy.wait('@delayedFlightSearch');

    // Check loading is hidden and button is re-enabled
    cy.get('#loading').should('not.be.visible');
    cy.get('#searchBtn').should('not.be.disabled');
    cy.get('#searchBtn').should('contain', 'Compare Prices');
  });

  it('should handle error message dismissal', () => {
    // Trigger an error
    cy.get('#searchBtn').click();
    cy.get('#error').should('be.visible');

    // Error should auto-hide after timeout (if implemented)
    // Or test manual dismissal if available
    cy.wait(3500); // Wait for auto-hide timeout
    cy.get('#error').should('not.be.visible');
  });

  it('should display search suggestions on input', () => {
    cy.get('#naturalLanguageQuery').type('Find flights to Paris');

    // Check suggestions appear
    cy.get('#searchSuggestions').should('be.visible');
    cy.get('.suggestion-item').should('have.length.greaterThan', 0);

    // Click on a suggestion
    cy.get('.suggestion-item').first().click();
    cy.get('#naturalLanguageQuery').should('not.have.value', 'Find flights to Paris');

    // Suggestions should hide on blur
    cy.get('#naturalLanguageQuery').blur();
    cy.get('#searchSuggestions').should('not.be.visible');
  });

  it('should handle form focus and blur events', () => {
    // Test input focus styles
    cy.get('#origin').focus();
    cy.get('#origin').should('have.css', 'border-color').and('not.equal', '#e1e5e9');

    // Test input blur
    cy.get('#origin').blur();
    // Border should return to normal (this may vary based on implementation)

    // Test select focus
    cy.get('#passengers').focus();
    cy.get('#passengers').should('have.css', 'border-color').and('not.equal', '#e1e5e9');
  });

  it('should handle keyboard navigation', () => {
    // Test tab navigation through form
    cy.get('#origin').type('JFK');
    cy.get('#origin').tab();
    cy.get('#destination').should('be.focused');

    cy.get('#destination').type('LAX').tab();
    cy.get('#departureDate').should('be.focused');

    cy.get('#departureDate').type('2025-12-25').tab();
    cy.get('#passengers').should('be.focused');
  });

  it('should handle responsive design elements', () => {
    // Test on different viewport sizes
    cy.viewport('iphone-6');
    cy.contains('Flight Price Comparison').should('be.visible');

    // Check form layout changes
    cy.get('.search-form').should('have.css', 'grid-template-columns', '1fr');

    cy.viewport('macbook-15');
    cy.get('.search-form').should('have.css', 'grid-template-columns', '1fr 1fr');
  });

  it('should handle result card interactions', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('CDG');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();

      cy.wait('@flightSearch');

      // Test result card hover effects
      cy.get('.result-card').first().trigger('mouseover');
      // Check for visual changes (may vary by implementation)

      // Test best deal highlighting
      cy.get('.result-card.best').should('exist');
      cy.get('.result-card.best').should('contain', 'Best Deal!');

      // Test preferred currency highlighting
      cy.get('#preferredCurrency').select('EUR');
      cy.reload();

      // Re-perform search
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch2');
      cy.get('#origin').type('JFK');
      cy.get('#destination').type('CDG');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#preferredCurrency').select('EUR');
      cy.get('#searchBtn').click();
      cy.wait('@flightSearch2');

      cy.get('.result-card.preferred').should('exist');
      cy.get('.result-card.preferred').should('contain', 'Your Preferred Currency');
    });
  });

  it('should handle AI insights animations', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');
        cy.intercept('POST', '/api/ai/recommendations', aiResponses.ai_recommendations).as('aiRecommendations');

        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');
        cy.get('#departureDate').type('2025-12-25');
        cy.get('#searchBtn').click();

        cy.wait('@flightSearch');
        cy.wait('@aiRecommendations');

        // Check AI response animation
        cy.get('.ai-response').should('be.visible');
        cy.get('.ai-response').should('have.css', 'animation-name', 'slideIn');
      });
    });
  });

  it('should handle history item hover effects', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Create history
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-12-25');
      cy.get('#searchBtn').click();
      cy.wait('@flightSearch');

      // Test history item hover
      cy.get('.history-item').first().trigger('mouseover');
      cy.get('.history-item').first().should('have.css', 'background-color').and('not.equal', 'rgba(0, 0, 0, 0)');
    });
  });

  it('should handle button disabled states', () => {
    // AI buttons should be disabled initially
    cy.get('#getDestinationInsights').should('be.disabled');
    cy.get('#analyzePrices').should('be.disabled');
    cy.get('#getTravelTips').should('be.disabled');

    // Search button should be enabled
    cy.get('#searchBtn').should('not.be.disabled');

    // After search, AI buttons should be enabled
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-12-25');
      cy.get('#searchBtn').click();
      cy.wait('@flightSearch');

      cy.get('#getDestinationInsights').should('not.be.disabled');
      cy.get('#analyzePrices').should('not.be.disabled');
      cy.get('#getTravelTips').should('not.be.disabled');
    });
  });

  it('should handle async operations and race conditions', () => {
    // Test multiple rapid AI button clicks
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');
        cy.intercept('GET', '/api/ai/destination-insights/LAX', aiResponses.destination_insights).as('destinationInsights');

        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');
        cy.get('#departureDate').type('2025-12-25');
        cy.get('#searchBtn').click();
        cy.wait('@flightSearch');

        // Click button multiple times rapidly
        cy.get('#getDestinationInsights').click();
        cy.get('#getDestinationInsights').click();
        cy.get('#getDestinationInsights').click();

        // Should only process one request
        cy.wait('@destinationInsights');
        cy.get('.ai-response').should('have.length', 1);
      });
    });
  });
});