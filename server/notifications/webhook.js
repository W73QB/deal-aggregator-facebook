/**
 * M3.6 Webhook Notification Service
 * Handles webhook delivery with signatures and retry logic
 */

const crypto = require('crypto');
const { logger } = require('../monitoring/logger');
const { businessMetrics } = require('../monitoring/metrics');

class WebhookService {
  constructor() {
    this.maxRetries = parseInt(process.env.ALERT_RETRY_MAX || '5');
    this.baseBackoffMs = parseInt(process.env.ALERT_RETRY_BACKOFF_MS || '30000');
    this.secret = process.env.WEBHOOK_SIGNATURE_SECRET;
  }

  /**
   * Send webhook notification
   */
  async send(userId, template, payload) {
    try {
      // Get user webhook endpoints
      const endpoints = await this.getUserWebhookEndpoints(userId);
      if (endpoints.length === 0) {
        throw new Error('No active webhook endpoints found for user');
      }

      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const result = await this.sendToEndpoint(endpoint, template, payload);
          results.push({ endpointId: endpoint.id, ...result });
        } catch (error) {
          logger.error('Webhook endpoint delivery failed', {
            userId,
            endpointId: endpoint.id,
            url: endpoint.url,
            error: error.message
          });
          results.push({ 
            endpointId: endpoint.id, 
            status: 'failed', 
            error: error.message 
          });
        }
      }

      // Consider successful if at least one endpoint succeeded
      const successful = results.filter(r => r.status === 'sent');
      if (successful.length === 0) {
        throw new Error('All webhook endpoints failed');
      }

      logger.info('Webhook notification sent', {
        userId,
        template,
        successful: successful.length,
        total: results.length
      });

      return {
        status: 'sent',
        messageId: `webhook_${Date.now()}_${userId}`,
        results,
        successfulDeliveries: successful.length
      };

    } catch (error) {
      logger.error('Webhook notification failed', {
        userId,
        template,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send to specific webhook endpoint
   */
  async sendToEndpoint(endpoint, template, payload) {
    const webhookPayload = {
      event: `notification.${template}`,
      user_id: endpoint.user_id,
      timestamp: new Date().toISOString(),
      payload: payload,
      version: '1.0'
    };

    const body = JSON.stringify(webhookPayload);
    const signature = this.generateSignature(body, endpoint.secret || this.secret);
    const idempotencyKey = crypto.randomUUID();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DealRadarUS-Webhooks/1.0',
        'X-Signature': signature,
        'X-Webhook-Event': webhookPayload.event,
        'X-Webhook-Timestamp': webhookPayload.timestamp,
        'X-Idempotency-Key': idempotencyKey,
        'X-Webhook-Version': '1.0'
      },
      body: body,
      timeout: 30000 // 30 second timeout
    };

    let attempt = 0;
    let lastError = null;

    while (attempt < this.maxRetries) {
      try {
        // Import fetch dynamically for Node.js compatibility
        let fetch;
        if (typeof globalThis.fetch === 'undefined') {
          const { default: nodeFetch } = await import('node-fetch');
          fetch = nodeFetch;
        } else {
          fetch = globalThis.fetch;
        }

        const response = await fetch(endpoint.url, requestOptions);

        if (response.ok) {
          logger.info('Webhook delivered successfully', {
            endpointId: endpoint.id,
            url: endpoint.url,
            statusCode: response.status,
            attempt: attempt + 1,
            idempotencyKey
          });

          // Track successful webhook delivery
          businessMetrics.trackWebhookDelivery(response.status, attempt);

          return {
            status: 'sent',
            statusCode: response.status,
            attempts: attempt + 1,
            idempotencyKey
          };
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
          
          logger.warn('Webhook delivery failed, will retry', {
            endpointId: endpoint.id,
            url: endpoint.url,
            statusCode: response.status,
            attempt: attempt + 1,
            error: lastError.message
          });

          // Track failed webhook delivery
          businessMetrics.trackWebhookDelivery(response.status, attempt);
        }

      } catch (error) {
        lastError = error;
        
        logger.warn('Webhook delivery error, will retry', {
          endpointId: endpoint.id,
          url: endpoint.url,
          attempt: attempt + 1,
          error: error.message
        });
      }

      attempt++;
      
      if (attempt < this.maxRetries) {
        // Exponential backoff with jitter
        const backoffMs = this.baseBackoffMs * Math.pow(2, attempt - 1);
        const jitterMs = Math.random() * 1000; // Add up to 1 second jitter
        const delayMs = backoffMs + jitterMs;
        
        logger.debug('Webhook retry backoff', {
          endpointId: endpoint.id,
          attempt,
          delayMs,
          nextAttempt: attempt + 1
        });

        await this.sleep(delayMs);
      }
    }

    throw lastError || new Error('Webhook delivery failed after all retries');
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload, secret) {
    if (!secret) {
      logger.warn('Webhook signature secret not configured');
      return 'unsigned';
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Get user's active webhook endpoints
   */
  async getUserWebhookEndpoints(userId) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      const query = `
        SELECT id, user_id, url, secret, active 
        FROM webhook_endpoints 
        WHERE user_id = $1 AND active = true
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get user webhook endpoints', { 
        userId, 
        error: error.message 
      });
      return [];
    } finally {
      await pool.end();
    }
  }

  /**
   * Verify webhook signature (for incoming webhooks)
   */
  verifySignature(payload, signature, secret = null) {
    const webhookSecret = secret || this.secret;
    if (!webhookSecret || signature === 'unsigned') {
      return true; // Allow unsigned webhooks in development
    }

    try {
      const expectedSignature = this.generateSignature(payload, webhookSecret);
      
      // Use crypto.timingSafeEqual for secure comparison
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);
      
      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    } catch (error) {
      logger.error('Signature verification error', { error: error.message });
      return false;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testEndpoint(endpointId, userId) {
    try {
      const endpoints = await this.getUserWebhookEndpoints(userId);
      const endpoint = endpoints.find(e => e.id === endpointId);
      
      if (!endpoint) {
        throw new Error('Webhook endpoint not found');
      }

      const testPayload = {
        type: 'test',
        message: 'This is a test webhook from DealRadarUS',
        timestamp: new Date().toISOString(),
        deals: [{
          id: 'test-deal-123',
          title: 'Test Deal',
          price: 29.99,
          original_price: 49.99,
          url: `${process.env.FRONTEND_BASE_URL}/deals/test-deal-123`
        }]
      };

      const result = await this.sendToEndpoint(endpoint, 'test', testPayload);
      
      logger.info('Webhook test completed', {
        endpointId,
        userId,
        result
      });

      return result;

    } catch (error) {
      logger.error('Webhook test failed', {
        endpointId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add webhook endpoint for user
   */
  async addEndpoint(userId, url, secret = null) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      // Validate URL
      if (!this.isValidWebhookUrl(url)) {
        throw new Error('Invalid webhook URL');
      }

      const query = `
        INSERT INTO webhook_endpoints (user_id, url, secret, active)
        VALUES ($1, $2, $3, true)
        RETURNING id, created_at
      `;

      const result = await pool.query(query, [userId, url, secret]);
      const endpointId = result.rows[0].id;

      logger.info('Webhook endpoint added', {
        endpointId,
        userId,
        url
      });

      // Test the endpoint
      try {
        await this.testEndpoint(endpointId, userId);
        logger.info('New webhook endpoint test successful', { endpointId });
      } catch (error) {
        logger.warn('New webhook endpoint test failed', { 
          endpointId, 
          error: error.message 
        });
      }

      return {
        id: endpointId,
        url,
        active: true,
        created_at: result.rows[0].created_at
      };

    } catch (error) {
      logger.error('Failed to add webhook endpoint', {
        userId,
        url,
        error: error.message
      });
      throw error;
    } finally {
      await pool.end();
    }
  }

  /**
   * Validate webhook URL
   */
  isValidWebhookUrl(url) {
    try {
      const parsed = new URL(url);
      
      // Must be HTTPS in production
      if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
        return false;
      }

      // Allow HTTP in development
      if (process.env.NODE_ENV === 'development' && 
          !['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      // Block localhost and private IPs in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsed.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname.startsWith('127.') || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')) {
          return false;
        }
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Sleep utility for backoff
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get webhook delivery statistics
   */
  async getDeliveryStats(userId, hours = 24) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count,
          AVG(attempts) as avg_attempts
        FROM notifications 
        WHERE user_id = $1 
        AND channel = 'webhook'
        AND created_at > NOW() - INTERVAL '${hours} hours'
        GROUP BY status
        ORDER BY count DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get webhook delivery stats', {
        userId,
        error: error.message
      });
      return [];
    } finally {
      await pool.end();
    }
  }
}

module.exports = { WebhookService };