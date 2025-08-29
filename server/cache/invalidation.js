/**
 * M3.7 Cache Invalidation System
 * Intelligent cache busting for data consistency
 */

const { cacheManager } = require('./cache-middleware');
const { logger } = require('../monitoring/logger');
const { businessMetrics } = require('../monitoring/metrics');

class CacheInvalidator {
  constructor() {
    this.isEnabled = process.env.CACHE_BUST_ON_WRITE === 'true';
    this.keyPrefix = 'dealradarus:v1:';
  }

  /**
   * Bust cache keys by patterns
   */
  async bustKeys(patterns, context = {}) {
    if (!this.isEnabled || !patterns || patterns.length === 0) {
      return 0;
    }

    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      for (const pattern of patterns) {
        const fullPattern = pattern.startsWith(this.keyPrefix) 
          ? pattern 
          : `${this.keyPrefix}${pattern}`;
        
        const deleted = await cacheManager.delPattern(fullPattern);
        totalDeleted += deleted;
        
        logger.debug('Cache bust pattern', {
          pattern: fullPattern,
          deleted,
          context
        });
      }

      const duration = Date.now() - startTime;

      logger.info('Cache invalidation completed', {
        patterns: patterns.length,
        totalDeleted,
        duration,
        context
      });

      // Track metrics
      businessMetrics.trackCacheOperation('invalidation', 'redis', duration);
      
      return totalDeleted;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Cache invalidation error', {
        patterns,
        error: error.message,
        duration,
        context
      });

      businessMetrics.trackCacheOperation('invalidation_error', 'redis', duration);
      return 0;
    }
  }

  /**
   * Review-related cache invalidation
   */
  async bustReviews(dealId, userId = null, reviewId = null) {
    const patterns = [
      `/reviews*`, // All reviews endpoints
      `/reviews:deal:${dealId}:*`, // Deal-specific reviews
    ];

    if (userId) {
      patterns.push(`/reviews:user:${userId}:*`); // User-specific reviews
    }

    if (reviewId) {
      patterns.push(`/reviews:review:${reviewId}:*`); // Specific review
    }

    // Also bust comments related to this deal
    patterns.push(`/comments:deal:${dealId}:*`);

    return this.bustKeys(patterns, {
      action: 'review_invalidation',
      dealId,
      userId,
      reviewId
    });
  }

  /**
   * Comment-related cache invalidation
   */
  async bustComments(dealId = null, reviewId = null, userId = null) {
    const patterns = [
      `/comments*`, // All comments endpoints
    ];

    if (dealId) {
      patterns.push(`/comments:deal:${dealId}:*`);
    }

    if (reviewId) {
      patterns.push(`/comments:review:${reviewId}:*`);
      // Also bust the parent review as comment counts may have changed
      patterns.push(`/reviews:review:${reviewId}:*`);
    }

    if (userId) {
      patterns.push(`/comments:user:${userId}:*`);
    }

    return this.bustKeys(patterns, {
      action: 'comment_invalidation',
      dealId,
      reviewId,
      userId
    });
  }

  /**
   * Report-related cache invalidation
   */
  async bustReports(contentType = null, contentId = null, userId = null) {
    const patterns = [
      `/reports*`, // All reports endpoints
      `/reports:queue:*`, // Reports queue
      `/reports:list:*`, // Reports list
    ];

    if (contentType && contentId) {
      patterns.push(`/reports:${contentType}:${contentId}:*`);
      
      // If content was moderated, bust the content itself
      if (contentType === 'review') {
        patterns.push(`/reviews:review:${contentId}:*`);
      } else if (contentType === 'comment') {
        patterns.push(`/comments:comment:${contentId}:*`);
      }
    }

    if (userId) {
      patterns.push(`/reports:user:${userId}:*`);
    }

    return this.bustKeys(patterns, {
      action: 'report_invalidation',
      contentType,
      contentId,
      userId
    });
  }

  /**
   * Vote-related cache invalidation
   */
  async bustVotes(reviewId, dealId, userId = null) {
    const patterns = [
      `/reviews:review:${reviewId}:*`, // Specific review (vote counts changed)
      `/reviews:deal:${dealId}:*`, // Deal reviews (sorting may have changed)
    ];

    if (userId) {
      patterns.push(`/votes:user:${userId}:*`);
    }

    return this.bustKeys(patterns, {
      action: 'vote_invalidation',
      reviewId,
      dealId,
      userId
    });
  }

  /**
   * Deal-related cache invalidation
   */
  async bustDeals(dealId, category = null) {
    const patterns = [
      `/deals*`, // All deals endpoints
      `/deals:deal:${dealId}:*`, // Specific deal
      `/reviews:deal:${dealId}:*`, // Deal reviews
      `/comments:deal:${dealId}:*`, // Deal comments
    ];

    if (category) {
      patterns.push(`/deals:category:${category}:*`);
    }

    return this.bustKeys(patterns, {
      action: 'deal_invalidation',
      dealId,
      category
    });
  }

  /**
   * User-related cache invalidation
   */
  async bustUser(userId) {
    const patterns = [
      `/reviews:user:${userId}:*`,
      `/comments:user:${userId}:*`,
      `/reports:user:${userId}:*`,
      `/votes:user:${userId}:*`,
      `/user:${userId}:*`,
    ];

    return this.bustKeys(patterns, {
      action: 'user_invalidation',
      userId
    });
  }

  /**
   * Admin/moderation cache invalidation
   */
  async bustAdmin(action, targetType = null, targetId = null) {
    const patterns = [
      `/reports*`, // All admin reports
      `/admin*`, // Admin endpoints
    ];

    if (targetType && targetId) {
      if (targetType === 'review') {
        patterns.push(`/reviews:review:${targetId}:*`);
      } else if (targetType === 'comment') {
        patterns.push(`/comments:comment:${targetId}:*`);
      }
    }

    return this.bustKeys(patterns, {
      action: 'admin_invalidation',
      moderationAction: action,
      targetType,
      targetId
    });
  }

  /**
   * Notification-related cache invalidation
   */
  async bustNotifications(userId, channel = null) {
    const patterns = [
      `/notifications*`,
      `/notifications:user:${userId}:*`,
    ];

    if (channel) {
      patterns.push(`/notifications:${channel}:*`);
    }

    return this.bustKeys(patterns, {
      action: 'notification_invalidation',
      userId,
      channel
    });
  }

  /**
   * Complete cache flush (emergency use only)
   */
  async flushAll() {
    try {
      const startTime = Date.now();
      const client = await require('./redis').getClient();
      
      // Only flush keys with our prefix to avoid affecting other applications
      const deleted = await this.bustKeys(['*']);
      
      const duration = Date.now() - startTime;

      logger.warn('Complete cache flush executed', {
        deleted,
        duration,
        timestamp: new Date().toISOString()
      });

      businessMetrics.trackCacheOperation('flush_all', 'redis', duration);
      
      return deleted;

    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
      throw error;
    }
  }

  /**
   * Warm up critical cache paths
   */
  async warmup(criticalPaths = []) {
    if (!this.isEnabled || criticalPaths.length === 0) {
      return;
    }

    logger.info('Starting cache warmup', { paths: criticalPaths.length });

    const startTime = Date.now();
    let warmedUp = 0;

    try {
      // This would typically make requests to warm up cache
      // For now, we'll just log the intention
      for (const path of criticalPaths) {
        // In a real implementation, you'd make HTTP requests here
        logger.debug('Would warm up cache for path', { path });
        warmedUp++;
      }

      const duration = Date.now() - startTime;

      logger.info('Cache warmup completed', {
        paths: warmedUp,
        duration
      });

      businessMetrics.trackCacheOperation('warmup', 'redis', duration);

    } catch (error) {
      logger.error('Cache warmup error', { error: error.message });
    }
  }

  /**
   * Get invalidation statistics
   */
  getStats() {
    return {
      enabled: this.isEnabled,
      keyPrefix: this.keyPrefix,
      patterns: {
        reviews: 'reviews:deal:{dealId}:*, reviews:user:{userId}:*',
        comments: 'comments:deal:{dealId}:*, comments:review:{reviewId}:*',
        reports: 'reports:queue:*, reports:list:*',
        votes: 'reviews:review:{reviewId}:*, reviews:deal:{dealId}:*'
      }
    };
  }
}

// Singleton instance
const cacheInvalidator = new CacheInvalidator();

// Convenience wrapper functions
const invalidation = {
  /**
   * Reviews invalidation
   */
  reviews: (dealId, userId = null, reviewId = null) => 
    cacheInvalidator.bustReviews(dealId, userId, reviewId),

  /**
   * Comments invalidation
   */
  comments: (dealId = null, reviewId = null, userId = null) => 
    cacheInvalidator.bustComments(dealId, reviewId, userId),

  /**
   * Reports invalidation
   */
  reports: (contentType = null, contentId = null, userId = null) => 
    cacheInvalidator.bustReports(contentType, contentId, userId),

  /**
   * Votes invalidation
   */
  votes: (reviewId, dealId, userId = null) => 
    cacheInvalidator.bustVotes(reviewId, dealId, userId),

  /**
   * Deals invalidation
   */
  deals: (dealId, category = null) => 
    cacheInvalidator.bustDeals(dealId, category),

  /**
   * User invalidation
   */
  user: (userId) => 
    cacheInvalidator.bustUser(userId),

  /**
   * Admin/moderation invalidation
   */
  admin: (action, targetType = null, targetId = null) => 
    cacheInvalidator.bustAdmin(action, targetType, targetId),

  /**
   * Notifications invalidation
   */
  notifications: (userId, channel = null) => 
    cacheInvalidator.bustNotifications(userId, channel),

  /**
   * Custom pattern invalidation
   */
  custom: (patterns, context = {}) => 
    cacheInvalidator.bustKeys(patterns, context),

  /**
   * Complete flush (emergency)
   */
  flushAll: () => 
    cacheInvalidator.flushAll(),

  /**
   * Cache warmup
   */
  warmup: (paths) => 
    cacheInvalidator.warmup(paths),

  /**
   * Get stats
   */
  getStats: () => 
    cacheInvalidator.getStats()
};

module.exports = {
  cacheInvalidator,
  CacheInvalidator,
  invalidation,
  
  // Direct exports for convenience
  bustKeys: (patterns, context) => cacheInvalidator.bustKeys(patterns, context),
  bustReviews: (dealId, userId, reviewId) => cacheInvalidator.bustReviews(dealId, userId, reviewId),
  bustComments: (dealId, reviewId, userId) => cacheInvalidator.bustComments(dealId, reviewId, userId),
  bustReports: (contentType, contentId, userId) => cacheInvalidator.bustReports(contentType, contentId, userId),
  bustVotes: (reviewId, dealId, userId) => cacheInvalidator.bustVotes(reviewId, dealId, userId)
};