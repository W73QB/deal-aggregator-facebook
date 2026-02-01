import axios from 'axios';
import { resolveApiBaseUrl } from './apiConfig';

// Set base URL for axios requests using unified resolver
const resolvedBase = resolveApiBaseUrl();
axios.defaults.baseURL = resolvedBase;

// Enable credentials for cross-origin requests
axios.defaults.withCredentials = true;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor to add any additional headers
axios.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HTTP] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('[HTTP] Unauthorized access detected - user may need to login');
      
      // Emit custom event for authentication error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: { error: error.response }
        }));
      }
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('[HTTP] Server error:', error.response.status, error.response.statusText);
    } else if (!error.response) {
      // Handle network errors
      console.error('[HTTP] Network error - server may be unavailable');
    }
    
    return Promise.reject(error);
  }
);

export default axios;
