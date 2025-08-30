import React from 'react';import Head from 'next/head';
import fs from 'fs';
import path from 'path';

export default function AffiliateDisclosure({ htmlContent }) {
  return (
    <>
      <Head>
        <title>Affiliate Disclosure - DealRadarUS</title>
        <meta name="description" content="Learn how DealRadarUS earns affiliate commissions when you purchase through our links. Full transparency about our affiliate partnerships and editorial independence." />
        <link rel="canonical" href="https://dealradarus.com/affiliate-disclosure" />
        <meta property="og:title" content="Affiliate Disclosure - DealRadarUS" />
        <meta property="og:description" content="Learn how DealRadarUS earns affiliate commissions when you purchase through our links. Full transparency about our affiliate partnerships and editorial independence." />
        <meta property="og:url" content="https://dealradarus.com/affiliate-disclosure" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'pages', 'affiliate-disclosure.html');
  let htmlContent = '';
  
  try {
    const fullHtml = fs.readFileSync(filePath, 'utf8');
    // Extract body content between <body> and </body>
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    htmlContent = bodyMatch ? bodyMatch[1] : fullHtml;
  } catch (error) {
    console.error('Error reading affiliate-disclosure.html:', error);
    htmlContent = '<h1>Affiliate Disclosure</h1><p>Content temporarily unavailable.</p>';
  }

  return {
    props: {
      htmlContent,
    },
    revalidate: 86400, // Revalidate once per day
  };
}