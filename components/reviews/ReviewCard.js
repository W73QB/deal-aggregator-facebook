import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import RatingStars from '../ui/RatingStars';
import { voteOnReview, deleteReview } from '../../lib/store/slices/reviewsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import styles from './ReviewCard.module.css';

const ReviewCard = ({ review, onEdit, showActions = true }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [voting, setVoting] = useState(false);
  
  const isOwner = isAuthenticated && user?.id === review.user.id;
  const createdDate = new Date(review.created_at).toLocaleDateString();
  const updatedDate = review.updated_at ? new Date(review.updated_at).toLocaleDateString() : null;
  
  // Sanitize content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(review.content, { 
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });

  const handleVote = async (helpful) => {
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please login to vote on reviews',
        duration: 4000
      }));
      return;
    }

    if (isOwner) {
      dispatch(addNotification({
        type: 'info',
        message: 'You cannot vote on your own review',
        duration: 3000
      }));
      return;
    }

    setVoting(true);
    try {
      await dispatch(voteOnReview({ id: review.id, helpful })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: helpful ? 'Marked as helpful!' : 'Feedback recorded!',
        duration: 2000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to record vote',
        duration: 4000
      }));
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await dispatch(deleteReview(review.id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Review deleted successfully',
          duration: 3000
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to delete review',
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
        type: 'review',
        id: review.id,
        title: review.title,
        content: review.content
      }
    });
  };

  return (
    <div className={styles.reviewCard} role="article" aria-labelledby={`review-title-${review.id}`}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewAuthor}>
          <div className={styles.authorInfo}>
            <h4 className={styles.authorName}>
              {review.user.first_name} {review.user.last_name}
            </h4>
            {review.is_verified && (
              <span className={styles.verifiedBadge} aria-label="Verified reviewer">
                ✓ Verified
              </span>
            )}
          </div>
          <div className={styles.reviewMeta}>
            <RatingStars rating={review.rating} size="small" />
            <span className={styles.reviewDate}>
              {updatedDate && updatedDate !== createdDate ? `Updated ${updatedDate}` : createdDate}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className={styles.reviewActions}>
            {isOwner ? (
              <>
                <button 
                  className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                  onClick={() => onEdit(review)}
                  aria-label="Edit review"
                >
                  Edit
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                  onClick={handleDelete}
                  aria-label="Delete review"
                >
                  Delete
                </button>
              </>
            ) : (
              <button 
                className={`${styles.actionBtn} ${styles.actionBtnReport}`}
                onClick={handleReport}
                aria-label="Report review"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.reviewContent}>
        <h5 id={`review-title-${review.id}`} className={styles.reviewTitle}>
          {review.title}
        </h5>
        <div 
          className={styles.reviewText}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>

      <div className={styles.reviewFooter}>
        <div className={styles.voteSection}>
          <span className={styles.voteLabel}>Was this helpful?</span>
          <div className={styles.voteButtons}>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnHelpful} ${voting ? styles.voteBtnLoading : ''}`}
              onClick={() => handleVote(true)}
              disabled={voting || isOwner}
              aria-label="Mark as helpful"
            >
              👍 Helpful ({review.helpful_count})
            </button>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnNotHelpful} ${voting ? styles.voteBtnLoading : ''}`}
              onClick={() => handleVote(false)}
              disabled={voting || isOwner}
              aria-label="Mark as not helpful"
            >
              👎 Not helpful
            </button>
          </div>
        </div>
        
        <div className={styles.voteStats}>
          {review.total_votes > 0 && (
            <span className={styles.voteCount}>
              {review.total_votes} of {review.total_votes} found this helpful
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
