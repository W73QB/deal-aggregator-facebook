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
      image: "https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tags: ["Black Friday", "Tech Deals", "Shopping Tips"]
    },
    {
      id: 2,
      title: "Refurbished vs Open Box: What's the Difference?",
      excerpt: "Understanding the difference between refurbished and open box products can save you hundreds of dollars on your next tech purchase.",
      author: "Sarah Johnson",
      date: "November 10, 2024",
      readTime: "4 min read",
      image: "https://images.pexels.com/photos/7988086/pexels-photo-7988086.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tags: ["Buying Guide", "Refurbished", "Electronics"]
    },
    {
      id: 3,
      title: "Prime Day Secrets: How to Find the Best Deals",
      excerpt: "Amazon Prime Day is a huge sale event. Learn the secrets to finding the best deals and making the most of your Prime membership.",
      author: "Mike Chen",
      date: "November 5, 2024",
      readTime: "6 min read",
      image: "https://m.media-amazon.com/images/G/01/prime/marketing/slash-prime-pride-logo-2-0._CB589033053_.png",
      tags: ["Prime Day", "Amazon", "Deals"]
    },
    {
      id: 4,
      title: "Smart Home Deals: Building Your Connected Home on a Budget",
      excerpt: "Transform your home into a smart home without breaking the bank. Here are the best smart home deals and budget-friendly devices.",
      author: "Emma Davis",
      date: "October 28, 2024",
      readTime: "7 min read",
      image: "https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tags: ["Smart Home", "Budget", "IoT"]
    },
    {
      id: 5,
      title: "Gaming Laptop Buying Guide 2024",
      excerpt: "Everything you need to know about buying a gaming laptop in 2024, including the best deals on refurbished gaming machines.",
      author: "Alex Rodriguez",
      date: "October 20, 2024",
      readTime: "8 min read",
      image: "https://images.pexels.com/photos/7915427/pexels-photo-7915427.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tags: ["Gaming", "Laptops", "Buying Guide"]
    },
    {
      id: 6,
      title: "The Ultimate Audio Gear Guide for Audiophiles",
      excerpt: "From headphones to speakers, we break down the best audio gear for every budget. Find the perfect sound for your setup.",
      author: "DealRadar Team",
      date: "October 15, 2024",
      readTime: "5 min read",
      image: "https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tags: ["Audio", "Headphones", "Speakers"]
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
