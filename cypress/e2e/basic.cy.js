describe('Basic Frontend Connectivity Test', () => {
  beforeEach(() => {
    // Mock auth API to prevent 401 errors during basic connectivity testing
    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 401,
      body: { success: false, message: 'Not authenticated' }
    }).as('authCheck');
  });

  it('should load the frontend successfully', () => {
    cy.visit('/');
    cy.get('#root').should('exist');
    cy.title().should('contain', 'DealRadarUS');
  });

  it('should have window.store available for testing', () => {
    cy.visit('/');
    cy.window().its('store').should('exist');
  });

  it('should be able to make API calls to the backend', () => {
    // Note: This test calls the backend directly, bypassing the proxy,
    // because the E2E test launcher runs two separate servers without a unified proxy.
    cy.request('http://localhost:5000/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'healthy');
    });
  });
});