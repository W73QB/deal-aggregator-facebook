// Health Check API Router
// Converted from pages/api/health.js

const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET /api/health
router.get('/', async (req, res) => {
  try {
    const checks = [];

    // 1. Database health check
    try {
      if (db.isConfigured()) {
        const dbHealth = await db.healthCheck();
        checks.push({
          component: 'database',
          status: dbHealth.status === 'healthy' ? 'ok' : 'error',
          detail: dbHealth.status === 'healthy'
            ? `Response time: ${dbHealth.responseTime}`
            : dbHealth.error
        });
      } else {
        checks.push({
          component: 'database',
          status: 'warn',
          detail: 'Database not configured (using fallbacks)'
        });
      }
    } catch (error) {
      checks.push({
        component: 'database',
        status: 'error',
        detail: error.message
      });
    }

    // 2. Server health check
    checks.push({
      component: 'server',
      status: 'ok',
      detail: 'External API server running'
    });

    // 3. Memory check
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    checks.push({
      component: 'memory',
      status: memUsageMB < 500 ? 'ok' : 'warn',
      detail: `Heap used: ${memUsageMB}MB`
    });

    // 4. Uptime check
    const uptimeMinutes = Math.floor(process.uptime() / 60);
    checks.push({
      component: 'uptime',
      status: 'ok',
      detail: `${uptimeMinutes} minutes`
    });

    // Determine overall status
    const status = checks.every((check) => check.status === 'ok')
      ? 'healthy'
      : checks.some((check) => check.status === 'error')
        ? 'error'
        : 'degraded';

    const statusCode = status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      status,
      generatedAt: new Date().toISOString(),
      source: 'external-api',
      checks
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      generatedAt: new Date().toISOString(),
      error: error.message,
      checks: [{
        component: 'health-endpoint',
        status: 'error',
        detail: error.message
      }]
    });
  }
});

module.exports = router;