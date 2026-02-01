import React, { useState, useMemo } from 'react';
import OptimizedImage from '../components/ui/OptimizedImage';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDeals } from '../hooks';
import RatingStars from '../components/ui/RatingStars';
import CategoryIcon from '../components/icons/CategoryIcon';

export default function Search() {
  const router = useRouter();
  const { q: searchQuery } = router.query;

  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Use our custom hook for data fetching with search
  const { deals, loading, error, refetch } = useDeals({
    search: searchQuery,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    sort: sortBy === 'relevance' ? undefined : sortBy,
    min_price: priceRange.min || undefined,
    max_price: priceRange.max || undefined,
    limit: 50
  });

  // Get unique categories from results for filtering
  const categories = useMemo(() => {
    const allCategories = ['all', ...new Set(deals.map(d => d.category))];
    return allCategories.map(cat => ({
      id: cat,
      name: cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
      count: cat === 'all' ? deals.length : deals.filter(d => d.category === cat).length
    }));
  }, [deals]);

  // Filter deals based on price range (client-side filtering for price range)
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const price = deal.salePrice || deal.price;
      const minOk = !priceRange.min || price >= parseFloat(priceRange.min);
      const maxOk = !priceRange.max || price <= parseFloat(priceRange.max);
      return minOk && maxOk;
    });
  }, [deals, priceRange]);

  // Sort deals (client-side sorting for relevance)
  const sortedDeals = useMemo(() => {
    if (sortBy === 'relevance') {
      // For relevance, we trust the backend ordering
      return filteredDeals;
    }

    return [...filteredDeals].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'price-high':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'discount': {
          const aDiscount = a.originalPrice ? ((a.originalPrice - (a.salePrice || a.price)) / a.originalPrice) * 100 : 0;
          const bDiscount = b.originalPrice ? ((b.originalPrice - (b.salePrice || b.price)) / b.originalPrice) * 100 : 0;
          return bDiscount - aDiscount;
        }
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [filteredDeals, sortBy]);

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!searchQuery) {
    return (
      <>
        <Head>
          <title>Search - DealRadarUS</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="search-page">
          <div className="container">
            <div className="search-error">
              <h1>No Search Query</h1>
              <p>Please enter a search term to find deals.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Search: "${searchQuery}" - DealRadarUS`}</title>
        <meta
          name="description"
          content={`Search results for "${searchQuery}" on DealRadarUS. Find the best deals matching your search.`}
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="search-page">
        <div className="container">
          <div className="search-header">
            <h1>Search Results</h1>
            <p className="search-query">
              Showing results for: <strong>"{searchQuery}"</strong>
            </p>
            {!loading && (
              <p className="search-count">
                {sortedDeals.length} {sortedDeals.length === 1 ? 'deal' : 'deals'} found
              </p>
            )}
          </div>

          <div className="search-content">
            {/* Filters Sidebar */}
            <aside className="search-filters">
              <div className="filter-section">
                <h3>Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="filter-section">
                <h3>Category</h3>
                <div className="category-filters">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className={`category-filter ${filterCategory === category.id ? 'active' : ''}`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="price-range">
                  <div className="price-input-group">
                    <label>Min:</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max:</label>
                    <input
                      type="number"
                      placeholder="$999"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Search Results */}
            <main className="search-results">
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Searching for deals...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <h3>Oops! Something went wrong</h3>
                  <p>{error}</p>
                  <button onClick={() => refetch()} className="retry-button">
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && sortedDeals.length === 0 && (
                <div className="no-results">
                  <h3>No deals found</h3>
                  <p>Try adjusting your search terms or filters.</p>
                  <div className="search-suggestions">
                    <p>Suggestions:</p>
                    <ul>
                      <li>Check your spelling</li>
                      <li>Try more general keywords</li>
                      <li>Remove some filters</li>
                    </ul>
                  </div>
                </div>
              )}

              {!loading && !error && sortedDeals.length > 0 && (
                <div className="deals-grid">
                  {sortedDeals.map(deal => (
                    <div key={deal.id} className="deal-card">
                      <div className="deal-image">
                        <OptimizedImage
                          src={deal.image || '/placeholder-deal.jpg'}
                          alt={deal.title}
                          width={320}
                          height={200}
                        />
                        {deal.featured && <span className="featured-badge">Featured</span>}
                      </div>

                      <div className="deal-content">
                        <div className="deal-category">
                          <CategoryIcon category={deal.category} />
                          <span>{deal.category}</span>
                        </div>

                        <h3 className="deal-title">{deal.title}</h3>

                        <p className="deal-description">{deal.description}</p>

                        <div className="deal-rating">
                          <RatingStars rating={deal.rating || 0} />
                          <span className="rating-text">({deal.rating || 'No rating'})</span>
                        </div>

                        <div className="deal-pricing">
                          <span className="current-price">${deal.salePrice || deal.price}</span>
                          {deal.originalPrice && deal.originalPrice > (deal.salePrice || deal.price) && (
                            <>
                              <span className="original-price">${deal.originalPrice}</span>
                              <span className="discount">
                                {Math.round(((deal.originalPrice - (deal.salePrice || deal.price)) / deal.originalPrice) * 100)}% off
                              </span>
                            </>
                          )}
                        </div>

                        <div className="deal-meta">
                          <span className="deal-store">{deal.store || deal.seller}</span>
                          <span className="deal-date">
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <a
                          href={deal.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="deal-button"
                        >
                          View Deal
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .search-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .search-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
        }

        .search-query {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #4a5568;
        }

        .search-count {
          margin: 0;
          font-size: 14px;
          color: #718096;
        }

        .search-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
        }

        .search-filters {
          background: white;
          border-radius: 12px;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filter-section {
          margin-bottom: 32px;
        }

        .filter-section:last-child {
          margin-bottom: 0;
        }

        .filter-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .filter-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .category-filters {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-filter {
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .category-filter:hover {
          background: #f7fafc;
        }

        .category-filter.active {
          background: #1A73E8;
          color: white;
          border-color: #1A73E8;
        }

        .price-range {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-input-group label {
          font-size: 14px;
          color: #4a5568;
          min-width: 30px;
        }

        .price-input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-results {
          min-height: 400px;
        }

        .loading-state,
        .error-state,
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #1A73E8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .retry-button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #1A73E8;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .search-suggestions {
          margin-top: 24px;
          text-align: left;
        }

        .search-suggestions ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .deals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .deal-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .deal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .deal-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .deal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .deal-content {
          padding: 20px;
        }

        .deal-category {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          font-weight: 500;
        }

        .deal-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          line-height: 1.4;
        }

        .deal-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #4a5568;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .deal-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .rating-text {
          font-size: 12px;
          color: #718096;
        }

        .deal-pricing {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .current-price {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }

        .original-price {
          font-size: 14px;
          color: #a0aec0;
          text-decoration: line-through;
        }

        .discount {
          font-size: 12px;
          color: #f56565;
          font-weight: 600;
        }

        .deal-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 12px;
          color: #718096;
        }

        .deal-button {
          display: block;
          width: 100%;
          padding: 10px;
          background: #1A73E8;
          color: white;
          text-decoration: none;
          text-align: center;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .deal-button:hover {
          background: #1557b0;
        }

        @media (max-width: 1024px) {
          .search-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .search-filters {
            position: static;
            order: 2;
          }

          .search-results {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .deals-grid {
            grid-template-columns: 1fr;
          }

          .search-header h1 {
            font-size: 24px;
          }

          .container {
            padding: 0 16px;
          }
        }
      `}</style>
    </>
  );
}
