/**
 * M3.6 Notification Badge Component
 * Shows unread notification count with click to open panel
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  togglePanel,
  fetchHistory,
  selectUnreadCount,
  selectIsOpen,
  selectHasUnread
} from '../../lib/store/slices/inAppNotificationsSlice';
import { trackNotificationOpen } from '../../lib/analytics/events';

const NotificationBadge = ({ className = '' }) => {
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const isOpen = useSelector(selectIsOpen);
  const hasUnread = useSelector(selectHasUnread);

  // Load notifications on app start
  useEffect(() => {
    // Initial load of recent notifications to get unread count
    dispatch(fetchHistory({ limit: 50, offset: 0 }));
  }, [dispatch]);

  const handleClick = () => {
    if (!isOpen) {
      trackNotificationOpen('badge_click', 'notification_center');
    }
    dispatch(togglePanel());
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      className={`notification-badge ${isOpen ? 'notification-badge--active' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`${unreadCount} unread notifications`}
      aria-label={`Notifications. ${unreadCount} unread.`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <span className="notification-badge__icon">
        🔔
      </span>
      
      {hasUnread && (
        <span className="notification-badge__count" aria-hidden="true">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Pulse animation for new notifications */}
      {hasUnread && (
        <span className="notification-badge__pulse" aria-hidden="true"></span>
      )}
    </button>
  );
};

export default NotificationBadge;