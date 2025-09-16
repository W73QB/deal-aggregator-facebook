import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${slug}`);

        if (!response.ok) {
          throw new Error('Post not found');
        }

        const data = await response.json();
        setPost(data);

        // Fetch related posts from same category
        const relatedResponse = await fetch(`/api/posts?category=${data.category}&limit=3`);
        const relatedData = await relatedResponse.json();
        setRelatedPosts(relatedData.posts.filter(p => p.slug !== slug));

      } catch (error) {
        console.error('Failed to fetch post:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

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

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="error-message">
            <h1>Article Not Found</h1>
            <p>Sorry, we couldn't find the article you're looking for.</p>
            <Link to="/blog" className="btn-primary">← Back to Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/blog">Blog</Link>
          <span>/</span>
          <span>{getCategoryLabel(post.category)}</span>
        </nav>

        {/* Article Header */}
        <article className="blog-post">
          <header className="post-header">
            <div className="post-meta">
              <span className="category">{getCategoryLabel(post.category)}</span>
              <span className="date">{formatDate(post.publishDate)}</span>
              <span className="read-time">{post.readTime}</span>
              <span className="views">{post.views} views</span>
            </div>

            <h1 className="post-title">{post.title}</h1>

            <p className="post-excerpt">{post.excerpt}</p>

            <div className="post-author">
              <div className="author-info">
                <span className="author-name">By {post.author}</span>
              </div>
            </div>

            {post.image && (
              <div className="post-image">
                <img src={post.image} alt={post.title} />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="post-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              <h4>Tags:</h4>
              <div className="tags-list">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className="post-sharing">
            <h4>Share this article:</h4>
            <div className="sharing-buttons">
              <button
                onClick={() => navigator.share ? navigator.share({title: post.title, url: window.location.href}) : window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="share-btn twitter"
              >
                🐦 Twitter
              </button>
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="share-btn facebook"
              >
                📘 Facebook
              </button>
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="share-btn linkedin"
              >
                💼 LinkedIn
              </button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="related-posts">
            <h3>Related Articles</h3>
            <div className="related-posts-grid">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="related-post-card">
                  <Link to={`/blog/${relatedPost.slug}`} className="related-post-link">
                    {relatedPost.image && (
                      <div className="related-post-image">
                        <img src={relatedPost.image} alt={relatedPost.title} />
                      </div>
                    )}
                    <div className="related-post-content">
                      <div className="related-post-meta">
                        <span className="category">{getCategoryLabel(relatedPost.category)}</span>
                        <span className="read-time">{relatedPost.readTime}</span>
                      </div>
                      <h4 className="related-post-title">{relatedPost.title}</h4>
                      <p className="related-post-excerpt">{relatedPost.excerpt}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <section className="post-newsletter">
          <div className="newsletter-content">
            <h3>📬 Never Miss a Deal!</h3>
            <p>Subscribe to our newsletter for the latest tech deals and buying guides delivered to your inbox.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
              />
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </div>
            <p className="newsletter-disclaimer">Join 25,000+ subscribers • No spam, unsubscribe anytime</p>
          </div>
        </section>

        {/* Back to Blog */}
        <div className="back-to-blog">
          <Link to="/blog" className="btn-secondary">← Back to All Articles</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;