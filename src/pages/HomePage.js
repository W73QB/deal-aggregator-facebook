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
            <div className="deal-card featured">
              <div className="deal-badge">Featured</div>
              <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-blue?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1661027785657" alt="iPhone 14" />
              <div className="deal-info">
                <h3>iPhone 14 - Refurbished</h3>
                <div className="rating">⭐⭐⭐⭐⭐ (4.8)</div>
                <div className="price">
                  <span className="original-price">$799</span>
                  <span className="new-price">$549</span>
                  <span className="discount">31% OFF</span>
                </div>
                <a href="/deals" className="deal-button">View Deal</a>
              </div>
            </div>

            <div className="deal-card">
              <img src="https://images-na.ssl-images-amazon.com/images/I/61SUj2aKoEL._AC_SL1000_.jpg" alt="MacBook Pro" />
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

            <div className="deal-card">
              <img src="https://images.samsung.com/is/image/samsung/p6pim/us/sm-r870nzkaxar/gallery/us-galaxy-watch4-r870-sm-r870nzkaxar-368338863?$650_519_PNG$" alt="Galaxy Watch" />
              <div className="deal-info">
                <h3>Samsung Galaxy Watch 4</h3>
                <div className="rating">⭐⭐⭐⭐☆ (4.3)</div>
                <div className="price">
                  <span className="original-price">$279</span>
                  <span className="new-price">$179</span>
                  <span className="discount">36% OFF</span>
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