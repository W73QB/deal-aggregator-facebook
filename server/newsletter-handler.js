/**
 * Newsletter Handler - Backend Integration
 * Supports multiple newsletter services: Mailchimp, ConvertKit, EmailJS, Custom API
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');

class NewsletterHandler {
  constructor(configPath = '../config/newsletter-services.json') {
    this.config = null;
    this.service = null;
    this.rateLimitStore = new Map(); // In production, use Redis or database
    this.configPath = configPath;
  }

  async initialize(serviceName = 'emailjs') {
    try {
      const configContent = await fs.readFile(
        path.resolve(__dirname, this.configPath), 
        'utf8'
      );
      this.config = JSON.parse(configContent);
      
      if (!this.config.services[serviceName]) {
        throw new Error(`Service '${serviceName}' not found in configuration`);
      }
      
      this.service = this.config.services[serviceName];
      this.serviceName = serviceName;
      
      // Validate required environment variables
      this.validateEnvironmentVariables();
      
      console.log(`Newsletter handler initialized with service: ${serviceName}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize newsletter handler:', error.message);
      return false;
    }
  }

  validateEnvironmentVariables() {
    const missing = [];
    
    for (const envVar of this.service.config_required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
      console.warn('Newsletter service may not function properly');
    }
  }

  async handleSubscription(req, res) {
    try {
      // Extract data from request
      const { email, source = 'unknown' } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');

      // Validate request
      const validation = this.validateSubscriptionRequest(email, clientIP);
      if (!validation.valid) {
        return this.sendErrorResponse(res, 400, validation.error);
      }

      // Check rate limiting
      const rateLimitCheck = this.checkRateLimit(email, clientIP);
      if (!rateLimitCheck.allowed) {
        return this.sendErrorResponse(res, 429, 'rate_limited');
      }

      // Prepare subscription data
      const subscriptionData = {
        email: email.toLowerCase().trim(),
        source,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        referrer,
        ip: clientIP
      };

      // Submit to newsletter service
      const result = await this.submitToNewsletterService(subscriptionData);
      
      if (result.success) {
        // Update rate limiting
        this.updateRateLimit(email, clientIP, true);
        
        // Log successful subscription
        console.log(`Newsletter subscription successful: ${email} from ${source}`);
        
        return this.sendSuccessResponse(res, result.message);
      } else {
        // Update rate limiting for failed attempt
        this.updateRateLimit(email, clientIP, false);
        
        return this.sendErrorResponse(res, 400, result.error || 'unknown_error');
      }
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return this.sendErrorResponse(res, 500, 'service_unavailable');
    }
  }

  validateSubscriptionRequest(email, clientIP) {
    // Email validation
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'invalid_email' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Email format validation
    const emailRegex = new RegExp(this.config.validation.email_regex);
    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, error: 'invalid_email' };
    }

    // Email length validation
    if (trimmedEmail.length > this.config.validation.max_email_length) {
      return { valid: false, error: 'invalid_email' };
    }

    // Check blocked domains
    const domain = trimmedEmail.split('@')[1];
    if (this.config.validation.blocked_domains.includes(domain)) {
      return { valid: false, error: 'disposable_email' };
    }

    return { valid: true };
  }

  checkRateLimit(email, clientIP) {
    const now = Date.now();
    const windowMs = this.config.validation.rate_limiting.time_window_minutes * 60 * 1000;
    
    // Clean old entries
    this.cleanOldRateLimitEntries(now - windowMs);
    
    // Check email-based rate limiting
    const emailKey = `email:${email}`;
    const emailAttempts = this.rateLimitStore.get(emailKey) || [];
    const recentEmailAttempts = emailAttempts.filter(timestamp => timestamp > now - windowMs);
    
    if (recentEmailAttempts.length >= this.config.validation.rate_limiting.max_attempts_per_email) {
      return { allowed: false, reason: 'email_rate_limit' };
    }

    // Check IP-based rate limiting
    const ipKey = `ip:${clientIP}`;
    const ipAttempts = this.rateLimitStore.get(ipKey) || [];
    const recentIpAttempts = ipAttempts.filter(timestamp => timestamp > now - windowMs);
    
    if (recentIpAttempts.length >= this.config.validation.rate_limiting.max_attempts_per_ip) {
      return { allowed: false, reason: 'ip_rate_limit' };
    }

    return { allowed: true };
  }

  updateRateLimit(email, clientIP, success) {
    const now = Date.now();
    
    // Update email rate limit (always track attempts)
    const emailKey = `email:${email}`;
    const emailAttempts = this.rateLimitStore.get(emailKey) || [];
    emailAttempts.push(now);
    this.rateLimitStore.set(emailKey, emailAttempts);

    // Update IP rate limit (always track attempts)
    const ipKey = `ip:${clientIP}`;
    const ipAttempts = this.rateLimitStore.get(ipKey) || [];
    ipAttempts.push(now);
    this.rateLimitStore.set(ipKey, ipAttempts);
  }

  cleanOldRateLimitEntries(cutoffTime) {
    for (const [key, timestamps] of this.rateLimitStore.entries()) {
      const recent = timestamps.filter(timestamp => timestamp > cutoffTime);
      if (recent.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, recent);
      }
    }
  }

  async submitToNewsletterService(subscriptionData) {
    try {
      // Handle SMTP services separately
      if (this.service.method === 'SMTP') {
        return await this.handleSMTPService(subscriptionData);
      }

      const payload = this.buildServicePayload(subscriptionData);
      const headers = this.buildServiceHeaders();
      
      // Make HTTP request to service
      const response = await this.makeServiceRequest(
        this.service.endpoint,
        this.service.method,
        headers,
        payload
      );

      return this.parseServiceResponse(response);
      
    } catch (error) {
      console.error(`${this.serviceName} API error:`, error);
      return { 
        success: false, 
        error: 'service_unavailable',
        details: error.message 
      };
    }
  }

  async handleSMTPService(subscriptionData) {
    try {
      const SMTPHandler = require('./smtp-handler');
      const smtpHandler = new SMTPHandler();
      
      const initialized = await smtpHandler.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'smtp_init_failed',
          details: 'Failed to initialize SMTP handler'
        };
      }

      return await smtpHandler.handleSubscription(subscriptionData);
      
    } catch (error) {
      console.error('SMTP service error:', error);
      return {
        success: false,
        error: 'smtp_error',
        details: error.message
      };
    }
  }

  buildServicePayload(subscriptionData) {
    const template = this.service.payload_template;
    let payload = JSON.stringify(template);

    // Replace template variables
    const replacements = {
      '{email}': subscriptionData.email,
      '{source}': subscriptionData.source,
      '{timestamp}': subscriptionData.timestamp,
      '{user_agent}': subscriptionData.user_agent || '',
      '{referrer}': subscriptionData.referrer || '',
      '{api_key}': process.env[this.service.config_required.find(key => key.includes('API_KEY'))] || '',
      '{list_id}': process.env.MAILCHIMP_LIST_ID || '',
      '{form_id}': process.env.CONVERTKIT_FORM_ID || '',
      '{service_id}': process.env.EMAILJS_SERVICE_ID || '',
      '{template_id}': process.env.EMAILJS_TEMPLATE_ID || '',
      '{user_id}': process.env.EMAILJS_USER_ID || '',
      '{custom_endpoint}': process.env.CUSTOM_ENDPOINT || '',
      '{api_token}': process.env.CUSTOM_API_TOKEN || ''
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      payload = payload.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return JSON.parse(payload);
  }

  buildServiceHeaders() {
    const headers = { ...this.service.headers };
    
    // Replace header template variables
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string' && value.includes('{')) {
        if (value.includes('{api_key_base64}') && process.env.MAILCHIMP_API_KEY) {
          headers[key] = value.replace('{api_key_base64}', 
            Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64'));
        }
      }
    }

    return headers;
  }

  async makeServiceRequest(endpoint, method, headers, payload) {
    // Replace endpoint variables
    let finalEndpoint = endpoint;
    const replacements = {
      '{list_id}': process.env.MAILCHIMP_LIST_ID || '',
      '{form_id}': process.env.CONVERTKIT_FORM_ID || '',
      '{custom_endpoint}': process.env.CUSTOM_ENDPOINT || ''
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      finalEndpoint = finalEndpoint.replace(placeholder, value);
    }

    // Use native fetch or node-fetch for HTTP requests
    const fetch = globalThis.fetch || require('node-fetch');
    
    const response = await fetch(finalEndpoint, {
      method,
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  parseServiceResponse(response) {
    const { status, data } = response;

    // Success status codes
    if (status >= 200 && status < 300) {
      // Check for service-specific success indicators
      if (this.serviceName === 'mailchimp') {
        return {
          success: data.status === 'subscribed' || data.status === 'pending',
          message: data.status === 'pending' ? 
            'Please check your email to confirm subscription.' : 
            'Successfully subscribed!'
        };
      } else if (this.serviceName === 'convertkit') {
        return {
          success: data.subscription && data.subscription.state,
          message: 'Successfully subscribed! Check your email to confirm.'
        };
      } else if (this.serviceName === 'emailjs') {
        return {
          success: status === 200,
          message: 'Subscription request sent! We\'ll add you to our list.'
        };
      } else {
        return {
          success: true,
          message: 'Successfully subscribed!'
        };
      }
    }

    // Handle error responses
    if (status === 400 && data.title === 'Member Exists') {
      return {
        success: true,
        message: 'already_subscribed'
      };
    }

    return {
      success: false,
      error: 'service_error',
      details: data.detail || data.message || 'Unknown service error'
    };
  }

  sendSuccessResponse(res, message) {
    const responseMessage = this.config.responses.success[message] || 
                           this.config.responses.success.default;
    
    res.status(200).json({
      success: true,
      message: responseMessage
    });
  }

  sendErrorResponse(res, statusCode, errorType) {
    const errorMessage = this.config.responses.errors[errorType] || 
                        this.config.responses.errors.unknown_error;
    
    res.status(statusCode).json({
      success: false,
      error: errorType,
      message: errorMessage
    });
  }
}

// Express.js route example
function createNewsletterRoute(serviceName = 'emailjs') {
  const handler = new NewsletterHandler();
  
  return async (req, res) => {
    // Initialize handler if not already done
    if (!handler.service) {
      const initialized = await handler.initialize(serviceName);
      if (!initialized) {
        return handler.sendErrorResponse(res, 500, 'service_unavailable');
      }
    }
    
    await handler.handleSubscription(req, res);
  };
}

module.exports = {
  NewsletterHandler,
  createNewsletterRoute
};

// CLI testing
if (require.main === module) {
  const handler = new NewsletterHandler();
  
  handler.initialize('emailjs').then(success => {
    if (success) {
      console.log('Newsletter handler ready for testing');
      
      // Test validation
      const testEmail = 'test@example.com';
      const validation = handler.validateSubscriptionRequest(testEmail, '127.0.0.1');
      console.log('Validation test:', validation);
      
      // Test rate limiting
      const rateLimit = handler.checkRateLimit(testEmail, '127.0.0.1');
      console.log('Rate limit test:', rateLimit);
    } else {
      console.log('Newsletter handler initialization failed');
    }
  });
}