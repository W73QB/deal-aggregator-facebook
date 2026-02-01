/**
 * GDPR/CCPA Compliant Consent Banner
 * Manages user consent for analytics and tracking
 */

import React, { useState, useEffect } from 'react';
import { setConsent, getConsentStatus } from '../../lib/analytics/dataLayer';

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or denied
    const consentStatus = getConsentStatus();

    if (consentStatus === null) {
      // No consent decision made yet, show banner
      setShowBanner(true);
    }
  }, []);

  // Add/remove body padding when banner is shown/hidden to prevent CTA blocking
  useEffect(() => {
    if (showBanner) {
      // Add bottom padding to prevent CTA blocking
      document.body.style.paddingBottom = '100px'; // Height of compact banner + extra space
      document.body.style.transition = 'padding-bottom 0.3s ease';
    } else {
      // Remove padding when banner is hidden
      document.body.style.paddingBottom = '0';
      // Clean up transition after animation
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.paddingBottom = '0';
      document.body.style.transition = '';
    };
  }, [showBanner]);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      setConsent(true);
      setShowBanner(false);
      
      // Track consent acceptance
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'consent_granted',
          consent_timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error setting consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    setIsLoading(true);
    try {
      setConsent(false);
      setShowBanner(false);
      
      // Track consent denial
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'consent_denied',
          consent_timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error setting consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div 
      className="consent-banner"
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
    >
      <div className="consent-banner__content">
        <div className="consent-banner__text">
          <h3 id="consent-banner-title" className="consent-banner__title">
            🍪 We Value Your Privacy
          </h3>
          <p id="consent-banner-description" className="consent-banner__description">
            We use analytics to improve your experience. We never sell your data. {' '}
            <a
              href="/privacy-policy"
              className="consent-banner__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        
        <div className="consent-banner__actions">
          <button
            onClick={handleDeny}
            className="consent-banner__button consent-banner__button--secondary"
            disabled={isLoading}
            aria-label="Deny analytics tracking"
          >
            Decline
          </button>
          
          <button
            onClick={handleAccept}
            className="consent-banner__button consent-banner__button--primary"
            disabled={isLoading}
            aria-label="Accept analytics tracking"
          >
            {isLoading ? 'Processing...' : 'Accept'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .consent-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid #e1e5e9;
          box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.12);
          padding: 16px 20px;
          z-index: 10000;
          animation: slideUp 0.4s ease-out;
          backdrop-filter: blur(10px);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .consent-banner__content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .consent-banner__text {
          flex: 1;
        }

        .consent-banner__title {
          margin: 0 0 6px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .consent-banner__description {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          color: #555555;
        }

        .consent-banner__link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }

        .consent-banner__link:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .consent-banner__actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .consent-banner__button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .consent-banner__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .consent-banner__button--secondary {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .consent-banner__button--secondary:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .consent-banner__button--primary {
          background: #007bff;
          color: white;
        }

        .consent-banner__button--primary:hover:not(:disabled) {
          background: #0056b3;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .consent-banner {
            padding: 12px 16px;
          }

          .consent-banner__content {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .consent-banner__actions {
            width: 100%;
            justify-content: space-between;
          }

          .consent-banner__button {
            min-width: 85px;
            padding: 8px 16px;
            font-size: 13px;
            flex: 1;
            max-width: 120px;
          }

          .consent-banner__title {
            font-size: 14px;
          }

          .consent-banner__description {
            font-size: 12px;
            line-height: 1.3;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .consent-banner {
            border-top: 2px solid #000000;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
          }

          .consent-banner__button--secondary {
            border: 2px solid #495057;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .consent-banner {
            animation: none;
          }
        }

        /* Focus management */
        .consent-banner__button:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .consent-banner__link:focus {
          outline: 2px solid #007bff;
          outline-offset: 1px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default ConsentBanner;