// Newsletter API Router
// Converted from pages/api/newsletter.js

const express = require('express');
const router = express.Router();

// POST /api/newsletter
router.post('/', (req, res) => {
  const { email } = req.body;

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  // Simulate subscription process
  console.log(`Subscribing email: ${email}`);

  // In a real application, you would add the email to your database or mailing list service here.
  // For example:
  // - Store in database
  // - Send confirmation email
  // - Add to SendGrid/Mailchimp list

  // Simulate a delay
  setTimeout(() => {
    res.status(200).json({ message: `Thank you for subscribing, ${email}!` });
  }, 1000);
});

module.exports = router;