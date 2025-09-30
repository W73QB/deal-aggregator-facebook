/**
 * API Cache Control Utility
 * Prevents API responses from being cached on Vercel edge servers
 */

/**
 * Apply no-store cache headers to prevent API response caching
 * @param {Object} res - Express/Next.js response object
 */
export function applyNoStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

/**
 * Apply no-cache headers with additional security headers
 * @param {Object} res - Express/Next.js response object
 */
export function applyApiHeaders(res) {
  // Prevent caching
  applyNoStore(res);

  // Additional security headers for API endpoints
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}