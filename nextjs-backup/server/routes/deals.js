/**
 * Professional Deals API - Unified Backend
 * Replaces both Next.js API and static Express routes
 * Connects to real PostgreSQL database
 */

const express = require('express');
const router = express.Router();
const db = require('../auth/utils/database');
const { query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authGuard, optionalAuth } = require('../auth/middleware/auth');

const deriveDiscount = (row) => {
  if (row.discount !== null && row.discount !== undefined) return row.discount;
  if (row.original_price && row.sale_price) {
    const original = parseFloat(row.original_price);
    const sale = parseFloat(row.sale_price);
    if (original > 0) return Math.round(((original - sale) / original) * 100);
  }
  return 0;
};

// Error tracking integration
let errorTracker;
try {
  errorTracker = require('../../monitoring/error-tracker.cjs');
} catch (err) {
  console.log('📊 Error tracker not available in production mode');
}

// Simple in-memory cache for deals API
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();

  const startTime = Date.now();
  const userKey = req.user && req.user.id ? `user:${req.user.id}` : 'public';
  const key = `${userKey}|${req.originalUrl}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const responseTime = Date.now() - startTime;
    res.set('X-Cache', 'HIT');

    // Track cache hit
    if (errorTracker) {
      errorTracker.trackApiCall(responseTime, true);
    }

    return res.json(cached.data);
  }

  res.set('X-Cache', 'MISS');
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    cache.set(key, { data, timestamp: Date.now() });

    // Track cache miss
    if (errorTracker) {
      errorTracker.trackApiCall(responseTime, false);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Rate limiting for deals API
const dealsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Validation middleware for query parameters
const validateDealsQuery = [
  query('category').optional().isAlpha().withMessage('Category must contain only letters'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'rating', 'newest']).withMessage('Invalid sort option'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Max price must be positive')
];

/**
 * @route   GET /api/deals
 * @desc    Get deals with advanced filtering and pagination
 * @access  Public (personalized if authenticated)
 * @cache   30 minutes
 */
router.get('/', dealsRateLimit, optionalAuth, cacheMiddleware, validateDealsQuery, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const {
      category,
      featured,
      limit = 20,
      offset = 0,
      sort = 'newest',
      min_price,
      max_price,
      search
    } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        id, title, description, image_url as image, original_price, sale_price,
        discount_percentage as discount, rating, category, featured, store, affiliate_url,
        tags, stock_count, expires_at, created_at, updated_at,
        (original_price - sale_price) as savings_amount
      FROM deals
      WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      queryText += ` AND LOWER(category) = $${paramIndex}`;
      queryParams.push(category.toLowerCase());
      paramIndex++;
    }

    if (featured === 'true') {
      queryText += ` AND featured = true`;
    }

    if (min_price) {
      queryText += ` AND sale_price >= $${paramIndex}`;
      queryParams.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      queryText += ` AND sale_price <= $${paramIndex}`;
      queryParams.push(parseFloat(max_price));
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`;
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Add sorting
    switch (sort) {
      case 'price_asc':
        queryText += ` ORDER BY sale_price ASC`;
        break;
      case 'price_desc':
        queryText += ` ORDER BY sale_price DESC`;
        break;
      case 'rating':
        queryText += ` ORDER BY rating DESC, created_at DESC`;
        break;
      case 'newest':
      default:
        queryText += ` ORDER BY created_at DESC`;
        break;
    }

    // Add pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute query
    const result = await db.query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM deals WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())`;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND LOWER(category) = $${countParamIndex}`;
      countParams.push(category.toLowerCase());
      countParamIndex++;
    }

    if (featured === 'true') {
      countQuery += ` AND featured = true`;
    }

    if (min_price) {
      countQuery += ` AND sale_price >= $${countParamIndex}`;
      countParams.push(parseFloat(min_price));
      countParamIndex++;
    }

    if (max_price) {
      countQuery += ` AND sale_price <= $${countParamIndex}`;
      countParams.push(parseFloat(max_price));
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (LOWER(title) LIKE $${countParamIndex} OR LOWER(description) LIKE $${countParamIndex})`;
      countParams.push(`%${search.toLowerCase()}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Transform results
    const deals = result.rows.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      image: deal.image,
      originalPrice: parseFloat(deal.original_price),
      salePrice: parseFloat(deal.sale_price),
      discount: parseFloat(deriveDiscount(deal)),
      savings: parseFloat(deal.savings_amount || 0),
      rating: parseFloat(deal.rating || 0),
      category: deal.category,
      featured: deal.featured,
      store: deal.store,
      affiliateUrl: deal.affiliate_url,
      tags: deal.tags ? deal.tags.split(',') : [],
      stockCount: deal.stock_count,
      expiresAt: deal.expires_at,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    }));

    // Calculate metrics
    const totalSavings = deals.reduce((sum, deal) => sum + deal.savings, 0);
    const avgRating = deals.length > 0
      ? (deals.reduce((sum, deal) => sum + deal.rating, 0) / deals.length).toFixed(1)
      : 0;

    // If user is authenticated, add personalized data
    let userMetadata = {};
    if (req.user) {
      try {
        // Get user's favorite deals
        const favoriteResult = await db.query(
          'SELECT deal_id FROM user_favorites WHERE user_id = $1 AND deal_id = ANY($2)',
          [req.user.id, deals.map(d => d.id)]
        );
        const favoriteDealIds = favoriteResult.rows.map(row => row.deal_id);

        // Add favorite status to deals
        deals.forEach(deal => {
          deal.isFavorite = favoriteDealIds.includes(deal.id);
        });

        userMetadata = {
          isAuthenticated: true,
          userPreferences: req.user.preferences || {},
          favoriteCount: favoriteDealIds.length
        };
      } catch (error) {
        console.warn('Error fetching user personalization:', error);
      }
    }

    // Set cache headers for performance
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');

    res.json({
      success: true,
      data: deals,
      pagination: {
        total,
        count: deals.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit),
        hasNext: (parseInt(offset) + parseInt(limit)) < total,
        hasPrev: parseInt(offset) > 0
      },
      meta: {
        totalSavings: Math.round(totalSavings * 100) / 100,
        averageRating: parseFloat(avgRating),
        filters: {
          category,
          featured: featured === 'true',
          sort,
          search,
          priceRange: {
            min: min_price ? parseFloat(min_price) : null,
            max: max_price ? parseFloat(max_price) : null
          }
        },
        user: userMetadata,
        timestamp: new Date().toISOString(),
        source: 'postgresql-database'
      }
    });

  } catch (error) {
    console.error('Database error in deals route:', error);

    // Return proper 500 error instead of fallback
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message, // Return the actual error message
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/deals/:id
 * @desc    Get single deal by ID
 * @access  Public
 */
router.get('/:id', dealsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID',
        message: 'Deal ID must be a valid number'
      });
    }

    const result = await db.query(`
      SELECT
        id, title, description, image_url as image, original_price, sale_price,
        discount_percentage, rating, category, featured, store, affiliate_url,
        tags, stock_count, expires_at, created_at, updated_at,
        (original_price - sale_price) as savings_amount
      FROM deals
      WHERE id = $1 AND active = true
    `, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    const deal = result.rows[0];

    res.json({
      success: true,
      data: {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        image: deal.image,
        originalPrice: parseFloat(deal.original_price),
        salePrice: parseFloat(deal.sale_price),
        discount: parseFloat(deriveDiscount(deal)),
        savings: parseFloat(deal.savings_amount || 0),
        rating: parseFloat(deal.rating || 0),
        category: deal.category,
        featured: deal.featured,
        store: deal.store,
        affiliateUrl: deal.affiliate_url,
        tags: deal.tags ? deal.tags.split(',') : [],
        stockCount: deal.stock_count,
        expiresAt: deal.expires_at,
        createdAt: deal.created_at,
        updatedAt: deal.updated_at
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'postgresql-database'
      }
    });

  } catch (error) {
    console.error('Database error in single deal route:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch deal details',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/deals/:id/favorite
 * @desc    Add deal to user's favorites
 * @access  Private
 */
router.post('/:id/favorite', dealsRateLimit, authGuard(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID',
        message: 'Deal ID must be a valid number'
      });
    }

    // Check if deal exists
    const dealResult = await db.query('SELECT id FROM deals WHERE id = $1 AND active = true', [parseInt(id)]);
    if (dealResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found',
        message: 'The specified deal does not exist or is no longer active'
      });
    }

    // Check if already favorited
    const existingFavorite = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND deal_id = $2',
      [userId, parseInt(id)]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Already favorited',
        message: 'This deal is already in your favorites'
      });
    }

    // Add to favorites
    await db.query(
      'INSERT INTO user_favorites (user_id, deal_id, created_at) VALUES ($1, $2, NOW())',
      [userId, parseInt(id)]
    );

    res.json({
      success: true,
      message: 'Deal added to favorites',
      data: {
        dealId: parseInt(id),
        favorited: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error adding deal to favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add deal to favorites'
    });
  }
});

/**
 * @route   DELETE /api/deals/:id/favorite
 * @desc    Remove deal from user's favorites
 * @access  Private
 */
router.delete('/:id/favorite', dealsRateLimit, authGuard(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID',
        message: 'Deal ID must be a valid number'
      });
    }

    // Remove from favorites
    const result = await db.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND deal_id = $2',
      [userId, parseInt(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found',
        message: 'This deal is not in your favorites'
      });
    }

    res.json({
      success: true,
      message: 'Deal removed from favorites',
      data: {
        dealId: parseInt(id),
        favorited: false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error removing deal from favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to remove deal from favorites'
    });
  }
});

/**
 * @route   GET /api/deals/favorites
 * @desc    Get user's favorite deals
 * @access  Private
 */
router.get('/favorites', dealsRateLimit, authGuard(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get user's favorite deals with deal details
    const result = await db.query(`
      SELECT
        d.id, d.title, d.description, d.image_url as image, d.original_price, d.sale_price,
        d.discount_percentage, d.rating, d.category, d.featured, d.store, d.affiliate_url,
        d.tags, d.stock_count, d.expires_at, d.created_at, d.updated_at,
        uf.created_at as favorited_at,
        (d.original_price - d.sale_price) as savings_amount
      FROM user_favorites uf
      JOIN deals d ON uf.deal_id = d.id
      WHERE uf.user_id = $1 AND d.active = true
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM user_favorites uf JOIN deals d ON uf.deal_id = d.id WHERE uf.user_id = $1 AND d.active = true',
      [userId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Transform results
    const favorites = result.rows.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      image: deal.image,
      originalPrice: parseFloat(deal.original_price),
      salePrice: parseFloat(deal.sale_price),
      discount: parseFloat(deriveDiscount(deal)),
      savings: parseFloat(deal.savings_amount || 0),
      rating: parseFloat(deal.rating || 0),
      category: deal.category,
      featured: deal.featured,
      store: deal.store,
      affiliateUrl: deal.affiliate_url,
      tags: deal.tags ? deal.tags.split(',') : [],
      stockCount: deal.stock_count,
      expiresAt: deal.expires_at,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
      favoritedAt: deal.favorited_at,
      isFavorite: true
    }));

    res.json({
      success: true,
      data: favorites,
      pagination: {
        total,
        count: favorites.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit),
        hasNext: (parseInt(offset) + parseInt(limit)) < total,
        hasPrev: parseInt(offset) > 0
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'user-favorites'
      }
    });

  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch favorite deals'
    });
  }
});

module.exports = router;
