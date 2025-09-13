describe('Basic Frontend Connectivity Test', () => {
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
    cy.request('http://localhost:3001/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'healthy');
    });
  });
});