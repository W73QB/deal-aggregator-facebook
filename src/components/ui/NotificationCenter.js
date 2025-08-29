/**
 * M3.6 Notification Center Component
 * In-app notification panel with history and interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHistory,
  markRead,
  markAllRead,
  trackClick,
  openPanel,
  closePanel,
  togglePanel,
  clearHighlight,
  setStatusFilter,
  clearFilter,
  selectNotifications,
  selectUnreadCount,
  selectTotalCount,
  selectLoading,
  selectLoadingMore,
  selectError,
  selectPagination,
  selectIsOpen,
  selectHighlightedId,
  selectStatusFilter,
  selectHasUnread
} from '../../store/slices/inAppNotificationsSlice';
import { 
  trackNotificationClick, 
  trackNotificationOpen,
  trackNotificationCenterAction,
  trackInAppNotificationInteraction
} from '../../analytics/events';
import './NotificationCenter.css';

const NotificationCenter = ({ className = '' }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const listRef = useRef(null);
  
  // Redux selectors
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const totalCount = useSelector(selectTotalCount);
  const loading = useSelector(selectLoading);
  const loadingMore = useSelector(selectLoadingMore);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const isOpen = useSelector(selectIsOpen);
  const highlightedId = useSelector(selectHighlightedId);
  const statusFilter = useSelector(selectStatusFilter);
  const hasUnread = useSelector(selectHasUnread);
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);

  // Load initial notifications when panel opens
  useEffect(() => {
    if (isOpen && notifications.length === 0 && !loading) {
      dispatch(fetchHistory({ limit: 20, offset: 0 }));
    }
  }, [isOpen, notifications.length, loading, dispatch]);

  // Handle deep linking highlight
  useEffect(() => {
    if (highlightedId && isOpen) {
      const element = document.getElementById(`notification-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clear highlight after animation
        setTimeout(() => dispatch(clearHighlight()), 2000);
      }
    }
  }, [highlightedId, isOpen, dispatch]);

  // Handle clicks outside panel to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        dispatch(closePanel());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, dispatch]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || loadingMore || !pagination.hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8) { // Load more when 80% scrolled
        dispatch(fetchHistory({
          limit: 20,
          offset: pagination.offset + pagination.limit,
          status: statusFilter,
          append: true
        }));
      }
    };

    const listElement = listRef.current;
    if (listElement && isOpen) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [dispatch, loadingMore, pagination, statusFilter, isOpen]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.opened_at) {
      dispatch(markRead(notification.id));
      trackNotificationOpen('in_app', notification.template);
    }

    // Track click and get redirect URL if applicable
    const payload = notification.payload_json;
    if (payload && payload.deals && payload.deals.length > 0) {
      const targetUrl = payload.deals[0].url;
      
      if (targetUrl) {
        const result = await dispatch(trackClick({
          notificationId: notification.id,
          targetUrl
        }));

        trackNotificationClick('in_app', notification.template, targetUrl);

        // Open link in new tab
        if (result.payload?.redirectUrl) {
          window.open(result.payload.redirectUrl, '_blank');
        }
      }
    }
  };

  const handleMarkAllRead = () => {
    if (hasUnread) {
      dispatch(markAllRead());
    }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter === statusFilter) {
      dispatch(clearFilter());
    } else {
      dispatch(setStatusFilter(newFilter));
    }
    
    // Reload notifications with new filter
    dispatch(fetchHistory({ limit: 20, offset: 0, status: newFilter }));
  };

  const handleRefresh = () => {
    dispatch(fetchHistory({ 
      limit: 20, 
      offset: 0, 
      status: statusFilter 
    }));
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (template, status) => {
    if (status === 'failed') return '❌';
    
    switch (template) {
      case 'deal-immediate': return '🎯';
      case 'deal-digest': return '📊';
      case 'generic-error': return '⚠️';
      default: return '🔔';
    }
  };

  const renderNotificationContent = (notification) => {
    const payload = notification.payload_json;
    
    switch (notification.template) {
      case 'deal-immediate':
        if (payload?.deals?.length > 0) {
          const deal = payload.deals[0];
          return (
            <div className="notification-deal">
              <div className="notification-deal__title">{deal.title}</div>
              <div className="notification-deal__price">
                ${deal.price}
                {deal.originalPrice && (
                  <span className="notification-deal__savings">
                    Save ${(deal.originalPrice - deal.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        }
        break;
        
      case 'deal-digest':
        if (payload?.totalDeals) {
          return (
            <div className="notification-digest">
              <div className="notification-digest__summary">
                {payload.totalDeals} new deals found
              </div>
              <div className="notification-digest__stats">
                {payload.categories?.length} categories • Best saving: ${payload.bestSaving}
              </div>
            </div>
          );
        }
        break;
        
      default:
        return (
          <div className="notification-generic">
            {payload?.message || 'New notification'}
          </div>
        );
    }
    
    return (
      <div className="notification-generic">
        Notification content
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`notification-center ${className}`} ref={panelRef}>
      {/* Header */}
      <div className="notification-center__header">
        <div className="notification-center__title">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="notification-center__badge">{unreadCount}</span>
          )}
        </div>
        
        <div className="notification-center__actions">
          <button
            className="notification-center__action-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filter notifications"
            aria-label="Filter notifications"
          >
            🔍
          </button>
          
          <button
            className="notification-center__action-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh notifications"
            aria-label="Refresh notifications"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          
          {hasUnread && (
            <button
              className="notification-center__action-btn"
              onClick={handleMarkAllRead}
              title="Mark all as read"
              aria-label="Mark all notifications as read"
            >
              ✅
            </button>
          )}
          
          <button
            className="notification-center__close-btn"
            onClick={() => dispatch(closePanel())}
            title="Close notifications"
            aria-label="Close notification panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="notification-center__filters">
          <button
            className={`filter-btn ${statusFilter === null ? 'filter-btn--active' : ''}`}
            onClick={() => handleFilterChange(null)}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'sent' ? 'filter-btn--active' : ''}`}
            onClick={() => handleFilterChange('sent')}
          >
            Delivered
          </button>
          <button
            className={`filter-btn ${statusFilter === 'failed' ? 'filter-btn--active' : ''}`}
            onClick={() => handleFilterChange('failed')}
          >
            Failed
          </button>
        </div>
      )}

      {/* Content */}
      <div className="notification-center__content" ref={listRef}>
        {error && (
          <div className="notification-center__error">
            <span className="error-icon">⚠️</span>
            {error}
            <button 
              className="retry-btn"
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}

        {loading && notifications.length === 0 && (
          <div className="notification-center__loading">
            <div className="loading-spinner"></div>
            Loading notifications...
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification-center__empty">
            <span className="empty-icon">🔔</span>
            <h4>No notifications yet</h4>
            <p>We'll notify you when there are new deals matching your filters.</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="notification-center__list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                id={`notification-${notification.id}`}
                className={`notification-item ${
                  !notification.opened_at ? 'notification-item--unread' : ''
                } ${
                  notification.id === highlightedId ? 'notification-item--highlighted' : ''
                } ${
                  notification.status === 'failed' ? 'notification-item--failed' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item__icon">
                  {getNotificationIcon(notification.template, notification.status)}
                </div>
                
                <div className="notification-item__content">
                  <div className="notification-item__body">
                    {renderNotificationContent(notification)}
                  </div>
                  
                  <div className="notification-item__meta">
                    <span className="notification-item__time">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                    
                    {notification.status === 'failed' && (
                      <span className="notification-item__status notification-item__status--failed">
                        Failed
                      </span>
                    )}
                    
                    {notification.clicked_at && (
                      <span className="notification-item__status notification-item__status--clicked">
                        Clicked
                      </span>
                    )}
                  </div>
                </div>
                
                {!notification.opened_at && (
                  <div className="notification-item__unread-indicator" aria-label="Unread"></div>
                )}
              </div>
            ))}
            
            {loadingMore && (
              <div className="notification-center__loading-more">
                <div className="loading-spinner"></div>
                Loading more...
              </div>
            )}
            
            {!loadingMore && pagination.hasMore && (
              <div className="notification-center__load-more">
                <button
                  className="load-more-btn"
                  onClick={() => dispatch(fetchHistory({
                    limit: 20,
                    offset: pagination.offset + pagination.limit,
                    status: statusFilter,
                    append: true
                  }))}
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="notification-center__footer">
        <div className="notification-center__stats">
          {totalCount > 0 && (
            <span className="stats-text">
              Showing {notifications.length} of {totalCount}
            </span>
          )}
        </div>
        
        <div className="notification-center__settings">
          <a 
            href="/settings/notifications" 
            className="settings-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⚙️ Settings
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;