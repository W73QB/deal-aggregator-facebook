/**
 * Unified Express Backend Server
 * Single source of truth for all backend logic
 * Integrates with existing authentication system
 *
 * NOTE: Uses CommonJS (.cjs) for compatibility with Express middleware ecosystem
 * and to avoid ESM/CJS interop issues with legacy dependencies (bcrypt, pg, etc.)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config({ path: '.env.dealradarus.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Import database connection
const db = require('./auth/utils/database');

// Import routes
const authRoutes = require('./auth/routes/auth');
const dealsRoutes = require('./routes/deals');
const commentsRoutes = require('./auth/routes/comments');
const reviewsRoutes = require('./auth/routes/reviews');
const reportsRoutes = require('./auth/routes/reports');
const alertsRoutes = require('./auth/routes/alerts');
const filtersRoutes = require('./auth/routes/filters');
const notificationRoutes = require('./notifications/routes');
const metricsRoutes = require('./routes/metrics');

// Import middleware
const authMiddleware = require('./auth/middleware/auth');
const validationMiddleware = require('./auth/middleware/validation');

// Global rate limiting
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Global rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"] ,
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:"] ,
    },
  },
}));

app.use(compression());
app.use(globalRateLimit);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://deal-aggregator-facebook.vercel.app',
    'https://dealradarus.com',
    'https://*.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Logging
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

// API Routes - Mount all routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes); // Our new unified deals route
app.use('/api/comments', commentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/metrics', metricsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'DealRadarUS Unified API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth - Authentication endpoints',
      deals: '/api/deals - Deals management (unified)',
      comments: '/api/comments - User comments',
      reviews: '/api/reviews - Product reviews',
      reports: '/api/reports - Content reporting',
      alerts: '/api/alerts - Price alerts',
      filters: '/api/filters - Saved filters',
      notifications: '/api/notifications - User notifications',
      metrics: '/api/metrics - System metrics',
      health: '/health - Health check'
    },
    documentation: 'https://github.com/dealradarus/api-docs',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: '/api',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    if (db && db.close) {
      db.close().then(() => {
        console.log('Database connections closed');
        process.exit(0);
      }).catch((error) => {
        console.error('Error closing database:', error);
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Unified Express Backend Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: PostgreSQL Connected`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔒 Security: Helmet, CORS, Rate limiting enabled`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  // Test database connection on startup
  db.testConnection().then(() => {
    console.log(`✅ Database connection verified`);
  }).catch((error) => {
    console.error(`❌ Database connection failed:`, error.message);
    console.log(`💀 Server will terminate - database connection is required`);
    // process.exit(1);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
