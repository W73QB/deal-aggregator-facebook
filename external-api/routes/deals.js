// Deals API Router
// Converted from pages/api/deals.js

const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Static fallback data
const staticDeals = [
  {
    id: 1,
    title: "iPhone 14 Pro - Refurbished",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    originalPrice: 999,
    salePrice: 749,
    discount: 25,
    rating: 4.8,
    category: "smartphones",
    badge: "Featured",
    seller: "Apple Certified",
    featured: true
  },
  {
    id: 2,
    title: "MacBook Air M2 - Open Box",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    originalPrice: 1299,
    salePrice: 999,
    discount: 23,
    rating: 4.9,
    category: "laptops",
    badge: "Hot Deal",
    seller: "Best Buy",
    featured: true
  },
  {
    id: 3,
    title: "Samsung Galaxy S23",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    originalPrice: 799,
    salePrice: 599,
    discount: 25,
    rating: 4.6,
    category: "smartphones",
    badge: "Best Value",
    seller: "Samsung Direct",
    featured: false
  },
  {
    id: 4,
    title: "Nintendo Switch OLED - Like New",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    originalPrice: 349,
    salePrice: 279,
    discount: 20,
    rating: 4.7,
    category: "gaming",
    badge: "Popular",
    seller: "GameStop",
    featured: false
  },
  {
    id: 5,
    title: "AirPods Pro 2nd Gen - Refurbished",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=400&fit=crop",
    originalPrice: 249,
    salePrice: 179,
    discount: 28,
    rating: 4.8,
    category: "audio",
    badge: "Limited Time",
    seller: "Apple Certified",
    featured: true
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
    seller: "Sony Direct",
    featured: true
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
    seller: "Google Store",
    featured: false
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
    seller: "Dell Outlet",
    featured: false
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
    seller: "Amazon",
    featured: false
  }
];

async function fetchDealsFromDB(filters = {}) {
  try {
    if (!db.isConfigured()) {
      console.log('Database not configured, using static data');
      return applyFiltersToStaticData(staticDeals, filters);
    }

    let query = `
      SELECT
        id, title, description, image, original_price, sale_price,
        discount, rating, category, featured, store, affiliate_url,
        created_at, updated_at
      FROM deals
      WHERE active = true
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add category filter
    if (filters.category) {
      query += ` AND LOWER(category) = $${paramIndex}`;
      queryParams.push(filters.category.toLowerCase());
      paramIndex++;
    }

    // Add featured filter
    if (filters.featured === 'true') {
      query += ` AND featured = true`;
    }

    // Add ordering
    query += ` ORDER BY created_at DESC`;

    // Add limit
    if (filters.limit && !isNaN(parseInt(filters.limit))) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(filters.limit));
    }

    const result = await db.query(query, queryParams);

    // Transform database results to match expected format
    return result.rows.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      image: deal.image,
      originalPrice: deal.original_price,
      salePrice: deal.sale_price,
      discount: deal.discount,
      rating: deal.rating,
      category: deal.category,
      featured: deal.featured,
      store: deal.store,
      affiliateUrl: deal.affiliate_url,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    }));

  } catch (error) {
    console.error('Database error, falling back to static data:', error);
    return applyFiltersToStaticData(staticDeals, filters);
  }
}

function applyFiltersToStaticData(deals, filters) {
  let filteredDeals = [...deals];

  if (filters.category) {
    filteredDeals = filteredDeals.filter(deal =>
      deal.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }

  if (filters.featured === 'true') {
    filteredDeals = filteredDeals.filter(deal => deal.featured === true);
  }

  if (filters.limit) {
    const limitNum = parseInt(filters.limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      filteredDeals = filteredDeals.slice(0, limitNum);
    }
  }

  return filteredDeals;
}

// GET /api/deals
router.get('/', async (req, res) => {
  try {
    // Extract query parameters
    const { category, featured, limit } = req.query;
    const filters = { category, featured, limit };

    // Fetch deals from database or fallback to static data
    const deals = await fetchDealsFromDB(filters);

    // Calculate additional metrics
    const totalSavings = deals.reduce((sum, deal) => {
      const savings = (deal.originalPrice || deal.original_price || 0) - (deal.salePrice || deal.sale_price || 0);
      return sum + Math.max(0, savings);
    }, 0);

    const avgRating = deals.length > 0
      ? (deals.reduce((sum, deal) => sum + (deal.rating || 0), 0) / deals.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: deals,
      meta: {
        total: deals.length,
        totalSavings: totalSavings,
        averageRating: parseFloat(avgRating),
        filters: filters,
        timestamp: new Date().toISOString(),
        source: db.isConfigured() && db.connected ? 'database' : 'static'
      }
    });

  } catch (error) {
    console.error('API Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch deals',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;