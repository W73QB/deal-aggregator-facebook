/**
 * M3.7 Redis Client Configuration
 * High-performance Redis client with auto-retry and health monitoring
 */

const Redis = require('ioredis');
const { logger } = require('../monitoring/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 10;
    this.retryDelayBase = 1000; // 1 second base delay
  }

  /**
   * Initialize Redis connection with retry logic
   */
  async initialize() {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      
      // Redis configuration with optimizations
      const config = {
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4, // IPv4
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
      };

      this.client = new Redis(redisUrl, config);

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis client connected', { 
          url: redisUrl.replace(/:\/\/.*@/, '://***@'), // Hide credentials
          attempt: this.connectionAttempts 
        });
        this.isConnected = true;
        this.connectionAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready for commands');
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error', { 
          error: err.message,
          stack: err.stack,
          attempt: this.connectionAttempts
        });
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis client connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', (ms) => {
        this.connectionAttempts++;
        logger.info('Redis client reconnecting', { 
          delay: ms,
          attempt: this.connectionAttempts,
          maxRetries: this.maxRetries
        });
      });

      this.client.on('end', () => {
        logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
      
      // Verify connection with ping
      await this.ping();
      
      logger.info('Redis client initialized successfully', {
        version: await this.client.info('server').then(info => 
          info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown'
        ),
        keyspace: await this.client.info('keyspace')
      });

      return this.client;

    } catch (error) {
      logger.error('Failed to initialize Redis client', { 
        error: error.message,
        stack: error.stack,
        attempt: this.connectionAttempts
      });
      
      // Retry with exponential backoff
      if (this.connectionAttempts < this.maxRetries) {
        const delay = this.retryDelayBase * Math.pow(2, this.connectionAttempts);
        logger.info('Retrying Redis connection', { 
          delay,
          attempt: this.connectionAttempts + 1,
          maxRetries: this.maxRetries
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initialize();
      }
      
      throw new Error(`Redis connection failed after ${this.maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * Health check ping
   */
  async ping() {
    try {
      if (!this.client) {
        throw new Error('Redis client not initialized');
      }
      
      const result = await this.client.ping();
      
      if (result !== 'PONG') {
        throw new Error(`Expected PONG, got: ${result}`);
      }
      
      this.isConnected = true;
      return result;
      
    } catch (error) {
      logger.error('Redis ping failed', { error: error.message });
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Get Redis client instance
   */
  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected and healthy
   */
  async isHealthy() {
    try {
      await this.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Redis information for monitoring
   */
  async getInfo() {
    try {
      if (!this.client || !this.isConnected) {
        return null;
      }

      const [serverInfo, memoryInfo, stats] = await Promise.all([
        this.client.info('server'),
        this.client.info('memory'),
        this.client.info('stats')
      ]);

      return {
        server: this.parseRedisInfo(serverInfo),
        memory: this.parseRedisInfo(memoryInfo),
        stats: this.parseRedisInfo(stats),
        connected: this.isConnected,
        connectionAttempts: this.connectionAttempts
      };
      
    } catch (error) {
      logger.error('Failed to get Redis info', { error: error.message });
      return null;
    }
  }

  /**
   * Parse Redis INFO response
   */
  parseRedisInfo(infoString) {
    const info = {};
    const lines = infoString.split('\r\n');
    
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          // Convert numeric values
          const numValue = parseFloat(value);
          info[key] = isNaN(numValue) ? value : numValue;
        }
      }
    }
    
    return info;
  }

  /**
   * Gracefully close Redis connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        logger.info('Redis client connection closed gracefully');
      }
    } catch (error) {
      logger.error('Error closing Redis connection', { error: error.message });
      // Force disconnect
      if (this.client) {
        this.client.disconnect();
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Execute Redis command with error handling
   */
  async execute(command, ...args) {
    try {
      if (!this.client || !this.isConnected) {
        await this.initialize();
      }
      
      return await this.client[command](...args);
      
    } catch (error) {
      logger.error('Redis command failed', { 
        command,
        args: args.slice(0, 2), // Log first 2 args to avoid sensitive data
        error: error.message
      });
      throw error;
    }
  }
}

// Singleton instance
const redisClient = new RedisClient();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing Redis connection...');
  await redisClient.close();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing Redis connection...');
  await redisClient.close();
});

module.exports = {
  redisClient,
  RedisClient,
  
  // Convenience methods
  async ping() {
    return redisClient.ping();
  },
  
  async initialize() {
    return redisClient.initialize();
  },
  
  async getClient() {
    if (!redisClient.isConnected) {
      await redisClient.initialize();
    }
    return redisClient.getClient();
  },
  
  async isHealthy() {
    return redisClient.isHealthy();
  },
  
  async getInfo() {
    return redisClient.getInfo();
  }
};
