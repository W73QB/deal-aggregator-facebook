import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { deleteComment, toggleReplies } from '../../lib/store/slices/commentsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import CommentForm from './CommentForm';
import styles from './CommentCard.module.css';

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

const CommentCard = ({ comment, depth = 0, onReply, onEdit }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { expandedReplies } = useSelector(state => state.comments);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const isOwner = isAuthenticated && user?.id === comment.user?.id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);
  const maxDepth = 3; // Maximum nesting level
  
  const createdDate = new Date(comment.created_at).toLocaleDateString();
  const updatedDate = comment.updated_at ? new Date(comment.updated_at).toLocaleDateString() : null;
  
  // Sanitize content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(comment.content, { 
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });

  const handleReply = () => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please login to reply to comments',
        duration: 4000
      }));
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await dispatch(deleteComment(comment.id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Comment deleted successfully',
          duration: 3000
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to delete comment',
          duration: 4000
        }));
      }
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please login to report content',
        duration: 4000
      }));
      return;
    }

    dispatch({
      type: 'reports/showReportModal',
      payload: {
        type: 'comment',
        id: comment.id,
        content: comment.content
      }
    });
  };

  const handleToggleReplies = () => {
    dispatch(toggleReplies(comment.id));
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    // Automatically expand replies when new one is added
    if (!isExpanded) {
      dispatch(toggleReplies(comment.id));
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  // Calculate indentation based on depth
  const indentationStyle = {
    marginLeft: `${Math.min(depth * 24, maxDepth * 24)}px`,
  };

  return (
    <div 
      className={`${styles.commentCard} ${styles[`comment-card--depth-${Math.min(depth, maxDepth)}`]}`}
      style={indentationStyle}
    >
      <div className={styles.commentContent}>
        {/* Comment Header */}
        <div className={styles.commentHeader}>
          <div className={styles.commentAuthor}>
            <span className={styles.authorName}>
              {comment.user?.first_name} {comment.user?.last_name}
            </span>
            <span className={styles.commentDate}>
              {updatedDate && updatedDate !== createdDate 
                ? `Updated ${updatedDate}` 
                : createdDate
              }
            </span>
            {comment.isOptimistic && (
              <span className={styles.commentStatus}>Posting...</span>
            )}
          </div>
          
          <div className={styles.commentActions}>
            {isOwner ? (
              <>
                <button 
                  className={`${styles.commentActionBtn} ${styles.commentActionBtnEdit}`}
                  onClick={handleEdit}
                  aria-label="Edit comment"
                >
                  Edit
                </button>
                <button 
                  className={`${styles.commentActionBtn} ${styles.commentActionBtnDelete}`}
                  onClick={handleDelete}
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              </>
            ) : (
              <button 
                className={`${styles.commentActionBtn} ${styles.commentActionBtnReport}`}
                onClick={handleReport}
                aria-label="Report comment"
              >
                Report
              </button>
            )}
          </div>
        </div>

        {/* Comment Body */}
        {isEditing ? (
          <CommentForm
            initialContent={comment.content}
            onSubmit={(content) => {
              if (onEdit) {
                onEdit(comment.id, content);
              }
            }}
            onCancel={() => setIsEditing(false)}
            onSuccess={handleEditSuccess}
            isEditing={true}
            submitLabel="Update Comment"
          />
        ) : (
          <div 
            className={styles.commentBody}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}

        {/* Comment Footer */}
        <div className={styles.commentFooter}>
          <button 
            className={styles.commentReplyBtn}
            onClick={handleReply}
            disabled={depth >= maxDepth}
          >
            {depth >= maxDepth ? 'Max depth reached' : 'Reply'}
          </button>
          
          {hasReplies && (
            <button 
              className={styles.commentToggleBtn}
              onClick={handleToggleReplies}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Hide' : 'Show'} ${comment.replies.length} replies`}
            >
              {isExpanded ? '▼' : '▶'} 
              {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className={styles.commentReplyForm}>
            <CommentForm
              parentId={comment.id}
              onSubmit={(content) => {
                if (onReply) {
                  onReply(comment.id, content);
                }
              }}
              onCancel={() => setShowReplyForm(false)}
              onSuccess={handleReplySuccess}
              placeholder="Write a reply..."
              submitLabel="Post Reply"
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && isExpanded && (
        <div className={styles.commentReplies}>
          {comment.replies.map((reply) => (
            <CommentCard 
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
