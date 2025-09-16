import React from 'react';
import Head from 'next/head';
import ContactPage from '../src/pages/ContactPage';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact DealRadarUS - Get in Touch</title>
        <meta name="description" content="Contact DealRadarUS for inquiries, partnerships, or support. Get in touch with our team for the best tech deals and buying guidance." />
        <meta property="og:title" content="Contact DealRadarUS - Get in Touch" />
        <meta property="og:description" content="Contact DealRadarUS for inquiries, partnerships, or support. Get in touch with our team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/contact" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact DealRadarUS - Get in Touch" />
        <meta name="twitter:description" content="Contact DealRadarUS for inquiries, partnerships, or support." />
        <link rel="canonical" href="https://dealradarus.com/contact" />
      </Head>
      <ContactPage />
    </>
  );
}