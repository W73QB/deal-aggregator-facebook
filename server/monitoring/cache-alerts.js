/**
 * M3.7 Cache Performance Monitoring & Alerting
 * Monitors cache metrics and triggers alerts for performance degradation
 */

const { logger } = require('./logger');
const { businessMetrics } = require('./metrics');
const emailService = require('../email/service');

class CacheMonitor {
  constructor() {
    this.isEnabled = process.env.MONITORING_ENABLED === 'true';
    this.alertThresholds = {
      cacheHitRatio: {
        warning: 0.8,  // Alert if hit ratio drops below 80%
        critical: 0.6  // Critical if hit ratio drops below 60%
      },
      responseTime: {
        warning: 500,  // Alert if avg response time > 500ms
        critical: 1000 // Critical if avg response time > 1000ms
      },
      errorRate: {
        warning: 0.05, // Alert if error rate > 5%
        critical: 0.1  // Critical if error rate > 10%
      }
    };
    
    this.metrics = {
      cacheHits: new Map(),
      cacheMisses: new Map(),
      responsesTimes: [],
      errors: 0,
      totalRequests: 0
    };
    
    this.lastAlertTime = new Map();
    this.alertCooldown = 15 * 60 * 1000; // 15 minutes
    
    if (this.isEnabled) {
      this.startMonitoring();
    }
  }

  /**
   * Start monitoring cache performance
   */
  startMonitoring() {
    // Check cache performance every minute
    setInterval(() => {
      this.checkCacheHealth();
    }, 60000);
    
    // Reset metrics every hour
    setInterval(() => {
      this.resetHourlyMetrics();
    }, 3600000);
    
    logger.info('Cache monitoring started', {
      thresholds: this.alertThresholds,
      checkInterval: '60s',
      resetInterval: '1h'
    });
  }

  /**
   * Track cache operation for monitoring
   */
  trackCacheOperation(endpoint, operation, duration, success = true) {
    if (!this.isEnabled) return;
    
    const key = this.normalizeEndpoint(endpoint);
    
    if (operation === 'hit') {
      this.metrics.cacheHits.set(key, (this.metrics.cacheHits.get(key) || 0) + 1);
    } else if (operation === 'miss') {
      this.metrics.cacheMisses.set(key, (this.metrics.cacheMisses.get(key) || 0) + 1);
    }
    
    if (duration > 0) {
      this.metrics.responsesTimes.push({ endpoint: key, duration, timestamp: Date.now() });
    }
    
    if (!success) {
      this.metrics.errors++;
    }
    
    this.metrics.totalRequests++;
    
    // Update Prometheus metrics
    const hits = this.metrics.cacheHits.get(key) || 0;
    const misses = this.metrics.cacheMisses.get(key) || 0;
    businessMetrics.updateCacheHitRatio(key, hits, misses);
  }

  /**
   * Check cache health and trigger alerts if needed
   */
  async checkCacheHealth() {
    try {
      const health = this.calculateHealthMetrics();
      
      logger.debug('Cache health check', health);
      
      // Check each metric against thresholds
      await this.checkCacheHitRatio(health.hitRatios);
      await this.checkResponseTimes(health.avgResponseTime);
      await this.checkErrorRate(health.errorRate);
      
    } catch (error) {
      logger.error('Cache health check failed', { error: error.message });
    }
  }

  /**
   * Calculate current cache health metrics
   */
  calculateHealthMetrics() {
    const hitRatios = new Map();
    const endpoints = new Set([
      ...this.metrics.cacheHits.keys(),
      ...this.metrics.cacheMisses.keys()
    ]);
    
    for (const endpoint of endpoints) {
      const hits = this.metrics.cacheHits.get(endpoint) || 0;
      const misses = this.metrics.cacheMisses.get(endpoint) || 0;
      const total = hits + misses;
      const ratio = total > 0 ? hits / total : 1;
      hitRatios.set(endpoint, { hits, misses, total, ratio });
    }
    
    // Calculate average response time (last 100 requests)
    const recentResponses = this.metrics.responsesTimes.slice(-100);
    const avgResponseTime = recentResponses.length > 0 
      ? recentResponses.reduce((sum, r) => sum + r.duration, 0) / recentResponses.length
      : 0;
    
    // Calculate error rate
    const errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.errors / this.metrics.totalRequests
      : 0;
    
    return {
      hitRatios,
      avgResponseTime,
      errorRate,
      totalRequests: this.metrics.totalRequests
    };
  }

  /**
   * Check cache hit ratios and alert if needed
   */
  async checkCacheHitRatio(hitRatios) {
    for (const [endpoint, stats] of hitRatios.entries()) {
      if (stats.total < 10) continue; // Skip endpoints with too few requests
      
      const { ratio } = stats;
      const alertKey = `hitRatio:${endpoint}`;
      
      if (ratio < this.alertThresholds.cacheHitRatio.critical) {
        await this.sendAlert('CRITICAL', 'Cache Hit Ratio', {
          endpoint,
          hitRatio: (ratio * 100).toFixed(1) + '%',
          threshold: (this.alertThresholds.cacheHitRatio.critical * 100) + '%',
          hits: stats.hits,
          misses: stats.misses,
          message: `Critical cache hit ratio drop for ${endpoint}`
        }, alertKey);
      } else if (ratio < this.alertThresholds.cacheHitRatio.warning) {
        await this.sendAlert('WARNING', 'Cache Hit Ratio', {
          endpoint,
          hitRatio: (ratio * 100).toFixed(1) + '%',
          threshold: (this.alertThresholds.cacheHitRatio.warning * 100) + '%',
          hits: stats.hits,
          misses: stats.misses,
          message: `Cache hit ratio below warning threshold for ${endpoint}`
        }, alertKey);
      }
    }
  }

  /**
   * Check response times and alert if needed
   */
  async checkResponseTimes(avgResponseTime) {
    if (avgResponseTime === 0) return;
    
    const alertKey = 'responseTime:global';
    
    if (avgResponseTime > this.alertThresholds.responseTime.critical) {
      await this.sendAlert('CRITICAL', 'Response Time', {
        avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
        threshold: this.alertThresholds.responseTime.critical + 'ms',
        message: `Critical response time degradation detected`
      }, alertKey);
    } else if (avgResponseTime > this.alertThresholds.responseTime.warning) {
      await this.sendAlert('WARNING', 'Response Time', {
        avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
        threshold: this.alertThresholds.responseTime.warning + 'ms',
        message: `Response time above warning threshold`
      }, alertKey);
    }
  }

  /**
   * Check error rates and alert if needed
   */
  async checkErrorRate(errorRate) {
    if (this.metrics.totalRequests < 50) return; // Skip if too few requests
    
    const alertKey = 'errorRate:global';
    
    if (errorRate > this.alertThresholds.errorRate.critical) {
      await this.sendAlert('CRITICAL', 'Error Rate', {
        errorRate: (errorRate * 100).toFixed(1) + '%',
        threshold: (this.alertThresholds.errorRate.critical * 100) + '%',
        errors: this.metrics.errors,
        totalRequests: this.metrics.totalRequests,
        message: `Critical cache error rate detected`
      }, alertKey);
    } else if (errorRate > this.alertThresholds.errorRate.warning) {
      await this.sendAlert('WARNING', 'Error Rate', {
        errorRate: (errorRate * 100).toFixed(1) + '%',
        threshold: (this.alertThresholds.errorRate.warning * 100) + '%',
        errors: this.metrics.errors,
        totalRequests: this.metrics.totalRequests,
        message: `Cache error rate above warning threshold`
      }, alertKey);
    }
  }

  /**
   * Send alert with cooldown management
   */
  async sendAlert(severity, alertType, data, alertKey) {
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alertKey);
    
    if (lastAlert && (now - lastAlert) < this.alertCooldown) {
      logger.debug('Alert suppressed (cooldown)', { alertKey, severity });
      return;
    }
    
    this.lastAlertTime.set(alertKey, now);
    
    const alertData = {
      severity,
      type: alertType,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      ...data
    };
    
    logger.warn(`Cache Alert: ${severity} - ${alertType}`, alertData);
    
    // Send email alert to admins
    try {
      if (process.env.NOTIFY_EMAIL_ENABLED === 'true') {
        await this.sendEmailAlert(alertData);
      }
    } catch (error) {
      logger.error('Failed to send cache alert email', { error: error.message });
    }
    
    // Track alert in metrics
    businessMetrics.trackError('cache_alert', severity.toLowerCase(), 'monitoring');
  }

  /**
   * Send email alert to administrators
   */
  async sendEmailAlert(alertData) {
    const subject = `[${alertData.severity}] DealRadarUS Cache Alert - ${alertData.type}`;
    
    const html = `
      <h2>Cache Performance Alert</h2>
      <p><strong>Severity:</strong> <span style="color: ${alertData.severity === 'CRITICAL' ? 'red' : 'orange'}">${alertData.severity}</span></p>
      <p><strong>Alert Type:</strong> ${alertData.type}</p>
      <p><strong>Time:</strong> ${alertData.timestamp}</p>
      <p><strong>Environment:</strong> ${alertData.environment}</p>
      <p><strong>Message:</strong> ${alertData.message}</p>
      
      <h3>Details:</h3>
      <ul>
        ${Object.entries(alertData).filter(([key]) => !['severity', 'type', 'timestamp', 'environment', 'message'].includes(key)).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
      </ul>
      
      <p><em>This alert was generated by the DealRadarUS M3.7 Cache Monitoring System.</em></p>
    `;
    
    // Get admin emails from database
    const db = require('../auth/utils/database');
    const adminQuery = await db.query(`
      SELECT email FROM public.users 
      WHERE role = 'admin' AND email_verified = true
      LIMIT 10
    `);
    
    if (adminQuery.rows.length > 0) {
      for (const admin of adminQuery.rows) {
        await emailService.sendEmail({
          to: admin.email,
          subject,
          html,
          priority: alertData.severity === 'CRITICAL' ? 'high' : 'normal'
        });
      }
      
      logger.info(`Cache alert sent to ${adminQuery.rows.length} administrators`);
    }
  }

  /**
   * Normalize endpoint for consistent tracking
   */
  normalizeEndpoint(endpoint) {
    if (typeof endpoint !== 'string') return 'unknown';
    
    return endpoint
      .replace(/\/\d+/g, '/:id')
      .replace(/\?.*$/, '')
      .toLowerCase();
  }

  /**
   * Reset hourly metrics
   */
  resetHourlyMetrics() {
    this.metrics.responsesTimes = this.metrics.responsesTimes.filter(
      r => Date.now() - r.timestamp < 3600000
    );
    
    // Keep running totals but reset errors
    this.metrics.errors = 0;
    
    logger.debug('Hourly cache metrics reset', {
      remainingResponses: this.metrics.responsesTimes.length
    });
  }

  /**
   * Get current cache health summary
   */
  getHealthSummary() {
    const health = this.calculateHealthMetrics();
    
    const summary = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRequests: health.totalRequests,
        avgResponseTime: Math.round(health.avgResponseTime),
        errorRate: (health.errorRate * 100).toFixed(2) + '%',
        endpoints: {}
      }
    };
    
    // Add endpoint-specific hit ratios
    for (const [endpoint, stats] of health.hitRatios.entries()) {
      summary.metrics.endpoints[endpoint] = {
        hitRatio: (stats.ratio * 100).toFixed(1) + '%',
        totalRequests: stats.total
      };
      
      // Determine overall health
      if (stats.ratio < this.alertThresholds.cacheHitRatio.critical || 
          health.avgResponseTime > this.alertThresholds.responseTime.critical ||
          health.errorRate > this.alertThresholds.errorRate.critical) {
        summary.overall = 'critical';
      } else if (stats.ratio < this.alertThresholds.cacheHitRatio.warning || 
                 health.avgResponseTime > this.alertThresholds.responseTime.warning ||
                 health.errorRate > this.alertThresholds.errorRate.warning) {
        summary.overall = 'warning';
      }
    }
    
    return summary;
  }
}

// Export singleton instance
module.exports = new CacheMonitor();