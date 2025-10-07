import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

import { getApiBase } from '../lib/apiClient';

export default function Settings() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    deal_alerts: true,
    newsletter_subscribed: false,
    privacy_profile: 'private'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = getApiBase();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Initialize preferences with user data
  useEffect(() => {
    if (user) {
      setPreferences({
        email_notifications: user.email_notifications ?? true,
        deal_alerts: user.deal_alerts ?? true,
        newsletter_subscribed: user.newsletter_subscribed || false,
        privacy_profile: user.privacy_profile || 'private'
      });
    }
  }, [user]);

  const handlePreferenceChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Logout and redirect
        await logout();
        router.push('/');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Account Settings - DealRadarUS</title>
        <meta name="description" content="Manage your DealRadarUS account settings and preferences." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="settings-page">
        <div className="container">
          <div className="settings-header">
            <h1>Account Settings</h1>
            <p>Manage your preferences and account options</p>
          </div>

          <div className="settings-content">
            <div className="settings-main">
              {/* Notifications Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>Notifications</h2>
                  <p>Choose what notifications you want to receive</p>
                </div>

                {success && (
                  <div className="alert alert-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {success}
                  </div>
                )}

                {error && (
                  <div className="alert alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Email Notifications</h3>
                      <p>Receive important account updates via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.email_notifications}
                        onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Deal Alerts</h3>
                      <p>Get notified about new deals matching your interests</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.deal_alerts}
                        onChange={(e) => handlePreferenceChange('deal_alerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Newsletter</h3>
                      <p>Weekly newsletter with curated deals and tips</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.newsletter_subscribed}
                        onChange={(e) => handlePreferenceChange('newsletter_subscribed', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="section-actions">
                  <button
                    onClick={handleSavePreferences}
                    className="save-button"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="button-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>Privacy</h2>
                  <p>Control your privacy and data sharing preferences</p>
                </div>

                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Profile Visibility</h3>
                      <p>Who can see your profile and activity</p>
                    </div>
                    <select
                      value={preferences.privacy_profile}
                      onChange={(e) => handlePreferenceChange('privacy_profile', e.target.value)}
                      className="setting-select"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>Security</h2>
                  <p>Manage your account security settings</p>
                </div>

                <div className="security-actions">
                  <a href="/forgot-password" className="security-action">
                    <div className="action-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                    </div>
                    <div className="action-info">
                      <h3>Change Password</h3>
                      <p>Update your account password</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="action-arrow">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="settings-section danger-zone">
                <div className="section-header">
                  <h2>Danger Zone</h2>
                  <p>Irreversible and destructive actions</p>
                </div>

                <div className="danger-actions">
                  <div className="danger-item">
                    <div className="danger-info">
                      <h3>Delete Account</h3>
                      <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="delete-button"
                      disabled={isDeleting}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="settings-sidebar">
              <div className="quick-links">
                <h3>Quick Links</h3>
                <a href="/profile" className="quick-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Edit Profile
                </a>
                <a href="/favorites" className="quick-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  My Favorites
                </a>
              </div>

              <div className="help-section">
                <h3>Need Help?</h3>
                <p>Contact our support team if you have any questions about your account settings.</p>
                <a href="/contact" className="help-link">Contact Support</a>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Delete Account</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="modal-close"
                  disabled={isDeleting}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="warning-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </div>
                <p>
                  Are you absolutely sure you want to delete your account?
                </p>
                <p>
                  This will permanently delete your profile, favorites, and all associated data.
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cancel-button"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="confirm-delete-button"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="button-spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete My Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .settings-header {
          margin-bottom: 40px;
        }

        .settings-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
        }

        .settings-header p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .settings-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .settings-section.danger-zone {
          border: 1px solid #fecaca;
          background: #fef2f2;
        }

        .section-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .alert-success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 500;
          color: #1a202c;
        }

        .setting-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e0;
          transition: .4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: #1A73E8;
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .setting-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          min-width: 120px;
        }

        .section-actions {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .save-button {
          background: #1A73E8;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .save-button:hover:not(:disabled) {
          background: #1557b0;
        }

        .save-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .security-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .security-action {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, background-color 0.2s;
        }

        .security-action:hover {
          border-color: #1A73E8;
          background: #f8fafc;
        }

        .action-icon {
          color: #6b7280;
        }

        .action-info {
          flex: 1;
        }

        .action-info h3 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
        }

        .action-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .action-arrow {
          color: #9ca3af;
        }

        .danger-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .danger-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid #f87171;
          border-radius: 8px;
          background: white;
        }

        .danger-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 500;
          color: #dc2626;
        }

        .danger-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          max-width: 400px;
        }

        .delete-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .delete-button:hover:not(:disabled) {
          background: #b91c1c;
        }

        .delete-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .quick-links,
        .help-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .quick-links h3,
        .help-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          text-decoration: none;
          color: #374151;
          border-radius: 6px;
          transition: background-color 0.2s;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .quick-link:hover {
          background: #f3f4f6;
        }

        .quick-link:last-child {
          margin-bottom: 0;
        }

        .help-section p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .help-link {
          color: #1A73E8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .help-link:hover {
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
        }

        .modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .modal-close:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .warning-icon {
          color: #f59e0b;
          margin-bottom: 16px;
        }

        .modal-body p {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .modal-body p:last-child {
          margin-bottom: 0;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding: 0 24px 24px 24px;
        }

        .cancel-button,
        .confirm-delete-button {
          flex: 1;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-button {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .confirm-delete-button {
          background: #dc2626;
          color: white;
          border: 1px solid #dc2626;
        }

        .confirm-delete-button:hover:not(:disabled) {
          background: #b91c1c;
        }

        .confirm-delete-button:disabled,
        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 14px;
          height: 14px;
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

        .settings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
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

        @media (max-width: 1024px) {
          .settings-content {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .settings-header h1 {
            font-size: 24px;
          }

          .container {
            padding: 0 16px;
          }

          .settings-section {
            padding: 20px;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .danger-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .modal-content {
            margin: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}