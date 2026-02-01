import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthButtons from './ui/AuthButtons';
import SearchBox from './ui/SearchBox';
import ThemeToggle from './ui/ThemeToggle';
import { useNewsletter } from '../hooks';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Newsletter hook
  const {
    email: newsletterEmail,
    setEmail: setNewsletterEmail,
    status: newsletterStatus,
    message: newsletterMessage,
    handleSubmit: handleNewsletterSubmit,
    isLoading: newsletterLoading
  } = useNewsletter();

  const isActivePath = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Skip to main content - A11y enhancement */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header className="main-header" role="banner">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link href="/" className="logo-link" aria-label="DealRadarUS - Home">
                <div className="logo-animated">
                  <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" role="img" aria-labelledby="logo-title" aria-describedby="logo-desc">
                    <title id="logo-title">DealRadarUS Logo</title>
                    <desc id="logo-desc">Animated radar scanning for deals with shopping cart</desc>
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary-blue)"/>
                        <stop offset="100%" stopColor="var(--primary-blue-dark)"/>
                      </linearGradient>
                    </defs>

                    {/* Radar circles */}
                    <g transform="translate(30, 30)">
                      {/* Outer radar circle */}
                      <circle cx="0" cy="0" r="25" fill="none" stroke="url(#radarGradient)" strokeWidth="2" opacity="0.3"/>
                      {/* Middle radar circle */}
                      <circle cx="0" cy="0" r="18" fill="none" stroke="url(#radarGradient)" strokeWidth="2" opacity="0.5"/>
                      {/* Inner radar circle */}
                      <circle cx="0" cy="0" r="11" fill="none" stroke="url(#radarGradient)" strokeWidth="2" opacity="0.7"/>

                      {/* Radar sweep line */}
                      <line x1="0" y1="0" x2="22" y2="-8" stroke="url(#radarGradient)" strokeWidth="3" strokeLinecap="round" className="radar-sweep"/>

                      {/* Center dot */}
                      <circle cx="0" cy="0" r="3" fill="url(#radarGradient)"/>

                      {/* Deal indicators (small dots) */}
                      <circle cx="12" cy="-6" r="2" fill="var(--urgent-red)" opacity="0.8" className="deal-indicator deal-indicator-1"></circle>
                      <circle cx="-8" cy="15" r="2" fill="var(--urgent-red)" opacity="0.6" className="deal-indicator deal-indicator-2"></circle>
                      <circle cx="18" cy="12" r="2" fill="var(--urgent-red)" opacity="0.7" className="deal-indicator deal-indicator-3"></circle>
                    </g>

                    {/* Shopping cart element integrated into radar */}
                    <g transform="translate(45, 35)">
                      <path d="M2 2h2l.4 2h7.6l-1.4 6H5L3 4H1" fill="none" stroke="url(#radarGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="15" r="1" fill="url(#radarGradient)"/>
                      <circle cx="11" cy="15" r="1" fill="url(#radarGradient)"/>
                    </g>

                    {/* Company name */}
                    <text x="75" y="25" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="var(--primary-blue)">DealRadar</text>
                    <text x="75" y="42" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill="var(--text-tertiary)">US</text>
                  </svg>
                </div>
                <div className="logo-tagline">
                  <span>Your Radar for the Best Deals</span>
                </div>
              </Link>
            </div>

            <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`} role="navigation" aria-label="Main navigation">
              <ul className="nav-menu" role="menubar">
                <li role="none">
                  <Link
                    href="/"
                    className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
                    role="menuitem"
                    aria-current={isActivePath('/') ? 'page' : undefined}
                    aria-label="Home - Navigate to homepage"
                  >
                    <span className="material-icons nav-icon" aria-hidden="true">home</span>
                    Home
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/deals"
                    className={`nav-link ${isActivePath('/deals') ? 'active' : ''}`}
                    role="menuitem"
                    aria-current={isActivePath('/deals') ? 'page' : undefined}
                    aria-label="Deals - Browse all current deals"
                  >
                    <span className="material-icons nav-icon" aria-hidden="true">local_offer</span>
                    Deals
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/blog"
                    className={`nav-link ${isActivePath('/blog') ? 'active' : ''}`}
                    role="menuitem"
                    aria-current={isActivePath('/blog') ? 'page' : undefined}
                    aria-label="Blog - Read articles and buying guides"
                  >
                    <span className="material-icons nav-icon" aria-hidden="true">article</span>
                    Blog
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/about"
                    className={`nav-link ${isActivePath('/about') ? 'active' : ''}`}
                    role="menuitem"
                    aria-current={isActivePath('/about') ? 'page' : undefined}
                    aria-label="About - Learn about DealRadarUS"
                  >
                    <span className="material-icons nav-icon" aria-hidden="true">info</span>
                    About
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href="/contact"
                    className={`nav-link ${isActivePath('/contact') ? 'active' : ''}`}
                    role="menuitem"
                    aria-current={isActivePath('/contact') ? 'page' : undefined}
                    aria-label="Contact - Get in touch with us"
                  >
                    <span className="material-icons nav-icon" aria-hidden="true">contact_mail</span>
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="header-actions">
              <SearchBox />

              <ThemeToggle />

              <AuthButtons />

              <div className="social-links" aria-label="Follow us on social media">
                <a
                  href="https://facebook.com/dealradarus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link facebook"
                  aria-label="Follow DealRadarUS on Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/dealradarus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link x"
                  aria-label="Follow DealRadarUS on X"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-5.924l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/dealradarus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  aria-label="Follow DealRadarUS on Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" aria-label="Toggle menu" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>
              <span className="material-icons" aria-hidden="true">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="main-content" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DealRadarUS</h3>
              <p>Your trusted source for the best tech deals in the US. We scan thousands of deals daily to bring you verified discounts on electronics, gadgets, and more.</p>
              <div className="social-links">
                <a href="https://facebook.com/dealradarus" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a href="https://twitter.com/dealradarus" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
                <a href="https://instagram.com/dealradarus" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://x.com/dealradarus" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/deals">All Deals</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><a href="#newsletter">Newsletter</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Categories</h4>
              <ul>
                <li><Link href="/deals?category=smartphones">Smartphones</Link></li>
                <li><Link href="/deals?category=laptops">Laptops</Link></li>
                <li><Link href="/deals?category=gaming">Gaming</Link></li>
                <li><Link href="/deals?category=smart-home">Smart Home</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>🔔 Deal Alerts</h4>
              <p>Get the best deals in your inbox!</p>
              <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterLoading}
                />
                <button type="submit" disabled={newsletterLoading}>
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterStatus === 'success' && <small className="newsletter-success">{newsletterMessage}</small>}
              {newsletterStatus === 'error' && <small className="newsletter-error">{newsletterMessage}</small>}
              {newsletterStatus !== 'success' && newsletterStatus !== 'error' && <small>Join 25K+ deal hunters</small>}
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
