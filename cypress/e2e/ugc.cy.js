describe('M3.4 UGC System E2E Tests', () => {
  beforeEach(() => {
    cy.mockApiResponses();
    cy.visit('/');
    cy.addTestIds(); // Add data-cy attributes programmatically
  });

  describe('User Authentication', () => {
    it('should allow user to log in and view profile', () => {
      cy.loginAsUser('user');
      cy.get('[data-cy=user-name]').should('contain', 'Cypress');
      cy.get('[data-cy=user-role]').should('contain', 'user');
    });

    it('should allow admin to log in with admin privileges', () => {
      cy.loginAsUser('admin');
      cy.get('[data-cy=user-name]').should('contain', 'Cypress');
      cy.get('[data-cy=user-role]').should('contain', 'admin');
      cy.get('[data-cy=admin-dashboard-link]').should('be.visible');
    });
  });

  describe('Reviews System', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should display existing reviews with ratings', () => {
      cy.get('[data-cy=review-list]').should('be.visible');
      cy.get('[data-cy=review-card]').should('have.length.greaterThan', 0);
      cy.get('[data-cy=rating-stars]').first().should('be.visible');
      cy.get('[data-cy=review-title]').first().should('contain.text');
    });

    it('should create a new review', () => {
      cy.measurePerformance('create-review');
      
      cy.createReview({
        rating: 4,
        title: 'Cypress Test Review',
        content: 'This is a comprehensive test review created by Cypress automation'
      });
      
      cy.get('[data-cy=review-list]')
        .should('contain', 'Cypress Test Review')
        .and('contain', 'This is a comprehensive test review');
        
      cy.measurePerformance('create-review');
    });

    it('should edit an existing review', () => {
      cy.get('[data-cy=review-card]').first().within(() => {
        cy.get('[data-cy=edit-review-btn]').click();
      });
      
      cy.get('[data-cy=review-title]').clear().type('Updated Review Title');
      cy.get('[data-cy=review-content]').clear().type('Updated review content via Cypress');
      cy.get('[data-cy=submit-review]').click();
      
      cy.shouldHaveNotification('success', 'updated successfully');
      cy.get('[data-cy=review-list]').should('contain', 'Updated Review Title');
    });

    it('should vote on reviews (helpful/unhelpful)', () => {
      cy.get('[data-cy=review-card]').first().within(() => {
        cy.get('[data-cy=helpful-btn]').click();
      });
      
      cy.shouldHaveNotification('success', 'vote recorded');
      
      cy.get('[data-cy=review-card]').first().within(() => {
        cy.get('[data-cy=helpful-count]').should('contain', '13'); // 12 + 1
      });
    });

    it('should delete a review', () => {
      cy.get('[data-cy=review-card]').first().within(() => {
        cy.get('[data-cy=delete-review-btn]').click();
      });
      
      cy.get('[data-cy=confirm-delete]').click();
      cy.shouldHaveNotification('success', 'deleted successfully');
    });

    it('should handle review validation errors', () => {
      cy.get('[data-cy=write-review-btn]').click();
      cy.get('[data-cy=submit-review]').click();
      
      cy.get('[data-cy=rating-error]').should('contain', 'Please select a rating');
      cy.get('[data-cy=title-error]').should('contain', 'Title is required');
      cy.get('[data-cy=content-error]').should('contain', 'Review content is required');
    });

    it('should respect character limits', () => {
      const longTitle = 'a'.repeat(101);
      const longContent = 'b'.repeat(2001);
      
      cy.get('[data-cy=write-review-btn]').click();
      cy.get('[data-cy=review-title]').type(longTitle);
      cy.get('[data-cy=review-content]').type(longContent);
      
      cy.get('[data-cy=title-char-count]').should('contain', '101/100');
      cy.get('[data-cy=content-char-count]').should('contain', '2001/2000');
      cy.get('[data-cy=submit-review]').should('be.disabled');
    });
  });

  describe('Comments System', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should display comments in threaded structure', () => {
      cy.get('[data-cy=comment-thread]').should('be.visible');
      cy.get('[data-cy=comment-card]').should('have.length.greaterThan', 0);
      cy.get('[data-cy=comment-replies]').first().should('exist');
    });

    it('should post a top-level comment', () => {
      cy.createComment('This is a test comment from Cypress E2E automation');
      
      cy.get('[data-cy=comment-thread]')
        .should('contain', 'This is a test comment from Cypress E2E automation');
    });

    it('should reply to a comment', () => {
      cy.get('[data-cy=comment-card]').first().within(() => {
        cy.get('[data-cy=reply-btn]').click();
      });
      
      cy.get('[data-cy=reply-textarea]').type('This is a reply to the comment');
      cy.get('[data-cy=submit-reply]').click();
      
      cy.shouldHaveNotification('success', 'Reply posted');
      cy.get('[data-cy=comment-replies]').first()
        .should('contain', 'This is a reply to the comment');
    });

    it('should expand/collapse comment threads', () => {
      cy.get('[data-cy=toggle-replies]').first().click();
      cy.get('[data-cy=comment-replies]').first().should('not.be.visible');
      
      cy.get('[data-cy=toggle-replies]').first().click();
      cy.get('[data-cy=comment-replies]').first().should('be.visible');
    });

    it('should edit a comment', () => {
      cy.get('[data-cy=comment-card]').first().within(() => {
        cy.get('[data-cy=edit-comment-btn]').click();
      });
      
      cy.get('[data-cy=edit-comment-textarea]')
        .clear()
        .type('Edited comment content via Cypress');
        
      cy.get('[data-cy=save-edit]').click();
      
      cy.shouldHaveNotification('success', 'Comment updated');
      cy.get('[data-cy=comment-card]').first()
        .should('contain', 'Edited comment content via Cypress');
    });

    it('should delete a comment', () => {
      cy.get('[data-cy=comment-card]').first().within(() => {
        cy.get('[data-cy=delete-comment-btn]').click();
      });
      
      cy.get('[data-cy=confirm-delete-comment]').click();
      cy.shouldHaveNotification('success', 'Comment deleted');
    });

    it('should handle comment validation', () => {
      cy.get('[data-cy=comment-textarea]').click();
      cy.get('[data-cy=submit-comment]').click();
      
      cy.get('[data-cy=comment-error]').should('contain', 'Comment cannot be empty');
    });
  });

  describe('Reporting System', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should report inappropriate content', () => {
      cy.reportContent('inappropriate');
      cy.shouldHaveNotification('success', 'Report submitted');
    });

    it('should report spam content', () => {
      cy.get('[data-cy=report-btn]').first().click();
      cy.get('[data-cy=report-reason-spam]').click();
      cy.get('[data-cy=report-description]').type('This content appears to be spam');
      cy.get('[data-cy=submit-report]').click();
      
      cy.shouldHaveNotification('success', 'Report submitted');
    });

    it('should validate report form', () => {
      cy.get('[data-cy=report-btn]').first().click();
      cy.get('[data-cy=submit-report]').click();
      
      cy.get('[data-cy=report-reason-error]').should('contain', 'Please select a reason');
      cy.get('[data-cy=report-description-error]').should('contain', 'Please provide details');
    });

    it('should prevent duplicate reports', () => {
      cy.reportContent('inappropriate');
      
      // Try to report the same content again
      cy.get('[data-cy=report-btn]').first().click();
      cy.get('[data-cy=already-reported-message]')
        .should('contain', 'You have already reported this content');
    });
  });

  describe('Admin Moderation Dashboard', () => {
    beforeEach(() => {
      cy.loginAsUser('admin');
    });

    it('should display moderation dashboard with statistics', () => {
      cy.get('[data-cy=admin-dashboard-link]').click();
      
      cy.get('[data-cy=moderation-dashboard]').should('be.visible');
      cy.get('[data-cy=report-stats]').should('be.visible');
      cy.get('[data-cy=pending-reports]').should('contain', '5');
      cy.get('[data-cy=total-reports]').should('contain', '20');
    });

    it('should filter reports by status', () => {
      cy.get('[data-cy=admin-dashboard-link]').click();
      
      cy.get('[data-cy=filter-pending]').click();
      cy.get('[data-cy=report-card][data-status=pending]').should('be.visible');
      cy.get('[data-cy=report-card][data-status=dismissed]').should('not.exist');
      
      cy.get('[data-cy=filter-all]').click();
      cy.get('[data-cy=report-card]').should('have.length.greaterThan', 1);
    });

    it('should review and dismiss a report', () => {
      cy.get('[data-cy=admin-dashboard-link]').click();
      
      cy.get('[data-cy=report-card]').first().within(() => {
        cy.get('[data-cy=dismiss-report]').click();
      });
      
      cy.get('[data-cy=dismiss-reason]').select('No violation found');
      cy.get('[data-cy=confirm-dismiss]').click();
      
      cy.shouldHaveNotification('success', 'Report dismissed');
    });

    it('should take action on reported content', () => {
      cy.get('[data-cy=admin-dashboard-link]').click();
      
      cy.get('[data-cy=report-card]').first().within(() => {
        cy.get('[data-cy=take-action]').click();
      });
      
      cy.get('[data-cy=action-type]').select('Remove content');
      cy.get('[data-cy=action-note]').type('Content violates community guidelines');
      cy.get('[data-cy=confirm-action]').click();
      
      cy.shouldHaveNotification('success', 'Action taken successfully');
    });

    it('should bulk process reports', () => {
      cy.get('[data-cy=admin-dashboard-link]').click();
      
      cy.get('[data-cy=report-card]').first().within(() => {
        cy.get('[data-cy=select-report]').check();
      });
      
      cy.get('[data-cy=report-card]').eq(1).within(() => {
        cy.get('[data-cy=select-report]').check();
      });
      
      cy.get('[data-cy=bulk-dismiss]').click();
      cy.get('[data-cy=confirm-bulk-action]').click();
      
      cy.shouldHaveNotification('success', '2 reports dismissed');
    });
  });

  describe('Notifications System', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
      cy.clearNotifications();
    });

    it('should show success notifications for user actions', () => {
      cy.createReview({
        rating: 5,
        title: 'Notification Test Review',
        content: 'Testing notification system'
      });
      
      cy.get('[data-cy=notification][data-type=success]')
        .should('be.visible')
        .and('contain', 'Review created successfully');
    });

    it('should show error notifications for failed actions', () => {
      cy.intercept('POST', '/reviews', { statusCode: 500 }).as('failedReview');
      
      cy.get('[data-cy=write-review-btn]').click();
      cy.get('[data-cy=rating-stars] .rating-star--interactive').eq(4).click();
      cy.get('[data-cy=review-title]').type('Test Review');
      cy.get('[data-cy=review-content]').type('Test content');
      cy.get('[data-cy=submit-review]').click();
      
      cy.get('[data-cy=notification][data-type=error]')
        .should('be.visible')
        .and('contain', 'Failed to create review');
    });

    it('should auto-dismiss notifications after timeout', () => {
      cy.createComment('Test comment for notification timeout');
      
      cy.get('[data-cy=notification]').should('be.visible');
      cy.wait(5000);
      cy.get('[data-cy=notification]').should('not.exist');
    });

    it('should allow manual notification dismissal', () => {
      cy.createComment('Test comment for manual dismissal');
      
      cy.get('[data-cy=notification]').should('be.visible');
      cy.get('[data-cy=close-notification]').click();
      cy.get('[data-cy=notification]').should('not.exist');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should pass accessibility audit', () => {
      cy.testAccessibility();
    });

    it('should support keyboard navigation', () => {
      cy.testKeyboardNavigation('[data-cy=write-review-btn]');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-cy=rating-stars]').should('have.attr', 'role', 'group');
      cy.get('[data-cy=rating-stars]').should('have.attr', 'aria-label');
      
      cy.get('[data-cy=review-form]').should('have.attr', 'role', 'form');
      cy.get('[data-cy=comment-thread]').should('have.attr', 'role', 'list');
    });

    it('should support screen reader announcements', () => {
      cy.get('[data-cy=write-review-btn]').click();
      cy.get('[data-cy=rating-stars] .rating-star--interactive').eq(3).click();
      
      cy.get('[aria-live=polite]').should('contain', '4 stars selected');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.testResponsive((viewport) => {
        cy.loginAsUser('user');
        
        if (viewport.name === 'mobile') {
          cy.get('[data-cy=mobile-menu-toggle]').should('be.visible');
          cy.get('[data-cy=desktop-navigation]').should('not.be.visible');
        }
        
        cy.get('[data-cy=review-list]').should('be.visible');
        cy.get('[data-cy=comment-thread]').should('be.visible');
      });
    });

    it('should handle touch gestures on mobile', () => {
      cy.viewport(375, 667);
      cy.loginAsUser('user');
      
      cy.swipe('left', '[data-cy=review-card]');
      cy.get('[data-cy=review-actions]').should('be.visible');
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should load reviews within performance threshold', () => {
      cy.measurePerformance('load-reviews');
      cy.get('[data-cy=review-list]').should('be.visible');
      cy.measurePerformance('load-reviews');
    });

    it('should handle large comment threads efficiently', () => {
      cy.measurePerformance('load-comments');
      cy.get('[data-cy=comment-thread]').should('be.visible');
      cy.get('[data-cy=load-more-comments]').click();
      cy.measurePerformance('load-comments');
    });

    it('should optimize images and assets', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'loading', 'lazy');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.loginAsUser('user');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/reviews/deal/*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/');
      cy.get('[data-cy=error-message]')
        .should('be.visible')
        .and('contain', 'Unable to load reviews');
        
      cy.get('[data-cy=retry-btn]').should('be.visible');
    });

    it('should handle API errors with proper messaging', () => {
      cy.intercept('POST', '/reviews', { 
        statusCode: 400, 
        body: { error: 'Invalid review data' } 
      }).as('apiError');
      
      cy.createReview({
        rating: 5,
        title: 'Test',
        content: 'Test content'
      });
      
      cy.get('[data-cy=notification][data-type=error]')
        .should('contain', 'Invalid review data');
    });

    it('should handle authentication errors', () => {
      cy.intercept('POST', '/reviews', { statusCode: 401 }).as('authError');
      
      cy.createReview({
        rating: 5,
        title: 'Test',
        content: 'Test content'
      });
      
      cy.get('[data-cy=login-prompt]').should('be.visible');
    });
  });

  describe('Data Persistence', () => {
    it('should persist review data across page reloads', () => {
      cy.loginAsUser('user');
      cy.createReview({
        rating: 5,
        title: 'Persistence Test Review',
        content: 'This review should persist across reloads'
      });
      
      cy.reload();
      cy.get('[data-cy=review-list]')
        .should('contain', 'Persistence Test Review');
    });

    it('should maintain user session across browser tabs', () => {
      cy.loginAsUser('user');
      
      cy.window().then((win) => {
        win.open('/', '_blank');
      });
      
      cy.switchToLastTab();
      cy.get('[data-cy=user-name]').should('contain', 'Cypress');
    });
  });
});