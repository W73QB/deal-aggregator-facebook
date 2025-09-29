import React, { useState, useEffect, useCallback } from 'react';
import styles from './CookieBanner.module.css';
import { getDataCollector } from '../../lib/analytics/dataCollector';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingLevel = localStorage.getItem('analytics-consent-level');
    const legacyConsent = localStorage.getItem('dealradarus-cookie-consent');

    if (!existingLevel && legacyConsent === 'accepted') {
      try {
        const collector = getDataCollector();
        collector.setConsentLevel('full');
        localStorage.setItem('analytics-consent-level', 'full');
      } catch (error) {
        console.error('Failed to migrate legacy cookie consent:', error);
      }
    }

    if (!existingLevel && !legacyConsent) {
      // Show banner after a brief delay for better UX
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
    }
  }, []);

  const applyConsent = useCallback((level) => {
    try {
      const collector = getDataCollector();
      collector.setConsentLevel(level);
    } catch (error) {
      console.error('Failed to apply analytics consent:', error);
    }

    localStorage.setItem('analytics-consent-level', level);
    localStorage.setItem('dealradarus-cookie-consent', level === 'full' ? 'accepted' : level === 'none' ? 'declined' : 'essential');
    localStorage.setItem('dealradarus-cookie-timestamp', new Date().toISOString());

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: level === 'full' ? 'granted' : 'denied'
      });
    }
  }, []);

  const handleAcceptAll = () => {
    applyConsent('full');
    closeBanner();
  };

  const handleEssentialOnly = () => {
    applyConsent('basic');
    closeBanner();
  };

  const handleDecline = () => {
    applyConsent('none');
    closeBanner();
  };

  const closeBanner = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.cookieBanner} ${isAnimating ? styles.slideIn : styles.slideOut}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
          <div className={styles.message}>
            <p className={styles.title}>
              <strong>We value your privacy</strong>
            </p>
            <p className={styles.description}>
              We use cookies and analytics to improve your experience and find better deals.
              You can accept essential cookies only or allow full analytics.
              <a href="/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleDecline}
            className={styles.btnSecondary}
            aria-label="Decline cookies"
          >
            Decline
          </button>
          <button
            onClick={handleEssentialOnly}
            className={styles.btnSecondary}
            aria-label="Accept essential cookies only"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className={styles.btnPrimary}
            aria-label="Accept cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
