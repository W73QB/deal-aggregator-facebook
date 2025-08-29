#!/usr/bin/env node

/**
 * M3.6 Alerts Dispatcher
 * Processes queued alerts and delivers notifications via multiple channels
 */

const { Pool } = require('pg');
const crypto = require('crypto');
const cron = require('node-cron');
const { logger } = require('../monitoring/logger');
const { notificationService } = require('../notifications/service');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class AlertsDispatcher {
  constructor() {
    this.isRunning = false;
    this.lockToken = crypto.randomUUID();
    this.maxRetries = parseInt(process.env.ALERT_RETRY_MAX || '5');
    this.baseBackoffMs = parseInt(process.env.ALERT_RETRY_BACKOFF_MS || '30000');
    this.batchSize = 50; // Process alerts in batches
  }

  async initialize() {
    try {
      // Initialize notification service
      if (!notificationService.isInitialized) {
        await notificationService.initialize();
      }

      logger.info('Alerts dispatcher initialized', {
        maxRetries: this.maxRetries,
        baseBackoffMs: this.baseBackoffMs,
        batchSize: this.batchSize,
        lockToken: this.lockToken
      });

    } catch (error) {
      logger.error('Failed to initialize alerts dispatcher', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Main dispatch process - runs once
   */
  async dispatch() {
    if (this.isRunning) {
      logger.warn('Alerts dispatcher already running, skipping this cycle');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    let delayedCount = 0;

    try {
      logger.info('Starting alerts dispatch cycle', { 
        lockToken: this.lockToken 
      });

      // Get pending alerts ready for processing
      const alerts = await this.getPendingAlerts();
      
      if (alerts.length === 0) {
        logger.debug('No pending alerts to process');
        return;
      }

      logger.info('Processing alerts batch', { 
        batchSize: alerts.length,
        lockToken: this.lockToken 
      });

      // Process each alert
      for (const alert of alerts) {
        try {
          const result = await this.processAlert(alert);
          processedCount++;

          switch (result.status) {
            case 'sent':
              successCount++;
              break;
            case 'failed':
              failedCount++;
              break;
            case 'delayed':
              delayedCount++;
              break;
          }

        } catch (error) {
          logger.error('Failed to process alert', {
            alertId: alert.id,
            error: error.message
          });
          failedCount++;
          processedCount++;
        }
      }

      const duration = Date.now() - startTime;

      logger.info('Alerts dispatch cycle completed', {
        processedCount,
        successCount,
        failedCount,
        delayedCount,
        duration,
        lockToken: this.lockToken
      });

    } catch (error) {
      logger.error('Alerts dispatch cycle failed', { 
        error: error.message,
        lockToken: this.lockToken 
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get pending alerts ready for processing
   */
  async getPendingAlerts() {
    try {
      // Lock and fetch pending alerts
      const lockQuery = `
        UPDATE alert_queue 
        SET status = 'processing', 
            lock_token = $1,
            updated_at = NOW()
        WHERE id IN (
          SELECT id FROM alert_queue
          WHERE status = 'pending' 
          AND scheduled_for <= NOW()
          ORDER BY priority DESC, created_at ASC
          LIMIT $2
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `;

      const result = await pool.query(lockQuery, [this.lockToken, this.batchSize]);
      
      logger.debug('Locked alerts for processing', { 
        count: result.rows.length,
        lockToken: this.lockToken 
      });

      return result.rows;

    } catch (error) {
      logger.error('Failed to get pending alerts', { error: error.message });
      return [];
    }
  }

  /**
   * Process individual alert
   */
  async processAlert(alert) {
    const alertId = alert.id;
    const userId = alert.user_id;
    const payload = alert.payload_json;

    try {
      logger.debug('Processing alert', {
        alertId,
        userId,
        type: alert.type,
        attempt: alert.attempts + 1
      });

      // Check quiet hours first
      if (await this.shouldRespectQuietHours(userId)) {
        await this.delayForQuietHours(alert);
        return { status: 'delayed', reason: 'quiet_hours' };
      }

      // Determine channels based on user preferences and alert type
      const channels = await this.determineChannels(userId, alert.type);
      
      if (channels.length === 0) {
        await this.completeAlert(alertId, 'cancelled', 'No enabled channels');
        return { status: 'cancelled', reason: 'no_channels' };
      }

      // Deliver to each channel
      const deliveryResults = [];
      let hasSuccess = false;

      for (const channel of channels) {
        try {
          const result = await notificationService.deliverNotification(alert, channel);
          deliveryResults.push({ channel, ...result });
          
          if (result.status === 'sent') {
            hasSuccess = true;
          }

        } catch (error) {
          logger.warn('Channel delivery failed', {
            alertId,
            channel,
            error: error.message
          });
          deliveryResults.push({ 
            channel, 
            status: 'failed', 
            error: error.message 
          });
        }
      }

      // Update alert status based on delivery results
      if (hasSuccess) {
        await this.completeAlert(alertId, 'completed', null, deliveryResults);
        return { status: 'sent', channels: deliveryResults };
      } else {
        // All channels failed - retry if under limit
        if (alert.attempts < this.maxRetries) {
          await this.retryAlert(alert);
          return { status: 'retry', attempt: alert.attempts + 1 };
        } else {
          await this.completeAlert(alertId, 'failed', 'Max retries exceeded', deliveryResults);
          return { status: 'failed', reason: 'max_retries' };
        }
      }

    } catch (error) {
      logger.error('Alert processing error', {
        alertId,
        userId,
        error: error.message
      });

      // Retry or fail based on attempts
      if (alert.attempts < this.maxRetries) {
        await this.retryAlert(alert);
        return { status: 'retry', attempt: alert.attempts + 1 };
      } else {
        await this.completeAlert(alertId, 'failed', error.message);
        return { status: 'failed', reason: 'processing_error' };
      }
    }
  }

  /**
   * Check if alert should respect quiet hours
   */
  async shouldRespectQuietHours(userId) {
    if (process.env.QUIET_HOURS_LOCAL !== 'true') return false;

    try {
      return await notificationService.respectQuietHours(userId, new Date());
    } catch (error) {
      logger.error('Error checking quiet hours', { userId, error: error.message });
      return false;
    }
  }

  /**
   * Delay alert for quiet hours
   */
  async delayForQuietHours(alert) {
    try {
      // Calculate next available time (after quiet hours end)
      const userPrefs = await notificationService.resolveUserPrefs(alert.user_id);
      const now = new Date();
      const userTimezone = userPrefs.timezone || 'UTC';

      // Parse quiet hours end time
      const [endHour, endMin] = (userPrefs.quiet_hours_end || '07:00').split(':').map(Number);
      
      // Create next available time
      const nextAvailable = new Date();
      nextAvailable.setHours(endHour, endMin, 0, 0);
      
      // If end time is already passed today, schedule for tomorrow
      if (nextAvailable <= now) {
        nextAvailable.setDate(nextAvailable.getDate() + 1);
      }

      const rescheduleQuery = `
        UPDATE alert_queue 
        SET status = 'pending',
            scheduled_for = $2,
            lock_token = NULL,
            updated_at = NOW()
        WHERE id = $1
      `;

      await pool.query(rescheduleQuery, [alert.id, nextAvailable]);

      logger.info('Alert rescheduled for quiet hours', {
        alertId: alert.id,
        userId: alert.user_id,
        rescheduledFor: nextAvailable.toISOString(),
        timezone: userTimezone
      });

    } catch (error) {
      logger.error('Failed to reschedule alert for quiet hours', {
        alertId: alert.id,
        error: error.message
      });
      
      // If we can't reschedule, mark as failed
      await this.completeAlert(alert.id, 'failed', 'Failed to reschedule for quiet hours');
    }
  }

  /**
   * Determine delivery channels for alert
   */
  async determineChannels(userId, alertType) {
    try {
      const userPrefs = await notificationService.resolveUserPrefs(userId);
      const channels = [];

      // Email channel
      if (userPrefs.email_enabled && process.env.NOTIFY_EMAIL_ENABLED === 'true') {
        // Check digest preferences
        if (alertType === 'digest' && userPrefs.digest_frequency === 'never') {
          // Skip email for digest if user disabled
        } else {
          channels.push('email');
        }
      }

      // Webhook channel
      if (userPrefs.webhook_enabled && process.env.NOTIFY_WEBHOOK_ENABLED === 'true') {
        channels.push('webhook');
      }

      // In-app notifications are always enabled
      channels.push('in_app');

      logger.debug('Determined delivery channels', {
        userId,
        alertType,
        channels,
        userPrefs: {
          email_enabled: userPrefs.email_enabled,
          webhook_enabled: userPrefs.webhook_enabled,
          digest_frequency: userPrefs.digest_frequency
        }
      });

      return channels;

    } catch (error) {
      logger.error('Failed to determine channels', { userId, error: error.message });
      return ['in_app']; // Fallback to in-app only
    }
  }

  /**
   * Retry alert with backoff
   */
  async retryAlert(alert) {
    try {
      const newAttempts = alert.attempts + 1;
      const backoffMs = this.baseBackoffMs * Math.pow(2, newAttempts - 1);
      const nextTry = new Date(Date.now() + backoffMs);

      const retryQuery = `
        UPDATE alert_queue 
        SET status = 'pending',
            attempts = $2,
            scheduled_for = $3,
            lock_token = NULL,
            updated_at = NOW()
        WHERE id = $1
      `;

      await pool.query(retryQuery, [alert.id, newAttempts, nextTry]);

      logger.info('Alert scheduled for retry', {
        alertId: alert.id,
        attempt: newAttempts,
        nextTry: nextTry.toISOString(),
        backoffMs
      });

    } catch (error) {
      logger.error('Failed to schedule alert retry', {
        alertId: alert.id,
        error: error.message
      });
    }
  }

  /**
   * Complete alert processing
   */
  async completeAlert(alertId, status, errorMessage = null, deliveryResults = null) {
    try {
      const completeQuery = `
        UPDATE alert_queue 
        SET status = $2,
            updated_at = NOW(),
            lock_token = NULL
        WHERE id = $1
      `;

      await pool.query(completeQuery, [alertId, status]);

      logger.info('Alert completed', {
        alertId,
        status,
        errorMessage,
        deliveryResults
      });

    } catch (error) {
      logger.error('Failed to complete alert', {
        alertId,
        status,
        error: error.message
      });
    }
  }

  /**
   * Start cron scheduler
   */
  startScheduler() {
    // Run every 5 minutes
    const cronExpression = '*/5 * * * *';
    
    logger.info('Starting alerts dispatcher scheduler', { 
      cronExpression,
      lockToken: this.lockToken 
    });

    cron.schedule(cronExpression, async () => {
      try {
        await this.dispatch();
      } catch (error) {
        logger.error('Scheduled dispatch failed', { 
          error: error.message,
          lockToken: this.lockToken 
        });
      }
    });

    logger.info('Alerts dispatcher scheduler started');
  }

  /**
   * Cleanup stale locks (run periodically)
   */
  async cleanupStaleLocks() {
    try {
      const staleMinutes = 30; // Consider locks older than 30 minutes as stale
      
      const cleanupQuery = `
        UPDATE alert_queue 
        SET status = 'pending',
            lock_token = NULL,
            updated_at = NOW()
        WHERE status = 'processing' 
        AND updated_at < NOW() - INTERVAL '${staleMinutes} minutes'
      `;

      const result = await pool.query(cleanupQuery);
      
      if (result.rowCount > 0) {
        logger.warn('Cleaned up stale alert locks', { 
          count: result.rowCount,
          staleMinutes 
        });
      }

    } catch (error) {
      logger.error('Failed to cleanup stale locks', { error: error.message });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const statsQuery = `
        SELECT 
          status,
          priority,
          COUNT(*) as count,
          MIN(created_at) as oldest,
          MAX(created_at) as newest,
          AVG(attempts) as avg_attempts
        FROM alert_queue
        GROUP BY status, priority
        ORDER BY status, priority DESC
      `;

      const result = await pool.query(statsQuery);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get queue stats', { error: error.message });
      return [];
    }
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const dispatcher = new AlertsDispatcher();
  
  try {
    await dispatcher.initialize();

    if (args.includes('--once')) {
      // Run once and exit
      console.log('🚀 Running alerts dispatch once...');
      await dispatcher.dispatch();
      console.log('✅ Dispatch completed');
      process.exit(0);
      
    } else if (args.includes('--stats')) {
      // Show queue statistics
      console.log('📊 Alert Queue Statistics:');
      const stats = await dispatcher.getQueueStats();
      console.table(stats);
      process.exit(0);
      
    } else if (args.includes('--cleanup')) {
      // Cleanup stale locks
      console.log('🧹 Cleaning up stale locks...');
      await dispatcher.cleanupStaleLocks();
      console.log('✅ Cleanup completed');
      process.exit(0);
      
    } else {
      // Start scheduler
      dispatcher.startScheduler();
      
      // Run initial dispatch
      await dispatcher.dispatch();
      
      // Cleanup stale locks every 30 minutes
      cron.schedule('*/30 * * * *', async () => {
        await dispatcher.cleanupStaleLocks();
      });
      
      console.log('🚀 Alerts dispatcher running with scheduler');
      console.log('📋 Queue processed every 5 minutes');
      console.log('🧹 Stale locks cleaned every 30 minutes');
      console.log('⏹️  Press Ctrl+C to stop');
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down alerts dispatcher...');
        process.exit(0);
      });
    }

  } catch (error) {
    console.error('❌ Alerts dispatcher failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { AlertsDispatcher };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}