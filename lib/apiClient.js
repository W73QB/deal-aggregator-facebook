/**
 * API Client for External API Integration
 * Handles routing to either Railway external API or local Vercel API routes
 *
 * Usage:
 *   import { fetchHealth, fetchPosts, fetchDeals } from '@/lib/apiClient';
 *   const posts = await fetchPosts({ category: 'tech-reviews' });
 */

// Determine API base URL
// When NEXT_PUBLIC_API_URL is set, use external API (Railway)
// Otherwise, fallback to local /api routes (Vercel - currently broken)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint path (e.g., '/api/posts')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

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
 * Get current API base URL
 * Useful for debugging/monitoring
 */
export function getApiBase() {
  return API_BASE;
}

/**
 * Check if using external API
 */
export function isUsingExternalApi() {
  return !!process.env.NEXT_PUBLIC_API_URL;
}

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