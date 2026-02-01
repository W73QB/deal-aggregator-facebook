import React, { useMemo } from 'react';
import Link from 'next/link';
import OptimizedImage from '../ui/OptimizedImage';
import RatingStars from '../ui/RatingStars';
import CategoryIcon from '../icons/CategoryIcon';
import { useNewsletter } from '../../hooks';
import styles from './HomePage.module.css';

const DealCard = ({ deal }) => {

  return (
    <div className={`${styles.dealCard} ${deal.featured ? styles.featured : ''}`}>
      {deal.badge && <div className={styles.dealBadge}>{deal.badge}</div>}
      <OptimizedImage src={deal.image} alt={deal.title} width={640} height={360} />
      <div className={styles.dealInfo}>
        <h3>{deal.title}</h3>
        <div className={styles.rating}>
          <RatingStars rating={deal.rating} showValue={true} size="small" />
        </div>
        <div className={styles.price}>
          <span className={styles.originalPrice}>${deal.originalPrice}</span>
          <span className={styles.newPrice}>${deal.salePrice || deal.price}</span>
          <span className={styles.discount}>{deal.discount}% OFF</span>
        </div>
        {deal.affiliateUrl ? (
          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={styles.dealButton}
            aria-label={`View ${deal.title} deal`}
          >
            View Deal
          </a>
        ) : (
          <Link href="/deals" className={styles.dealButton}>
            Browse Similar Deals
          </Link>
        )}
      </div>
    </div>
  );
};

const HomePage = ({ featuredDeals = [] }) => {
  // Memoize featured deals slice for performance
  const displayDeals = useMemo(() =>
    featuredDeals.slice(0, 5),
    [featuredDeals]
  );

  // Newsletter hook
  const { email, setEmail, status, message, handleSubmit, isLoading } = useNewsletter();

  return (
    <div className={styles.pageContent}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>DealRadarUS - Your Radar for the Best Deals in the US</h1>
          <p>Discover amazing discounts on refurbished tech, smart home devices, and open-box electronics. Daily deals from trusted retailers with up to 70% off.</p>
          <div className={styles.heroCta}>
            <Link href="/deals" className={styles.btnPrimary}>Browse Deals</Link>
            <a href="#newsletter" className={styles.btnSecondary}>Get Deal Alerts</a>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className={styles.featuredDeals}>
        <div className={styles.container}>
          <h2>🔥 Featured Deals</h2>
          <div className={styles.dealsGrid}>
            {displayDeals.length > 0 ? (
              displayDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))
            ) : (
              // Fallback content when no deals are available
              <div className={styles.noDeals}>
                <h3>Loading featured deals...</h3>
                <p>We're updating our deals catalog. Check back in a moment!</p>
                <Link href="/deals" className={styles.btnPrimary}>Browse All Deals</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="newsletter" className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <h2>🎯 Never Miss a Deal!</h2>
            <p>Get the best deals delivered to your inbox daily. Join 25K+ deal hunters!</p>
            <form className={styles.newsletterForm} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                aria-label="Email address for deal alerts"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : 'Get Deal Alerts'}
              </button>
              {message && (
                <div
                  className={`${styles.newsletterMessage} ${styles[status]}`}
                  role="alert"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className={styles.container}>
          <h2>🛍️ Shop by Category</h2>
          <div className={styles.categoriesGrid}>
            <div className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <CategoryIcon category="refurbished-tech" size={32} />
              </div>
              <h3>Refurbished Tech</h3>
              <p>Smartphones, laptops, tablets</p>
            </div>
            <div className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <CategoryIcon category="smart-home" size={32} />
              </div>
              <h3>Smart Home</h3>
              <p>Speakers, thermostats, security</p>
            </div>
            <div className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <CategoryIcon category="open-box" size={32} />
              </div>
              <h3>Open Box</h3>
              <p>Like-new electronics</p>
            </div>
            <div className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <CategoryIcon category="gaming" size={32} />
              </div>
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
