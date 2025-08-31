/**
 * reCAPTCHA Server Integration - DealRadarUS
 * Simple HTTP server for reCAPTCHA verification
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs').promises;
const { verifyHandler, statsHandler } = require('./api/verify-recaptcha');

class RecaptchaServer {
  constructor(port = 3003) {
    this.port = port;
    this.server = null;
  }

  /**
   * Start the server
   */
  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`🔒 reCAPTCHA Server running on http://localhost:${this.port}`);
      console.log('📋 Available endpoints:');
      console.log('  POST /api/verify-recaptcha - Verify reCAPTCHA tokens');
      console.log('  GET  /api/recaptcha-stats  - Get verification statistics');
      console.log('  GET  /config/recaptcha-config.json - Get client configuration');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
  }

  /**
   * Handle incoming requests
   */
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
      // Add security headers
      this.addSecurityHeaders(res);

      // Route requests
      if (pathname === '/api/verify-recaptcha') {
        await verifyHandler(req, res);
      } 
      else if (pathname === '/api/recaptcha-stats') {
        await statsHandler(req, res);
      }
      else if (pathname === '/config/recaptcha-config.json') {
        await this.serveConfig(req, res);
      }
      else if (pathname === '/') {
        await this.serveHomepage(req, res);
      }
      else {
        this.send404(res);
      }
    } catch (error) {
      console.error('Request handling error:', error);
      this.send500(res);
    }
  }

  /**
   * Add security headers
   */
  addSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; frame-src https://www.google.com;");
  }

  /**
   * Serve reCAPTCHA configuration (with sanitized keys)
   */
  async serveConfig(req, res) {
    try {
      const configPath = path.join(__dirname, '../config/recaptcha-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Remove secret key for client-side config
      const clientConfig = {
        ...config,
        recaptcha: {
          ...config.recaptcha,
          secretKey: undefined // Remove secret key
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(clientConfig, null, 2));
    } catch (error) {
      console.error('Config serve error:', error);
      this.send500(res);
    }
  }

  /**
   * Serve simple homepage with testing interface
   */
  async serveHomepage(req, res) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>reCAPTCHA Server - DealRadarUS</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .endpoint { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
            .method { display: inline-block; padding: 4px 8px; border-radius: 3px; font-weight: bold; color: white; margin-right: 10px; }
            .post { background: #4CAF50; }
            .get { background: #2196F3; }
            pre { background: #f9f9f9; padding: 10px; border-radius: 4px; overflow-x: auto; }
            .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔒 reCAPTCHA Server - DealRadarUS</h1>
            <p>Server Status: <strong>Running</strong> | Port: <strong>${this.port}</strong></p>
        </div>

        <div class="status success">
            ✅ reCAPTCHA verification server is running successfully!
        </div>

        <h2>📋 API Endpoints</h2>

        <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/verify-recaptcha</strong>
            <p>Verify reCAPTCHA tokens from client forms</p>
            <pre>{
  "token": "reCAPTCHA_response_token",
  "formType": "contact" // optional
}</pre>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/recaptcha-stats</strong>
            <p>Get verification statistics and server status</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/config/recaptcha-config.json</strong>
            <p>Get client-side configuration (secrets removed)</p>
        </div>

        <h2>🔧 Integration</h2>
        <p>Include the reCAPTCHA handler in your HTML pages:</p>
        <pre>&lt;script src="js/recaptcha-handler.js" defer&gt;&lt;/script&gt;</pre>

        <h2>📊 Server Features</h2>
        <ul>
            <li>✅ Google reCAPTCHA v2/v3 verification</li>
            <li>✅ Rate limiting protection</li>
            <li>✅ Suspicious IP blocking</li>
            <li>✅ Score-based validation</li>
            <li>✅ Form-specific configuration</li>
            <li>✅ Analytics integration</li>
            <li>✅ Security headers</li>
            <li>✅ Error handling & logging</li>
        </ul>
    </body>
    </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  /**
   * Send 404 response
   */
  send404(res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Not Found'
    }));
  }

  /**
   * Send 500 response
   */
  send500(res) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Internal Server Error'
    }));
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.server) {
      console.log('\n🛑 Shutting down reCAPTCHA server...');
      this.server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
    }
  }
}

// Auto-start if run directly
if (require.main === module) {
  const server = new RecaptchaServer(3003);
  server.start();
}

module.exports = RecaptchaServer;