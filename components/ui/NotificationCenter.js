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
} from '../../lib/store/slices/inAppNotificationsSlice';
import { 
  trackNotificationClick, 
  trackNotificationOpen,
  trackNotificationCenterAction,
  trackInAppNotificationInteraction
} from '../../lib/analytics/events';
import styles from './NotificationCenter.module.css';

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
            <div className={styles.notificationDeal}>
              <div className={styles.notificationDeal__title}>{deal.title}</div>
              <div className={styles.notificationDeal__price}>
                ${deal.price}
                {deal.originalPrice && (
                  <span className={styles.notificationDeal__savings}>
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
            <div className={styles.notificationDigest}>
              <div className={styles.notificationDigest__summary}>
                {payload.totalDeals} new deals found
              </div>
              <div className={styles.notificationDigest__stats}>
                {payload.categories?.length} categories • Best saving: ${payload.bestSaving}
              </div>
            </div>
          );
        }
        break;
        
      default:
        return (
          <div className={styles.notificationGeneric}>
            {payload?.message || 'New notification'}
          </div>
        );
    }
    
    return (
      <div className={styles.notificationGeneric}>
        Notification content
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.notificationCenter} ${className}`} ref={panelRef}>
      {/* Header */}
      <div className={styles.notificationCenter__header}>
        <div className={styles.notificationCenter__title}>
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.notificationCenter__badge}>{unreadCount}</span>
          )}
        </div>
        
        <div className={styles.notificationCenter__actions}>
          <button
            className={styles.notificationCenter__actionBtn}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter notifications"
            aria-label="Filter notifications"
          >
            🔍
          </button>
          
          <button
            className={styles.notificationCenter__actionBtn}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh notifications"
            aria-label="Refresh notifications"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          
          {hasUnread && (
            <button
              className={styles.notificationCenter__actionBtn}
              onClick={handleMarkAllRead}
              title="Mark all as read"
              aria-label="Mark all notifications as read"
            >
              ✅
            </button>
          )}
          
          <button
            className={styles.notificationCenter__closeBtn}
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
        <div className={styles.notificationCenter__filters}>
          <button
            className={`${styles.filterBtn} ${statusFilter === null ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilterChange(null)}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'sent' ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilterChange('sent')}
          >
            Delivered
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'failed' ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilterChange('failed')}
          >
            Failed
          </button>
        </div>
      )}

      {/* Content */}
      <div className={styles.notificationCenter__content} ref={listRef}>
        {error && (
          <div className={styles.notificationCenter__error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
            <button 
              className={styles.retryBtn}
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}

        {loading && notifications.length === 0 && (
          <div className={styles.notificationCenter__loading}>
            <div className={styles.loadingSpinner}></div>
            Loading notifications...
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className={styles.notificationCenter__empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <h4>No notifications yet</h4>
            <p>We'll notify you when there are new deals matching your filters.</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className={styles.notificationCenter__list}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                id={`notification-${notification.id}`}
                className={`${styles.notificationItem} ${
                  !notification.opened_at ? styles.notificationItemUnread : ''
                } ${
                  notification.id === highlightedId ? styles.notificationItemHighlighted : ''
                } ${
                  notification.status === 'failed' ? styles.notificationItemFailed : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles.notificationItem__icon}>
                  {getNotificationIcon(notification.template, notification.status)}
                </div>
                
                <div className={styles.notificationItem__content}>
                  <div className={styles.notificationItem__body}>
                    {renderNotificationContent(notification)}
                  </div>
                  
                  <div className={styles.notificationItem__meta}>
                    <span className={styles.notificationItem__time}>
                      {formatNotificationTime(notification.created_at)}
                    </span>
                    
                    {notification.status === 'failed' && (
                      <span className={`${styles.notificationItem__status} ${styles.notificationItem__statusFailed}`}>
                        Failed
                      </span>
                    )}
                    
                    {notification.clicked_at && (
                      <span className={`${styles.notificationItem__status} ${styles.notificationItem__statusClicked}`}>
                        Clicked
                      </span>
                    )}
                  </div>
                </div>
                
                {!notification.opened_at && (
                  <div className={styles.notificationItem__unreadIndicator} aria-label="Unread"></div>
                )}
              </div>
            ))}
            
            {loadingMore && (
              <div className={styles.notificationCenter__loadingMore}>
                <div className={styles.loadingSpinner}></div>
                Loading more...
              </div>
            )}
            
            {!loadingMore && pagination.hasMore && (
              <div className={styles.notificationCenter__loadMore}>
                <button
                  className={styles.loadMoreBtn}
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
      <div className={styles.notificationCenter__footer}>
        <div className={styles.notificationCenter__stats}>
          {totalCount > 0 && (
            <span className={styles.statsText}>
              Showing {notifications.length} of {totalCount}
            </span>
          )}
        </div>
        
        <div className={styles.notificationCenter__settings}>
          <a 
            href="/settings/notifications" 
            className={styles.settingsLink}
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
