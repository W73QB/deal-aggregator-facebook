/**
 * reCAPTCHA Verification API Endpoint - DealRadarUS
 * Server-side verification for form spam protection
 */

const RecaptchaVerifier = require('../recaptcha-verifier');

class RecaptchaAPI {
  constructor() {
    this.verifier = new RecaptchaVerifier();
  }

  /**
   * Handle reCAPTCHA verification request
   */
  async handleVerification(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }));
      return;
    }

    try {
      // Parse request body
      const body = await this.parseRequestBody(req);
      const { token, formType } = body;

      // Validate input
      if (!token || typeof token !== 'string' || token.trim() === '') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'reCAPTCHA token is required'
        }));
        return;
      }

      // Get client IP
      const clientIP = this.getClientIP(req);

      // Verify token
      const verificationResult = await this.verifier.verifyToken(
        token.trim(),
        clientIP,
        formType || 'unknown'
      );

      // Return result
      const statusCode = verificationResult.success ? 200 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(verificationResult));

    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }));
    }
  }

  /**
   * Parse request body from stream
   */
  parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Invalid JSON body'));
        }
      });
      
      req.on('error', error => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * Extract client IP address
   */
  getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const real = req.headers['x-real-ip'];
    const cloudflare = req.headers['cf-connecting-ip'];
    
    if (cloudflare) {
      return cloudflare.split(',')[0].trim();
    }
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return real;
    }
    
    return req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');
  }

  /**
   * Get verification statistics
   */
  async handleStats(req, res) {
    // Only allow GET requests for stats
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Method not allowed'
      }));
      return;
    }

    try {
      const stats = this.verifier.getStats();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        stats: stats
      }));
    } catch (error) {
      console.error('Stats error:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Failed to get stats'
      }));
    }
  }
}

// Create API instance
const recaptchaAPI = new RecaptchaAPI();

// Export handler functions for different frameworks
module.exports = {
  // For Node.js HTTP server
  verifyHandler: (req, res) => recaptchaAPI.handleVerification(req, res),
  statsHandler: (req, res) => recaptchaAPI.handleStats(req, res),
  
  // For Express.js
  expressVerify: (req, res) => {
    // Convert Express request to Node.js format
    const nodeReq = {
      method: req.method,
      headers: req.headers,
      connection: req.connection,
      socket: req.socket,
      on: (event, callback) => {
        if (event === 'data' || event === 'end') {
          // Data already parsed by Express
          if (event === 'end') {
            setTimeout(() => callback(), 0);
          }
        }
      }
    };
    
    // Mock parsed body for Express
    const originalParseBody = recaptchaAPI.parseRequestBody;
    recaptchaAPI.parseRequestBody = async () => req.body;
    
    const result = recaptchaAPI.handleVerification(nodeReq, res);
    
    // Restore original method
    recaptchaAPI.parseRequestBody = originalParseBody;
    
    return result;
  },
  
  // Raw API class
  RecaptchaAPI,
  
  // Verifier instance
  verifier: recaptchaAPI.verifier
};