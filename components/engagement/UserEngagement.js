/**
 * User Engagement Component
 * Handles wishlist, deal alerts, and user interaction features
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserEngagement = ({ dealId, dealData, variant = 'full' }) => {
  const { user, isAuthenticated } = useAuth();
  const [userActions, setUserActions] = useState({
    isWishlisted: false,
    hasAlert: false,
    isShared: false,
    rating: 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [notification, setNotification] = useState('');

  // Load user actions from localStorage if not authenticated
  useEffect(() => {
    const storageKey = `deal-${dealId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setUserActions(prev => ({ ...prev, ...JSON.parse(stored) }));
    }
  }, [dealId]);

  // Save user actions to localStorage
  const saveUserAction = (action, value) => {
    const newActions = { ...userActions, [action]: value };
    setUserActions(newActions);

    const storageKey = `deal-${dealId}`;
    localStorage.setItem(storageKey, JSON.stringify(newActions));

    // Show feedback
    showNotification(getActionMessage(action, value));
  };

  const getActionMessage = (action, value) => {
    switch (action) {
      case 'isWishlisted':
        return value ? '❤️ Added to wishlist!' : 'Removed from wishlist';
      case 'hasAlert':
        return value ? '🔔 Price alert set!' : 'Price alert removed';
      case 'isShared':
        return '📤 Deal shared successfully!';
      case 'rating':
        return `⭐ Rated ${value} stars!`;
      default:
        return 'Action completed!';
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleWishlist = () => {
    saveUserAction('isWishlisted', !userActions.isWishlisted);
  };

  const handleAlert = () => {
    if (userActions.hasAlert) {
      saveUserAction('hasAlert', false);
    } else {
      setShowAlertModal(true);
    }
  };

  const setupAlert = (alertType, targetPrice = null) => {
    saveUserAction('hasAlert', true);
    setShowAlertModal(false);

    // In a real app, this would send to an API
    console.log('Setting up alert:', { dealId, alertType, targetPrice, userEmail: user?.email });
  };

  const handleShare = (platform) => {
    const url = `https://dealradarus.com/deals/${dealId}`;
    const text = `Check out this amazing deal: ${dealData?.title || 'Great Deal'} - Save ${dealData?.discount || 'big'}%!`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text} ${url}`);
        saveUserAction('isShared', true);
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    saveUserAction('isShared', true);
    setShowShareMenu(false);
  };

  const handleRating = (rating) => {
    saveUserAction('rating', rating);
  };

  if (variant === 'compact') {
    return (
      <div className="user-engagement compact">
        <button
          className={`action-btn wishlist ${userActions.isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={userActions.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={userActions.isWishlisted ? 'currentColor' : 'none'} stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <button
          className={`action-btn alert ${userActions.hasAlert ? 'active' : ''}`}
          onClick={handleAlert}
          aria-label={userActions.hasAlert ? 'Remove price alert' : 'Set price alert'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div className="share-container">
          <button
            className="action-btn share"
            onClick={() => setShowShareMenu(!showShareMenu)}
            aria-label="Share deal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>

          {showShareMenu && (
            <div className="share-menu">
              <button onClick={() => handleShare('twitter')}>Twitter</button>
              <button onClick={() => handleShare('facebook')}>Facebook</button>
              <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
              <button onClick={() => handleShare('copy')}>Copy Link</button>
            </div>
          )}
        </div>

        {notification && <div className="notification">{notification}</div>}

        <style jsx>{`
          .user-engagement.compact {
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
          }

          .action-btn {
            padding: 8px;
            border: 1px solid #e1e5e9;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #6c757d;
          }

          .action-btn:hover {
            border-color: #1A73E8;
            color: #1A73E8;
          }

          .action-btn.active {
            background: #1A73E8;
            color: white;
            border-color: #1A73E8;
          }

          .action-btn.wishlist.active {
            background: #FF3B30;
            border-color: #FF3B30;
          }

          .action-btn.alert.active {
            background: #FF9500;
            border-color: #FF9500;
          }

          .share-container {
            position: relative;
          }

          .share-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 120px;
            margin-top: 4px;
          }

          .share-menu button {
            width: 100%;
            padding: 8px 12px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
          }

          .share-menu button:hover {
            background: #f8f9fa;
          }

          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
          }

          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="user-engagement">
      <div className="engagement-header">
        <h3>Deal Actions</h3>
        {!isAuthenticated && (
          <p className="auth-note">
            <a href="/login">Sign in</a> to sync across devices
          </p>
        )}
      </div>

      <div className="action-grid">
        {/* Wishlist */}
        <div className="action-card">
          <button
            className={`action-main ${userActions.isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill={userActions.isWishlisted ? 'currentColor' : 'none'} stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>{userActions.isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</h4>
              <p>Save for later</p>
            </div>
          </button>
        </div>

        {/* Price Alert */}
        <div className="action-card">
          <button
            className={`action-main ${userActions.hasAlert ? 'active' : ''}`}
            onClick={handleAlert}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>{userActions.hasAlert ? 'Alert Set' : 'Price Alert'}</h4>
              <p>Get notified of price drops</p>
            </div>
          </button>
        </div>

        {/* Share */}
        <div className="action-card">
          <button
            className="action-main"
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Share Deal</h4>
              <p>Tell your friends</p>
            </div>
          </button>

          {showShareMenu && (
            <div className="share-options">
              <button className="share-option twitter" onClick={() => handleShare('twitter')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button className="share-option facebook" onClick={() => handleShare('facebook')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button className="share-option whatsapp" onClick={() => handleShare('whatsapp')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
                WhatsApp
              </button>
              <button className="share-option copy" onClick={() => handleShare('copy')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Link
              </button>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="action-card rating-card">
          <div className="rating-header">
            <h4>Rate this Deal</h4>
            <p>Help others decide</p>
          </div>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`star ${star <= userActions.rating ? 'active' : ''}`}
                onClick={() => handleRating(star)}
                aria-label={`Rate ${star} stars`}
              >
                ⭐
              </button>
            ))}
          </div>
          {userActions.rating > 0 && (
            <p className="rating-thanks">Thanks for rating!</p>
          )}
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="alert-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Price Alert</h3>
              <button
                className="close-btn"
                onClick={() => setShowAlertModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Get notified when this deal gets even better!</p>
              <div className="alert-options">
                <button
                  className="alert-option"
                  onClick={() => setupAlert('any_drop')}
                >
                  <div className="option-icon">📉</div>
                  <div className="option-text">
                    <strong>Any Price Drop</strong>
                    <span>Get notified of any discount increase</span>
                  </div>
                </button>
                <button
                  className="alert-option"
                  onClick={() => setupAlert('target_price')}
                >
                  <div className="option-icon">🎯</div>
                  <div className="option-text">
                    <strong>Target Price</strong>
                    <span>Set a specific price you want to pay</span>
                  </div>
                </button>
                <button
                  className="alert-option"
                  onClick={() => setupAlert('back_in_stock')}
                >
                  <div className="option-icon">📦</div>
                  <div className="option-text">
                    <strong>Back in Stock</strong>
                    <span>Know when item becomes available</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="notification">{notification}</div>}

      <style jsx>{`
        .user-engagement {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }

        .engagement-header {
          margin-bottom: 20px;
        }

        .engagement-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .auth-note {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }

        .auth-note a {
          color: #1A73E8;
          text-decoration: none;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-card {
          position: relative;
        }

        .action-main {
          width: 100%;
          padding: 16px;
          border: 2px solid #e1e5e9;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .action-main:hover {
          border-color: #1A73E8;
          box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
        }

        .action-main.active {
          border-color: #1A73E8;
          background: #f0f7ff;
        }

        .action-icon {
          color: #6c757d;
          transition: color 0.3s ease;
        }

        .action-main:hover .action-icon,
        .action-main.active .action-icon {
          color: #1A73E8;
        }

        .action-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 2px 0;
        }

        .action-content p {
          font-size: 12px;
          color: #6c757d;
          margin: 0;
        }

        .rating-card .action-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .rating-header {
          width: 100%;
        }

        .rating-stars {
          display: flex;
          gap: 4px;
        }

        .star {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 2px;
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .star:hover,
        .star.active {
          opacity: 1;
        }

        .rating-thanks {
          font-size: 12px;
          color: #28a745;
          margin: 4px 0 0 0;
        }

        .share-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          margin-top: 8px;
          overflow: hidden;
        }

        .share-option {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }

        .share-option:hover {
          background: #f8f9fa;
        }

        .share-option.twitter { color: #1da1f2; }
        .share-option.facebook { color: #1877f2; }
        .share-option.whatsapp { color: #25d366; }
        .share-option.copy { color: #6c757d; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .alert-modal {
          background: white;
          border-radius: 12px;
          max-width: 400px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0;
          border-bottom: 1px solid #e1e5e9;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          padding: 0 24px 24px;
        }

        .modal-content p {
          color: #6c757d;
          margin: 0 0 20px 0;
        }

        .alert-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e1e5e9;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .alert-option:hover {
          border-color: #1A73E8;
          background: #f0f7ff;
        }

        .option-icon {
          font-size: 24px;
        }

        .option-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-text strong {
          font-size: 14px;
          color: #1a1a1a;
        }

        .option-text span {
          font-size: 12px;
          color: #6c757d;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .action-grid {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 10px;
          }

          .alert-modal {
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
};

export default UserEngagement;