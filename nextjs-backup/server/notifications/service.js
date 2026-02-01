/**
 * M3.6 Notifications Service
 * Core notification delivery system with multi-channel support
 */

const { Pool } = require('pg');
const crypto = require('crypto');
const { logger } = require('../monitoring/logger');
// Removed unused businessMetrics import
const promClient = require('prom-client');

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ==============================================
// PROMETHEUS METRICS
// ==============================================

const notificationsTotal = new promClient.Counter({
  name: 'dealradarus_notifications_total',
  help: 'Total number of notifications by channel and status',
  labelNames: ['channel', 'status', 'template']
});

const notificationsLatency = new promClient.Histogram({
  name: 'dealradarus_notifications_delivery_latency_ms',
  help: 'Notification delivery latency in milliseconds',
  labelNames: ['channel', 'template'],
  buckets: [100, 500, 1000, 2000, 5000, 10000, 30000]
});

const notificationsRetryTotal = new promClient.Counter({
  name: 'dealradarus_notifications_retry_total',
  help: 'Total number of notification delivery retries',
  labelNames: ['channel', 'template', 'attempt']
});

const notificationsDedupHitTotal = new promClient.Counter({
  name: 'dealradarus_notifications_dedup_hit_total',
  help: 'Total number of notifications deduplicated',
  labelNames: ['channel', 'template']
});

// ==============================================
// CORE NOTIFICATION SERVICE
// ==============================================

class NotificationService {
  constructor() {
    this.emailService = null;
    this.webhookService = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize email service
      if (process.env.NOTIFY_EMAIL_ENABLED === 'true') {
        const { EmailService } = require('./email');
        this.emailService = new EmailService();
        await this.emailService.initialize();
      }

      // Initialize webhook service
      if (process.env.NOTIFY_WEBHOOK_ENABLED === 'true') {
        const { WebhookService } = require('./webhook');
        this.webhookService = new WebhookService();
      }

      this.isInitialized = true;
      logger.info('Notification service initialized', {
        email: !!this.emailService,
        webhook: !!this.webhookService
      });

    } catch (error) {
      logger.error('Failed to initialize notification service', { error: error.message });
      throw error;
    }
  }

  /**
   * Enqueue alert for delivery
   */
  async enqueueAlert({ userId, filterId = null, payload = {}, schedule = null, type = 'immediate', priority = 0 }) {
    // Removed unused startTime variable
    
    try {
      // Generate keys
      const dedupKey = this.generateDedupKey(payload);
      const idempotencyKey = this.generateIdempotencyKey();
      const scheduledFor = schedule || new Date();

      // Check for duplicates within dedup window
      if (dedupKey && await this.checkDuplication(dedupKey, userId)) {
        notificationsDedupHitTotal.inc({ channel: 'queue', template: type });
        logger.info('Alert deduplicated', { userId, dedupKey, type });
        return { status: 'deduplicated', dedupKey };
      }

      // Insert into alert queue
      const query = `
        INSERT INTO alert_queue (
          user_id, filter_id, type, payload_json, scheduled_for, 
          priority, dedup_key, idempotency_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at
      `;

      const result = await pool.query(query, [
        userId, filterId, type, JSON.stringify(payload), 
        scheduledFor, priority, dedupKey, idempotencyKey
      ]);

      const alertId = result.rows[0].id;
      
      logger.info('Alert enqueued', {
        alertId,
        userId,
        type,
        scheduledFor: scheduledFor.toISOString(),
        priority,
        dedupKey
      });

      return {
        status: 'enqueued',
        alertId,
        scheduledFor,
        dedupKey,
        idempotencyKey
      };

    } catch (error) {
      logger.error('Failed to enqueue alert', { 
        userId, type, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Deliver notification to specified channel
   */
  async deliverNotification(job, channel) {
    const startTime = Date.now();
    let notificationId = null;

    try {
      const { user_id: userId, payload_json: payload, type: template } = job;
      
      // Check user preferences
      const userPrefs = await this.resolveUserPrefs(userId);
      if (!this.shouldDeliver(userPrefs, channel, template)) {
        logger.info('Notification blocked by user preferences', { 
          userId, channel, template 
        });
        return { status: 'blocked', reason: 'user_preferences' };
      }

      // Check quiet hours
      if (await this.respectQuietHours(userId, new Date())) {
        logger.info('Notification delayed due to quiet hours', { 
          userId, channel, template 
        });
        return { status: 'delayed', reason: 'quiet_hours' };
      }

      // Check rate limits
      if (await this.checkRateLimit(userId, channel)) {
        logger.info('Notification rate limited', { 
          userId, channel, template 
        });
        return { status: 'rate_limited', reason: 'hourly_limit' };
      }

      // Generate idempotency key
      const idempotencyKey = this.generateIdempotencyKey();
      const dedupKey = this.generateDedupKey(payload);

      // Create notification record
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, channel, template, payload_json, 
          dedup_key, idempotency_key, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING id
      `;

      const notificationResult = await pool.query(notificationQuery, [
        userId, channel, template, JSON.stringify(payload), 
        dedupKey, idempotencyKey
      ]);

      notificationId = notificationResult.rows[0].id;

      // Deliver based on channel
      let deliveryResult;
      switch (channel) {
        case 'email':
          if (!this.emailService) throw new Error('Email service not initialized');
          deliveryResult = await this.emailService.send(userId, template, payload);
          break;
        
        case 'webhook':
          if (!this.webhookService) throw new Error('Webhook service not initialized');
          deliveryResult = await this.webhookService.send(userId, template, payload);
          break;
        
        case 'in_app':
          deliveryResult = { status: 'sent', messageId: notificationId };
          break;
        
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Update notification status
      await this.recordStatus(notificationId, 'sent', {
        messageId: deliveryResult.messageId,
        deliveredAt: new Date().toISOString()
      });

      // Record metrics
      const latency = Date.now() - startTime;
      notificationsTotal.inc({ channel, status: 'sent', template });
      notificationsLatency.observe({ channel, template }, latency);

      logger.info('Notification delivered successfully', {
        notificationId,
        userId,
        channel,
        template,
        latency,
        messageId: deliveryResult.messageId
      });

      return {
        status: 'sent',
        notificationId,
        messageId: deliveryResult.messageId,
        latency
      };

    } catch (error) {
      // Record failure
      if (notificationId) {
        await this.recordStatus(notificationId, 'failed', {
          error: error.message,
          failedAt: new Date().toISOString()
        });
      }

      // Record metrics
      const latency = Date.now() - startTime;
      notificationsTotal.inc({ channel, status: 'failed', template: job.type });
      notificationsLatency.observe({ channel, template: job.type }, latency);

      logger.error('Notification delivery failed', {
        notificationId,
        userId: job.user_id,
        channel,
        template: job.type,
        error: error.message,
        latency
      });

      throw error;
    }
  }

  /**
   * Resolve user notification preferences
   */
  async resolveUserPrefs(userId) {
    try {
      const query = `
        SELECT email_enabled, webhook_enabled, digest_frequency, 
               quiet_hours_start, quiet_hours_end, timezone
        FROM notification_preferences 
        WHERE user_id = $1
      `;

      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // Create default preferences
        const defaultPrefs = {
          email_enabled: true,
          webhook_enabled: false,
          digest_frequency: 'immediate',
          quiet_hours_start: null,
          quiet_hours_end: null,
          timezone: 'UTC'
        };

        await this.createDefaultPrefs(userId, defaultPrefs);
        return defaultPrefs;
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Failed to resolve user preferences', { 
        userId, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Check if delivery should respect quiet hours
   */
  async respectQuietHours(userId, when) {
    if (process.env.QUIET_HOURS_LOCAL !== 'true') return false;

    try {
      const prefs = await this.resolveUserPrefs(userId);
      if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false;

      // Convert to user's timezone
      const userTime = new Date(when.toLocaleString('en-US', { 
        timeZone: prefs.timezone || 'UTC' 
      }));

      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      // Parse quiet hours
      const [startHour, startMin] = prefs.quiet_hours_start.split(':').map(Number);
      const [endHour, endMin] = prefs.quiet_hours_end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Handle overnight quiet hours (e.g., 22:00 to 07:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      } else {
        return currentTime >= startTime && currentTime <= endTime;
      }

    } catch (error) {
      logger.error('Error checking quiet hours', { 
        userId, error: error.message 
      });
      return false;
    }
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(userId, channel) {
    const maxPerHour = parseInt(process.env.ALERT_DELIVERY_MAX_PER_HOUR || '200');
    
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE user_id = $1 
        AND channel = $2 
        AND created_at > NOW() - INTERVAL '1 hour'
        AND status = 'sent'
      `;

      const result = await pool.query(query, [userId, channel]);
      const currentCount = parseInt(result.rows[0].count);
      
      return currentCount >= maxPerHour;

    } catch (error) {
      logger.error('Error checking rate limit', { 
        userId, channel, error: error.message 
      });
      return false; // Allow delivery on error
    }
  }

  /**
   * Generate deduplication key
   */
  generateDedupKey(payload) {
    // Create hash from relevant payload fields
    const relevantData = {
      type: payload.type,
      deals: payload.deals?.map(d => ({ id: d.id, price: d.price })),
      filterId: payload.filterId
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(relevantData))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey() {
    return crypto.randomUUID();
  }

  /**
   * Check for duplicate alerts
   */
  async checkDuplication(dedupKey, userId) {
    const windowMinutes = parseInt(process.env.ALERT_DEDUP_WINDOW_MIN || '60');
    
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE dedup_key = $1 
        AND user_id = $2
        AND created_at > NOW() - INTERVAL '${windowMinutes} minutes'
      `;

      const result = await pool.query(query, [dedupKey, userId]);
      return parseInt(result.rows[0].count) > 0;

    } catch (error) {
      logger.error('Error checking duplication', { 
        dedupKey, userId, error: error.message 
      });
      return false;
    }
  }

  /**
   * Record notification status
   */
  async recordStatus(notificationId, status, metadata = {}) {
    try {
      const updateFields = ['status = $2', 'updated_at = NOW()'];
      const queryParams = [notificationId, status];
      let paramIndex = 3;

      if (status === 'sent' && metadata.deliveredAt) {
        updateFields.push(`sent_at = $${paramIndex++}`);
        queryParams.push(metadata.deliveredAt);
      }

      if (status === 'failed') {
        updateFields.push(`last_error = $${paramIndex++}`, `attempts = attempts + 1`);
        queryParams.push(metadata.error);
      }

      const query = `
        UPDATE notifications 
        SET ${updateFields.join(', ')}
        WHERE id = $1
      `;

      await pool.query(query, queryParams);

      logger.debug('Notification status updated', {
        notificationId,
        status,
        metadata
      });

    } catch (error) {
      logger.error('Failed to record notification status', {
        notificationId,
        status,
        error: error.message
      });
    }
  }

  /**
   * Helper: Should deliver notification
   */
  shouldDeliver(userPrefs, channel, template) {
    if (channel === 'email' && !userPrefs.email_enabled) return false;
    if (channel === 'webhook' && !userPrefs.webhook_enabled) return false;
    if (template === 'digest' && userPrefs.digest_frequency === 'never') return false;
    
    return true;
  }

  /**
   * Helper: Create default preferences
   */
  async createDefaultPrefs(userId, prefs) {
    const query = `
      INSERT INTO notification_preferences (
        user_id, email_enabled, webhook_enabled, digest_frequency, timezone
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO NOTHING
    `;

    await pool.query(query, [
      userId,
      prefs.email_enabled,
      prefs.webhook_enabled,
      prefs.digest_frequency,
      prefs.timezone
    ]);
  }

  /**
   * Get notification history for user
   */
  async getHistory(userId, limit = 50, status = null, offset = 0) {
    try {
      let query = `
        SELECT id, channel, template, payload_json, status, attempts, 
               created_at, sent_at, opened_at, clicked_at
        FROM notifications 
        WHERE user_id = $1
      `;
      
      const queryParams = [userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex++}`;
        queryParams.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get notification history', { 
        userId, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Track notification open
   */
  async trackOpen(notificationId) {
    try {
      const query = `
        UPDATE notifications 
        SET opened_at = NOW()
        WHERE id = $1 AND opened_at IS NULL
        RETURNING user_id, channel, template
      `;

      const result = await pool.query(query, [notificationId]);
      
      if (result.rows.length > 0) {
        const { channel, template } = result.rows[0];
        notificationsTotal.inc({ channel, status: 'opened', template });
        
        logger.info('Notification opened', { notificationId, channel, template });
      }

      return result.rows.length > 0;

    } catch (error) {
      logger.error('Failed to track notification open', { 
        notificationId, error: error.message 
      });
      return false;
    }
  }

  /**
   * Track notification click
   */
  async trackClick(notificationId) {
    try {
      const query = `
        UPDATE notifications 
        SET clicked_at = NOW()
        WHERE id = $1 AND clicked_at IS NULL
        RETURNING user_id, channel, template, payload_json
      `;

      const result = await pool.query(query, [notificationId]);
      
      if (result.rows.length > 0) {
        const { channel, template } = result.rows[0];
        notificationsTotal.inc({ channel, status: 'clicked', template });
        
        logger.info('Notification clicked', { notificationId, channel, template });
        return result.rows[0];
      }

      return null;

    } catch (error) {
      logger.error('Failed to track notification click', { 
        notificationId, error: error.message 
      });
      return null;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();

module.exports = {
  NotificationService,
  notificationService,
  // Export metrics for monitoring
  notificationsTotal,
  notificationsLatency,
  notificationsRetryTotal,
  notificationsDedupHitTotal
};
