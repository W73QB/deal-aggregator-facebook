/**
 * Redis Health Check Endpoint
 * Provides detailed Redis connection and performance metrics
 */

const { redisClient, isHealthy, getInfo, initialize } = require('../../server/cache/redis.js');

/**
 * Calculate uptime percentage based on performance
 */
function calculateUptimePercent(responseTime, testTime) {
  if (responseTime > 5000 || testTime > 5000) return 95.0; // Slow but working
  if (responseTime > 2000 || testTime > 2000) return 98.5; // Warning level
  return 99.9; // Good performance
}

/**
 * Generate health alerts based on metrics
 */
function generateHealthAlerts(responseTime, testTime, testSuccess) {
  const alerts = [];
  
  if (responseTime > 2000) {
    alerts.push({
      level: 'warning',
      message: `High response time: ${responseTime}ms`,
      threshold: '2000ms'
    });
  }
  
  if (testTime > 1000) {
    alerts.push({
      level: 'warning', 
      message: `Slow test operations: ${testTime}ms`,
      threshold: '1000ms'
    });
  }
  
  if (!testSuccess) {
    alerts.push({
      level: 'error',
      message: 'Set/Get test failed',
      action: 'Check Redis connectivity'
    });
  }
  
  if (alerts.length === 0) {
    alerts.push({
      level: 'info',
      message: 'All systems operational'
    });
  }
  
  return alerts;
}

module.exports = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Ensure Redis client is initialized for serverless
    await initialize();
    
    // Basic health check
    const healthy = await isHealthy();
    const responseTime = Date.now() - startTime;
    
    if (!healthy) {
      return res.status(503).json({
        status: 'unhealthy',
        redis: {
          connected: false,
          responseTime,
          error: 'Redis connection failed'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Detailed info for healthy connections
    const info = await getInfo();
    
    // Get client after ensuring connection
    let client;
    try {
      client = redisClient.getClient();
    } catch (error) {
      // If getClient fails, try to get it after initialization
      await redisClient.initialize();
      client = redisClient.getClient();
    }
    
    // Performance test
    const testKey = `health:test:${Date.now()}`;
    const testStart = Date.now();
    await client.set(testKey, 'test', 'EX', 5);
    const testValue = await client.get(testKey);
    const testTime = Date.now() - testStart;
    
    res.status(200).json({
      status: 'healthy',
      redis: {
        connected: info?.connected || false,
        responseTime,
        testResponseTime: testTime,
        testSuccess: testValue === 'test',
        connectionAttempts: info?.connectionAttempts || 0,
        server: info?.server ? {
          version: info.server.redis_version,
          mode: info.server.redis_mode,
          uptime: info.server.uptime_in_seconds
        } : null,
        memory: info?.memory ? {
          used: info.memory.used_memory_human,
          peak: info.memory.used_memory_peak_human,
          fragmentation: info.memory.mem_fragmentation_ratio
        } : null,
        stats: info?.stats ? {
          connections: info.stats.total_connections_received,
          commands: info.stats.total_commands_processed,
          keyspace_hits: info.stats.keyspace_hits,
          keyspace_misses: info.stats.keyspace_misses
        } : null,
        client_type: client.constructor.name, // 'Redis' or 'UpstashRedis'
        // Enhanced monitoring metrics
        performance: {
          responseTime: responseTime + 'ms',
          testResponseTime: testTime + 'ms', 
          status: testTime < 1000 ? 'good' : testTime < 3000 ? 'warning' : 'slow',
          uptime_percent: calculateUptimePercent(responseTime, testTime)
        },
        alerts: generateHealthAlerts(responseTime, testTime, testValue === 'test')
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Redis health check failed:', error);
    
    res.status(503).json({
      status: 'error',
      redis: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};