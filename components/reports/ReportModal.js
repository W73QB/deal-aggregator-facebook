import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createReport, hideReportModal } from '../../lib/store/slices/reportsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import styles from './ReportModal.module.css';

const REPORT_REASONS = {
  spam: 'Spam or Unwanted Commercial Content',
  harassment: 'Harassment or Bullying',
  inappropriate: 'Inappropriate or Offensive Content',
  misinformation: 'False or Misleading Information',
  hate_speech: 'Hate Speech or Discrimination',
  copyright: 'Copyright Infringement',
  personal_info: 'Personal Information Shared Without Consent',
  fake_account: 'Fake Account or Impersonation',
  off_topic: 'Off-topic or Irrelevant Content',
  other: 'Other (Please Specify)'
};

const ReportModal = () => {
  const dispatch = useDispatch();
  const { showReportModal, reportingContent, submitting } = useSelector(state => state.reports);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (showReportModal) {
      // Reset form when modal opens
      setSelectedReason('');
      setDescription('');
      setError('');
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [showReportModal]);

  const handleClose = () => {
    if (submitting) return; // Prevent closing during submission
    dispatch(hideReportModal());
  };

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
    setError('');
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please login to submit reports',
        duration: 4000
      }));
      return;
    }

    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'other' && !description.trim()) {
      setError('Please provide details for "Other" reason');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    try {
      const reportData = {
        content_type: reportingContent.type, // 'review' or 'comment'
        content_id: reportingContent.id,
        reason: selectedReason,
        description: description.trim()
      };

      await dispatch(createReport(reportData)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Report submitted successfully. We will review it shortly.',
        duration: 4000
      }));
      
      handleClose();
      
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (showReportModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showReportModal]);

  if (!showReportModal || !reportingContent) {
    return null;
  }

  return (
    <div 
      className={styles.reportModalBackdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className={styles.reportModal}>
        <div className={styles.reportModalHeader}>
          <h2 id="report-modal-title">Report Content</h2>
          <button 
            className={styles.reportModalClose}
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close report modal"
          >
            ×
          </button>
        </div>
        
        <div className={styles.reportModalContent}>
          <div className={styles.contentPreview}>
            <h4>You are reporting this {reportingContent.type}:</h4>
            <div className={styles.contentSnippet}>
              {reportingContent.title && (
                <div className={styles.contentTitle}>"{reportingContent.title}"</div>
              )}
              <div className={styles.contentText}>
                {reportingContent.content.substring(0, 200)}
                {reportingContent.content.length > 200 && '...'}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Why are you reporting this content? *
              </label>
              
              <div className={styles.reasonOptions}>
                {Object.entries(REPORT_REASONS).map(([value, label]) => (
                  <label key={value} className={styles.reasonOption}>
                    <input
                      type="radio"
                      name="reason"
                      value={value}
                      checked={selectedReason === value}
                      onChange={() => handleReasonChange(value)}
                      disabled={submitting}
                    />
                    <span className={styles.reasonLabel}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="report-description" className={styles.formLabel}>
                Additional Details {selectedReason === 'other' ? '*' : '(Optional)'}
              </label>
              <textarea
                id="report-description"
                className={styles.formTextarea}
                value={description}
                onChange={handleDescriptionChange}
                placeholder={
                  selectedReason === 'other' 
                    ? "Please describe the issue..." 
                    : "Provide any additional context that might help our review..."
                }
                rows={4}
                maxLength={1000}
                disabled={submitting}
              />
              <div className={styles.formHelp}>
                {description.length}/1000 characters
              </div>
            </div>
            
            {error && (
              <div className={styles.formError} role="alert">
                {error}
              </div>
            )}
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={submitting || !selectedReason}
              >
                {submitting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
