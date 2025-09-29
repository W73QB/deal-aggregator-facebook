import React from 'react';
import Head from 'next/head';
import HomePage from '../components/pages/HomePage';

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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    console.log(`Fetching featured deals from: ${API_BASE_URL}/deals`);

    const response = await fetch(`${API_BASE_URL}/deals?featured=true&limit=5&sort=rating`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch featured deals`);
    }

    const data = await response.json();

    if (data.success === false) {
      throw new Error(data.message || 'API returned error');
    }

    // Transform API response to match component expectations
    const transformedDeals = data.data.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      image: deal.image,
      originalPrice: deal.originalPrice,
      salePrice: deal.salePrice,
      price: deal.salePrice, // Backward compatibility
      discount: deal.discount,
      savings: deal.savings,
      rating: deal.rating,
      category: deal.category,
      featured: deal.featured,
      store: deal.store,
      seller: deal.store, // Backward compatibility
      affiliateUrl: deal.affiliateUrl,
      tags: deal.tags,
      stockCount: deal.stockCount,
      expiresAt: deal.expiresAt,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
      badge: deal.featured ? 'Featured' : null,
    }));

    return {
      props: {
        featuredDeals: transformedDeals,
      },
      revalidate: 300, // Regenerate page every 5 minutes for fresh data
    };
  } catch (error) {
    console.error('Error fetching featured deals:', error);

    // Fallback to hardcoded data if API fails
    const fallbackDeals = [
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

    return {
      props: {
        featuredDeals: fallbackDeals,
      },
      revalidate: 300, // Regenerate page every 5 minutes for fresh data
    };
  }
}