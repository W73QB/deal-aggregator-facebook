// Auth Me API Router
// Converted from pages/api/auth/me.js

const express = require('express');
const router = express.Router();

// GET /api/auth/me
router.get('/', async (req, res) => {
  try {
    // For now, return a basic response to prevent frontend errors
    // TODO: Implement proper JWT validation when auth system is fully integrated
    res.status(200).json({
      success: true,
      user: null,
      authenticated: false,
      message: 'Authentication service available'
    });

  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication service temporarily unavailable'
    });
  }
});

module.exports = router;