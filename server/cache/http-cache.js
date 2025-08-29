/**
 * M3.7 HTTP Caching Middleware
 * ETag, Last-Modified, and Cache-Control headers for browser/CDN caching
 */

const etag = require('etag');
const fresh = require('fresh');
const { logger } = require('../monitoring/logger');

class HttpCacheManager {
  constructor() {
    this.isETagEnabled = process.env.HTTP_ETAG_ENABLED === 'true';
    this.isCacheEnabled = process.env.HTTP_CACHE_ENABLED === 'true';
  }

  /**
   * Generate ETag for response body
   */
  generateETag(body, options = {}) {
    try {
      if (!this.isETagEnabled || !body) {
        return null;
      }

      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      return etag(bodyString, { weak: options.weak !== false });
      
    } catch (error) {
      logger.error('ETag generation error', { error: error.message });
      return null;
    }
  }

  /**
   * Check if request is fresh (304 Not Modified)
   */
  isFresh(req, res) {
    try {
      return fresh(req.headers, {
        'etag': res.get('ETag'),
        'last-modified': res.get('Last-Modified')
      });
    } catch (error) {
      logger.error('Fresh check error', { error: error.message });
      return false;
    }
  }

  /**
   * Generate Last-Modified date
   */
  generateLastModified(data = null) {
    if (!data) {
      return new Date().toUTCString();
    }

    // Extract date from data if available
    if (Array.isArray(data) && data.length > 0) {
      // For arrays, use the most recent updated_at or created_at
      const dates = data
        .map(item => item.updated_at || item.created_at)
        .filter(date => date)
        .sort((a, b) => new Date(b) - new Date(a));
      
      if (dates.length > 0) {
        return new Date(dates[0]).toUTCString();
      }
    } else if (data.updated_at || data.created_at) {
      // For single objects
      const date = data.updated_at || data.created_at;
      return new Date(date).toUTCString();
    }

    return new Date().toUTCString();
  }

  /**
   * Set Cache-Control headers based on content type and TTL
   */
  setCacheControl(res, options = {}) {
    if (!this.isCacheEnabled) {
      return;
    }

    const {
      maxAge = 300, // 5 minutes default
      staleWhileRevalidate = null,
      mustRevalidate = false,
      noCache = false,
      noStore = false,
      isPrivate = false,
      immutable = false
    } = options;

    let cacheControl = [];

    if (noStore) {
      cacheControl.push('no-store');
    } else if (noCache) {
      cacheControl.push('no-cache');
    } else {
      // Public vs Private
      cacheControl.push(isPrivate ? 'private' : 'public');
      
      // Max age
      cacheControl.push(`max-age=${maxAge}`);
      
      // Stale while revalidate
      if (staleWhileRevalidate) {
        cacheControl.push(`stale-while-revalidate=${staleWhileRevalidate}`);
      }
      
      // Must revalidate
      if (mustRevalidate) {
        cacheControl.push('must-revalidate');
      }
      
      // Immutable (for static assets)
      if (immutable) {
        cacheControl.push('immutable');
      }
    }

    res.set('Cache-Control', cacheControl.join(', '));
  }

  /**
   * Apply Vary headers for content negotiation
   */
  setVaryHeaders(res, varyHeaders = []) {
    const defaultVary = ['Accept-Encoding'];
    const allVary = [...defaultVary, ...varyHeaders];
    res.set('Vary', [...new Set(allVary)].join(', '));
  }
}

// Singleton instance
const httpCacheManager = new HttpCacheManager();

/**
 * Express middleware for HTTP caching
 */
function withHttpCache(options = {}) {
  const {
    maxAge = 300,
    staleWhileRevalidate = null,
    mustRevalidate = false,
    varyByAuth = false,
    varyBy = [],
    generateLastModified = true,
    weak = true
  } = options;

  return (req, res, next) => {
    // Skip for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if caching is disabled
    if (!httpCacheManager.isCacheEnabled && !httpCacheManager.isETagEnabled) {
      return next();
    }

    // Set Vary headers
    const varyHeaders = [...varyBy];
    if (varyByAuth) {
      varyHeaders.push('Authorization', 'Cookie');
    }
    httpCacheManager.setVaryHeaders(res, varyHeaders);

    // Override res.json to add cache headers
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Generate and set ETag
        if (httpCacheManager.isETagEnabled) {
          const etagValue = httpCacheManager.generateETag(data, { weak });
          if (etagValue) {
            res.set('ETag', etagValue);
          }
        }

        // Generate and set Last-Modified
        if (generateLastModified) {
          const lastModified = httpCacheManager.generateLastModified(data);
          res.set('Last-Modified', lastModified);
        }

        // Check if request is fresh (304 Not Modified)
        if (httpCacheManager.isFresh(req, res)) {
          logger.debug('HTTP cache hit - 304 Not Modified', {
            path: req.path,
            etag: res.get('ETag'),
            lastModified: res.get('Last-Modified')
          });
          
          return res.status(304).end();
        }

        // Set Cache-Control headers
        httpCacheManager.setCacheControl(res, {
          maxAge,
          staleWhileRevalidate: staleWhileRevalidate || Math.floor(maxAge * 2),
          mustRevalidate,
          isPrivate: varyByAuth
        });

        // Add cache debug headers in development
        if (process.env.NODE_ENV === 'development') {
          res.set('X-Cache-TTL', maxAge.toString());
          res.set('X-Cache-SWR', (staleWhileRevalidate || Math.floor(maxAge * 2)).toString());
        }
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware for static assets (long-term caching)
 */
function withStaticCache(options = {}) {
  const {
    maxAge = 31536000, // 1 year
    immutable = true
  } = options;

  return (req, res, next) => {
    // Set aggressive caching for static assets
    httpCacheManager.setCacheControl(res, {
      maxAge,
      immutable,
      isPrivate: false
    });

    // Set Vary header for compression
    res.set('Vary', 'Accept-Encoding');

    next();
  };
}

/**
 * Middleware to disable caching
 */
function withNoCache() {
  return (req, res, next) => {
    httpCacheManager.setCacheControl(res, {
      noCache: true,
      mustRevalidate: true
    });
    
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    next();
  };
}

/**
 * Middleware to set private caching
 */
function withPrivateCache(maxAge = 300) {
  return (req, res, next) => {
    httpCacheManager.setCacheControl(res, {
      maxAge,
      isPrivate: true,
      mustRevalidate: true
    });
    
    next();
  };
}

module.exports = {
  httpCacheManager,
  HttpCacheManager,
  withHttpCache,
  withStaticCache,
  withNoCache,
  withPrivateCache,
  
  // Utility functions
  generateETag: (body, options) => httpCacheManager.generateETag(body, options),
  isFresh: (req, res) => httpCacheManager.isFresh(req, res),
  generateLastModified: (data) => httpCacheManager.generateLastModified(data),
  setCacheControl: (res, options) => httpCacheManager.setCacheControl(res, options)
};