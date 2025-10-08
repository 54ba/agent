describe('Flight Price Comparison App', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
    // Clear localStorage to ensure clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should load the main page correctly', () => {
    cy.contains('✈️ Flight Price Comparison').should('be.visible');
    cy.contains('Find the best airfare deals across multiple currencies').should('be.visible');

    // Check form elements with dynamic selectors
    cy.get('[id="origin"]').should('be.visible');
    cy.get('[id="destination"]').should('be.visible');
    cy.get('[id="departureDate"]').should('be.visible');
    cy.get('[id="passengers"]').should('be.visible');
    cy.get('[id="preferredCurrency"]').should('be.visible');
    cy.get('[id="searchBtn"]').should('be.visible').and('contain', 'Compare Prices');

    // Verify form is initially empty
    cy.get('#origin').should('have.value', '');
    cy.get('#destination').should('have.value', '');
    cy.get('#passengers').should('have.value', '1');
    cy.get('#preferredCurrency').should('have.value', 'USD');
  });

  it('should validate airport codes dynamically', () => {
    cy.fixture('test_data.json').then((testData) => {
      // Test invalid airport codes
      testData.invalid_airports.forEach((invalidCode) => {
        cy.get('#origin').clear().type(invalidCode);
        cy.get('#origin').should('have.value', invalidCode.toUpperCase());
        // Should show validation error when form is submitted
        cy.get('#searchBtn').click();
        cy.get('#error').should('be.visible');
        cy.get('#errorTitle').should('contain', 'Invalid Airport Codes');
      });

      // Test valid airport codes
      testData.airports.slice(0, 3).forEach((airport) => {
        cy.get('#origin').clear().type(airport.code.toLowerCase());
        cy.get('#origin').should('have.value', airport.code);
      });
    });
  });

  it('should show AI search section with all features', () => {
    cy.contains('Ask AI to Plan Your Trip').should('be.visible');
    cy.get('#naturalLanguageQuery').should('be.visible');
    cy.get('#aiSearchBtn').should('be.visible').and('contain', 'Ask AI');

    // Check quick action buttons
    cy.contains('NYC → LON').should('be.visible');
    cy.contains('Paris Trip').should('be.visible');
    cy.contains('Tokyo Deal').should('be.visible');
  });

  it('should fill example queries from quick actions', () => {
    const quickActions = [
      { button: 'NYC → LON', expected: 'Find cheap flights from New York to London next month' },
      { button: 'Paris Trip', expected: 'Book 2 tickets to Paris in June' },
      { button: 'Tokyo Deal', expected: 'Find flights to Tokyo under $800' }
    ];

    quickActions.forEach((action) => {
      cy.contains(action.button).click();
      cy.get('#naturalLanguageQuery').should('have.value', action.expected);
      // Clear for next test
      cy.get('#naturalLanguageQuery').clear();
    });
  });

  it('should perform flight search with dynamic data', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        // Use dynamic test data
        const origin = testData.airports[0].code; // JFK
        const destination = testData.airports[1].code; // LAX
        const passengers = testData.passenger_counts[1]; // 2
        const currency = testData.currencies[0]; // USD

        // Calculate future date
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateString = futureDate.toISOString().split('T')[0];

        // Intercept the API call
        cy.intercept('GET', '/api/flights/search*', responses.success_response).as('flightSearch');

        // Fill out the form dynamically
        cy.get('#origin').type(origin);
        cy.get('#destination').type(destination);
        cy.get('#departureDate').type(dateString);
        cy.get('#passengers').select(passengers.toString());
        cy.get('#preferredCurrency').select(currency);

        // Submit the form
        cy.get('#searchBtn').click();

        // Wait for loading state
        cy.get('#loading').should('be.visible');
        cy.contains('Searching for the best deals...').should('be.visible');

        // Wait for API response
        cy.wait('@flightSearch').then((interception) => {
          expect(interception.request.url).to.include(`origin=${origin}`);
          expect(interception.request.url).to.include(`destination=${destination}`);
          expect(interception.request.url).to.include(`adults=${passengers}`);
        });

        // Verify results are displayed
        cy.get('#results').should('be.visible');
        cy.get('#bestPrice').should('be.visible');
        cy.get('#allResults').should('be.visible');

        // Check that results contain expected currencies
        responses.success_response.all_results.forEach((result) => {
          cy.contains(result.currency).should('be.visible');
        });
      });
    });
  });

  it('should handle various error scenarios', () => {
    cy.fixture('test_data.json').then((testData) => {
      testData.error_scenarios.forEach((scenario) => {
        // Intercept and mock error response
        cy.intercept('GET', '/api/flights/search*', {
          statusCode: scenario.status,
          body: { detail: scenario.message }
        }).as(`flightSearchError${scenario.status}`);

        // Fill and submit form
        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');
        cy.get('#departureDate').type('2025-12-25');
        cy.get('#searchBtn').click();

        cy.wait(`@flightSearchError${scenario.status}`);

        // Check error display
        cy.get('#error').should('be.visible');
        cy.get('#errorTitle').should('contain', 'Search Failed');
        cy.get('#errorMessage').should('contain', scenario.message);

        // Clear error for next test
        cy.reload();
      });
    });
  });

  it('should validate required fields comprehensively', () => {
    // Test each required field individually
    const requiredFields = [
      { selector: '#origin', value: '', error: 'Missing Information' },
      { selector: '#destination', value: '', error: 'Missing Information' },
      { selector: '#departureDate', value: '', error: 'Missing Information' }
    ];

    requiredFields.forEach((field) => {
      // Fill other fields
      if (field.selector !== '#origin') cy.get('#origin').type('JFK');
      if (field.selector !== '#destination') cy.get('#destination').type('LAX');
      if (field.selector !== '#departureDate') {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        cy.get('#departureDate').type(futureDate.toISOString().split('T')[0]);
      }

      // Clear the test field
      cy.get(field.selector).clear();

      // Try to submit
      cy.get('#searchBtn').click();

      // Should show error
      cy.get('#error').should('be.visible');
      cy.get('#errorTitle').should('contain', field.error);

      // Clear form for next test
      cy.reload();
    });
  });

  it('should handle edge case dates', () => {
    cy.fixture('test_data.json').then((testData) => {
      testData.edge_case_dates.forEach((dateCase) => {
        cy.get('#origin').type('JFK');
        cy.get('#destination').type('LAX');

        if (dateCase.date >= new Date().toISOString().split('T')[0]) {
          // Future date should work
          cy.get('#departureDate').type(dateCase.date);
          cy.get('#searchBtn').should('not.be.disabled');
        } else {
          // Past date should be prevented by min attribute
          cy.get('#departureDate').should('have.attr', 'min');
          const minDate = cy.get('#departureDate').invoke('attr', 'min');
          expect(minDate).to.equal(new Date().toISOString().split('T')[0]);
        }

        cy.reload();
      });
    });
  });

  it('should save and manage search history', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Mock successful search
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('mockSearch');

      // Perform multiple searches
      const searches = [
        { origin: 'JFK', dest: 'LAX', date: '2025-06-15' },
        { origin: 'JFK', dest: 'CDG', date: '2025-07-20' },
        { origin: 'LAX', dest: 'NRT', date: '2025-08-10' }
      ];

      searches.forEach((search, index) => {
        cy.get('#origin').clear().type(search.origin);
        cy.get('#destination').clear().type(search.dest);
        cy.get('#departureDate').clear().type(search.date);
        cy.get('#searchBtn').click();
        cy.wait('@mockSearch');

        // Check history is updated
        cy.get('#historyList').should('contain', `${search.origin} → ${search.dest}`);

        if (index < searches.length - 1) {
          cy.reload(); // Reset for next search
        }
      });

      // Verify history limit (should keep only last 5)
      cy.get('#historyList').children().should('have.length.at.most', 5);
    });
  });

  it('should load search from history with form population', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      // Create search history items
      const historyItems = [
        {
          key: 'JFK-LAX-2025-06-15',
          origin: 'JFK',
          destination: 'LAX',
          departureDate: '2025-06-15',
          passengers: 2,
          preferredCurrency: 'EUR'
        },
        {
          key: 'JFK-CDG-2025-07-20',
          origin: 'JFK',
          destination: 'CDG',
          departureDate: '2025-07-20',
          passengers: 1,
          preferredCurrency: 'USD'
        }
      ];

      cy.window().then((win) => {
        win.localStorage.setItem('flightSearchHistory', JSON.stringify(historyItems));
      });

      // Reload page to load history
      cy.reload();

      // Test loading first history item
      cy.get('#historyList').contains('JFK → LAX').click();

      // Check if form was filled correctly
      cy.get('#origin').should('have.value', 'JFK');
      cy.get('#destination').should('have.value', 'LAX');
      cy.get('#departureDate').should('have.value', '2025-06-15');
      cy.get('#passengers').should('have.value', '2');
      cy.get('#preferredCurrency').should('have.value', 'EUR');

      // Test loading second history item
      cy.get('#historyList').contains('JFK → CDG').click();

      cy.get('#origin').should('have.value', 'JFK');
      cy.get('#destination').should('have.value', 'CDG');
      cy.get('#departureDate').should('have.value', '2025-07-20');
      cy.get('#passengers').should('have.value', '1');
      cy.get('#preferredCurrency').should('have.value', 'USD');
    });
  });

  it('should handle currency selection and display', () => {
    cy.fixture('test_data.json').then((testData) => {
      cy.fixture('flight_search_responses.json').then((responses) => {
        cy.intercept('GET', '/api/flights/search*', responses.success_response).as('currencySearch');

        // Test each currency
        testData.currencies.forEach((currency) => {
          cy.get('#origin').clear().type('JFK');
          cy.get('#destination').clear().type('CDG');
          cy.get('#departureDate').clear().type('2025-06-15');
          cy.get('#preferredCurrency').select(currency);
          cy.get('#searchBtn').click();
          cy.wait('@currencySearch');

          // Verify preferred currency is highlighted
          cy.get('.result-card.preferred').should('contain', currency);

          cy.reload();
        });
      });
    });
  });

  it('should display detailed flight information', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.success_response).as('detailedSearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('CDG');
      cy.get('#departureDate').type('2025-06-15');
      cy.get('#searchBtn').click();
      cy.wait('@detailedSearch');

      // Check detailed flight information is displayed
      responses.success_response.all_results.forEach((result) => {
        if (result.parsed_offer) {
          const flight = result.parsed_offer.flight_info;
          if (flight.airline) {
            cy.contains(flight.airline).should('be.visible');
          }
          if (flight.flight_number) {
            cy.contains(flight.flight_number).should('be.visible');
          }
        }
      });

      // Check baggage information
      cy.contains('Cabin:').should('be.visible');

      // Check seat availability
      cy.contains('seats available').should('be.visible');
    });
  });

  it('should handle empty search results', () => {
    cy.fixture('flight_search_responses.json').then((responses) => {
      cy.intercept('GET', '/api/flights/search*', responses.empty_response).as('emptySearch');

      cy.get('#origin').type('JFK');
      cy.get('#destination').type('LAX');
      cy.get('#departureDate').type('2025-12-25');
      cy.get('#searchBtn').click();
      cy.wait('@emptySearch');

      // Should show error for no flights found
      cy.get('#error').should('be.visible');
      cy.get('#errorTitle').should('contain', 'No Flights Found');
    });
  });
});