// Errors API Router
// Converted from pages/api/errors.js

const express = require('express');
const router = express.Router();
const db = require('../lib/db');

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

async function logErrorEvents(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return;
  }

  if (!db.isConfigured()) {
    console.warn('Database not configured - error events will not be persisted');
    return;
  }

  try {
    // Build batch insert query
    const values = [];
    const params = [];
    let paramIndex = 1;

    errors.forEach((error) => {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`);
      params.push(
        error.fingerprint,
        error.message,
        error.stack,
        error.severity,
        new Date(error.timestamp),
        error.type,
        JSON.stringify(error.context)
      );
      paramIndex += 7;
    });

    const query = `
      INSERT INTO error_logs (fingerprint, message, stack, severity, occurred_at, error_type, context)
      VALUES ${values.join(', ')}
    `;

    await db.query(query, params);
  } catch (error) {
    console.error('Failed to log error events:', error.message);
    throw error;
  }
}

async function logSingleError(error) {
  await logErrorEvents([error]);
}

// POST /api/errors
router.post('/', async (req, res) => {
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
});

module.exports = router;