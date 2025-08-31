/**
 * reCAPTCHA Handler - DealRadarUS
 * Comprehensive spam protection for contact, newsletter, and comment forms
 */

class RecaptchaHandler {
  constructor(config) {
    this.config = config;
    this.siteKey = config.recaptcha.siteKey;
    this.isLoaded = false;
    this.widgets = new Map();
    this.attempts = new Map();
    
    this.init();
  }

  /**
   * Initialize reCAPTCHA system
   */
  async init() {
    try {
      await this.loadRecaptchaAPI();
      this.setupForms();
      this.initializeAnalytics();
      console.log('✅ reCAPTCHA Handler initialized successfully');
    } catch (error) {
      console.error('❌ reCAPTCHA initialization failed:', error);
      this.handleError('initialization', error);
    }
  }

  /**
   * Load Google reCAPTCHA API
   */
  loadRecaptchaAPI() {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = this.config.endpoints.api;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.grecaptcha.ready(() => {
          this.isLoaded = true;
          resolve();
        });
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA API'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Setup all forms with reCAPTCHA protection
   */
  setupForms() {
    Object.entries(this.config.forms).forEach(([formType, formConfig]) => {
      const forms = document.querySelectorAll(formConfig.selector);
      
      forms.forEach((form, index) => {
        this.setupForm(form, formType, formConfig, index);
      });
    });
  }

  /**
   * Setup individual form with reCAPTCHA
   */
  setupForm(form, formType, formConfig, index = 0) {
    const formId = `${formType}_${index}`;
    
    // Create reCAPTCHA container
    const recaptchaContainer = this.createRecaptchaContainer(formId);
    
    // Insert before submit button or at end of form
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.parentNode.insertBefore(recaptchaContainer, submitButton);
    } else {
      form.appendChild(recaptchaContainer);
    }

    // Render reCAPTCHA widget
    this.renderWidget(formId, formType, formConfig);

    // Setup form submission handler
    this.setupFormSubmission(form, formId, formType, formConfig);

    // Add visual feedback elements
    this.addVisualElements(form, formConfig);
  }

  /**
   * Create reCAPTCHA container element
   */
  createRecaptchaContainer(formId) {
    const container = document.createElement('div');
    container.className = 'recaptcha-container';
    container.id = `recaptcha-${formId}`;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'recaptcha-wrapper';
    wrapper.innerHTML = `
      <div class="recaptcha-widget" id="widget-${formId}"></div>
      <div class="recaptcha-status" id="status-${formId}">
        <div class="loading hidden">
          <span class="spinner"></span>
          ${this.config.customization.loadingText}
        </div>
        <div class="error hidden"></div>
        <div class="success hidden"></div>
      </div>
    `;
    
    container.appendChild(wrapper);
    return container;
  }

  /**
   * Render reCAPTCHA widget
   */
  renderWidget(formId, formType, formConfig) {
    if (!this.isLoaded) {
      setTimeout(() => this.renderWidget(formId, formType, formConfig), 100);
      return;
    }

    const widgetId = window.grecaptcha.render(`widget-${formId}`, {
      sitekey: this.siteKey,
      theme: this.config.recaptcha.theme,
      size: this.config.recaptcha.size,
      tabindex: this.config.recaptcha.tabindex,
      callback: (token) => this.onVerificationSuccess(formId, token),
      'expired-callback': () => this.onVerificationExpired(formId),
      'error-callback': () => this.onVerificationError(formId)
    });

    this.widgets.set(formId, {
      id: widgetId,
      type: formType,
      config: formConfig,
      verified: false,
      token: null
    });
  }

  /**
   * Setup form submission handling
   */
  setupFormSubmission(form, formId, formType, formConfig) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const widget = this.widgets.get(formId);
      
      if (formConfig.required && (!widget || !widget.verified)) {
        this.showError(formId, formConfig.errorMessage);
        this.trackEvent('recaptcha_required', formType);
        return false;
      }

      if (widget && widget.verified) {
        this.showLoading(formId);
        
        try {
          const isValid = await this.verifyToken(widget.token, formType);
          
          if (isValid) {
            this.showSuccess(formId, formConfig.successMessage);
            this.trackEvent('recaptcha_verified', formType);
            
            // Proceed with form submission
            setTimeout(() => {
              this.submitForm(form, formType, widget.token);
            }, 1000);
          } else {
            throw new Error('Verification failed');
          }
        } catch (error) {
          this.handleVerificationFailure(formId, formType);
        }
      } else {
        // If reCAPTCHA not required, submit directly
        this.submitForm(form, formType, null);
      }
    });
  }

  /**
   * Handle successful verification
   */
  onVerificationSuccess(formId, token) {
    const widget = this.widgets.get(formId);
    if (widget) {
      widget.verified = true;
      widget.token = token;
      this.widgets.set(formId, widget);
    }

    this.hideError(formId);
    this.trackEvent('recaptcha_completed', widget.type);
    
    console.log(`✅ reCAPTCHA verified for ${formId}`);
  }

  /**
   * Handle verification expiration
   */
  onVerificationExpired(formId) {
    const widget = this.widgets.get(formId);
    if (widget) {
      widget.verified = false;
      widget.token = null;
    }

    this.showError(formId, this.config.customization.expiredText);
    this.trackEvent('recaptcha_expired', widget ? widget.type : 'unknown');
  }

  /**
   * Handle verification error
   */
  onVerificationError(formId) {
    this.showError(formId, this.config.customization.networkErrorText);
    this.trackEvent('recaptcha_error', 'network');
  }

  /**
   * Server-side token verification
   */
  async verifyToken(token, formType) {
    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          formType: formType
        })
      });

      const result = await response.json();
      return result.success && result.score >= this.config.security.score_threshold;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * Handle verification failure
   */
  handleVerificationFailure(formId, formType) {
    const attempts = this.attempts.get(formId) || 0;
    const newAttempts = attempts + 1;
    this.attempts.set(formId, newAttempts);

    if (newAttempts >= this.config.validation.retryAttempts) {
      this.showError(formId, 'Maximum retry attempts exceeded. Please refresh the page.');
      this.trackEvent('recaptcha_max_attempts', formType);
    } else {
      this.showError(formId, this.config.customization.retryText);
      this.resetWidget(formId);
    }

    this.trackEvent('recaptcha_failed', formType, { attempts: newAttempts });
  }

  /**
   * Reset reCAPTCHA widget
   */
  resetWidget(formId) {
    const widget = this.widgets.get(formId);
    if (widget) {
      window.grecaptcha.reset(widget.id);
      widget.verified = false;
      widget.token = null;
    }
  }

  /**
   * Submit form after verification
   */
  async submitForm(form, formType, recaptchaToken) {
    const formData = new FormData(form);
    
    if (recaptchaToken) {
      formData.append('g-recaptcha-response', recaptchaToken);
    }

    try {
      let endpoint;
      switch (formType) {
        case 'contact':
          endpoint = '/api/contact';
          break;
        case 'newsletter':
          endpoint = '/api/newsletter';
          break;
        case 'comment':
          endpoint = '/api/comment';
          break;
        default:
          endpoint = '/api/form-submit';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.handleSubmissionSuccess(form, formType);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      this.handleSubmissionError(form, formType, error);
    }
  }

  /**
   * Handle successful form submission
   */
  handleSubmissionSuccess(form, formType) {
    form.reset();
    this.showSuccess(null, `${formType} submitted successfully!`);
    this.trackEvent('form_submit_success', formType);

    // Reset all reCAPTCHA widgets in the form
    const containers = form.querySelectorAll('.recaptcha-container');
    containers.forEach(container => {
      const formId = container.id.replace('recaptcha-', '');
      this.resetWidget(formId);
    });
  }

  /**
   * Handle form submission error
   */
  handleSubmissionError(form, formType, error) {
    this.showError(null, `Submission failed: ${error.message}`);
    this.trackEvent('form_submit_error', formType, { error: error.message });
  }

  /**
   * Visual feedback methods
   */
  showLoading(formId) {
    const statusEl = document.getElementById(`status-${formId}`);
    if (statusEl) {
      this.hideAllStatus(statusEl);
      statusEl.querySelector('.loading').classList.remove('hidden');
    }
  }

  showError(formId, message) {
    const statusEl = formId ? 
      document.getElementById(`status-${formId}`) : 
      document.querySelector('.recaptcha-status');
    
    if (statusEl) {
      this.hideAllStatus(statusEl);
      const errorEl = statusEl.querySelector('.error');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  showSuccess(formId, message) {
    const statusEl = formId ? 
      document.getElementById(`status-${formId}`) : 
      document.querySelector('.recaptcha-status');
    
    if (statusEl) {
      this.hideAllStatus(statusEl);
      const successEl = statusEl.querySelector('.success');
      successEl.textContent = message;
      successEl.classList.remove('hidden');
    }
  }

  hideError(formId) {
    const statusEl = document.getElementById(`status-${formId}`);
    if (statusEl) {
      statusEl.querySelector('.error').classList.add('hidden');
    }
  }

  hideAllStatus(statusEl) {
    statusEl.querySelectorAll('div').forEach(el => {
      el.classList.add('hidden');
    });
  }

  /**
   * Add visual elements and styles
   */
  addVisualElements(form, formConfig) {
    if (!document.getElementById('recaptcha-styles')) {
      const styles = document.createElement('style');
      styles.id = 'recaptcha-styles';
      styles.textContent = `
        .recaptcha-container {
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #fafafa;
        }
        
        .recaptcha-wrapper {
          text-align: center;
        }
        
        .recaptcha-status {
          margin-top: 10px;
          font-size: 14px;
        }
        
        .recaptcha-status .loading {
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .recaptcha-status .error {
          color: #d32f2f;
          background: #ffebee;
          padding: 8px;
          border-radius: 4px;
        }
        
        .recaptcha-status .success {
          color: #388e3c;
          background: #e8f5e8;
          padding: 8px;
          border-radius: 4px;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #666;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .hidden {
          display: none !important;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  /**
   * Initialize analytics tracking
   */
  initializeAnalytics() {
    if (window.gtag) {
      this.analytics = window.gtag;
    } else if (window.ga) {
      this.analytics = window.ga;
    }
  }

  /**
   * Track reCAPTCHA events
   */
  trackEvent(eventName, formType, additionalData = {}) {
    if (this.analytics) {
      this.analytics('event', eventName, {
        event_category: 'recaptcha',
        event_label: formType,
        ...additionalData
      });
    }

    if (this.config.validation.enableAnalytics) {
      console.log(`📊 reCAPTCHA Event: ${eventName}`, { formType, ...additionalData });
    }
  }

  /**
   * Handle general errors
   */
  handleError(context, error) {
    console.error(`reCAPTCHA Error (${context}):`, error);
    this.trackEvent('recaptcha_system_error', context, { error: error.message });
  }

  /**
   * Public API methods
   */
  getWidgetStatus(formId) {
    return this.widgets.get(formId);
  }

  resetAllWidgets() {
    this.widgets.forEach((widget, formId) => {
      this.resetWidget(formId);
    });
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const configResponse = await fetch('/config/recaptcha-config.json');
    const config = await configResponse.json();
    
    window.dealRadarRecaptcha = new RecaptchaHandler(config);
  } catch (error) {
    console.error('Failed to initialize reCAPTCHA:', error);
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecaptchaHandler;
}