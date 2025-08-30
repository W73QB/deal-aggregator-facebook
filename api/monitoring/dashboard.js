/**
 * Basic Monitoring Dashboard
 * Aggregates health metrics from various services
 */

module.exports = async (req, res) => {
  try {
    const services = [];
    const startTime = Date.now();
    
    // Redis Health Check (direct)
    try {
      const { isHealthy } = require('../../server/cache/redis.js');
      const redisHealthy = await isHealthy();
      
      services.push({
        name: 'Redis Cache',
        status: redisHealthy ? 'healthy' : 'unhealthy',
        responseTime: 'N/A', // Direct call - no HTTP overhead
        clientType: 'UpstashHttpClient',
        alerts: redisHealthy ? [{level: 'info', message: 'Operational'}] : [{level: 'error', message: 'Connection failed'}],
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      services.push({
        name: 'Redis Cache',
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      });
    }
    
    // Worker Coordination Quick Test
    try {
      const { WorkerCoordinator } = require('../../server/coordination/worker-coordinator.js');
      const coordinator = new WorkerCoordinator();
      await coordinator.initialize();
      
      // Quick functionality test
      const testLock = await coordinator.acquireLock('dashboard-test', 5000, 2000);
      if (testLock) await coordinator.releaseLock('dashboard-test');
      await coordinator.shutdown();
      
      services.push({
        name: 'Worker Coordination',
        status: testLock ? 'healthy' : 'warning',
        testsPasssed: testLock ? '1/1' : '0/1',
        clientType: 'UpstashHttpClient', 
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      services.push({
        name: 'Worker Coordination',
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      });
    }
    
    // Calculate overall status
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const overallStatus = healthyCount === totalServices ? 'healthy' : 
                         healthyCount > totalServices / 2 ? 'warning' : 'critical';
    
    const dashboardTime = Date.now() - startTime;
    
    res.json({
      dashboard: {
        status: overallStatus,
        healthyServices: healthyCount,
        totalServices: totalServices,
        responseTime: dashboardTime + 'ms'
      },
      services,
      alerts: services.flatMap(s => s.alerts || []).filter(a => a.level !== 'info'),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Dashboard generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};