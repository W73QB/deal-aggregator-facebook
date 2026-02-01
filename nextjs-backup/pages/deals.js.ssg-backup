import React from 'react';
import Head from 'next/head';
import DealsPage from '../components/pages/DealsPage';
import { generateProductListSchema, generateBreadcrumbSchema, safeJSONStringify } from '../lib/schema/generators';

import { fetchDeals } from '../lib/apiClient';

export default function Deals({ dealsData, totalSavings, meta }) {
  const featuredDeals = dealsData.filter(deal => deal.featured);
  const savings = totalSavings || dealsData.reduce((sum, deal) => sum + (deal.originalPrice - (deal.salePrice || deal.price)), 0);

  // Generate structured data
  const productListSchema = generateProductListSchema(dealsData, "Latest Tech Deals");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Deals", url: "/deals" }
  ]);

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
              "description": `Browse ${dealsData.length} latest and best tech deals, discounts, and offers curated by DealRadarUS. Save up to $${savings.toLocaleString()}.`,
              "url": "https://dealradarus.com/deals",
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": dealsData.length,
                "name": "Tech Deals Collection"
              },
              "specialty": "Technology Deals and Electronics Discounts",
              "lastReviewed": new Date().toISOString().split('T')[0]
            })
          }}
        />
      </Head>
      <DealsPage initialDeals={dealsData} />
    </>
  );
}

// Optimized Static Site Generation with robust API integration
export async function getStaticProps() {
  // Enhanced fallback data for better SEO and user experience
  const enhancedFallbackDeals = [
    {
      id: 1,
      title: "iPhone 14 Pro - Certified Refurbished",
      description: "Like-new iPhone 14 Pro with full warranty. Unlocked for all carriers.",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      originalPrice: 999,
      salePrice: 749,
      price: 749,
      discount: 25,
      rating: 4.8,
      reviewCount: 245,
      category: "smartphones",
      featured: true,
      store: "Apple Certified",
      seller: "Apple Certified",
      brand: "Apple",
      condition: "Refurbished - Excellent",
      warranty: "1 Year Apple Warranty",
      shipping: "Free",
      inStock: true,
      tags: ["iPhone", "Apple", "Refurbished", "Unlocked"],
      url: "https://dealradarus.com/deals/iphone-14-pro-refurbished",
      affiliateUrl: "https://apple.com/certified-refurbished",
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: "MacBook Air M2 - Open Box Special",
      description: "13-inch MacBook Air with M2 chip. Open box with full warranty and accessories.",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      originalPrice: 1299,
      salePrice: 999,
      price: 999,
      discount: 23,
      rating: 4.9,
      reviewCount: 189,
      category: "laptops",
      featured: true,
      store: "Best Buy",
      seller: "Best Buy",
      brand: "Apple",
      condition: "Open Box - Excellent",
      warranty: "1 Year Manufacturer Warranty",
      shipping: "Free",
      inStock: true,
      tags: ["MacBook", "Apple", "M2", "Open Box"],
      url: "https://dealradarus.com/deals/macbook-air-m2-open-box",
      affiliateUrl: "https://bestbuy.com/macbook-air-m2",
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      title: "Samsung Galaxy S23 - Factory Unlocked",
      description: "Latest Samsung Galaxy S23 with premium camera and performance. Factory unlocked.",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      originalPrice: 799,
      salePrice: 599,
      price: 599,
      discount: 25,
      rating: 4.6,
      reviewCount: 312,
      category: "smartphones",
      featured: false,
      store: "Samsung Direct",
      seller: "Samsung",
      brand: "Samsung",
      condition: "New",
      warranty: "1 Year Samsung Warranty",
      shipping: "Free",
      inStock: true,
      tags: ["Samsung", "Galaxy S23", "Android", "Unlocked"],
      url: "https://dealradarus.com/deals/samsung-galaxy-s23",
      affiliateUrl: "https://samsung.com/galaxy-s23",
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      title: "Sony WH-1000XM5 Noise Canceling Headphones",
      description: "Industry-leading noise canceling with premium sound quality and 30-hour battery life.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      originalPrice: 399,
      salePrice: 279,
      price: 279,
      discount: 30,
      rating: 4.7,
      reviewCount: 456,
      category: "audio",
      featured: true,
      store: "Amazon",
      seller: "Amazon",
      brand: "Sony",
      condition: "New",
      warranty: "1 Year Sony Warranty",
      shipping: "Free Prime",
      inStock: true,
      tags: ["Sony", "Headphones", "Noise Canceling", "Wireless"],
      url: "https://dealradarus.com/deals/sony-wh1000xm5-headphones",
      affiliateUrl: "https://amazon.com/sony-wh1000xm5",
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      title: "iPad Air 5th Gen - Wi-Fi 64GB",
      description: "Powerful iPad Air with M1 chip. Perfect for creativity and productivity.",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
      originalPrice: 599,
      salePrice: 449,
      price: 449,
      discount: 25,
      rating: 4.8,
      reviewCount: 203,
      category: "tablets",
      featured: false,
      store: "Apple Store",
      seller: "Apple",
      brand: "Apple",
      condition: "New",
      warranty: "1 Year Apple Warranty",
      shipping: "Free",
      inStock: true,
      tags: ["iPad", "Apple", "M1", "Tablet"],
      url: "https://dealradarus.com/deals/ipad-air-5th-gen",
      affiliateUrl: "https://apple.com/ipad-air",
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  try {
    const apiResponse = await fetchDeals({ limit: '50', featured: 'true', sort: 'rating' });

    const dealsFromApi = Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : Array.isArray(apiResponse?.deals)
        ? apiResponse.deals
        : Array.isArray(apiResponse)
          ? apiResponse
          : [];

    if (dealsFromApi.length > 0) {
      const totalSavings = dealsFromApi.reduce((sum, deal) => {
        const original = deal.originalPrice ?? deal.original_price ?? deal.price ?? 0;
        const sale = deal.salePrice ?? deal.sale_price ?? deal.price ?? 0;
        return sum + Math.max(0, original - sale);
      }, 0);

      return {
        props: {
          dealsData: dealsFromApi,
          totalSavings,
          meta: {
            source: apiResponse?.meta?.source || 'api',
            total: dealsFromApi.length,
            lastFetch: new Date().toISOString()
          },
        },
        revalidate: 300, // 5 minutes
      };
    }
  } catch (error) {
    console.warn('Deals API fetch failed during SSG, using fallback data:', error.message);
  }

  // Fallback to enhanced static data
  const totalSavings = enhancedFallbackDeals.reduce((sum, deal) =>
    sum + (deal.originalPrice - deal.salePrice), 0
  );

  return {
    props: {
      dealsData: enhancedFallbackDeals,
      totalSavings: totalSavings,
      meta: {
        source: 'fallback',
        total: enhancedFallbackDeals.length,
        lastFetch: new Date().toISOString()
      },
    },
    // Longer revalidate for fallback data to retry API
    revalidate: 60, // 1 minute
  };
}