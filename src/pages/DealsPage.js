import React, { useState, useEffect, useMemo } from 'react';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceLimit, setPriceLimit] = useState(2000);
  const [filterMerchant, setFilterMerchant] = useState('all');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/deals');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDeals(data);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
        // Here you could set an error state to show a message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const categories = useMemo(() => {
    const allCategories = ['all', ...new Set(deals.map(d => d.category))];
    return allCategories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
        count: cat === 'all' ? deals.length : deals.filter(d => d.category === cat).length
    }));
  }, [deals]);

  const merchants = useMemo(() => {
    const allMerchants = ['all', ...new Set(deals.map(d => d.seller))];
    return allMerchants.map(merch => ({
        id: merch,
        name: merch
    }));
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const categoryMatch = filterCategory === 'all' || deal.category === filterCategory;
      const merchantMatch = filterMerchant === 'all' || deal.seller === filterMerchant;
      const priceMatch = deal.salePrice <= priceLimit;
      return categoryMatch && merchantMatch && priceMatch;
    });
  }, [deals, filterCategory, filterMerchant, priceLimit]);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.salePrice - b.salePrice;
      case 'price-high': return b.salePrice - a.salePrice;
      case 'discount': return b.discount - a.discount;
      case 'rating': return b.rating - a.rating;
      default: return 0; // featured order
    }
  });

  if (loading) {
    return <div className="loading-spinner">Loading deals...</div>;
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
                <h3 className="deal-title">{deal.title}</h3>

                <div className="deal-rating">
                  <div className="stars">
                    {'⭐'.repeat(Math.floor(deal.rating))}
                    {deal.rating % 1 !== 0 && '☆'}
                  </div>
                  <span className="rating-text">({deal.rating})</span>
                </div>

                <div className="deal-seller">
                  <span className="seller-badge">✅ {deal.seller}</span>
                </div>

                <div className="deal-pricing">
                  <div className="price-row">
                    <span className="original-price">${deal.originalPrice}</span>
                    <span className="sale-price">${deal.salePrice}</span>
                  </div>
                  <div className="discount-badge">{deal.discount}% OFF</div>
                  <div className="savings">You save: ${deal.originalPrice - deal.salePrice}</div>
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
