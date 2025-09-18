import React, { memo, useMemo } from 'react';
import RatingStars from '../ui/RatingStars';
import CategoryIcon from '../icons/CategoryIcon';
import styles from './HomePage.module.css';

// Memoized Deal Card component for performance
const DealCard = memo(({ deal }) => (
  <div className={`${styles.dealCard} ${deal.featured ? styles.featured : ''}`}>
    {deal.badge && <div className={styles.dealBadge}>{deal.badge}</div>}
    <img src={deal.image} alt={deal.title} loading="lazy" />
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
      <a href="/deals" className={styles.dealButton}>View Deal</a>
    </div>
  </div>
));

DealCard.displayName = 'DealCard';

const HomePage = memo(({ featuredDeals = [] }) => {
  // Memoize featured deals slice for performance
  const displayDeals = useMemo(() =>
    featuredDeals.slice(0, 5),
    [featuredDeals]
  );
  return (
    <div className={styles.pageContent}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>DealRadarUS - Your Radar for the Best Deals in the US</h1>
          <p>Discover amazing discounts on refurbished tech, smart home devices, and open-box electronics. Daily deals from trusted retailers with up to 70% off.</p>
          <div className={styles.heroCta}>
            <a href="/deals" className={styles.btnPrimary}>Browse Deals</a>
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
                <a href="/deals" className={styles.btnPrimary}>Browse All Deals</a>
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
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Get Deal Alerts</button>
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
});

HomePage.displayName = 'HomePage';

export default HomePage;
