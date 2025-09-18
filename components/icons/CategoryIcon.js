/**
 * Professional Category Icon Component
 * Replaces hardcoded emoji with scalable SVG icons
 */

import React from 'react';
import styles from './CategoryIcon.module.css';

const CategoryIcon = ({ category, size = 24, className = '' }) => {
  const getSizeClass = () => {
    if (size <= 16) return styles['categoryIcon--small'];
    if (size <= 24) return styles['categoryIcon--medium'];
    if (size <= 32) return styles['categoryIcon--large'];
    return styles['categoryIcon--xlarge'];
  };

  const getCategoryClass = () => {
    const categoryKey = category.toLowerCase().replace(/-/g, '');
    return styles[`categoryIcon--${categoryKey}`] || '';
  };

  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className: `${styles.categoryIcon} ${getSizeClass()} ${getCategoryClass()} ${className}`.trim(),
  };

  const getIconSVG = () => {
    switch (category.toLowerCase()) {
      case 'smartphones':
      case 'refurbished-tech':
        return (
          <svg {...iconProps}>
            <path d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>
          </svg>
        );

      case 'laptops':
      case 'computers':
        return (
          <svg {...iconProps}>
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5z"/>
          </svg>
        );

      case 'smart-home':
      case 'home':
        return (
          <svg {...iconProps}>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        );

      case 'gaming':
      case 'games':
        return (
          <svg {...iconProps}>
            <path d="M15.5 9.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm4-1.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-3 5.5h-2v2h-2v-2H9v-2h2.5V11h2v1.5H16v2zm6-1.5c0 3.31-2.69 6-6 6H7c-3.31 0-6-2.69-6-6s2.69-6 6-6h10c3.31 0 6 2.69 6 6z"/>
          </svg>
        );

      case 'open-box':
      case 'electronics':
        return (
          <svg {...iconProps}>
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.95 4.16-.21 8-4.4 8-9.95V7l-10-5z"/>
          </svg>
        );

      case 'audio':
      case 'headphones':
        return (
          <svg {...iconProps}>
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
        );

      default:
        return (
          <svg {...iconProps}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
    }
  };

  return getIconSVG();
};

export default CategoryIcon;