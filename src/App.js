import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import NotificationContainer from './components/ui/NotificationToast';
import ReportModal from './components/reports/ReportModal';
import ReviewList from './components/reviews/ReviewList';
import CommentThread from './components/comments/CommentThread';
import ModerationDashboard from './components/admin/ModerationDashboard';
import AdminNotificationBadge from './components/admin/AdminNotificationBadge';
import ConsentBanner from './components/ui/ConsentBanner';
import NotificationBadge from './components/ui/NotificationBadge';
import NotificationCenter from './components/ui/NotificationCenter';
import { trackAuthLogin } from './analytics/events';
import { trackPageView } from './analytics/dataLayer';
import './App.css';

const App = () => {
  // Mock user for demo - in real app this would come from authentication
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentView, setCurrentView] = React.useState('reviews');
  const [selectedDeal, setSelectedDeal] = React.useState('sample-deal-123');

  React.useEffect(() => {
    // Simulate login for demo
    const mockUser = {
      id: 'user-123',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@dealradarus.com',
      role: 'admin' // Change to 'user' to test non-admin experience
    };

    // Simulate authentication
    store.dispatch({
      type: 'auth/loginSuccess',
      payload: {
        user: mockUser,
        token: 'mock-jwt-token-123'
      }
    });

    setCurrentUser(mockUser);
    
    // Track analytics events
    trackAuthLogin('demo', true);
    trackPageView();
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <Provider store={store}>
      <div className="app">
        {/* Header Navigation */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <h1>DealRadarUS - UGC Demo</h1>
            </div>
            
            <nav className="nav-menu">
              <button 
                className={`nav-btn ${currentView === 'reviews' ? 'nav-btn--active' : ''}`}
                onClick={() => handleViewChange('reviews')}
              >
                📝 Reviews & Comments
              </button>
              
              {currentUser?.role === 'admin' && (
                <button 
                  className={`nav-btn ${currentView === 'moderation' ? 'nav-btn--active' : ''}`}
                  onClick={() => handleViewChange('moderation')}
                >
                  🛡️ Moderation
                  <AdminNotificationBadge className="nav-badge" />
                </button>
              )}
            </nav>

            <div className="user-info">
              <NotificationBadge />
              {currentUser ? (
                <div className="user-profile">
                  <span className="user-name">
                    {currentUser.first_name} {currentUser.last_name}
                  </span>
                  <span className="user-role">
                    {currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
              ) : (
                <button className="login-btn">Login</button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          {currentView === 'reviews' && (
            <div className="reviews-demo">
              <div className="demo-info">
                <h2>UGC Frontend Demo - Deal: {selectedDeal}</h2>
                <p>This demo showcases the complete UGC system with reviews, threaded comments, and reporting.</p>
                <div className="demo-features">
                  <span className="feature-tag">✅ Star Ratings</span>
                  <span className="feature-tag">💬 Threaded Comments</span>
                  <span className="feature-tag">🚨 Content Reporting</span>
                  <span className="feature-tag">🔔 Real-time Notifications</span>
                  <span className="feature-tag">♿ Accessibility Ready</span>
                </div>
              </div>

              {/* Reviews Section */}
              <section className="content-section">
                <ReviewList dealId={selectedDeal} />
              </section>

              {/* Comments Section */}
              <section className="content-section">
                <CommentThread dealId={selectedDeal} />
              </section>
            </div>
          )}

          {currentView === 'moderation' && currentUser?.role === 'admin' && (
            <div className="moderation-demo">
              <ModerationDashboard />
            </div>
          )}

          {currentView === 'moderation' && currentUser?.role !== 'admin' && (
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>Admin privileges required to access moderation dashboard.</p>
            </div>
          )}
        </main>

        {/* Global UI Components */}
        <NotificationContainer />
        <ReportModal />
        <ConsentBanner />
        <NotificationCenter />

        {/* Demo Instructions */}
        <div className="demo-instructions">
          <details>
            <summary>🎯 Demo Instructions</summary>
            <div className="instructions-content">
              <h4>Try these features:</h4>
              <ul>
                <li><strong>Reviews:</strong> Write, edit, delete reviews with star ratings</li>
                <li><strong>Comments:</strong> Post comments and nested replies</li>
                <li><strong>Voting:</strong> Vote on review helpfulness</li>
                <li><strong>Reporting:</strong> Report inappropriate content</li>
                <li><strong>Moderation:</strong> (Admin only) Manage reported content</li>
                <li><strong>Notifications:</strong> Real-time feedback for all actions</li>
              </ul>
              <p><strong>Note:</strong> This is a frontend demo. API calls will simulate responses.</p>
            </div>
          </details>
        </div>
      </div>
    </Provider>
  );
};

export default App;