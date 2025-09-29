import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './ReportStats.module.css';

const STAT_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#ffc107',
    icon: '⏳',
    description: 'Reports awaiting review'
  },
  reviewing: {
    label: 'Under Review',
    color: '#007bff',
    icon: '👀',
    description: 'Reports being investigated'
  },
  dismissed: {
    label: 'Dismissed',
    color: '#28a745',
    icon: '✅',
    description: 'Reports found to be invalid'
  },
  action_taken: {
    label: 'Action Taken',
    color: '#dc3545',
    icon: '⚡',
    description: 'Reports that resulted in action'
  }
};

const ReportStats = ({ stats, loading, onFilterSelect, currentFilter }) => {
  const handleStatClick = (filter) => {
    if (onFilterSelect) {
      onFilterSelect(filter);
    }
  };

  if (loading && stats.total === 0) {
    return (
      <div className={styles.reportStats}>
        <LoadingSpinner size="medium" text="Loading statistics..." />
      </div>
    );
  }

  // Calculate percentages for visual representation
  const getPercentage = (value) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className={styles.reportStats}>
      <div className={styles.statsHeader}>
        <h2>Moderation Statistics</h2>
        <div className={styles.totalReports}>
          <span className={styles.totalNumber}>{stats.total}</span>
          <span className={styles.totalLabel}>Total Reports</span>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        {Object.entries(STAT_CONFIG).map(([key, config]) => {
          const count = stats[key] || 0;
          const percentage = getPercentage(count);
          const isActive = currentFilter === key;
          
          return (
            <button
              key={key}
              className={`${styles.statCard} ${isActive ? styles.statCardActive : ''} ${count === 0 ? styles.statCardEmpty : ''}`}
              onClick={() => handleStatClick(key)}
              aria-label={`${config.label}: ${count} reports`}
            >
              <div className={styles.statIcon} style={{ color: config.color }}>
                {config.icon}
              </div>
              
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: config.color }}>
                  {count}
                </div>
                <div className={styles.statLabel}>
                  {config.label}
                </div>
                <div className={styles.statDescription}>
                  {config.description}
                </div>
              </div>
              
              <div className={styles.statVisual}>
                <div 
                  className={styles.statBar}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: config.color
                  }}
                />
                <div className={styles.statPercentage}>
                  {percentage}%
                </div>
              </div>
              
              {count > 0 && (
                <div className={styles.statBadge} style={{ backgroundColor: config.color }}>
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button 
          className={`${styles.quickAction} ${currentFilter === 'all' ? styles.quickActionActive : ''}`}
          onClick={() => handleStatClick('all')}
        >
          📊 View All Reports
        </button>
        
        {stats.pending > 0 && (
          <button 
            className={`${styles.quickAction} ${currentFilter === 'pending' ? styles.quickActionActive : ''}`}
            onClick={() => handleStatClick('pending')}
          >
            🔴 {stats.pending} Need{stats.pending === 1 ? 's' : ''} Attention
          </button>
        )}
      </div>
      
      {/* Health Indicator */}
      <div className={`${styles.moderationHealth} ${styles[getHealthStatus(stats)]}`}>
        <div className={styles.healthLabel}>Moderation Health:</div>
        <div className={`${styles.healthIndicator} ${styles[getHealthStatus(stats)]}`}>
          {getHealthMessage(stats)}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getHealthStatus = (stats) => {
  const pendingRatio = stats.total > 0 ? stats.pending / stats.total : 0;
  
  if (pendingRatio >= 0.5) return 'health--critical';
  if (pendingRatio >= 0.3) return 'health--warning';
  return 'health--good';
};

const getHealthMessage = (stats) => {
  const pendingRatio = stats.total > 0 ? stats.pending / stats.total : 0;
  
  if (stats.total === 0) return '🎯 No reports yet';
  if (pendingRatio >= 0.5) return '🔴 Many pending reports - immediate attention needed';
  if (pendingRatio >= 0.3) return '🟡 Some reports need review';
  return '🟢 All reports are being handled well';
};

export default ReportStats;
