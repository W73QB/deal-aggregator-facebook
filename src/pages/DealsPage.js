import React, { useState } from 'react';

const DealsPage = () => {
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');

  const deals = [
    {
      id: 1,
      title: "iPhone 14 Pro - Refurbished",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1663703841896",
      originalPrice: 999,
      salePrice: 749,
      discount: 25,
      rating: 4.8,
      category: "smartphones",
      badge: "Featured",
      seller: "Apple Certified"
    },
    {
      id: 2,
      title: "MacBook Pro M2 - Open Box",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=95&.v=1653493200207",
      originalPrice: 1299,
      salePrice: 999,
      discount: 23,
      rating: 4.9,
      category: "laptops",
      badge: "Hot Deal",
      seller: "Best Buy"
    },
    {
      id: 3,
      title: "Samsung Galaxy Watch 5 Pro",
      image: "https://images.samsung.com/is/image/samsung/p6pim/us/2208/gallery/us-galaxy-watch5-pro-r920-sm-r920nzeaxar-534494958?$650_519_PNG$",
      originalPrice: 449,
      salePrice: 299,
      discount: 33,
      rating: 4.6,
      category: "wearables",
      badge: "Best Value",
      seller: "Samsung Direct"
    },
    {
      id: 4,
      title: "Nintendo Switch OLED - Like New",
      image: "https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000964/811316ca888713aa5cde47fb6cb26d0a3fede983f3bf43ae4d9aa1bf2c1d7e70",
      originalPrice: 349,
      salePrice: 279,
      discount: 20,
      rating: 4.7,
      category: "gaming",
      badge: "Popular",
      seller: "GameStop"
    },
    {
      id: 5,
      title: "AirPods Pro 2nd Gen - Refurbished",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=2000&hei=2000&fmt=jpeg&qlt=95&.v=1660803972361",
      originalPrice: 249,
      salePrice: 179,
      discount: 28,
      rating: 4.8,
      category: "audio",
      badge: "Limited Time",
      seller: "Apple Certified"
    },
    {
      id: 6,
      title: "Sony WH-1000XM5 - Open Box",
      image: "https://sony.scene7.com/is/image/sonyglobalsolutions/wh-1000xm5_Primary_image?$categorypdpnav$&fmt=png-alpha",
      originalPrice: 399,
      salePrice: 299,
      discount: 25,
      rating: 4.9,
      category: "audio",
      badge: "Editor's Choice",
      seller: "Sony Direct"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Deals', count: deals.length },
    { id: 'smartphones', name: 'Smartphones', count: deals.filter(d => d.category === 'smartphones').length },
    { id: 'laptops', name: 'Laptops', count: deals.filter(d => d.category === 'laptops').length },
    { id: 'gaming', name: 'Gaming', count: deals.filter(d => d.category === 'gaming').length },
    { id: 'audio', name: 'Audio', count: deals.filter(d => d.category === 'audio').length },
    { id: 'wearables', name: 'Wearables', count: deals.filter(d => d.category === 'wearables').length }
  ];

  const filteredDeals = filterCategory === 'all'
    ? deals
    : deals.filter(deal => deal.category === filterCategory);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.salePrice - b.salePrice;
      case 'price-high': return b.salePrice - a.salePrice;
      case 'discount': return b.discount - a.discount;
      case 'rating': return b.rating - a.rating;
      default: return 0; // featured order
    }
  });

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
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="discount">Biggest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
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