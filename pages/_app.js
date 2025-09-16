import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import Layout from '../components/Layout';
import NotificationContainer from '../components/ui/NotificationToast';
import ReportModal from '../components/reports/ReportModal';
import ConsentBanner from '../components/ui/ConsentBanner';
import NotificationCenter from '../components/ui/NotificationCenter';
import { trackPageView } from '../src/analytics/dataLayer';
import '../src/App.css';
import '../src/styles/pages.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Track page views for analytics
    trackPageView();
  }, []);

  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>

      {/* Global UI Components */}
      <NotificationContainer />
      <ReportModal />
      <ConsentBanner />
      <NotificationCenter />
    </Provider>
  );
}