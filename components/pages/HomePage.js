import React from 'react';

const HomePage = () => {
  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>DealRadarUS - Your Radar for the Best Deals in the US</h1>
          <p>Discover amazing discounts on refurbished tech, smart home devices, and open-box electronics. Daily deals from trusted retailers with up to 70% off.</p>
          <div className="hero-cta">
            <a href="/deals" className="btn-primary">Browse Deals</a>
            <a href="#newsletter" className="btn-secondary">Get Deal Alerts</a>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="featured-deals">
        <div className="container">
          <h2>🔥 Featured Deals</h2>
          <div className="deals-grid">
            {/* Featured Deal Card */}
            <div className="deal-card featured">
              <div className="deal-badge">Featured</div>
              <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-silver-select-202206" alt="MacBook Pro 13-inch M1" />
              <div className="deal-info">
                <h3>MacBook Pro M1 - Open Box</h3>
                <div className="rating">⭐⭐⭐⭐⭐ (4.9)</div>
                <div className="price">
                  <span className="original-price">$1,299</span>
                  <span className="new-price">$899</span>
                  <span className="discount">31% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>

            {/* Other Deal Cards */}
            <div className="deal-card">
              <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-max-deep-purple-select-202209" alt="iPhone 14 Pro Max" />
              <div className="deal-info">
                <h3>iPhone 14 Pro Max - Refurbished</h3>
                <div className="rating">⭐⭐⭐⭐⭐ (4.8)</div>
                <div className="price">
                  <span className="original-price">$1,099</span>
                  <span className="new-price">$799</span>
                  <span className="discount">27% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>

            <div className="deal-card">
              <img src="https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6519/6519321_sd.jpg" alt="Amazon Echo Dot 5th Gen" />
              <div className="deal-info">
                <h3>Amazon Echo Dot (5th Gen)</h3>
                <div className="rating">⭐⭐⭐⭐☆ (4.5)</div>
                <div className="price">
                  <span className="original-price">$49.99</span>
                  <span className="new-price">$24.99</span>
                  <span className="discount">50% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>
            
            <div className="deal-card">
              <img src="https://dlcdnwebimgs.asus.com/gain/C3346E22-C523-4543-8563-125458B3B29C/w717/h717" alt="27 inch Gaming Monitor" />
              <div className="deal-info">
                <h3>27" Gaming Monitor</h3>
                <div className="rating">⭐⭐⭐⭐⭐ (4.7)</div>
                <div className="price">
                  <span className="original-price">$329</span>
                  <span className="new-price">$229</span>
                  <span className="discount">30% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>
            
            <div className="deal-card">
              <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361" alt="AirPods Pro 2nd Generation" />
              <div className="deal-info">
                <h3>AirPods Pro (2nd Gen)</h3>
                <div className="rating">⭐⭐⭐⭐⭐ (4.8)</div>
                <div className="price">
                  <span className="original-price">$249</span>
                  <span className="new-price">$189</span>
                  <span className="discount">24% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="newsletter" className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>🎯 Never Miss a Deal!</h2>
            <p>Get the best deals delivered to your inbox daily. Join 25K+ deal hunters!</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Get Deal Alerts</button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2>🛍️ Shop by Category</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">📱</div>
              <h3>Refurbished Tech</h3>
              <p>Smartphones, laptops, tablets</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🏠</div>
              <h3>Smart Home</h3>
              <p>Speakers, thermostats, security</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📦</div>
              <h3>Open Box</h3>
              <p>Like-new electronics</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🎮</div>
              <h3>Gaming</h3>
              <p>Consoles, games, accessories</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
