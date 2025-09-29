/**
 * Custom Error Page
 * Handles 404, 500, and other HTTP errors gracefully
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

function Error({ statusCode, hasGetInitialPropsRun, err }) {
  // Log errors to console in development
  if (process.env.NODE_ENV === 'development' && err) {
    console.error('Error page triggered:', err);
  }

  const getErrorMessage = (statusCode) => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Page Not Found',
          message: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
          suggestion: 'Check the URL for typos or browse our latest deals.'
        };
      case 500:
        return {
          title: 'Internal Server Error',
          message: 'Something went wrong on our end. Our team has been notified and is working to fix this.',
          suggestion: 'Please try again in a few minutes.'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: 'Our servers are temporarily unavailable due to maintenance or high traffic.',
          suggestion: 'Please try again in a few minutes.'
        };
      default:
        return {
          title: 'An Error Occurred',
          message: `An error ${statusCode} occurred on the server.`,
          suggestion: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const errorInfo = getErrorMessage(statusCode);

  return (
    <>
      <Head>
        <title>{statusCode} - {errorInfo.title} | DealRadar US</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={`${statusCode} error - ${errorInfo.message}`} />
      </Head>

      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.errorCode}>{statusCode}</div>
          <h1 style={styles.title}>{errorInfo.title}</h1>
          <p style={styles.message}>{errorInfo.message}</p>
          <p style={styles.suggestion}>{errorInfo.suggestion}</p>

          <div style={styles.actions}>
            <Link href="/" style={styles.homeButton}>
              🏠 Back to Home
            </Link>
            <Link href="/deals" style={styles.dealsButton}>
              🎯 Browse Deals
            </Link>
            {statusCode >= 500 && (
              <Link href="/contact" style={styles.contactButton}>
                📧 Contact Support
              </Link>
            )}
          </div>

          {/* Help section */}
          <div style={styles.helpSection}>
            <h3>Quick Links</h3>
            <ul style={styles.helpLinks}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Deal Blog</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
              <li><a href="mailto:support@dealradarus.com">Email Support</a></li>
            </ul>
          </div>

          {/* Error ID for debugging (production only) */}
          {process.env.NODE_ENV === 'production' && (
            <div style={styles.errorId}>
              Error ID: {Date.now().toString(36)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  // Log errors in production for monitoring
  if (process.env.NODE_ENV === 'production' && err) {
    console.error('Production error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  return { statusCode };
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  errorCode: {
    fontSize: '6rem',
    fontWeight: 'bold',
    color: '#e74c3c',
    margin: '0',
    lineHeight: '1'
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: '20px 0 10px 0'
  },
  message: {
    fontSize: '1.1rem',
    color: '#555',
    margin: '0 0 10px 0',
    lineHeight: '1.5'
  },
  suggestion: {
    fontSize: '1rem',
    color: '#777',
    margin: '0 0 30px 0',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '40px'
  },
  homeButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  dealsButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#e74c3c',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  contactButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#95a5a6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  helpSection: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid #eee'
  },
  helpLinks: {
    listStyle: 'none',
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  errorId: {
    marginTop: '30px',
    fontSize: '0.8rem',
    color: '#999',
    fontFamily: 'monospace'
  }
};

export default Error;