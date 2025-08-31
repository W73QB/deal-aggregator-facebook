/**
 * SMTP Email Handler for Newsletter Subscriptions
 * Handles SMTP integration for services like Zoho, Gmail, etc.
 * Version: 1.0.0
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class SMTPHandler {
  constructor() {
    this.transporter = null;
    this.subscriberList = new Set(); // In production, use database
    this.subscriberFile = path.join(__dirname, '../data/subscribers.json');
  }

  async initialize() {
    try {
      // Validate required environment variables
      const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
      const missing = required.filter(env => !process.env[env]);
      
      if (missing.length > 0) {
        console.error('Missing SMTP environment variables:', missing);
        return false;
      }

      // Create nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // For self-signed certificates if needed
        }
      });

      // Test connection
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');

      // Load existing subscribers
      await this.loadSubscribers();

      return true;
    } catch (error) {
      console.error('SMTP Handler initialization failed:', error.message);
      return false;
    }
  }

  async loadSubscribers() {
    try {
      const data = await fs.readFile(this.subscriberFile, 'utf8');
      const subscribers = JSON.parse(data);
      this.subscriberList = new Set(subscribers.emails || []);
      console.log(`Loaded ${this.subscriberList.size} existing subscribers`);
    } catch (error) {
      // File doesn't exist or is empty - that's ok for first run
      console.log('No existing subscribers file found - starting fresh');
      this.subscriberList = new Set();
    }
  }

  async saveSubscribers() {
    try {
      const data = {
        emails: Array.from(this.subscriberList),
        last_updated: new Date().toISOString(),
        total_count: this.subscriberList.size
      };
      
      // Ensure data directory exists
      const dataDir = path.dirname(this.subscriberFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      await fs.writeFile(this.subscriberFile, JSON.stringify(data, null, 2));
      console.log(`Saved ${this.subscriberList.size} subscribers to file`);
    } catch (error) {
      console.error('Failed to save subscribers:', error.message);
    }
  }

  async handleSubscription(subscriptionData) {
    try {
      const { email, source, timestamp, user_agent, referrer } = subscriptionData;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if already subscribed
      if (this.subscriberList.has(normalizedEmail)) {
        return {
          success: true,
          message: 'already_subscribed',
          details: 'Email already in subscription list'
        };
      }

      // Add to subscriber list
      this.subscriberList.add(normalizedEmail);

      // Send notification email to admin
      const adminNotification = await this.sendAdminNotification({
        email: normalizedEmail,
        source,
        timestamp,
        user_agent,
        referrer
      });

      // Send welcome email to subscriber
      const welcomeEmail = await this.sendWelcomeEmail(normalizedEmail, source);

      // Save updated subscriber list
      await this.saveSubscribers();

      if (adminNotification.success && welcomeEmail.success) {
        return {
          success: true,
          message: 'Successfully subscribed! Check your email to confirm.',
          details: 'Both admin notification and welcome email sent'
        };
      } else {
        return {
          success: true,
          message: 'Subscription recorded but email delivery may have issues',
          details: `Admin: ${adminNotification.success}, Welcome: ${welcomeEmail.success}`
        };
      }

    } catch (error) {
      console.error('SMTP subscription handling error:', error);
      return {
        success: false,
        error: 'smtp_error',
        details: error.message
      };
    }
  }

  async sendAdminNotification(data) {
    try {
      const mailOptions = {
        from: `"DealRadarUS Newsletter" <${process.env.FROM_EMAIL}>`,
        to: process.env.ADMIN_EMAIL || process.env.FROM_EMAIL,
        subject: `New Newsletter Subscription - ${data.source}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              📧 New Newsletter Subscription
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> <span style="color: #007bff;">${data.email}</span></p>
              <p><strong>Source:</strong> ${data.source}</p>
              <p><strong>Time:</strong> ${data.timestamp}</p>
              <p><strong>User Agent:</strong> ${data.user_agent || 'N/A'}</p>
              <p><strong>Referrer:</strong> ${data.referrer || 'Direct'}</p>
              <p><strong>Total Subscribers:</strong> ${this.subscriberList.size}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
              <p style="margin: 0;"><strong>💡 Next Steps:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Welcome email has been sent automatically</li>
                <li>Subscriber added to local database</li>
                <li>Consider adding to your main email list</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              DealRadarUS Newsletter System - Automated Notification
            </p>
          </div>
        `,
        text: `
New Newsletter Subscription

Email: ${data.email}
Source: ${data.source}
Time: ${data.timestamp}
User Agent: ${data.user_agent || 'N/A'}
Referrer: ${data.referrer || 'Direct'}
Total Subscribers: ${this.subscriberList.size}

Next Steps:
- Welcome email has been sent automatically
- Subscriber added to local database
- Consider adding to your main email list
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Admin notification sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeEmail(email, source) {
    try {
      const mailOptions = {
        from: `"DealRadarUS Deals" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: '🎉 Welcome to DealRadarUS - Your Deal Alerts Are Active!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🎯 Welcome to DealRadarUS!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Your premium deal alerts are now active
              </p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0;">Hi there, deal hunter! 👋</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                Thanks for subscribing to DealRadarUS! You've just joined thousands of smart shoppers 
                who save big with our curated deal alerts.
              </p>
              
              <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #28a745;">🚀 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                  <li>You'll receive our best deals straight to your inbox</li>
                  <li>Get early access to flash sales and exclusive offers</li>
                  <li>Never miss out on limited-time discounts again</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://dealradarus.com" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🛍️ Start Saving Now
                </a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 30px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>💡 Pro Tip:</strong> Add deals@dealradarus.com to your contacts to ensure our deals land in your inbox!
                </p>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">Questions? Just reply to this email - we'd love to hear from you!</p>
              <p style="margin: 0;">
                <a href="https://dealradarus.com/privacy" style="color: #007bff; text-decoration: none;">Privacy Policy</a> | 
                <a href="mailto:deals@dealradarus.com?subject=Unsubscribe" style="color: #007bff; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px;">
                DealRadarUS - Finding the best deals so you don't have to
              </p>
            </div>
          </div>
        `,
        text: `
🎉 Welcome to DealRadarUS!

Hi there, deal hunter!

Thanks for subscribing to DealRadarUS! You've just joined thousands of smart shoppers who save big with our curated deal alerts.

What's Next?
• You'll receive our best deals straight to your inbox
• Get early access to flash sales and exclusive offers  
• Never miss out on limited-time discounts again

Visit DealRadarUS: https://dealradarus.com

Pro Tip: Add deals@dealradarus.com to your contacts to ensure our deals land in your inbox!

Questions? Just reply to this email - we'd love to hear from you!

Privacy Policy: https://dealradarus.com/privacy
Unsubscribe: mailto:deals@dealradarus.com?subject=Unsubscribe

DealRadarUS - Finding the best deals so you don't have to
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', email, 'MessageID:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSubscriberStats() {
    return {
      total_subscribers: this.subscriberList.size,
      subscribers: Array.from(this.subscriberList),
      last_updated: new Date().toISOString()
    };
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = SMTPHandler;

// CLI testing
if (require.main === module) {
  const handler = new SMTPHandler();
  
  handler.initialize().then(success => {
    if (success) {
      console.log('✅ SMTP Handler ready for testing');
      
      // Test subscription
      const testData = {
        email: 'test@example.com',
        source: 'newsletter_form',
        timestamp: new Date().toISOString(),
        user_agent: 'Test User Agent',
        referrer: 'https://dealradarus.com'
      };
      
      console.log('🧪 Testing subscription...');
      handler.handleSubscription(testData).then(result => {
        console.log('Test result:', result);
        process.exit(0);
      });
    } else {
      console.log('❌ SMTP Handler initialization failed');
      process.exit(1);
    }
  });
}