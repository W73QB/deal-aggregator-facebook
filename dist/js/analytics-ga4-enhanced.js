/**
 * Enhanced Google Analytics 4 Tracking for DealRadarUS
 * Features: Enhanced Ecommerce, Custom Events, User Journey Tracking
 * Version: 1.0.0
 */

class GA4EnhancedTracking {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    if (typeof gtag === 'undefined') {
      console.warn('📊 GA4: gtag not found, analytics tracking disabled');
      return;
    }

    this.isInitialized = true;
    this.setupUserTracking();
    this.setupEnhancedEcommerce();
    this.trackInitialLoad();
    
    console.log('📊 GA4 Enhanced Tracking initialized');
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setupUserTracking() {
    // Set user properties
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-9ZVTTTBD03', {
        custom_map: {
          custom_parameter_1: 'deal_category',
          custom_parameter_2: 'price_range',
          custom_parameter_3: 'discount_percentage'
        }
      });
    }
  }

  setupEnhancedEcommerce() {
    // Enhanced ecommerce events setup
    this.trackDealInteractions();
    this.trackNewsletterSignup();
    this.trackUserEngagement();
    this.trackScrollDepth();
  }

  trackInitialLoad() {
    const loadTime = performance.now();
    this.trackEvent('page_load_complete', {
      load_time: Math.round(loadTime),
      session_id: this.sessionId,
      page_type: 'deals_homepage'
    });
  }

  // Core tracking method
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return;

    const enrichedParams = {
      ...parameters,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    };

    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, enrichedParams);
      console.log('📊 GA4 Event:', eventName, enrichedParams);
    }
  }

  // Enhanced Ecommerce Events
  trackDealView(dealData) {
    this.trackEvent('view_item', {
      currency: 'USD',
      value: dealData.price || 0,
      items: [{
        item_id: dealData.id || 'unknown',
        item_name: dealData.title || 'Unknown Deal',
        item_category: dealData.category || 'general',
        item_variant: dealData.source || 'website',
        price: dealData.price || 0,
        discount: dealData.discount || 0,
        quantity: 1
      }]
    });
  }

  trackDealClick(dealData) {
    this.trackEvent('select_item', {
      currency: 'USD',
      value: dealData.price || 0,
      items: [{
        item_id: dealData.id || 'unknown',
        item_name: dealData.title || 'Unknown Deal',
        item_category: dealData.category || 'general',
        item_variant: dealData.source || 'website',
        price: dealData.price || 0,
        discount: dealData.discount || 0,
        quantity: 1
      }],
      deal_position: dealData.position || 0,
      list_name: dealData.listName || 'homepage_deals'
    });
  }

  trackAddToWishlist(dealData) {
    this.trackEvent('add_to_wishlist', {
      currency: 'USD',
      value: dealData.price || 0,
      items: [{
        item_id: dealData.id || 'unknown',
        item_name: dealData.title || 'Unknown Deal',
        item_category: dealData.category || 'general',
        price: dealData.price || 0,
        discount: dealData.discount || 0
      }]
    });
  }

  trackPurchase(purchaseData) {
    this.trackEvent('purchase', {
      transaction_id: purchaseData.transactionId,
      currency: 'USD',
      value: purchaseData.totalValue,
      coupon: purchaseData.coupon || '',
      items: purchaseData.items || []
    });
  }

  // Newsletter & Lead Generation
  trackNewsletterSignup() {
    document.addEventListener('newsletter_submit_success', (event) => {
      this.trackEvent('sign_up', {
        method: 'email',
        content_type: 'newsletter',
        source: event.detail?.source || 'website'
      });

      // Track as conversion
      this.trackEvent('generate_lead', {
        currency: 'USD',
        value: 5.00, // Estimated value of email subscriber
        lead_type: 'newsletter_subscription'
      });
    });
  }

  // User Engagement Tracking
  trackUserEngagement() {
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScrollDepth && scrollPercent >= 25) {
        maxScrollDepth = scrollPercent;
        const milestone = Math.floor(scrollPercent / 25) * 25;
        
        this.trackEvent('scroll', {
          percent_scrolled: milestone,
          scroll_depth: 'depth_' + milestone
        });
      }
    });

    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent('page_engagement', {
        engagement_time_msec: timeOnPage * 1000,
        time_on_page: timeOnPage
      });
    });
  }

  trackScrollDepth() {
    const checkpoints = [25, 50, 75, 90];
    let maxDepth = 0;

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      checkpoints.forEach(checkpoint => {
        if (scrollPercent >= checkpoint && maxDepth < checkpoint) {
          maxDepth = checkpoint;
          this.trackEvent('scroll_checkpoint', {
            scroll_depth: checkpoint,
            page_type: 'deals_page'
          });
        }
      });
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  // Deal-specific tracking
  trackDealInteractions() {
    // Auto-track all deal card clicks
    document.addEventListener('click', (event) => {
      const dealCard = event.target.closest('.deal-card, .product-card, [data-deal-id]');
      if (!dealCard) return;

      const dealData = this.extractDealData(dealCard);
      this.trackDealClick(dealData);
    });

    // Track deal impressions with Intersection Observer
    const dealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dealData = this.extractDealData(entry.target);
          this.trackDealView(dealData);
        }
      });
    }, { threshold: 0.5 });

    // Observe all deal cards
    const observeDealCards = () => {
      document.querySelectorAll('.deal-card, .product-card, [data-deal-id]').forEach(card => {
        if (!card.hasAttribute('data-ga-observed')) {
          dealObserver.observe(card);
          card.setAttribute('data-ga-observed', 'true');
        }
      });
    };

    // Initial observation and re-observe when new deals are added
    observeDealCards();
    const observer = new MutationObserver(observeDealCards);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  extractDealData(dealElement) {
    if (!dealElement) return {};

    return {
      id: dealElement.getAttribute('data-deal-id') || 
          dealElement.querySelector('[data-deal-id]')?.getAttribute('data-deal-id') || 
          'unknown',
      title: dealElement.querySelector('h3, .deal-title, .product-name')?.textContent?.trim() || 'Unknown Deal',
      price: this.extractPrice(dealElement),
      category: dealElement.getAttribute('data-category') || 'general',
      source: dealElement.getAttribute('data-source') || 'website',
      discount: this.extractDiscount(dealElement),
      position: Array.from(dealElement.parentElement?.children || []).indexOf(dealElement),
      listName: dealElement.closest('[data-list-name]')?.getAttribute('data-list-name') || 'homepage_deals'
    };
  }

  extractPrice(element) {
    const priceText = element.querySelector('.price, .deal-price, [data-price]')?.textContent || '';
    const match = priceText.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  }

  extractDiscount(element) {
    const discountText = element.querySelector('.discount, .save-amount, [data-discount]')?.textContent || '';
    const match = discountText.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  // Custom event tracking methods
  trackSearch(searchTerm) {
    this.trackEvent('search', {
      search_term: searchTerm,
      content_type: 'deals'
    });
  }

  trackFilter(filterType, filterValue) {
    this.trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      content_type: 'deals'
    });
  }

  trackShare(platform, dealId = null) {
    this.trackEvent('share', {
      method: platform,
      content_type: dealId ? 'deal' : 'website',
      item_id: dealId || 'homepage'
    });
  }

  trackVideoPlay(videoId, videoTitle) {
    this.trackEvent('video_start', {
      video_current_time: 0,
      video_duration: 0,
      video_percent: 0,
      video_provider: 'self_hosted',
      video_title: videoTitle,
      video_url: videoId
    });
  }

  trackFormInteraction(formName, action) {
    this.trackEvent('form_interaction', {
      form_name: formName,
      form_action: action, // 'start', 'complete', 'abandon'
      engagement_type: 'form'
    });
  }

  // Error tracking
  trackError(errorType, errorMessage, errorContext = {}) {
    this.trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      ...errorContext
    });
  }

  // Performance tracking
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      page_type: 'deals_page'
    });
  }

  // User identification
  setUserId(userId) {
    this.userId = userId;
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-9ZVTTTBD03', {
        user_id: userId
      });
    }
  }

  setUserProperties(properties) {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-9ZVTTTBD03', {
        custom_map: properties
      });
    }
  }
}

// Initialize enhanced tracking
const ga4Tracker = new GA4EnhancedTracking();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GA4EnhancedTracking;
} else {
  window.GA4Tracker = ga4Tracker;
}

// Auto-track common events
document.addEventListener('DOMContentLoaded', () => {
  console.log('📊 GA4 Enhanced Tracking ready for DealRadarUS');
  
  // Track newsletter form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.matches('.newsletter-form, [action*="newsletter"]')) {
      ga4Tracker.trackFormInteraction('newsletter', 'submit');
    }
  });

  // Track external link clicks
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link && link.hostname !== location.hostname) {
      ga4Tracker.trackEvent('click', {
        link_classes: link.className,
        link_domain: link.hostname,
        link_id: link.id,
        link_text: link.textContent.trim().substring(0, 100),
        link_url: link.href,
        outbound: true
      });
    }
  });
});