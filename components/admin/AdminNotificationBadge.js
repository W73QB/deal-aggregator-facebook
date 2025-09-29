import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportStats } from '../../lib/store/slices/reportsSlice';
import styles from './AdminNotificationBadge.module.css';

const AdminNotificationBadge = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector(state => state.reports);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [lastPendingCount, setLastPendingCount] = useState(0);

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const pendingReports = stats.pending || 0;
  const reviewingReports = stats.reviewing || 0;
  const totalNeedsAttention = pendingReports + reviewingReports;

  useEffect(() => {
    if (isAdmin) {
      // Fetch stats immediately
      dispatch(fetchReportStats());
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        dispatch(fetchReportStats());
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAdmin, dispatch]);

  useEffect(() => {
    // Trigger pulse animation when pending count increases
    if (pendingReports > lastPendingCount && lastPendingCount > 0) {
      setPulseAnimation(true);
      
      // Reset animation after completion
      const timeout = setTimeout(() => {
        setPulseAnimation(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
    
    setLastPendingCount(pendingReports);
  }, [pendingReports, lastPendingCount]);

  if (!isAdmin || statsLoading) {
    return null;
  }

  if (totalNeedsAttention === 0) {
    return (
      <div className={`${styles['admin-badge']} ${styles['admin-badge--clean']} ${className}`} title="No pending reports">
        🛡️
      </div>
    );
  }

  const getPriorityLevel = () => {
    if (pendingReports >= 10) return 'critical';
    if (pendingReports >= 5) return 'high';
    if (pendingReports >= 1) return 'medium';
    return 'low';
  };

  const getBadgeMessage = () => {
    if (pendingReports > 0 && reviewingReports > 0) {
      return `${pendingReports} pending, ${reviewingReports} reviewing`;
    }
    if (pendingReports > 0) {
      return `${pendingReports} report${pendingReports === 1 ? '' : 's'} need${pendingReports === 1 ? 's' : ''} attention`;
    }
    if (reviewingReports > 0) {
      return `${reviewingReports} report${reviewingReports === 1 ? '' : 's'} under review`;
    }
    return 'No pending reports';
  };

  const priorityLevel = getPriorityLevel();

  return (
    <div 
      className={`${styles['admin-badge']} ${styles[`admin-badge--${priorityLevel}`]} ${pulseAnimation ? styles['admin-badge--pulse'] : ''} ${className}`}
      title={getBadgeMessage()}
      role="status"
      aria-label={getBadgeMessage()}
    >
      <div className={styles['badge-icon']}>
        🚨
      </div>
      
      <div className={styles['badge-count']}>
        {totalNeedsAttention}
      </div>
      
      {pendingReports > 0 && (
        <div className={styles['badge-urgent']}>
          !
        </div>
      )}
      
      {/* Tooltip for detailed breakdown */}
      <div className={styles['badge-tooltip']}>
        <div className={styles['tooltip-header']}>Moderation Status</div>
        
        {pendingReports > 0 && (
          <div className={`${styles['tooltip-item']} ${styles['tooltip-item--pending']}`}>
            <span className={styles['tooltip-icon']}>⏳</span>
            <span className={styles['tooltip-text']}>{pendingReports} Pending Review</span>
          </div>
        )}
        
        {reviewingReports > 0 && (
          <div className={`${styles['tooltip-item']} ${styles['tooltip-item--reviewing']}`}>
            <span className={styles['tooltip-icon']}>👀</span>
            <span className={styles['tooltip-text']}>{reviewingReports} Under Review</span>
          </div>
        )}
        
        <div className={styles['tooltip-footer']}>
          Click to view dashboard
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationBadge;
