import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#007bff', text = null }) => {
  const sizeClass = `loading-spinner--${size}`;
  
  return (
    <div className="loading-container" role="status" aria-label={text || 'Loading'}>
      <div 
        className={`loading-spinner ${sizeClass}`}
        style={{ borderTopColor: color }}
      ></div>
      {text && (
        <span className="loading-text" aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;