import React from 'react';
import './RatingStars.css';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  interactive = false, 
  size = 'medium',
  onRatingChange = null,
  showValue = false
}) => {
  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarKeyPress = (e, starValue) => {
    if ((e.key === 'Enter' || e.key === ' ') && interactive && onRatingChange) {
      e.preventDefault();
      onRatingChange(starValue);
    }
  };

  const getStarClass = (starIndex) => {
    const baseClass = 'rating-star';
    const classes = [baseClass, `rating-star--${size}`];
    
    if (interactive) {
      classes.push('rating-star--interactive');
    }
    
    if (starIndex <= rating) {
      classes.push('rating-star--filled');
    } else if (starIndex - 0.5 <= rating) {
      classes.push('rating-star--half');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="rating-stars" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={getStarClass(starValue)}
            onClick={() => handleStarClick(starValue)}
            onKeyPress={(e) => handleStarKeyPress(e, starValue)}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? starValue === Math.ceil(rating) : undefined}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
      {showValue && (
        <span className="rating-value" aria-hidden="true">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;