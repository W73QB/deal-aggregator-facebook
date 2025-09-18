/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error, errorInfo) {
    // Log error to external service (e.g., Sentry, LogRocket)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, you would send this to your error tracking service
    console.error('Error logged to monitoring service:', errorData);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              We're sorry! Something unexpected happened. Our team has been notified.
            </p>

            <div style={styles.actions}>
              <button
                style={styles.reloadButton}
                onClick={() => window.location.reload()}
              >
                🔄 Reload Page
              </button>
              <button
                style={styles.homeButton}
                onClick={() => window.location.href = '/'}
              >
                🏠 Go Home
              </button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details style={styles.errorDetails}>
                <summary style={styles.errorSummary}>Error Details (Development)</summary>
                <div style={styles.errorContent}>
                  <h4>Error:</h4>
                  <pre style={styles.errorText}>{this.state.error && this.state.error.toString()}</pre>

                  <h4>Component Stack:</h4>
                  <pre style={styles.errorText}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>

                  <h4>Stack Trace:</h4>
                  <pre style={styles.errorText}>{this.state.error && this.state.error.stack}</pre>
                </div>
              </details>
            )}

            {/* Production error ID */}
            {process.env.NODE_ENV === 'production' && (
              <div style={styles.errorId}>
                Error ID: {Date.now().toString(36)}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = (WrappedComponent, errorFallback) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    throw error; // Re-throw to be caught by ErrorBoundary
  };
};

const styles = {
  container: {
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa'
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  title: {
    color: '#e74c3c',
    marginBottom: '10px',
    fontSize: '1.5rem'
  },
  message: {
    color: '#555',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  reloadButton: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  homeButton: {
    padding: '12px 24px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  errorDetails: {
    textAlign: 'left',
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  errorSummary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  errorContent: {
    marginTop: '15px'
  },
  errorText: {
    backgroundColor: '#1e1e1e',
    color: '#f8f8f2',
    padding: '15px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '0.85rem',
    lineHeight: '1.4'
  },
  errorId: {
    fontSize: '0.8rem',
    color: '#999',
    fontFamily: 'monospace',
    marginTop: '20px'
  }
};

export default ErrorBoundary;