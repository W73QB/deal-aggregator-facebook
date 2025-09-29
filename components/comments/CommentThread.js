import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  fetchCommentsByDeal, 
  fetchCommentsByReview, 
  clearComments, 
  setCurrentContext,
  clearError,
  updateComment,
  createComment
} from '../../lib/store/slices/commentsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import styles from './CommentThread.module.css';

const CommentThread = ({ dealId, reviewId }) => {
  const dispatch = useDispatch();
  const { 
    commentTree, 
    pagination, 
    loading, 
    error, 
    currentDealId, 
    currentReviewId 
  } = useSelector(state => state.comments);
  const { isAuthenticated } = useSelector(state => state.auth);

  // Load comments when component mounts or context changes
  useEffect(() => {
    const contextChanged = dealId !== currentDealId || reviewId !== currentReviewId;
    
    if (contextChanged) {
      dispatch(setCurrentContext({ dealId, reviewId }));
      dispatch(clearComments());
      loadComments();
    }
  }, [dealId, reviewId, currentDealId, currentReviewId, dispatch]);

  const loadComments = async () => {
    dispatch(clearError());
    
    try {
      if (dealId) {
        await dispatch(fetchCommentsByDeal({ dealId, page: 1, limit: 50 })).unwrap();
      } else if (reviewId) {
        await dispatch(fetchCommentsByReview({ reviewId, page: 1, limit: 50 })).unwrap();
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const commentData = {
        content: content.trim(),
        parent_id: parentId,
        ...(dealId && { deal_id: dealId }),
        ...(reviewId && { review_id: reviewId })
      };

      await dispatch(createComment(commentData)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Reply posted successfully!',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to post reply',
        duration: 4000
      }));
      throw error; // Re-throw to handle in CommentCard
    }
  };

  const handleEdit = async (commentId, content) => {
    try {
      await dispatch(updateComment({ id: commentId, content: content.trim() })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Comment updated successfully!',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update comment',
        duration: 4000
      }));
      throw error; // Re-throw to handle in CommentCard
    }
  };

  const handleRetry = () => {
    loadComments();
  };

  if (loading && !commentTree.length) {
    return (
      <div className={styles.commentThread}>
        <div className={styles.commentsHeader}>
          <h3>Comments</h3>
        </div>
        <LoadingSpinner size="medium" text="Loading comments..." />
      </div>
    );
  }

  return (
    <div className={styles.commentThread}>
      {/* Comments Header */}
      <div className={styles.commentsHeader}>
        <h3>
          Comments {pagination.total_items > 0 && `(${pagination.total_items})`}
        </h3>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.commentsError} role="alert">
          <p>⚠️ {error}</p>
          <button className={styles.retryBtn} onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      {/* New Comment Form */}
      <div className={styles.newCommentSection}>
        <CommentForm
          dealId={dealId}
          reviewId={reviewId}
          placeholder={`Add a comment${reviewId ? ' to this review' : ' about this deal'}...`}
          onSuccess={loadComments}
        />
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {commentTree.length > 0 ? (
          <>
            {commentTree.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                onReply={handleReply}
                onEdit={handleEdit}
              />
            ))}
            
            {/* Load More Section (for future pagination) */}
            {pagination.has_next && (
              <div className={styles.loadMoreComments}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => {
                    // Implementation for loading more comments
                    dispatch(addNotification({
                      type: 'info',
                      message: 'Load more functionality coming soon',
                      duration: 2000
                    }));
                  }}
                >
                  Load More Comments ({pagination.total_items - commentTree.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div className={styles.noComments}>
            <div className={styles.noCommentsContent}>
              <h4>No comments yet</h4>
              <p>
                {isAuthenticated 
                  ? "Be the first to share your thoughts!" 
                  : "Login to join the conversation."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;
