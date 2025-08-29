#!/usr/bin/env node

/**
 * Simple M3.7 Cache Performance Test
 * Quick validation of cache functionality and performance
 */

const http = require('http');

class SimpleCacheTest {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.testEndpoints = [
      '/reviews/deal/cache-test-123',
      '/comments/deal/cache-test-123', 
      '/metrics/cache'
    ];
  }

  /**
   * Run simple cache test
   */
  async runTest() {
    console.log('🧪 M3.7 Simple Cache Performance Test');
    console.log('=====================================\n');

    const results = [];

    for (const endpoint of this.testEndpoints) {
      console.log(`Testing: ${endpoint}`);
      
      // First request (should be slow - cache miss)
      const firstRequest = await this.makeRequest(endpoint);
      console.log(`  First request: ${firstRequest.duration}ms (cache miss expected)`);
      
      // Wait a moment
      await this.sleep(100);
      
      // Second request (should be fast - cache hit)
      const secondRequest = await this.makeRequest(endpoint);
      console.log(`  Second request: ${secondRequest.duration}ms (cache hit expected)`);
      
      const improvement = firstRequest.duration > 0 ? 
        ((firstRequest.duration - secondRequest.duration) / firstRequest.duration * 100).toFixed(1) : 0;
      
      console.log(`  Performance improvement: ${improvement}%`);
      console.log('');
      
      results.push({
        endpoint,
        firstRequest,
        secondRequest,
        improvement: parseFloat(improvement)
      });
    }

    this.displaySummary(results);
  }

  /**
   * Make HTTP request and measure performance
   */
  makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = http.get(`${this.baseUrl}${endpoint}`, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            duration,
            headers: res.headers,
            dataLength: data.length
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Display test summary
   */
  displaySummary(results) {
    console.log('📊 CACHE TEST SUMMARY');
    console.log('=====================');
    
    let totalImprovement = 0;
    let validTests = 0;
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.endpoint}`);
      console.log(`   First: ${result.firstRequest.duration}ms`);
      console.log(`   Second: ${result.secondRequest.duration}ms`);
      console.log(`   Improvement: ${result.improvement}%`);
      
      if (result.firstRequest.statusCode === 200 && result.secondRequest.statusCode === 200) {
        totalImprovement += result.improvement;
        validTests++;
      }
      console.log('');
    });
    
    const avgImprovement = validTests > 0 ? (totalImprovement / validTests).toFixed(1) : 0;
    
    console.log(`Average Performance Improvement: ${avgImprovement}%`);
    console.log(`Valid Tests: ${validTests}/${results.length}`);
    
    if (avgImprovement > 50) {
      console.log('🎉 EXCELLENT: Cache is providing significant performance improvements!');
    } else if (avgImprovement > 20) {
      console.log('✅ GOOD: Cache is working and improving performance.');
    } else if (avgImprovement > 0) {
      console.log('⚠️  FAIR: Cache is working but improvements are modest.');
    } else {
      console.log('❌ NEEDS ATTENTION: Cache may not be working properly.');
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new SimpleCacheTest();
  test.runTest()
    .then(() => {
      console.log('\n✅ Simple cache test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = SimpleCacheTest;