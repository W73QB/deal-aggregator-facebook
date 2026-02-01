import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DOMPurify from 'dompurify';
import LoadingSpinner from '../ui/LoadingSpinner';
import { updateReportStatus } from '../../lib/store/slices/reportsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import styles from './ReportCard.module.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#ffc107', icon: '⏳' },
  reviewing: { label: 'Under Review', color: '#007bff', icon: '👀' },
  dismissed: { label: 'Dismissed', color: '#28a745', icon: '✅' },
  action_taken: { label: 'Action Taken', color: '#dc3545', icon: '⚡' }
};

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate Content',
  misinformation: 'Misinformation',
  hate_speech: 'Hate Speech',
  copyright: 'Copyright',
  personal_info: 'Personal Information',
  fake_account: 'Fake Account',
  off_topic: 'Off Topic',
  other: 'Other'
};

const ReportCard = ({ report, onUpdate }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionReason, setActionReason] = useState('');
  
  const statusConfig = STATUS_CONFIG[report.status];
  const reportDate = new Date(report.created_at).toLocaleString();
  
  // Sanitize content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(report.content?.content || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });

  const handleStatusUpdate = async (newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      await dispatch(updateReportStatus({ 
        id: report.id, 
        status: newStatus,
        reason: actionReason.trim() || undefined
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: `Report ${newStatus.replace('_', ' ')} successfully`,
        duration: 3000
      }));
      
      setActionReason('');
      if (onUpdate) onUpdate();
      
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update report status',
        duration: 4000
      }));
    } finally {
      setUpdating(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getSeverityClass = () => {
    const highPriority = ['harassment', 'hate_speech', 'personal_info'];
    const mediumPriority = ['spam', 'inappropriate', 'fake_account'];
    
    if (highPriority.includes(report.reason)) return styles.reportCardHigh;
    if (mediumPriority.includes(report.reason)) return styles.reportCardMedium;
    return styles.reportCardLow;
  };

  return (
    <div className={`${styles.reportCard} ${getSeverityClass()}`}>
      {/* Report Header */}
      <div className={styles.reportHeader}>
        <div className={styles.reportMeta}>
          <div className={styles.reportId}>#{report.id.substring(0, 8)}</div>
          <div className={styles.reportType}>{report.content_type}</div>
          <div className={styles.reportDate}>{reportDate}</div>
          <div 
            className={styles.reportStatus}
            style={{ 
              backgroundColor: statusConfig.color,
              color: 'white'
            }}
          >
            {statusConfig.icon} {statusConfig.label}
          </div>
        </div>
        
        <button 
          className={styles.expandBtn}
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} report details`}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Report Reason */}
      <div className={styles.reportReason}>
        <span className={styles.reasonLabel}>Reason:</span>
        <span className={styles.reasonValue}>
          {REASON_LABELS[report.reason] || report.reason}
        </span>
      </div>

      {/* Report Description */}
      {report.description && (
        <div className={styles.reportDescription}>
          <strong>Reporter's note:</strong> {report.description}
        </div>
      )}

      {/* Reported Content Preview */}
      <div className={styles.contentPreview}>
        <div className={styles.contentHeader}>
          <h4>Reported {report.content_type}:</h4>
          {report.content?.title && (
            <div className={styles.contentTitle}>"{report.content.title}"</div>
          )}
        </div>
        
        <div className={styles.contentBody}>
          <div 
            className={`${styles.contentText} ${!isExpanded ? styles.contentTextTruncated : ''}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
          
          {!isExpanded && sanitizedContent.length > 200 && (
            <button className={styles.showMoreBtn} onClick={toggleExpanded}>
              Show more...
            </button>
          )}
        </div>

        {report.content?.user && (
          <div className={styles.contentAuthor}>
            by {report.content.user.first_name} {report.content.user.last_name}
          </div>
        )}
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className={styles.reportActions}>
          {report.status === 'pending' && (
            <div className={styles.actionGroup}>
              <h5>Take Action:</h5>
              
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnReview}`}
                  onClick={() => handleStatusUpdate('reviewing')}
                  disabled={updating}
                >
                  👀 Start Review
                </button>
                
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnDismiss}`}
                  onClick={() => handleStatusUpdate('dismissed')}
                  disabled={updating}
                >
                  ✅ Dismiss
                </button>
                
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnAction}`}
                  onClick={() => handleStatusUpdate('action_taken')}
                  disabled={updating}
                >
                  ⚡ Take Action
                </button>
              </div>
            </div>
          )}

          {report.status === 'reviewing' && (
            <div className={styles.actionGroup}>
              <h5>Complete Review:</h5>
              
              <div className={styles.actionTextarea}>
                <textarea
                  placeholder="Optional: Add reason for your decision..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className={styles.charCount}>{actionReason.length}/500</div>
              </div>
              
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnDismiss}`}
                  onClick={() => handleStatusUpdate('dismissed')}
                  disabled={updating}
                >
                  ✅ Dismiss as Invalid
                </button>
                
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnAction}`}
                  onClick={() => handleStatusUpdate('action_taken')}
                  disabled={updating}
                >
                  ⚡ Take Action
                </button>
              </div>
            </div>
          )}

          {(report.status === 'dismissed' || report.status === 'action_taken') && (
            <div className={styles.actionGroup}>
              <div className={styles.finalStatus}>
                <span className={styles.statusIcon}>{statusConfig.icon}</span>
                <span>This report has been {statusConfig.label.toLowerCase()}</span>
                {report.admin_reason && (
                  <div className={styles.adminReason}>
                    <strong>Admin note:</strong> {report.admin_reason}
                  </div>
                )}
              </div>
              
              {report.status !== 'pending' && (
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnReopen}`}
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={updating}
                >
                  🔄 Reopen Report
                </button>
              )}
            </div>
          )}

          {updating && (
            <div className={styles.updatingOverlay}>
              <LoadingSpinner size="small" text="Updating..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;
