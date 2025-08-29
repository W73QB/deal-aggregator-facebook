/**
 * M3.8 Phase 5: Worker Coordination System  
 * Redis-based distributed locks and singleton patterns for multi-instance deployments
 */

const Redis = require('ioredis');
const crypto = require('crypto');
const { logger } = require('../monitoring/logger');

class WorkerCoordinator {
  constructor() {
    this.redis = null;
    this.workerId = this.generateWorkerId();
    this.locks = new Map();
    this.heartbeatInterval = null;
    this.lockRenewalInterval = null;
  }

  /**
   * Initialize Redis connection and worker coordination
   */
  async initialize() {
    try {
      this.redis = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        keyPrefix: 'dealradarus:worker:',
        commandTimeout: 5000
      });

      await this.redis.connect();
      
      // Start worker heartbeat
      await this.startHeartbeat();
      
      // Start lock renewal process
      this.startLockRenewal();

      logger.info('Worker coordinator initialized', {
        workerId: this.workerId,
        redisStatus: 'connected'
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize worker coordinator', {
        error: error.message,
        workerId: this.workerId
      });
      throw error;
    }
  }

  /**
   * Generate unique worker ID
   */
  generateWorkerId() {
    const hostname = require('os').hostname();
    const pid = process.pid;
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    return `worker_${hostname}_${pid}_${timestamp}_${random}`;
  }

  /**
   * Acquire distributed lock with timeout
   */
  async acquireLock(lockName, ttlMs = 300000, timeoutMs = 10000) {
    const lockKey = `lock:${lockName}`;
    const lockValue = `${this.workerId}:${Date.now()}`;
    const startTime = Date.now();

    logger.debug('Attempting to acquire lock', {
      lockName,
      workerId: this.workerId,
      ttlMs,
      timeoutMs
    });

    while (Date.now() - startTime < timeoutMs) {
      try {
        // Try to acquire lock with SET if not exists
        const result = await this.redis.set(
          lockKey, 
          lockValue, 
          'PX', 
          ttlMs, 
          'NX'
        );

        if (result === 'OK') {
          // Lock acquired successfully
          this.locks.set(lockName, {
            key: lockKey,
            value: lockValue,
            ttl: ttlMs,
            acquiredAt: Date.now(),
            renewedAt: Date.now()
          });

          logger.info('Lock acquired successfully', {
            lockName,
            workerId: this.workerId,
            ttl: ttlMs
          });

          return {
            success: true,
            lockName,
            workerId: this.workerId,
            ttl: ttlMs
          };
        }

        // Lock is held by someone else, wait and retry
        await this.delay(100 + Math.random() * 200); // Jittered retry

      } catch (error) {
        logger.error('Error acquiring lock', {
          lockName,
          workerId: this.workerId,
          error: error.message
        });
        
        await this.delay(1000);
      }
    }

    // Timeout reached
    logger.warn('Lock acquisition timeout', {
      lockName,
      workerId: this.workerId,
      timeoutMs
    });

    return {
      success: false,
      lockName,
      error: 'Timeout waiting for lock'
    };
  }

  /**
   * Release distributed lock
   */
  async releaseLock(lockName) {
    const lock = this.locks.get(lockName);
    if (!lock) {
      logger.warn('Attempted to release non-existent lock', {
        lockName,
        workerId: this.workerId
      });
      return false;
    }

    try {
      // Lua script to safely release lock only if we own it
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(
        luaScript,
        1,
        lock.key,
        lock.value
      );

      if (result === 1) {
        this.locks.delete(lockName);
        logger.info('Lock released successfully', {
          lockName,
          workerId: this.workerId
        });
        return true;
      } else {
        logger.warn('Failed to release lock - not owner', {
          lockName,
          workerId: this.workerId
        });
        return false;
      }

    } catch (error) {
      logger.error('Error releasing lock', {
        lockName,
        workerId: this.workerId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Execute function with distributed lock
   */
  async withLock(lockName, fn, options = {}) {
    const {
      ttl = 300000,      // 5 minutes
      timeout = 10000,   // 10 seconds
      autoRelease = true
    } = options;

    const lockResult = await this.acquireLock(lockName, ttl, timeout);
    
    if (!lockResult.success) {
      throw new Error(`Failed to acquire lock '${lockName}': ${lockResult.error}`);
    }

    try {
      logger.debug('Executing function with lock', {
        lockName,
        workerId: this.workerId
      });

      const result = await fn();
      
      logger.debug('Function completed with lock', {
        lockName,
        workerId: this.workerId
      });

      return result;

    } finally {
      if (autoRelease) {
        await this.releaseLock(lockName);
      }
    }
  }

  /**
   * Check if we are the singleton worker for a specific job
   */
  async isSingletonWorker(jobName, ttlMs = 300000) {
    const singletonKey = `singleton:${jobName}`;
    
    try {
      const result = await this.redis.set(
        singletonKey,
        this.workerId,
        'PX',
        ttlMs,
        'NX'
      );

      if (result === 'OK') {
        logger.info('Singleton worker role acquired', {
          jobName,
          workerId: this.workerId,
          ttl: ttlMs
        });
        return true;
      }

      // Check if we're already the singleton
      const currentWorker = await this.redis.get(singletonKey);
      if (currentWorker === this.workerId) {
        // Renew our singleton status
        await this.redis.pexpire(singletonKey, ttlMs);
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Error checking singleton status', {
        jobName,
        workerId: this.workerId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Start worker heartbeat
   */
  async startHeartbeat() {
    const heartbeatKey = `heartbeat:${this.workerId}`;
    
    const sendHeartbeat = async () => {
      try {
        await this.redis.setex(heartbeatKey, 60, JSON.stringify({
          workerId: this.workerId,
          hostname: require('os').hostname(),
          pid: process.pid,
          timestamp: Date.now(),
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }));
      } catch (error) {
        logger.error('Heartbeat failed', {
          workerId: this.workerId,
          error: error.message
        });
      }
    };

    // Initial heartbeat
    await sendHeartbeat();

    // Regular heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(sendHeartbeat, 30000);
  }

  /**
   * Start automatic lock renewal
   */
  startLockRenewal() {
    this.lockRenewalInterval = setInterval(async () => {
      for (const [lockName, lock] of this.locks) {
        try {
          const now = Date.now();
          const timeUntilExpiry = (lock.renewedAt + lock.ttl) - now;
          
          // Renew if less than 25% of TTL remaining
          if (timeUntilExpiry < lock.ttl * 0.25) {
            const luaScript = `
              if redis.call("GET", KEYS[1]) == ARGV[1] then
                return redis.call("PEXPIRE", KEYS[1], ARGV[2])
              else
                return 0
              end
            `;

            const result = await this.redis.eval(
              luaScript,
              1,
              lock.key,
              lock.value,
              lock.ttl
            );

            if (result === 1) {
              lock.renewedAt = now;
              logger.debug('Lock renewed', {
                lockName,
                workerId: this.workerId,
                ttl: lock.ttl
              });
            } else {
              // We no longer own this lock
              this.locks.delete(lockName);
              logger.warn('Lock lost during renewal', {
                lockName,
                workerId: this.workerId
              });
            }
          }
        } catch (error) {
          logger.error('Lock renewal failed', {
            lockName,
            workerId: this.workerId,
            error: error.message
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get list of active workers
   */
  async getActiveWorkers() {
    try {
      const keys = await this.redis.keys('heartbeat:*');
      const workers = [];

      for (const key of keys) {
        try {
          const data = await this.redis.get(key);
          if (data) {
            const worker = JSON.parse(data);
            // Check if heartbeat is recent (< 2 minutes)
            if (Date.now() - worker.timestamp < 120000) {
              workers.push(worker);
            }
          }
        } catch (error) {
          logger.warn('Invalid worker heartbeat data', { key });
        }
      }

      return workers;
    } catch (error) {
      logger.error('Error getting active workers', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Clean shutdown
   */
  async shutdown() {
    logger.info('Worker coordinator shutting down', {
      workerId: this.workerId
    });

    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.lockRenewalInterval) {
      clearInterval(this.lockRenewalInterval);
    }

    // Release all locks
    for (const lockName of this.locks.keys()) {
      await this.releaseLock(lockName);
    }

    // Remove heartbeat
    try {
      await this.redis.del(`heartbeat:${this.workerId}`);
    } catch (error) {
      logger.warn('Error removing heartbeat', { error: error.message });
    }

    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
    }

    logger.info('Worker coordinator shutdown complete', {
      workerId: this.workerId
    });
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let coordinator = null;

/**
 * Get singleton worker coordinator instance
 */
function getCoordinator() {
  if (!coordinator) {
    coordinator = new WorkerCoordinator();
  }
  return coordinator;
}

module.exports = {
  WorkerCoordinator,
  getCoordinator
};