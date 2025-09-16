import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import RatingStars from '../ui/RatingStars';
import { voteOnReview, deleteReview } from '../../src/store/slices/reviewsSlice';
import { addNotification } from '../../src/store/slices/notificationSlice';
import './ReviewCard.css';

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
    <div className="review-card" role="article" aria-labelledby={`review-title-${review.id}`}>
      <div className="review-header">
        <div className="review-author">
          <div className="author-info">
            <h4 className="author-name">
              {review.user.first_name} {review.user.last_name}
            </h4>
            {review.is_verified && (
              <span className="verified-badge" aria-label="Verified reviewer">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="review-meta">
            <RatingStars rating={review.rating} size="small" />
            <span className="review-date">
              {updatedDate && updatedDate !== createdDate ? `Updated ${updatedDate}` : createdDate}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="review-actions">
            {isOwner ? (
              <>
                <button 
                  className="action-btn action-btn--edit"
                  onClick={() => onEdit(review)}
                  aria-label="Edit review"
                >
                  Edit
                </button>
                <button 
                  className="action-btn action-btn--delete"
                  onClick={handleDelete}
                  aria-label="Delete review"
                >
                  Delete
                </button>
              </>
            ) : (
              <button 
                className="action-btn action-btn--report"
                onClick={handleReport}
                aria-label="Report review"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>

      <div className="review-content">
        <h5 id={`review-title-${review.id}`} className="review-title">
          {review.title}
        </h5>
        <div 
          className="review-text"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>

      <div className="review-footer">
        <div className="vote-section">
          <span className="vote-label">Was this helpful?</span>
          <div className="vote-buttons">
            <button
              className={`vote-btn vote-btn--helpful ${voting ? 'vote-btn--loading' : ''}`}
              onClick={() => handleVote(true)}
              disabled={voting || isOwner}
              aria-label="Mark as helpful"
            >
              👍 Helpful ({review.helpful_count})
            </button>
            <button
              className={`vote-btn vote-btn--not-helpful ${voting ? 'vote-btn--loading' : ''}`}
              onClick={() => handleVote(false)}
              disabled={voting || isOwner}
              aria-label="Mark as not helpful"
            >
              👎 Not helpful
            </button>
          </div>
        </div>
        
        <div className="vote-stats">
          {review.total_votes > 0 && (
            <span className="vote-count">
              {review.total_votes} of {review.total_votes} found this helpful
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;