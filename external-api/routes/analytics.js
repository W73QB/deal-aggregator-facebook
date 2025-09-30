// Analytics API Router
// Converted from pages/api/analytics.js

const express = require('express');
const router = express.Router();
const db = require('../lib/db');

const MAX_EVENTS_PER_REQUEST = 500;

function validateEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error('Events payload must be an array');
  }

  if (events.length > MAX_EVENTS_PER_REQUEST) {
    throw new Error(`Too many events. Maximum ${MAX_EVENTS_PER_REQUEST} per request`);
  }
}

function sanitizeEventForStorage(event, defaults) {
  const type = event.type;
  if (!type) {
    return null;
  }

  const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();
  const url = event.url || defaults.url;

  const data = {
    ...(event.data || {}),
    serverReceivedAt: new Date().toISOString()
  };

  return {
    sessionId: event.sessionId || defaults.sessionId || null,
    userId: event.userId ?? defaults.userId ?? null,
    type,
    data,
    timestamp,
    url
  };
}

async function logAnalyticsEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return;
  }

  if (!db.isConfigured()) {
    console.warn('Database not configured - analytics events will not be persisted');
    return;
  }

  try {
    // Build batch insert query
    const values = [];
    const params = [];
    let paramIndex = 1;

    events.forEach((event) => {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
      params.push(
        event.sessionId,
        event.type,
        JSON.stringify(event.data),
        event.timestamp,
        event.userId,
        event.url
      );
      paramIndex += 6;
    });

    const query = `
      INSERT INTO analytics_events (session_id, event_type, data, occurred_at, user_id, url)
      VALUES ${values.join(', ')}
    `;

    await db.query(query, params);
  } catch (error) {
    console.error('Failed to log analytics events:', error.message);
    throw error;
  }
}

// POST /api/analytics
router.post('/', async (req, res) => {
  try {
    const { sessionId, userId, events } = req.body || {};

    if (!events) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    validateEvents(events);

    const defaults = {
      sessionId,
      userId,
      url: req.headers.referer || null
    };

    const sanitizedEvents = events
      .map((event) => sanitizeEventForStorage(event, defaults))
      .filter(Boolean);

    if (sanitizedEvents.length === 0) {
      return res.status(200).json({ message: 'No valid events to process', count: 0 });
    }

    try {
      await logAnalyticsEvents(
        sanitizedEvents.map((event) => ({
          sessionId: event.sessionId,
          type: event.type,
          data: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
          url: event.url
        }))
      );

      return res.status(200).json({
        message: 'Events processed successfully',
        count: sanitizedEvents.length,
        sessionId: sessionId || sanitizedEvents[0].sessionId || null
      });
    } catch (storageError) {
      console.warn('Analytics logging failed, responding in degrade mode:', storageError);

      return res.status(202).json({
        message: 'Events received but deferred due to logging issue',
        count: sanitizedEvents.length,
        sessionId: sessionId || sanitizedEvents[0].sessionId || null
      });
    }
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;