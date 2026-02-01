/**
 * Professional Data Fetching Hook for Deals
 * Connects to unified Express backend with proper error handling
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resolveApiBaseUrl } from '../lib/utils/apiConfig';

const DEFAULT_FILTERS = {};

export const useDeals = (filters = DEFAULT_FILTERS) => {
  useAuth();
  const API_BASE_URL = resolveApiBaseUrl(); // Resolve at runtime, not module load time
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [meta, setMeta] = useState(null);

  // Stabilize filters object to prevent infinite re-renders
  const stableFilters = useMemo(() => filters ?? DEFAULT_FILTERS, [filters]);

  const buildQueryString = useCallback((params) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 'all') {
        searchParams.append(key, value);
      }
    });

    return searchParams.toString();
  }, []); // Empty dependency array since this function doesn't depend on external values

  const fetchDeals = useCallback(async (requestFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        ...stableFilters,
        ...requestFilters
      };

      const queryString = buildQueryString(queryParams);
      const url = `${API_BASE_URL}/deals${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching deals from:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include auth cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch deals`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || 'API returned error');
      }

      // Transform API response to match frontend expectations
      const transformedDeals = data.data.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        image: deal.image,
        originalPrice: deal.originalPrice,
        salePrice: deal.salePrice,
        price: deal.salePrice, // Backward compatibility
        discount: deal.discount,
        savings: deal.savings,
        rating: deal.rating,
        category: deal.category,
        featured: deal.featured,
        store: deal.store,
        seller: deal.store, // Backward compatibility
        affiliateUrl: deal.affiliateUrl,
        tags: deal.tags,
        stockCount: deal.stockCount,
        expiresAt: deal.expiresAt,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
        badge: deal.featured ? 'Featured' : null,
      }));

      setDeals(transformedDeals);
      setPagination(data.pagination);
      setMeta(data.meta);

      console.log(`✅ Successfully fetched ${transformedDeals.length} deals`);

    } catch (error) {
      console.error('Error fetching deals:', error);
      setError(error.message);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [stableFilters, buildQueryString, API_BASE_URL]);

  // Initial fetch
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Manual refetch function
  const refetch = useCallback((newFilters = {}) => {
    return fetchDeals(newFilters);
  }, [fetchDeals]);

  // Get deal by ID
  const getDealById = useCallback(async (dealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
        method: 'GET',
        credentials: 'include', // Include auth cookies
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deal ${dealId}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error fetching deal ${dealId}:`, error);
      throw error;
    }
  }, [API_BASE_URL]);

  return {
    deals,
    loading,
    error,
    pagination,
    meta,
    refetch,
    getDealById,
    // Computed values for convenience
    totalDeals: pagination?.total ?? deals.length,
    averageRating: meta?.averageRating || 0,
    hasDeals: deals.length > 0,
    isEmpty: !loading && deals.length === 0,
  };
};

export default useDeals;
