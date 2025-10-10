/**
 * Determine the base URL for API calls across environments.
 * Prefers explicit public config, then SSR internal endpoint,
 * finally falling back to development or relative production paths.
 */

export function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';
  }

  return process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5000/api'
    : '/api';
}

export default resolveApiBaseUrl;
