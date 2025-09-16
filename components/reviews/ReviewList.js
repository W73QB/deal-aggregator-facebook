import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import RatingStars from '../ui/RatingStars';
import { fetchReviewsByDeal, clearError, setCurrentDeal, clearReviews } from '../../src/store/slices/reviewsSlice';
import './ReviewList.css';

const ReviewList = ({ dealId }) => {
  const dispatch = useDispatch();
  const { 
    reviews, 
    dealStats, 
    pagination, 
    loading, 
    error,
    currentDealId 
  } = useSelector(state => state.reviews);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loadingMore, setLoadingMore] = useState(false);

  // Load reviews when component mounts or dealId changes
  useEffect(() => {
    if (dealId && dealId !== currentDealId) {
      dispatch(setCurrentDeal(dealId));
      dispatch(clearReviews());
      loadReviews(1, sortOrder, true);
    }
  }, [dealId, currentDealId, dispatch]);

  const loadReviews = async (page = 1, sort = sortOrder, replace = false) => {
    if (replace) {
      dispatch(clearError());
    } else {
      setLoadingMore(true);
    }
    
    try {
      await dispatch(fetchReviewsByDeal({ 
        dealId, 
        page, 
        limit: 10, 
        sort 
      })).unwrap();
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      if (!replace) {
        setLoadingMore(false);
      }
    }
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    loadReviews(1, newSort, true);
  };

  const handleLoadMore = () => {
    if (pagination.has_next && !loadingMore) {
      loadReviews(pagination.page + 1, sortOrder, false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    // Reload current page to show updated data
    loadReviews(1, sortOrder, true);
  };

  const handleWriteReview = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  if (loading && !reviews.length) {
    return (
      <div className="reviews-section">
        <LoadingSpinner size="large" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="reviews-section">
      {/* Reviews Header & Stats */}
      <div className="reviews-header">
        <div className="reviews-stats">
          <h2 className="reviews-title">Customer Reviews</h2>
          <div className="rating-summary">
            {dealStats.review_count > 0 ? (
              <>
                <div className="overall-rating">
                  <RatingStars 
                    rating={dealStats.avg_rating} 
                    size="large" 
                    showValue={true}
                  />
                  <span className="review-count">
                    Based on {dealStats.review_count} review{dealStats.review_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </>
            ) : (
              <div className="no-reviews-summary">
                <RatingStars rating={0} size="large" />
                <span className="no-reviews-text">No reviews yet</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="reviews-actions">
          {isAuthenticated && (
            <button 
              className="write-review-btn"
              onClick={handleWriteReview}
              disabled={showForm}
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          dealId={dealId}
          editingReview={editingReview}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="reviews-error" role="alert">
          <p>⚠️ {error}</p>
          <button 
            className="retry-btn"
            onClick={() => loadReviews(1, sortOrder, true)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Reviews Controls */}
      {reviews.length > 0 && (
        <div className="reviews-controls">
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                showActions={true}
              />
            ))}
            
            {/* Load More Button */}
            {pagination.has_next && (
              <div className="load-more-section">
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <LoadingSpinner size="small" text="Loading more..." />
                  ) : (
                    `Load More Reviews (${pagination.total_items - reviews.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div className="no-reviews">
            <div className="no-reviews-content">
              <h3>No reviews yet</h3>
              <p>Be the first to share your experience with this deal!</p>
              {isAuthenticated && (
                <button 
                  className="first-review-btn"
                  onClick={handleWriteReview}
                >
                  Write the First Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;