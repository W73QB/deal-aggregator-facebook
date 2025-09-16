import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { deleteComment, toggleReplies } from '../../src/store/slices/commentsSlice';
import { addNotification } from '../../src/store/slices/notificationSlice';
import CommentForm from './CommentForm';
import './CommentCard.css';

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
      className={`comment-card comment-card--depth-${Math.min(depth, maxDepth)}`}
      style={indentationStyle}
    >
      <div className="comment-content">
        {/* Comment Header */}
        <div className="comment-header">
          <div className="comment-author">
            <span className="author-name">
              {comment.user?.first_name} {comment.user?.last_name}
            </span>
            <span className="comment-date">
              {updatedDate && updatedDate !== createdDate 
                ? `Updated ${updatedDate}` 
                : createdDate
              }
            </span>
            {comment.isOptimistic && (
              <span className="comment-status">Posting...</span>
            )}
          </div>
          
          <div className="comment-actions">
            {isOwner ? (
              <>
                <button 
                  className="comment-action-btn comment-action-btn--edit"
                  onClick={handleEdit}
                  aria-label="Edit comment"
                >
                  Edit
                </button>
                <button 
                  className="comment-action-btn comment-action-btn--delete"
                  onClick={handleDelete}
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              </>
            ) : (
              <button 
                className="comment-action-btn comment-action-btn--report"
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
            className="comment-body"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}

        {/* Comment Footer */}
        <div className="comment-footer">
          <button 
            className="comment-reply-btn"
            onClick={handleReply}
            disabled={depth >= maxDepth}
          >
            {depth >= maxDepth ? 'Max depth reached' : 'Reply'}
          </button>
          
          {hasReplies && (
            <button 
              className="comment-toggle-btn"
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
          <div className="comment-reply-form">
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
        <div className="comment-replies">
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