import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/">
                <h1>DealRadarUS</h1>
                <span className="tagline">Your Radar for the Best Deals</span>
              </Link>
            </div>

            <nav className="main-nav">
              <ul className="nav-menu">
                <li>
                  <Link
                    to="/"
                    className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
                  >
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/deals"
                    className={`nav-link ${isActivePath('/deals') ? 'active' : ''}`}
                  >
                    🎯 Deals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className={`nav-link ${isActivePath('/blog') ? 'active' : ''}`}
                  >
                    📝 Blog
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="header-actions">
              <div className="search-box">
                <input type="search" placeholder="Search deals..." />
                <button type="submit">🔍</button>
              </div>

              <div className="social-links">
                <a href="https://facebook.com/dealradarus" target="_blank" rel="noopener noreferrer">
                  📘 25K
                </a>
                <a href="https://twitter.com/dealradarus" target="_blank" rel="noopener noreferrer">
                  🐦
                </a>
                <a href="https://instagram.com/dealradarus" target="_blank" rel="noopener noreferrer">
                  📷
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" aria-label="Toggle menu">
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DealRadarUS</h3>
              <p>Your trusted source for the best tech deals in the US. We scan thousands of deals daily to bring you verified discounts on electronics, gadgets, and more.</p>
              <div className="social-links">
                <a href="https://facebook.com/dealradarus" target="_blank" rel="noopener noreferrer">📘 Facebook</a>
                <a href="https://twitter.com/dealradarus" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
                <a href="https://instagram.com/dealradarus" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/deals">All Deals</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><a href="#newsletter">Newsletter</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Categories</h4>
              <ul>
                <li><a href="/deals?category=smartphones">Smartphones</a></li>
                <li><a href="/deals?category=laptops">Laptops</a></li>
                <li><a href="/deals?category=gaming">Gaming</a></li>
                <li><a href="/deals?category=smart-home">Smart Home</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>🔔 Deal Alerts</h4>
              <p>Get the best deals in your inbox!</p>
              <form className="footer-newsletter">
                <input type="email" placeholder="Your email" required />
                <button type="submit">Subscribe</button>
              </form>
              <small>Join 25K+ deal hunters</small>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-legal">
              <p>&copy; 2024 DealRadarUS. All rights reserved.</p>
              <p className="affiliate-notice">
                🔗 This site contains affiliate links. We may earn a commission from qualifying purchases at no extra cost to you.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;