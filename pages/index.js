import React from 'react';
import Head from 'next/head';
import HomePage from '../components/pages/HomePage';
import { fetchDeals } from '../lib/apiClient';

const FALLBACK_FEATURED_DEALS = [
  {
    id: 1,
    title: "MacBook Pro M1 - Open Box",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop&auto=format",
    originalPrice: 1299,
    salePrice: 899,
    price: 899,
    discount: 31,
    rating: 4.9,
    category: "laptops",
    featured: true,
    badge: "Featured"
  },
  {
    id: 2,
    title: "iPhone 14 Pro Max - Refurbished",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&auto=format",
    originalPrice: 1099,
    salePrice: 799,
    price: 799,
    discount: 27,
    rating: 4.8,
    category: "smartphones",
    featured: true,
    badge: "Popular"
  }
];

export default function Home({ featuredDeals }) {
  return (
    <>
      <Head>
        <title>DealRadarUS - Your Radar for the Best Deals</title>
        <meta name="description" content="DealRadarUS - Find the best tech deals, discounts, and buying guides. Your trusted source for electronics deals and price comparisons." />
        <meta property="og:title" content="DealRadarUS - Your Radar for the Best Deals" />
        <meta property="og:description" content="Find the best tech deals, discounts, and buying guides. Your trusted source for electronics deals and price comparisons." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deal-aggregator-facebook.vercel.app" />
        <meta property="og:image" content="https://deal-aggregator-facebook.vercel.app/logo-concept.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DealRadarUS - Your Radar for the Best Deals" />
        <meta name="twitter:description" content="Find the best tech deals, discounts, and buying guides." />
        <meta name="twitter:image" content="https://deal-aggregator-facebook.vercel.app/logo-concept.svg" />
        <link rel="canonical" href="https://deal-aggregator-facebook.vercel.app" />
      </Head>
      <HomePage featuredDeals={featuredDeals} />
    </>
  );
}

// This function gets called at build time and periodically regenerates
export async function getStaticProps() {
  try {
    const response = await fetchDeals({
      featured: 'true',
      limit: '5',
      sort: 'rating'
    });

    const apiDeals = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.deals)
        ? response.deals
        : Array.isArray(response)
          ? response
          : [];

    if (!Array.isArray(apiDeals) || apiDeals.length === 0) {
      // Allow ISR to retry soon if API returned empty unexpectedly
      return {
        props: {
          featuredDeals: FALLBACK_FEATURED_DEALS,
        },
        revalidate: 60,
      };
    }

    const transformedDeals = apiDeals.map((deal) => {
      const salePrice = deal.salePrice ?? deal.sale_price ?? deal.price ?? 0;
      const originalPrice = deal.originalPrice ?? deal.original_price ?? salePrice;
      const savings = deal.savings ?? Math.max(0, originalPrice - salePrice);

      return {
        id: deal.id,
        title: deal.title ?? 'Untitled Deal',
        description: deal.description ?? '',
        image: deal.image ?? '',
        originalPrice,
        salePrice,
        price: salePrice,
        discount: deal.discount ?? 0,
        savings,
        rating: deal.rating ?? 0,
        category: deal.category ?? 'general',
        featured: !!deal.featured,
        store: deal.store ?? '',
        seller: deal.store ?? '',
        affiliateUrl: deal.affiliateUrl ?? '',
        tags: Array.isArray(deal.tags) ? deal.tags : [],
        stockCount: deal.stockCount ?? null,
        expiresAt: deal.expiresAt ?? null,
        createdAt: deal.createdAt ?? null,
        updatedAt: deal.updatedAt ?? null,
        badge: deal.featured ? 'Featured' : deal.badge || null,
      };
    });

    return {
      props: {
        featuredDeals: transformedDeals,
      },
      revalidate: 300, // Regenerate page every 5 minutes for fresh data
    };
  } catch (error) {
    console.error('Error fetching featured deals via apiClient:', error);

    return {
      props: {
        featuredDeals: FALLBACK_FEATURED_DEALS,
      },
      revalidate: 60, // Retry more frequently if API fails
    };
  }
}
