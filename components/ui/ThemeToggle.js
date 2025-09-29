import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`${styles.themeToggle} ${isDark ? styles.dark : styles.light}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb}>
          <span className="material-icons" aria-hidden="true">
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </div>
      </div>
      <span className={styles.toggleLabel}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;