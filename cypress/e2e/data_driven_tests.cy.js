describe('Data-Driven Flight Search Tests', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should handle multiple airport combinations', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        // Test various airport combinations
        const testCases = [
          { origin: testData.airports[0], dest: testData.airports[1], expected: true },
          { origin: testData.airports[1], dest: testData.airports[2], expected: true },
          { origin: testData.airports[2], dest: testData.airports[3], expected: true }
        ];

        testCases.forEach((testCase, index) => {
          cy.intercept('GET', '/api/flights/search*', responses.success_response).as(`flightSearch${index}`);

          cy.get('#origin').clear().type(testCase.origin.code);
          cy.get('#destination').clear().type(testCase.dest.code);
          cy.get('#departureDate').clear().type('2025-06-15');
          cy.get('#searchBtn').click();

          cy.wait(`@flightSearch${index}`);

          if (testCase.expected) {
            cy.get('#results').should('be.visible');
            cy.contains(testCase.origin.code).should('be.visible');
            cy.contains(testCase.dest.code).should('be.visible');
          }

          if (index < testCases.length - 1) {
            cy.reload();
          }
        });
      });
    });
  });

  it('should handle different passenger counts', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        testData.passenger_counts.forEach((passengerCount, index) => {
          cy.intercept('GET', '/api/flights/search*', responses.success_response).as(`passengerSearch${index}`);

          cy.get('#origin').clear().type('JFK');
          cy.get('#destination').clear().type('LAX');
          cy.get('#departureDate').clear().type('2025-06-15');
          cy.get('#passengers').select(passengerCount.toString());
          cy.get('#searchBtn').click();

          cy.wait(`@passengerSearch${index}`);

          cy.get('#results').should('be.visible');
          cy.get('#bestPrice').should('be.visible');

          if (index < testData.passenger_counts.length - 1) {
            cy.reload();
          }
        });
      });
    });
  });

  it('should handle all currency options', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        testData.currencies.forEach((currency, index) => {
          cy.intercept('GET', '/api/flights/search*', responses.success_response).as(`currencySearch${index}`);

          cy.get('#origin').clear().type('JFK');
          cy.get('#destination').clear().type('LAX');
          cy.get('#departureDate').clear().type('2025-06-15');
          cy.get('#preferredCurrency').select(currency);
          cy.get('#searchBtn').click();

          cy.wait(`@currencySearch${index}`);

          // Check that preferred currency results are highlighted
          cy.get('.result-card.preferred').should('exist');
          cy.contains(currency).should('be.visible');

          if (index < testData.currencies.length - 1) {
            cy.reload();
          }
        });
      });
    });
  });

  it('should handle various search queries', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        testData.search_queries.slice(0, 5).forEach((query, index) => {
          const mockResponse = {
            ...aiResponses.parse_query_success,
            confidence_score: Math.random() > 0.5 ? 0.9 : 0.7
          };

          cy.intercept('POST', '/api/ai/parse-query', mockResponse).as(`aiParse${index}`);
          cy.intercept('GET', '/api/flights/search*', {
            statusCode: 200,
            body: {
              lowest_price: 400 + Math.floor(Math.random() * 200),
              lowest_currency: 'USD',
              all_results: [{
                currency: 'USD',
                price: 400 + Math.floor(Math.random() * 200),
                price_usd: 400 + Math.floor(Math.random() * 200)
              }]
            }
          }).as(`flightSearch${index}`);

          cy.get('#naturalLanguageQuery').clear().type(query);
          cy.get('#aiSearchBtn').click();

          cy.wait(`@aiParse${index}`);

          // Should show parsing success
          cy.contains('AI Parsed Your Request').should('be.visible');

          cy.wait(`@flightSearch${index}`);

          // Should show results
          cy.get('#results').should('be.visible');

          if (index < 4) { // Only reload for first 4 tests
            cy.reload();
          }
        });
      });
    });
  });

  it('should handle edge case dates', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        const validDates = testData.edge_case_dates.filter(date => date.date >= new Date().toISOString().split('T')[0]);

        validDates.forEach((dateCase, index) => {
          cy.intercept('GET', '/api/flights/search*', responses.success_response).as(`dateSearch${index}`);

          cy.get('#origin').clear().type('JFK');
          cy.get('#destination').clear().type('LAX');
          cy.get('#departureDate').clear().type(dateCase.date);
          cy.get('#searchBtn').click();

          cy.wait(`@dateSearch${index}`);

          cy.get('#results').should('be.visible');
          cy.contains(dateCase.description).should('not.exist'); // Just checking the search works

          if (index < validDates.length - 1) {
            cy.reload();
          }
        });
      });
    });
  });

  it('should handle various error scenarios comprehensively', () => {
    cy.fixture('test_data.json').then((testData) => {
      testData.error_scenarios.forEach((scenario, index) => {
        cy.intercept('GET', '/api/flights/search*', {
          statusCode: scenario.status,
          body: { detail: scenario.message }
        }).as(`errorSearch${index}`);

        cy.get('#origin').clear().type('JFK');
        cy.get('#destination').clear().type('LAX');
        cy.get('#departureDate').clear().type('2025-06-15');
        cy.get('#searchBtn').click();

        cy.wait(`@errorSearch${index}`);

        // Check appropriate error handling
        cy.get('#error').should('be.visible');
        cy.get('#errorTitle').should('contain', 'Search Failed');
        cy.get('#errorMessage').should('contain', scenario.message);

        // Results should not be visible
        cy.get('#results').should('not.be.visible');

        if (index < testData.error_scenarios.length - 1) {
          cy.reload();
        }
      });
    });
  });

  it('should validate airport codes dynamically', () => {
    cy.fixture('test_data.json').then((testData) => {
      // Test invalid codes
      testData.invalid_airports.forEach((invalidCode) => {
        cy.get('#origin').clear().type(invalidCode);
        cy.get('#searchBtn').click();

        cy.get('#error').should('be.visible');
        cy.get('#errorTitle').should('contain', 'Invalid Airport Codes');
      });

      // Test valid codes
      testData.airports.slice(0, 3).forEach((airport) => {
        cy.get('#origin').clear().type(airport.code);
        cy.get('#destination').clear().type('LAX');
        cy.get('#departureDate').clear().type('2025-06-15');

        // Should not show validation error for valid codes
        cy.get('#searchBtn').click();

        // Should proceed to search (may show loading or results)
        cy.get('#error').should('not.contain', 'Invalid Airport Codes');
      });
    });
  });

  it('should handle AI confidence levels', () => {
    const confidenceLevels = [0.3, 0.5, 0.7, 0.9];

    confidenceLevels.forEach((confidence, index) => {
      cy.fixture('ai_responses.json').then((aiResponses) => {
        const mockResponse = {
          ...aiResponses.parse_query_success,
          confidence_score: confidence
        };

        cy.intercept('POST', '/api/ai/parse-query', mockResponse).as(`confidenceTest${index}`);

        cy.get('#naturalLanguageQuery').clear().type(`Test query ${index}`);
        cy.get('#aiSearchBtn').click();

        cy.wait(`@confidenceTest${index}`);

        // Check confidence indicator
        if (confidence > 0.8) {
          cy.contains('High confidence').should('be.visible');
        } else if (confidence > 0.6) {
          cy.contains('Medium confidence').should('be.visible');
        } else {
          cy.contains('Low confidence').should('be.visible');
        }

        if (index < confidenceLevels.length - 1) {
          cy.reload();
        }
      });
    });
  });

  it('should test result display variations', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Test with different result structures
      const resultVariations = [
        responses.success_response,
        {
          ...responses.success_response,
          all_results: responses.success_response.all_results.slice(0, 1) // Single result
        },
        {
          ...responses.success_response,
          all_results: responses.success_response.all_results.slice(0, 2) // Two results
        }
      ];

      resultVariations.forEach((variation, index) => {
        cy.intercept('GET', '/api/flights/search*', variation).as(`variationSearch${index}`);

        cy.get('#origin').clear().type('JFK');
        cy.get('#destination').clear().type('LAX');
        cy.get('#departureDate').clear().type('2025-06-15');
        cy.get('#searchBtn').click();

        cy.wait(`@variationSearch${index}`);

        // Check results are displayed
        cy.get('#results').should('be.visible');
        cy.get('#bestPrice').should('be.visible');
        cy.get('.result-card').should('have.length', variation.all_results.length);

        if (index < resultVariations.length - 1) {
          cy.reload();
        }
      });
    });
  });
});