import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import RatingStars from '../ui/RatingStars';
import { fetchReviewsByDeal, clearError, setCurrentDeal, clearReviews } from '../../lib/store/slices/reviewsSlice';
import styles from './ReviewList.module.css';

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
  const loadReviews = useCallback(async (page = 1, sort = sortOrder, replace = false) => {
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
  }, [dealId, sortOrder, dispatch]);

  useEffect(() => {
    if (dealId && dealId !== currentDealId) {
      dispatch(setCurrentDeal(dealId));
      dispatch(clearReviews());
      loadReviews(1, sortOrder, true);
    }
  }, [dealId, currentDealId, dispatch, loadReviews, sortOrder]);

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
      <div className={styles.reviewsSection}>
        <LoadingSpinner size="large" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className={styles.reviewsSection}>
      {/* Reviews Header & Stats */}
      <div className={styles.reviewsHeader}>
        <div className={styles.reviewsStats}>
          <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
          <div className={styles.ratingSummary}>
            {dealStats.review_count > 0 ? (
              <>
                <div className={styles.overallRating}>
                  <RatingStars 
                    rating={dealStats.avg_rating} 
                    size="large" 
                    showValue={true}
                  />
                  <span className={styles.reviewCount}>
                    Based on {dealStats.review_count} review{dealStats.review_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.noReviewsSummary}>
                <RatingStars rating={0} size="large" />
                <span className={styles.noReviewsText}>No reviews yet</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.reviewsActions}>
          {isAuthenticated && (
            <button 
              className={styles.writeReviewBtn}
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
        <div className={styles.reviewsError} role="alert">
          <p>⚠️ {error}</p>
          <button 
            className={styles.retryBtn}
            onClick={() => loadReviews(1, sortOrder, true)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Reviews Controls */}
      {reviews.length > 0 && (
        <div className={styles.reviewsControls}>
          <div className={styles.sortControls}>
            <label htmlFor="sort-select" className={styles.sortLabel}>
              Sort by:
            </label>
            <select
              id="sort-select"
              className={styles.sortSelect}
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
      <div className={styles.reviewsList}>
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
              <div className={styles.loadMoreSection}>
                <button
                  className={styles.loadMoreBtn}
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
          <div className={styles.noReviews}>
            <div className={styles.noReviewsContent}>
              <h3>No reviews yet</h3>
              <p>Be the first to share your experience with this deal!</p>
              {isAuthenticated && (
                <button 
                  className={styles.firstReviewBtn}
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
