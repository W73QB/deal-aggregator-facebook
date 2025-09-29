import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message ||
          'Password reset instructions have been sent to your email address. Please check your inbox and follow the link to reset your password.'
        );
        setEmail(''); // Clear the form
      } else {
        setError(data.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Forgot Password - DealRadarUS</title>
        <meta name="description" content="Reset your DealRadarUS password. Enter your email to receive password reset instructions." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Link href="/" className="auth-logo">
                <svg width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1A73E8"/>
                      <stop offset="100%" stopColor="#0056b3"/>
                    </linearGradient>
                  </defs>
                  <circle cx="30" cy="30" r="25" fill="none" stroke="url(#logoGradient)" strokeWidth="3"/>
                  <circle cx="30" cy="30" r="15" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7"/>
                  <circle cx="30" cy="30" r="3" fill="url(#logoGradient)"/>
                </svg>
                <span>DealRadarUS</span>
              </Link>
              <h1>Forgot Password?</h1>
              <p>No worries! Enter your email and we'll send you reset instructions.</p>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="auth-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {successMessage}
              </div>
            )}

            {!successMessage && (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                  </div>
                  <p className="form-help">
                    We'll send password reset instructions to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <>
                      <div className="button-spinner"></div>
                      Sending instructions...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      Send Reset Instructions
                    </>
                  )}
                </button>
              </form>
            )}

            {successMessage && (
              <div className="success-actions">
                <p className="resend-info">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setSuccessMessage('');
                      setError('');
                    }}
                    className="resend-link"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link href="/login" className="auth-link">
                  Back to Sign In
                </Link>
              </p>
              <p>
                Don't have an account?{' '}
                <Link href="/signup" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
        }

        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 40px;
          margin: 0 auto;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1A73E8;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .auth-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
        }

        .auth-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          border: 1px solid #fecaca;
        }

        .auth-success {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #f0fdf4;
          color: #166534;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          border: 1px solid #bbf7d0;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #6b7280;
          z-index: 1;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #1A73E8;
          box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
        }

        .input-wrapper input:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-help {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .auth-submit {
          background: #1A73E8;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .auth-submit:hover:not(:disabled) {
          background: #1557b0;
        }

        .auth-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .success-actions {
          margin-bottom: 24px;
        }

        .resend-info {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .resend-link {
          background: none;
          border: none;
          color: #1A73E8;
          cursor: pointer;
          text-decoration: underline;
          font-size: inherit;
          padding: 0;
        }

        .resend-link:hover {
          color: #1557b0;
        }

        .auth-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .auth-footer p {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .auth-footer p:last-child {
          margin-bottom: 0;
        }

        .auth-link {
          color: #1A73E8;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .auth-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #1A73E8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 16px;
          }

          .auth-card {
            padding: 24px;
          }

          .auth-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}