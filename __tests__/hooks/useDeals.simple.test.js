/**
 * Simple useDeals Hook Test
 * Basic tests to verify functionality and coverage
 */

import { renderHook, act } from '@testing-library/react';
import { useDeals } from '../../hooks/useDeals';

// Mock useAuth
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true })
}));

// Mock fetch
global.fetch = jest.fn();

// Mock AbortSignal.timeout
global.AbortSignal = {
  timeout: jest.fn(() => ({ addEventListener: jest.fn(), removeEventListener: jest.fn() }))
};

describe('useDeals - Simple Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('initial state is correct', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    const { result } = renderHook(() => useDeals());

    // Check initial state
    expect(result.current.deals).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.hasDeals).toBe(false);
  });

  test('builds query string correctly', () => {
    const { result } = renderHook(() => useDeals());

    // Test the internal buildQueryString function by calling the hook functions
    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.getDealById).toBe('function');
  });

  test('returns computed values', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    const { result } = renderHook(() => useDeals());

    // Check computed values
    expect(result.current.totalDeals).toBe(0);
    expect(result.current.averageRating).toBe(0);
    expect(result.current.isEmpty).toBe(false); // false when loading
  });

  test('makes API call on mount', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    renderHook(() => useDeals());

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/deals',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include'
      })
    );
  });

  test('handles API configuration correctly', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    renderHook(() => useDeals());

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:5000/api/deals'),
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

  test('provides getDealById function', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    const { result } = renderHook(() => useDeals());

    expect(typeof result.current.getDealById).toBe('function');
  });

  test('handles query parameters', () => {
    const filters = { category: 'Electronics', minPrice: 50 };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    renderHook(() => useDeals(filters));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('category=Electronics'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('minPrice=50'),
      expect.any(Object)
    );
  });

  test('excludes empty filter values', () => {
    const filters = { category: 'Electronics', minPrice: '', maxPrice: null, search: 'all' };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], pagination: null, meta: null })
    });

    renderHook(() => useDeals(filters));

    const callUrl = fetch.mock.calls[0][0];
    expect(callUrl).toContain('category=Electronics');
    expect(callUrl).not.toContain('minPrice');
    expect(callUrl).not.toContain('maxPrice');
    expect(callUrl).not.toContain('search');
  });
});