import React from 'react';
import styles from './RatingStars.module.css';

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

  const handleStarKeyDown = (e, starValue) => {
    if ((e.key === 'Enter' || e.key === ' ') && interactive && onRatingChange) {
      e.preventDefault();
      onRatingChange(starValue);
    }
  };

  const getStarClass = (starIndex) => {
    const classes = [styles.ratingStar, styles[`ratingStar--${size}`]];

    if (interactive) {
      classes.push(styles['ratingStar--interactive']);
    }

    if (starIndex <= rating) {
      classes.push(styles['ratingStar--filled']);
    } else if (starIndex - 0.5 <= rating) {
      classes.push(styles['ratingStar--half']);
    }

    return classes.join(' ');
  };

  return (
    <div className={styles.ratingStars} role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={getStarClass(starValue)}
            onClick={() => handleStarClick(starValue)}
            onKeyDown={(e) => handleStarKeyDown(e, starValue)}
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
        <span className={styles.ratingValue} aria-hidden="true">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;