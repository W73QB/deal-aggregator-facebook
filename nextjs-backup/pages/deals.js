/**
 * Deals Page - Client-Side Data Fetching
 * Fetches deals directly from Railway API via useDeals hook
 */

import React from 'react';
import Head from 'next/head';
import DealsPage from '../components/pages/DealsPage';
import { generateProductListSchema, generateBreadcrumbSchema, safeJSONStringify } from '../lib/schema/generators';
import { useDeals } from '../hooks/useDeals';

export default function Deals() {
  // Client-side data fetching from Railway API
  const { deals, loading, error, meta } = useDeals({
    limit: '50',
    featured: 'true',
    sort: 'rating'
  });

  // Calculate savings
  const totalSavings = deals.reduce((sum, deal) => {
    const original = deal.originalPrice || 0;
    const sale = deal.salePrice || deal.price || 0;
    return sum + Math.max(0, original - sale);
  }, 0);

  // Show loading state
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Deals... - DealRadarUS</title>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading amazing deals...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Head>
          <title>Error Loading Deals - DealRadarUS</title>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ color: '#e74c3c', margin: 0 }}>Unable to Load Deals</h2>
          <p style={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>
            {error || 'Please try again later or contact support.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  // Show deals
  // Featured deals filtered where needed in child component

  // Generate structured data
  const productListSchema = generateProductListSchema(deals, "Latest Tech Deals");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Deals", url: "/deals" }
  ]);

  return (
    <>
      <Head>
        <title>Latest Tech Deals - DealRadarUS ({deals.length} Deals)</title>
        <meta name="description" content={`Browse ${deals.length} latest and best tech deals, discounts, and offers curated by DealRadarUS. Find amazing savings on electronics, gadgets, and more. Save up to $${totalSavings.toLocaleString()}.`} />
        <meta property="og:title" content={`Latest Tech Deals - DealRadarUS (${deals.length} Deals)`} />
        <meta property="og:description" content={`Browse ${deals.length} latest and best tech deals, discounts, and offers curated by DealRadarUS.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/deals" />
        <meta property="og:image" content="https://dealradarus.com/og-share.png" />
        <meta property="og:image:alt" content="Latest Tech Deals from DealRadarUS" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Latest Tech Deals - DealRadarUS (${deals.length} Deals)`} />
        <meta name="twitter:description" content={`Browse ${deals.length} latest and best tech deals, discounts, and offers.`} />
        <meta name="twitter:image" content="https://dealradarus.com/og-share.png" />
        <link rel="canonical" href="https://dealradarus.com/deals" />

        {/* Enhanced Structured Data for SEO */}
        {productListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJSONStringify(productListSchema)
            }}
          />
        )}

        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJSONStringify(breadcrumbSchema)
            }}
          />
        )}

        {/* Collection Page Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJSONStringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Latest Tech Deals - DealRadarUS",
              "description": `Browse ${deals.length} latest and best tech deals, discounts, and offers curated by DealRadarUS. Save up to $${totalSavings.toLocaleString()}.`,
              "url": "https://dealradarus.com/deals",
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": deals.length,
                "name": "Tech Deals Collection"
              },
              "specialty": "Technology Deals and Electronics Discounts",
              "lastReviewed": new Date().toISOString().split('T')[0]
            })
          }}
        />

        {/* Data Source Debug Info (remove in production) */}
        {meta?.source && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "debugInfo": {
                  "dataSource": meta.source,
                  "timestamp": meta.timestamp || new Date().toISOString(),
                  "totalDeals": deals.length
                }
              })
            }}
          />
        )}
      </Head>
      <DealsPage initialDeals={deals} />
    </>
  );
}
