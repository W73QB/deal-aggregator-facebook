import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DealsPage from './pages/DealsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import NotificationContainer from './components/ui/NotificationToast';
import ReportModal from './components/reports/ReportModal';
import ConsentBanner from './components/ui/ConsentBanner';
import NotificationCenter from './components/ui/NotificationCenter';
import { trackPageView } from './analytics/dataLayer';
import './App.css';

const App = () => {
  React.useEffect(() => {
    // Track page views for analytics
    trackPageView();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              {/* Add more routes as needed */}
          </Routes>
        </Layout>

        {/* Global UI Components */}
        <NotificationContainer />
        <ReportModal />
        <ConsentBanner />
        <NotificationCenter />
      </Router>
    </Provider>
  );
};

export default App;