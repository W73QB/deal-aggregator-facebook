/**
 * Determine the base URL for API calls across environments.
 * Prefers explicit public config, then SSR/SSG server-side config,
 * finally falling back to development or relative production paths.
 */

export function resolveApiBaseUrl() {
  // Check client-side public URL first (available in browser)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // For server-side (SSR/SSG), check server-only env vars
  if (typeof window === 'undefined') {
    // Check Railway/external API URL for SSG builds
    if (process.env.API_URL) {
      return process.env.API_URL;
    }
    // Fallback to internal API
    return process.env.INTERNAL_API_URL || 'http://localhost:5000/api';
  }

  // Client-side fallback (shouldn't reach here if NEXT_PUBLIC_API_URL is set)
  return process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5000/api'
    : '/api';
}

export default resolveApiBaseUrl;
