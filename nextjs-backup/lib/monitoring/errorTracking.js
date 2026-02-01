/**
 * Error Tracking and Monitoring System
 * Comprehensive error handling and performance monitoring
 */

class ErrorTracker {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.NEXT_PUBLIC_ERROR_ENDPOINT || '/api/errors';
    this.sessionId = this.generateSessionId();
    this.errorQueue = [];
    this.flushInterval = 30000; // 30 seconds
    this.flushTimerId = null;
    this.listenersRegistered = false;
    this.fetchPatched = false;
    this.originalFetch = null;
    this.performanceObservers = [];

    this.handleConsentChange = this.handleConsentChange.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('analytics:consent-changed', this.handleConsentChange);
      if (this.shouldEnable()) {
        this.installTracking();
      }
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  installTracking() {
    if (this.listenersRegistered || typeof window === 'undefined') {
      return;
    }

    this.boundErrorListener = (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    };

    this.boundRejectionListener = (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    };

    window.addEventListener('error', this.boundErrorListener);
    window.addEventListener('unhandledrejection', this.boundRejectionListener);

    this.monitorNetworkErrors();
    this.monitorPerformance();

    if (!this.flushTimerId) {
      this.flushTimerId = setInterval(() => this.flushErrors(), this.flushInterval);
    }

    this.listenersRegistered = true;
  }

  removeTracking() {
    if (typeof window === 'undefined' || !this.listenersRegistered) {
      return;
    }

    if (this.boundErrorListener) {
      window.removeEventListener('error', this.boundErrorListener);
      this.boundErrorListener = null;
    }

    if (this.boundRejectionListener) {
      window.removeEventListener('unhandledrejection', this.boundRejectionListener);
      this.boundRejectionListener = null;
    }

    if (this.fetchPatched && this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
      this.fetchPatched = false;
    }

    this.performanceObservers.forEach((observer) => observer.disconnect());
    this.performanceObservers = [];

    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }

    this.listenersRegistered = false;
  }

  handleConsentChange(event) {
    const level = event?.detail?.level || this.getConsentLevel();
    if (level === 'full') {
      this.installTracking();
    } else {
      this.removeTracking();
    }
  }

  shouldEnable() {
    return this.getConsentLevel() === 'full';
  }

  getConsentLevel() {
    if (typeof window === 'undefined') {
      return 'none';
    }

    return window.localStorage?.getItem('analytics-consent-level') || 'none';
  }

  captureError(errorData) {
    const enrichedError = {
      ...errorData,
      sessionId: this.sessionId,
      timestamp: errorData.timestamp || new Date().toISOString(),
      severity: this.determineSeverity(errorData),
      context: this.gatherContext(),
      fingerprint: this.generateFingerprint(errorData)
    };

    this.errorQueue.push(enrichedError);

    // Log to console in development
    if (!this.isProduction) {
      console.error('[ErrorTracker]', enrichedError);
    }

    // Send critical errors immediately
    if (enrichedError.severity === 'critical') {
      this.sendError(enrichedError);
    }
  }

  determineSeverity(errorData) {
    const { message, type } = errorData;

    // Critical errors that require immediate attention
    if (
      message?.includes('ChunkLoadError') ||
      message?.includes('Loading chunk') ||
      type === 'unhandled_promise_rejection' ||
      message?.includes('Network Error')
    ) {
      return 'critical';
    }

    // High priority errors
    if (
      message?.includes('TypeError') ||
      message?.includes('ReferenceError') ||
      message?.includes('API')
    ) {
      return 'high';
    }

    // Medium priority
    if (
      message?.includes('Warning') ||
      message?.includes('Deprecated')
    ) {
      return 'medium';
    }

    return 'low';
  }

  gatherContext() {
    if (typeof window === 'undefined') return {};

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      memory: navigator.deviceMemory || null,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      referrer: document.referrer,
      timestamp: performance.now()
    };
  }

  generateFingerprint(errorData) {
    const key = `${errorData.type}_${errorData.message}_${errorData.filename}_${errorData.lineno}`;
    return btoa(key).substr(0, 16);
  }

  monitorNetworkErrors() {
    if (this.fetchPatched || typeof window === 'undefined') {
      return;
    }

    this.originalFetch = window.fetch;
    const tracker = this;

    window.fetch = async function (...args) {
      const startTime = performance.now();
      try {
        const response = await tracker.originalFetch(...args);
        const endTime = performance.now();

        if (endTime - startTime > 5000) {
          tracker.captureError({
            type: 'slow_network_request',
            message: `Slow request: ${args[0]}`,
            duration: endTime - startTime,
            url: args[0],
            status: response.status
          });
        }

        if (!response.ok) {
          tracker.captureError({
            type: 'network_error',
            message: `HTTP ${response.status}: ${args[0]}`,
            status: response.status,
            url: args[0],
            statusText: response.statusText
          });
        }

        return response;
      } catch (error) {
        tracker.captureError({
          type: 'network_error',
          message: `Network request failed: ${error.message}`,
          url: args[0],
          stack: error.stack
        });
        throw error;
      }
    };

    this.fetchPatched = true;
  }

  monitorPerformance() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    this.performanceObservers.forEach((observer) => observer.disconnect());
    this.performanceObservers = [];

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry.startTime > 4000) {
          this.captureError({
            type: 'performance_issue',
            message: 'Poor Largest Contentful Paint',
            metric: 'LCP',
            value: lastEntry.startTime,
            threshold: 4000
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.performanceObservers.push(lcpObserver);

      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        if (clsValue > 0.25) {
          this.captureError({
            type: 'performance_issue',
            message: 'Poor Cumulative Layout Shift',
            metric: 'CLS',
            value: clsValue,
            threshold: 0.25
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.performanceObservers.push(clsObserver);
    } catch (error) {
      console.warn('Performance observers unavailable:', error);
    }
  }

  // Public method to manually capture errors
  captureException(error, context = {}) {
    this.captureError({
      type: 'manual_error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Public method to capture custom events
  captureEvent(eventName, data = {}) {
    this.captureError({
      type: 'custom_event',
      message: eventName,
      data,
      timestamp: new Date().toISOString()
    });
  }

  async sendError(errorData) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });
    } catch (error) {
      // Fallback to localStorage if API fails
      this.saveToLocalStorage(errorData);
    }
  }

  saveToLocalStorage(errorData) {
    try {
      const stored = localStorage.getItem('error_queue') || '[]';
      const errors = JSON.parse(stored);
      errors.push(errorData);

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      localStorage.setItem('error_queue', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to save error to localStorage:', e);
    }
  }

  async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'batch_errors',
          errors: errorsToSend,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      // Add errors back to queue for retry
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to flush errors:', error);
    }
  }

  // Health check method
  getHealthStatus() {
    return {
      sessionId: this.sessionId,
      errorCount: this.errorQueue.length,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
let errorTracker = null;

export const initializeErrorTracking = () => {
  if (!errorTracker) {
    errorTracker = new ErrorTracker();
  }
  return errorTracker;
};

export const getErrorTracker = () => {
  return errorTracker || initializeErrorTracking();
};

export default ErrorTracker;
