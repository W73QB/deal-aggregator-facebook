import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createComment, updateComment } from '../../lib/store/slices/commentsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import styles from './CommentForm.module.css';

const CommentForm = ({ 
  dealId,
  reviewId,
  parentId,
  initialContent = '',
  onSubmit,
  onCancel,
  onSuccess,
  isEditing = false,
  placeholder = 'Write a comment...',
  submitLabel = 'Post Comment'
}) => {
  const dispatch = useDispatch();
  const { submitting } = useSelector(state => state.comments);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    // Auto-focus for reply forms
    if ((parentId || isEditing) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId, isEditing]);

  const validateContent = (text) => {
    if (!text.trim()) {
      return 'Comment cannot be empty';
    }
    if (text.length < 3) {
      return 'Comment must be at least 3 characters';
    }
    if (text.length > 2000) {
      return 'Comment must be less than 2000 characters';
    }
    return '';
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please login to post comments',
        duration: 4000
      }));
      return;
    }

    const validationError = validateContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (isEditing && onSubmit) {
        // Handle editing through parent component
        await onSubmit(content);
      } else {
        // Handle creating new comment
        const commentData = {
          content: content.trim(),
          ...(dealId && { deal_id: dealId }),
          ...(reviewId && { review_id: reviewId }),
          ...(parentId && { parent_id: parentId })
        };

        await dispatch(createComment(commentData)).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          message: parentId ? 'Reply posted successfully!' : 'Comment posted successfully!',
          duration: 3000
        }));
      }
      
      // Reset form
      setContent('');
      setError('');
      setIsFocused(false);
      
      if (onSuccess) onSuccess();
      
    } catch (err) {
      const errorMessage = err.message || `Failed to ${isEditing ? 'update' : 'post'} comment`;
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 4000
      }));
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError('');
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Don't hide form immediately to allow clicking submit button
    setTimeout(() => {
      if (!content.trim() && !isEditing && !parentId) {
        setIsFocused(false);
      }
    }, 200);
  };

  // Auto-resize textarea
  const handleTextareaResize = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (!isAuthenticated && !isEditing) {
    return (
      <div className={styles.commentFormMessage}>
        <p>Please login to post comments.</p>
      </div>
    );
  }

  // Show minimal form by default (just textarea)
  const showFullForm = isFocused || content.trim() || isEditing || parentId;

  return (
    <div className={`${styles.commentForm} ${showFullForm ? styles.commentFormExpanded : ''}`}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.commentFormContent}>
          <div className={styles.commentTextareaContainer}>
            <textarea
              ref={textareaRef}
              className={`${styles.commentTextarea} ${error ? styles.commentTextareaError : ''}`}
              value={content}
              onChange={handleContentChange}
              onInput={handleTextareaResize}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              rows={showFullForm ? 3 : 1}
              maxLength={2000}
              disabled={submitting}
              aria-describedby={error ? 'comment-error' : 'comment-help'}
            />
            
            {showFullForm && (
              <div className={styles.commentFormHelp} id="comment-help">
                {content.length}/2000 characters
              </div>
            )}
            
            {error && (
              <div id="comment-error" className={styles.commentFormError} role="alert">
                {error}
              </div>
            )}
          </div>

          {showFullForm && (
            <div className={styles.commentFormActions}>
              {(onCancel || isEditing) && (
                <button 
                  type="button" 
                  className={`${styles.commentFormBtn} ${styles.commentFormBtnSecondary}`}
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
              
              <button 
                type="submit" 
                className={`${styles.commentFormBtn} ${styles.commentFormBtnPrimary}`}
                disabled={submitting || !content.trim() || !!error}
              >
                {submitting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
