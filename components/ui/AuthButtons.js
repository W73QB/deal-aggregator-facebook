import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const AuthButtons = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="user-menu" ref={dropdownRef}>
        <button
          className="user-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="user-avatar">
            {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <span className="user-name">
            {user.first_name || user.email.split('@')[0]}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-avatar-large">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <p className="user-full-name">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.first_name || user.email.split('@')[0]
                    }
                  </p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-section">
              <Link href="/profile" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                My Profile
              </Link>

              <Link href="/favorites" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                My Favorites
              </Link>

              <Link href="/settings" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
                Settings
              </Link>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-section">
              <button onClick={handleLogout} className="dropdown-item logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          .auth-loading {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #1A73E8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .user-menu {
            position: relative;
          }

          .user-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 8px;
            transition: background-color 0.2s;
            color: inherit;
          }

          .user-button:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1A73E8, #0056b3);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
          }

          .user-name {
            font-weight: 500;
            color: #374151;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dropdown-arrow {
            transition: transform 0.2s;
            color: #6b7280;
          }

          .dropdown-arrow.open {
            transform: rotate(180deg);
          }

          .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            min-width: 280px;
            z-index: 50;
            margin-top: 4px;
          }

          .dropdown-header {
            padding: 16px;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .user-avatar-large {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1A73E8, #0056b3);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 18px;
          }

          .user-details {
            flex: 1;
            min-width: 0;
          }

          .user-full-name {
            margin: 0 0 2px 0;
            font-weight: 600;
            color: #111827;
            font-size: 14px;
          }

          .user-email {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dropdown-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 0 8px;
          }

          .dropdown-section {
            padding: 8px;
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 10px 12px;
            text-decoration: none;
            color: #374151;
            border-radius: 6px;
            transition: background-color 0.2s;
            font-size: 14px;
            border: none;
            background: none;
            cursor: pointer;
            text-align: left;
          }

          .dropdown-item:hover {
            background: #f3f4f6;
          }

          .dropdown-item.logout {
            color: #dc2626;
          }

          .dropdown-item.logout:hover {
            background: #fef2f2;
          }

          @media (max-width: 768px) {
            .user-name {
              display: none;
            }

            .dropdown-menu {
              min-width: 260px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <Link href="/login" className="auth-btn login">
        Sign In
      </Link>
      <Link href="/signup" className="auth-btn signup">
        Sign Up
      </Link>

      <style jsx>{`
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-btn {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .auth-btn.login {
          color: #1A73E8;
          border-color: #d1d5db;
          font-weight: 600;
        }

        .auth-btn.login:hover {
          background: #eef4ff;
          border-color: #1A73E8;
          color: #1557b0;
        }

        .auth-btn.signup {
          background: #1A73E8;
          color: white;
        }

        .auth-btn.signup:hover {
          background: #1557b0;
        }

        @media (max-width: 768px) {
          .auth-buttons {
            gap: 4px;
          }

          .auth-btn {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthButtons;