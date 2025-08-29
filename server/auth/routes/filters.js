/**
 * Saved Filters Routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const filtersController = require('../controllers/filters');

// Import middleware
const { validate, sanitizeHtml } = require('../middleware/validation');
const { authGuard } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');

// All routes require authentication
router.use(authGuard());

// Apply common middleware
router.use(express.json({ limit: '10mb' }));
router.use(sanitizeHtml);
router.use(rateLimit.generalAPI);

// Filter CRUD routes
router.post('/',
  validate('createFilter'),
  filtersController.createFilter
);

router.get('/',
  filtersController.getFilters
);

router.get('/:id',
  filtersController.getFilter
);

router.put('/:id',
  validate('updateFilter'),
  filtersController.updateFilter
);

router.delete('/:id',
  filtersController.deleteFilter
);

// Filter-specific alerts
router.get('/:id/alerts',
  filtersController.getFilterAlerts
);

module.exports = router;