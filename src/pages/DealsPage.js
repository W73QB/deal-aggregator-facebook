import React, { useState, useMemo } from 'react';

const DealsPage = () => {
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceLimit, setPriceLimit] = useState(2000);
  const [filterMerchant, setFilterMerchant] = useState('all');

  const deals = [
    {
      id: 1,
      title: "iPhone 14 Pro - Refurbished",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-storage-select-202209-6-1inch-deeppurple",
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
      title: "MacBook Air M2 - Open Box",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606",
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
      title: "Samsung Galaxy S23",
      image: "https://image-us.samsung.com/SamsungUS/home/mobile/phones/galaxy-s/galaxy-s23/gallery/SM-S911_GalaxyS23_Gallery_Lavender_1.jpg",
      originalPrice: 799,
      salePrice: 599,
      discount: 25,
      rating: 4.6,
      category: "smartphones",
      badge: "Best Value",
      seller: "Samsung Direct"
    },
    {
      id: 4,
      title: "Nintendo Switch OLED - Like New",
      image: "https://assets.nintendo.com/image/upload/f_auto,q_auto,w_1920,h_1080/v1/ncom/en_US/hardware/switch/oled/gallery/image01",
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
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361",
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
      image: "https://www.sony.com/image/5d02da5df55283e84e344c8952469462?fmt=pjpeg&wid=1440&hei=1440&bgcolor=F1F5F9",
      originalPrice: 399,
      salePrice: 299,
      discount: 25,
      rating: 4.9,
      category: "audio",
      badge: "Editor's Choice",
      seller: "Sony Direct"
    },
    {
        id: 7,
        title: "Google Pixel 7 - Open Box",
        image: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Pixel_7_Pro_and_Pixel_7.width-1000.format-webp.webp",
        originalPrice: 599,
        salePrice: 449,
        discount: 25,
        rating: 4.7,
        category: "smartphones",
        badge: "Great Value",
        seller: "Google Store"
    },
    {
        id: 8,
        title: "Dell XPS 15 Laptop",
        image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-platinum-silver/notebook-xps-15-9530-t-platinum-silver-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3782&hei=2988&qlt=100,0&resMode=sharp2&size=3782,2988",
        originalPrice: 1899,
        salePrice: 1399,
        discount: 26,
        rating: 4.6,
        category: "laptops",
        badge: "Powerhouse",
        seller: "Dell Outlet"
    },
    {
        id: 9,
        title: "Amazon Echo Show 8",
        image: "https://m.media-amazon.com/images/I/61yZ38kP9KL._AC_SL1000_.jpg",
        originalPrice: 129,
        salePrice: 89,
        discount: 31,
        rating: 4.7,
        category: "smart-home",
        badge: "Smart Display",
        seller: "Amazon"
    }
  ];

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