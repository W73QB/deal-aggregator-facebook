/**
 * Robots.txt Serverless Function
 * Serves robots.txt with proper content-type
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Set proper text headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    
    // Read robots.txt file
    const filePath = path.join(process.cwd(), 'robots.txt');
    const robotsContent = fs.readFileSync(filePath, 'utf8');
    
    // Return the robots.txt content
    res.status(200).send(robotsContent);
    
  } catch (error) {
    console.error('Error serving robots.txt:', error);
    res.status(404).send('User-agent: *\nDisallow: /');
  }
};