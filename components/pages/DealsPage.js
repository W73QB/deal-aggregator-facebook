import React, { useState, useMemo, useEffect } from 'react';
import RatingStars from '../ui/RatingStars';
import CategoryIcon from '../icons/CategoryIcon';
import { useNewsletter, useFavorites } from '../../hooks';

const DealsPage = ({ initialDeals = [] }) => {
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceLimit, setPriceLimit] = useState(2000);
  const [filterMerchant, setFilterMerchant] = useState('all');
  const [clientDeals, setClientDeals] = useState([]);
  const [isClientLoading, setIsClientLoading] = useState(false);

  // Newsletter hook
  const { email, setEmail, status, message, handleSubmit, isLoading } = useNewsletter();

  // Favorites hook
  const { toggleFavorite, loading: favLoading, error: favError, canUseFavorites } = useFavorites();
  const [favorites, setFavorites] = useState(new Set());

  // Use initial deals as primary data source, API calls only for filtering
  const [effectiveDeals, setEffectiveDeals] = useState(initialDeals);

  // Only fetch from API when filtering changes (not on initial load)
  useEffect(() => {
    // If filters are at default values, use initial SSG data
    if (sortBy === 'featured' && filterCategory === 'all' && priceLimit === 2000 && filterMerchant === 'all') {
      setEffectiveDeals(initialDeals);
      return;
    }

    // Only make API call for filtered results
    const fetchFilteredDeals = async () => {
      try {
        setIsClientLoading(true);

        const params = new URLSearchParams();
        if (filterCategory !== 'all') params.append('category', filterCategory);
        if (priceLimit !== 2000) params.append('max_price', priceLimit);
        if (sortBy !== 'featured') params.append('sort', sortBy);
        params.append('limit', '50');

        const response = await fetch(`/api/deals?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.deals) {
            setClientDeals(data.deals);
            setEffectiveDeals(data.deals);
          }
        } else {
          // Fallback to client-side filtering of initial data
          console.warn('API filtering failed, using client-side filtering');
          setEffectiveDeals(initialDeals);
        }
      } catch (error) {
        console.error('Filtered deals fetch failed:', error);
        // Fallback to initial data
        setEffectiveDeals(initialDeals);
      } finally {
        setIsClientLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(fetchFilteredDeals, 500);
    return () => clearTimeout(timeoutId);
  }, [filterCategory, sortBy, priceLimit, filterMerchant, initialDeals]);

  // Use effective deals (either SSG or filtered API data)
  const loading = isClientLoading;

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

  // Client-side filtering (used when using SSG data or as fallback)
  const filteredDeals = useMemo(() => {
    let filtered = [...effectiveDeals];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(deal => deal.category === filterCategory);
    }

    // Apply merchant filter
    if (filterMerchant !== 'all') {
      filtered = filtered.filter(deal => (deal.seller || deal.store) === filterMerchant);
    }

    // Apply price filter
    filtered = filtered.filter(deal => (deal.salePrice || deal.price) <= priceLimit);

    return filtered;
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

  // Handle save/favorite click
  const handleSaveClick = async (dealId) => {
    const isFavorited = favorites.has(dealId);
    const result = await toggleFavorite(dealId, isFavorited);

    if (result.success) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (result.favorited) {
          newSet.add(dealId);
        } else {
          newSet.delete(dealId);
        }
        return newSet;
      });
    }
  };

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

  // Error state is now handled within the useEffect and doesn't need global error
  // Keeping this section for future error handling if needed
  if (false) { // Disabled since we're using fallback patterns
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

        {favError && (
          <div
            className="favorites-error"
            role="alert"
            aria-live="polite"
          >
            ⚠️ {favError}
          </div>
        )}

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
                  {deal.affiliateUrl ? (
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="deal-button primary"
                      aria-label={`Shop ${deal.title} at ${deal.store || 'retailer'}`}
                    >
                      🛒 Shop Deal
                    </a>
                  ) : (
                    <button
                      className="deal-button primary disabled"
                      disabled
                      aria-label="Link coming soon"
                    >
                      🛒 Coming Soon
                    </button>
                  )}
                  <button
                    className={`deal-button secondary ${favorites.has(deal.id) ? 'active' : ''}`}
                    onClick={() => handleSaveClick(deal.id)}
                    disabled={favLoading}
                    aria-label={
                      favorites.has(deal.id)
                        ? `Remove ${deal.title} from favorites`
                        : `Save ${deal.title} to favorites`
                    }
                    title={canUseFavorites ? undefined : 'Please log in to save favorites'}
                  >
                    {favorites.has(deal.id) ? '❤️ Saved' : '🤍 Save'}
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
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
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
                  className={`newsletter-message ${status}`}
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
    </div>
  );
};

export default DealsPage;
