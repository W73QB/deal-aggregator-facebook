import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthButtons from './ui/AuthButtons';
import SearchBox from './ui/SearchBox';

const Layout = ({ children }) => {
  const router = useRouter();

  const isActivePath = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link href="/" className="logo-link">
                <div className="logo-animated">
                  <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1A73E8"/>
                        <stop offset="100%" stopColor="#0056b3"/>
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
                      <line x1="0" y1="0" x2="22" y2="-8" stroke="url(#radarGradient)" strokeWidth="3" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="3s" repeatCount="indefinite"/>
                      </line>

                      {/* Center dot */}
                      <circle cx="0" cy="0" r="3" fill="url(#radarGradient)"/>

                      {/* Deal indicators (small dots) */}
                      <circle cx="12" cy="-6" r="2" fill="#FF3B30" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="-8" cy="15" r="2" fill="#FF3B30" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="12" r="2" fill="#FF3B30" opacity="0.7">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
                      </circle>
                    </g>

                    {/* Shopping cart element integrated into radar */}
                    <g transform="translate(45, 35)">
                      <path d="M2 2h2l.4 2h7.6l-1.4 6H5L3 4H1" fill="none" stroke="url(#radarGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="15" r="1" fill="url(#radarGradient)"/>
                      <circle cx="11" cy="15" r="1" fill="url(#radarGradient)"/>
                    </g>

                    {/* Company name */}
                    <text x="75" y="25" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1A73E8">DealRadar</text>
                    <text x="75" y="42" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill="#6C757D">US</text>
                  </svg>
                </div>
                <div className="logo-tagline">
                  <span>Your Radar for the Best Deals</span>
                </div>
              </Link>
            </div>

            <nav className="main-nav">
              <ul className="nav-menu">
                <li>
                  <Link
                    href="/"
                    className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deals"
                    className={`nav-link ${isActivePath('/deals') ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Deals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className={`nav-link ${isActivePath('/blog') ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={`nav-link ${isActivePath('/about') ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className={`nav-link ${isActivePath('/contact') ? 'active' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="header-actions">
              <SearchBox />

              <AuthButtons />

              <div className="social-links">
                <a href="https://facebook.com/dealradarus" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  25K
                </a>
                <a href="https://twitter.com/dealradarus" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/dealradarus" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" aria-label="Toggle menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
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