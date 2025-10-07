import { logAnalyticsEvents, getMonitoringDb } from '../../lib/monitoring/databaseLogger.js';

// Force Node.js runtime for Vercel
export const config = {
  runtime: 'nodejs'
};

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        })),
        { sessionId, userId }
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
}

function resolveDateRange(startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getAnalyticsSummary({ startDate, endDate } = {}) {
  const db = await getMonitoringDb();
  if (!db) {
    return null;
  }

  const { start, end } = resolveDateRange(startDate, endDate);

  const summaryQuery = `
    SELECT
      COUNT(*) AS total_events,
      COUNT(DISTINCT session_id) AS unique_sessions,
      COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_users,
      COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
      COUNT(*) FILTER (WHERE event_type = 'performance_metric') AS performance_events
    FROM analytics_events
    WHERE occurred_at BETWEEN $1 AND $2;
  `;

  const eventsByTypeQuery = `
    SELECT event_type, COUNT(*)
    FROM analytics_events
    WHERE occurred_at BETWEEN $1 AND $2
    GROUP BY event_type
    ORDER BY COUNT(*) DESC
    LIMIT 50;
  `;

  const [summaryResult, typeResult] = await Promise.all([
    db.query(summaryQuery, [start, end]),
    db.query(eventsByTypeQuery, [start, end])
  ]);

  const summaryRow = summaryResult.rows[0];

  return {
    range: { start: start.toISOString(), end: end.toISOString() },
    totals: {
      totalEvents: parseInt(summaryRow.total_events, 10),
      uniqueSessions: parseInt(summaryRow.unique_sessions, 10),
      uniqueUsers: parseInt(summaryRow.unique_users, 10),
      pageViews: parseInt(summaryRow.page_views, 10),
      performanceEvents: parseInt(summaryRow.performance_events, 10)
    },
    eventsByType: typeResult.rows.map((row) => ({
      type: row.event_type,
      count: parseInt(row.count, 10)
    }))
  };
}

export async function getEventsByType(eventType, startDate, endDate) {
  const db = await getMonitoringDb();
  if (!db) {
    return [];
  }

  const { start, end } = resolveDateRange(startDate, endDate);

  const query = `
    SELECT session_id, event_type, data, occurred_at, user_id, url
    FROM analytics_events
    WHERE event_type = $1
      AND occurred_at BETWEEN $2 AND $3
    ORDER BY occurred_at DESC
    LIMIT 1000;
  `;

  const result = await db.query(query, [eventType, start, end]);
  return result.rows;
}
