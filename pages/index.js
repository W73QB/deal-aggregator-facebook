import React from 'react';
import Head from 'next/head';
import HomePage from '../components/pages/HomePage';

export default function Home() {
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
      <HomePage />
    </>
  );
}