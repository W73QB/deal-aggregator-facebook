/**
 * Error Summary API Endpoint
 * Provides aggregated error statistics for monitoring dashboard
 */

import fs from 'fs';
import path from 'path';

const ERROR_LOG_DIR = path.join(process.cwd(), 'monitoring', 'errors');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const summary = await getErrorSummary(today);

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: 'Internal server error',
      summary: getEmptySummary()
    });
  }
}

async function getErrorSummary(dateStr) {
  const summaryPath = path.join(ERROR_LOG_DIR, `${dateStr}-summary.json`);

  // Initialize empty summary structure
  let summary = getEmptySummary();

  // Load existing summary if it exists
  if (fs.existsSync(summaryPath)) {
    try {
      const fileContent = fs.readFileSync(summaryPath, 'utf8');
      const existing = JSON.parse(fileContent);
      summary = {
        ...summary,
        ...existing,
        uniqueFingerprints: existing.uniqueFingerprints || []
      };
    } catch (error) {
      console.warn('Failed to parse summary file:', error);
    }
  }

  // Get recent errors from today's log files
  const recentErrors = await getRecentErrors(dateStr, 10);
  summary.recent = recentErrors;

  // Calculate additional metrics
  summary.errorRate = calculateErrorRate(summary);
  summary.criticalityScore = calculateCriticalityScore(summary);

  return summary;
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
    uniqueFingerprints: [],
    firstError: null,
    lastError: null,
    recent: [],
    errorRate: 0,
    criticalityScore: 0
  };
}

async function getRecentErrors(dateStr, limit = 10) {
  const recentErrors = [];

  try {
    // Check all severity levels for today
    const severities = ['critical', 'high', 'medium', 'low', 'unknown'];

    for (const severity of severities) {
      const logFileName = `${dateStr}-${severity}.json`;
      const logFilePath = path.join(ERROR_LOG_DIR, logFileName);

      if (fs.existsSync(logFilePath)) {
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        const lines = logContent.trim().split('\n').filter(line => line.trim());

        // Get last few entries from each file
        const recentLines = lines.slice(-5);

        for (const line of recentLines) {
          try {
            const errorEntry = JSON.parse(line);
            recentErrors.push({
              id: errorEntry.id,
              type: errorEntry.type,
              message: errorEntry.message,
              severity: errorEntry.severity || severity,
              timestamp: errorEntry.timestamp,
              fingerprint: errorEntry.fingerprint
            });
          } catch (parseError) {
            console.warn('Failed to parse error line:', parseError);
          }
        }
      }
    }

    // Sort by timestamp (most recent first) and limit
    recentErrors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return recentErrors.slice(0, limit);

  } catch (error) {
    console.warn('Failed to get recent errors:', error);
    return [];
  }
}

function calculateErrorRate(summary) {
  // Calculate errors per hour based on time span
  if (!summary.firstError || !summary.lastError) {
    return 0;
  }

  const firstTime = new Date(summary.firstError);
  const lastTime = new Date(summary.lastError);
  const hoursDiff = (lastTime - firstTime) / (1000 * 60 * 60);

  if (hoursDiff <= 0) {
    return summary.total;
  }

  return Math.round((summary.total / hoursDiff) * 10) / 10; // Round to 1 decimal
}

function calculateCriticalityScore(summary) {
  // Weighted score based on severity
  const weights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
    unknown: 1
  };

  let score = 0;
  Object.entries(summary.errorsBySeverity).forEach(([severity, count]) => {
    score += count * (weights[severity] || 1);
  });

  return score;
}