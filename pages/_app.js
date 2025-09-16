import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { store } from '../lib/store/store';
import Layout from '../components/Layout';
import NotificationContainer from '../components/ui/NotificationToast';
import ReportModal from '../components/reports/ReportModal';
import ConsentBanner from '../components/ui/ConsentBanner';
import NotificationCenter from '../components/ui/NotificationCenter';
import { trackPageView } from '../lib/analytics/dataLayer';
import '../styles/globals.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Track page views for analytics
    trackPageView();
  }, []);

  return (
    <>
      <Head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-concept.svg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DealRadar US",
            "url": "https://deal-aggregator-facebook.vercel.app",
            "logo": "https://deal-aggregator-facebook.vercel.app/logo-concept.svg",
            "description": "Find the best deals from top US retailers. Smart deal aggregation platform with real-time price tracking and exclusive offers.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://deal-aggregator-facebook.vercel.app/deals?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Head>
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
    </>
  );
}