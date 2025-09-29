/**
 * General API Client Hook
 * Reusable hook for making API requests to unified Express backend
 */

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}${endpoint}`;

      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      };

      const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      };

      console.log(`Making API request: ${requestOptions.method || 'GET'} ${url}`);

      const response = await fetch(url, requestOptions);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`Invalid JSON response from server`);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }

      if (data.success === false) {
        throw new Error(data.message || 'API request failed');
      }

      console.log(`✅ API request successful: ${url}`);
      return data;

    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Common HTTP methods
  const get = useCallback((endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return makeRequest(url, { method: 'GET' });
  }, [makeRequest]);

  const post = useCallback((endpoint, data) => {
    return makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [makeRequest]);

  const put = useCallback((endpoint, data) => {
    return makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [makeRequest]);

  const del = useCallback((endpoint) => {
    return makeRequest(endpoint, { method: 'DELETE' });
  }, [makeRequest]);

  // Health check method
  const healthCheck = useCallback(async () => {
    try {
      const data = await get('/health');
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }, [get]);

  return {
    loading,
    error,
    makeRequest,
    get,
    post,
    put,
    del,
    healthCheck,
  };
};

export default useApi;