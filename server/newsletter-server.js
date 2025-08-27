/**
 * Newsletter Server - Express.js Implementation
 * Provides /api/newsletter endpoint for form submissions
 * Version: 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createNewsletterRoute } = require('./newsletter-handler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://connect.facebook.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.emailjs.com", "https://api.convertkit.com", "https://*.api.mailchimp.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dealradarus.com', 'https://www.dealradarus.com']
    : ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'newsletter-server',
    version: '1.0.0'
  });
});

// Newsletter signup endpoint
app.post('/api/newsletter', createNewsletterRoute('emailjs'));

// Newsletter status endpoint (optional)
app.get('/api/newsletter/status', (req, res) => {
  res.json({
    service: 'active',
    features: [
      'email_validation',
      'rate_limiting', 
      'spam_protection',
      'multiple_service_support'
    ],
    supported_services: [
      'mailchimp',
      'convertkit', 
      'emailjs',
      'custom_api'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    error: 'internal_server_error',
    message: 'Something went wrong. Please try again later.'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'not_found',
    message: 'API endpoint not found'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Newsletter server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Newsletter API: http://localhost:${PORT}/api/newsletter`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
  });
}

module.exports = app;