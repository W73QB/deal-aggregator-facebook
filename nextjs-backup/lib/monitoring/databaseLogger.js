/*
 * Centralized database logger for analytics and error tracking data.
 * Stores sanitized payloads inside dedicated monitoring tables.
 */

let cachedDb = null;

async function loadDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const moduleNamespace = await import('../../server/auth/utils/database.js');

    if (typeof moduleNamespace.getInstance === 'function') {
      cachedDb = moduleNamespace.getInstance();
    }

    if (!cachedDb) {
      const defaultExport = moduleNamespace.default;
      if (defaultExport?.query) {
        cachedDb = defaultExport;
      }
    }

    if (!cachedDb && typeof moduleNamespace.DatabaseConnection === 'function') {
      if (!global._dealAggregatorMonitoringDb) {
        global._dealAggregatorMonitoringDb = new moduleNamespace.DatabaseConnection();
      }
      cachedDb = global._dealAggregatorMonitoringDb;
    }

    if (!cachedDb?.query) {
      cachedDb = null;
    }
  } catch (error) {
    console.error('Failed to load monitoring database module:', error);
    cachedDb = null;
  }

  return cachedDb;
}

export async function getMonitoringDb() {
    return loadDatabase();
}

function buildBatchInsert(table, columns, rows) {
  const valueClauses = [];
  const parameters = [];
  let index = 1;

  rows.forEach((row) => {
    const placeholders = columns.map(() => `$${index++}`);
    valueClauses.push(`(${placeholders.join(', ')})`);
    parameters.push(...row);
  });

  const statement = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueClauses.join(', ')}`;
  return { statement, parameters };
}

export async function logAnalyticsEvents(events, metadata = {}) {
  if (!Array.isArray(events) || events.length === 0) {
    return;
  }

  const db = await loadDatabase();
  if (!db) {
    throw new Error('Analytics logger database unavailable');
  }

  const rows = events.map((event) => [
    event.sessionId || metadata.sessionId || null,
    event.type,
    event.data || {},
    event.timestamp ? new Date(event.timestamp) : new Date(),
    event.userId || metadata.userId || null,
    event.url || null
  ]);

  const { statement, parameters } = buildBatchInsert(
    'analytics_events',
    ['session_id', 'event_type', 'data', 'occurred_at', 'user_id', 'url'],
    rows
  );

  await db.query(statement, parameters);
}

export async function logErrorEvents(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return;
  }

  const db = await loadDatabase();
  if (!db) {
    throw new Error('Error logger database unavailable');
  }

  const rows = errors.map((error) => [
    error.fingerprint || null,
    error.message,
    error.stack || null,
    error.severity || 'unknown',
    error.timestamp ? new Date(error.timestamp) : new Date(),
    error.type || 'unknown',
    error.context || null
  ]);

  const { statement, parameters } = buildBatchInsert(
    'error_logs',
    ['fingerprint', 'message', 'stack', 'severity', 'occurred_at', 'error_type', 'context'],
    rows
  );

  await db.query(statement, parameters);
}

export async function logSingleError(error) {
  await logErrorEvents([error]);
}

export async function logSingleAnalyticsEvent(event, metadata = {}) {
  await logAnalyticsEvents([event], metadata);
}

export function resetLoggerCache() {
  cachedDb = null;
  if (global._dealAggregatorMonitoringDb) {
    delete global._dealAggregatorMonitoringDb;
  }
}

export default {
  logAnalyticsEvents,
  logErrorEvents,
  logSingleAnalyticsEvent,
  logSingleError,
  resetLoggerCache,
  getMonitoringDb
};
