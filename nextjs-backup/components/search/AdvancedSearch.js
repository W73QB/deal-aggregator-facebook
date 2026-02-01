/**
 * Advanced Search & Filtering Component
 * Provides sophisticated search capabilities with faceted filtering
 */

import React, { useState, useEffect, useMemo } from 'react';

const AdvancedSearch = ({ onSearch, onFilter, categories = [], merchants = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    merchant: 'all',
    priceRange: [0, 2000],
    rating: 0,
    discount: 0,
    availability: 'all',
    condition: 'all',
    brand: 'all'
  });

  const [savedSearches, setSavedSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search suggestions based on popular terms
  const searchSuggestions = useMemo(() => ([
    'iPhone deals', 'MacBook discounts', 'Gaming laptop', 'Smart home devices',
    'Wireless headphones', 'Android phones', 'Computer monitors', 'Gaming accessories',
    'Tablets', 'Smartwatches', 'Cameras', 'Home theater'
  ]), []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return searchSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6);
  }, [searchQuery, searchSuggestions]);

  // Update parent component when filters change
  useEffect(() => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'priceRange' && (value[0] > 0 || value[1] < 2000)) {
        acc[key] = value;
      } else if (key !== 'priceRange' && value !== 'all' && value !== 0) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFilter?.(activeFilters);
  }, [filters, onFilter]);

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);

      // Save to recent searches
      const newSearch = {
        id: Date.now(),
        query: query.trim(),
        timestamp: new Date().toISOString()
      };
      setSavedSearches(prev => [newSearch, ...prev.slice(0, 4)]);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      merchant: 'all',
      priceRange: [0, 2000],
      rating: 0,
      discount: 0,
      availability: 'all',
      condition: 'all',
      brand: 'all'
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'priceRange') {
        return value[0] > 0 || value[1] < 2000;
      }
      return value !== 'all' && value !== 0;
    }).length;
  };

  return (
    <div className="advanced-search">
      {/* Main Search Bar */}
      <div className="search-main">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search for deals, products, brands..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(true)}
          />
          <button
            className="search-button"
            onClick={() => handleSearch()}
            aria-label="Search deals"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (filteredSuggestions.length > 0 || savedSearches.length > 0) && (
          <div className="search-suggestions">
            {filteredSuggestions.length > 0 && (
              <div className="suggestions-section">
                <h4>Suggestions</h4>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {savedSearches.length > 0 && (
              <div className="suggestions-section">
                <h4>Recent Searches</h4>
                {savedSearches.map((search) => (
                  <button
                    key={search.id}
                    className="suggestion-item recent"
                    onClick={() => {
                      setSearchQuery(search.query);
                      handleSearch(search.query);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                    {search.query}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="filter-controls">
        <button
          className={`filter-toggle ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 6h10l-5.01 6.3L7 6zm-2.75-.39C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.73-4.8 5.75-7.39c.51-.66.04-1.61-.79-1.61H4.04c-.83 0-1.3.95-.79 1.61z"/>
          </svg>
          Advanced Filters
          {getActiveFilterCount() > 0 && (
            <span className="filter-count">{getActiveFilterCount()}</span>
          )}
        </button>

        {getActiveFilterCount() > 0 && (
          <button className="clear-filters" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant Filter */}
            <div className="filter-group">
              <label>Store</label>
              <select
                value={filters.merchant}
                onChange={(e) => handleFilterChange('merchant', e.target.value)}
              >
                <option value="all">All Stores</option>
                {merchants.map(merchant => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group price-range">
              <label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</label>
              <div className="range-inputs">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                  className="range-slider"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label>Minimum Rating</label>
              <div className="rating-filter">
                {[0, 3, 4, 4.5, 5].map(rating => (
                  <button
                    key={rating}
                    className={`rating-btn ${filters.rating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rating', rating)}
                  >
                    {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Filter */}
            <div className="filter-group">
              <label>Minimum Discount</label>
              <div className="discount-filter">
                {[0, 10, 20, 30, 50].map(discount => (
                  <button
                    key={discount}
                    className={`discount-btn ${filters.discount === discount ? 'active' : ''}`}
                    onClick={() => handleFilterChange('discount', discount)}
                  >
                    {discount === 0 ? 'Any' : `${discount}%+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-group">
              <label>Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock Only</option>
                <option value="limited">Limited Stock</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-search {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-main {
          position: relative;
          margin-bottom: 16px;
        }

        .search-input-wrapper {
          display: flex;
          position: relative;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px 0 0 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          border-color: #1A73E8;
        }

        .search-button {
          padding: 12px 20px;
          background: #1A73E8;
          color: white;
          border: none;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .search-button:hover {
          background: #0056b3;
        }

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e5e9;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }

        .suggestions-section {
          padding: 12px 0;
        }

        .suggestions-section:not(:last-child) {
          border-bottom: 1px solid #f1f3f4;
        }

        .suggestions-section h4 {
          padding: 0 16px 8px;
          margin: 0;
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
        }

        .suggestion-item {
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #333;
          transition: background-color 0.2s ease;
        }

        .suggestion-item:hover {
          background: #f8f9fa;
        }

        .suggestion-item.recent {
          color: #6c757d;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .filter-toggle.active {
          background: #1A73E8;
          color: white;
          border-color: #1A73E8;
        }

        .filter-count {
          background: #FF3B30;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .clear-filters {
          padding: 8px 12px;
          background: none;
          border: 1px solid #dc3545;
          color: #dc3545;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .clear-filters:hover {
          background: #dc3545;
          color: white;
        }

        .filters-panel {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .price-range .range-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .range-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e1e5e9;
          outline: none;
          -webkit-appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1A73E8;
          cursor: pointer;
        }

        .rating-filter,
        .discount-filter {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rating-btn,
        .discount-btn {
          padding: 6px 12px;
          border: 1px solid #e1e5e9;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .rating-btn.active,
        .discount-btn.active {
          background: #1A73E8;
          color: white;
          border-color: #1A73E8;
        }

        @media (max-width: 768px) {
          .advanced-search {
            padding: 16px;
          }

          .filters-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .search-input {
            font-size: 14px;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;
