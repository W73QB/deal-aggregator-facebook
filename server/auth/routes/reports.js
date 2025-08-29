/**
 * Reports Routes (Content Moderation)
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const reportsController = require('../controllers/reports');
const { validate, sanitizeHtml } = require('../middleware/validation');
const { authGuard, adminOnly } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');
const { withCache } = require('../../cache/cache-middleware');

// Apply common middleware
router.use(express.json({ limit: '10mb' }));
router.use(sanitizeHtml);

// All routes require authentication
router.use(authGuard());

// POST /reports - Create a new report (abuse/spam reporting)
router.post('/',
  rateLimit.ugcReporting,
  validate('createReport'),
  reportsController.createReport
);

// GET /reports/my-reports - Get user's own reports
router.get('/my-reports',
  rateLimit.generalAPI,
  withCache(parseInt(process.env.CACHE_REPORTS_TTL_S || '120'), { varyByAuth: true }),
  reportsController.getMyReports
);

// Admin-only routes
router.use(adminOnly);

// GET /reports - Get all reports (admin only)
router.get('/',
  rateLimit.generalAPI,
  withCache(parseInt(process.env.CACHE_REPORTS_TTL_S || '120'), { varyByAuth: true }),
  reportsController.getReports
);

// GET /reports/:id - Get single report with content details (admin only)
router.get('/:id',
  rateLimit.generalAPI,
  reportsController.getReportById
);

// PUT /reports/:id - Update report status (admin only)
router.put('/:id',
  rateLimit.generalAPI,
  validate('updateReport'),
  reportsController.updateReport
);

// PUT /reports/bulk - Bulk update reports (admin only)
router.put('/bulk',
  rateLimit.generalAPI,
  validate('bulkUpdateReports'),
  reportsController.bulkUpdateReports
);

module.exports = router;