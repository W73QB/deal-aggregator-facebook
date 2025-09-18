#!/usr/bin/env node

/**
 * Real-time Error Tracking & Performance Monitor
 * Tracks API performance, cache hits, database health
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

class ErrorTracker {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: [],
      avgResponseTime: 0,
      databaseHealth: 'unknown',
      startTime: Date.now()
    };

    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    // Real-time dashboard
    this.app.get('/monitoring', (req, res) => {
      const uptime = Math.floor((Date.now() - this.metrics.startTime) / 1000);
      const cacheHitRatio = this.metrics.apiCalls > 0
        ? ((this.metrics.cacheHits / this.metrics.apiCalls) * 100).toFixed(1)
        : 0;

      const dashboard = `
<!DOCTYPE html>
<html>
<head>
    <title>DealRadarUS - Monitoring Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #666; font-size: 0.9em; text-transform: uppercase; }
        .status-healthy { color: #16a34a; }
        .status-warning { color: #ea580c; }
        .status-error { color: #dc2626; }
        .errors-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .error-item { padding: 10px; border-left: 4px solid #dc2626; margin-bottom: 10px; background: #fef2f2; }
        .timestamp { font-size: 0.8em; color: #666; }
        .refresh-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 DealRadarUS Monitoring Dashboard</h1>
            <p>Real-time performance and error tracking</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${this.metrics.apiCalls}</div>
                <div class="metric-label">Total API Calls</div>
            </div>
            <div class="metric-card">
                <div class="metric-value status-healthy">${cacheHitRatio}%</div>
                <div class="metric-label">Cache Hit Ratio</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.metrics.avgResponseTime}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${uptime}s</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${this.metrics.databaseHealth === 'healthy' ? 'status-healthy' : 'status-warning'}">${this.metrics.databaseHealth}</div>
                <div class="metric-label">Database Status</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${this.metrics.errors.length === 0 ? 'status-healthy' : 'status-error'}">${this.metrics.errors.length}</div>
                <div class="metric-label">Active Errors</div>
            </div>
        </div>

        <div class="errors-list">
            <h3>Recent Errors</h3>
            ${this.metrics.errors.length === 0
              ? '<p class="status-healthy">✅ No errors in the last hour</p>'
              : this.metrics.errors.slice(-10).map(error => `
                <div class="error-item">
                    <strong>${error.type}</strong>: ${error.message}
                    <div class="timestamp">${new Date(error.timestamp).toLocaleString()}</div>
                </div>
              `).join('')
            }
        </div>

        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>

        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => location.reload(), 30000);
        </script>
    </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(dashboard);
    });

    // Metrics API endpoint
    this.app.get('/metrics', (req, res) => {
      res.json({
        ...this.metrics,
        uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
        cacheHitRatio: this.metrics.apiCalls > 0
          ? (this.metrics.cacheHits / this.metrics.apiCalls * 100).toFixed(1)
          : 0
      });
    });
  }

  // Track API call metrics
  trackApiCall(responseTime, isCacheHit) {
    this.metrics.apiCalls++;
    if (isCacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // Update average response time
    this.metrics.avgResponseTime = Math.round(
      (this.metrics.avgResponseTime * (this.metrics.apiCalls - 1) + responseTime) / this.metrics.apiCalls
    );
  }

  // Track errors
  trackError(type, message, details = {}) {
    const error = {
      type,
      message,
      details,
      timestamp: Date.now()
    };

    this.metrics.errors.push(error);

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    console.error('🚨 Error tracked:', error);
  }

  // Update database health status
  updateDatabaseHealth(status) {
    this.metrics.databaseHealth = status;
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`📊 Error Tracker running on http://localhost:${port}/monitoring`);
    });
  }
}

// Create and export singleton
const tracker = new ErrorTracker();

// Start monitoring server if run directly
if (require.main === module) {
  tracker.start();
}

module.exports = tracker;