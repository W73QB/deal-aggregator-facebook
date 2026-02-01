import React from 'react';
import Head from 'next/head';
import AboutPage from '../components/pages/AboutPage';

export default function About() {
  return (
    <>
      <Head>
        <title>About DealRadarUS - Your Trusted Deal Source</title>
        <meta name="description" content="Learn about DealRadarUS, your trusted source for the best tech deals, discounts, and buying guides. Discover our mission and team." />
        <meta property="og:title" content="About DealRadarUS - Your Trusted Deal Source" />
        <meta property="og:description" content="Learn about DealRadarUS, your trusted source for the best tech deals, discounts, and buying guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/about" />
        <meta property="og:image" content="https://dealradarus.com/og-share.png" />
        <meta property="og:image:alt" content="About DealRadarUS" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About DealRadarUS - Your Trusted Deal Source" />
        <meta name="twitter:description" content="Learn about DealRadarUS, your trusted source for the best tech deals." />
        <meta name="twitter:image" content="https://dealradarus.com/og-share.png" />
        <link rel="canonical" href="https://dealradarus.com/about" />

        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DealRadarUS",
              "description": "Your trusted source for the best tech deals, discounts, and buying guides",
              "url": "https://dealradarus.com",
              "logo": "/logo-concept.svg",
              "sameAs": [
                "https://facebook.com/DealRadarUS",
                "https://twitter.com/DealRadarUS",
                "https://instagram.com/DealRadarUS"
              ]
            })
          }}
        />
      </Head>
      <AboutPage />
    </>
  );
}
