/**
 * Sitemap.xml Serverless Function
 * Serves sitemap.xml with proper content-type
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Set proper XML headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    
    // Read sitemap.xml file
    const filePath = path.join(process.cwd(), 'sitemap.xml');
    const sitemapContent = fs.readFileSync(filePath, 'utf8');
    
    // Return the sitemap.xml content
    res.status(200).send(sitemapContent);
    
  } catch (error) {
    console.error('Error serving sitemap.xml:', error);
    res.status(404).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
};