import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotification } from '../../lib/store/slices/notificationSlice';
import styles from './NotificationToast.module.css';

const NOTIFICATION_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const NOTIFICATION_COLORS = {
  success: '#28a745',
  error: '#dc3545', 
  warning: '#ffc107',
  info: '#007bff'
};

const NotificationToast = ({ notification }) => {
  const dispatch = useDispatch();
  
  const {
    id,
    type = 'info',
    message,
    duration = 4000,
    autoHide = true,
    timestamp
  } = notification;

  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, autoHide, duration, dispatch]);

  const handleClose = () => {
    dispatch(removeNotification(id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  };

  const progressBarWidth = autoHide && duration > 0 
    ? `${((Date.now() - timestamp) / duration) * 100}%`
    : '0%';

  return (
    <div 
      className={`${styles.notificationToast} ${styles[`notification-toast--${type}`]}`}
      role="alert"
      aria-live="polite"
      style={{
        '--notification-color': NOTIFICATION_COLORS[type],
        '--progress-width': progressBarWidth
      }}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationIcon}>
          {NOTIFICATION_ICONS[type]}
        </div>
        
        <div className={styles.notificationMessage}>
          {message}
        </div>
        
        <button
          className={styles.notificationClose}
          onClick={handleClose}
          onKeyPress={handleKeyPress}
          aria-label="Close notification"
          tabIndex={0}
        >
          ×
        </button>
      </div>
      
      {autoHide && duration > 0 && (
        <div 
          className={styles.notificationProgress}
          style={{ 
            width: progressBarWidth,
            backgroundColor: NOTIFICATION_COLORS[type]
          }}
        />
      )}
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications } = useSelector(state => state.notifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.notificationContainer} role="region" aria-label="Notifications">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export { NotificationToast };
export default NotificationContainer;
