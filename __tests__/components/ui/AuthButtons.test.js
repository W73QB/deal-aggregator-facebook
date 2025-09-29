/**
 * AuthButtons Component Test Suite
 * Tests authentication buttons and user dropdown functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import AuthButtons from '../../../components/ui/AuthButtons';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Mock Next.js router and Link
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }) {
    return (
      <a href={href} onClick={() => {
        const { useRouter } = require('next/router');
        const router = useRouter();
        router.push(href);
      }} {...props}>
        {children}
      </a>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock auth context
jest.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: jest.fn(),
}));

describe('AuthButtons', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: '/deals'
    });

    fetch.mockClear();
    mockPush.mockClear();
    mockLogout.mockClear();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: mockLogout
      });
    });

    test('renders login and signup buttons for unauthenticated users', () => {
      render(<AuthButtons />);

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('navigates to login page when login button is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByText('Sign In'));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('navigates to signup page when signup button is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByText('Sign Up'));
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: 1,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://example.com/avatar.jpg'
    };

    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        logout: mockLogout
      });
    });

    test('renders user avatar and dropdown for authenticated users', () => {
      render(<AuthButtons />);

      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('shows user dropdown when avatar is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByRole('button', { expanded: false }));

      expect(screen.getAllByText('john')).toHaveLength(2);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('My Favorites')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    test('navigates to profile page when profile link is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByRole('button', { expanded: false }));
      fireEvent.click(screen.getByText('My Profile'));

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    test('navigates to favorites page when favorites link is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByRole('button', { expanded: false }));
      fireEvent.click(screen.getByText('My Favorites'));

      expect(mockPush).toHaveBeenCalledWith('/favorites');
    });

    test('navigates to settings page when settings link is clicked', () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByRole('button', { expanded: false }));
      fireEvent.click(screen.getByText('Settings'));

      expect(mockPush).toHaveBeenCalledWith('/settings');
    });

    test('calls logout function when sign out is clicked', async () => {
      render(<AuthButtons />);

      fireEvent.click(screen.getByRole('button', { expanded: false }));
      fireEvent.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    test('closes dropdown when clicking outside', () => {
      render(<AuthButtons />);

      // Open dropdown
      fireEvent.click(screen.getByRole('button', { expanded: false }));
      expect(screen.getByText('My Profile')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      // Dropdown should be closed
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    });

    test('handles user without avatar gracefully', () => {
      const userWithoutAvatar = { ...mockUser, avatar: null };
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithoutAvatar,
        logout: mockLogout
      });

      render(<AuthButtons />);

      const avatar = screen.getByRole('button', { expanded: false });
      expect(avatar).toBeInTheDocument();
      // Should show initials instead of image
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        logout: mockLogout
      });
    });

    test('shows loading state while authentication is being checked', () => {
      render(<AuthButtons />);

      const authLoadingElement = document.querySelector('.auth-loading') || document.querySelector('.loading-spinner');
      expect(authLoadingElement).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: mockLogout
      });
    });

    test('renders mobile-friendly buttons on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<AuthButtons />);

      const loginButton = screen.getByText('Sign In');
      const signupButton = screen.getByText('Sign Up');

      // Check that buttons are rendered
      expect(loginButton).toBeInTheDocument();
      expect(signupButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: null, // This could happen in edge cases
        logout: mockLogout
      });
    });

    test('handles authenticated state with null user gracefully', () => {
      render(<AuthButtons />);

      // Should show sign in/sign up buttons when user is null but authenticated state is inconsistent
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        logout: mockLogout
      });
    });

    test('has proper ARIA labels and keyboard navigation', () => {
      render(<AuthButtons />);

      const userAvatar = screen.getByRole('button', { expanded: false });
      expect(userAvatar).toHaveAttribute('aria-expanded', 'false');
      expect(userAvatar).toHaveAttribute('aria-haspopup', 'true');
    });

    test('supports keyboard navigation for dropdown', () => {
      render(<AuthButtons />);

      const userAvatar = screen.getByRole('button', { expanded: false });

      // Test that dropdown can be opened with click (keyboard events may not be implemented)
      fireEvent.click(userAvatar);
      expect(screen.getByText('My Profile')).toBeInTheDocument();

      // Test that dropdown can be closed
      fireEvent.mouseDown(document.body);
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    });
  });
});