/**
 * Affiliate Disclosure Serverless Function
 * Serves affiliate-disclosure.html content with proper headers
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Set proper HTML headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Read affiliate-disclosure.html file
    const filePath = path.join(process.cwd(), 'pages', 'affiliate-disclosure.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Return the HTML content
    res.status(200).send(htmlContent);
    
  } catch (error) {
    console.error('Error serving affiliate disclosure:', error);
    res.status(404).json({
      error: 'Affiliate disclosure not found',
      message: 'The affiliate disclosure page is temporarily unavailable.'
    });
  }
};