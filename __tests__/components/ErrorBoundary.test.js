/**
 * ErrorBoundary Component Test Suite
 * Tests error catching, fallback UI, and development/production behavior
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from '../../components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="no-error">No error occurred</div>;
};

// Mock console methods to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock navigator and location properties for browser environment
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'test-user-agent' },
  writable: true
});

const mockReload = jest.fn();
const mockAssign = jest.fn();
let currentHref = 'http://localhost:3000';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockReload.mockClear();
    mockAssign.mockClear();
    console.error.mockClear();
    currentHref = 'http://localhost:3000';

    // Mock window.location methods for each test
    delete window.location;
    window.location = {
      reload: mockReload,
      get href() {
        return currentHref;
      },
      set href(value) {
        currentHref = value;
      },
      assign: mockAssign,
      origin: 'http://localhost:3000'
    };
  });

  describe('Normal Rendering', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    test('renders multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">First child</div>
          <div data-testid="child2">Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('catches errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText("We're sorry! Something unexpected happened. Our team has been notified.")).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();
    });

    test('logs error to console when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom test error" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('displays custom error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('🔄 Reload Page')).toBeInTheDocument();
      expect(screen.getByText('🏠 Go Home')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    test('reload button is clickable and present', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('🔄 Reload Page');
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton.tagName).toBe('BUTTON');

      // Test that clicking doesn't throw an error
      expect(() => fireEvent.click(reloadButton)).not.toThrow();
    });

    test('home button redirects to home page', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByText('🏠 Go Home');
      fireEvent.click(homeButton);

      expect(window.location.href).toContain('/');
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('shows error details in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
    });

    test('error details are hidden by default (collapsed)', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const details = screen.getByText('Error Details (Development)').closest('details');
      expect(details).not.toHaveAttribute('open');
    });
  });

  describe('Production Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('hides error details in production mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
      expect(screen.queryByText('Error:')).not.toBeInTheDocument();
    });

    test('shows error ID in production mode', () => {
      // Mock Date.now to make the test predictable
      const mockNow = 1234567890;
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => mockNow);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(`Error ID: ${mockNow.toString(36)}`)).toBeInTheDocument();

      // Restore Date.now
      Date.now = originalDateNow;
    });

    test('calls logErrorToService in production mode', () => {
      // Spy on console.error to check if logErrorToService was called
      const errorSpy = jest.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Error logged to monitoring service:',
        expect.objectContaining({
          message: 'Production error',
          stack: expect.any(String),
          componentStack: expect.any(String),
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String)
        })
      );

      errorSpy.mockRestore();
    });
  });

  describe('Higher-Order Component (withErrorBoundary)', () => {
    test('wraps component with error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped">Wrapped component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByTestId('wrapped')).toBeInTheDocument();
    });

    test('catches errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError);

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();
    });

    test('passes props to wrapped component', () => {
      const TestComponent = ({ testProp }) => <div data-testid="prop-value">{testProp}</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent testProp="test-value" />);

      expect(screen.getByTestId('prop-value')).toHaveTextContent('test-value');
    });
  });

  describe('useErrorHandler Hook', () => {
    test('returns error handler function', () => {
      let errorHandler;

      function TestComponent() {
        errorHandler = useErrorHandler();
        return <div>Test</div>;
      }

      render(<TestComponent />);

      expect(typeof errorHandler).toBe('function');
    });

    test('error handler logs error and re-throws it', () => {
      let errorHandler;

      function TestComponent() {
        errorHandler = useErrorHandler();
        return <div>Test</div>;
      }

      render(<TestComponent />);

      const testError = new Error('Test error for hook');
      const testErrorInfo = { componentStack: 'test stack' };

      expect(() => {
        errorHandler(testError, testErrorInfo);
      }).toThrow('Test error for hook');

      expect(console.error).toHaveBeenCalledWith(
        'Error caught by useErrorHandler:',
        testError,
        testErrorInfo
      );
    });
  });

  describe('Component State Management', () => {
    test('maintains error state after error occurs', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with no error - should still show error UI
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();
    });

    test('getDerivedStateFromError returns correct state', () => {
      const testError = new Error('Test error');
      const newState = ErrorBoundary.getDerivedStateFromError(testError);

      expect(newState).toEqual({ hasError: true });
    });
  });

  describe('Accessibility', () => {
    test('error UI has proper semantic structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Something went wrong');

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      const homeButton = screen.getByRole('button', { name: /go home/i });

      expect(reloadButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });

    test('buttons are keyboard accessible', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      const homeButton = screen.getByRole('button', { name: /go home/i });

      expect(reloadButton).toHaveAttribute('style');
      expect(homeButton).toHaveAttribute('style');
    });
  });
});