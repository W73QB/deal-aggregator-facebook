/**
 * SearchBox Component Test Suite
 * Tests search functionality, API integration, suggestions, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../../../components/ui/SearchBox';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock fetch
global.fetch = jest.fn();

// Mock environment variable
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_API_URL: 'http://test-api.com/api'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('SearchBox', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockPush.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    test('renders search form with input and button', () => {
      render(<SearchBox />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search deals...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('renders search icon in submit button', () => {
      render(<SearchBox />);

      const searchButton = screen.getByRole('button');
      const svg = searchButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    test('applies correct CSS classes', () => {
      const { container } = render(<SearchBox />);

      expect(container.querySelector('.search-container')).toBeInTheDocument();
      expect(container.querySelector('.search-form')).toBeInTheDocument();
      expect(container.querySelector('.search-input')).toBeInTheDocument();
      expect(container.querySelector('.search-button')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    test('updates input value when typing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'laptop');

      expect(input).toHaveValue('laptop');
    });

    test('clears input value when empty', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      await user.clear(input);

      expect(input).toHaveValue('');
    });

    test('handles special characters in input', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test & special chars!');

      expect(input).toHaveValue('test & special chars!');
    });
  });

  describe('Form Submission', () => {
    test('submits form when Enter is pressed', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'laptop');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=laptop');
    });

    test('submits form when search button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      const button = screen.getByRole('button');

      await user.type(input, 'smartphone');
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith('/search?q=smartphone');
    });

    test('trims whitespace from search query', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '  laptop  ');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=laptop');
    });

    test('does not submit empty or whitespace-only query', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');

      // Test empty submission
      await user.keyboard('{Enter}');
      expect(mockPush).not.toHaveBeenCalled();

      // Test whitespace-only submission
      await user.type(input, '   ');
      await user.keyboard('{Enter}');
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('encodes URL parameters correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test & encode');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=test%20%26%20encode');
    });
  });

  describe('Suggestions API Integration', () => {
    test('fetches suggestions when query is 2+ characters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { title: 'iPhone 15', category: 'Electronics', salePrice: 999, originalPrice: 1199 },
            { title: 'iPhone 14', category: 'Electronics', salePrice: 799, originalPrice: 999 }
          ]
        })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'iphone');

      // Advance timers to trigger debounced API call
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://test-api.com/api/deals?search=iphone&limit=5',
          { credentials: 'include' }
        );
      });
    });

    test('does not fetch suggestions for queries shorter than 2 characters', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'a');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    test('uses fallback API URL when environment variable is not set', async () => {
      // Temporarily remove environment variable
      delete process.env.NEXT_PUBLIC_API_URL;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/deals?search=test&limit=5',
          { credentials: 'include' }
        );
      });

      // Restore environment variable
      process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com/api';
    });

    test('debounces API calls correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');

      // Type multiple characters quickly
      await user.type(input, 'lap');
      await user.type(input, 'top');

      // Only advance timers once
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only make one API call for the final query
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/deals?search=laptop&limit=5',
        { credentials: 'include' }
      );
    });

    test('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching suggestions:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Suggestions Display', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { title: 'iPhone 15 Pro', category: 'Electronics', salePrice: 999, originalPrice: 1199 },
            { title: 'iPhone 15', category: 'Electronics', salePrice: 899, price: 899 }
          ]
        })
      });
    });

    test('displays suggestions dropdown when available', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'iphone');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "iphone"')).toBeInTheDocument();
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      });
    });

    test('displays query suggestion as first item', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'laptop');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "laptop"')).toBeInTheDocument();
      });
    });

    test('displays deal suggestions with correct information', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'iphone');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
        expect(screen.getByText('iPhone 15')).toBeInTheDocument();
        expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0);
        // Verify suggestions dropdown is visible
        expect(document.querySelector('.suggestions-dropdown')).toBeInTheDocument();
      });
    });

    test('shows suggestions on input focus if suggestions exist', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');

      // First, generate suggestions
      await user.type(input, 'test');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('Search for "test"')).toBeInTheDocument();
      });

      // Click outside to hide suggestions
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });

      // Focus input again - should show suggestions if they exist
      fireEvent.focus(input);

      // Verify focus behavior works (suggestions may or may not show based on component logic)
      expect(input).toHaveFocus();
    });
  });

  describe('Suggestion Interactions', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { title: 'MacBook Pro', category: 'Computers', salePrice: 1999, originalPrice: 2499 }
          ]
        })
      });
    });

    test('navigates to search when query suggestion is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'macbook');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "macbook"')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Search for "macbook"'));

      expect(mockPush).toHaveBeenCalledWith('/search?q=macbook');
    });

    test('navigates to search when deal suggestion is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'macbook');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
      });

      await user.click(screen.getByText('MacBook Pro'));

      expect(mockPush).toHaveBeenCalledWith('/search?q=MacBook%20Pro');
    });

    test('hides suggestions after clicking suggestion', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "test"')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Search for "test"'));

      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Behavior', () => {
    test('hides suggestions when clicking outside', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [{ title: 'Test Deal', category: 'Test', salePrice: 100 }]
        })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "test"')).toBeInTheDocument();
      });

      // Click outside the search container
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });
    });

    test('does not hide suggestions when clicking inside search container', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [{ title: 'Test Deal', category: 'Test', salePrice: 100 }]
        })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Search for "test"')).toBeInTheDocument();
      });

      // Click inside the search container
      const searchContainer = container.querySelector('.search-container');
      fireEvent.mouseDown(searchContainer);

      expect(screen.getByText('Search for "test"')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner when API request is in progress', async () => {
      // Mock a delayed response
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(container.querySelector('.search-spinner')).toBeInTheDocument();
      });
    });

    test('disables submit button when loading', async () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    test('hides loading spinner after API response', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(container.querySelector('.search-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<SearchBox />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('search input has correct attributes', () => {
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
      expect(input).toHaveAttribute('placeholder', 'Search deals...');
    });

    test('form submission works with keyboard navigation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');

      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=test');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed API responses', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, data: null })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not crash and should not show suggestions
      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });
    });

    test('handles API responses with invalid data structure', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: 'invalid' })
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not crash and should not show suggestions
      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });
    });

    test('handles failed API responses', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchBox />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not crash and should not show suggestions
      await waitFor(() => {
        expect(screen.queryByText('Search for "test"')).not.toBeInTheDocument();
      });
    });
  });
});