import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../ui/LoadingSpinner';
import ReportCard from './ReportCard';
import ReportStats from './ReportStats';
import { 
  fetchReports, 
  fetchReportStats,
  setCurrentFilter,
  clearError 
} from '../../store/slices/reportsSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import './ModerationDashboard.css';

const FILTER_OPTIONS = {
  all: 'All Reports',
  pending: 'Pending Review',
  reviewing: 'Under Review',
  dismissed: 'Dismissed',
  action_taken: 'Action Taken'
};

const ModerationDashboard = () => {
  const dispatch = useDispatch();
  const { 
    reports, 
    stats,
    pagination, 
    loading, 
    statsLoading,
    error, 
    currentFilter 
  } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      dispatch(addNotification({
        type: 'error',
        message: 'Access denied. Admin privileges required.',
        duration: 4000
      }));
      return;
    }

    // Load initial data
    loadData();
  }, [isAdmin, currentFilter, dispatch]);

  const loadData = async () => {
    if (!isAdmin) return;
    
    dispatch(clearError());
    try {
      await Promise.all([
        dispatch(fetchReports({ 
          page: 1, 
          limit: 20, 
          status: currentFilter 
        })).unwrap(),
        dispatch(fetchReportStats()).unwrap()
      ]);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    }
  };

  const handleFilterChange = (filter) => {
    dispatch(setCurrentFilter(filter));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    
    dispatch(addNotification({
      type: 'success',
      message: 'Dashboard refreshed',
      duration: 2000
    }));
  };

  const handleLoadMore = async () => {
    if (!pagination.has_next || loading) return;
    
    try {
      await dispatch(fetchReports({ 
        page: pagination.page + 1, 
        limit: 20, 
        status: currentFilter 
      })).unwrap();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load more reports',
        duration: 4000
      }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="moderation-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access the moderation dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="moderation-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Content Moderation Dashboard</h1>
          <p>Review and manage reported content</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <LoadingSpinner size="small" />
            ) : (
              '🔄 Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <ReportStats 
        stats={stats} 
        loading={statsLoading}
        onFilterSelect={handleFilterChange}
        currentFilter={currentFilter}
      />

      {/* Error Display */}
      {error && (
        <div className="dashboard-error" role="alert">
          <p>⚠️ {error}</p>
          <button className="retry-btn" onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {Object.entries(FILTER_OPTIONS).map(([value, label]) => (
          <button
            key={value}
            className={`filter-tab ${currentFilter === value ? 'filter-tab--active' : ''}`}
            onClick={() => handleFilterChange(value)}
            disabled={loading}
          >
            {label}
            {stats[value] > 0 && (
              <span className="filter-badge">{stats[value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="reports-section">
        {loading && !reports.length ? (
          <LoadingSpinner size="large" text="Loading reports..." />
        ) : reports.length > 0 ? (
          <>
            <div className="reports-list">
              {reports.map((report) => (
                <ReportCard 
                  key={report.id}
                  report={report}
                  onUpdate={loadData}
                />
              ))}
            </div>
            
            {/* Load More */}
            {pagination.has_next && (
              <div className="load-more-section">
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small" text="Loading..." />
                  ) : (
                    `Load More (${pagination.total_items - reports.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-reports">
            <div className="no-reports-content">
              <h3>No reports found</h3>
              <p>
                {currentFilter === 'all' 
                  ? 'No reports have been submitted yet.'
                  : `No reports with "${FILTER_OPTIONS[currentFilter]}" status.`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard;