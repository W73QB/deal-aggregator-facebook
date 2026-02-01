import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions with debouncing
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/deals?search=${encodeURIComponent(query)}&limit=5`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Create suggestions from actual search results
            const searchSuggestions = data.data.slice(0, 4).map(deal => ({
              type: 'deal',
              title: deal.title,
              category: deal.category,
              price: deal.salePrice || deal.price,
              originalPrice: deal.originalPrice
            }));

            // Add the search query itself as first suggestion
            const allSuggestions = [
              {
                type: 'query',
                title: query,
                description: `Search for "${query}"`
              },
              ...searchSuggestions
            ];

            setSuggestions(allSuggestions);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, API_BASE_URL]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const performSearch = (searchQuery) => {
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'query') {
      performSearch(suggestion.title);
    } else {
      // For deal suggestions, we can either search for the title or navigate to the deal
      performSearch(suggestion.title);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="search"
            placeholder="Search deals..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="search-input"
            aria-label="Search for deals"
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? (
              <div className="search-spinner"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            )}
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${suggestion.type}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type === 'query' ? (
                <div className="suggestion-query">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="suggestion-icon">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <span className="suggestion-text">{suggestion.description}</span>
                </div>
              ) : (
                <div className="suggestion-deal">
                  <div className="suggestion-deal-info">
                    <div className="suggestion-deal-title">{suggestion.title}</div>
                    <div className="suggestion-deal-meta">
                      <span className="suggestion-category">{suggestion.category}</span>
                      <span className="suggestion-price">
                        ${suggestion.price}
                        {suggestion.originalPrice && suggestion.originalPrice > suggestion.price && (
                          <span className="suggestion-original-price">${suggestion.originalPrice}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-form {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input-wrapper:focus-within {
          border-color: #1A73E8;
          box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
        }

        .search-input {
          flex: 1;
          padding: 10px 14px;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
          border-radius: 8px 0 0 8px;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          background: #1A73E8;
          color: white;
          border: none;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 44px;
        }

        .search-button:hover:not(:disabled) {
          background: #1557b0;
        }

        .search-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .search-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
          margin-top: 4px;
          max-height: 300px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #f9fafb;
        }

        .suggestion-item.query {
          border-bottom: 2px solid #e5e7eb;
          background: #fafafa;
        }

        .suggestion-query {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .suggestion-icon {
          color: #6b7280;
          flex-shrink: 0;
        }

        .suggestion-text {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .suggestion-deal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .suggestion-deal-info {
          flex: 1;
          min-width: 0;
        }

        .suggestion-deal-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 2px;
        }

        .suggestion-deal-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .suggestion-category {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .suggestion-price {
          font-size: 13px;
          font-weight: 600;
          color: #059669;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .suggestion-original-price {
          font-size: 11px;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: normal;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .search-container {
            max-width: 300px;
          }

          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
            padding: 8px 12px;
          }

          .search-button {
            padding: 8px 12px;
            min-width: 40px;
          }

          .suggestion-item {
            padding: 10px 12px;
          }

          .suggestions-dropdown {
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBox;
