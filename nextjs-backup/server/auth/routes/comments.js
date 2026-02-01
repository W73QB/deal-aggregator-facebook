/**
 * Comments Routes
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const commentsController = require('../controllers/comments');
const { validate, sanitizeHtml } = require('../middleware/validation');
const { authGuard } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');
const { withCache } = require('../../cache/cache-middleware');
const staticAssetsOptimizer = require('../../cache/http-static');

// Apply common middleware
router.use(express.json({ limit: '10mb' }));
router.use(sanitizeHtml);

// Public routes (no auth required)
// GET /comments/deal/:dealId - Get comments for a specific deal with HTTP caching
router.get('/deal/:dealId',
  rateLimit.generalAPI,
  staticAssetsOptimizer.createApiCacheMiddleware({
    maxAge: process.env.CACHE_COMMENTS_TTL_S + 's' || '120s',
    staleWhileRevalidate: '60s',
    varyBy: ['Accept', 'Accept-Encoding']
  }),
  withCache(parseInt(process.env.CACHE_COMMENTS_TTL_S || '120')),
  commentsController.getCommentsByDeal
);

// GET /comments/review/:reviewId - Get comments for a specific review
router.get('/review/:reviewId',
  rateLimit.generalAPI,
  withCache(parseInt(process.env.CACHE_COMMENTS_TTL_S || '120')),
  commentsController.getCommentsByReview
);

// GET /comments/thread/:id - Get comment thread (comment with replies)
router.get('/thread/:id',
  rateLimit.generalAPI,
  withCache(parseInt(process.env.CACHE_COMMENTS_TTL_S || '120')),
  commentsController.getCommentThread
);

// Protected routes (require authentication)
router.use(authGuard());

// POST /comments - Create a new comment
router.post('/',
  rateLimit.ugcContent,
  validate('createComment'),
  commentsController.createComment
);

// PUT /comments/:id - Update user's own comment
router.put('/:id',
  rateLimit.generalAPI,
  validate('updateComment'),
  commentsController.updateComment
);

// DELETE /comments/:id - Delete user's own comment (soft delete)
router.delete('/:id',
  rateLimit.generalAPI,
  commentsController.deleteComment
);

// POST /comments/:id/vote - Vote on comment helpfulness  
router.post('/:id/vote',
  rateLimit.ugcVoting,
  validate('voteOnComment'),
  commentsController.voteOnComment
);

// GET /comments/my-comments - Get user's own comments
router.get('/my-comments',
  rateLimit.generalAPI,
  commentsController.getMyComments
);

module.exports = router;