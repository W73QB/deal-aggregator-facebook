import React, { useState, useMemo, useEffect } from 'react';
import { useDeals } from '../../hooks';
import RatingStars from '../ui/RatingStars';
import CategoryIcon from '../icons/CategoryIcon';

const DealsPage = ({ initialDeals = [] }) => {
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceLimit, setPriceLimit] = useState(2000);
  const [filterMerchant, setFilterMerchant] = useState('all');

  // Use our custom hook for data fetching with filtering
  const { deals, loading, error, refetch, meta } = useDeals({
    category: filterCategory,
    sort: sortBy,
    max_price: priceLimit,
    limit: 50
  });

  // Use initial deals from SSG/SSR if available and no API data yet
  const effectiveDeals = deals.length > 0 ? deals : initialDeals;

  const categories = useMemo(() => {
    const allCategories = ['all', ...new Set(effectiveDeals.map(d => d.category))];
    return allCategories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
        count: cat === 'all' ? effectiveDeals.length : effectiveDeals.filter(d => d.category === cat).length
    }));
  }, [effectiveDeals]);

  const merchants = useMemo(() => {
    const allMerchants = ['all', ...new Set(effectiveDeals.map(d => d.seller || d.store))];
    return allMerchants.map(merch => ({
        id: merch,
        name: merch
    }));
  }, [effectiveDeals]);

  const filteredDeals = useMemo(() => {
    return effectiveDeals.filter(deal => {
      const categoryMatch = filterCategory === 'all' || deal.category === filterCategory;
      const merchantMatch = filterMerchant === 'all' || (deal.seller || deal.store) === filterMerchant;
      const priceMatch = (deal.salePrice || deal.price) <= priceLimit;
      return categoryMatch && merchantMatch && priceMatch;
    });
  }, [effectiveDeals, filterCategory, filterMerchant, priceLimit]);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'discount':
        return (b.discount || 0) - (a.discount || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0; // featured order
    }
  });

  // Handle loading state
  if (loading) {
    return (
      <div className="deals-page">
        <div className="page-header">
          <div className="container">
            <h1>🎯 All Deals</h1>
            <p>Loading the best tech deals from trusted retailers...</p>
          </div>
        </div>
        <div className="container">
          <div className="loading-spinner">Loading deals...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="deals-page">
        <div className="page-header">
          <div className="container">
            <h1>🎯 All Deals</h1>
            <p>Discover the best tech deals from trusted retailers.</p>
          </div>
        </div>
        <div className="container">
          <div className="error-message">
            <h3>Oops! Something went wrong</h3>
            <p>We're having trouble loading deals right now. Please try again later.</p>
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
          {initialDeals.length > 0 && (
            <>
              <p>Here are some featured deals while we fix the issue:</p>
              <div className="deals-grid">
                {initialDeals.slice(0, 6).map(deal => (
                  <div key={deal.id} className="deal-card">
                    <div className="deal-image">
                      <img src={deal.image} alt={deal.title} />
                    </div>
                    <div className="deal-info">
                      <div className="deal-category">
                        <CategoryIcon category={deal.category} size={18} />
                        <span>{deal.category?.charAt(0).toUpperCase() + deal.category?.slice(1).replace('-', ' ')}</span>
                      </div>
                      <h3 className="deal-title">{deal.title}</h3>
                      <div className="deal-pricing">
                        <div className="price-row">
                          <span className="original-price">${deal.originalPrice}</span>
                          <span className="sale-price">${deal.salePrice || deal.price}</span>
                        </div>
                        <div className="discount-badge">{deal.discount}% OFF</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="deals-page">
      <div className="page-header">
        <div className="container">
          <h1>🎯 All Deals</h1>
          <p>Discover the best tech deals from trusted retailers. Updated daily!</p>
        </div>
      </div>

      <div className="container">
        <div className="deals-filters">
          <div className="filter-row">
            <div className="category-filters">
              <h3>Categories</h3>
              <div className="category-buttons">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${filterCategory === category.id ? 'active' : ''}`}
                    onClick={() => setFilterCategory(category.id)}
                  >
                    {category.id !== 'all' && <CategoryIcon category={category.id} size={16} />}
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="sort-controls">
                <div className="filter-group">
                    <label htmlFor="merchant-filter">Merchant:</label>
                    <select id="merchant-filter" value={filterMerchant} onChange={(e) => setFilterMerchant(e.target.value)}>
                        {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="sort">Sort by:</label>
                    <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="featured">Featured</option>
                        <option value="discount">Biggest Discount</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>
            </div>
          </div>
          <div className="filter-row">
            <div className="price-filter">
                <label htmlFor="price-range">Price Range: Up to ${priceLimit}</label>
                <input
                    type="range"
                    id="price-range"
                    min="0"
                    max="2000"
                    step="10"
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(Number(e.target.value))}
                />
            </div>
          </div>
        </div>

        <div className="deals-grid">
          {sortedDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              {deal.badge && <div className="deal-badge">{deal.badge}</div>}

              <div className="deal-image">
                <img src={deal.image} alt={deal.title} />
              </div>

              <div className="deal-info">
                <div className="deal-category">
                  <CategoryIcon category={deal.category} size={18} />
                  <span>{deal.category?.charAt(0).toUpperCase() + deal.category?.slice(1).replace('-', ' ')}</span>
                </div>

                <h3 className="deal-title">{deal.title}</h3>

                <div className="deal-rating">
                  <RatingStars rating={deal.rating} showValue={true} size="small" />
                </div>

                <div className="deal-seller">
                  <span className="seller-badge">✅ {deal.seller || deal.store}</span>
                </div>

                <div className="deal-pricing">
                  <div className="price-row">
                    <span className="original-price">${deal.originalPrice}</span>
                    <span className="sale-price">${deal.salePrice || deal.price}</span>
                  </div>
                  <div className="discount-badge">{deal.discount}% OFF</div>
                  <div className="savings">You save: ${deal.originalPrice - (deal.salePrice || deal.price)}</div>
                </div>

                <div className="deal-actions">
                  <button className="deal-button primary">
                    🛒 Shop Deal
                  </button>
                  <button className="deal-button secondary">
                    ❤️ Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedDeals.length === 0 && (
          <div className="no-deals">
            <h3>No deals found</h3>
            <p>Try adjusting your filters or check back later for new deals!</p>
          </div>
        )}
      </div>

      {/* Deal Alert CTA */}
      <section className="deal-alert-cta">
        <div className="container">
          <div className="cta-content">
            <h2>🔔 Want More Deals Like These?</h2>
            <p>Join 25K+ deal hunters and get the best deals delivered to your inbox daily!</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Get Deal Alerts</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealsPage;
