/**
 * useDeals Hook Test Suite
 * Tests data fetching, error handling, and state management
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeals } from '../../hooks/useDeals';

// Mock global fetch
global.fetch = jest.fn();

// Mock AbortSignal.timeout
global.AbortSignal = {
  timeout: jest.fn(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    aborted: false,
    reason: undefined
  }))
};

// Mock useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true
  }))
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('useDeals', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Initial State', () => {
    test('returns initial state correctly', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: null,
          meta: null
        })
      });

      const { result } = renderHook(() => useDeals());

      // Check initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.deals).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.hasDeals).toBe(false);
      expect(result.current.isEmpty).toBe(false); // Not empty while loading

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Data Fetching', () => {
    test('fetches deals successfully', async () => {
      const mockDeals = [
        {
          id: 1,
          title: 'Great Deal',
          description: 'Amazing offer',
          image: 'https://example.com/image1.jpg',
          originalPrice: 100,
          salePrice: 80,
          discount: 20,
          savings: 20,
          rating: 4.5,
          category: 'Electronics',
          featured: true,
          store: 'TechStore',
          affiliateUrl: 'https://example.com/affiliate',
          tags: ['sale', 'electronics'],
          stockCount: 50,
          expiresAt: '2024-12-31T23:59:59Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockResponse = {
        success: true,
        data: mockDeals,
        pagination: { page: 1, totalPages: 1, totalItems: 1 },
        meta: { totalSavings: 20, averageRating: 4.5 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.deals).toHaveLength(1);
      expect(result.current.deals[0]).toMatchObject({
        id: 1,
        title: 'Great Deal',
        price: 80, // Should use salePrice as price
        seller: 'TechStore', // Should use store as seller
        badge: 'Featured' // Should set badge for featured deals
      });
      expect(result.current.hasDeals).toBe(true);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.totalDeals).toBe(20);
      expect(result.current.averageRating).toBe(4.5);
    });

    test('handles API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server Error' })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Server Error');
      expect(result.current.deals).toEqual([]);
      expect(result.current.hasDeals).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.deals).toEqual([]);
    });

    test('handles API success: false responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'API Error'
        })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.deals).toEqual([]);
    });
  });

  describe('Query String Building', () => {
    test('builds query string with filters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const filters = {
        category: 'Electronics',
        minPrice: 50,
        maxPrice: 200,
        featured: true,
        search: 'laptop'
      };

      renderHook(() => useDeals(filters));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=Electronics'),
          expect.any(Object)
        );
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('minPrice=50'),
        expect.any(Object)
      );
    });

    test('excludes empty and null filter values', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const filters = {
        category: 'Electronics',
        minPrice: '',
        maxPrice: null,
        search: undefined,
        featured: 'all'
      };

      renderHook(() => useDeals(filters));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('category=Electronics');
      expect(callUrl).not.toContain('minPrice');
      expect(callUrl).not.toContain('maxPrice');
      expect(callUrl).not.toContain('search');
      expect(callUrl).not.toContain('featured');
    });
  });

  describe('Refetch Functionality', () => {
    test('refetch updates deals with new filters', async () => {
      // Initial response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock refetch response
      const newMockDeals = [
        { id: 2, title: 'New Deal', salePrice: 60, store: 'NewStore', featured: false }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: newMockDeals,
          pagination: { page: 1, totalPages: 1, totalItems: 1 },
          meta: { totalSavings: 40 }
        })
      });

      // Trigger refetch
      await act(async () => {
        await result.current.refetch({ category: 'Books' });
      });

      await waitFor(() => {
        expect(result.current.deals).toHaveLength(1);
      });

      expect(result.current.deals[0].title).toBe('New Deal');
    });
  });

  describe('Get Deal By ID', () => {
    test('fetches single deal successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockDeal = { id: 1, title: 'Single Deal', price: 100 };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockDeal })
      });

      const deal = await act(async () => {
        return await result.current.getDealById(1);
      });

      expect(deal).toEqual(mockDeal);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/deals/1'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      );
    });

    test('handles single deal fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(
        act(async () => {
          return await result.current.getDealById(999);
        })
      ).rejects.toThrow('Failed to fetch deal 999');
    });
  });

  describe('Computed Values', () => {
    test('calculates isEmpty correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.hasDeals).toBe(false);
    });

    test('handles missing meta gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      const { result } = renderHook(() => useDeals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalDeals).toBe(0);
      expect(result.current.averageRating).toBe(0);
    });
  });

  describe('API Configuration', () => {
    test('uses correct API base URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      renderHook(() => useDeals());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('http://localhost:5000/api/deals'),
          expect.any(Object)
        );
      });
    });

    test('includes proper headers and credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: null, meta: null })
      });

      renderHook(() => useDeals());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
        );
      });
    });
  });
});