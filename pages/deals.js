import React from 'react';
import Head from 'next/head';
import DealsPage from '../components/pages/DealsPage';

export default function Deals({ dealsData, totalSavings, meta }) {
  const featuredDeals = dealsData.filter(deal => deal.featured);
  const savings = totalSavings || dealsData.reduce((sum, deal) => sum + (deal.originalPrice - (deal.salePrice || deal.price)), 0);

  return (
    <>
      <Head>
        <title>Latest Tech Deals - DealRadarUS ({dealsData.length} Deals)</title>
        <meta name="description" content={`Browse ${dealsData.length} latest and best tech deals, discounts, and offers curated by DealRadarUS. Find amazing savings on electronics, gadgets, and more. Save up to $${savings.toLocaleString()}.`} />
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
                    "price": deal.salePrice || deal.price,
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                }))
              }
            })
          }}
        />
      </Head>
      <DealsPage initialDeals={dealsData} />
    </>
  );
}

// Temporarily using static props to bypass SSR issues
export async function getStaticProps() {
  // Inline fallback data to avoid build issues
  const fallbackDeals = [
    {
      id: 1,
      title: "iPhone 14 Pro - Refurbished",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      originalPrice: 999,
      salePrice: 749,
      discount: 25,
      rating: 4.8,
      category: "smartphones",
      featured: true,
      store: "Apple Certified"
    },
    {
      id: 2,
      title: "MacBook Air M2 - Open Box",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      originalPrice: 1299,
      salePrice: 999,
      discount: 23,
      rating: 4.9,
      category: "laptops",
      featured: true,
      store: "Best Buy"
    },
    {
      id: 3,
      title: "Samsung Galaxy S23",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      originalPrice: 799,
      salePrice: 599,
      discount: 25,
      rating: 4.6,
      category: "smartphones",
      featured: false,
      store: "Samsung Direct"
    }
  ];

  return {
    props: {
      dealsData: fallbackDeals,
      totalSavings: 850,
      meta: { source: 'static', total: fallbackDeals.length },
    },
    revalidate: 60, // Revalidate every minute
  };
}