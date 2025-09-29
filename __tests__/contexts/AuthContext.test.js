/**
 * AuthContext Test Suite
 * Tests authentication state management and API interactions
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock fetch globally
global.fetch = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    configurable: true,
    writable: true
  });
});

// Custom render function with AuthProvider
const renderWithAuthProvider = (ui, options = {}) => {
  const Wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  return render(ui, { wrapper: Wrapper, ...options });
};

// Test component to access auth context
function TestComponent() {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="loading-status">
        {auth.isLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="user-email">
        {auth.user?.email || 'no-user'}
      </div>
      <div data-testid="error-message">
        {auth.error || 'no-error'}
      </div>
      <button
        data-testid="login-btn"
        onClick={() => auth.login('test@example.com', 'password')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Provider and Hook', () => {
    test('provides initial state correctly', async () => {
      // Mock initial auth check failure
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not authenticated' })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      });
    });
  });

  describe('Authentication Flow', () => {
    test('handles successful login', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };

      // Mock initial auth check (not authenticated)
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not authenticated' })
      });

      // Mock successful login
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockUser }
        })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      // Perform login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        })
      );
    });

    test('handles login failure', async () => {
      // Mock initial auth check
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not authenticated' })
      });

      // Mock failed login
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid credentials'
        })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      });
    });

    test('handles network errors during login', async () => {
      // Mock initial auth check
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not authenticated' })
      });

      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network error. Please try again.');
      });
    });
  });

  describe('Logout', () => {
    test('handles logout correctly', async () => {
      // Mock initial authenticated state
      const mockUser = { id: 1, email: 'test@example.com' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockUser }
        })
      });

      // Mock logout request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // Wait for initial auth check
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      });
    });
  });

  describe('Initial Auth Check', () => {
    test('recognizes authenticated user on mount', async () => {
      const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockUser }
        })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      });
    });

    test('handles failed auth check on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Token expired' })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('Token Refresh', () => {
    test('auto-refreshes token for authenticated users', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      // Mock initial auth check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockUser }
        })
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Mock token refresh
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // Fast-forward 10 minutes to trigger token refresh
      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/auth/refresh',
          expect.objectContaining({
            method: 'POST',
            credentials: 'include'
          })
        );
      });
    });
  });
});
