import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* Material Icons */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />

        {/* Removed unused preload tags to eliminate console warnings */}

        {/* Critical CSS inline for LCP optimization */}
        <style>{`
          /* Critical above-the-fold styles */
          .hero {
            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 50%, #6366F1 100%);
            color: white;
            min-height: 60vh;
            display: flex;
            align-items: center;
          }

          .main-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            position: sticky;
            top: 0;
            z-index: 1000;
          }
        `}</style>

        {/* Favicon and theme color */}
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}