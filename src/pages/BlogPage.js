import React from 'react';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Black Friday 2024: Best Tech Deals to Watch For",
      excerpt: "Get ready for the biggest shopping event of the year! We've compiled the best tech deals you should watch for during Black Friday 2024.",
      author: "DealRadar Team",
      date: "November 15, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Black Friday", "Tech Deals", "Shopping Tips"]
    },
    {
      id: 2,
      title: "Refurbished vs Open Box: What's the Difference?",
      excerpt: "Understanding the difference between refurbished and open box products can save you hundreds of dollars on your next tech purchase.",
      author: "Sarah Johnson",
      date: "November 10, 2024",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80",
      tags: ["Buying Guide", "Refurbished", "Electronics"]
    },
    {
      id: 3,
      title: "iPhone 15 vs iPhone 14: Is the Upgrade Worth It?",
      excerpt: "Comparing the latest iPhone models to help you decide if upgrading is worth the cost, especially when considering refurbished options.",
      author: "Mike Chen",
      date: "November 5, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
      tags: ["iPhone", "Comparison", "Apple"]
    },
    {
      id: 4,
      title: "Smart Home Deals: Building Your Connected Home on a Budget",
      excerpt: "Transform your home into a smart home without breaking the bank. Here are the best smart home deals and budget-friendly devices.",
      author: "Emma Davis",
      date: "October 28, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Smart Home", "Budget", "IoT"]
    },
    {
      id: 5,
      title: "Gaming Laptop Buying Guide 2024",
      excerpt: "Everything you need to know about buying a gaming laptop in 2024, including the best deals on refurbished gaming machines.",
      author: "Alex Rodriguez",
      date: "October 20, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2157&q=80",
      tags: ["Gaming", "Laptops", "Buying Guide"]
    },
    {
      id: 6,
      title: "The Rise of Sustainable Electronics: Why Refurbished Matters",
      excerpt: "Learn how buying refurbished electronics helps reduce e-waste and contributes to a more sustainable future while saving money.",
      author: "DealRadar Team",
      date: "October 15, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2113&q=80",
      tags: ["Sustainability", "Environment", "Electronics"]
    }
  ];

  const categories = [
    "All Posts",
    "Buying Guides",
    "Tech Reviews",
    "Deal Alerts",
    "Sustainability",
    "Gaming",
    "Smart Home"
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
                {categories.map((category, index) => (
                  <li key={index}>
                    <a href="#" className={index === 0 ? 'active' : ''}>{category}</a>
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
                <div className="popular-post">
                  <h4>Black Friday Tech Deals Guide</h4>
                  <span className="post-meta">25K views</span>
                </div>
                <div className="popular-post">
                  <h4>iPhone Buying Guide 2024</h4>
                  <span className="post-meta">18K views</span>
                </div>
                <div className="popular-post">
                  <h4>Best Gaming Laptops Under $1000</h4>
                  <span className="post-meta">15K views</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="blog-main">
            <div className="blog-posts">
              {blogPosts.map(post => (
                <article key={post.id} className="blog-post-card">
                  <div className="post-image">
                    <img src={post.image} alt={post.title} />
                  </div>

                  <div className="post-content">
                    <div className="post-meta">
                      <span className="author">By {post.author}</span>
                      <span className="date">{post.date}</span>
                      <span className="read-time">{post.readTime}</span>
                    </div>

                    <h2 className="post-title">
                      <a href={`/blog/post-${post.id}`}>{post.title}</a>
                    </h2>

                    <p className="post-excerpt">{post.excerpt}</p>

                    <div className="post-footer">
                      <div className="post-tags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>

                      <a href={`/blog/post-${post.id}`} className="read-more">
                        Read More →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

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