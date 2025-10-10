/**
 * API Client for External API Integration
 * Handles routing to either Railway external API or local Vercel API routes
 *
 * Usage:
 *   import { fetchHealth, fetchPosts, fetchDeals } from '@/lib/apiClient';
 *   const posts = await fetchPosts({ category: 'tech-reviews' });
 */

import { resolveApiBaseUrl } from './utils/apiConfig';

// Get API base URL at runtime (not module load time)
// This ensures environment variables are properly resolved
function getApiBase() {
  const base = resolveApiBaseUrl();
  // resolveApiBaseUrl returns full URL or '/api' for Next.js routes
  // For Railway API, it will be like 'https://deal-aggregator-api-production.up.railway.app'
  // For local Next.js, it will be '/api'
  return base;
}

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint path (e.g., '/api/posts' or '/posts')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiFetch(endpoint, options = {}) {
  // Build URL correctly:
  // - If using external API (Railway): use full base URL with /api prefix
  // - If using local API (/api): use relative path
  const API_BASE = getApiBase();
  let url;

  if (API_BASE.startsWith('http')) {
    // External API (Railway): base already includes protocol and domain
    // Append endpoint with /api prefix
    url = `${API_BASE}${endpoint}`;
  } else {
    // Local API: endpoint already has /api prefix
    url = endpoint;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Health Check
 * GET /api/health
 */
export async function fetchHealth() {
  return apiFetch('/api/health');
}

/**
 * Fetch Blog Posts
 * GET /api/posts?category=...&limit=...
 * @param {object} params - Query parameters
 * @param {string} params.category - Filter by category (optional)
 * @param {number} params.limit - Limit number of posts (optional)
 */
export async function fetchPosts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/api/posts${queryString ? '?' + queryString : ''}`;
  return apiFetch(endpoint);
}

/**
 * Fetch Deals
 * GET /api/deals?category=...&featured=...&limit=...
 * @param {object} params - Query parameters
 * @param {string} params.category - Filter by category (optional)
 * @param {boolean} params.featured - Filter featured deals (optional)
 * @param {number} params.limit - Limit number of deals (optional)
 */
export async function fetchDeals(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/api/deals${queryString ? '?' + queryString : ''}`;
  return apiFetch(endpoint);
}

/**
 * Track Analytics Events
 * POST /api/analytics
 * @param {object} data - Analytics data
 * @param {string} data.sessionId - Session ID (optional)
 * @param {string} data.userId - User ID (optional)
 * @param {array} data.events - Array of events
 */
export async function trackAnalytics(data) {
  return apiFetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Log Error
 * POST /api/errors
 * @param {object} errorData - Error data
 * @param {string} errorData.type - Error type
 * @param {string} errorData.message - Error message
 * @param {string} errorData.stack - Stack trace (optional)
 * @param {string} errorData.severity - Error severity (optional)
 */
export async function logError(errorData) {
  return apiFetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify(errorData),
  });
}

/**
 * Fetch Error Summary
 * GET /api/errors/summary
 */
export async function fetchErrorSummary() {
  return apiFetch('/api/errors/summary');
}

/**
 * Subscribe to Newsletter
 * POST /api/newsletter
 * @param {string} email - Email address
 */
export async function subscribeNewsletter(email) {
  return apiFetch('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Check Authentication Status
 * GET /api/auth/me
 */
export async function fetchAuthStatus() {
  return apiFetch('/api/auth/me');
}

/**
 * Check if using external API
 * Useful for debugging/monitoring
 */
export function isUsingExternalApi() {
  const base = getApiBase();
  return base.startsWith('http');
}

// Export getApiBase for external use
export { getApiBase };

export default {
  fetchHealth,
  fetchPosts,
  fetchDeals,
  trackAnalytics,
  logError,
  fetchErrorSummary,
  subscribeNewsletter,
  fetchAuthStatus,
  getApiBase,
  isUsingExternalApi,
};