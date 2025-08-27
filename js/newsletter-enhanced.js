/**
 * Enhanced Newsletter Form System
 * Features: Validation, UX feedback, accessibility, analytics
 * Version: 1.0.0
 */

(function() {
  'use strict';

  class NewsletterForm {
    constructor(form) {
      this.form = form;
      this.emailInput = form.querySelector('input[type="email"]');
      this.submitButton = form.querySelector('button[type="submit"]');
      this.originalButtonText = this.submitButton.textContent;
      
      // Create or find feedback elements
      this.initializeFeedbackElements();
      
      // Bind events
      this.bindEvents();
      
      // Initialize validation
      this.initializeValidation();
      
      console.log('Newsletter form initialized:', form);
    }

    initializeFeedbackElements() {
      // Create success message if it doesn't exist
      this.successElement = this.form.parentElement.querySelector('.newsletter-success');
      if (!this.successElement) {
        this.successElement = document.createElement('div');
        this.successElement.className = 'newsletter-success';
        this.successElement.setAttribute('role', 'status');
        this.successElement.setAttribute('aria-live', 'polite');
        this.successElement.style.display = 'none';
        this.form.parentElement.appendChild(this.successElement);
      }

      // Create error message element
      this.errorElement = this.form.parentElement.querySelector('.newsletter-error');
      if (!this.errorElement) {
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'newsletter-error';
        this.errorElement.setAttribute('role', 'alert');
        this.errorElement.setAttribute('aria-live', 'assertive');
        this.errorElement.style.display = 'none';
        this.form.parentElement.appendChild(this.errorElement);
      }

      // Create loading indicator
      this.loadingElement = this.form.querySelector('.newsletter-loading');
      if (!this.loadingElement) {
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'newsletter-loading';
        this.loadingElement.innerHTML = '<span class="spinner"></span> Processing...';
        this.loadingElement.setAttribute('aria-hidden', 'true');
        this.loadingElement.style.display = 'none';
        this.submitButton.parentElement.appendChild(this.loadingElement);
      }
    }

    bindEvents() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      this.emailInput.addEventListener('blur', this.validateEmail.bind(this));
      this.emailInput.addEventListener('input', this.clearErrors.bind(this));
      this.emailInput.addEventListener('keypress', this.handleEnterKey.bind(this));
    }

    initializeValidation() {
      // Set up real-time validation
      this.emailInput.setAttribute('aria-describedby', 
        this.emailInput.getAttribute('aria-describedby') + ' newsletter-error');
      
      // Enhanced accessibility
      this.emailInput.setAttribute('autocomplete', 'email');
      this.emailInput.setAttribute('spellcheck', 'false');
    }

    handleSubmit(e) {
      e.preventDefault();
      
      // Clear previous messages
      this.clearMessages();
      
      // Validate form
      if (!this.validateForm()) {
        this.focusFirstError();
        return;
      }

      // Show loading state
      this.setLoadingState(true);
      
      // Simulate newsletter signup (replace with actual API call)
      this.submitNewsletter();
    }

    validateForm() {
      let isValid = true;
      const email = this.emailInput.value.trim();

      // Email validation
      if (!email) {
        this.showError('Email address is required');
        isValid = false;
      } else if (!this.isValidEmail(email)) {
        this.showError('Please enter a valid email address');
        isValid = false;
      } else if (this.isDisposableEmail(email)) {
        this.showError('Please use a non-disposable email address');
        isValid = false;
      }

      return isValid;
    }

    validateEmail() {
      const email = this.emailInput.value.trim();
      if (email && !this.isValidEmail(email)) {
        this.showError('Please enter a valid email address');
        return false;
      } else if (email && this.isDisposableEmail(email)) {
        this.showError('Please use a non-disposable email address');
        return false;
      } else {
        this.clearErrors();
        return true;
      }
    }

    isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(email) && email.length <= 254;
    }

    isDisposableEmail(email) {
      const disposableDomains = [
        'tempmail.org', '10minutemail.com', 'guerrillamail.com', 
        'mailinator.com', 'yopmail.com', 'throwaway.email'
      ];
      const domain = email.split('@')[1];
      return domain && disposableDomains.includes(domain.toLowerCase());
    }

    async submitNewsletter() {
      const email = this.emailInput.value.trim();
      const formData = new FormData();
      formData.append('email', email);
      formData.append('source', this.getFormSource());
      
      try {
        // Track analytics event
        this.trackAnalytics('newsletter_submit_attempt', { email_domain: email.split('@')[1] });

        // Simulate API call (replace with actual endpoint)
        const response = await this.callNewsletterAPI(formData);
        
        if (response.success) {
          this.handleSuccess(response);
        } else {
          this.handleError(response.message || 'Subscription failed. Please try again.');
        }
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        this.handleError('Network error. Please check your connection and try again.');
      } finally {
        this.setLoadingState(false);
      }
    }

    async callNewsletterAPI(formData) {
      // Simulate API call - replace with actual newsletter service integration
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate success 90% of the time
          if (Math.random() > 0.1) {
            resolve({ 
              success: true, 
              message: 'Successfully subscribed! Check your email to confirm.' 
            });
          } else {
            resolve({ 
              success: false, 
              message: 'Email already subscribed or invalid.' 
            });
          }
        }, 1500); // Simulate network delay
      });
    }

    handleSuccess(response) {
      this.emailInput.value = '';
      this.showSuccess(response.message || 'Thanks for subscribing! Check your email to confirm.');
      
      // Track analytics
      this.trackAnalytics('newsletter_submit_success');
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        this.hideSuccess();
      }, 8000);
    }

    handleError(message) {
      this.showError(message);
      this.trackAnalytics('newsletter_submit_error', { error_message: message });
    }

    showSuccess(message) {
      this.successElement.innerHTML = `
        <div class="success-icon">✅</div>
        <div class="success-text">${message}</div>
      `;
      this.successElement.style.display = 'block';
      this.successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showError(message) {
      this.errorElement.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-text">${message}</div>
      `;
      this.errorElement.style.display = 'block';
      this.emailInput.setAttribute('aria-invalid', 'true');
      this.emailInput.classList.add('error');
    }

    clearMessages() {
      this.hideSuccess();
      this.clearErrors();
    }

    hideSuccess() {
      if (this.successElement) {
        this.successElement.style.display = 'none';
      }
    }

    clearErrors() {
      if (this.errorElement) {
        this.errorElement.style.display = 'none';
      }
      this.emailInput.setAttribute('aria-invalid', 'false');
      this.emailInput.classList.remove('error');
    }

    setLoadingState(loading) {
      if (loading) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Subscribing...';
        this.loadingElement.style.display = 'inline-block';
        this.form.classList.add('loading');
      } else {
        this.submitButton.disabled = false;
        this.submitButton.textContent = this.originalButtonText;
        this.loadingElement.style.display = 'none';
        this.form.classList.remove('loading');
      }
    }

    focusFirstError() {
      this.emailInput.focus();
    }

    handleEnterKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit(e);
      }
    }

    getFormSource() {
      const section = this.form.closest('section');
      if (section && section.id) {
        return section.id;
      }
      
      // Determine source from page context
      const pathname = window.location.pathname;
      if (pathname.includes('deals')) return 'deals-page';
      if (pathname.includes('blog')) return 'blog-page';
      if (pathname === '/' || pathname.includes('index')) return 'homepage';
      return 'unknown';
    }

    trackAnalytics(eventName, additionalParams = {}) {
      // Google Analytics 4 tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'newsletter',
          event_label: this.getFormSource(),
          ...additionalParams
        });
      }

      // Facebook Pixel tracking
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Subscribe', {
          content_category: 'newsletter',
          source: this.getFormSource()
        });
      }

      console.log('Newsletter analytics:', eventName, additionalParams);
    }
  }

  // Newsletter Form Manager
  class NewsletterManager {
    constructor() {
      this.forms = [];
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeForms());
      } else {
        this.initializeForms();
      }
    }

    initializeForms() {
      const forms = document.querySelectorAll('.newsletter-form, form[action*="newsletter"]');
      
      forms.forEach((form, index) => {
        // Fix duplicate ID issues
        this.fixDuplicateIds(form, index);
        
        // Initialize enhanced form
        try {
          const newsletterForm = new NewsletterForm(form);
          this.forms.push(newsletterForm);
        } catch (error) {
          console.error('Failed to initialize newsletter form:', error);
        }
      });

      // Add CSS styles if not already present
      this.injectStyles();

      console.log(`Newsletter Manager: Initialized ${this.forms.length} forms`);
    }

    fixDuplicateIds(form, index) {
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput) {
        const baseId = 'newsletter-email';
        const newId = index === 0 ? baseId : `${baseId}-${index}`;
        emailInput.id = newId;
        
        // Update corresponding label if it exists
        const label = form.querySelector(`label[for="${baseId}"]`);
        if (label) {
          label.setAttribute('for', newId);
        }
      }
    }

    injectStyles() {
      if (document.getElementById('newsletter-enhanced-styles')) {
        return; // Styles already injected
      }

      const styles = `
        /* Newsletter Enhanced Styles */
        .newsletter-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 12px 16px;
          border-radius: 4px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.3s ease-out;
        }

        .newsletter-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 4px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.5s ease-out;
        }

        .newsletter-loading {
          color: #6c757d;
          font-size: 14px;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .newsletter-loading .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .newsletter-form.loading {
          opacity: 0.8;
        }

        .newsletter-form input[type="email"].error {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .newsletter-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 20%, 40%, 60%, 80% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
        }

        /* Accessibility improvements */
        .newsletter-form input[type="email"]:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0,0,0,0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .newsletter-success,
          .newsletter-error {
            padding: 10px 12px;
            font-size: 14px;
          }
          
          .newsletter-loading {
            font-size: 12px;
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.id = 'newsletter-enhanced-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  // Initialize when script loads
  window.NewsletterManager = new NewsletterManager();

})();