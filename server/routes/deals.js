const express = require('express');
const router = express.Router();
const deals = require('../data/deals');

// @route   GET /api/deals
// @desc    Get all deals
// @access  Public
router.get('/', (req, res) => {
  // In a real app, you would fetch this from a database.
  // For now, we send the static data.
  res.json(deals);
});

module.exports = router;
