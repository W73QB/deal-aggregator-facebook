/**
 * Input Validation Middleware using Joi
 */

const Joi = require('joi');

// Common validation schemas
const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required().max(254),
    password: Joi.string().min(8).max(128).required(),
    first_name: Joi.string().trim().max(50).optional(),
    last_name: Joi.string().trim().max(50).optional(),
    newsletter_subscribed: Joi.boolean().default(false)
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  verifyEmail: Joi.object({
    token: Joi.string().hex().length(64).required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().hex().length(64).required(),
    password: Joi.string().min(8).max(128).required()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(128).required()
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().trim().max(50).allow('').optional(),
    last_name: Joi.string().trim().max(50).allow('').optional(),
    newsletter_subscribed: Joi.boolean().optional(),
    preferences: Joi.object().optional()
  }),

  // Saved Filters validation
  createFilter: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    criteria: Joi.object().required(),
    is_active: Joi.boolean().default(true)
  }),

  updateFilter: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    criteria: Joi.object().optional(),
    is_active: Joi.boolean().optional()
  }).min(1),

  // Alerts validation
  createAlert: Joi.object({
    filter_id: Joi.string().uuid().required(),
    frequency: Joi.string().valid('instant', 'daily', 'weekly').required(),
    is_active: Joi.boolean().default(true)
  }),

  updateAlert: Joi.object({
    frequency: Joi.string().valid('instant', 'daily', 'weekly').optional(),
    is_active: Joi.boolean().optional()
  }).min(1),

  // UGC Reviews validation
  createReview: Joi.object({
    deal_id: Joi.string().trim().min(1).max(100).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().trim().min(3).max(200).required(),
    content: Joi.string().trim().min(10).max(5000).required(),
    metadata: Joi.object().optional()
  }),

  updateReview: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    title: Joi.string().trim().min(3).max(200).optional(),
    content: Joi.string().trim().min(10).max(5000).optional(),
    metadata: Joi.object().optional()
  }).min(1),

  voteOnReview: Joi.object({
    helpful: Joi.boolean().required()
  }),

  // UGC Comments validation
  createComment: Joi.object({
    deal_id: Joi.string().trim().min(1).max(100).optional(),
    review_id: Joi.string().uuid().optional(),
    parent_id: Joi.string().uuid().optional(),
    content: Joi.string().trim().min(3).max(2000).required()
  }).custom((value, helpers) => {
    // Ensure either deal_id or review_id is provided
    if (!value.deal_id && !value.review_id) {
      return helpers.error('custom.dealOrReviewRequired');
    }
    return value;
  }, 'Deal or Review ID validation'),

  updateComment: Joi.object({
    content: Joi.string().trim().min(3).max(2000).required()
  }),

  voteOnComment: Joi.object({
    helpful: Joi.boolean().required()
  }),

  // UGC Reports validation  
  createReport: Joi.object({
    content_type: Joi.string().valid('review', 'comment').required(),
    content_id: Joi.string().uuid().required(),
    reason: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().max(1000).optional()
  }),

  updateReport: Joi.object({
    status: Joi.string().valid('pending', 'reviewing', 'dismissed', 'action_taken').required(),
    action_taken: Joi.string().trim().max(500).optional()
  }),

  bulkUpdateReports: Joi.object({
    report_ids: Joi.array().items(Joi.string().uuid()).min(1).max(50).required(),
    status: Joi.string().valid('pending', 'reviewing', 'dismissed', 'action_taken').required(),
    action_taken: Joi.string().trim().max(500).optional()
  })
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with sanitized/converted values
    req.body = value;
    next();
  };
}

// Custom email normalization
function normalizeEmail(req, res, next) {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  next();
}

// Sanitize HTML input (basic)
function sanitizeHtml(req, res, next) {
  function stripHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
  }

  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = stripHtml(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    
    return obj;
  }

  req.body = sanitizeObject({ ...req.body });
  next();
}

module.exports = {
  validate,
  normalizeEmail,
  sanitizeHtml,
  schemas
};