import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks';
import RatingStars from '../components/ui/RatingStars';
import CategoryIcon from '../components/icons/CategoryIcon';

import { getApiBase } from '../lib/apiClient';

export default function Favorites() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toggleFavorite, loading: favLoading, error: favError } = useFavorites();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');

  const API_BASE_URL = getApiBase();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch favorites
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/deals/favorites`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFavorites(data.data || []);
      } else {
        setError(data.message || 'Failed to load favorites');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (dealId) => {
    const result = await toggleFavorite(dealId, true); // true = currently favorited, so remove it

    if (result.success) {
      // Remove from local state
      setFavorites(prev => prev.filter(deal => deal.id !== dealId));
    }
  };

  // Get unique categories for filtering
  const categories = ['all', ...new Set(favorites.map(deal => deal.category))];

  // Filter and sort favorites
  const filteredFavorites = favorites.filter(deal => {
    return filterCategory === 'all' || deal.category === filterCategory;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'price-low':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'discount':
        const aDiscount = a.originalPrice ? ((a.originalPrice - (a.salePrice || a.price)) / a.originalPrice) * 100 : 0;
        const bDiscount = b.originalPrice ? ((b.originalPrice - (b.salePrice || b.price)) / b.originalPrice) * 100 : 0;
        return bDiscount - aDiscount;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Favorites - DealRadarUS</title>
        <meta name="description" content="View and manage your favorite deals on DealRadarUS." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="favorites-page">
        <div className="container">
          <div className="favorites-header">
            <div className="header-content">
              <h1>My Favorites</h1>
              <p>Your saved deals and wishlist items</p>
            </div>
            <div className="favorites-count">
              {favorites.length} {favorites.length === 1 ? 'deal' : 'deals'} saved
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
              <button onClick={fetchFavorites} className="retry-button">Retry</button>
            </div>
          )}

          {favError && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {favError}
            </div>
          )}

          {!loading && !error && (
            <>
              {favorites.length > 0 && (
                <div className="favorites-controls">
                  <div className="control-group">
                    <label>Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="control-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="discount">Highest Discount</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Category:</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="control-select"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="favorites-content">
                {loading && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your favorites...</p>
                  </div>
                )}

                {!loading && sortedFavorites.length === 0 && filterCategory !== 'all' && (
                  <div className="no-results">
                    <h3>No favorites in this category</h3>
                    <p>Try selecting a different category or clear the filter.</p>
                    <button
                      onClick={() => setFilterCategory('all')}
                      className="clear-filter-button"
                    >
                      Show All Favorites
                    </button>
                  </div>
                )}

                {!loading && favorites.length === 0 && (
                  <div className="empty-favorites">
                    <div className="empty-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <h3>No favorites yet</h3>
                    <p>Start saving deals you love by clicking the heart icon on any deal.</p>
                    <a href="/deals" className="browse-deals-button">
                      Browse Deals
                    </a>
                  </div>
                )}

                {!loading && sortedFavorites.length > 0 && (
                  <div className="favorites-grid">
                    {sortedFavorites.map(deal => (
                      <div key={deal.id} className="favorite-card">
                        <div className="deal-image">
                          <img
                            src={deal.image || '/placeholder-deal.jpg'}
                            alt={deal.title}
                            onError={(e) => {
                              e.target.src = '/placeholder-deal.jpg';
                            }}
                          />
                          {deal.featured && <span className="featured-badge">Featured</span>}
                          <button
                            onClick={() => handleRemoveFavorite(deal.id)}
                            className="remove-favorite"
                            disabled={favLoading}
                            title="Remove from favorites"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
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
                              Saved {new Date(deal.createdAt).toLocaleDateString()}
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
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .favorites-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .favorites-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-content h1 {
          margin: 0 0 4px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .favorites-count {
          background: #1A73E8;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          border: 1px solid #fecaca;
        }

        .retry-button {
          margin-left: auto;
          background: #dc2626;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .favorites-controls {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
        }

        .control-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          min-width: 140px;
        }

        .favorites-loading,
        .loading-state {
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

        .empty-favorites,
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-icon {
          color: #d1d5db;
          margin-bottom: 24px;
        }

        .empty-favorites h3,
        .no-results h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #374151;
        }

        .empty-favorites p,
        .no-results p {
          margin: 0 0 24px 0;
          color: #6b7280;
          font-size: 16px;
          max-width: 400px;
          line-height: 1.5;
        }

        .browse-deals-button,
        .clear-filter-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1A73E8;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }

        .browse-deals-button:hover,
        .clear-filter-button:hover {
          background: #1557b0;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .favorite-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .favorite-card:hover {
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

        .remove-favorite {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.5);
          color: #ef4444;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }

        .remove-favorite:hover {
          background: rgba(0, 0, 0, 0.7);
          color: #dc2626;
        }

        .remove-favorite:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @media (max-width: 768px) {
          .favorites-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .favorites-controls {
            flex-direction: column;
            gap: 16px;
          }

          .control-group {
            justify-content: space-between;
          }

          .control-select {
            min-width: auto;
            flex: 1;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 0 16px;
          }
        }
      `}</style>
    </>
  );
}