import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const BlogPage = ({ initialPosts = [], initialCategories = [], error = false }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularPosts, setPopularPosts] = useState([]);
  const [categories, setCategories] = useState(initialCategories);

  // Initialize popular posts from initial data
  useEffect(() => {
    if (initialPosts.length > 0) {
      const popular = initialPosts
        .sort((a, b) => {
          const aViews = parseInt(a.views?.replace(/[KM]/g, '') || '0');
          const bViews = parseInt(b.views?.replace(/[KM]/g, '') || '0');
          return bViews - aViews;
        })
        .slice(0, 3);
      setPopularPosts(popular);
    }
  }, [initialPosts]);

  // Fallback API call only if no initial data and not in error state
  useEffect(() => {
    if (!error && posts.length === 0) {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/posts');
          if (!response.ok) throw new Error('Failed to fetch posts');

          const data = await response.json();
          setPosts(data.posts || []);
          setCategories(data.categories || []);

          // Get popular posts (sorted by views)
          const popular = (data.posts || [])
            .sort((a, b) => {
              const aViews = parseInt(a.views?.replace(/[KM]/g, '') || '0');
              const bViews = parseInt(b.views?.replace(/[KM]/g, '') || '0');
              return bViews - aViews;
            })
            .slice(0, 3);
          setPopularPosts(popular);
        } catch (error) {
          console.error('Failed to fetch posts:', error);
          // Keep initial data if fetch fails
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [error, posts.length]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'deal-alerts': 'Deal Alerts',
      'buying-guide': 'Buying Guide',
      'tech-reviews': 'Tech Reviews',
      'smart-home': 'Smart Home',
      'gaming': 'Gaming'
    };
    return categoryMap[category] || category;
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  // Use categories from props or fallback to static categories
  const displayCategories = categories.length > 0
    ? categories.map(cat => ({ label: cat.name, value: cat.id, count: cat.count }))
    : [
        { label: "All Posts", value: "all", count: posts.length },
        { label: "Deal Alerts", value: "deal-alerts", count: posts.filter(p => p.category === 'deal-alerts').length },
        { label: "Buying Guides", value: "buying-guide", count: posts.filter(p => p.category === 'buying-guide').length },
        { label: "Tech Reviews", value: "tech-reviews", count: posts.filter(p => p.category === 'tech-reviews').length },
        { label: "Smart Home", value: "smart-home", count: posts.filter(p => p.category === 'smart-home').length },
        { label: "Gaming", value: "gaming", count: posts.filter(p => p.category === 'gaming').length }
      ];

  return (
    <div className="blog-page">
      <div className="page-header">
        <div className="container">
          <h1>📝 DealRadar Blog</h1>
          <p>Stay informed with the latest tech deals, buying guides, and industry insights.</p>
        </div>
      </div>

      <div className="container">
        <div className="blog-layout">
          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-section">
              <h3>Categories</h3>
              <ul className="category-list">
                {displayCategories.map((category, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setSelectedCategory(category.value)}
                      className={selectedCategory === category.value ? 'active' : ''}
                    >
                      {category.label}
                      {category.count && <span className="count">({category.count})</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h3>🔔 Newsletter</h3>
              <p>Get the latest deals and articles delivered to your inbox.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Your email" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            <div className="sidebar-section">
              <h3>📈 Popular Posts</h3>
              <div className="popular-posts">
                {popularPosts.map((post) => (
                  <div key={post.id} className="popular-post">
                    <Link href={`/blog/${post.slug}`}>
                      <h4>{post.title}</h4>
                      <span className="post-meta">{post.views} views</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="blog-main">
            {loading ? (
              <div className="loading-posts">
                <div className="spinner"></div>
                <p>Loading articles...</p>
              </div>
            ) : (
              <div className="blog-posts">
                {filteredPosts.map(post => (
                  <article key={post.id} className="blog-post-card">
                    <div className="post-image">
                      <img src={post.image} alt={post.title} />
                    </div>

                    <div className="post-content">
                      <div className="post-meta">
                        <span className="author">By {post.author}</span>
                        <span className="date">{formatDate(post.publishedAt || post.publishDate)}</span>
                        <span className="read-time">{post.readTime}</span>
                      </div>

                      <h2 className="post-title">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="post-excerpt">{post.excerpt}</p>

                      <div className="post-footer">
                        <div className="post-tags">
                          {post.tags && post.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                          ))}
                        </div>

                        <Link href={`/blog/${post.slug}`} className="read-more">
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <button className="page-btn" disabled>← Previous</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">Next →</button>
            </div>
          </main>
        </div>
      </div>

      {/* Newsletter CTA */}
      <section className="newsletter-cta">
        <div className="container">
          <div className="cta-content">
            <h2>📬 Stay Updated with Deal Alerts</h2>
            <p>Never miss a great tech deal again! Subscribe to our newsletter for exclusive deals and early access.</p>
            <form className="newsletter-form large">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Subscribe Now</button>
            </form>
            <small>Join 25,000+ subscribers • No spam, unsubscribe anytime</small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
