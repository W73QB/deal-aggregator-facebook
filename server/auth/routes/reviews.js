/**
 * Reviews Routes
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const reviewsController = require('../controllers/reviews');
const { validate, sanitizeHtml } = require('../middleware/validation');
const { authGuard } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');
const { withCache } = require('../../cache/cache-middleware');
const staticAssetsOptimizer = require('../../cache/http-static');

// Apply common middleware
router.use(express.json({ limit: '10mb' }));
router.use(sanitizeHtml);

// Public routes (no auth required)
// GET /reviews/review/:id - Get single review by ID with HTTP caching
router.get('/review/:id',
  rateLimit.generalAPI,
  staticAssetsOptimizer.createApiCacheMiddleware({
    maxAge: process.env.CACHE_REVIEWS_TTL_S + 's' || '180s',
    staleWhileRevalidate: '60s',
    varyBy: ['Accept', 'Accept-Encoding']
  }),
  withCache(parseInt(process.env.CACHE_REVIEWS_TTL_S || '180')),
  reviewsController.getReviewById
);

// GET /reviews/deal/:dealId - Get reviews for a specific deal with HTTP caching
router.get('/deal/:dealId', 
  rateLimit.generalAPI,
  staticAssetsOptimizer.createApiCacheMiddleware({
    maxAge: process.env.CACHE_REVIEWS_TTL_S + 's' || '180s',
    staleWhileRevalidate: '120s',
    varyBy: ['Accept', 'Accept-Encoding', 'Authorization']
  }),
  withCache(parseInt(process.env.CACHE_REVIEWS_TTL_S || '180')),
  reviewsController.getReviewsByDeal
);

// Protected routes (require authentication)
router.use(authGuard());

// POST /reviews - Create a new review
router.post('/',
  rateLimit.ugcContent,
  validate('createReview'),
  reviewsController.createReview
);

// PUT /reviews/:id - Update user's own review
router.put('/:id',
  rateLimit.generalAPI,
  validate('updateReview'),
  reviewsController.updateReview
);

// DELETE /reviews/:id - Delete user's own review
router.delete('/:id',
  rateLimit.generalAPI,
  reviewsController.deleteReview
);

// POST /reviews/:id/vote - Vote on review helpfulness
router.post('/:id/vote',
  rateLimit.ugcVoting,
  validate('voteOnReview'),
  reviewsController.voteOnReview
);

// GET /reviews/my-reviews - Get user's own reviews
router.get('/my-reviews',
  rateLimit.generalAPI,
  reviewsController.getMyReviews
);

module.exports = router;