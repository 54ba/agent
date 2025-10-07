describe('Flight Price Comparison App', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
  });

  it('should load the main page correctly', () => {
    cy.contains('✈️ Flight Price Comparison').should('be.visible');
    cy.contains('Find the best airfare deals across multiple currencies').should('be.visible');

    // Check form elements
    cy.get('#origin').should('be.visible');
    cy.get('#destination').should('be.visible');
    cy.get('#departureDate').should('be.visible');
    cy.get('#passengers').should('be.visible');
    cy.get('#preferredCurrency').should('be.visible');
    cy.get('#searchBtn').should('be.visible').and('contain', 'Compare Prices');
  });

  it('should validate airport codes', () => {
    // Test invalid airport code
    cy.get('#origin').type('INVALID');
    cy.get('#origin').should('have.value', 'INVALID');

    // Test valid airport code (should be uppercase)
    cy.get('#origin').clear().type('jfk');
    cy.get('#origin').should('have.value', 'JFK');
  });

  it('should show AI search section', () => {
    cy.contains('Ask AI to Plan Your Trip').should('be.visible');
    cy.get('#naturalLanguageQuery').should('be.visible');
    cy.get('#aiSearchBtn').should('be.visible').and('contain', 'Ask AI');

    // Check quick action buttons
    cy.contains('NYC → LON').should('be.visible');
    cy.contains('Paris Trip').should('be.visible');
    cy.contains('Tokyo Deal').should('be.visible');
  });

  it('should fill example queries', () => {
    // Click on NYC → LON button
    cy.contains('NYC → LON').click();
    cy.get('#naturalLanguageQuery').should('have.value', 'Find cheap flights from New York to London next month');
  });

  it('should perform flight search', () => {
    // Intercept the API call
    cy.intercept('GET', '/api/flights/search*').as('flightSearch');

    // Fill out the form
    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#passengers').select('2');
    cy.get('#preferredCurrency').select('USD');

    // Submit the form
    cy.get('#searchBtn').click();

    // Wait for loading state
    cy.get('#loading').should('be.visible');
    cy.contains('Searching for the best deals...').should('be.visible');

    // Wait for API response
    cy.wait('@flightSearch').then((interception) => {
      expect(interception.request.url).to.include('origin=JFK');
      expect(interception.request.url).to.include('destination=LAX');
      expect(interception.request.url).to.include('departure_date=2025-12-25');
      expect(interception.request.url).to.include('adults=2');
    });
  });

  it('should handle flight search errors', () => {
    // Intercept and mock error response
    cy.intercept('GET', '/api/flights/search*', { statusCode: 500 }).as('flightSearchError');

    // Fill and submit form
    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@flightSearchError');

    // Check error display
    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'Search Failed');
  });

  it('should validate required fields', () => {
    // Try to submit without filling required fields
    cy.get('#searchBtn').click();

    // Should show error
    cy.get('#error').should('be.visible');
    cy.get('#errorTitle').should('contain', 'Missing Information');
  });

  it('should save search history', () => {
    // Mock successful search
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
    }).as('mockSearch');

    // Perform search
    cy.get('#origin').type('JFK');
    cy.get('#destination').type('LAX');
    cy.get('#departureDate').type('2025-12-25');
    cy.get('#searchBtn').click();

    cy.wait('@mockSearch');

    // Check if search was saved to history
    cy.get('#historyList').should('contain', 'JFK → LAX');
  });

  it('should load search from history', () => {
    // First create a search history item
    cy.window().then((win) => {
      win.localStorage.setItem('flightSearchHistory', JSON.stringify([{
        key: 'JFK-LAX-2025-12-25',
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-25',
        passengers: 1,
        preferredCurrency: 'USD'
      }]));
    });

    // Reload page
    cy.reload();

    // Click on history item
    cy.contains('JFK → LAX').click();

    // Check if form was filled
    cy.get('#origin').should('have.value', 'JFK');
    cy.get('#destination').should('have.value', 'LAX');
    cy.get('#departureDate').should('have.value', '2025-12-25');
  });
});