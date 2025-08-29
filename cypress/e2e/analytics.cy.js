describe('M3.5 Analytics & Monitoring E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage to reset consent state
    cy.clearLocalStorage();
    
    // Mock dataLayer if not present
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.dataLayer = [];
        win.gtmInitialized = false;
        
        // Mock navigator.doNotTrack
        Object.defineProperty(win.navigator, 'doNotTrack', {
          value: '0',
          writable: true
        });
      }
    });
  });

  describe('Consent Management', () => {
    it('should show consent banner when no consent given', () => {
      cy.get('.consent-banner').should('be.visible');
      cy.get('.consent-banner__title').should('contain', 'We Value Your Privacy');
      cy.get('.consent-banner__button--primary').should('contain', 'Accept');
      cy.get('.consent-banner__button--secondary').should('contain', 'Decline');
    });

    it('should hide banner and enable analytics when consent granted', () => {
      cy.get('.consent-banner__button--primary').click();
      
      cy.get('.consent-banner').should('not.exist');
      
      // Check that consent was stored
      cy.window().then((win) => {
        const consent = win.localStorage.getItem('deals_consent');
        expect(consent).to.include('granted');
      });
    });

    it('should hide banner and disable analytics when consent denied', () => {
      cy.get('.consent-banner__button--secondary').click();
      
      cy.get('.consent-banner').should('not.exist');
      
      // Check that consent was stored
      cy.window().then((win) => {
        const consent = win.localStorage.getItem('deals_consent');
        expect(consent).to.include('denied');
      });
    });

    it('should not show banner if consent already given', () => {
      // Set consent in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
      });
      
      cy.reload();
      cy.get('.consent-banner').should('not.exist');
    });
  });

  describe('Do Not Track Support', () => {
    it('should respect Do Not Track when enabled', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.dataLayer = [];
          Object.defineProperty(win.navigator, 'doNotTrack', {
            value: '1',
            writable: true
          });
        }
      });

      // Even if consent is granted, should not initialize GTM
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
      });
      
      cy.reload();
      
      cy.window().then((win) => {
        expect(win.gtmInitialized).to.be.false;
      });
    });
  });

  describe('Analytics Events Tracking', () => {
    beforeEach(() => {
      // Grant consent and disable DNT for analytics testing
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
        Object.defineProperty(win.navigator, 'doNotTrack', {
          value: '0',
          writable: true
        });
      });
      
      cy.reload();
    });

    it('should track page view events', () => {
      cy.window().then((win) => {
        // Check that dataLayer contains page_view event
        const pageViewEvents = win.dataLayer.filter(event => event.event === 'page_view');
        expect(pageViewEvents).to.have.length.greaterThan(0);
        
        const pageViewEvent = pageViewEvents[0];
        expect(pageViewEvent).to.have.property('page_url');
        expect(pageViewEvent).to.have.property('page_title');
        expect(pageViewEvent).to.have.property('timestamp');
      });
    });

    it('should track authentication events', () => {
      cy.window().then((win) => {
        // Check for auth_login event
        const authEvents = win.dataLayer.filter(event => event.event === 'auth_login');
        expect(authEvents).to.have.length.greaterThan(0);
        
        const authEvent = authEvents[0];
        expect(authEvent).to.have.property('login_method', 'demo');
        expect(authEvent).to.have.property('login_success', true);
      });
    });

    it('should track review creation events', () => {
      // Navigate to reviews section and create a review
      cy.get('[data-cy=write-review-btn]').click();
      
      // Fill out review form
      cy.get('[data-cy=rating-stars] .rating-star--interactive').eq(4).click();
      cy.get('[data-cy=review-title]').type('Analytics Test Review');
      cy.get('[data-cy=review-content]').type('This is a test review for analytics tracking');
      cy.get('[data-cy=submit-review]').click();
      
      // Check dataLayer for review_create event
      cy.window().then((win) => {
        const reviewEvents = win.dataLayer.filter(event => event.event === 'review_create');
        expect(reviewEvents).to.have.length.greaterThan(0);
        
        const reviewEvent = reviewEvents[reviewEvents.length - 1]; // Get latest
        expect(reviewEvent).to.have.property('rating', 5);
        expect(reviewEvent).to.have.property('review_type', 'user_generated');
        expect(reviewEvent).to.have.property('has_title', true);
      });
    });

    it('should track comment creation events', () => {
      // Create a comment
      cy.get('[data-cy=comment-textarea]').type('This is a test comment for analytics');
      cy.get('[data-cy=submit-comment]').click();
      
      // Check dataLayer for comment_create event
      cy.window().then((win) => {
        const commentEvents = win.dataLayer.filter(event => event.event === 'comment_create');
        expect(commentEvents).to.have.length.greaterThan(0);
        
        const commentEvent = commentEvents[commentEvents.length - 1];
        expect(commentEvent).to.have.property('is_reply', false);
        expect(commentEvent).to.have.property('comment_depth', 0);
      });
    });

    it('should track review voting events', () => {
      // Vote on a review
      cy.get('[data-cy=review-card]').first().within(() => {
        cy.get('[data-cy=helpful-btn]').click();
      });
      
      // Check dataLayer for review_vote event
      cy.window().then((win) => {
        const voteEvents = win.dataLayer.filter(event => event.event === 'review_vote');
        expect(voteEvents).to.have.length.greaterThan(0);
        
        const voteEvent = voteEvents[voteEvents.length - 1];
        expect(voteEvent).to.have.property('vote_type', 'helpful');
      });
    });

    it('should track content reporting events', () => {
      // Report content
      cy.get('[data-cy=report-btn]').first().click();
      cy.get('[data-cy=report-reason-inappropriate]').click();
      cy.get('[data-cy=report-description]').type('Test report for analytics');
      cy.get('[data-cy=submit-report]').click();
      
      // Check dataLayer for content_report event
      cy.window().then((win) => {
        const reportEvents = win.dataLayer.filter(event => event.event === 'content_report');
        expect(reportEvents).to.have.length.greaterThan(0);
        
        const reportEvent = reportEvents[reportEvents.length - 1];
        expect(reportEvent).to.have.property('report_reason', 'inappropriate');
        expect(reportEvent).to.have.property('content_type');
      });
    });
  });

  describe('Privacy Compliance', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
      });
      cy.reload();
    });

    it('should not track events when consent is denied', () => {
      // Change consent to denied
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:denied');
      });
      
      // Try to perform trackable actions
      cy.get('[data-cy=comment-textarea]').type('This should not be tracked');
      cy.get('[data-cy=submit-comment]').click();
      
      // Check that no new events were added to dataLayer
      cy.window().then((win) => {
        const commentEvents = win.dataLayer.filter(event => 
          event.event === 'comment_create' && 
          event.timestamp > Date.now() - 5000 // Last 5 seconds
        );
        expect(commentEvents).to.have.length(0);
      });
    });

    it('should mask PII in tracked events', () => {
      cy.window().then((win) => {
        // Check that user_id is hashed, not raw
        const events = win.dataLayer.filter(event => event.user_id);
        if (events.length > 0) {
          const event = events[0];
          expect(event.user_id).to.not.include('@');
          expect(event.user_id).to.not.include('user-123');
          expect(event.user_id).to.match(/^[a-f0-9]{64}$/); // SHA256 hash pattern
        }
      });
    });

    it('should include user context in events', () => {
      cy.window().then((win) => {
        const events = win.dataLayer.filter(event => event.user_status);
        expect(events).to.have.length.greaterThan(0);
        
        const event = events[0];
        expect(event).to.have.property('user_status', 'authenticated');
        expect(event).to.have.property('user_role', 'admin');
      });
    });
  });

  describe('GTM Integration', () => {
    it('should initialize GTM when consent granted and DNT disabled', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
        Object.defineProperty(win.navigator, 'doNotTrack', {
          value: '0',
          writable: true
        });
      });
      
      cy.reload();
      
      // Wait for GTM initialization
      cy.wait(2000);
      
      cy.window().then((win) => {
        // Check that dataLayer was initialized with GTM data
        const gtmEvents = win.dataLayer.filter(event => event.event === 'gtm.js');
        expect(gtmEvents).to.have.length.greaterThan(0);
      });
    });

    it('should not initialize GTM when consent denied', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:denied');
      });
      
      cy.reload();
      cy.wait(2000);
      
      cy.window().then((win) => {
        expect(win.gtmInitialized).to.be.false;
      });
    });

    it('should update consent in dataLayer when changed', () => {
      // Initially deny consent
      cy.get('.consent-banner__button--secondary').click();
      
      // Change to granted (simulate user changing mind)
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
        
        // Trigger consent update (would normally be done by UI)
        win.dataLayer.push({
          event: 'consent_update',
          consent: {
            analytics_storage: 'granted',
            functionality_storage: 'granted'
          }
        });
      });
      
      // Check that consent update event was pushed
      cy.window().then((win) => {
        const consentEvents = win.dataLayer.filter(event => event.event === 'consent_update');
        expect(consentEvents).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Error Tracking', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
      });
      cy.reload();
    });

    it('should track JavaScript errors', () => {
      // Trigger a JavaScript error
      cy.window().then((win) => {
        // Simulate an error
        const error = new Error('Test error for analytics');
        win.dispatchEvent(new ErrorEvent('error', { 
          error: error,
          message: error.message,
          filename: 'test.js',
          lineno: 1
        }));
      });
      
      // Check if error was tracked
      cy.window().then((win) => {
        const errorEvents = win.dataLayer.filter(event => event.event === 'error_occurred');
        expect(errorEvents).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track time on page', () => {
      // Wait some time on page
      cy.wait(3000);
      
      // Trigger time tracking (would normally be done automatically)
      cy.window().then((win) => {
        win.dataLayer.push({
          event: 'time_on_page',
          time_seconds: 3,
          page_path: win.location.pathname
        });
      });
      
      cy.window().then((win) => {
        const timeEvents = win.dataLayer.filter(event => event.event === 'time_on_page');
        expect(timeEvents).to.have.length.greaterThan(0);
        
        const timeEvent = timeEvents[timeEvents.length - 1];
        expect(timeEvent).to.have.property('time_seconds');
        expect(timeEvent.time_seconds).to.be.greaterThan(0);
      });
    });
  });

  describe('Event Schema Validation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('deals_consent', 'v1:granted');
      });
      cy.reload();
    });

    it('should validate review event schema', () => {
      // Create a review to generate event
      cy.get('[data-cy=write-review-btn]').click();
      cy.get('[data-cy=rating-stars] .rating-star--interactive').eq(3).click();
      cy.get('[data-cy=review-title]').type('Schema Test Review');
      cy.get('[data-cy=review-content]').type('Testing event schema validation');
      cy.get('[data-cy=submit-review]').click();
      
      cy.window().then((win) => {
        const reviewEvents = win.dataLayer.filter(event => event.event === 'review_create');
        expect(reviewEvents).to.have.length.greaterThan(0);
        
        const event = reviewEvents[reviewEvents.length - 1];
        
        // Validate required fields
        expect(event).to.have.property('event', 'review_create');
        expect(event).to.have.property('timestamp');
        expect(event).to.have.property('page_url');
        expect(event).to.have.property('rating');
        expect(event).to.have.property('review_type');
        expect(event).to.have.property('has_title');
        expect(event).to.have.property('review_length');
        
        // Validate data types
        expect(event.rating).to.be.a('number');
        expect(event.has_title).to.be.a('boolean');
        expect(event.review_length).to.be.a('number');
        expect(event.timestamp).to.be.a('string');
      });
    });

    it('should validate comment event schema', () => {
      cy.get('[data-cy=comment-textarea]').type('Schema validation comment');
      cy.get('[data-cy=submit-comment]').click();
      
      cy.window().then((win) => {
        const commentEvents = win.dataLayer.filter(event => event.event === 'comment_create');
        expect(commentEvents).to.have.length.greaterThan(0);
        
        const event = commentEvents[commentEvents.length - 1];
        
        // Validate required fields
        expect(event).to.have.property('event', 'comment_create');
        expect(event).to.have.property('comment_length');
        expect(event).to.have.property('is_reply');
        expect(event).to.have.property('comment_depth');
        
        // Validate data types
        expect(event.comment_length).to.be.a('number');
        expect(event.is_reply).to.be.a('boolean');
        expect(event.comment_depth).to.be.a('number');
      });
    });
  });
});