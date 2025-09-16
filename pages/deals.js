import React from 'react';
import Head from 'next/head';
import DealsPage from '../components/pages/DealsPage';
import deals from '../server/data/deals.js';

export default function Deals({ dealsData }) {
  const featuredDeals = dealsData.filter(deal => deal.featured);
  const totalSavings = dealsData.reduce((sum, deal) => sum + (deal.originalPrice - deal.price), 0);

  return (
    <>
      <Head>
        <title>Latest Tech Deals - DealRadarUS ({dealsData.length} Deals)</title>
        <meta name="description" content={`Browse ${dealsData.length} latest and best tech deals, discounts, and offers curated by DealRadarUS. Find amazing savings on electronics, gadgets, and more. Save up to $${totalSavings.toLocaleString()}.`} />
        <meta property="og:title" content={`Latest Tech Deals - DealRadarUS (${dealsData.length} Deals)`} />
        <meta property="og:description" content={`Browse ${dealsData.length} latest and best tech deals, discounts, and offers curated by DealRadarUS.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/deals" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Latest Tech Deals - DealRadarUS (${dealsData.length} Deals)`} />
        <meta name="twitter:description" content={`Browse ${dealsData.length} latest and best tech deals, discounts, and offers.`} />
        <link rel="canonical" href="https://dealradarus.com/deals" />

        {/* Structured data for deals */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Latest Tech Deals - DealRadarUS",
              "description": `Browse ${dealsData.length} latest and best tech deals, discounts, and offers`,
              "url": "https://dealradarus.com/deals",
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": dealsData.length,
                "itemListElement": featuredDeals.slice(0, 5).map((deal, index) => ({
                  "@type": "Product",
                  "position": index + 1,
                  "name": deal.title,
                  "description": deal.description,
                  "offers": {
                    "@type": "Offer",
                    "price": deal.price,
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                }))
              }
            })
          }}
        />
      </Head>
      <DealsPage deals={dealsData} />
    </>
  );
}

// This function gets called at build time for Static Site Generation
export async function getStaticProps() {
  try {
    return {
      props: {
        dealsData: deals,
      },
      // Enable Incremental Static Regeneration
      // Page will be re-generated at most once every hour
      revalidate: 3600,
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        dealsData: [],
      },
      revalidate: 3600,
    }
  }
}