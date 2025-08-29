/**
 * Email Transporter Service - Zoho SMTP
 */

const nodemailer = require('nodemailer');
const db = require('../auth/utils/database');
require('dotenv').config({ path: '.env.dealradarus.local' });

class EmailTransporter {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    this.fromEmail = process.env.FROM_EMAIL;
    
    if (!this.fromEmail) {
      throw new Error('FROM_EMAIL not found in environment variables');
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmail({ to, subject, html, text, template, userId, emailType }) {
    const startTime = Date.now();
    let emailEventId = null;
    
    try {
      // Log email event as queued
      const eventResult = await db.query(`
        INSERT INTO public.email_events (user_id, email_type, recipient, subject, status, template_used)
        VALUES ($1, $2, $3, $4, 'queued', $5)
        RETURNING id
      `, [userId || null, emailType, to, subject, template || 'custom']);
      
      emailEventId = eventResult.rows[0].id;

      // Send email
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;

      // Update email event as sent
      await db.query(`
        UPDATE public.email_events 
        SET status = 'sent', message_id = $1, duration_ms = $2, smtp_response = $3, updated_at = NOW()
        WHERE id = $4
      `, [result.messageId, duration, JSON.stringify(result.response), emailEventId]);

      console.log(`📧 Email sent: ${emailType} to ${to} (${duration}ms)`);

      return {
        success: true,
        messageId: result.messageId,
        duration,
        eventId: emailEventId
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update email event as failed
      if (emailEventId) {
        await db.query(`
          UPDATE public.email_events 
          SET status = 'failed', error_message = $1, duration_ms = $2, updated_at = NOW()
          WHERE id = $3
        `, [error.message, duration, emailEventId]);
      }

      console.error(`❌ Email failed: ${emailType} to ${to} - ${error.message}`);

      return {
        success: false,
        error: error.message,
        duration,
        eventId: emailEventId
      };
    }
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async getEmailStats(hours = 24) {
    const result = await db.query(`
      SELECT 
        email_type,
        status,
        COUNT(*) as count,
        ROUND(AVG(duration_ms), 0) as avg_duration_ms
      FROM public.email_events 
      WHERE created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY email_type, status
      ORDER BY email_type, status
    `);

    return result.rows;
  }
}

module.exports = new EmailTransporter();