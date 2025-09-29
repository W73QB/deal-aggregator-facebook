import { logErrorEvents, logSingleError } from '../../lib/monitoring/databaseLogger.js';

const MAX_ERRORS_PER_REQUEST = 100;

function sanitizeErrorPayload(payload = {}, req) {
  return {
    fingerprint: payload.fingerprint || null,
    message: payload.message || 'Unknown error',
    stack: payload.stack || null,
    severity: payload.severity || 'unknown',
    timestamp: payload.timestamp || new Date().toISOString(),
    type: payload.type || 'client_error',
    context: payload.context || {
      url: req.headers?.referer || null,
      userAgent: req.headers['user-agent'] || null
    }
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
    const { type, errors, sessionId, ...errorData } = req.body || {};

    if (!type) {
      return res.status(400).json({ error: 'Error type is required' });
    }

    if (type === 'batch_errors') {
      if (!Array.isArray(errors) || errors.length === 0) {
        return res.status(400).json({ error: 'Errors array is required for batch' });
      }

      if (errors.length > MAX_ERRORS_PER_REQUEST) {
        return res.status(400).json({
          error: `Too many errors. Maximum ${MAX_ERRORS_PER_REQUEST} per request`
        });
      }

      const sanitizedErrors = errors.map((error) => sanitizeErrorPayload({ ...error, type: error.type || errorData.type }, req));

      try {
        await logErrorEvents(sanitizedErrors);

        return res.status(200).json({
          message: `Processed ${sanitizedErrors.length} errors`,
          sessionId: sessionId || null
        });
      } catch (storageError) {
        console.warn('Error logging (batch) failed, responding in degrade mode:', storageError);

        return res.status(202).json({
          message: `Captured ${sanitizedErrors.length} errors but logging is delayed`,
          sessionId: sessionId || null
        });
      }
    }

    const sanitized = sanitizeErrorPayload({ ...errorData, type }, req);

    try {
      await logSingleError(sanitized);

      return res.status(200).json({
        message: 'Error logged successfully',
        timestamp: new Date().toISOString()
      });
    } catch (storageError) {
      console.warn('Error logging (single) failed, responding in degrade mode:', storageError);

      return res.status(202).json({
        message: 'Error received but logging deferred',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error processing error report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
