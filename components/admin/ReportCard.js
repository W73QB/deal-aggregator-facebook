import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DOMPurify from 'dompurify';
import LoadingSpinner from '../ui/LoadingSpinner';
import { updateReportStatus } from '../../lib/store/slices/reportsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import './ReportCard.css';

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
    
    if (highPriority.includes(report.reason)) return 'report-card--high';
    if (mediumPriority.includes(report.reason)) return 'report-card--medium';
    return 'report-card--low';
  };

  return (
    <div className={`report-card ${getSeverityClass()}`}>
      {/* Report Header */}
      <div className="report-header">
        <div className="report-meta">
          <div className="report-id">#{report.id.substring(0, 8)}</div>
          <div className="report-type">{report.content_type}</div>
          <div className="report-date">{reportDate}</div>
          <div 
            className="report-status"
            style={{ 
              backgroundColor: statusConfig.color,
              color: 'white'
            }}
          >
            {statusConfig.icon} {statusConfig.label}
          </div>
        </div>
        
        <button 
          className="expand-btn"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} report details`}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Report Reason */}
      <div className="report-reason">
        <span className="reason-label">Reason:</span>
        <span className="reason-value">
          {REASON_LABELS[report.reason] || report.reason}
        </span>
      </div>

      {/* Report Description */}
      {report.description && (
        <div className="report-description">
          <strong>Reporter's note:</strong> {report.description}
        </div>
      )}

      {/* Reported Content Preview */}
      <div className="content-preview">
        <div className="content-header">
          <h4>Reported {report.content_type}:</h4>
          {report.content?.title && (
            <div className="content-title">"{report.content.title}"</div>
          )}
        </div>
        
        <div className="content-body">
          <div 
            className={`content-text ${!isExpanded ? 'content-text--truncated' : ''}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
          
          {!isExpanded && sanitizedContent.length > 200 && (
            <button className="show-more-btn" onClick={toggleExpanded}>
              Show more...
            </button>
          )}
        </div>

        {report.content?.user && (
          <div className="content-author">
            by {report.content.user.first_name} {report.content.user.last_name}
          </div>
        )}
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="report-actions">
          {report.status === 'pending' && (
            <div className="action-group">
              <h5>Take Action:</h5>
              
              <div className="action-buttons">
                <button
                  className="action-btn action-btn--review"
                  onClick={() => handleStatusUpdate('reviewing')}
                  disabled={updating}
                >
                  👀 Start Review
                </button>
                
                <button
                  className="action-btn action-btn--dismiss"
                  onClick={() => handleStatusUpdate('dismissed')}
                  disabled={updating}
                >
                  ✅ Dismiss
                </button>
                
                <button
                  className="action-btn action-btn--action"
                  onClick={() => handleStatusUpdate('action_taken')}
                  disabled={updating}
                >
                  ⚡ Take Action
                </button>
              </div>
            </div>
          )}

          {report.status === 'reviewing' && (
            <div className="action-group">
              <h5>Complete Review:</h5>
              
              <div className="action-textarea">
                <textarea
                  placeholder="Optional: Add reason for your decision..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className="char-count">{actionReason.length}/500</div>
              </div>
              
              <div className="action-buttons">
                <button
                  className="action-btn action-btn--dismiss"
                  onClick={() => handleStatusUpdate('dismissed')}
                  disabled={updating}
                >
                  ✅ Dismiss as Invalid
                </button>
                
                <button
                  className="action-btn action-btn--action"
                  onClick={() => handleStatusUpdate('action_taken')}
                  disabled={updating}
                >
                  ⚡ Take Action
                </button>
              </div>
            </div>
          )}

          {(report.status === 'dismissed' || report.status === 'action_taken') && (
            <div className="action-group">
              <div className="final-status">
                <span className="status-icon">{statusConfig.icon}</span>
                <span>This report has been {statusConfig.label.toLowerCase()}</span>
                {report.admin_reason && (
                  <div className="admin-reason">
                    <strong>Admin note:</strong> {report.admin_reason}
                  </div>
                )}
              </div>
              
              {report.status !== 'pending' && (
                <button
                  className="action-btn action-btn--reopen"
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={updating}
                >
                  🔄 Reopen Report
                </button>
              )}
            </div>
          )}

          {updating && (
            <div className="updating-overlay">
              <LoadingSpinner size="small" text="Updating..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;