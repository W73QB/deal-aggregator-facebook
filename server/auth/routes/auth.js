/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/auth');
const verificationController = require('../controllers/verification');

// Import middleware
const { validate, normalizeEmail, sanitizeHtml } = require('../middleware/validation');
const { authGuard } = require('../middleware/auth');
const rateLimit = require('../middleware/rate-limit');

// Apply common middleware
router.use(express.json({ limit: '10mb' }));
router.use(sanitizeHtml);

// Public routes
router.post('/signup', 
  normalizeEmail,
  rateLimit.signupIP,
  validate('signup'),
  authController.signup
);

router.post('/login',
  normalizeEmail,
  rateLimit.loginRateLimit,
  validate('login'),
  authController.login
);

router.post('/refresh',
  rateLimit.generalAPI,
  authController.refresh
);

router.post('/logout',
  authController.logout
);

// Email verification routes
router.post('/verify-email',
  rateLimit.verifyEmailIP,
  validate('verifyEmail'),
  verificationController.verifyEmail
);

router.post('/resend-verification',
  normalizeEmail,
  rateLimit.verifyEmailIP,
  validate('forgotPassword'), // Reuse schema (just needs email)
  verificationController.resendVerification
);

// Password reset routes
router.post('/forgot-password',
  normalizeEmail,
  rateLimit.forgotPasswordRateLimit,
  validate('forgotPassword'),
  verificationController.forgotPassword
);

router.post('/reset-password',
  rateLimit.generalAPI,
  validate('resetPassword'),
  verificationController.resetPassword
);

// Protected routes (require authentication)
router.use(authGuard());

router.get('/me',
  rateLimit.generalAPI,
  authController.me
);

router.post('/change-password',
  rateLimit.generalAPI,
  validate('changePassword'),
  verificationController.changePassword
);

module.exports = router;