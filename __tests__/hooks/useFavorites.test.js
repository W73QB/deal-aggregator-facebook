/**
 * useFavorites Hook Test Suite
 * Tests favorites management functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';

// Mock auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('useFavorites', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({
      isAuthenticated: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFavorite', () => {
    test('adds deal to favorites when not currently favorited', async () => {
      const mockResponse = {
        success: true,
        data: {
          favorited: true,
          dealId: 'deal-123'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', false);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/deals/deal-123/favorite',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(response).toEqual({
        success: true,
        favorited: true,
        dealId: 'deal-123'
      });
    });

    test('removes deal from favorites when currently favorited', async () => {
      const mockResponse = {
        success: true,
        data: {
          favorited: false,
          dealId: 'deal-123'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', true);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/deals/deal-123/favorite',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include'
        })
      );

      expect(response).toEqual({
        success: true,
        favorited: false,
        dealId: 'deal-123'
      });
    });

    test('returns error when user is not authenticated', async () => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', false);
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(response).toEqual({
        success: false,
        error: 'Authentication required'
      });
      expect(result.current.error).toBe('Please log in to manage favorites');
    });

    test('handles API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Deal not found'
        })
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('invalid-deal', false);
      });

      expect(response).toEqual({
        success: false,
        error: 'Deal not found'
      });
      expect(result.current.error).toBe('Deal not found');
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', false);
      });

      expect(response).toEqual({
        success: false,
        error: 'Network error. Please try again.'
      });
      expect(result.current.error).toBe('Network error. Please try again.');
    });

    test('sets loading state correctly during API call', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      fetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useFavorites());

      // Start the async operation
      act(() => {
        result.current.toggleFavorite('deal-123', false);
      });

      // Check loading state is true
      expect(result.current.loading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({
            success: true,
            data: { favorited: true, dealId: 'deal-123' }
          })
        });
      });

      // Check loading state is false
      expect(result.current.loading).toBe(false);
    });

    test('clears error state on successful operation', async () => {
      const { result } = renderHook(() => useFavorites());

      // First, set an error state
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Some error'
        })
      });

      await act(async () => {
        await result.current.toggleFavorite('deal-123', false);
      });

      expect(result.current.error).toBe('Some error');

      // Then, perform a successful operation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { favorited: true, dealId: 'deal-123' }
        })
      });

      await act(async () => {
        await result.current.toggleFavorite('deal-456', false);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Initial State', () => {
    test('provides correct initial state', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.toggleFavorite).toBe('function');
    });
  });

  describe('Function Stability', () => {
    test('toggleFavorite function is stable across renders', () => {
      const { result, rerender } = renderHook(() => useFavorites());

      const firstRenderFunction = result.current.toggleFavorite;

      rerender();

      const secondRenderFunction = result.current.toggleFavorite;

      expect(firstRenderFunction).toBe(secondRenderFunction);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty response data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', false);
      });

      expect(response).toEqual({
        success: true,
        favorited: undefined,
        dealId: undefined
      });
    });

    test('handles malformed JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const { result } = renderHook(() => useFavorites());

      let response;
      await act(async () => {
        response = await result.current.toggleFavorite('deal-123', false);
      });

      expect(response).toEqual({
        success: false,
        error: 'Network error. Please try again.'
      });
    });
  });
});