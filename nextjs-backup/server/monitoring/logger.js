/**
 * Winston Logger Configuration
 * Centralized logging with PII masking and correlation IDs
 */

const winston = require('winston');
const path = require('path');
require('dotenv').config();

// PII masking function
function maskPII(info) {
  let message = typeof info === 'string' ? info : JSON.stringify(info);
  
  // Mask email addresses
  message = message.replace(
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
    (match, user, domain) => `${user.substring(0, 2)}***@${domain}`
  );
  
  // Mask phone numbers
  message = message.replace(
    /(\+?[\d\s()-]{10,})/g,
    '***-***-****'
  );
  
  // Mask credit card numbers (basic pattern)
  message = message.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    '**** **** **** ****'
  );
  
  // Mask JWT tokens
  message = message.replace(
    /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    'JWT_TOKEN_MASKED'
  );
  
  // Mask passwords in JSON
  message = message.replace(
    /"password"\s*:\s*"[^"]*"/gi,
    '"password":"***MASKED***"'
  );
  
  return message;
}

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    // Add correlation ID if available
    const correlationId = info.correlationId || process.env.CORRELATION_ID || 'unknown';
    
    const logEntry = {
      timestamp: info.timestamp,
      level: info.level,
      message: maskPII(info.message),
      correlationId,
      service: 'dealradarus-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...info
    };
    
    // Remove sensitive fields
    delete logEntry.password;
    delete logEntry.token;
    delete logEntry.secret;
    
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const correlationId = info.correlationId || 'no-id';
    const maskedMessage = maskPII(info.message);
    
    let output = `${info.timestamp} [${info.level}] [${correlationId}] ${maskedMessage}`;
    
    if (info.stack) {
      output += `\n${info.stack}`;
    }
    
    return output;
  })
);

// Create transports based on environment
const transports = [];

// Always add console transport
transports.push(
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? customFormat : consoleFormat,
    handleExceptions: true,
    handleRejections: true
  })
);

// Add file transports in production or if specified
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logsDir = path.join(__dirname, '../../logs');
  
  // Ensure logs directory exists
  const fs = require('fs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      handleExceptions: true
    })
  );
  
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: process.env.LOG_LEVEL || 'info',
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    })
  );
  
  // HTTP requests log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      format: customFormat,
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'dealradarus-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  exitOnError: false
});

// HTTP Request Logging Middleware
function createHttpLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    const correlationId = req.headers['x-correlation-id'] || 
                         req.headers['x-request-id'] || 
                         require('crypto').randomUUID();
    
    // Attach correlation ID to request for downstream use
    req.correlationId = correlationId;
    
    // Log request
    logger.http('HTTP Request', {
      correlationId,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection?.remoteAddress,
      contentLength: req.get('Content-Length') || 0,
      referer: req.get('Referer')
    });
    
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      logger.http('HTTP Response', {
        correlationId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length') || 0
      });
      
      return originalJson.call(this, data);
    };
    
    // Log on response finish
    res.on('finish', () => {
      if (!res.headersSent) return; // Already logged via json override
      
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'http';
      
      logger.log(logLevel, 'HTTP Response Complete', {
        correlationId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length') || 0
      });
    });
    
    next();
  };
}

// Helper functions for structured logging
const loggers = {
  // System events
  system: (message, meta = {}) => logger.info(message, { category: 'system', ...meta }),
  
  // Database operations
  database: (message, meta = {}) => logger.info(message, { category: 'database', ...meta }),
  
  // Authentication events
  auth: (message, meta = {}) => logger.info(message, { category: 'auth', ...meta }),
  
  // Email operations
  email: (message, meta = {}) => logger.info(message, { category: 'email', ...meta }),
  
  // Background jobs
  job: (message, meta = {}) => logger.info(message, { category: 'job', ...meta }),
  
  // Business logic
  business: (message, meta = {}) => logger.info(message, { category: 'business', ...meta }),
  
  // Security events
  security: (message, meta = {}) => logger.warn(message, { category: 'security', ...meta }),
  
  // Performance metrics
  performance: (message, meta = {}) => logger.info(message, { category: 'performance', ...meta })
};

// Error logging with context
function logError(error, context = {}) {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context
  });
}

// Success operation logging
function logSuccess(operation, meta = {}) {
  logger.info(`Operation Success: ${operation}`, meta);
}

// Warning logging
function logWarning(message, meta = {}) {
  logger.warn(message, meta);
}

module.exports = {
  logger,
  loggers,
  logError,
  logSuccess,
  logWarning,
  createHttpLogger,
  maskPII
};
