import React from 'react';
import Head from 'next/head';
import BlogPage from '../../components/pages/BlogPage';
import { generateBreadcrumbSchema, safeJSONStringify } from '../../lib/schema/generators';

export default function Blog({ posts, categories, totalPosts, error }) {
  // If we're in SSR mode, render a simplified version to avoid auth context issues
  const isSSR = typeof window === 'undefined';

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" }
  ]);

  return (
    <>
      <Head>
        <title>Tech Blog & Buying Guides - DealRadarUS ({totalPosts} Posts)</title>
        <meta name="description" content={`Read the latest tech blog posts, buying guides, and product reviews from DealRadarUS. Expert insights on the best electronics and gadgets. ${totalPosts} articles available.`} />
        <meta property="og:title" content={`Tech Blog & Buying Guides - DealRadarUS (${totalPosts} Posts)`} />
        <meta property="og:description" content="Read the latest tech blog posts, buying guides, and product reviews from DealRadarUS." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dealradarus.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Tech Blog & Buying Guides - DealRadarUS (${totalPosts} Posts)`} />
        <meta name="twitter:description" content="Read the latest tech blog posts, buying guides, and product reviews." />
        <link rel="canonical" href="https://dealradarus.com/blog" />

        {/* Enhanced Structured Data for Blog SEO */}
        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJSONStringify(breadcrumbSchema)
            }}
          />
        )}

        {/* Blog Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJSONStringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "DealRadarUS Tech Blog",
              "description": "Tech blog with buying guides, deal alerts, and product reviews. Expert insights on the best electronics and gadgets.",
              "url": "https://dealradarus.com/blog",
              "inLanguage": "en-US",
              "isFamilyFriendly": true,
              "publisher": {
                "@type": "Organization",
                "name": "DealRadarUS",
                "url": "https://dealradarus.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://dealradarus.com/logo-concept.svg"
                },
                "sameAs": [
                  "https://facebook.com/dealradarus",
                  "https://twitter.com/dealradarus"
                ]
              },
              "blogPost": posts?.slice(0, 8).map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "image": post.image ? [post.image] : [],
                "author": {
                  "@type": "Person",
                  "name": post.author || "DealRadar Team"
                },
                "datePublished": post.publishedAt || post.publishDate,
                "dateModified": post.updatedAt || post.publishDate,
                "url": `https://dealradarus.com/blog/${post.slug}`,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://dealradarus.com/blog/${post.slug}`
                },
                "articleSection": post.category,
                "keywords": post.tags?.join(", ") || ""
              })) || [],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://dealradarus.com/blog?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      {isSSR ? (
        // SSR-safe simplified version for crawlers
        <div className="blog-page">
          <div className="page-header">
            <div className="container">
              <h1>📝 DealRadar Blog</h1>
              <p>Stay informed with the latest tech deals, buying guides, and industry insights.</p>
            </div>
          </div>
          <div className="container">
            <div className="blog-layout">
              <main className="blog-content">
                <div className="posts-grid">
                  {posts?.map((post) => (
                    <article key={post.id} className="post-card">
                      <div className="post-image">
                        <img src={post.image} alt={post.title} loading="lazy" />
                      </div>
                      <div className="post-content">
                        <div className="post-meta">
                          <span className="category">{post.category}</span>
                          <span className="read-time">{post.readTime}</span>
                        </div>
                        <h2>{post.title}</h2>
                        <p>{post.excerpt}</p>
                        <div className="post-footer">
                          <span className="author">By {post.author}</span>
                          <span className="views">{post.views} views</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : (
        // Client-side rendered full component
        <BlogPage
          initialPosts={posts}
          initialCategories={categories}
          error={error}
        />
      )}
    </>
  );
}

// Static Site Generation with ISR for SEO optimization
export async function getStaticProps() {
  try {
    // Fetch blog posts at build time
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dealradarus.com';
    const response = await fetch(`${baseUrl}/api/posts?limit=50`);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      props: {
        posts: data.posts || [],
        categories: data.categories || [],
        totalPosts: data.totalPosts || 0,
        error: false
      },
      // Revalidate every 30 minutes
      revalidate: 1800
    };
  } catch (error) {
    console.error('Blog getStaticProps error:', error);

    // Return fallback data on error to prevent build failure
    const fallbackPosts = [
      {
        id: 1,
        title: "Best Tech Deals This Week",
        slug: "best-tech-deals-this-week",
        excerpt: "Discover the top technology deals this week with savings up to 50% on electronics, gadgets, and more.",
        author: "DealRadar Team",
        publishDate: new Date().toISOString(),
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop",
        tags: ["Tech Deals", "Electronics", "Savings"],
        views: "1.2K",
        category: "deal-alerts"
      },
      {
        id: 2,
        title: "Buying Guide: Refurbished Electronics",
        slug: "buying-guide-refurbished-electronics",
        excerpt: "Everything you need to know about buying refurbished electronics safely and saving money.",
        author: "Sarah Johnson",
        publishDate: new Date().toISOString(),
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
        tags: ["Buying Guide", "Refurbished", "Electronics"],
        views: "2.1K",
        category: "buying-guide"
      }
    ];

    const fallbackCategories = [
      { id: 'all', name: 'All Posts', count: 2 },
      { id: 'deal-alerts', name: 'Deal Alerts', count: 1 },
      { id: 'buying-guide', name: 'Buying Guides', count: 1 }
    ];

    return {
      props: {
        posts: fallbackPosts,
        categories: fallbackCategories,
        totalPosts: fallbackPosts.length,
        error: true
      },
      // Shorter revalidate on error to retry sooner
      revalidate: 60
    };
  }
}