/**
 * Alerts Processing Job System
 * Processes scheduled alerts and sends email notifications
 */

const cron = require('node-cron');
const db = require('../auth/utils/database');
const emailService = require('../email/service');
const { getCoordinator } = require('../coordination/worker-coordinator');

class AlertsProcessor {
  constructor() {
    this.isRunning = false;
    this.lastProcessTime = null;
    this.coordinator = null;
    this.stats = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    };
  }

  async start() {
    console.log('🔔 Starting alerts processing system...');

    // M3.8 Phase 5: Initialize worker coordination
    try {
      this.coordinator = getCoordinator();
      await this.coordinator.initialize();
      console.log('✅ Worker coordination initialized');
    } catch (error) {
      console.log('⚠️  Worker coordination failed, running without distributed locks:', error.message);
    }

    // Process alerts every 5 minutes
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.processAlertsWithCoordination();
    });

    // Process weekly alerts on Tuesday at 9 AM
    this.weeklyCronJob = cron.schedule('0 9 * * 2', async () => {
      await this.processWeeklyAlertsWithCoordination();
    });

    // Process daily alerts at 9 AM every day
    this.dailyCronJob = cron.schedule('0 9 * * *', async () => {
      await this.processDailyAlertsWithCoordination();
    });

    console.log('✅ Alerts processor started with cron jobs');
    console.log('   • Every 5 minutes: Instant alerts');
    console.log('   • Daily at 9 AM: Daily alerts');  
    console.log('   • Tuesday 9 AM: Weekly alerts');
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
    }
    if (this.weeklyCronJob) {
      this.weeklyCronJob.destroy();
    }
    if (this.dailyCronJob) {
      this.dailyCronJob.destroy();
    }
    console.log('🛑 Alerts processor stopped');
  }

  async processAlerts() {
    if (this.isRunning) {
      console.log('⏳ Alert processing already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔄 Processing scheduled alerts...');

      // Get all alerts that should be triggered
      const alertsResult = await db.query(`
        SELECT 
          a.id, a.user_id, a.filter_id, a.frequency, a.last_triggered_at, a.next_trigger_at,
          sf.name as filter_name, sf.criteria as filter_criteria,
          u.email as user_email, u.first_name, u.last_name
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        JOIN public.users u ON a.user_id = u.id
        WHERE a.is_active = true 
          AND sf.is_active = true
          AND u.email_verified = true
          AND a.next_trigger_at <= NOW()
        ORDER BY a.next_trigger_at ASC
        LIMIT 100
      `);

      const alertsToProcess = alertsResult.rows;
      console.log(`📊 Found ${alertsToProcess.length} alerts to process`);

      for (const alert of alertsToProcess) {
        await this.processSingleAlert(alert);
      }

      const duration = Date.now() - startTime;
      this.lastProcessTime = new Date();

      console.log(`✅ Alert processing completed in ${duration}ms`);
      console.log(`📈 Stats - Processed: ${this.stats.processed}, Sent: ${this.stats.sent}, Failed: ${this.stats.failed}, Skipped: ${this.stats.skipped}`);

    } catch (error) {
      console.error('❌ Alert processing error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  async processSingleAlert(alert) {
    try {
      this.stats.processed++;

      // M3.8 Phase 2: Check for recent duplicate deliveries to prevent spam
      const isDuplicate = await this.checkRecentDelivery(alert);
      if (isDuplicate) {
        this.stats.skipped++;
        console.log(`⏸️ Skipping duplicate alert for ${alert.filter_name} (sent recently)`);
        return;
      }

      // Mock deals data (in production, this would query actual deals)
      const mockDeals = await this.findMatchingDeals(alert.filter_criteria);

      if (mockDeals.length === 0) {
        await this.recordDelivery(alert, 0, 'no_matches', 'skipped');
        this.stats.skipped++;
        console.log(`⏸️ No matching deals for alert ${alert.id} (${alert.filter_name})`);
        return;
      }

      // M3.8 Phase 2: Enhanced email sending with retry logic
      const emailResult = await this.sendAlertEmailWithRetry(alert, mockDeals);

      if (emailResult.success) {
        await this.recordDelivery(alert, mockDeals.length, `${alert.frequency}_alert`, 'sent', emailResult.eventId);
        await this.updateAlertTriggerTime(alert);
        this.stats.sent++;
        console.log(`✅ Alert sent: ${alert.frequency} alert for ${alert.filter_name} to ${alert.user_email}`);
      } else {
        await this.recordDelivery(alert, mockDeals.length, `${alert.frequency}_alert`, 'failed');
        this.stats.failed++;
        console.log(`❌ Alert failed: ${alert.filter_name} to ${alert.user_email} - ${emailResult.error}`);
      }

    } catch (error) {
      console.error(`❌ Error processing alert ${alert.id}:`, error.message);
      await this.recordDelivery(alert, 0, 'processing_error', 'failed');
      this.stats.failed++;
    }
  }

  async findMatchingDeals(criteria) {
    // Mock implementation - in production, this would query actual deals database
    // Returns mock deals based on criteria
    
    const mockDeals = [];
    const dealsCount = Math.floor(Math.random() * 10) + 1; // 1-10 deals
    
    for (let i = 0; i < dealsCount; i++) {
      mockDeals.push({
        id: `deal_${Date.now()}_${i}`,
        title: `Mock Deal ${i + 1} - ${criteria.category || 'General'}`,
        price: Math.floor(Math.random() * 1000) + 50,
        location: criteria.location || 'Local Area',
        url: `https://facebook.com/marketplace/item/${Date.now()}${i}`,
        image_url: 'https://via.placeholder.com/300x200',
        posted_at: new Date(Date.now() - Math.random() * 86400000), // Within last 24 hours
        description: `Mock description for ${criteria.keywords?.[0] || 'item'}`
      });
    }

    return mockDeals;
  }

  async sendAlertEmail(alert, deals) {
    try {
      const user = {
        id: alert.user_id,
        email: alert.user_email,
        first_name: alert.first_name,
        last_name: alert.last_name
      };

      const filter = {
        name: alert.filter_name,
        criteria: alert.filter_criteria
      };

      // Use appropriate email template based on frequency
      let emailResult;
      if (alert.frequency === 'instant') {
        emailResult = await emailService.sendInstantAlert(user, filter, deals);
      } else if (alert.frequency === 'daily') {
        emailResult = await emailService.sendDailyAlert(user, filter, deals);
      } else if (alert.frequency === 'weekly') {
        emailResult = await emailService.sendWeeklyAlert(user, filter, deals);
      } else {
        throw new Error(`Unknown alert frequency: ${alert.frequency}`);
      }

      return emailResult;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async recordDelivery(alert, dealsCount, triggerReason, status, emailEventId = null) {
    try {
      // M3.8 Phase 2: Add idempotency key to prevent duplicate deliveries
      const idempotencyKey = `${alert.id}_${triggerReason}_${Math.floor(Date.now() / 1000)}`;
      
      await db.query(`
        INSERT INTO public.alert_deliveries 
        (alert_id, user_id, email_event_id, deals_count, trigger_reason, status, idempotency_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (idempotency_key) DO UPDATE SET
          updated_at = NOW(),
          status = EXCLUDED.status
      `, [alert.id, alert.user_id, emailEventId, dealsCount, triggerReason, status, idempotencyKey]);

    } catch (error) {
      console.error('Error recording delivery:', error.message);
    }
  }

  async updateAlertTriggerTime(alert) {
    try {
      await db.query(`
        UPDATE public.alerts 
        SET last_triggered_at = NOW(),
            next_trigger_at = calculate_next_trigger($1, NOW()),
            updated_at = NOW()
        WHERE id = $2
      `, [alert.frequency, alert.id]);

    } catch (error) {
      console.error('Error updating alert trigger time:', error.message);
    }
  }

  async processDailyAlerts() {
    console.log('📅 Processing daily alerts...');
    // Force process daily alerts specifically
    await this.processAlertsByFrequency('daily');
  }

  async processWeeklyAlerts() {
    console.log('📅 Processing weekly alerts...');
    // Force process weekly alerts specifically
    await this.processAlertsByFrequency('weekly');
  }

  async processAlertsByFrequency(frequency) {
    try {
      const alertsResult = await db.query(`
        SELECT 
          a.id, a.user_id, a.filter_id, a.frequency, a.last_triggered_at,
          sf.name as filter_name, sf.criteria as filter_criteria,
          u.email as user_email, u.first_name, u.last_name
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        JOIN public.users u ON a.user_id = u.id
        WHERE a.is_active = true 
          AND sf.is_active = true
          AND u.email_verified = true
          AND a.frequency = $1
          AND (a.last_triggered_at IS NULL OR a.last_triggered_at < NOW() - INTERVAL '23 hours')
        ORDER BY a.created_at ASC
        LIMIT 50
      `, [frequency]);

      const alerts = alertsResult.rows;
      console.log(`📊 Found ${alerts.length} ${frequency} alerts to process`);

      for (const alert of alerts) {
        await this.processSingleAlert(alert);
      }

    } catch (error) {
      console.error(`Error processing ${frequency} alerts:`, error.message);
    }
  }

  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastProcessTime: this.lastProcessTime
    };
  }

  // M3.8 Phase 2: Check for recent duplicate deliveries
  async checkRecentDelivery(alert) {
    try {
      const deduplicationWindowMin = parseInt(process.env.ALERT_DEDUP_WINDOW_MIN || '60');
      
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM alert_deliveries
        WHERE alert_id = $1 
          AND user_id = $2
          AND status = 'sent'
          AND created_at > NOW() - INTERVAL '${deduplicationWindowMin} minutes'
      `, [alert.id, alert.user_id]);

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking duplicate delivery:', error.message);
      return false; // Fail open - better to send duplicate than miss alert
    }
  }

  // M3.8 Phase 2: Enhanced email sending with exponential backoff retry
  async sendAlertEmailWithRetry(alert, deals, retryCount = 0) {
    const maxRetries = parseInt(process.env.ALERT_RETRY_MAX || '3');
    const baseBackoffMs = parseInt(process.env.ALERT_RETRY_BACKOFF_MS || '1000');

    try {
      const result = await this.sendAlertEmail(alert, deals);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        const backoffDelay = baseBackoffMs * Math.pow(2, retryCount); // Exponential backoff
        console.log(`⏳ Retrying alert ${alert.id} in ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return await this.sendAlertEmailWithRetry(alert, deals, retryCount + 1);
      }
      
      return {
        success: false,
        error: `Failed after ${maxRetries} retries: ${error.message}`
      };
    }
  }

  // M3.8 Phase 5: Coordination wrapper methods
  async processAlertsWithCoordination() {
    if (this.coordinator) {
      const isSingleton = await this.coordinator.isSingletonWorker('instant_alerts', 300000);
      if (!isSingleton) {
        console.log('⏸️ Another worker is processing instant alerts, skipping...');
        return;
      }
    }
    await this.processAlerts();
  }

  async processDailyAlertsWithCoordination() {
    if (this.coordinator) {
      const isSingleton = await this.coordinator.isSingletonWorker('daily_alerts', 3600000);
      if (!isSingleton) {
        console.log('⏸️ Another worker is processing daily alerts, skipping...');
        return;
      }
    }
    await this.processDailyAlerts();
  }

  async processWeeklyAlertsWithCoordination() {
    if (this.coordinator) {
      const isSingleton = await this.coordinator.isSingletonWorker('weekly_alerts', 3600000);
      if (!isSingleton) {
        console.log('⏸️ Another worker is processing weekly alerts, skipping...');
        return;
      }
    }
    await this.processWeeklyAlerts();
  }

  // Manual trigger for testing
  async triggerProcessing() {
    console.log('🔧 Manually triggering alert processing...');
    await this.processAlerts();
  }
}

// Export singleton instance
const alertsProcessor = new AlertsProcessor();
module.exports = alertsProcessor;