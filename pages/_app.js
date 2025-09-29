import React, { Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Provider } from 'react-redux';
import { store } from '../lib/store/store';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { trackPageView } from '../lib/analytics/dataLayer';
import { initializeErrorTracking } from '../lib/monitoring/errorTracking';
import { initializeDataCollection } from '../lib/analytics/dataCollector';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/globals.css';

// Lazy load non-critical components for better performance
const NotificationContainer = dynamic(() => import('../components/ui/NotificationToast'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const ReportModal = dynamic(() => import('../components/reports/ReportModal'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const CookieBanner = dynamic(() => import('../components/ui/CookieBanner'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const ChatWidget = dynamic(() => import('../components/ui/ChatWidget'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const NotificationCenter = dynamic(() => import('../components/ui/NotificationCenter'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const PerformanceDashboard = dynamic(() => import('../components/monitoring/PerformanceDashboard'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const AnalyticsDashboard = dynamic(() => import('../components/analytics/AnalyticsDashboard'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

// Version tracking without forced reloads
const trackAppVersion = () => {
  if (typeof window !== 'undefined') {
    const currentVersion = 'v2.1.0';
    const lastVersion = localStorage.getItem('app-version');

    if (lastVersion !== currentVersion) {
      localStorage.setItem('app-version', currentVersion);
      console.log(`🚀 App updated to version ${currentVersion}`);
    }
  }
};

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Track app version without forcing reload
    trackAppVersion();

    // Track page views for analytics
    trackPageView();

    // Initialize comprehensive error tracking and monitoring
    initializeErrorTracking();

    // Initialize comprehensive data collection and analytics
    initializeDataCollection();
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
            "name": "DealRadarUS",
            "url": "https://dealradarus.com",
            "logo": "https://dealradarus.com/logo-concept.svg",
            "description": "Find the best deals from top US retailers. Smart deal aggregation platform with real-time price tracking and exclusive offers.",
            "sameAs": [
              "https://facebook.com/dealradarus",
              "https://twitter.com/dealradarus"
            ],
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://dealradarus.com/deals?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "12500"
            },
            "founder": {
              "@type": "Person",
              "name": "DealRadar Team"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            }
          })}
        </script>
      </Head>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider>
            <AuthProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>

            {/* Global UI Components - Lazy loaded for performance */}
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationContainer />
              <ReportModal />
              <CookieBanner />
              <ChatWidget />
              <NotificationCenter />
              <PerformanceDashboard isAdmin={true} />
              <AnalyticsDashboard isAdmin={true} />
            </Suspense>
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </>
  );
}