/**
 * Analytics Dashboard Component
 * Real-time analytics visualization and data insights
 */

import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = ({ isAdmin = false }) => {
  const [analyticsData, setAnalyticsData] = useState({
    summary: null,
    loading: true,
    error: null
  });

  const [timeRange, setTimeRange] = useState('today');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAnalyticsData = async () => {
      try {
        setAnalyticsData(prev => ({ ...prev, loading: true }));

        // In a real implementation, this would fetch from an analytics API
        // For now, we'll simulate data
        const mockData = await simulateAnalyticsData();

        setAnalyticsData({
          summary: mockData,
          loading: false,
          error: null
        });

      } catch (error) {
        setAnalyticsData({
          summary: null,
          loading: false,
          error: error.message
        });
      }
    };

    fetchAnalyticsData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000);
    return () => clearInterval(interval);

  }, [isAdmin, timeRange]);

  const simulateAnalyticsData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      date: new Date().toISOString().split('T')[0],
      totalEvents: 1247,
      uniqueSessionCount: 89,
      uniqueUserCount: 76,
      pageViews: 234,
      errors: 3,
      conversions: 12,
      eventsByType: {
        page_view: 234,
        click: 456,
        scroll: 123,
        deal_click: 67,
        deal_view: 145,
        search_query: 23,
        external_link_click: 34,
        javascript_error: 3
      },
      performance: {
        avgLoadTime: 1840,
        avgLCP: 2100,
        avgFID: 85,
        avgCLS: 0.12
      },
      business: {
        dealClicks: 67,
        dealViews: 145,
        searches: 23,
        externalLinks: 34
      },
      hourlyData: generateHourlyData(),
      topPages: [
        { path: '/', views: 89, uniqueViews: 67 },
        { path: '/deals', views: 56, uniqueViews: 44 },
        { path: '/blog', views: 34, uniqueViews: 28 },
        { path: '/about', views: 23, uniqueViews: 19 }
      ],
      topDeals: [
        { id: 'deal-123', title: 'iPhone 15 Pro', clicks: 23, views: 45 },
        { id: 'deal-456', title: 'MacBook Air M2', clicks: 18, views: 37 },
        { id: 'deal-789', title: 'AirPods Pro', clicks: 15, views: 29 }
      ]
    };
  };

  const generateHourlyData = () => {
    const hours = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      hours.push({
        hour: hour.getHours(),
        pageViews: Math.floor(Math.random() * 20) + 5,
        sessions: Math.floor(Math.random() * 15) + 3,
        events: Math.floor(Math.random() * 50) + 10
      });
    }

    return hours;
  };

  if (!isAdmin || !isVisible) {
    return (
      <div className="analytics-toggle">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="toggle-btn"
          title="Toggle Analytics Dashboard"
        >
          📈
        </button>

        <style jsx>{`
          .analytics-toggle {
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 9999;
          }

          .toggle-btn {
            background: #28a745;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            transition: all 0.3s ease;
          }

          .toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
          }
        `}</style>
      </div>
    );
  }

  if (analyticsData.loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>

        <style jsx>{`
          .analytics-dashboard.loading {
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .loading-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #28a745;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (analyticsData.error) {
    return (
      <div className="analytics-dashboard error">
        <div className="error-content">
          <h3>Analytics Error</h3>
          <p>{analyticsData.error}</p>
          <button onClick={() => setIsVisible(false)}>Close</button>
        </div>

        <style jsx>{`
          .analytics-dashboard.error {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 12px;
            padding: 20px;
            z-index: 9999;
            max-width: 300px;
          }

          .error-content h3 {
            color: #e53e3e;
            margin: 0 0 8px 0;
            font-size: 16px;
          }

          .error-content p {
            color: #742a2a;
            margin: 0 0 12px 0;
            font-size: 14px;
          }

          .error-content button {
            background: #e53e3e;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  const { summary } = analyticsData;

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h3>Analytics Dashboard</h3>
        <div className="dashboard-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>
          <button
            onClick={() => setIsVisible(false)}
            className="close-btn"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Key Metrics */}
        <div className="metrics-section">
          <h4>Key Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{summary.pageViews}</div>
              <div className="metric-label">Page Views</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{summary.uniqueSessionCount}</div>
              <div className="metric-label">Sessions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{summary.uniqueUserCount}</div>
              <div className="metric-label">Users</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{summary.conversions}</div>
              <div className="metric-label">Conversions</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="performance-section">
          <h4>Performance</h4>
          <div className="performance-grid">
            <div className="performance-item">
              <span className="performance-label">Load Time:</span>
              <span className="performance-value">{summary.performance.avgLoadTime}ms</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">LCP:</span>
              <span className="performance-value">{summary.performance.avgLCP}ms</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">FID:</span>
              <span className="performance-value">{summary.performance.avgFID}ms</span>
            </div>
            <div className="performance-item">
              <span className="performance-label">CLS:</span>
              <span className="performance-value">{summary.performance.avgCLS}</span>
            </div>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="business-section">
          <h4>Business Impact</h4>
          <div className="business-grid">
            <div className="business-item">
              <span className="business-value">{summary.business.dealViews}</span>
              <span className="business-label">Deal Views</span>
            </div>
            <div className="business-item">
              <span className="business-value">{summary.business.dealClicks}</span>
              <span className="business-label">Deal Clicks</span>
            </div>
            <div className="business-item">
              <span className="business-value">{summary.business.searches}</span>
              <span className="business-label">Searches</span>
            </div>
            <div className="business-item">
              <span className="business-value">{summary.business.externalLinks}</span>
              <span className="business-label">External Links</span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="pages-section">
          <h4>Top Pages</h4>
          <div className="pages-list">
            {summary.topPages.map((page, index) => (
              <div key={page.path} className="page-item">
                <span className="page-path">{page.path}</span>
                <span className="page-views">{page.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deals */}
        <div className="deals-section">
          <h4>Top Deals</h4>
          <div className="deals-list">
            {summary.topDeals.map((deal, index) => (
              <div key={deal.id} className="deal-item">
                <span className="deal-title">{deal.title}</span>
                <span className="deal-stats">{deal.clicks} clicks / {deal.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
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
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .dashboard-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-range-select {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .time-range-select option {
          background: #28a745;
          color: white;
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

        .dashboard-content {
          padding: 16px 20px;
        }

        .metrics-section,
        .performance-section,
        .business-section,
        .pages-section,
        .deals-section {
          margin-bottom: 20px;
        }

        .metrics-section h4,
        .performance-section h4,
        .business-section h4,
        .pages-section h4,
        .deals-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .metric-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #28a745;
          line-height: 1;
        }

        .metric-label {
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }

        .performance-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 12px;
        }

        .performance-label {
          color: #6c757d;
          font-weight: 500;
        }

        .performance-value {
          color: #1a1a1a;
          font-weight: 600;
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .business-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .business-value {
          font-size: 18px;
          font-weight: 700;
          color: #007bff;
          line-height: 1;
        }

        .business-label {
          font-size: 11px;
          color: #6c757d;
          margin-top: 2px;
        }

        .pages-list,
        .deals-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .page-item,
        .deal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 12px;
        }

        .page-path,
        .deal-title {
          font-weight: 500;
          color: #1a1a1a;
        }

        .page-views,
        .deal-stats {
          color: #6c757d;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .analytics-dashboard {
            width: 350px;
            top: 10px;
            right: 10px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .business-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;