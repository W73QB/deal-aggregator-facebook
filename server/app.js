/**
 * DealRadarUS Express App
 * Main application server with authentication system
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: '.env.dealradarus.local' });

// Import routes
const authRoutes = require('./auth/routes/auth');
const filtersRoutes = require('./auth/routes/filters');
const alertsRoutes = require('./auth/routes/alerts');
const reviewsRoutes = require('./auth/routes/reviews');
const commentsRoutes = require('./auth/routes/comments');
const reportsRoutes = require('./auth/routes/reports');
const notificationsRoutes = require('./notifications/routes');
const dealsRoutes = require('./routes/deals'); // Import the new deals route
const metricsRoutes = require('./routes/metrics');

// Import middleware
const rateLimit = require('./auth/middleware/rate-limit');

// Import monitoring
const { logger, createHttpLogger, logError } = require('./monitoring/logger');
const { createMetricsMiddleware, initializeMetrics, getHealthMetrics, register } = require('./monitoring/metrics');

// Import M3.7 Cache modules
const staticAssetsOptimizer = require('./cache/http-static');
const httpCacheMiddleware = require('./cache/http-cache');

// Import background jobs
const alertsProcessor = require('./jobs/alerts-processor');

// Initialize Sentry if enabled
let Sentry;
if (process.env.ERROR_TRACKING_ENABLED === 'true' && process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    release: process.env.npm_package_version || '1.0.0'
  });
}

class DealRadarUSApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.initializeMonitoring();
  }

  setupMiddleware() {
    // Sentry request handler (must be first)
    if (Sentry) {
      this.app.use(Sentry.Handlers.requestHandler());
    }

    // Monitoring middleware
    if (process.env.MONITORING_ENABLED === 'true') {
      this.app.use(createHttpLogger());
      this.app.use(createMetricsMiddleware());
    }

    // M3.8 Phase 6: Enhanced Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: this.isDevelopment 
            ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"] 
            : ["'self'", "https://www.googletagmanager.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: this.isDevelopment 
            ? ["'self'", "http://localhost:*", "ws://localhost:*"] 
            : ["'self'", process.env.FRONTEND_URL],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));

    // M3.8 Phase 6: Enhanced CORS configuration
    const allowedOrigins = this.isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'] 
      : [process.env.FRONTEND_URL].filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn('Blocked CORS request from unauthorized origin', { origin });
          callback(new Error('CORS: Unauthorized origin'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400 // 24 hours
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        
        console.log(`[${logLevel.toUpperCase()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
      });
      
      next();
    });

    // Global rate limiting
    this.app.use(rateLimit.generalAPI);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        ...getHealthMetrics()
      };
      
      logger.info('Health check requested', { correlationId: req.correlationId });
      res.json(healthData);
    });

    // Readiness check endpoint
    this.app.get('/ready', async (req, res) => {
      try {
        // Check database connection (simplified for demo)
        const dbStatus = 'connected'; // Would check actual DB connection
        const emailStatus = 'connected'; // Would check SMTP connection
        
        const readinessData = {
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: dbStatus, message: 'Database connection OK' },
            email: { status: emailStatus, message: 'Email service OK' },
            migrations: { status: 'applied', message: 'All migrations applied' }
          }
        };
        
        logger.info('Readiness check requested', { 
          correlationId: req.correlationId,
          checks: readinessData.checks
        });
        
        res.json(readinessData);
      } catch (error) {
        logger.error('Readiness check failed', { 
          correlationId: req.correlationId,
          error: error.message
        });
        
        res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    // Metrics endpoint
    if (process.env.METRICS_ENABLED === 'true') {
      this.app.get('/metrics', async (req, res) => {
        try {
          res.set('Content-Type', register.contentType);
          const metrics = await register.metrics();
          res.end(metrics);
        } catch (error) {
          logger.error('Metrics endpoint error', { 
            correlationId: req.correlationId,
            error: error.message
          });
          res.status(500).end('Error generating metrics');
        }
      });
    }

    // API routes - must come BEFORE static file serving
    this.app.use('/auth', authRoutes);
    this.app.use('/filters', filtersRoutes);
    this.app.use('/alerts', alertsRoutes);
    this.app.use('/reviews', reviewsRoutes);
    this.app.use('/comments', commentsRoutes);
    this.app.use('/reports', reportsRoutes);
    this.app.use('/notifications', notificationsRoutes);
    this.app.use('/metrics', metricsRoutes);

    // Production: Serve static files from dist directory with M3.7 optimization
    if (process.env.NODE_ENV === 'production') {
      // Apply optimized static file serving with comprehensive caching
      const staticMiddlewares = staticAssetsOptimizer.createStaticMiddleware(
        path.join(__dirname, '../dist'),
        {
          enableCompression: true,
          enableEtag: true,
          enableLastModified: true,
          customHeaders: {
            'X-Served-By': 'DealRadarUS-M3.7',
            'X-Cache-Optimized': 'true'
          }
        }
      );
      
      staticMiddlewares.forEach(middleware => {
        this.app.use(middleware);
      });
      
      // Catch-all handler for SPA routing in production
      this.app.get('*', (req, res) => {
        // For API requests that don't match, return 404
        if (req.originalUrl.startsWith('/auth') || 
            req.originalUrl.startsWith('/filters') || 
            req.originalUrl.startsWith('/alerts') || 
            req.originalUrl.startsWith('/reviews') || 
            req.originalUrl.startsWith('/comments') || 
            req.originalUrl.startsWith('/reports') || 
            req.originalUrl.startsWith('/notifications') || 
            req.originalUrl.startsWith('/metrics') || 
            req.originalUrl.startsWith('/api')) {
          return res.status(404).json({
            success: false,
            message: 'Endpoint not found'
          });
        }
        
        // For everything else, serve the production build with cache headers
        res.set({
          'Cache-Control': 'no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        });
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    } else {
      // Development: Just handle API 404s
      this.app.get('*', (req, res) => {
        if (req.originalUrl.startsWith('/auth') || 
            req.originalUrl.startsWith('/filters') || 
            req.originalUrl.startsWith('/alerts') || 
            req.originalUrl.startsWith('/reviews') || 
            req.originalUrl.startsWith('/comments') || 
            req.originalUrl.startsWith('/reports') || 
            req.originalUrl.startsWith('/notifications') || 
            req.originalUrl.startsWith('/metrics') || 
            req.originalUrl.startsWith('/api')) {
          return res.status(404).json({
            success: false,
            message: 'Endpoint not found'
          });
        }
        
        // In development, frontend is served by webpack dev server
        res.status(404).json({
          success: false,
          message: 'Frontend served by webpack dev server on port 3000'
        });
      });
    }
  }

  setupErrorHandling() {
    // Sentry error handler (must be before other error handlers)
    if (Sentry) {
      this.app.use(Sentry.Handlers.errorHandler());
    }

    // 404 handler
    this.app.use((req, res) => {
      logger.warn('404 Not Found', {
        correlationId: req.correlationId,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      res.status(404).json({
        success: false,
        message: 'Resource not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      // Log error with context
      logError(err, {
        correlationId: req.correlationId,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
      });

      // Report to Sentry if enabled
      if (Sentry && !this.isDevelopment) {
        Sentry.captureException(err);
      }

      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(err.status || 500).json({
        success: false,
        message: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack }),
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId
      });
    });
  }

  initializeMonitoring() {
    if (process.env.MONITORING_ENABLED === 'true') {
      initializeMetrics();
      logger.info('Application monitoring initialized', {
        metrics: process.env.METRICS_ENABLED === 'true',
        logging: true,
        sentry: !!Sentry,
        environment: process.env.NODE_ENV
      });
    }
  }

  async start() {
    try {
      // Test database connection
      const db = require('./auth/utils/database');
      await db.query('SELECT NOW()');
      console.log('✅ Database connection verified');

      // Test email service
      const emailService = require('./email/service');
      const emailStatus = await emailService.verifyTransporter();
      console.log(`${emailStatus.success ? '✅' : '❌'} Email service status: ${emailStatus.success ? 'Connected' : emailStatus.error}`);

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 DealRadarUS server running on port ${this.port}`);
        console.log(`📧 Email service: ${emailStatus.success ? 'Ready' : 'Error'}`);
        console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        
        // Start background job processor
        alertsProcessor.start();
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop() {
    // Stop background jobs
    alertsProcessor.stop();
    
    if (this.server) {
      this.server.close();
      console.log('🛑 Server stopped');
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const app = new DealRadarUSApp();
  app.start();

  // Graceful shutdown
  process.on('SIGTERM', () => app.stop());
  process.on('SIGINT', () => app.stop());
}

module.exports = DealRadarUSApp;