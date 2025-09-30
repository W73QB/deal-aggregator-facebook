/**
 * Simple Test API Endpoint
 * Converted from Next.js handler to Express router
 *
 * Original: pages/api/simple-test.js
 * Purpose: Minimal reproduction endpoint for testing
 */

const express = require('express');
const router = express.Router();

// GET /api/simple-test
router.get('/', (req, res) => {
  res.status(200).json({
    endpoint: '/api/simple-test',
    message: 'This should be simple-test response, not blog posts',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    source: 'external-api-server'
  });
});

module.exports = router;