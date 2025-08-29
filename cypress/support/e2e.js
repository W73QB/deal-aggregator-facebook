// Cypress E2E support file
import './commands';

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global configuration
// Note: experimentalStudio is read-only and cannot be overridden
// Cypress.config({
//   includeShadowDom: true
// });

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions in development
  if (Cypress.env('environment') === 'development') {
    console.warn('Uncaught exception:', err);
    return false;
  }
  return true;
});

// Custom commands for UGC testing
Cypress.Commands.add('loginAsUser', (userType = 'user') => {
  const user = userType === 'admin' ? Cypress.env('adminUser') : Cypress.env('testUser');
  
  cy.visit('/');
  cy.get('[data-cy=login-btn]', { timeout: 10000 }).should('be.visible');
  
  // Mock authentication for demo
  cy.window().then((win) => {
    const mockUser = {
      id: userType === 'admin' ? 'admin-123' : 'user-123',
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      role: userType
    };
    
    win.store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: mockUser,
        token: `mock-token-${userType}`
      }
    });
  });
  
  cy.get('[data-cy=user-name]').should('contain', user.firstName);
});

Cypress.Commands.add('createReview', (reviewData) => {
  const defaultReview = {
    rating: 5,
    title: 'Great deal!',
    content: 'This is an excellent deal. Highly recommended!',
    ...reviewData
  };
  
  cy.get('[data-cy=write-review-btn]').click();
  
  // Fill rating
  cy.get('[data-cy=rating-stars] .rating-star--interactive').eq(defaultReview.rating - 1).click();
  
  // Fill title
  cy.get('[data-cy=review-title]').type(defaultReview.title);
  
  // Fill content
  cy.get('[data-cy=review-content]').type(defaultReview.content);
  
  // Submit
  cy.get('[data-cy=submit-review]').click();
  
  // Wait for success notification
  cy.get('[data-cy=notification]').should('contain', 'successfully');
});

Cypress.Commands.add('createComment', (content) => {
  const commentText = content || 'This is a test comment from Cypress';
  
  cy.get('[data-cy=comment-textarea]').click().type(commentText);
  cy.get('[data-cy=submit-comment]').click();
  
  // Wait for success notification
  cy.get('[data-cy=notification]').should('contain', 'successfully');
});

Cypress.Commands.add('reportContent', (reason = 'inappropriate') => {
  cy.get('[data-cy=report-btn]').first().click();
  
  // Select reason
  cy.get(`[data-cy=report-reason-${reason}]`).click();
  
  // Add description
  cy.get('[data-cy=report-description]').type('This content violates community guidelines');
  
  // Submit report
  cy.get('[data-cy=submit-report]').click();
  
  // Wait for success notification
  cy.get('[data-cy=notification]').should('contain', 'Report submitted');
});

// Accessibility testing helper
Cypress.Commands.add('checkA11y', (selector) => {
  cy.injectAxe();
  if (selector) {
    cy.checkA11y(selector);
  } else {
    cy.checkA11y();
  }
});

// Wait for API response
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Custom assertions
Cypress.Commands.add('shouldHaveNotification', (type, message) => {
  cy.get(`[data-cy=notification][data-type=${type}]`)
    .should('be.visible')
    .and('contain', message);
});

// Helper for responsive testing
Cypress.Commands.add('testResponsive', (callback) => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
    callback(viewport);
  });
});