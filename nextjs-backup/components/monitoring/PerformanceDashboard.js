/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and error tracking visualization
 */

import React, { useState, useEffect } from 'react';
import { getErrorTracker } from '../../lib/monitoring/errorTracking';

const PerformanceDashboard = ({ isAdmin = false }) => {
  const [metrics, setMetrics] = useState({
    errors: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      recent: []
    },
    performance: {
      lcp: null,
      fid: null,
      cls: null,
      loadTime: null,
      renderTime: null
    },
    health: {
      isOnline: true,
      sessionId: null,
      errorCount: 0,
      timestamp: null
    }
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    // Initialize performance monitoring
    const tracker = getErrorTracker();

    // Get initial health status
    const health = tracker.getHealthStatus();
    setMetrics(prev => ({
      ...prev,
      health
    }));

    // Monitor Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            lcp: Math.round(lastEntry.startTime)
          }
        }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        setMetrics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            fid: Math.round(firstEntry.processingStart - firstEntry.startTime)
          }
        }));
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        setMetrics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            cls: Math.round(clsValue * 1000) / 1000
          }
        }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Page Load Time
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            renderTime: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)
          }
        }));
      }
    }

    // Fetch error summary periodically
    const fetchErrorSummary = async () => {
      try {
        const response = await fetch('/api/errors/summary');
        if (response.ok) {
          const errorData = await response.json();
          setMetrics(prev => ({
            ...prev,
            errors: errorData
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch error summary:', error);
      }
    };

    // Initial fetch and periodic updates
    fetchErrorSummary();
    const interval = setInterval(fetchErrorSummary, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin || !isVisible) {
    return (
      <div className="performance-toggle">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="toggle-btn"
          title="Toggle Performance Dashboard"
        >
          📊
        </button>

        <style jsx>{`
          .performance-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
          }

          .toggle-btn {
            background: #1A73E8;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
            transition: all 0.3s ease;
          }

          .toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(26, 115, 232, 0.4);
          }
        `}</style>
      </div>
    );
  }

  const getPerformanceStatus = (metric, value) => {
    switch (metric) {
      case 'lcp':
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
      case 'fid':
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
      case 'cls':
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
      default:
        return 'unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#0f9d58';
      case 'needs-improvement': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#6c757d';
    }
  };

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h3>Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="close-btn"
        >
          ✕
        </button>
      </div>

      {/* Health Status */}
      <div className="health-section">
        <h4>System Health</h4>
        <div className="health-indicators">
          <div className={`indicator ${metrics.health.isOnline ? 'online' : 'offline'}`}>
            <span className="indicator-dot"></span>
            <span>{metrics.health.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="health-stat">
            <span className="stat-label">Session:</span>
            <span className="stat-value">{metrics.health.sessionId?.slice(-8) || 'N/A'}</span>
          </div>
          <div className="health-stat">
            <span className="stat-label">Queue:</span>
            <span className="stat-value">{metrics.health.errorCount} errors</span>
          </div>
        </div>
      </div>

      {/* Web Vitals */}
      <div className="vitals-section">
        <h4>Core Web Vitals</h4>
        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-label">LCP</div>
            <div
              className="vital-value"
              style={{ color: getStatusColor(getPerformanceStatus('lcp', metrics.performance.lcp)) }}
            >
              {metrics.performance.lcp ? `${metrics.performance.lcp}ms` : '—'}
            </div>
            <div className="vital-description">Largest Contentful Paint</div>
          </div>
          <div className="vital-card">
            <div className="vital-label">FID</div>
            <div
              className="vital-value"
              style={{ color: getStatusColor(getPerformanceStatus('fid', metrics.performance.fid)) }}
            >
              {metrics.performance.fid ? `${metrics.performance.fid}ms` : '—'}
            </div>
            <div className="vital-description">First Input Delay</div>
          </div>
          <div className="vital-card">
            <div className="vital-label">CLS</div>
            <div
              className="vital-value"
              style={{ color: getStatusColor(getPerformanceStatus('cls', metrics.performance.cls)) }}
            >
              {metrics.performance.cls !== null ? metrics.performance.cls : '—'}
            </div>
            <div className="vital-description">Cumulative Layout Shift</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="metrics-section">
        <h4>Load Performance</h4>
        <div className="metrics-list">
          <div className="metric-item">
            <span className="metric-label">Page Load:</span>
            <span className="metric-value">
              {metrics.performance.loadTime ? `${metrics.performance.loadTime}ms` : '—'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">DOM Ready:</span>
            <span className="metric-value">
              {metrics.performance.renderTime ? `${metrics.performance.renderTime}ms` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Summary */}
      <div className="errors-section">
        <h4>Error Summary</h4>
        <div className="error-stats">
          <div className="error-stat critical">
            <span className="error-count">{metrics.errors.critical}</span>
            <span className="error-label">Critical</span>
          </div>
          <div className="error-stat high">
            <span className="error-count">{metrics.errors.high}</span>
            <span className="error-label">High</span>
          </div>
          <div className="error-stat medium">
            <span className="error-count">{metrics.errors.medium}</span>
            <span className="error-label">Medium</span>
          </div>
          <div className="error-stat low">
            <span className="error-count">{metrics.errors.low}</span>
            <span className="error-label">Low</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .performance-dashboard {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 320px;
          max-height: 80vh;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e1e5e9;
          background: linear-gradient(135deg, #1A73E8 0%, #4285f4 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .dashboard-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .health-section,
        .vitals-section,
        .metrics-section,
        .errors-section {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f3f4;
        }

        .health-section h4,
        .vitals-section h4,
        .metrics-section h4,
        .errors-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .health-indicators {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .indicator.online .indicator-dot {
          background: #0f9d58;
        }

        .indicator.offline .indicator-dot {
          background: #f44336;
        }

        .health-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
        }

        .stat-label {
          color: #6c757d;
        }

        .stat-value {
          font-weight: 500;
          color: #1a1a1a;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .vital-card {
          text-align: center;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .vital-label {
          font-size: 11px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
        }

        .vital-value {
          font-size: 18px;
          font-weight: 700;
          margin: 4px 0;
        }

        .vital-description {
          font-size: 10px;
          color: #6c757d;
          line-height: 1.2;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .metric-label {
          color: #6c757d;
        }

        .metric-value {
          font-weight: 600;
          color: #1a1a1a;
        }

        .error-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .error-stat {
          text-align: center;
          padding: 8px 4px;
          border-radius: 6px;
          background: #f8f9fa;
        }

        .error-stat.critical {
          background: #ffebee;
          color: #c62828;
        }

        .error-stat.high {
          background: #fff3e0;
          color: #ef6c00;
        }

        .error-stat.medium {
          background: #fff8e1;
          color: #f57f17;
        }

        .error-stat.low {
          background: #f1f8e9;
          color: #388e3c;
        }

        .error-count {
          display: block;
          font-size: 16px;
          font-weight: 700;
        }

        .error-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 500;
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .performance-dashboard {
            width: 300px;
            top: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;