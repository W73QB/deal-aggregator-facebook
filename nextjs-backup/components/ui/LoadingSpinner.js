import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', color = '#007bff', text = null }) => {
  const sizeClass = styles[`loading-spinner--${size}`];
  
  return (
    <div className={styles.loadingContainer} role="status" aria-label={text || 'Loading'}>
      <div 
        className={`${styles.loadingSpinner} ${sizeClass}`}
        style={{ borderTopColor: color }}
      ></div>
      {text && (
        <span className={styles.loadingText} aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
