import React from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';

export default function TermsOfService({ htmlContent }) {
  return (
    <>
      <Head>
        <title>Terms of Service - DealRadarUS</title>
        <meta name="description" content="Terms of Service for DealRadarUS. Learn about our terms and conditions for using our deal aggregation and affiliate marketing services." />
        <link rel="canonical" href="https://dealradarus.com/terms-of-service" />
        <meta property="og:title" content="Terms of Service - DealRadarUS" />
        <meta property="og:description" content="Terms of Service for DealRadarUS. Learn about our terms and conditions for using our deal aggregation and affiliate marketing services." />
        <meta property="og:url" content="https://dealradarus.com/terms-of-service" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'pages', 'terms-of-service.html');
  let htmlContent = '';
  
  try {
    const fullHtml = fs.readFileSync(filePath, 'utf8');
    // Extract body content between <body> and </body>
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    htmlContent = bodyMatch ? bodyMatch[1] : fullHtml;
  } catch (error) {
    console.error('Error reading terms-of-service.html:', error);
    htmlContent = '<h1>Terms of Service</h1><p>Content temporarily unavailable.</p>';
  }

  return {
    props: {
      htmlContent,
    },
    revalidate: 86400, // Revalidate once per day
  };
}