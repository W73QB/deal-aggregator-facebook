/**
 * M3.7 Cache Middleware
 * High-performance caching layer with intelligent key management
 */

const crypto = require('crypto');
const { redisClient } = require('./redis');
const { logger } = require('../monitoring/logger');
const { businessMetrics } = require('../monitoring/metrics');
const { withHttpCache } = require('./http-cache');

class CacheManager {
  constructor() {
    this.isEnabled = process.env.CACHE_ENABLED === 'true';
    this.defaultTTL = parseInt(process.env.CACHE_DEFAULT_TTL_S || '300');
    this.keyPrefix = 'dealradarus:v1:';
  }

  /**
   * Build standardized cache key
   */
  buildCacheKey(req, options = {}) {
    const { 
      path = req.path,
      query = req.query,
      varyByAuth = false,
      customKey = null 
    } = options;

    if (customKey) {
      return `${this.keyPrefix}${customKey}`;
    }

    // Normalize path
    const normalizedPath = path.replace(/\/$/, '') || '/';
    
    // Extract and sort relevant query parameters
    const relevantParams = this.extractRelevantParams(query);
    const queryString = this.buildQueryString(relevantParams);
    
    // Auth variation (if needed)
    let authSuffix = '';
    if (varyByAuth && req.user) {
      const authHash = crypto
        .createHash('md5')
        .update(`${req.user.id}:${req.user.role}`)
        .digest('hex')
        .substring(0, 8);
      authSuffix = `:auth:${authHash}`;
    }

    const cacheKey = `${this.keyPrefix}${normalizedPath}${queryString}${authSuffix}`;
    
    // Ensure key length is reasonable
    if (cacheKey.length > 250) {
      const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
      return `${this.keyPrefix}hash:${hash}`;
    }
    
    return cacheKey;
  }

  /**
   * Extract relevant query parameters for caching
   */
  extractRelevantParams(query) {
    const relevantParams = {};
    const allowedParams = [
      'page', 'limit', 'offset', 'sort', 'order', 
      'deal_id', 'review_id', 'user_id', 
      'status', 'category', 'rating',
      'start_date', 'end_date',
      'search', 'filter'
    ];

    for (const param of allowedParams) {
      if (query[param] !== undefined && query[param] !== null && query[param] !== '') {
        relevantParams[param] = query[param];
      }
    }

    return relevantParams;
  }

  /**
   * Build consistent query string from parameters
   */
  buildQueryString(params) {
    if (Object.keys(params).length === 0) {
      return '';
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return `:${crypto.createHash('md5').update(sortedParams).digest('hex').substring(0, 12)}`;
  }

  /**
   * Get cached data
   */
  async get(key) {
    try {
      if (!this.isEnabled) {
        return null;
      }

      const client = await redisClient.getClient();
      const startTime = Date.now();
      
      const cached = await client.get(key);
      const duration = Date.now() - startTime;
      
      if (cached) {
        const parsed = JSON.parse(cached);
        
        // Track cache hit metrics
        businessMetrics.trackCacheOperation('get', 'hit', duration);
        
        logger.debug('Cache HIT', { 
          key: key.substring(0, 100), 
          size: cached.length,
          duration
        });
        
        return parsed;
      } else {
        // Track cache miss metrics
        businessMetrics.trackCacheOperation('get', 'miss', duration);
        
        logger.debug('Cache MISS', { 
          key: key.substring(0, 100),
          duration
        });
        
        return null;
      }
      
    } catch (error) {
      logger.error('Cache GET error', { 
        key: key.substring(0, 100),
        error: error.message 
      });
      
      // Track cache error metrics
      businessMetrics.trackCacheOperation('get', 'error', 0);
      
      // Fail gracefully - return null to allow DB query
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key, data, ttl = null) {
    try {
      if (!this.isEnabled) {
        return false;
      }

      const client = await redisClient.getClient();
      const serialized = JSON.stringify(data);
      const finalTTL = ttl || this.defaultTTL;
      
      // Add TTL jitter to prevent cache stampede (±10%)
      const jitteredTTL = Math.floor(finalTTL * (0.9 + Math.random() * 0.2));
      
      const startTime = Date.now();
      await client.setex(key, jitteredTTL, serialized);
      const duration = Date.now() - startTime;
      
      logger.debug('Cache SET', { 
        key: key.substring(0, 100),
        ttl: jitteredTTL,
        size: serialized.length,
        duration
      });
      
      // Track cache set metrics
      businessMetrics.trackCacheOperation('set', 'success', duration);
      
      return true;
      
    } catch (error) {
      logger.error('Cache SET error', { 
        key: key.substring(0, 100),
        error: error.message,
        dataSize: data ? JSON.stringify(data).length : 0
      });
      
      // Track cache error metrics  
      businessMetrics.trackCacheOperation('set', 'error', 0);
      
      // Fail gracefully
      return false;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    try {
      if (!this.isEnabled) {
        return false;
      }

      const client = await redisClient.getClient();
      const startTime = Date.now();
      
      const result = await client.del(key);
      const duration = Date.now() - startTime;
      
      logger.debug('Cache DEL', { 
        key: key.substring(0, 100),
        deleted: result,
        duration
      });
      
      // Track cache delete metrics
      businessMetrics.trackCacheOperation('delete', 'redis', duration);
      
      return result > 0;
      
    } catch (error) {
      logger.error('Cache DEL error', { 
        key: key.substring(0, 100),
        error: error.message 
      });
      
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    try {
      if (!this.isEnabled) {
        return 0;
      }

      const client = await redisClient.getClient();
      const startTime = Date.now();
      
      // Get keys matching pattern
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      // Delete in batches to avoid blocking
      const batchSize = 100;
      let deletedCount = 0;
      
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        const result = await client.del(...batch);
        deletedCount += result;
      }
      
      const duration = Date.now() - startTime;
      
      logger.info('Cache pattern delete', { 
        pattern,
        keysFound: keys.length,
        keysDeleted: deletedCount,
        duration
      });
      
      // Track bulk delete metrics
      businessMetrics.trackCacheOperation('bulk_delete', 'redis', duration);
      
      return deletedCount;
      
    } catch (error) {
      logger.error('Cache pattern delete error', { 
        pattern,
        error: error.message 
      });
      
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isEnabled) {
        return false;
      }

      const client = await redisClient.getClient();
      const result = await client.exists(key);
      return result === 1;
      
    } catch (error) {
      logger.error('Cache EXISTS error', { 
        key: key.substring(0, 100),
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (!this.isEnabled) {
        return { enabled: false };
      }

      const info = await redisClient.getInfo();
      
      return {
        enabled: true,
        connected: await redisClient.isHealthy(),
        keyspace: info?.stats?.keyspace_hits || 0,
        memory: info?.memory?.used_memory_human || '0B',
        clients: info?.server?.connected_clients || 0,
        version: info?.server?.redis_version || 'unknown'
      };
      
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return { enabled: true, error: error.message };
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

/**
 * Express middleware for caching GET requests
 */
function withCache(ttl = null, options = {}) {
  const {
    varyByAuth = false,
    customKeyFn = null,
    skipCache = false,
    httpCache = true
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if disabled or requested
    if (skipCache || !cacheManager.isEnabled) {
      res.set('X-Cache', 'DISABLED');
      return next();
    }

    // Build cache key
    let cacheKey;
    if (customKeyFn) {
      cacheKey = customKeyFn(req);
    } else {
      cacheKey = cacheManager.buildCacheKey(req, { varyByAuth });
    }

    try {
      // Try to get from cache
      const cached = await cacheManager.get(cacheKey);
      
      if (cached) {
        // Cache hit - return cached data
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey.substring(0, 50) + '...');
        
        // Set cache headers if configured
        if (process.env.HTTP_CACHE_ENABLED === 'true') {
          const maxAge = ttl || cacheManager.defaultTTL;
          res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${Math.floor(maxAge * 2)}`);
        }
        
        return res.json(cached);
      }

      // Cache miss - continue to handler and cache response
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey.substring(0, 50) + '...');

      // Apply HTTP cache middleware if enabled
      if (httpCache && process.env.HTTP_CACHE_ENABLED === 'true') {
        const httpCacheMiddleware = withHttpCache({
          maxAge: ttl || cacheManager.defaultTTL,
          varyByAuth
        });
        httpCacheMiddleware(req, res, () => {});
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setImmediate(async () => {
            await cacheManager.set(cacheKey, data, ttl);
          });
        }
        
        return originalJson(data);
      };

      next();
      
    } catch (error) {
      logger.error('Cache middleware error', { 
        error: error.message,
        path: req.path 
      });
      
      // Fail gracefully - continue without caching
      res.set('X-Cache', 'ERROR');
      next();
    }
  };
}

module.exports = {
  cacheManager,
  withCache,
  CacheManager,
  
  // Convenience exports
  buildCacheKey: (req, options) => cacheManager.buildCacheKey(req, options),
  get: (key) => cacheManager.get(key),
  set: (key, data, ttl) => cacheManager.set(key, data, ttl),
  del: (key) => cacheManager.del(key),
  delPattern: (pattern) => cacheManager.delPattern(pattern),
  exists: (key) => cacheManager.exists(key),
  getStats: () => cacheManager.getStats()
};
