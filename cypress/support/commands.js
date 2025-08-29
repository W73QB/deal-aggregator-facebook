// Custom Cypress commands for UGC testing

// Command to simulate user authentication
Cypress.Commands.add('authenticateUser', (role = 'user') => {
  cy.window().its('store').then((store) => {
    const mockUser = {
      id: `${role}-${Date.now()}`,
      first_name: 'Test',
      last_name: 'User',
      email: `test-${role}@dealradarus.com`,
      role: role
    };
    
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: mockUser,
        token: `mock-jwt-${Date.now()}`
      }
    });
  });
});

// Command to intercept API calls
Cypress.Commands.add('mockApiResponses', () => {
  // Mock reviews API
  cy.intercept('GET', '/reviews/deal/*', {
    fixture: 'reviews.json'
  }).as('getReviews');
  
  cy.intercept('POST', '/reviews', {
    statusCode: 201,
    body: {
      success: true,
      message: 'Review created successfully',
      review: {
        id: 'mock-review-id',
        rating: 5,
        title: 'Mock Review',
        content: 'This is a mock review'
      }
    }
  }).as('createReview');
  
  // Mock comments API
  cy.intercept('GET', '/comments/deal/*', {
    fixture: 'comments.json'
  }).as('getComments');
  
  cy.intercept('POST', '/comments/deal/*', {
    statusCode: 201,
    body: {
      success: true,
      message: 'Comment posted successfully',
      comment: {
        id: 'mock-comment-id',
        content: 'Mock comment'
      }
    }
  }).as('createComment');
  
  // Mock reports API
  cy.intercept('POST', '/reports', {
    statusCode: 201,
    body: {
      success: true,
      message: 'Report submitted successfully'
    }
  }).as('createReport');
  
  cy.intercept('GET', '/reports', {
    fixture: 'reports.json'
  }).as('getReports');
  
  cy.intercept('GET', '/reports/stats', {
    body: {
      stats: {
        pending: 5,
        reviewing: 2,
        dismissed: 10,
        action_taken: 3,
        total: 20
      }
    }
  }).as('getReportStats');
});

// Command to create test data
Cypress.Commands.add('seedTestData', () => {
  cy.window().its('store').then((store) => {
    // Add mock reviews to store
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        title: 'Excellent deal!',
        content: 'Great product at amazing price',
        user: { first_name: 'John', last_name: 'Doe' },
        helpful_count: 5,
        total_votes: 6,
        created_at: new Date().toISOString()
      }
    ];
    
    store.dispatch({
      type: 'reviews/fetchReviewsByDeal/fulfilled',
      payload: {
        data: {
          reviews: mockReviews,
          deal_stats: { avg_rating: 4.5, review_count: 1 },
          pagination: { page: 1, total_items: 1, has_next: false }
        }
      }
    });
  });
});

// Command to clear notifications
Cypress.Commands.add('clearNotifications', () => {
  cy.window().its('store').then((store) => {
    store.dispatch({ type: 'notifications/clearAllNotifications' });
  });
});

// Command to wait for loading states
Cypress.Commands.add('waitForLoading', (selector = '[data-cy=loading]') => {
  cy.get(selector, { timeout: 1000 }).should('not.exist');
});

// Command for accessibility testing
Cypress.Commands.add('testAccessibility', (options = {}) => {
  const defaultOptions = {
    includeTags: ['wcag2a', 'wcag2aa'],
    ...options
  };
  
  cy.injectAxe();
  cy.checkA11y(null, defaultOptions);
});

// Command to test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', (startSelector) => {
  cy.get(startSelector).focus();
  
  // Test tab navigation
  for (let i = 0; i < 10; i++) {
    cy.focused().tab();
    cy.focused().should('be.visible');
  }
  
  // Test shift+tab navigation
  for (let i = 0; i < 5; i++) {
    cy.focused().tab({ shift: true });
    cy.focused().should('be.visible');
  }
});

// Command to simulate mobile gestures
Cypress.Commands.add('swipe', (direction, element) => {
  const directions = {
    left: { deltaX: -100, deltaY: 0 },
    right: { deltaX: 100, deltaY: 0 },
    up: { deltaX: 0, deltaY: -100 },
    down: { deltaX: 0, deltaY: 100 }
  };
  
  const delta = directions[direction];
  
  cy.get(element)
    .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    .trigger('touchmove', { 
      touches: [{ 
        clientX: 100 + delta.deltaX, 
        clientY: 100 + delta.deltaY 
      }] 
    })
    .trigger('touchend');
});

// Command for performance testing
Cypress.Commands.add('measurePerformance', (label) => {
  cy.window().then((win) => {
    win.performance.mark(`${label}-start`);
  });
  
  return cy.then(() => {
    cy.window().then((win) => {
      win.performance.mark(`${label}-end`);
      win.performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = win.performance.getEntriesByName(label)[0];
      cy.log(`Performance: ${label} took ${measure.duration.toFixed(2)}ms`);
      
      // Fail if performance is too slow
      expect(measure.duration).to.be.lessThan(5000); // 5 second max
    });
  });
});

// Add data-cy attributes programmatically for testing
Cypress.Commands.add('addTestIds', () => {
  cy.window().then((win) => {
    const addTestId = (element, id) => {
      if (!element.getAttribute('data-cy')) {
        element.setAttribute('data-cy', id);
      }
    };
    
    // Add common test IDs
    const selectors = {
      'button:contains("Write a Review")': 'write-review-btn',
      'button:contains("Post Review")': 'submit-review',
      'button:contains("Post Comment")': 'submit-comment',
      'button:contains("Report")': 'report-btn',
      'input[placeholder*="title"]': 'review-title',
      'textarea[placeholder*="review"]': 'review-content',
      'textarea[placeholder*="comment"]': 'comment-textarea',
      '.rating-stars': 'rating-stars',
      '.notification-toast': 'notification'
    };
    
    Object.entries(selectors).forEach(([selector, testId]) => {
      const elements = win.document.querySelectorAll(selector);
      elements.forEach(el => addTestId(el, testId));
    });
  });
});