/**
 * Email Service - High-level email sending functions
 */

const transporter = require('./transporter');
const { generateVerificationEmail } = require('./templates/verification');
const { generatePasswordResetEmail } = require('./templates/password-reset');
const { generateWelcomeEmail } = require('./templates/welcome');
const { generateInstantAlert, generateDailyAlert, generateWeeklyAlert } = require('./templates/alerts');
const { 
  generateNewContentAlert,
  generateContentReportAlert,
  generateModerationActionNotification,
  generateReviewReplyNotification
} = require('./templates/ugc-moderation');

class EmailService {
  async sendVerificationEmail(user, token) {
    const emailContent = generateVerificationEmail(user, token);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'verification',
      userId: user.id,
      emailType: 'verification'
    });
  }

  async sendPasswordResetEmail(user, token) {
    const emailContent = generatePasswordResetEmail(user, token);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'password_reset',
      userId: user.id,
      emailType: 'password_reset'
    });
  }

  async sendWelcomeEmail(user) {
    const emailContent = generateWelcomeEmail(user);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'welcome',
      userId: user.id,
      emailType: 'welcome'
    });
  }

  async sendCustomEmail({ to, subject, html, text, userId, emailType = 'notification' }) {
    return await transporter.sendEmail({
      to,
      subject,
      html,
      text,
      template: 'custom',
      userId,
      emailType
    });
  }

  async verifyTransporter() {
    return await transporter.verifyConnection();
  }

  async sendInstantAlert(user, filter, deals) {
    const emailContent = generateInstantAlert(user, filter, deals);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'instant_alert',
      userId: user.id,
      emailType: 'notification'
    });
  }

  async sendDailyAlert(user, filter, deals) {
    const emailContent = generateDailyAlert(user, filter, deals);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'daily_alert',
      userId: user.id,
      emailType: 'notification'
    });
  }

  async sendWeeklyAlert(user, filter, deals) {
    const emailContent = generateWeeklyAlert(user, filter, deals);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'weekly_alert',
      userId: user.id,
      emailType: 'notification'
    });
  }

  async getEmailStats(hours = 24) {
    return await transporter.getEmailStats(hours);
  }

  // === UGC MODERATION EMAIL METHODS ===

  async sendNewContentAlert(admin, contentType, content) {
    const emailContent = generateNewContentAlert(admin, contentType, content);
    
    return await transporter.sendEmail({
      to: admin.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'ugc_new_content',
      userId: admin.id,
      emailType: 'moderation_alert'
    });
  }

  async sendContentReportAlert(admin, report, content) {
    const emailContent = generateContentReportAlert(admin, report, content);
    
    return await transporter.sendEmail({
      to: admin.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'ugc_content_report',
      userId: admin.id,
      emailType: 'moderation_alert',
      priority: 'high' // High priority for abuse reports
    });
  }

  async sendModerationActionNotification(user, action, content, reason = null) {
    const emailContent = generateModerationActionNotification(user, action, content, reason);
    
    return await transporter.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'ugc_moderation_action',
      userId: user.id,
      emailType: 'moderation_notification'
    });
  }

  async sendReviewReplyNotification(reviewer, reply, originalReview) {
    const emailContent = generateReviewReplyNotification(reviewer, reply, originalReview);
    
    return await transporter.sendEmail({
      to: reviewer.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template: 'ugc_review_reply',
      userId: reviewer.id,
      emailType: 'community_notification'
    });
  }

  // Bulk notification methods for efficiency
  async sendBulkContentAlerts(admins, contentType, content) {
    const promises = admins.map(admin => 
      this.sendNewContentAlert(admin, contentType, content)
    );
    
    return Promise.allSettled(promises);
  }

  async sendBulkReportAlerts(admins, report, content) {
    const promises = admins.map(admin => 
      this.sendContentReportAlert(admin, report, content)
    );
    
    return Promise.allSettled(promises);
  }
}

module.exports = new EmailService();