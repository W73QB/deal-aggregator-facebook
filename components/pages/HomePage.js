import React, { memo, useMemo } from 'react';
import RatingStars from '../ui/RatingStars';
import CategoryIcon from '../icons/CategoryIcon';
import { useNewsletter } from '../../hooks';
import styles from './HomePage.module.css';

// Memoized Deal Card component for performance
const DealCard = memo(({ deal }) => {
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIwNyAxNTAgMjEzIDE0NiAyMTcgMTQwQzIyMSAxMzQgMjIxIDEyNiAyMTcgMTIwQzIxMyAxMTQgMjA3IDExMCAyMDAgMTEwQzE5MyAxMTAgMTg3IDExNCAxODMgMTIwQzE3OSAxMjYgMTc5IDEzNCAxODMgMTQwQzE4NyAxNDYgMTkzIDE1MCAyMDAgMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjM1IDE5MEwxNjUgMTkwQzE2MiAxOTAgMTYwIDE4OCAxNjAgMTg1VjE3NUMxNjAgMTY4IDE2NSAxNjMgMTcyIDE2M0gyMjhDMjM1IDE2MyAyNDAgMTY4IDI0MCAxNzVWMTg1QzI0MCAxODggMjM4IDE5MCAyMzUgMTkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
    e.target.alt = `${deal.title} - Image not available`;
  };

  return (
    <div className={`${styles.dealCard} ${deal.featured ? styles.featured : ''}`}>
      {deal.badge && <div className={styles.dealBadge}>{deal.badge}</div>}
      <img
        src={deal.image}
        alt={deal.title}
        loading="lazy"
        onError={handleImageError}
      />
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
          <a href="/deals" className={styles.dealButton}>
            Browse Similar Deals
          </a>
        )}
      </div>
    </div>
  );
});

DealCard.displayName = 'DealCard';

const HomePage = memo(({ featuredDeals = [] }) => {
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
});

HomePage.displayName = 'HomePage';

export default HomePage;
