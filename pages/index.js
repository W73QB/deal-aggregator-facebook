import Head from 'next/head';
import fs from 'fs';
import path from 'path';

export default function Home({ htmlContent }) {
  return (
    <>
      <Head>
        <title>DealRadarUS - Best Tech Deals in the US</title>
        <meta name="description" content="Find the best tech deals, discounts, and promotions in the US. Your trusted source for smartphone, laptop, gaming, and electronics deals." />
        <link rel="canonical" href="https://dealradarus.com/" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'index.html');
  let htmlContent = '';
  
  try {
    const fullHtml = fs.readFileSync(filePath, 'utf8');
    // Extract body content between <body> and </body>
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    htmlContent = bodyMatch ? bodyMatch[1] : fullHtml;
  } catch (error) {
    console.error('Error reading index.html:', error);
    htmlContent = '<h1>DealRadarUS</h1><p>Welcome to DealRadarUS - Your source for the best tech deals!</p>';
  }

  return {
    props: {
      htmlContent,
    },
    revalidate: 3600, // Revalidate once per hour
  };
}