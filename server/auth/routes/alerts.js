/**
 * Alerts Routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const alertsController = require('../controllers/alerts');

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

// Alert CRUD routes
router.post('/',
  validate('createAlert'),
  alertsController.createAlert
);

router.get('/',
  alertsController.getAlerts
);

router.get('/:id',
  alertsController.getAlert
);

router.put('/:id',
  validate('updateAlert'),
  alertsController.updateAlert
);

router.delete('/:id',
  alertsController.deleteAlert
);

// Alert delivery history
router.get('/:id/deliveries',
  alertsController.getAlertDeliveries
);

module.exports = router;