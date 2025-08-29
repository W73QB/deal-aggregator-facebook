/**
 * Prometheus Metrics Collection
 * Application performance and business metrics
 */

const promClient = require('prom-client');
const { logger } = require('./logger');

// Enable default metrics collection
promClient.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  prefix: 'dealradarus_'
});

// Create custom registry for our metrics
const register = new promClient.Registry();

// Add default metrics to our custom registry
promClient.collectDefaultMetrics({ register });

// HTTP Request Metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'dealradarus_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'user_role'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'dealradarus_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

const httpRequestsActive = new promClient.Gauge({
  name: 'dealradarus_http_requests_active',
  help: 'Number of HTTP requests currently being processed',
  registers: [register]
});

// Database Metrics
const dbQueryTotal = new promClient.Counter({
  name: 'dealradarus_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register]
});

const dbQueryDuration = new promClient.Histogram({
  name: 'dealradarus_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

const dbConnectionsActive = new promClient.Gauge({
  name: 'dealradarus_db_connections_active',
  help: 'Number of active database connections',
  registers: [register]
});

// Business Metrics
const dealsTotal = new promClient.Counter({
  name: 'dealradarus_deals_total',
  help: 'Total number of deals processed',
  labelNames: ['source', 'category', 'status'],
  registers: [register]
});

const reviewsTotal = new promClient.Counter({
  name: 'dealradarus_reviews_total',
  help: 'Total number of reviews created',
  labelNames: ['rating', 'verified', 'deal_category'],
  registers: [register]
});

const commentsTotal = new promClient.Counter({
  name: 'dealradarus_comments_total',
  help: 'Total number of comments created',
  labelNames: ['type', 'parent_exists'],
  registers: [register]
});

const alertsTotal = new promClient.Counter({
  name: 'dealradarus_alerts_total',
  help: 'Total number of alerts created and sent',
  labelNames: ['type', 'status', 'notification_method'],
  registers: [register]
});

const reportsTotal = new promClient.Counter({
  name: 'dealradarus_reports_total',
  help: 'Total number of content reports',
  labelNames: ['content_type', 'reason', 'status'],
  registers: [register]
});

// Email Metrics
const emailsSentTotal = new promClient.Counter({
  name: 'dealradarus_emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['type', 'status'],
  registers: [register]
});

const emailSendDuration = new promClient.Histogram({
  name: 'dealradarus_email_send_duration_seconds',
  help: 'Duration of email sending operations',
  labelNames: ['type'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20],
  registers: [register]
});

// Authentication Metrics
const authAttempts = new promClient.Counter({
  name: 'dealradarus_auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['method', 'status', 'user_agent'],
  registers: [register]
});

const sessionsActive = new promClient.Gauge({
  name: 'dealradarus_sessions_active',
  help: 'Number of active user sessions',
  registers: [register]
});

// Job Processing Metrics
const jobsProcessed = new promClient.Counter({
  name: 'dealradarus_jobs_processed_total',
  help: 'Total number of background jobs processed',
  labelNames: ['job_type', 'status'],
  registers: [register]
});

const jobProcessingDuration = new promClient.Histogram({
  name: 'dealradarus_job_processing_duration_seconds',
  help: 'Duration of background job processing',
  labelNames: ['job_type'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300, 600],
  registers: [register]
});

// M3.6 Notification Metrics
const notificationsTotal = new promClient.Counter({
  name: 'dealradarus_notifications_total',
  help: 'Total number of notifications processed',
  labelNames: ['channel', 'template', 'status', 'priority'],
  registers: [register]
});

const notificationDeliveryDuration = new promClient.Histogram({
  name: 'dealradarus_notification_delivery_duration_seconds',
  help: 'Duration of notification delivery operations',
  labelNames: ['channel', 'template'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
  registers: [register]
});

const notificationRetries = new promClient.Counter({
  name: 'dealradarus_notification_retries_total',
  help: 'Total number of notification retry attempts',
  labelNames: ['channel', 'template', 'attempt_number'],
  registers: [register]
});

const notificationQueueLength = new promClient.Gauge({
  name: 'dealradarus_notification_queue_length',
  help: 'Current number of notifications in queue',
  labelNames: ['status', 'priority'],
  registers: [register]
});

const webhookDeliveryStatus = new promClient.Counter({
  name: 'dealradarus_webhook_delivery_total',
  help: 'Total webhook delivery attempts',
  labelNames: ['status_code', 'retry_attempt'],
  registers: [register]
});

const digestsGenerated = new promClient.Counter({
  name: 'dealradarus_digests_generated_total',
  help: 'Total number of digests generated and sent',
  labelNames: ['frequency', 'status'],
  registers: [register]
});

const digestDealsIncluded = new promClient.Histogram({
  name: 'dealradarus_digest_deals_count',
  help: 'Number of deals included in digests',
  labelNames: ['frequency'],
  buckets: [0, 1, 5, 10, 25, 50, 100, 200],
  registers: [register]
});

const inAppNotificationEngagement = new promClient.Counter({
  name: 'dealradarus_in_app_notification_engagement_total',
  help: 'In-app notification engagement metrics',
  labelNames: ['action', 'template'],
  registers: [register]
});

const emailTemplatePerformance = new promClient.Counter({
  name: 'dealradarus_email_template_performance_total',
  help: 'Email template performance metrics',
  labelNames: ['template', 'action'],
  registers: [register]
});

// Error Metrics
const errorsTotal = new promClient.Counter({
  name: 'dealradarus_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'severity', 'component'],
  registers: [register]
});

// Cache Metrics (if using Redis)
const cacheOperations = new promClient.Counter({
  name: 'dealradarus_cache_operations_total',
  help: 'Total cache operations',
  labelNames: ['operation', 'result'],
  registers: [register]
});

// Rate Limiting Metrics
const rateLimitHits = new promClient.Counter({
  name: 'dealradarus_rate_limit_hits_total',
  help: 'Total rate limit hits',
  labelNames: ['endpoint', 'user_type'],
  registers: [register]
});

// Memory Usage Gauge
const memoryUsage = new promClient.Gauge({
  name: 'dealradarus_memory_usage_bytes',
  help: 'Current memory usage in bytes',
  labelNames: ['type'],
  registers: [register]
});

// Update memory metrics periodically
setInterval(() => {
  const usage = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, usage.rss);
  memoryUsage.set({ type: 'heapTotal' }, usage.heapTotal);
  memoryUsage.set({ type: 'heapUsed' }, usage.heapUsed);
  memoryUsage.set({ type: 'external' }, usage.external);
}, 30000);

// Middleware to track HTTP metrics
function createMetricsMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    httpRequestsActive.inc();
    
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path || 'unknown';
      const userRole = req.user?.role || 'anonymous';
      
      httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode,
        user_role: userRole
      });
      
      httpRequestDuration.observe({
        method: req.method,
        route,
        status_code: res.statusCode
      }, duration);
      
      httpRequestsActive.dec();
    });
    
    next();
  };
}

// Database query tracking helper
function trackDbQuery(operation, table, duration, success = true) {
  dbQueryTotal.inc({
    operation,
    table,
    status: success ? 'success' : 'error'
  });
  
  if (duration !== undefined) {
    dbQueryDuration.observe({ operation, table }, duration / 1000);
  }
}

// Business event tracking helpers
const businessMetrics = {
  // Track deal events
  trackDeal: (source, category, status = 'active') => {
    dealsTotal.inc({ source, category, status });
  },
  
  // Track review events
  trackReview: (rating, verified = false, dealCategory = 'unknown') => {
    reviewsTotal.inc({
      rating: rating.toString(),
      verified: verified.toString(),
      deal_category: dealCategory
    });
  },
  
  // Track comment events
  trackComment: (isReply = false) => {
    commentsTotal.inc({
      type: 'comment',
      parent_exists: isReply.toString()
    });
  },
  
  // Track alert events
  trackAlert: (type, status, notificationMethod = 'email') => {
    alertsTotal.inc({ type, status, notification_method: notificationMethod });
  },
  
  // Track report events
  trackReport: (contentType, reason, status = 'pending') => {
    reportsTotal.inc({ content_type: contentType, reason, status });
  },
  
  // Track email events
  trackEmail: (type, success = true) => {
    emailsSentTotal.inc({
      type,
      status: success ? 'sent' : 'failed'
    });
  },
  
  // Track email duration
  trackEmailDuration: (type, duration) => {
    emailSendDuration.observe({ type }, duration / 1000);
  },
  
  // Track authentication
  trackAuth: (method, success = true, userAgent = 'unknown') => {
    authAttempts.inc({
      method,
      status: success ? 'success' : 'failed',
      user_agent: userAgent.substring(0, 50) // Limit length
    });
  },
  
  // Track job processing
  trackJob: (jobType, success = true, duration = null) => {
    jobsProcessed.inc({
      job_type: jobType,
      status: success ? 'success' : 'failed'
    });
    
    if (duration !== null) {
      jobProcessingDuration.observe({ job_type: jobType }, duration / 1000);
    }
  },
  
  // Track errors
  trackError: (type, severity = 'error', component = 'general') => {
    errorsTotal.inc({ type, severity, component });
  },
  
  // Update active sessions
  updateActiveSessions: (count) => {
    sessionsActive.set(count);
  },
  
  // Track rate limiting
  trackRateLimit: (endpoint, userType = 'anonymous') => {
    rateLimitHits.inc({ endpoint, user_type: userType });
  },

  // M3.7 Cache Operations Tracking
  trackCacheOperation: (operation, result = 'success', duration = 0) => {
    if (!cacheOperations) {
      logger.warn('Cache operations metrics not initialized');
      return;
    }
    
    cacheOperations.inc({ operation, result });
    
    // Track duration for cache operations
    if (duration > 0) {
      // Create cache duration histogram if not exists
      if (!module.exports.metrics.cacheDuration) {
        const cacheDuration = new promClient.Histogram({
          name: 'dealradarus_cache_duration_seconds',
          help: 'Duration of cache operations in seconds',
          labelNames: ['operation', 'result'],
          buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
          registers: [register]
        });
        module.exports.metrics.cacheDuration = cacheDuration;
      }
      
      module.exports.metrics.cacheDuration.observe({ operation, result }, duration / 1000);
    }
  },

  // M3.7 HTTP Cache Tracking
  trackHttpCache: (endpoint, cacheStatus, responseTime = 0) => {
    if (!module.exports.metrics.httpCacheHits) {
      const httpCacheHits = new promClient.Counter({
        name: 'dealradarus_http_cache_hits_total',
        help: 'Total HTTP cache hits and misses',
        labelNames: ['endpoint', 'status'],
        registers: [register]
      });
      module.exports.metrics.httpCacheHits = httpCacheHits;
    }
    
    module.exports.metrics.httpCacheHits.inc({ endpoint, status: cacheStatus });
    
    if (responseTime > 0) {
      httpRequestDuration.observe({ 
        method: 'GET', 
        route: endpoint, 
        status_code: cacheStatus === 'hit' ? '304' : '200' 
      }, responseTime / 1000);
    }
  },

  // M3.7 Database Query Performance Tracking
  trackQueryPerformance: (table, operation, duration, cached = false) => {
    // Track database performance improvements with caching
    if (!module.exports.metrics.queryPerformance) {
      const queryPerformance = new promClient.Histogram({
        name: 'dealradarus_query_performance_seconds',
        help: 'Database query performance with cache awareness',
        labelNames: ['table', 'operation', 'cached'],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
        registers: [register]
      });
      module.exports.metrics.queryPerformance = queryPerformance;
    }
    
    module.exports.metrics.queryPerformance.observe(
      { table, operation, cached: cached.toString() }, 
      duration / 1000
    );
  },

  // M3.7 Cache Hit Ratio Tracking
  updateCacheHitRatio: (endpoint, hitCount, missCount) => {
    if (!module.exports.metrics.cacheHitRatio) {
      const cacheHitRatio = new promClient.Gauge({
        name: 'dealradarus_cache_hit_ratio',
        help: 'Cache hit ratio by endpoint',
        labelNames: ['endpoint'],
        registers: [register]
      });
      module.exports.metrics.cacheHitRatio = cacheHitRatio;
    }
    
    const total = hitCount + missCount;
    const ratio = total > 0 ? hitCount / total : 0;
    module.exports.metrics.cacheHitRatio.set({ endpoint }, ratio);
  },

  // M3.6 Notification Tracking Methods
  trackNotification: (channel, template, status, priority = 'normal', duration = null) => {
    notificationsTotal.inc({ channel, template, status, priority });
    if (duration !== null) {
      notificationDeliveryDuration.observe({ channel, template }, duration / 1000);
    }
  },

  trackNotificationRetry: (channel, template, attemptNumber) => {
    notificationRetries.inc({ channel, template, attempt_number: attemptNumber.toString() });
  },

  updateNotificationQueueLength: (status, priority, count) => {
    notificationQueueLength.set({ status, priority }, count);
  },

  trackWebhookDelivery: (statusCode, retryAttempt = 0) => {
    webhookDeliveryStatus.inc({ 
      status_code: statusCode.toString(), 
      retry_attempt: retryAttempt.toString() 
    });
  },

  trackDigest: (frequency, status, dealCount = null) => {
    digestsGenerated.inc({ frequency, status });
    if (dealCount !== null) {
      digestDealsIncluded.observe({ frequency }, dealCount);
    }
  },

  trackInAppEngagement: (action, template) => {
    inAppNotificationEngagement.inc({ action, template });
  },

  trackEmailTemplate: (template, action) => {
    emailTemplatePerformance.inc({ template, action });
  }
};

// Health check endpoint data
function getHealthMetrics() {
  const usage = process.memoryUsage();
  return {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    },
    cpu: process.cpuUsage(),
    version: process.version,
    pid: process.pid
  };
}

// Initialize metrics on startup
function initializeMetrics() {
  logger.info('Metrics collection initialized', {
    registry: 'prometheus',
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    defaultMetrics: true
  });
  
  // Set initial values
  httpRequestsActive.set(0);
  sessionsActive.set(0);
}

module.exports = {
  register,
  createMetricsMiddleware,
  trackDbQuery,
  businessMetrics,
  getHealthMetrics,
  initializeMetrics,
  
  // Export individual metrics for direct access if needed
  metrics: {
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestsActive,
    dbQueryTotal,
    dbQueryDuration,
    dbConnectionsActive,
    dealsTotal,
    reviewsTotal,
    commentsTotal,
    alertsTotal,
    reportsTotal,
    emailsSentTotal,
    emailSendDuration,
    authAttempts,
    sessionsActive,
    jobsProcessed,
    jobProcessingDuration,
    errorsTotal,
    cacheOperations,
    rateLimitHits,
    memoryUsage,
    // M3.6 Notification Metrics
    notificationsTotal,
    notificationDeliveryDuration,
    notificationRetries,
    notificationQueueLength,
    webhookDeliveryStatus,
    digestsGenerated,
    digestDealsIncluded,
    inAppNotificationEngagement,
    emailTemplatePerformance
  }
};