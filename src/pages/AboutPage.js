import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <h1>📋 About DealRadarUS</h1>
          <p>Your trusted source for the best tech deals and buying guides.</p>
        </div>
      </div>

      <div className="container">
        <div className="about-content">
          <section className="about-intro">
            <h2>Who We Are</h2>
            <p>
              DealRadarUS is a comprehensive platform dedicated to helping tech enthusiasts
              and everyday consumers discover the best deals on electronics, gadgets, and
              technology products. Founded with the mission to make great technology accessible
              to everyone, we aggregate deals from multiple sources and provide expert insights
              to help you make informed purchasing decisions.
            </p>
          </section>

          <section className="mission-section">
            <h2>🎯 Our Mission</h2>
            <p>
              To empower consumers with the knowledge and tools they need to find the best
              technology deals, save money, and make smart purchasing decisions. We believe
              that everyone deserves access to quality technology at fair prices.
            </p>
          </section>

          <section className="what-we-do">
            <h2>💡 What We Do</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🔍 Deal Aggregation</h3>
                <p>We scan hundreds of retailers to find the best deals on tech products and bring them to you in one place.</p>
              </div>
              <div className="feature-item">
                <h3>📝 Expert Reviews</h3>
                <p>Our team provides in-depth reviews and buying guides to help you choose the right products for your needs.</p>
              </div>
              <div className="feature-item">
                <h3>⚡ Real-time Alerts</h3>
                <p>Get notified instantly when your favorite products go on sale or when new deals become available.</p>
              </div>
              <div className="feature-item">
                <h3>💰 Price Tracking</h3>
                <p>Track price history and trends to ensure you're getting the best possible deal on your purchases.</p>
              </div>
            </div>
          </section>

          <section className="team-section">
            <h2>👥 Our Team</h2>
            <p>
              Our team consists of technology enthusiasts, deal hunters, and consumer advocates
              who are passionate about helping people save money on the tech products they love.
              With years of experience in the technology industry, we understand what makes a
              good deal and how to spot real value.
            </p>
          </section>

          <section className="values-section">
            <h2>⭐ Our Values</h2>
            <div className="values-list">
              <div className="value-item">
                <h3>Transparency</h3>
                <p>We're honest about our recommendations and always disclose our affiliate relationships.</p>
              </div>
              <div className="value-item">
                <h3>Quality</h3>
                <p>We only feature deals on products that meet our quality standards and provide real value.</p>
              </div>
              <div className="value-item">
                <h3>Community</h3>
                <p>We're building a community of smart shoppers who help each other find the best deals.</p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2>📊 Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>25,000+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h3>$2M+</h3>
                <p>Total Savings</p>
              </div>
              <div className="stat-item">
                <h3>10,000+</h3>
                <p>Deals Featured</p>
              </div>
              <div className="stat-item">
                <h3>500+</h3>
                <p>Product Reviews</p>
              </div>
            </div>
          </section>

          <section className="contact-cta">
            <h2>📞 Get In Touch</h2>
            <p>
              Have questions, suggestions, or want to partner with us? We'd love to hear from you!
            </p>
            <div className="cta-buttons">
              <a href="/contact" className="btn-primary">Contact Us</a>
              <a href="/blog" className="btn-secondary">Read Our Blog</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;