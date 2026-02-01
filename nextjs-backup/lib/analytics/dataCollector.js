/**
 * Data Collection and Analytics Foundation
 * Comprehensive data collection system for user behavior, performance, and business metrics
 */

class DataCollector {
  constructor() {
    this.CONSENT_STORAGE_KEY = 'analytics-consent-level';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.pageLoadTime = Date.now();
    this.events = [];
    this.baseInitialized = false;
    this.pageViewTracked = false;
    this.performanceMonitoringEnabled = false;
    this.userBehaviorTrackingEnabled = false;
    this.businessMetricsTrackingEnabled = false;
    this.errorTrackingEnabled = false;
    this.flushTimer = null;
    this.flushOnUnloadRegistered = false;
    this.timeTrackingInterval = null;
    this.consentLevel = this.loadConsentLevel();
    this.essentialOnly = this.consentLevel !== 'full';

    this.config = {
      // Data collection settings
      enableUserBehavior: true,
      enablePerformanceMetrics: true,
      enableBusinessMetrics: true,
      enableErrorTracking: true,

      // Privacy settings
      respectDoNotTrack: true,
      anonymizeIPs: true,

      // Batch settings
      batchSize: 10,
      flushInterval: 30000, // 30 seconds

      // Endpoints
      analyticsEndpoint: '/api/analytics',
      performanceEndpoint: '/api/performance',
      businessEndpoint: '/api/business-metrics'
    };

    this.performanceMetrics = {
      pageLoadStart: typeof performance !== 'undefined' ? performance.now() : 0,
      domContentLoaded: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      firstInputDelay: null,
      cumulativeLayoutShift: 0
    };

    this.syncConfigWithConsent();
  }

  async initialize() {
    if (typeof window === 'undefined') return;

    this.syncConfigWithConsent();

    if (this.shouldRespectPrivacy() || this.consentLevel === 'none') {
      console.log('🔒 Analytics disabled until consent is granted or privacy flags are cleared');
      return;
    }

    if (!this.userId && this.consentLevel === 'full') {
      this.userId = this.getUserId();
    }

    try {
      // Start periodic data flush exactly once
      this.startPeriodicFlush();

      // Track initial page load once consent allows analytics
      if (!this.pageViewTracked) {
        this.trackPageView();
        this.pageViewTracked = true;
      }

      if (this.config.enablePerformanceMetrics) {
        this.setupPerformanceMonitoring();
      }

      if (this.config.enableUserBehavior) {
        this.setupUserBehaviorTracking();
      }

      if (this.config.enableBusinessMetrics) {
        this.setupBusinessMetricsTracking();
      }

      if (this.config.enableErrorTracking) {
        this.setupErrorTracking();
      }

      this.baseInitialized = true;
      console.log('✅ Data Collection System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize data collection:', error);
    }
  }

  shouldRespectPrivacy() {
    if (typeof navigator !== 'undefined' && this.config.respectDoNotTrack && navigator.doNotTrack === '1') {
      return true;
    }

    return this.consentLevel === 'none';
  }

  loadConsentLevel() {
    if (typeof window === 'undefined') {
      return 'none';
    }

    const stored = window.localStorage?.getItem(this.CONSENT_STORAGE_KEY);
    if (!stored) {
      return 'none';
    }

    return ['none', 'basic', 'full'].includes(stored) ? stored : 'none';
  }

  persistConsentLevel(level) {
    if (typeof window === 'undefined') return;
    window.localStorage?.setItem(this.CONSENT_STORAGE_KEY, level);
  }

  dispatchConsentChange(level) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('analytics:consent-changed', { detail: { level } }));
  }

  syncConfigWithConsent() {
    if (this.consentLevel === 'full') {
      this.config.enableUserBehavior = true;
      this.config.enableBusinessMetrics = true;
      this.config.enableErrorTracking = true;
      this.config.enablePerformanceMetrics = true;
    } else if (this.consentLevel === 'basic') {
      this.config.enableUserBehavior = false;
      this.config.enableBusinessMetrics = false;
      this.config.enableErrorTracking = false;
      this.config.enablePerformanceMetrics = true;
    } else {
      this.config.enableUserBehavior = false;
      this.config.enableBusinessMetrics = false;
      this.config.enableErrorTracking = false;
      this.config.enablePerformanceMetrics = false;
    }

    this.essentialOnly = this.consentLevel !== 'full';
  }

  setConsentLevel(level) {
    if (!['none', 'basic', 'full'].includes(level)) {
      console.warn('Unsupported consent level provided:', level);
      return;
    }

    if (this.consentLevel === level) {
      return;
    }

    this.consentLevel = level;
    this.persistConsentLevel(level);
    this.syncConfigWithConsent();

    if (level === 'full' && !this.userId) {
      this.userId = this.getUserId();
    }

    if (level === 'none') {
      this.events = [];
    }

    this.dispatchConsentChange(level);
    this.initialize();
  }

  setupUserBehaviorTracking() {
    if (this.userBehaviorTrackingEnabled || !this.config.enableUserBehavior || this.consentLevel !== 'full') {
      return;
    }

    console.log('👤 Setting up user behavior tracking...');

    // Click tracking (without capturing text or coordinates)
    document.addEventListener('click', (event) => {
      this.trackEvent('click', {
        element: event.target.tagName.toLowerCase(),
        id: event.target.id,
        className: event.target.className,
        timestamp: Date.now()
      });
    }, { capture: false });

    // Scroll tracking
    let scrollTimeout;
    let maxScroll = 0;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);

      const denominator = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const scrollPercent = Math.round((window.scrollY / denominator) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      scrollTimeout = setTimeout(() => {
        this.trackEvent('scroll', {
          scrollPercent: maxScroll,
          timestamp: Date.now()
        });
      }, 1000);
    }, { passive: true });

    // Form interactions (no form field contents)
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.trackEvent('form_submit', {
        formId: form.id,
        formClass: form.className,
        action: form.action,
        method: form.method,
        timestamp: Date.now()
      });
    });

    // Search tracking (records intent only)
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"]');
    searchInputs.forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.trackEvent('search', {
            source: 'search_input',
            timestamp: Date.now()
          });
        }
      });
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });

    // Time on page tracking
    this.startTimeTracking();

    this.userBehaviorTrackingEnabled = true;
  }

  setupPerformanceMonitoring() {
    if (this.performanceMonitoringEnabled || !this.config.enablePerformanceMetrics) return;

    console.log('⚡ Setting up performance monitoring...');

    // Core Web Vitals
    this.observeWebVitals();

    // Resource loading
    this.observeResourceTiming();

    // Navigation timing
    this.observeNavigationTiming();

    // Custom performance marks
    this.createPerformanceMarks();

    this.performanceMonitoringEnabled = true;
  }

  observeWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;

        this.trackEvent('performance_metric', {
          metric: 'LCP',
          value: lastEntry.startTime,
          rating: this.getWebVitalRating('LCP', lastEntry.startTime),
          timestamp: Date.now()
        });
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];

        this.performanceMetrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime;

        this.trackEvent('performance_metric', {
          metric: 'FID',
          value: this.performanceMetrics.firstInputDelay,
          rating: this.getWebVitalRating('FID', this.performanceMetrics.firstInputDelay),
          timestamp: Date.now()
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            this.performanceMetrics.cumulativeLayoutShift += entry.value;
          }
        }

        this.trackEvent('performance_metric', {
          metric: 'CLS',
          value: this.performanceMetrics.cumulativeLayoutShift,
          rating: this.getWebVitalRating('CLS', this.performanceMetrics.cumulativeLayoutShift),
          timestamp: Date.now()
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Track slow resources
          if (entry.duration > 1000) {
            this.trackEvent('slow_resource', {
              name: entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize,
              timestamp: Date.now()
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];

      if (navigation) {
        this.trackEvent('page_load_timing', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          timestamp: Date.now()
        });
      }
    });
  }

  createPerformanceMarks() {
    // Mark key application events
    performance.mark('data-collector-initialized');

    // Observer for custom marks
    if ('PerformanceObserver' in window) {
      const markObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name.startsWith('app-')) {
            this.trackEvent('custom_performance_mark', {
              mark: entry.name,
              timestamp: entry.startTime
            });
          }
        }
      });

      markObserver.observe({ entryTypes: ['mark'] });
    }
  }

  setupBusinessMetricsTracking() {
    if (this.businessMetricsTrackingEnabled || !this.config.enableBusinessMetrics) return;

    console.log('💰 Setting up business metrics tracking...');

    // Deal interactions
    this.trackDealInteractions();

    // Search behavior
    this.trackSearchBehavior();

    // User engagement
    this.trackUserEngagement();

    // Conversion events
    this.trackConversions();

    this.businessMetricsTrackingEnabled = true;
  }

  trackDealInteractions() {
    // Track deal clicks
    document.addEventListener('click', (event) => {
      const dealElement = event.target.closest('[data-deal-id]');
      if (dealElement) {
        const dealId = dealElement.getAttribute('data-deal-id');
        const dealTitle = dealElement.querySelector('.deal-title')?.textContent;
        const dealPrice = dealElement.querySelector('.deal-price')?.textContent;

        this.trackEvent('deal_click', {
          dealId,
          dealTitle,
          dealPrice,
          position: this.getElementPosition(dealElement),
          timestamp: Date.now()
        });
      }
    });

    // Track deal views (intersection observer)
    if ('IntersectionObserver' in window) {
      const dealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const dealId = entry.target.getAttribute('data-deal-id');
            if (dealId) {
              this.trackEvent('deal_view', {
                dealId,
                viewDuration: Date.now() - (entry.target._viewStart || Date.now()),
                timestamp: Date.now()
              });
            }
          } else if (!entry.isIntersecting && entry.target._viewStart) {
            entry.target._viewStart = null;
          } else if (entry.isIntersecting) {
            entry.target._viewStart = Date.now();
          }
        });
      }, { threshold: 0.5 });

      // Observe all deal elements
      document.querySelectorAll('[data-deal-id]').forEach(el => {
        dealObserver.observe(el);
      });
    }
  }

  trackSearchBehavior() {
    // Track search queries and results
    const searchForms = document.querySelectorAll('form[role="search"], form.search-form');
    searchForms.forEach(form => {
      form.addEventListener('submit', (event) => {
        const query = form.querySelector('input[type="search"]')?.value;
        if (query) {
          this.trackEvent('search_query', {
            query,
            source: 'main_search',
            timestamp: Date.now()
          });
        }
      });
    });

    // Track filter usage
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-filter]')) {
        this.trackEvent('filter_change', {
          filterType: event.target.getAttribute('data-filter'),
          filterValue: event.target.value,
          timestamp: Date.now()
        });
      }
    });
  }

  trackUserEngagement() {
    // Track social sharing
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-share]')) {
        this.trackEvent('social_share', {
          platform: event.target.getAttribute('data-share'),
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

    // Track newsletter signups
    document.addEventListener('submit', (event) => {
      if (event.target.matches('.newsletter-form')) {
        this.trackEvent('newsletter_signup', {
          source: 'newsletter_form',
          timestamp: Date.now()
        });
      }
    });

    // Track page depth
    const maxDepth = 1;
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_summary', {
        maxDepth,
        timeOnSite: Date.now() - this.pageLoadTime,
        timestamp: Date.now()
      });
    });
  }

  trackConversions() {
    // Track external link clicks (conversions)
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        this.trackEvent('external_link_click', {
          url: link.href,
          text: link.textContent?.slice(0, 100),
          isAffiliate: link.href.includes('amazon.com') || link.href.includes('amzn.to'),
          timestamp: Date.now()
        });
      }
    });

    // Track button clicks that might be conversions
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, .btn, [role="button"]');
      if (button) {
        const buttonText = button.textContent?.toLowerCase();
        const isConversion = buttonText.includes('buy') ||
                           buttonText.includes('shop') ||
                           buttonText.includes('get deal') ||
                           buttonText.includes('claim');

        if (isConversion) {
          this.trackEvent('conversion_intent', {
            buttonText: button.textContent,
            buttonId: button.id,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  setupErrorTracking() {
    if (this.errorTrackingEnabled || !this.config.enableErrorTracking) return;

    console.log('🚨 Setting up error tracking...');

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        timestamp: Date.now()
      });
    });

    this.errorTrackingEnabled = true;
  }

  startTimeTracking() {
    if (this.timeTrackingInterval) {
      return;
    }

    let timeOnPage = 0;
    const startTime = Date.now();

    this.timeTrackingInterval = setInterval(() => {
      if (!document.hidden) {
        timeOnPage += 1000;
      }
    }, 1000);

    // Track time milestones
    setTimeout(() => this.trackEvent('time_milestone', { milestone: '30s', timestamp: Date.now() }), 30000);
    setTimeout(() => this.trackEvent('time_milestone', { milestone: '60s', timestamp: Date.now() }), 60000);
    setTimeout(() => this.trackEvent('time_milestone', { milestone: '300s', timestamp: Date.now() }), 300000);
  }

  startPeriodicFlush() {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);

    // Flush on page unload
    if (!this.flushOnUnloadRegistered) {
      window.addEventListener('beforeunload', () => {
        this.flushEvents(true);
      });
      this.flushOnUnloadRegistered = true;
    }
  }

  trackEvent(eventType, eventData = {}) {
    if (this.consentLevel === 'none') {
      return;
    }

    if (this.consentLevel === 'basic' && !this.isEssentialEvent(eventType)) {
      return;
    }

    const sanitizedData = this.sanitizeEventData(eventType, eventData);

    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: sanitizedData,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    if (typeof window !== 'undefined') {
      event.url = this.consentLevel === 'full' ? window.location.href : window.location.pathname;
    }

    if (this.consentLevel === 'full') {
      event.userId = this.userId;
      if (typeof navigator !== 'undefined') {
        event.userAgent = navigator.userAgent;
      }
      event.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  trackPageView() {
    if (typeof document === 'undefined') return;

    const data = {
      title: document.title,
      path: window.location.pathname,
      timestamp: Date.now()
    };

    if (this.consentLevel === 'full') {
      data.referrer = document.referrer;
      data.search = window.location.search;
      data.hash = window.location.hash;
    }

    this.trackEvent('page_view', data);
  }

  isEssentialEvent(eventType) {
    const essentialEvents = new Set([
      'page_view',
      'performance_metric',
      'page_load_timing',
      'time_milestone',
      'session_summary',
      'visibility_change',
      'scroll',
      'slow_resource'
    ]);

    return essentialEvents.has(eventType);
  }

  sanitizeEventData(eventType, data = {}) {
    if (this.consentLevel === 'basic') {
      const allowedKeys = new Set([
        'timestamp',
        'title',
        'path',
        'metric',
        'value',
        'rating',
        'milestone',
        'visible',
        'scrollPercent',
        'status'
      ]);

      const sanitized = {};
      for (const key of allowedKeys) {
        if (data[key] !== undefined) {
          sanitized[key] = data[key];
        }
      }
      sanitized.timestamp = sanitized.timestamp || Date.now();
      return sanitized;
    }

    const sensitiveKeys = [
      'text',
      'query',
      'x',
      'y',
      'clientX',
      'clientY',
      'pageX',
      'pageY',
      'innerText',
      'outerHTML',
      'formValues'
    ];

    const sanitized = { ...data };
    sensitiveKeys.forEach((key) => {
      if (key in sanitized) {
        delete sanitized[key];
      }
    });

    sanitized.timestamp = sanitized.timestamp || Date.now();
    return sanitized;
  }

  async flushEvents(isBeforeUnload = false) {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const payload = {
        sessionId: this.sessionId,
        userId: this.consentLevel === 'full' ? this.userId : null,
        events: eventsToSend,
        timestamp: Date.now()
      };

      if (isBeforeUnload && 'sendBeacon' in navigator) {
        // Use sendBeacon for reliable sending on page unload
        navigator.sendBeacon(
          this.config.analyticsEndpoint,
          JSON.stringify(payload)
        );
      } else {
        // Regular fetch for normal sends
        await fetch(this.config.analyticsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

    } catch (error) {
      console.warn('Failed to send analytics data:', error);
      // Add events back to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  // Utility methods
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Check for existing user ID in localStorage
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  getWebVitalRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const elementIndex = Array.from(element.parentElement.children).indexOf(element);

    return {
      index: elementIndex,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  // Public API methods
  setUserId(userId) {
    this.userId = userId;
    localStorage.setItem('user_id', userId);
  }

  setUserProperties(properties) {
    this.trackEvent('user_properties', properties);
  }

  trackCustomEvent(eventName, eventData) {
    this.trackEvent('custom_' + eventName, eventData);
  }

  // Privacy methods
  optOut() {
    this.setConsentLevel('none');
    console.log('📵 Analytics opt-out enabled');
  }

  optIn() {
    this.setConsentLevel('full');
    console.log('📊 Analytics opt-in enabled');
  }
}

// Singleton instance
let dataCollector = null;

export const initializeDataCollection = () => {
  if (!dataCollector) {
    dataCollector = new DataCollector();
    dataCollector.initialize();
  }
  return dataCollector;
};

export const getDataCollector = () => {
  return dataCollector || initializeDataCollection();
};

export default DataCollector;
