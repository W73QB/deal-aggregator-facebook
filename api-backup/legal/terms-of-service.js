/**
 * Terms of Service Serverless Function  
 * Serves terms-of-service.html content with proper headers
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Set proper HTML headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Read terms-of-service.html file
    const filePath = path.join(process.cwd(), 'pages', 'terms-of-service.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Return the HTML content
    res.status(200).send(htmlContent);
    
  } catch (error) {
    console.error('Error serving terms of service:', error);
    res.status(404).json({
      error: 'Terms of service not found',
      message: 'The terms of service page is temporarily unavailable.'
    });
  }
};