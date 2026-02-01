/**
 * M3.6 Email Notification Service
 * Handles email delivery with templates and retry logic
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { logger } = require('../monitoring/logger');
const { businessMetrics } = require('../monitoring/metrics');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create email transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 10    // 10 emails per second max
      });

      // Verify connection
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');

      // Register Handlebars helpers
      this.registerHelpers();

      // Load email templates
      await this.loadTemplates();

      this.isInitialized = true;
      logger.info('Email service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
      throw error;
    }
  }

  /**
   * Register Handlebars helpers
   */
  registerHelpers() {
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    handlebars.registerHelper('subtract', function(a, b) {
      return a - b;
    });

    handlebars.registerHelper('unless', function(conditional, options) {
      if (!conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    logger.debug('Handlebars helpers registered');
  }

  /**
   * Load and compile email templates
   */
  async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    
    try {
      // Ensure templates directory exists
      await fs.mkdir(templatesDir, { recursive: true });

      const templateFiles = [
        'deal-immediate.hbs',
        'deal-digest.hbs', 
        'generic-error.hbs'
      ];

      for (const templateFile of templateFiles) {
        const templatePath = path.join(templatesDir, templateFile);
        
        try {
          const templateContent = await fs.readFile(templatePath, 'utf8');
          const compiled = handlebars.compile(templateContent);
          const templateName = path.basename(templateFile, '.hbs');
          
          this.templates.set(templateName, compiled);
          logger.debug('Email template loaded', { template: templateName });
        } catch (error) {
          if (error.code === 'ENOENT') {
            logger.warn('Email template not found, will create default', { 
              template: templateFile 
            });
            await this.createDefaultTemplate(templatePath, templateFile);
            
            // Retry loading
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const compiled = handlebars.compile(templateContent);
            const templateName = path.basename(templateFile, '.hbs');
            this.templates.set(templateName, compiled);
          } else {
            throw error;
          }
        }
      }

      logger.info('Email templates loaded', { 
        count: this.templates.size,
        templates: Array.from(this.templates.keys())
      });

    } catch (error) {
      logger.error('Failed to load email templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Create default email template
   */
  async createDefaultTemplate(templatePath, templateFile) {
    let templateContent = '';

    switch (templateFile) {
      case 'deal-immediate.hbs':
        templateContent = this.getImmediateDealTemplate();
        break;
      case 'deal-digest.hbs':
        templateContent = this.getDigestTemplate();
        break;
      case 'generic-error.hbs':
        templateContent = this.getErrorTemplate();
        break;
      default:
        templateContent = this.getGenericTemplate();
    }

    await fs.writeFile(templatePath, templateContent, 'utf8');
    logger.info('Created default email template', { template: templateFile });
  }

  /**
   * Send email notification
   */
  async send(userId, template, payload) {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    const startTime = Date.now();

    try {
      // Get user email
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Get compiled template
      const compiledTemplate = this.templates.get(template);
      if (!compiledTemplate) {
        throw new Error(`Email template not found: ${template}`);
      }

      // Prepare template context
      const context = {
        ...payload,
        user_email: userEmail,
        frontend_base_url: process.env.FRONTEND_BASE_URL,
        manage_prefs_url: `${process.env.FRONTEND_BASE_URL}/settings/notifications`,
        unsubscribe_url: `${process.env.FRONTEND_BASE_URL}/unsubscribe?token=${this.generateUnsubscribeToken(userId)}`,
        current_year: new Date().getFullYear(),
        email_from: process.env.EMAIL_FROM
      };

      // Render email content
      const htmlContent = compiledTemplate(context);

      // Prepare email options
      const mailOptions = {
        from: {
          name: 'DealRadarUS Alerts',
          address: process.env.EMAIL_FROM || process.env.SMTP_USER
        },
        to: userEmail,
        subject: this.generateSubject(template, payload),
        html: htmlContent,
        text: this.htmlToText(htmlContent),
        headers: {
          'X-Template': template,
          'X-User-ID': userId,
          'X-Notification-ID': payload.notificationId || 'unknown'
        }
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      const duration = Date.now() - startTime;

      logger.info('Email sent successfully', {
        userId,
        template,
        messageId: result.messageId,
        recipient: userEmail,
        subject: mailOptions.subject,
        duration
      });

      // Track metrics
      businessMetrics.trackNotification('email', template, 'sent', 'normal', duration);
      businessMetrics.trackEmailTemplate(template, 'sent');

      return {
        status: 'sent',
        messageId: result.messageId,
        recipient: userEmail
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Failed to send email', {
        userId,
        template,
        error: error.message,
        duration
      });

      // Track metrics
      businessMetrics.trackNotification('email', template, 'failed', 'normal', duration);
      businessMetrics.trackEmailTemplate(template, 'failed');
      businessMetrics.trackError('email_delivery', 'error', 'email_service');

      throw error;
    }
  }

  /**
   * Get user email from database
   */
  async getUserEmail(userId) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      const query = 'SELECT email FROM users WHERE id = $1';
      const result = await pool.query(query, [userId]);
      
      return result.rows.length > 0 ? result.rows[0].email : null;

    } catch (error) {
      logger.error('Failed to get user email', { userId, error: error.message });
      return null;
    } finally {
      await pool.end();
    }
  }

  /**
   * Generate email subject
   */
  generateSubject(template, payload) {
    const prefix = process.env.EMAIL_SUBJECT_PREFIX || '[DealRadarUS]';
    
    switch (template) {
      case 'deal-immediate': {
        const dealCount = payload.deals?.length || 0;
        return `${prefix} ${dealCount} New Deal${dealCount !== 1 ? 's' : ''} Found!`;
      }
        
      case 'deal-digest': {
        const totalDeals = payload.totalDeals || 0;
        return `${prefix} Your Daily Deals Digest - ${totalDeals} Deals`;
      }
        
      case 'generic-error':
        return `${prefix} Notification Delivery Issue`;
        
      default:
        return `${prefix} Notification`;
    }
  }

  /**
   * Generate unsubscribe token
   */
  generateUnsubscribeToken(userId) {
    const crypto = require('crypto');
    const data = `${userId}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Template: Immediate deal alert
   */
  getImmediateDealTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; }
        .deal { background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin: 15px 0; padding: 15px; }
        .deal-title { font-weight: bold; color: #1e40af; margin-bottom: 8px; }
        .deal-price { color: #dc2626; font-size: 1.2em; font-weight: bold; }
        .deal-savings { color: #059669; margin-left: 10px; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .footer a { color: #93c5fd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 New Deals Alert!</h1>
        <p>We found {{deals.length}} deal{{#if deals.length}}{{#unless (eq deals.length 1)}}s{{/unless}}{{/if}} matching your criteria</p>
    </div>
    
    <div class="content">
        {{#each deals}}
        <div class="deal">
            <div class="deal-title">{{title}}</div>
            <div class="deal-price">
                ${'{{price}}'}
                {{#if originalPrice}}
                <span class="deal-savings">Save ${'{{subtract originalPrice price}}'}</span>
                {{/if}}
            </div>
            {{#if description}}
            <p>{{description}}</p>
            {{/if}}
            <a href="{{url}}" class="cta-button">View Deal</a>
        </div>
        {{/each}}
    </div>
    
    <div class="footer">
        <p>🔔 You're receiving this because you have active deal alerts.</p>
        <p><a href="{{manage_prefs_url}}">Manage Preferences</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        <p>&copy; {{current_year}} DealRadarUS. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Template: Daily digest
   */
  getDigestTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Deals Digest</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .summary { background: #f1f5f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .content { background: #f8fafc; padding: 20px; }
        .category { margin: 25px 0; }
        .category-title { background: #e2e8f0; padding: 10px; border-radius: 6px; font-weight: bold; color: #1e40af; }
        .deal { background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin: 10px 0; padding: 15px; }
        .deal-title { font-weight: bold; color: #1e40af; margin-bottom: 5px; }
        .deal-price { color: #dc2626; font-size: 1.1em; font-weight: bold; }
        .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .footer a { color: #93c5fd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Your Daily Deals Digest</h1>
        <p>{{date}} • {{totalDeals}} deals found across {{categories.length}} categories</p>
    </div>
    
    <div class="summary">
        <strong>Today's Highlights:</strong> 
        Best saving: ${'{{bestSaving}}'} • Average discount: {{avgDiscount}}% • Top category: {{topCategory}}
    </div>
    
    <div class="content">
        {{#each categories}}
        <div class="category">
            <div class="category-title">{{name}} ({{deals.length}} deals)</div>
            {{#each deals}}
            <div class="deal">
                <div class="deal-title">{{title}}</div>
                <div class="deal-price">${'{{price}}'}</div>
            </div>
            {{/each}}
        </div>
        {{/each}}
    </div>
    
    <div class="footer">
        <p>📧 Daily digest delivered every morning at 9 AM</p>
        <p><a href="{{manage_prefs_url}}">Manage Preferences</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        <p>&copy; {{current_year}} DealRadarUS. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Template: Error notification
   */
  getErrorTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Issue</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #fef2f2; padding: 20px; border: 1px solid #fecaca; }
        .error-details { background: white; border: 1px solid #f87171; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .footer a { color: #93c5fd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ Notification Delivery Issue</h1>
        <p>There was a problem delivering your deal alerts</p>
    </div>
    
    <div class="content">
        <p>We encountered an issue while trying to send your deal notifications. Our team has been notified and is working to resolve this.</p>
        
        {{#if errorDetails}}
        <div class="error-details">
            <strong>Technical Details:</strong><br>
            {{errorDetails}}
        </div>
        {{/if}}
        
        <p><strong>What happens next?</strong></p>
        <ul>
            <li>We'll automatically retry delivery</li>
            <li>You'll receive your alerts once the issue is resolved</li>
            <li>No action is required on your part</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>🛠️ For support, contact us at: support@dealradarus.com</p>
        <p><a href="{{manage_prefs_url}}">Manage Preferences</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        <p>&copy; {{current_year}} DealRadarUS. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generic template fallback
   */
  getGenericTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DealRadarUS Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; }
        .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .footer a { color: #93c5fd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DealRadarUS</h1>
        <p>{{subject}}</p>
    </div>
    
    <div class="content">
        {{#if message}}
        <p>{{message}}</p>
        {{else}}
        <p>This is a notification from DealRadarUS.</p>
        {{/if}}
    </div>
    
    <div class="footer">
        <p><a href="{{manage_prefs_url}}">Manage Preferences</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        <p>&copy; {{current_year}} DealRadarUS. All rights reserved.</p>
    </div>
</body>
</html>`;
  }
}

module.exports = { EmailService };
