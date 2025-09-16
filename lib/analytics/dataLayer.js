/**
 * Google Analytics 4 Data Layer Management
 * Handles GTM integration and event tracking with privacy compliance
 */

import CryptoJS from 'crypto-js';

// Initialize dataLayer if not exists
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

// Privacy salt for hashing (should be env variable in production)
const PRIVACY_SALT = (typeof window !== 'undefined' && window.PRIVACY_SALT) || 'dealradarus_2025';

/**
 * Hash sensitive data for privacy compliance
 */
function hashSensitiveData(data) {
  if (!data) return null;
  return CryptoJS.SHA256(data.toLowerCase() + PRIVACY_SALT).toString();
}

/**
 * Get current user context (non-PII)
 */
function getUserContext() {
  // Get user from Redux store if available
  const store = window.store;
  if (!store) return {};
  
  const state = store.getState();
  const user = state.auth?.user;
  
  if (!user) return { user_status: 'anonymous' };
  
  return {
    user_id: hashSensitiveData(user.id), // Hash user ID
    user_status: 'authenticated',
    user_role: user.role || 'user',
    user_registration_date: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : null
  };
}

/**
 * Push event to dataLayer with enhanced context
 */
export function pushEvent(eventName, eventParams = {}) {
  // Check if analytics is enabled
  const analyticsEnabled = (typeof window !== 'undefined' && window.ANALYTICS_ENABLED) || 'true';
  if (analyticsEnabled === 'false') {
    console.debug('[Analytics] Event tracking disabled');
    return;
  }
  
  // Check DNT (Do Not Track)
  const dntRespect = (typeof window !== 'undefined' && window.PRIVACY_DNT_RESPECT) || 'true';
  if (dntRespect === 'true' && navigator.doNotTrack === '1') {
    console.debug('[Analytics] Do Not Track enabled, skipping event');
    return;
  }
  
  // Check consent
  const consent = typeof window !== 'undefined' ? localStorage.getItem('deals_consent') : null;
  if (!consent || !consent.includes('granted')) {
    console.debug('[Analytics] Consent not granted, skipping event');
    return;
  }
  
  if (typeof window === 'undefined' || !window.dataLayer) {
    console.debug('[Analytics] DataLayer not available');
    return;
  }
  
  // Prepare event data
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    page_title: document.title,
    ...getUserContext(),
    ...eventParams
  };
  
  // Remove any remaining PII
  if (eventData.email) {
    eventData.email_hash = hashSensitiveData(eventData.email);
    delete eventData.email;
  }
  
  try {
    window.dataLayer.push(eventData);
    console.debug('[Analytics] Event pushed:', eventName, eventData);
  } catch (error) {
    console.error('[Analytics] Error pushing event:', error);
  }
}

/**
 * Initialize GTM with consent and privacy checks
 */
export function initializeGTM(containerId) {
  if (typeof window === 'undefined') return;
  
  // Check if already initialized
  if (window.gtmInitialized) {
    console.debug('[Analytics] GTM already initialized');
    return;
  }
  
  // Check consent
  const consent = typeof window !== 'undefined' ? localStorage.getItem('deals_consent') : null;
  if (!consent || !consent.includes('granted')) {
    console.debug('[Analytics] Consent not granted, GTM not loaded');
    return;
  }
  
  // Check DNT
  const dntRespect = (typeof window !== 'undefined' && window.PRIVACY_DNT_RESPECT) || 'true';
  if (dntRespect === 'true' && navigator.doNotTrack === '1') {
    console.debug('[Analytics] Do Not Track enabled, GTM not loaded');
    return;
  }
  
  // Check if analytics enabled
  const analyticsEnabled = (typeof window !== 'undefined' && window.ANALYTICS_ENABLED) || 'true';
  if (analyticsEnabled === 'false') {
    console.debug('[Analytics] Analytics disabled, GTM not loaded');
    return;
  }
  
  if (!containerId) {
    console.warn('[Analytics] GTM Container ID not provided');
    return;
  }
  
  try {
    // Initialize dataLayer with consent info
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
      consent: {
        analytics_storage: 'granted',
        ad_storage: 'denied', // Always deny ad storage for privacy
        functionality_storage: 'granted',
        security_storage: 'granted'
      }
    });
    
    // Create GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    
    // Add nonce for CSP compliance if available
    const nonce = document.querySelector('meta[name="csp-nonce"]')?.content;
    if (nonce) {
      script.nonce = nonce;
    }
    
    // Error handling
    script.onerror = () => {
      console.error('[Analytics] Failed to load GTM');
    };
    
    script.onload = () => {
      console.debug('[Analytics] GTM loaded successfully');
      window.gtmInitialized = true;
    };
    
    // Insert script
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
    
  } catch (error) {
    console.error('[Analytics] Error initializing GTM:', error);
  }
}

/**
 * Set user consent and reinitialize if needed
 */
export function setConsent(granted) {
  const consentValue = granted ? 'granted' : 'denied';
  const consentData = `v1:${consentValue}`;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('deals_consent', consentData);
  }
  
  // Push consent update to dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'consent_update',
      consent: {
        analytics_storage: consentValue,
        functionality_storage: consentValue
      }
    });
  }
  
  // Initialize GTM if consent granted and not already loaded
  const gtmContainerId = (typeof window !== 'undefined' && window.GTM_CONTAINER_ID);
  if (granted && !window.gtmInitialized && gtmContainerId) {
    initializeGTM(gtmContainerId);
  }
  
  console.debug('[Analytics] Consent updated:', consentValue);
}

/**
 * Get current consent status
 */
export function getConsentStatus() {
  const consent = typeof window !== 'undefined' ? localStorage.getItem('deals_consent') : null;
  if (!consent) return null;
  
  return consent.includes('granted') ? 'granted' : 'denied';
}

/**
 * Track page view
 */
export function trackPageView(pagePath = null) {
  pushEvent('page_view', {
    page_path: pagePath || window.location.pathname,
    page_location: window.location.href,
    page_title: document.title
  });
}

/**
 * Track user engagement
 */
export function trackEngagement(engagementType, duration = null) {
  pushEvent('user_engagement', {
    engagement_type: engagementType,
    engagement_duration: duration
  });
}

// Auto-initialize on load if consent is already granted
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const consent = typeof window !== 'undefined' ? localStorage.getItem('deals_consent') : null;
    const containerId = window.GTM_CONTAINER_ID;
    
    if (consent && consent.includes('granted') && containerId) {
      setTimeout(() => initializeGTM(containerId), 100);
    }
  });
}