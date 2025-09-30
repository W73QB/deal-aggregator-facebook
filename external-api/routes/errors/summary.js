// Error Summary API Router
// Converted from pages/api/errors/summary.js

const express = require('express');
const router = express.Router();
const db = require('../../lib/db');

// GET /api/errors/summary
router.get('/', async (req, res) => {
  try {
    const summary = await getErrorSummary();
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: 'Internal server error',
      summary: getEmptySummary()
    });
  }
});

async function getErrorSummary() {
  const summary = getEmptySummary();

  if (!db.isConfigured()) {
    console.warn('Database not configured - returning empty summary');
    return summary;
  }

  try {
    // Get today's error statistics
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical,
        COUNT(*) FILTER (WHERE severity = 'high') as high,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium,
        COUNT(*) FILTER (WHERE severity = 'low') as low,
        COUNT(*) FILTER (WHERE severity = 'unknown') as unknown,
        COUNT(DISTINCT fingerprint) as unique_count,
        MIN(occurred_at) as first_error,
        MAX(occurred_at) as last_error
      FROM error_logs
      WHERE occurred_at >= $1
    `;

    const statsResult = await db.query(statsQuery, [startOfDay]);
    const stats = statsResult.rows[0];

    // Get error counts by type
    const typeQuery = `
      SELECT error_type, COUNT(*) as count
      FROM error_logs
      WHERE occurred_at >= $1
      GROUP BY error_type
      ORDER BY count DESC
      LIMIT 20
    `;

    const typeResult = await db.query(typeQuery, [startOfDay]);
    const errorsByType = {};
    typeResult.rows.forEach(row => {
      errorsByType[row.error_type] = parseInt(row.count);
    });

    // Get recent errors
    const recentQuery = `
      SELECT id, error_type as type, message, severity, occurred_at as timestamp, fingerprint
      FROM error_logs
      WHERE occurred_at >= $1
      ORDER BY occurred_at DESC
      LIMIT 10
    `;

    const recentResult = await db.query(recentQuery, [startOfDay]);
    const recent = recentResult.rows.map(row => ({
      id: row.id,
      type: row.type,
      message: row.message,
      severity: row.severity,
      timestamp: row.timestamp,
      fingerprint: row.fingerprint
    }));

    // Calculate metrics
    const total = parseInt(stats.total || 0);
    const errorRate = calculateErrorRate(stats.first_error, stats.last_error, total);
    const criticalityScore = calculateCriticalityScore({
      critical: parseInt(stats.critical || 0),
      high: parseInt(stats.high || 0),
      medium: parseInt(stats.medium || 0),
      low: parseInt(stats.low || 0),
      unknown: parseInt(stats.unknown || 0)
    });

    return {
      date: today.toISOString().split('T')[0],
      total: total,
      critical: parseInt(stats.critical || 0),
      high: parseInt(stats.high || 0),
      medium: parseInt(stats.medium || 0),
      low: parseInt(stats.low || 0),
      errorsBySeverity: {
        critical: parseInt(stats.critical || 0),
        high: parseInt(stats.high || 0),
        medium: parseInt(stats.medium || 0),
        low: parseInt(stats.low || 0),
        unknown: parseInt(stats.unknown || 0)
      },
      errorsByType: errorsByType,
      uniqueErrorCount: parseInt(stats.unique_count || 0),
      firstError: stats.first_error,
      lastError: stats.last_error,
      recent: recent,
      errorRate: errorRate,
      criticalityScore: criticalityScore
    };

  } catch (error) {
    console.error('Failed to get error summary from database:', error);
    return getEmptySummary();
  }
}

function getEmptySummary() {
  return {
    date: new Date().toISOString().split('T')[0],
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    errorsBySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0
    },
    errorsByType: {},
    uniqueErrorCount: 0,
    firstError: null,
    lastError: null,
    recent: [],
    errorRate: 0,
    criticalityScore: 0
  };
}

function calculateErrorRate(firstError, lastError, total) {
  if (!firstError || !lastError || total === 0) {
    return 0;
  }

  const firstTime = new Date(firstError);
  const lastTime = new Date(lastError);
  const hoursDiff = (lastTime - firstTime) / (1000 * 60 * 60);

  if (hoursDiff <= 0) {
    return total;
  }

  return Math.round((total / hoursDiff) * 10) / 10; // Round to 1 decimal
}

function calculateCriticalityScore(severityCounts) {
  const weights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
    unknown: 1
  };

  let score = 0;
  Object.entries(severityCounts).forEach(([severity, count]) => {
    score += count * (weights[severity] || 1);
  });

  return score;
}

module.exports = router;