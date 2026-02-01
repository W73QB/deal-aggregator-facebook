/**
 * M3.6 Metrics Dashboard Routes
 * Provides detailed notification system metrics and monitoring
 */

const express = require('express');
const { Pool } = require('pg');
const { register } = require('../monitoring/metrics');
const { logger } = require('../monitoring/logger');
const cacheMonitor = require('../monitoring/cache-alerts');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Prometheus metrics endpoint
 */
router.get('/prometheus', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Failed to generate Prometheus metrics', { error: error.message });
    res.status(500).json({ error: 'Metrics generation failed' });
  }
});

/**
 * M3.6 Notification system dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    const timeFilter = getTimeFilter(timeRange);

    const [
      notificationStats,
      channelStats,
      templateStats,
      errorStats,
      queueStats,
      performanceStats,
      userEngagement
    ] = await Promise.all([
      getNotificationStats(timeFilter),
      getChannelStats(timeFilter),
      getTemplateStats(timeFilter),
      getErrorStats(timeFilter),
      getQueueStats(),
      getPerformanceStats(timeFilter),
      getUserEngagementStats(timeFilter)
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      timeRange,
      overview: notificationStats,
      channels: channelStats,
      templates: templateStats,
      errors: errorStats,
      queue: queueStats,
      performance: performanceStats,
      engagement: userEngagement
    });

  } catch (error) {
    logger.error('Failed to generate metrics dashboard', { error: error.message });
    res.status(500).json({ error: 'Dashboard generation failed' });
  }
});

/**
 * Real-time system health
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      database: await checkDatabaseHealth(),
      queue: await getQueueHealth(),
      services: await getServiceHealth()
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({ error: 'Health check failed' });
  }
});

/**
 * M3.7 Cache health and performance metrics
 */
router.get('/cache', async (_req, res) => {
  try {
    const cacheHealth = cacheMonitor.getHealthSummary();
    
    res.json({
      timestamp: new Date().toISOString(),
      cache: cacheHealth
    });
  } catch (error) {
    logger.error('Cache metrics failed', { error: error.message });
    res.status(500).json({ error: 'Cache metrics generation failed' });
  }
});

/**
 * Notification delivery rates
 */
router.get('/delivery-rates', async (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    const timeFilter = getTimeFilter(timeRange);

    const deliveryRates = await pool.query(`
      SELECT 
        channel,
        template,
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE status = 'sent') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(CASE WHEN sent_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (sent_at - created_at)) * 1000 
          ELSE NULL END) as avg_delivery_time_ms,
        AVG(attempts) as avg_retries
      FROM notifications 
      WHERE created_at >= NOW() - INTERVAL '${timeFilter}'
      GROUP BY channel, template
      ORDER BY total_sent DESC
    `);

    const rates = deliveryRates.rows.map(row => ({
      channel: row.channel,
      template: row.template,
      totalSent: parseInt(row.total_sent),
      successful: parseInt(row.successful),
      failed: parseInt(row.failed),
      successRate: row.total_sent > 0 ? (row.successful / row.total_sent * 100).toFixed(2) : 0,
      avgDeliveryTimeMs: row.avg_delivery_time_ms ? Math.round(row.avg_delivery_time_ms) : null,
      avgRetries: row.avg_retries ? parseFloat(row.avg_retries).toFixed(1) : 0
    }));

    res.json({
      timeRange,
      deliveryRates: rates
    });

  } catch (error) {
    logger.error('Failed to get delivery rates', { error: error.message });
    res.status(500).json({ error: 'Failed to get delivery rates' });
  }
});

/**
 * User engagement metrics  
 */
router.get('/engagement', async (req, res) => {
  try {
    const timeRange = req.query.range || '7d';
    const timeFilter = getTimeFilter(timeRange);

    const engagement = await pool.query(`
      SELECT 
        template,
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
        AVG(CASE WHEN opened_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (opened_at - sent_at)) / 3600 
          ELSE NULL END) as avg_hours_to_open
      FROM notifications n
      WHERE n.channel = 'in_app' 
        AND n.created_at >= NOW() - INTERVAL '${timeFilter}'
        AND n.status = 'sent'
      GROUP BY template
      ORDER BY total_sent DESC
    `);

    const metrics = engagement.rows.map(row => ({
      template: row.template,
      totalSent: parseInt(row.total_sent),
      opened: parseInt(row.opened || 0),
      clicked: parseInt(row.clicked || 0),
      openRate: row.total_sent > 0 ? (row.opened / row.total_sent * 100).toFixed(2) : 0,
      clickRate: row.opened > 0 ? (row.clicked / row.opened * 100).toFixed(2) : 0,
      avgHoursToOpen: row.avg_hours_to_open ? parseFloat(row.avg_hours_to_open).toFixed(1) : null
    }));

    res.json({
      timeRange,
      engagement: metrics
    });

  } catch (error) {
    logger.error('Failed to get engagement metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get engagement metrics' });
  }
});

// Helper functions
function getTimeFilter(range) {
  const ranges = {
    '1h': '1 hour',
    '6h': '6 hours', 
    '24h': '1 day',
    '7d': '7 days',
    '30d': '30 days'
  };
  return ranges[range] || '1 day';
}

async function getNotificationStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'processing') as processing
    FROM notifications 
    WHERE created_at >= NOW() - INTERVAL '${timeFilter}'
  `);

  const stats = result.rows[0];
  return {
    total: parseInt(stats.total),
    sent: parseInt(stats.sent || 0),
    failed: parseInt(stats.failed || 0),
    pending: parseInt(stats.pending || 0),
    processing: parseInt(stats.processing || 0),
    successRate: stats.total > 0 ? (stats.sent / stats.total * 100).toFixed(2) : 0
  };
}

async function getChannelStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      channel,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      AVG(CASE WHEN sent_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (sent_at - created_at)) * 1000 
        ELSE NULL END) as avg_delivery_time_ms
    FROM notifications 
    WHERE created_at >= NOW() - INTERVAL '${timeFilter}'
    GROUP BY channel
    ORDER BY total DESC
  `);

  return result.rows.map(row => ({
    channel: row.channel,
    total: parseInt(row.total),
    sent: parseInt(row.sent || 0),
    successRate: row.total > 0 ? (row.sent / row.total * 100).toFixed(2) : 0,
    avgDeliveryTimeMs: row.avg_delivery_time_ms ? Math.round(row.avg_delivery_time_ms) : null
  }));
}

async function getTemplateStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      template,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM notifications 
    WHERE created_at >= NOW() - INTERVAL '${timeFilter}'
    GROUP BY template
    ORDER BY total DESC
  `);

  return result.rows.map(row => ({
    template: row.template,
    total: parseInt(row.total),
    sent: parseInt(row.sent || 0),
    failed: parseInt(row.failed || 0),
    successRate: row.total > 0 ? (row.sent / row.total * 100).toFixed(2) : 0
  }));
}

async function getErrorStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      'notification_error' as error_type,
      last_error as error_message,
      COUNT(*) as count
    FROM notifications 
    WHERE status = 'failed' 
      AND created_at >= NOW() - INTERVAL '${timeFilter}'
      AND last_error IS NOT NULL
    GROUP BY last_error
    ORDER BY count DESC
    LIMIT 10
  `);

  return result.rows.map(row => ({
    type: row.error_type,
    message: row.error_message,
    count: parseInt(row.count)
  }));
}

async function getQueueStats() {
  const result = await pool.query(`
    SELECT 
      status,
      priority,
      COUNT(*) as count
    FROM alert_queue
    GROUP BY status, priority
    ORDER BY priority DESC, count DESC
  `);

  return result.rows.map(row => ({
    status: row.status,
    priority: parseInt(row.priority),
    count: parseInt(row.count)
  }));
}

async function getPerformanceStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as notifications_count,
      AVG(CASE WHEN sent_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (sent_at - created_at)) * 1000 
        ELSE NULL END) as avg_latency_ms
    FROM notifications 
    WHERE created_at >= NOW() - INTERVAL '${timeFilter}'
    GROUP BY hour
    ORDER BY hour DESC
    LIMIT 24
  `);

  return result.rows.map(row => ({
    hour: row.hour,
    count: parseInt(row.notifications_count),
    avgLatencyMs: row.avg_latency_ms ? Math.round(row.avg_latency_ms) : null
  }));
}

async function getUserEngagementStats(timeFilter) {
  const result = await pool.query(`
    SELECT 
      COUNT(DISTINCT user_id) as active_users,
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opens,
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicks,
      COUNT(*) as total_notifications
    FROM notifications 
    WHERE channel = 'in_app' 
      AND created_at >= NOW() - INTERVAL '${timeFilter}'
      AND status = 'sent'
  `);

  const stats = result.rows[0];
  return {
    activeUsers: parseInt(stats.active_users || 0),
    totalNotifications: parseInt(stats.total_notifications),
    opens: parseInt(stats.opens || 0),
    clicks: parseInt(stats.clicks || 0),
    openRate: stats.total_notifications > 0 ? (stats.opens / stats.total_notifications * 100).toFixed(2) : 0,
    clickThroughRate: stats.opens > 0 ? (stats.clicks / stats.opens * 100).toFixed(2) : 0
  };
}

async function checkDatabaseHealth() {
  try {
    await pool.query('SELECT 1 as healthy');
    return { status: 'healthy', latency: 'low' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function getQueueHealth() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 hour' AND status = 'pending') as stuck
      FROM alert_queue
    `);

    const stats = result.rows[0];
    const pending = parseInt(stats.pending || 0);
    const stuck = parseInt(stats.stuck || 0);

    return {
      status: stuck > 0 ? 'degraded' : pending > 100 ? 'warning' : 'healthy',
      pending,
      processing: parseInt(stats.processing || 0),
      stuck
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function getServiceHealth() {
  return {
    email: { status: 'healthy' }, // TODO: Add actual service health checks
    webhook: { status: 'healthy' },
    inApp: { status: 'healthy' }
  };
}

module.exports = router;
