/**
 * M3.7 HTTP Static Assets & CDN Preparation
 * Optimizes static content delivery and browser caching
 */

const path = require('path');
const express = require('express');
const compression = require('compression');

class StaticAssetsOptimizer {
  constructor() {
    this.cacheConfig = {
      // Long-term caching for versioned assets (1 year)
      versioned: {
        maxAge: '365d',
        immutable: true,
        extensions: ['.js', '.css', '.woff2', '.woff', '.ttf', '.eot']
      },
      
      // Medium-term caching for images (30 days)
      images: {
        maxAge: '30d',
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']
      },
      
      // Short-term caching for HTML and API responses (5 minutes)
      dynamic: {
        maxAge: '5m',
        extensions: ['.html', '.json']
      },
      
      // No caching for development
      nocache: {
        maxAge: 0,
        extensions: ['.map']
      }
    };
  }

  /**
   * Create Express static middleware with optimized caching
   */
  createStaticMiddleware(staticPath, options = {}) {
    const {
      enableCompression = true,
      enableEtag = true,
      enableLastModified = true,
      customHeaders = {}
    } = options;

    const middlewares = [];

    // Add compression for all static assets
    if (enableCompression) {
      middlewares.push(compression({
        filter: (req, res) => {
          // Don't compress if response already compressed
          if (req.headers['x-no-compression']) return false;
          
          // Use compression filter function
          return compression.filter(req, res);
        },
        level: 6,
        threshold: 1024, // Only compress files larger than 1KB
        chunkSize: 1024
      }));
    }

    // Add cache headers based on file type
    middlewares.push((req, res, next) => {
      const ext = path.extname(req.path).toLowerCase();
      const config = this.getCacheConfigForExtension(ext);
      
      if (config) {
        // Set cache headers
        this.setCacheHeaders(res, config, customHeaders);
      }
      
      next();
    });

    // Add Express static middleware
    middlewares.push(express.static(staticPath, {
      maxAge: this.cacheConfig.dynamic.maxAge,
      etag: enableEtag,
      lastModified: enableLastModified,
      index: false, // Disable directory indexing for security
      dotfiles: 'ignore', // Ignore dotfiles
      setHeaders: (res, path, _stat) => {
        // Additional headers for specific files
        if (path.endsWith('.js')) {
          res.set('Content-Type', 'application/javascript; charset=utf-8');
        } else if (path.endsWith('.css')) {
          res.set('Content-Type', 'text/css; charset=utf-8');
        }
      }
    }));

    return middlewares;
  }

  /**
   * Get cache configuration for file extension
   */
  getCacheConfigForExtension(ext) {
    for (const [configName, config] of Object.entries(this.cacheConfig)) {
      if (config.extensions && config.extensions.includes(ext)) {
        return { ...config, name: configName };
      }
    }
    
    // Default to dynamic caching
    return { ...this.cacheConfig.dynamic, name: 'dynamic' };
  }

  /**
   * Set HTTP cache headers based on configuration
   */
  setCacheHeaders(res, config, customHeaders = {}) {
    const maxAgeSeconds = this.parseMaxAge(config.maxAge);
    
    if (maxAgeSeconds === 0) {
      // No caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    } else {
      // Set caching headers
      const cacheControl = [
        `max-age=${maxAgeSeconds}`,
        'public'
      ];
      
      if (config.immutable) {
        cacheControl.push('immutable');
      }
      
      res.set({
        'Cache-Control': cacheControl.join(', '),
        'X-Cache-Config': config.name
      });
    }
    
    // Add custom headers
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      res.set(customHeaders);
    }
    
    // Security headers for all static assets
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });
  }

  /**
   * Parse maxAge string to seconds
   */
  parseMaxAge(maxAge) {
    if (typeof maxAge === 'number') return maxAge;
    if (typeof maxAge !== 'string') return 300; // Default 5 minutes
    
    const match = maxAge.match(/^(\d+)([smhd])$/);
    if (!match) return 300;
    
    const [, num, unit] = match;
    const value = parseInt(num);
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 300;
    }
  }

  /**
   * Create CDN-ready asset URLs with versioning
   */
  createAssetUrl(assetPath, version = null) {
    const baseUrl = process.env.CDN_BASE_URL || process.env.FRONTEND_URL || '';
    const versionParam = version || process.env.APP_VERSION || Date.now();
    
    if (assetPath.includes('?')) {
      return `${baseUrl}${assetPath}&v=${versionParam}`;
    } else {
      return `${baseUrl}${assetPath}?v=${versionParam}`;
    }
  }

  /**
   * Middleware for API response caching headers
   */
  createApiCacheMiddleware(options = {}) {
    const {
      maxAge = '5m',
      varyBy = ['Accept', 'Accept-Encoding'],
      isPrivate = false,
      staleWhileRevalidate = null,
      staleIfError = null
    } = options;

    return (req, res, next) => {
      const maxAgeSeconds = this.parseMaxAge(maxAge);
      
      const cacheControl = [
        `max-age=${maxAgeSeconds}`,
        isPrivate ? 'private' : 'public'
      ];
      
      if (staleWhileRevalidate) {
        cacheControl.push(`stale-while-revalidate=${this.parseMaxAge(staleWhileRevalidate)}`);
      }
      
      if (staleIfError) {
        cacheControl.push(`stale-if-error=${this.parseMaxAge(staleIfError)}`);
      }
      
      res.set({
        'Cache-Control': cacheControl.join(', '),
        'Vary': varyBy.join(', ')
      });
      
      next();
    };
  }

  /**
   * Service Worker cache strategies helper
   */
  generateServiceWorkerConfig() {
    return {
      cacheStrategies: {
        // Cache-first for versioned assets
        versioned: {
          strategy: 'CacheFirst',
          cacheName: 'versioned-assets',
          plugins: [{
            cacheKeyWillBeUsed: async ({ request }) => {
              // Remove version parameter for consistent caching
              const url = new URL(request.url);
              url.searchParams.delete('v');
              return url.href;
            }
          }]
        },
        
        // Stale-while-revalidate for images
        images: {
          strategy: 'StaleWhileRevalidate',
          cacheName: 'images',
          plugins: [{
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200;
            }
          }]
        },
        
        // Network-first for API calls
        api: {
          strategy: 'NetworkFirst',
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
          plugins: [{
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 && response.headers.get('content-type')?.includes('application/json');
            }
          }]
        }
      }
    };
  }

  /**
   * Generate cache manifest for browser preloading
   */
  generateCacheManifest(assets = []) {
    return {
      version: process.env.APP_VERSION || Date.now(),
      cache: assets.map(asset => this.createAssetUrl(asset)),
      network: ['*'], // Allow all network requests
      fallback: {
        '/': '/offline.html'
      }
    };
  }
}

// Export singleton instance
module.exports = new StaticAssetsOptimizer();
