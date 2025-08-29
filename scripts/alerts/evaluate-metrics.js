#!/usr/bin/env node

/**
 * Alert Evaluation System
 * Monitors application metrics and sends notifications
 */

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Import fetch - handle both ESM and CommonJS
let fetch;
(async () => {
  if (typeof globalThis.fetch === 'undefined') {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
    globalThis.fetch = nodeFetch;
  } else {
    fetch = globalThis.fetch;
  }
})();

// Load configuration
require('dotenv').config({ path: path.join(__dirname, '../../.env.dealradarus.local') });

// State management for alert cooldowns
const alertState = new Map();

class AlertEvaluator {
  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.emailTransporter = null;
    this.config = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load alert configuration
      const configPath = path.join(__dirname, 'sample-alerts.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);

      // Initialize email transporter if enabled
      if (this.config.alerting.notification_config.email.enabled) {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      }

      this.isInitialized = true;
      console.log('✅ Alert evaluator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize alert evaluator:', error.message);
      process.exit(1);
    }
  }

  async checkHealth() {
    try {
      // Ensure fetch is available
      if (!fetch) {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
      }
      
      const response = await fetch(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      };
    }
  }

  async checkReadiness() {
    try {
      // Ensure fetch is available
      if (!fetch) {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
      }
      
      const response = await fetch(`${this.baseUrl}/ready`, {
        timeout: 5000
      });
      
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      };
    }
  }

  async getMetrics() {
    try {
      // Ensure fetch is available
      if (!fetch) {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
      }
      
      const response = await fetch(`${this.baseUrl}/metrics`, {
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`Metrics endpoint returned ${response.status}`);
      }

      const metricsText = await response.text();
      return this.parsePrometheusMetrics(metricsText);
    } catch (error) {
      console.error('Failed to fetch metrics:', error.message);
      return {};
    }
  }

  parsePrometheusMetrics(metricsText) {
    const metrics = {};
    const lines = metricsText.split('\n');

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line.trim()) continue;

      // Parse metric line: metric_name{labels} value timestamp
      const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*){([^}]*)} ([0-9.-]+)(?:\s+([0-9]+))?$/);
      if (match) {
        const [, name, labels, value] = match;
        const labelPairs = {};
        
        // Parse labels
        if (labels) {
          const labelMatches = labels.match(/(\w+)="([^"]*)"/g);
          if (labelMatches) {
            for (const labelMatch of labelMatches) {
              const [, key, val] = labelMatch.match(/(\w+)="([^"]*)"/);
              labelPairs[key] = val;
            }
          }
        }

        if (!metrics[name]) {
          metrics[name] = [];
        }
        
        metrics[name].push({
          labels: labelPairs,
          value: parseFloat(value),
          timestamp: Date.now()
        });
      } else {
        // Handle simple metric without labels
        const simpleMatch = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*) ([0-9.-]+)(?:\s+([0-9]+))?$/);
        if (simpleMatch) {
          const [, name, value] = simpleMatch;
          if (!metrics[name]) {
            metrics[name] = [];
          }
          metrics[name].push({
            labels: {},
            value: parseFloat(value),
            timestamp: Date.now()
          });
        }
      }
    }

    return metrics;
  }

  calculateMetricValue(metrics, alert) {
    const metricName = alert.query.metric;
    const metricData = metrics[metricName] || [];

    if (metricData.length === 0) {
      return null;
    }

    // Apply filters
    let filteredData = metricData;
    if (alert.query.filter) {
      filteredData = this.applyFilter(metricData, alert.query.filter);
    }

    if (filteredData.length === 0) {
      return null;
    }

    // Apply aggregation
    switch (alert.query.aggregation) {
      case 'latest':
        return filteredData[filteredData.length - 1]?.value || null;
      
      case 'avg5m':
      case 'avg':
        const avg = filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length;
        return avg;
      
      case 'p95':
        const sorted = filteredData.map(item => item.value).sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        return sorted[p95Index] || null;
      
      case 'rate5m':
      case 'rate1m':
        // Simplified rate calculation
        if (filteredData.length >= 2) {
          const timeWindow = alert.query.aggregation === 'rate1m' ? 60 : 300; // seconds
          const recent = filteredData.filter(item => 
            (Date.now() - item.timestamp) < (timeWindow * 1000)
          );
          return recent.length / timeWindow;
        }
        return 0;
      
      case 'sum':
        return filteredData.reduce((sum, item) => sum + item.value, 0);
      
      default:
        return filteredData[0]?.value || null;
    }
  }

  applyFilter(data, filter) {
    // Simple filter implementation
    // Format: "status_code >= 400" or "type='heapUsed'"
    
    if (filter.includes('>=')) {
      const [field, value] = filter.split('>=').map(s => s.trim());
      return data.filter(item => {
        const fieldValue = this.getFieldValue(item, field);
        return fieldValue !== null && fieldValue >= parseFloat(value);
      });
    }
    
    if (filter.includes('=')) {
      const [field, value] = filter.split('=').map(s => s.trim());
      const cleanValue = value.replace(/['"]/g, '');
      return data.filter(item => {
        const fieldValue = this.getFieldValue(item, field);
        return fieldValue === cleanValue;
      });
    }

    return data;
  }

  getFieldValue(item, field) {
    if (field === 'status_code') {
      return parseInt(item.labels.status_code) || null;
    }
    
    if (field === 'type') {
      return item.labels.type || null;
    }
    
    if (field === 'status') {
      return item.labels.status || null;
    }

    return item.labels[field] || null;
  }

  async evaluateAlert(alert, metrics) {
    if (!alert.enabled) {
      return null;
    }

    // Check cooldown
    const alertKey = alert.name;
    const lastTriggered = alertState.get(alertKey);
    const now = Date.now();
    
    if (lastTriggered && (now - lastTriggered) < (alert.cooldown_minutes * 60 * 1000)) {
      return null; // Still in cooldown
    }

    let triggered = false;
    let currentValue = null;
    let message = '';

    try {
      switch (alert.type) {
        case 'health':
          const healthResult = await this.checkHealth();
          triggered = healthResult.status !== alert.query.expected_status;
          currentValue = healthResult.status;
          message = `Health check failed: ${healthResult.error || `Status: ${healthResult.status}`}`;
          break;

        case 'metrics':
          currentValue = this.calculateMetricValue(metrics, alert);
          if (currentValue !== null) {
            const threshold = alert.conditions.threshold;
            const operator = alert.conditions.operator;
            
            switch (operator) {
              case '>':
                triggered = currentValue > threshold;
                break;
              case '<':
                triggered = currentValue < threshold;
                break;
              case '>=':
                triggered = currentValue >= threshold;
                break;
              case '<=':
                triggered = currentValue <= threshold;
                break;
              case '==':
                triggered = currentValue === threshold;
                break;
              default:
                triggered = currentValue > threshold;
            }

            message = `${alert.query.metric}: ${currentValue.toFixed(4)} ${operator} ${threshold}`;
          }
          break;

        case 'system':
          // System checks would be implemented here
          // For now, just return false
          triggered = false;
          break;

        default:
          console.warn(`Unknown alert type: ${alert.type}`);
          return null;
      }

    } catch (error) {
      console.error(`Error evaluating alert ${alert.name}:`, error.message);
      return null;
    }

    if (triggered) {
      alertState.set(alertKey, now);
      
      return {
        alert: alert.name,
        description: alert.description,
        severity: alert.severity,
        currentValue,
        threshold: alert.conditions?.threshold,
        message,
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  async sendNotification(alertResult) {
    const subject = `${this.config.alerting.notification_config.email.subject_prefix} ${alertResult.severity.toUpperCase()}: ${alertResult.alert}`;
    
    const message = `
Alert: ${alertResult.alert}
Severity: ${alertResult.severity}
Description: ${alertResult.description}
Message: ${alertResult.message}
Current Value: ${alertResult.currentValue}
Threshold: ${alertResult.threshold}
Timestamp: ${alertResult.timestamp}

--
DealRadarUS Monitoring System
    `.trim();

    // Console notification
    if (this.config.alerting.notification_config.console.enabled) {
      console.log(`\n🚨 ALERT [${alertResult.severity.toUpperCase()}]: ${alertResult.alert}`);
      console.log(`📝 ${alertResult.description}`);
      console.log(`📊 ${alertResult.message}`);
      console.log(`⏰ ${alertResult.timestamp}\n`);
    }

    // Email notification
    if (this.config.alerting.notification_config.email.enabled && this.emailTransporter) {
      try {
        const mailOptions = {
          from: this.config.alerting.notification_config.email.from,
          to: this.config.alerting.notification_config.email.recipients.join(','),
          subject,
          text: message
        };

        await this.emailTransporter.sendMail(mailOptions);
        console.log(`📧 Alert email sent for: ${alertResult.alert}`);
      } catch (error) {
        console.error(`Failed to send alert email:`, error.message);
      }
    }
  }

  async runCheck() {
    if (!this.isInitialized) {
      console.warn('Alert evaluator not initialized');
      return;
    }

    console.log(`🔍 Running alert evaluation at ${new Date().toISOString()}`);

    try {
      // Get current metrics
      const metrics = await this.getMetrics();
      const triggeredAlerts = [];

      // Evaluate each alert
      for (const alert of this.config.alerts) {
        const result = await this.evaluateAlert(alert, metrics);
        if (result) {
          triggeredAlerts.push(result);
        }
      }

      // Send notifications for triggered alerts
      for (const alertResult of triggeredAlerts) {
        await this.sendNotification(alertResult);
      }

      if (triggeredAlerts.length === 0) {
        console.log('✅ No alerts triggered');
      } else {
        console.log(`⚠️  ${triggeredAlerts.length} alert(s) triggered`);
      }

    } catch (error) {
      console.error('Error during alert evaluation:', error.message);
    }
  }

  startScheduler() {
    if (!this.config.alerting.enabled) {
      console.log('⏸️  Alerting is disabled');
      return;
    }

    const interval = this.config.alerting.check_interval_minutes;
    const cronExpression = `*/${interval} * * * *`;

    console.log(`⏰ Starting alert scheduler: every ${interval} minutes`);
    
    // Schedule the checks
    cron.schedule(cronExpression, () => {
      this.runCheck();
    });

    // Run initial check
    this.runCheck();
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const evaluator = new AlertEvaluator();
  
  await evaluator.initialize();

  if (args.includes('--once')) {
    // Run once and exit
    await evaluator.runCheck();
    process.exit(0);
  } else if (args.includes('--test')) {
    // Test mode - just check connectivity
    console.log('🧪 Testing alert evaluator...');
    
    const healthCheck = await evaluator.checkHealth();
    console.log('Health check:', healthCheck.success ? '✅' : '❌', healthCheck);
    
    const readyCheck = await evaluator.checkReadiness();
    console.log('Readiness check:', readyCheck.success ? '✅' : '❌');
    
    const metrics = await evaluator.getMetrics();
    console.log('Metrics available:', Object.keys(metrics).length, 'metrics');
    
    process.exit(0);
  } else {
    // Start scheduler
    evaluator.startScheduler();
    
    // Keep the process alive
    console.log('🚀 Alert evaluator running. Press Ctrl+C to stop.');
    
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down alert evaluator...');
      process.exit(0);
    });
  }
}

// Export for testing
module.exports = { AlertEvaluator };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}