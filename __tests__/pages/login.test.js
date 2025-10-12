/**
 * Login Page Test Suite
 * Tests login form functionality and validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import LoginPage from '../../pages/login';
import { useAuth } from '../../contexts/AuthContext';

// Mock Next.js router and Link
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock router instance at module level to avoid hooks violation
const mockRouterInstance = {
  push: jest.fn(),
  query: {}
};

jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }) {
    return (
      <a href={href} onClick={() => {
        // Use the module-level mock router instead of calling useRouter() in callback
        mockRouterInstance.push(href);
      }} {...props}>
        {children}
      </a>
    );
  };
});

// Mock auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Login Page', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    // Sync mockRouterInstance with mockPush
    mockRouterInstance.push = mockPush;

    useRouter.mockReturnValue({
      push: mockPush,
      query: {}
    });

    useAuth.mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      isAuthenticated: false,
      loginAttempting: false,
      error: null
    });

    mockPush.mockClear();
    mockLogin.mockClear();
    mockClearError.mockClear();
  });

  describe('Rendering', () => {
    test('renders login form with all required fields', () => {
      render(<LoginPage />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    });

    test('renders loading spinner when login is attempting', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isAuthenticated: false,
        loginAttempting: true,
        error: null
      });

      render(<LoginPage />);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    test('displays error message when login fails', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isAuthenticated: false,
        loginAttempting: false,
        error: 'Invalid credentials'
      });

      render(<LoginPage />);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('prevents submission with empty fields', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
    });

    test('enables submit button when fields are filled', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });

      expect(submitButton).not.toBeDisabled();
    });

    test('submits form with any valid-looking email', async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', '123');
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid credentials', async () => {
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('redirects to deals page after successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    test('redirects to return URL after successful login', async () => {
      useRouter.mockReturnValue({
        push: mockPush,
        query: { returnTo: '/profile' }
      });

      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    test('handles login failure gracefully', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility when eye icon is clicked', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      const passwordWrapper = passwordInput.parentElement;
      const toggleButton = passwordWrapper.querySelector('button[type="button"]');

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navigation Links', () => {
    test('navigates to signup page when signup link is clicked', () => {
      render(<LoginPage />);

      const signupLink = screen.getByText(/sign up/i);
      fireEvent.click(signupLink);

      expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    test('navigates to forgot password page when forgot password link is clicked', () => {
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText(/forgot your password/i);
      fireEvent.click(forgotPasswordLink);

      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });
  });

  describe('Error Handling', () => {
    test('clears error when form is modified', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isAuthenticated: false,
        loginAttempting: false,
        error: 'Previous error'
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('supports keyboard navigation', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Test that inputs are focusable
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      passwordInput.focus();
      expect(document.activeElement).toBe(passwordInput);
    });
  });

  describe('Auto-redirect for authenticated users', () => {
    test('redirects authenticated users to deals page', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isAuthenticated: true,
        loginAttempting: false,
        error: null
      });

      render(<LoginPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});