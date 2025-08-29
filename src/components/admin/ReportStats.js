import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import './ReportStats.css';

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
      <div className="report-stats">
        <LoadingSpinner size="medium" text="Loading statistics..." />
      </div>
    );
  }

  // Calculate percentages for visual representation
  const getPercentage = (value) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className="report-stats">
      <div className="stats-header">
        <h2>Moderation Statistics</h2>
        <div className="total-reports">
          <span className="total-number">{stats.total}</span>
          <span className="total-label">Total Reports</span>
        </div>
      </div>
      
      <div className="stats-grid">
        {Object.entries(STAT_CONFIG).map(([key, config]) => {
          const count = stats[key] || 0;
          const percentage = getPercentage(count);
          const isActive = currentFilter === key;
          
          return (
            <button
              key={key}
              className={`stat-card ${isActive ? 'stat-card--active' : ''} ${count === 0 ? 'stat-card--empty' : ''}`}
              onClick={() => handleStatClick(key)}
              aria-label={`${config.label}: ${count} reports`}
            >
              <div className="stat-icon" style={{ color: config.color }}>
                {config.icon}
              </div>
              
              <div className="stat-content">
                <div className="stat-number" style={{ color: config.color }}>
                  {count}
                </div>
                <div className="stat-label">
                  {config.label}
                </div>
                <div className="stat-description">
                  {config.description}
                </div>
              </div>
              
              <div className="stat-visual">
                <div 
                  className="stat-bar"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: config.color
                  }}
                />
                <div className="stat-percentage">
                  {percentage}%
                </div>
              </div>
              
              {count > 0 && (
                <div className="stat-badge" style={{ backgroundColor: config.color }}>
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className={`quick-action ${currentFilter === 'all' ? 'quick-action--active' : ''}`}
          onClick={() => handleStatClick('all')}
        >
          📊 View All Reports
        </button>
        
        {stats.pending > 0 && (
          <button 
            className={`quick-action ${currentFilter === 'pending' ? 'quick-action--active' : ''}`}
            onClick={() => handleStatClick('pending')}
          >
            🔴 {stats.pending} Need{stats.pending === 1 ? 's' : ''} Attention
          </button>
        )}
      </div>
      
      {/* Health Indicator */}
      <div className="moderation-health">
        <div className="health-label">Moderation Health:</div>
        <div className={`health-indicator ${getHealthStatus(stats)}`}>
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