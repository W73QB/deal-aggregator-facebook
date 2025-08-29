/**
 * Rate Limiting Middleware
 */

const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');

// In-memory rate limiters (for development)
const rateLimiters = {
  // Login attempts per IP
  loginIP: new RateLimiterMemory({
    points: 5, // Number of attempts
    duration: 900, // Per 15 minutes
    blockDuration: 900, // Block for 15 minutes
  }),

  // Login attempts per email
  loginEmail: new RateLimiterMemory({
    points: 3, // Number of attempts  
    duration: 900, // Per 15 minutes
    blockDuration: 3600, // Block for 1 hour
  }),

  // Signup attempts per IP
  signupIP: new RateLimiterMemory({
    points: 3, // Number of signups
    duration: 3600, // Per 1 hour
    blockDuration: 3600, // Block for 1 hour
  }),

  // Password reset per IP
  forgotPasswordIP: new RateLimiterMemory({
    points: 3, // Number of attempts
    duration: 3600, // Per 1 hour  
    blockDuration: 3600, // Block for 1 hour
  }),

  // Password reset per email
  forgotPasswordEmail: new RateLimiterMemory({
    points: 3, // Number of attempts
    duration: 3600, // Per 1 hour
    blockDuration: 7200, // Block for 2 hours
  }),

  // Email verification requests
  verifyEmailIP: new RateLimiterMemory({
    points: 5, // Number of attempts
    duration: 3600, // Per 1 hour
    blockDuration: 3600, // Block for 1 hour
  }),

  // General API requests per IP
  generalAPI: new RateLimiterMemory({
    points: 100, // Number of requests
    duration: 900, // Per 15 minutes
    blockDuration: 300, // Block for 5 minutes
  }),

  // UGC Content creation (reviews, comments) per user
  ugcContent: new RateLimiterMemory({
    points: 10, // Number of content posts
    duration: 3600, // Per 1 hour
    blockDuration: 1800, // Block for 30 minutes
  }),

  // UGC Voting (helpful/not helpful) per user
  ugcVoting: new RateLimiterMemory({
    points: 50, // Number of votes
    duration: 3600, // Per 1 hour
    blockDuration: 600, // Block for 10 minutes
  }),

  // UGC Reporting (abuse reports) per user
  ugcReporting: new RateLimiterMemory({
    points: 5, // Number of reports
    duration: 3600, // Per 1 hour
    blockDuration: 3600, // Block for 1 hour
  })
};

function createRateLimitMiddleware(limiterName, keyGenerator = null) {
  return async (req, res, next) => {
    const limiter = rateLimiters[limiterName];
    
    if (!limiter) {
      console.warn(`Rate limiter '${limiterName}' not found`);
      return next();
    }

    try {
      // Generate key for rate limiting
      let key;
      if (keyGenerator) {
        key = keyGenerator(req);
      } else if (limiterName.includes('Email')) {
        key = req.body.email || req.ip;
      } else {
        key = req.ip;
      }

      // Check rate limit
      await limiter.consume(key);
      
      // Add rate limit headers
      const resRateLimiter = await limiter.get(key);
      if (resRateLimiter) {
        res.set({
          'X-RateLimit-Limit': limiter.points,
          'X-RateLimit-Remaining': resRateLimiter.remainingPoints,
          'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext).toISOString()
        });
      }

      next();
    } catch (rateLimiterRes) {
      // Rate limit exceeded
      const remainingPoints = rateLimiterRes?.remainingPoints || 0;
      const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
      const totalHits = rateLimiterRes?.totalHits || 0;

      res.set({
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
        'Retry-After': Math.round(msBeforeNext / 1000)
      });

      // Log rate limit violation
      console.warn(`Rate limit exceeded for ${limiterName}:`, {
        key: keyGenerator ? keyGenerator(req) : req.ip,
        totalHits,
        remainingPoints,
        msBeforeNext
      });

      return res.status(429).json({
        success: false,
        message: getRateLimitMessage(limiterName),
        retryAfter: Math.round(msBeforeNext / 1000),
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  };
}

function getRateLimitMessage(limiterName) {
  const messages = {
    loginIP: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    loginEmail: 'Too many login attempts for this email. Please try again in 1 hour.',
    signupIP: 'Too many signup attempts from this IP. Please try again in 1 hour.',
    forgotPasswordIP: 'Too many password reset attempts from this IP. Please try again in 1 hour.',
    forgotPasswordEmail: 'Too many password reset attempts for this email. Please try again in 2 hours.',
    verifyEmailIP: 'Too many email verification attempts from this IP. Please try again in 1 hour.',
    generalAPI: 'Too many API requests. Please slow down and try again in 5 minutes.',
    ugcContent: 'Too many content posts. Please wait 30 minutes before posting again.',
    ugcVoting: 'Too many votes submitted. Please wait 10 minutes before voting again.',
    ugcReporting: 'Too many reports submitted. Please wait 1 hour before reporting again.'
  };

  return messages[limiterName] || 'Rate limit exceeded. Please try again later.';
}

// Middleware factories
const rateLimits = {
  loginIP: createRateLimitMiddleware('loginIP'),
  loginEmail: createRateLimitMiddleware('loginEmail', (req) => req.body.email),
  signupIP: createRateLimitMiddleware('signupIP'),
  forgotPasswordIP: createRateLimitMiddleware('forgotPasswordIP'),
  forgotPasswordEmail: createRateLimitMiddleware('forgotPasswordEmail', (req) => req.body.email),
  verifyEmailIP: createRateLimitMiddleware('verifyEmailIP'),
  generalAPI: createRateLimitMiddleware('generalAPI'),
  ugcContent: createRateLimitMiddleware('ugcContent', (req) => req.user?.id || req.ip),
  ugcVoting: createRateLimitMiddleware('ugcVoting', (req) => req.user?.id || req.ip),
  ugcReporting: createRateLimitMiddleware('ugcReporting', (req) => req.user?.id || req.ip)
};

// Combined middleware for login (both IP and email limits)
function loginRateLimit(req, res, next) {
  rateLimits.loginIP(req, res, (err) => {
    if (err) return;
    rateLimits.loginEmail(req, res, next);
  });
}

// Combined middleware for forgot password
function forgotPasswordRateLimit(req, res, next) {
  rateLimits.forgotPasswordIP(req, res, (err) => {
    if (err) return;
    rateLimits.forgotPasswordEmail(req, res, next);
  });
}

module.exports = {
  ...rateLimits,
  loginRateLimit,
  forgotPasswordRateLimit,
  createRateLimitMiddleware
};