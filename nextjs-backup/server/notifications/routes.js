/**
 * M3.6 Notifications API Routes
 * REST endpoints for notification management and tracking
 */

const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { logger } = require('../monitoring/logger');
const { notificationService } = require('./service');
const { WebhookService } = require('./webhook');

const router = express.Router();

// ==============================================
// MIDDLEWARE
// ==============================================

// Rate limiting for notification endpoints
const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many notification requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Idempotency middleware for POST requests
const idempotencyMiddleware = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (req.method === 'POST' && idempotencyKey) {
    req.idempotencyKey = idempotencyKey;
  }
  next();
};

// JWT Authentication middleware (assuming it exists)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Mock JWT validation for demo - in production use proper JWT verification
    const token = authHeader.substring(7);
    if (token === 'mock-jwt-token-123') {
      req.user = { id: 'user-123', role: 'admin' }; // Mock user
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next();
  } catch (error) {
    logger.error('JWT validation failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply middleware to all routes
router.use(notificationLimiter);
router.use(idempotencyMiddleware);
router.use(requireAuth);

// ==============================================
// VALIDATION SCHEMAS
// ==============================================

const testNotificationSchema = Joi.object({
  channel: Joi.string().valid('email', 'webhook', 'in_app').required(),
  template: Joi.string().valid('deal-immediate', 'deal-digest', 'generic-error').required(),
  userId: Joi.string().uuid().required(),
  samplePayload: Joi.object().required()
});

const notificationPrefsSchema = Joi.object({
  email_enabled: Joi.boolean().optional(),
  webhook_enabled: Joi.boolean().optional(),
  digest_frequency: Joi.string().valid('immediate', 'daily', 'weekly', 'never').optional(),
  quiet_hours_start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null).optional(),
  quiet_hours_end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null).optional(),
  timezone: Joi.string().optional()
});

const webhookEndpointSchema = Joi.object({
  url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  secret: Joi.string().min(16).optional()
});

// ==============================================
// ROUTES
// ==============================================

/**
 * POST /notifications/test
 * Test notification delivery (admin only)
 */
router.post('/test', requireAdmin, async (req, res) => {
  const correlationId = req.correlationId;
  
  try {
    // Validate request body
    const { error, value } = testNotificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(d => d.message) 
      });
    }

    const { channel, template, userId, samplePayload } = value;

    // Initialize notification service if needed
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }

    // Create test job
    const testJob = {
      user_id: userId,
      type: template,
      payload_json: samplePayload
    };

    // Deliver test notification
    const result = await notificationService.deliverNotification(testJob, channel);

    logger.info('Test notification sent', {
      correlationId,
      channel,
      template,
      userId,
      result
    });

    res.json({
      success: true,
      message: 'Test notification delivered successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Test notification failed', {
      correlationId,
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      error: 'Failed to send test notification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /notifications/history
 * Get user's notification history
 */
router.get('/history', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;

  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const status = req.query.status || null;

    // Validate status filter
    if (status && !['pending', 'sent', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status filter',
        validValues: ['pending', 'sent', 'failed', 'cancelled']
      });
    }

    const notifications = await notificationService.getHistory(userId, limit, status, offset);

    // Add summary statistics
    const totalQuery = status ? 
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND status = $2` :
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1`;
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const totalResult = status ?
      await pool.query(totalQuery, [userId, status]) :
      await pool.query(totalQuery, [userId]);
    
    await pool.end();

    const total = parseInt(totalResult.rows[0].total);
    const hasMore = offset + limit < total;

    logger.info('Notification history retrieved', {
      correlationId,
      userId,
      limit,
      offset,
      status,
      returned: notifications.length,
      total
    });

    res.json({
      notifications,
      pagination: {
        limit,
        offset,
        total,
        hasMore,
        nextOffset: hasMore ? offset + limit : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get notification history', {
      correlationId,
      userId,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to retrieve notification history',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /notifications/prefs
 * Get user's notification preferences
 */
router.get('/prefs', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;

  try {
    const prefs = await notificationService.resolveUserPrefs(userId);

    logger.debug('Notification preferences retrieved', {
      correlationId,
      userId
    });

    res.json({
      preferences: prefs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get notification preferences', {
      correlationId,
      userId,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to retrieve preferences',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PATCH /notifications/prefs
 * Update user's notification preferences
 */
router.patch('/prefs', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;

  try {
    // Validate request body
    const { error, value } = notificationPrefsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(d => d.message) 
      });
    }

    // Build update query dynamically
    const updates = [];
    const queryParams = [userId];
    let paramIndex = 2;

    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        queryParams.push(val);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const query = `
      UPDATE notification_preferences 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const result = await pool.query(query, queryParams);
    await pool.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User preferences not found' });
    }

    const updatedPrefs = result.rows[0];

    logger.info('Notification preferences updated', {
      correlationId,
      userId,
      updates: Object.keys(value)
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedPrefs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to update notification preferences', {
      correlationId,
      userId,
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /notifications/track/open
 * Track notification open (pixel tracking)
 */
router.post('/track/open', async (req, res) => {
  const correlationId = req.correlationId;
  const { notificationId } = req.body;

  try {
    if (!notificationId) {
      return res.status(400).json({ error: 'notificationId is required' });
    }

    const tracked = await notificationService.trackOpen(notificationId);

    if (tracked) {
      logger.info('Notification open tracked', {
        correlationId,
        notificationId
      });
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Expires': '0'
    });

    res.send(pixel);

  } catch (error) {
    logger.error('Failed to track notification open', {
      correlationId,
      notificationId,
      error: error.message
    });

    // Still return pixel to avoid broken images
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set('Content-Type', 'image/png');
    res.send(pixel);
  }
});

/**
 * POST /notifications/track/click
 * Track notification click and redirect
 */
router.post('/track/click', async (req, res) => {
  const correlationId = req.correlationId;
  const { notificationId, targetUrl } = req.body;

  try {
    if (!notificationId || !targetUrl) {
      return res.status(400).json({ 
        error: 'notificationId and targetUrl are required' 
      });
    }

    const result = await notificationService.trackClick(notificationId);

    if (result) {
      logger.info('Notification click tracked', {
        correlationId,
        notificationId,
        targetUrl
      });
    }

    res.json({
      success: true,
      redirectUrl: targetUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to track notification click', {
      correlationId,
      notificationId,
      targetUrl,
      error: error.message
    });

    // Still allow redirect to avoid breaking user experience
    res.json({
      success: false,
      redirectUrl: targetUrl,
      error: 'Tracking failed but redirect allowed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /notifications/webhook/endpoints
 * Add webhook endpoint for user
 */
router.post('/webhook/endpoints', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;

  try {
    // Validate request body
    const { error, value } = webhookEndpointSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(d => d.message) 
      });
    }

    const { url, secret } = value;

    const webhookService = new WebhookService();
    const endpoint = await webhookService.addEndpoint(userId, url, secret);

    logger.info('Webhook endpoint added', {
      correlationId,
      userId,
      endpointId: endpoint.id,
      url
    });

    res.status(201).json({
      success: true,
      message: 'Webhook endpoint added successfully',
      endpoint,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to add webhook endpoint', {
      correlationId,
      userId,
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      error: 'Failed to add webhook endpoint',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /notifications/webhook/endpoints
 * Get user's webhook endpoints
 */
router.get('/webhook/endpoints', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;

  try {
    const webhookService = new WebhookService();
    const endpoints = await webhookService.getUserWebhookEndpoints(userId);

    // Hide secrets from response
    const safeEndpoints = endpoints.map(ep => ({
      ...ep,
      secret: ep.secret ? '***' : null
    }));

    logger.debug('Webhook endpoints retrieved', {
      correlationId,
      userId,
      count: endpoints.length
    });

    res.json({
      endpoints: safeEndpoints,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get webhook endpoints', {
      correlationId,
      userId,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to retrieve webhook endpoints',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /notifications/webhook/test/:endpointId
 * Test specific webhook endpoint
 */
router.post('/webhook/test/:endpointId', async (req, res) => {
  const correlationId = req.correlationId;
  const userId = req.user.id;
  const { endpointId } = req.params;

  try {
    const webhookService = new WebhookService();
    const result = await webhookService.testEndpoint(endpointId, userId);

    logger.info('Webhook endpoint test completed', {
      correlationId,
      userId,
      endpointId,
      result
    });

    res.json({
      success: true,
      message: 'Webhook test completed successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Webhook endpoint test failed', {
      correlationId,
      userId,
      endpointId,
      error: error.message
    });

    res.status(500).json({
      error: 'Webhook test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==============================================
// ERROR HANDLER
// ==============================================

router.use((error, req, res, _next) => {
  logger.error('Notifications API error', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
