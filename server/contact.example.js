/**
 * 📧 DealRadarUS - Contact Form Handler (Server Example)
 * 
 * This is an example Node.js/Express server implementation for handling contact form submissions.
 * Replace placeholders with actual values and adapt to your hosting environment.
 * 
 * SECURITY FEATURES:
 * - Input validation & sanitization
 * - Rate limiting (IP-based)
 * - Honeypot spam protection
 * - reCAPTCHA verification
 * - Email sending via ESP (SendGrid/Mailgun/SES)
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');
const axios = require('axios');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - 5 submissions per IP per hour
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour per IP
    message: {
        error: 'Too many contact form submissions. Please try again in an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost in development
        return process.env.NODE_ENV === 'development' && 
               (req.ip === '127.0.0.1' || req.ip === '::1');
    }
});

// Environment configuration (load from .env)
const CONFIG = {
    // Email settings (required)
    EMAIL_FROM: process.env.EMAIL_FROM || 'deals@dealradarus.com',
    EMAIL_TO: process.env.EMAIL_TO || 'deals@dealradarus.com',
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'deals@dealradarus.com',
    
    // ESP Configuration - Choose one:
    ESP_PROVIDER: process.env.ESP_PROVIDER || 'sendgrid', // 'sendgrid', 'mailgun', 'ses'
    
    // SendGrid
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    
    // Mailgun
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    
    // AWS SES
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    
    // reCAPTCHA
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || 'REPLACE_WITH_YOUR_SECRET_KEY'
};

/**
 * Validate reCAPTCHA response
 */
async function validateRecaptcha(token, clientIP) {
    if (!token || CONFIG.RECAPTCHA_SECRET_KEY === 'REPLACE_WITH_YOUR_SECRET_KEY') {
        return { success: false, error: 'reCAPTCHA not configured' };
    }
    
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', 
            new URLSearchParams({
                secret: CONFIG.RECAPTCHA_SECRET_KEY,
                response: token,
                remoteip: clientIP
            })
        );
        
        return response.data;
    } catch (error) {
        console.error('reCAPTCHA validation error:', error);
        return { success: false, error: 'reCAPTCHA validation failed' };
    }
}

/**
 * Sanitize and validate form input
 */
function validateFormData(data) {
    const errors = [];
    const sanitized = {};
    
    // Name validation
    if (!data.name || !data.name.trim()) {
        errors.push('Name is required');
    } else {
        const name = DOMPurify.sanitize(data.name.trim());
        if (name.length < 2 || name.length > 100) {
            errors.push('Name must be between 2 and 100 characters');
        } else if (!/^[A-Za-z\s\-\.]+$/.test(name)) {
            errors.push('Name contains invalid characters');
        } else {
            sanitized.name = name;
        }
    }
    
    // Email validation
    if (!data.email || !data.email.trim()) {
        errors.push('Email is required');
    } else {
        const email = data.email.trim().toLowerCase();
        if (!validator.isEmail(email) || email.length > 254) {
            errors.push('Invalid email address');
        } else {
            sanitized.email = email;
        }
    }
    
    // Subject validation (optional)
    if (data.subject && data.subject.trim()) {
        const subject = DOMPurify.sanitize(data.subject.trim());
        if (subject.length > 200) {
            errors.push('Subject too long (max 200 characters)');
        } else {
            sanitized.subject = subject;
        }
    }
    
    // Message validation
    if (!data.message || !data.message.trim()) {
        errors.push('Message is required');
    } else {
        const message = DOMPurify.sanitize(data.message.trim());
        if (message.length < 10 || message.length > 2000) {
            errors.push('Message must be between 10 and 2000 characters');
        } else {
            sanitized.message = message;
        }
    }
    
    // Honeypot check
    if (data.website_url && data.website_url.trim()) {
        errors.push('Spam detected');
    }
    
    return { errors, sanitized };
}

/**
 * Send email via configured ESP
 */
async function sendEmail(formData) {
    const emailData = {
        from: CONFIG.EMAIL_FROM,
        to: CONFIG.EMAIL_TO,
        replyTo: formData.email,
        subject: `Contact Form: ${formData.subject || 'New Inquiry'}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${formData.name} (${formData.email})</p>
            <p><strong>Subject:</strong> ${formData.subject || 'No subject'}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <small>Sent via DealRadarUS contact form</small>
        `,
        text: `
New Contact Form Submission

From: ${formData.name} (${formData.email})
Subject: ${formData.subject || 'No subject'}

Message:
${formData.message}

---
Sent via DealRadarUS contact form
        `
    };
    
    switch (CONFIG.ESP_PROVIDER) {
        case 'sendgrid':
            return await sendViaSendGrid(emailData);
        case 'mailgun':
            return await sendViaMailgun(emailData);
        case 'ses':
            return await sendViaSES(emailData);
        default:
            throw new Error('No ESP configured');
    }
}

/**
 * SendGrid email implementation
 */
async function sendViaSendGrid(emailData) {
    if (!CONFIG.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
    }
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(CONFIG.SENDGRID_API_KEY);
    
    return await sgMail.send({
        from: emailData.from,
        to: emailData.to,
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
    });
}

/**
 * Mailgun email implementation
 */
async function sendViaMailgun(emailData) {
    if (!CONFIG.MAILGUN_API_KEY || !CONFIG.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration missing');
    }
    
    const formData = new FormData();
    formData.append('from', emailData.from);
    formData.append('to', emailData.to);
    formData.append('h:Reply-To', emailData.replyTo);
    formData.append('subject', emailData.subject);
    formData.append('html', emailData.html);
    formData.append('text', emailData.text);
    
    return await axios.post(
        `https://api.mailgun.net/v3/${CONFIG.MAILGUN_DOMAIN}/messages`,
        formData,
        {
            auth: {
                username: 'api',
                password: CONFIG.MAILGUN_API_KEY
            }
        }
    );
}

/**
 * AWS SES email implementation
 */
async function sendViaSES(emailData) {
    const AWS = require('aws-sdk');
    
    AWS.config.update({
        region: CONFIG.AWS_REGION,
        accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
        secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    });
    
    const ses = new AWS.SES();
    
    const params = {
        Source: emailData.from,
        Destination: {
            ToAddresses: [emailData.to]
        },
        ReplyToAddresses: [emailData.replyTo],
        Message: {
            Subject: {
                Data: emailData.subject,
                Charset: 'UTF-8'
            },
            Body: {
                Html: {
                    Data: emailData.html,
                    Charset: 'UTF-8'
                },
                Text: {
                    Data: emailData.text,
                    Charset: 'UTF-8'
                }
            }
        }
    };
    
    return await ses.sendEmail(params).promise();
}

/**
 * Contact form submission handler
 */
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        // Validate reCAPTCHA
        const recaptchaResult = await validateRecaptcha(
            req.body['g-recaptcha-response'], 
            req.ip
        );
        
        if (!recaptchaResult.success) {
            return res.status(400).json({
                error: 'reCAPTCHA verification failed',
                details: recaptchaResult.error || 'Invalid reCAPTCHA'
            });
        }
        
        // Validate form data
        const { errors, sanitized } = validateFormData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        
        // Send email
        await sendEmail(sanitized);
        
        // Success response
        res.json({
            success: true,
            message: 'Thank you! Your message has been sent successfully.'
        });
        
        // Log successful submission (without sensitive data)
        console.log(`Contact form submitted: ${sanitized.name} <${sanitized.email}>`);
        
    } catch (error) {
        console.error('Contact form error:', error);
        
        res.status(500).json({
            error: 'Unable to send message',
            message: 'Please try again later or contact us directly at deals@dealradarus.com'
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        email: {
            from: CONFIG.EMAIL_FROM,
            to: CONFIG.EMAIL_TO,
            provider: CONFIG.ESP_PROVIDER
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Please try again later'
    });
});

// Start server (if running directly)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 DealRadarUS Contact Server running on port ${PORT}`);
        console.log(`📧 Email configured: ${CONFIG.EMAIL_FROM} → ${CONFIG.EMAIL_TO}`);
        console.log(`📨 ESP Provider: ${CONFIG.ESP_PROVIDER}`);
    });
}

module.exports = app;

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Install dependencies:
 *    npm install express express-rate-limit helmet validator isomorphic-dompurify axios
 *    
 * 2. Choose and install ESP package:
 *    - SendGrid: npm install @sendgrid/mail
 *    - Mailgun: (uses axios, no additional package needed)
 *    - AWS SES: npm install aws-sdk
 * 
 * 3. Set environment variables:
 *    - Copy .env.example to .env
 *    - Update ESP credentials
 *    - Set reCAPTCHA secret key
 * 
 * 4. Test the server:
 *    node server/contact.example.js
 * 
 * 5. For production:
 *    - Use PM2 or similar process manager
 *    - Set up reverse proxy (nginx/apache)
 *    - Enable HTTPS
 *    - Configure monitoring/logging
 */