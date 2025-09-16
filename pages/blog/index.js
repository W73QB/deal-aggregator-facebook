import React from 'react';
import Head from 'next/head';
import BlogPage from '../../components/pages/BlogPage';

export default function Blog() {
  return (
    <>
      <Head>
        <title>Tech Blog & Buying Guides - DealRadarUS</title>
        <meta name="description" content="Read the latest tech blog posts, buying guides, and product reviews from DealRadarUS. Expert insights on the best electronics and gadgets." />
        <meta property="og:title" content="Tech Blog & Buying Guides - DealRadarUS" />
        <meta property="og:description" content="Read the latest tech blog posts, buying guides, and product reviews from DealRadarUS." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tech Blog & Buying Guides - DealRadarUS" />
        <meta name="twitter:description" content="Read the latest tech blog posts, buying guides, and product reviews." />
        <link rel="canonical" href="https://dealradarus.com/blog" />
      </Head>
      <BlogPage />
    </>
  );
}