import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Check if token is present
  useEffect(() => {
    if (!token && router.isReady) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token, router.isReady]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message ||
          'Password reset successfully! You can now log in with your new password.'
        );
        setFormData({ password: '', confirmPassword: '' });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. The token may be expired or invalid.');
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
        <title>Reset Password - DealRadarUS</title>
        <meta name="description" content="Reset your DealRadarUS password with your secure reset token." />
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
              <h1>Reset Your Password</h1>
              <p>Enter your new password below to complete the reset process.</p>
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
                <div>
                  <p>{successMessage}</p>
                  <p className="redirect-notice">Redirecting to login page in 3 seconds...</p>
                </div>
              </div>
            )}

            {!successMessage && token && (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <div className="input-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your new password"
                      required
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        {showPassword ? (
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        ) : (
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="password-hints">
                    <p>Password must contain:</p>
                    <ul>
                      <li className={formData.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                      <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>One uppercase letter</li>
                      <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>One lowercase letter</li>
                      <li className={/\d/.test(formData.password) ? 'valid' : ''}>One number</li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                      required
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        {showConfirmPassword ? (
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        ) : (
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="password-mismatch">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isSubmitting || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                >
                  {isSubmitting ? (
                    <>
                      <div className="button-spinner"></div>
                      Resetting password...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            {!token && router.isReady && (
              <div className="no-token-actions">
                <Link href="/forgot-password" className="auth-submit-outline">
                  Request New Reset Link
                </Link>
              </div>
            )}

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link href="/login" className="auth-link">
                  Back to Sign In
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

        .redirect-notice {
          margin-top: 8px;
          font-size: 12px;
          color: #059669;
          font-style: italic;
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

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .password-hints {
          margin-top: 8px;
          font-size: 12px;
          color: #6b7280;
        }

        .password-hints p {
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .password-hints ul {
          margin: 0;
          padding-left: 16px;
          list-style: none;
        }

        .password-hints li {
          position: relative;
          padding-left: 16px;
          margin-bottom: 2px;
        }

        .password-hints li:before {
          content: '✗';
          position: absolute;
          left: 0;
          color: #dc2626;
        }

        .password-hints li.valid:before {
          content: '✓';
          color: #059669;
        }

        .password-mismatch {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #dc2626;
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
          text-decoration: none;
        }

        .auth-submit:hover:not(:disabled) {
          background: #1557b0;
        }

        .auth-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .auth-submit-outline {
          background: transparent;
          color: #1A73E8;
          border: 2px solid #1A73E8;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          text-decoration: none;
        }

        .auth-submit-outline:hover {
          background: #1A73E8;
          color: white;
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

        .no-token-actions {
          margin-bottom: 24px;
        }

        .auth-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .auth-footer p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
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