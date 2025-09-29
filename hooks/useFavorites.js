/**
 * Favorites Management Hook
 * Handles user's favorite deals with optimistic updates
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle favorite status for a deal
  const toggleFavorite = useCallback(async (dealId, currentStatus) => {
    if (!isAuthenticated) {
      setError('Please log in to manage favorites');
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      setError(null);

      const method = currentStatus ? 'DELETE' : 'POST';
      const url = `${API_BASE_URL}/deals/${dealId}/favorite`;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          favorited: data.data.favorited,
          dealId: data.data.dealId,
        };
      } else {
        const errorMessage = data.message || 'Failed to update favorite';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add deal to favorites
  const addFavorite = useCallback(async (dealId) => {
    return await toggleFavorite(dealId, false);
  }, [toggleFavorite]);

  // Remove deal from favorites
  const removeFavorite = useCallback(async (dealId) => {
    return await toggleFavorite(dealId, true);
  }, [toggleFavorite]);

  // Get user's favorite deals
  const getFavorites = useCallback(async (params = {}) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/deals/favorites${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data,
          pagination: data.pagination,
          meta: data.meta,
        };
      } else {
        const errorMessage = data.message || 'Failed to fetch favorites';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,

    // Actions
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getFavorites,
    clearError,

    // Computed
    canUseFavorites: isAuthenticated,
  };
};

export default useFavorites;