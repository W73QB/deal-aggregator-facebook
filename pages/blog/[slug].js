import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BlogPostPage from '../../components/pages/BlogPostPage';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  // This will be enhanced with getStaticProps/getServerSideProps later
  const blogPost = {
    title: `Blog Post: ${slug}`,
    description: `Read our comprehensive blog post about ${slug}`,
    image: '/logo-concept.svg'
  };

  return (
    <>
      <Head>
        <title>{blogPost.title} - DealRadarUS</title>
        <meta name="description" content={blogPost.description} />
        <meta property="og:title" content={`${blogPost.title} - DealRadarUS`} />
        <meta property="og:description" content={blogPost.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://dealradarus.com/blog/${slug}`} />
        <meta property="og:image" content={blogPost.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blogPost.title} - DealRadarUS`} />
        <meta name="twitter:description" content={blogPost.description} />
        <meta name="twitter:image" content={blogPost.image} />
        <link rel="canonical" href={`https://dealradarus.com/blog/${slug}`} />

        {/* Structured data for articles */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": blogPost.title,
              "description": blogPost.description,
              "image": blogPost.image,
              "author": {
                "@type": "Organization",
                "name": "DealRadarUS"
              },
              "publisher": {
                "@type": "Organization",
                "name": "DealRadarUS",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/logo-concept.svg"
                }
              },
              "datePublished": new Date().toISOString(),
              "dateModified": new Date().toISOString()
            })
          }}
        />
      </Head>
      <BlogPostPage />
    </>
  );
}