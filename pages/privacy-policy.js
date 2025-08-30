import Head from 'next/head';
import fs from 'fs';
import path from 'path';

export default function PrivacyPolicy({ htmlContent }) {
  return (
    <>
      <Head>
        <title>Privacy Policy - DealRadarUS</title>
        <meta name="description" content="Privacy Policy for DealRadarUS. Learn how we collect, use, and protect your data." />
        <link rel="canonical" href="https://dealradarus.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy - DealRadarUS" />
        <meta property="og:description" content="Privacy Policy for DealRadarUS. Learn how we collect, use, and protect your data." />
        <meta property="og:url" content="https://dealradarus.com/privacy-policy" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'pages', 'privacy.html');
  let htmlContent = '';
  
  try {
    const fullHtml = fs.readFileSync(filePath, 'utf8');
    // Extract body content between <body> and </body>
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    htmlContent = bodyMatch ? bodyMatch[1] : fullHtml;
  } catch (error) {
    console.error('Error reading privacy.html:', error);
    htmlContent = '<h1>Privacy Policy</h1><p>Content temporarily unavailable.</p>';
  }

  return {
    props: {
      htmlContent,
    },
    revalidate: 86400, // Revalidate once per day
  };
}