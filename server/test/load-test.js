#!/usr/bin/env node

/**
 * M3.7 Load Testing with Autocannon
 * Comprehensive performance testing for cache-enabled endpoints
 */

const autocannon = require('autocannon');
const path = require('path');
const fs = require('fs');

class LoadTester {
  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
    this.testResults = [];
    this.scenarios = [
      {
        name: 'Reviews Endpoint (Cache Test)',
        url: '/reviews/deal/test-deal-123',
        method: 'GET',
        duration: 30,
        connections: 10,
        pipelining: 1,
        expectedCacheHit: true
      },
      {
        name: 'Comments Endpoint (Cache Test)',
        url: '/comments/deal/test-deal-123',
        method: 'GET', 
        duration: 30,
        connections: 10,
        pipelining: 1,
        expectedCacheHit: true
      },
      {
        name: 'High Load Reviews Test',
        url: '/reviews/deal/test-deal-456',
        method: 'GET',
        duration: 60,
        connections: 50,
        pipelining: 10,
        expectedCacheHit: true
      },
      {
        name: 'Metrics Endpoint Test',
        url: '/metrics/cache',
        method: 'GET',
        duration: 15,
        connections: 5,
        pipelining: 1,
        expectedCacheHit: false
      },
      {
        name: 'Mixed Load Pattern',
        requests: [
          { method: 'GET', path: '/reviews/deal/mixed-test-1' },
          { method: 'GET', path: '/reviews/deal/mixed-test-2' },
          { method: 'GET', path: '/comments/deal/mixed-test-1' },
          { method: 'GET', path: '/comments/review/test-review-1' }
        ],
        duration: 45,
        connections: 25,
        pipelining: 5
      }
    ];
  }

  /**
   * Run all load test scenarios
   */
  async runAllTests() {
    console.log('🚀 Starting M3.7 Load Testing Suite');
    console.log('=====================================');
    console.log(`Target URL: ${this.baseUrl}`);
    console.log(`Test Scenarios: ${this.scenarios.length}`);
    console.log('');

    const startTime = Date.now();
    
    for (let i = 0; i < this.scenarios.length; i++) {
      const scenario = this.scenarios[i];
      console.log(`📊 Running Test ${i + 1}/${this.scenarios.length}: ${scenario.name}`);
      
      try {
        const result = await this.runScenario(scenario);
        this.testResults.push(result);
        
        // Display immediate results
        this.displayResult(result);
        
        // Wait between tests to allow cache to stabilize
        if (i < this.scenarios.length - 1) {
          console.log('⏱️  Waiting 10s before next test...\n');
          await this.sleep(10000);
        }
        
      } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        this.testResults.push({
          scenario: scenario.name,
          error: error.message,
          success: false
        });
      }
    }

    const duration = Date.now() - startTime;
    await this.generateReport(duration);
  }

  /**
   * Run individual test scenario
   */
  async runScenario(scenario) {
    const config = {
      url: this.baseUrl,
      duration: scenario.duration,
      connections: scenario.connections,
      pipelining: scenario.pipelining || 1,
      timeout: 10000, // 10s timeout
      headers: {
        'User-Agent': 'M3.7-Load-Tester/1.0',
        'Accept': 'application/json'
      }
    };

    if (scenario.url) {
      // Single endpoint test
      config.url += scenario.url;
      config.method = scenario.method || 'GET';
    } else if (scenario.requests) {
      // Mixed requests test
      config.requests = scenario.requests.map(req => ({
        method: req.method,
        path: req.path,
        headers: {
          'Accept': 'application/json'
        }
      }));
    }

    console.log(`  Duration: ${scenario.duration}s, Connections: ${scenario.connections}, Pipelining: ${scenario.pipelining}`);
    
    const startTime = Date.now();
    const result = await autocannon(config);
    const endTime = Date.now();
    
    // Process results
    const processed = {
      scenario: scenario.name,
      success: true,
      duration: (endTime - startTime) / 1000,
      config: {
        duration: scenario.duration,
        connections: scenario.connections,
        pipelining: scenario.pipelining
      },
      results: {
        totalRequests: result.requests.total,
        requestsPerSecond: Math.round(result.requests.average),
        throughputMB: Math.round(result.throughput.average / 1024 / 1024 * 100) / 100,
        latency: {
          average: Math.round(result.latency.average * 100) / 100,
          p50: Math.round(result.latency.p50 * 100) / 100,
          p95: Math.round(result.latency.p95 * 100) / 100,
          p99: Math.round(result.latency.p99 * 100) / 100,
          max: Math.round(result.latency.max * 100) / 100
        },
        statusCodes: result.requests.statusCodeStats || {},
        errors: result.errors || 0,
        timeouts: result.timeouts || 0,
        non2xx: result.non2xx || 0
      },
      performance: {
        successRate: result.requests.total > 0 ? 
          ((result.requests.total - (result.errors || 0) - (result.timeouts || 0) - (result.non2xx || 0)) / result.requests.total * 100).toFixed(2) : 0,
        errorRate: result.requests.total > 0 ? 
          (((result.errors || 0) + (result.timeouts || 0) + (result.non2xx || 0)) / result.requests.total * 100).toFixed(2) : 0
      },
      expectedCacheHit: scenario.expectedCacheHit || false,
      timestamp: new Date().toISOString()
    };

    return processed;
  }

  /**
   * Display test result summary
   */
  displayResult(result) {
    if (!result.success) {
      console.log(`  ❌ FAILED: ${result.error}\n`);
      return;
    }

    const { results, performance } = result;
    
    console.log(`  ✅ Requests: ${results.totalRequests} (${results.requestsPerSecond}/s)`);
    console.log(`  ⚡ Latency: avg=${results.latency.average}ms, p95=${results.latency.p95}ms, p99=${results.latency.p99}ms`);
    console.log(`  📊 Success Rate: ${performance.successRate}%, Error Rate: ${performance.errorRate}%`);
    console.log(`  💾 Throughput: ${results.throughputMB} MB/s`);
    
    if (results.errors > 0 || results.timeouts > 0) {
      console.log(`  ⚠️  Errors: ${results.errors}, Timeouts: ${results.timeouts}`);
    }
    
    console.log('');
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport(totalDuration) {
    console.log('📋 Generating Load Test Report');
    console.log('===============================');

    const report = {
      metadata: {
        testSuite: 'M3.7 Cache & Performance Load Testing',
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        totalDuration: Math.round(totalDuration / 1000),
        totalScenarios: this.scenarios.length,
        successfulTests: this.testResults.filter(r => r.success).length,
        failedTests: this.testResults.filter(r => !r.success).length
      },
      summary: {
        totalRequests: this.testResults.reduce((sum, r) => sum + (r.results?.totalRequests || 0), 0),
        avgRequestsPerSecond: Math.round(this.testResults.reduce((sum, r) => sum + (r.results?.requestsPerSecond || 0), 0) / this.testResults.length),
        avgLatency: Math.round(this.testResults.reduce((sum, r) => sum + (r.results?.latency?.average || 0), 0) / this.testResults.length * 100) / 100,
        overallSuccessRate: this.calculateOverallSuccessRate(),
        cacheableEndpointsPerformance: this.analyzeCacheableEndpoints()
      },
      scenarios: this.testResults,
      performance_analysis: this.analyzePerformance(),
      recommendations: this.generateRecommendations()
    };

    // Console output
    console.log(`\n📊 LOAD TEST SUMMARY`);
    console.log(`====================`);
    console.log(`Total Requests: ${report.summary.totalRequests.toLocaleString()}`);
    console.log(`Avg RPS: ${report.summary.avgRequestsPerSecond}`);
    console.log(`Avg Latency: ${report.summary.avgLatency}ms`);
    console.log(`Overall Success: ${report.summary.overallSuccessRate}%`);
    console.log(`Test Duration: ${report.metadata.totalDuration}s`);
    console.log(`Successful Tests: ${report.metadata.successfulTests}/${report.metadata.totalScenarios}`);

    // Performance Analysis
    console.log(`\n🔍 PERFORMANCE ANALYSIS`);
    console.log(`========================`);
    report.performance_analysis.forEach(analysis => {
      console.log(`${analysis.metric}: ${analysis.status} - ${analysis.message}`);
    });

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS`);
    console.log(`==================`);
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Save detailed report
    const reportPath = path.join(__dirname, `load-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Detailed report saved: ${reportPath}`);

    // Generate performance score
    const performanceScore = this.calculatePerformanceScore();
    console.log(`\n🏆 M3.7 PERFORMANCE SCORE: ${performanceScore}/100`);
    
    if (performanceScore >= 90) {
      console.log('🎉 EXCELLENT! Your cache optimization is performing exceptionally well.');
    } else if (performanceScore >= 75) {
      console.log('✅ GOOD! Performance is solid with room for minor improvements.');
    } else if (performanceScore >= 60) {
      console.log('⚠️  FAIR! Consider implementing the recommendations above.');
    } else {
      console.log('❌ NEEDS IMPROVEMENT! Critical performance issues detected.');
    }

    return report;
  }

  /**
   * Calculate overall success rate
   */
  calculateOverallSuccessRate() {
    const totalRequests = this.testResults.reduce((sum, r) => sum + (r.results?.totalRequests || 0), 0);
    const totalErrors = this.testResults.reduce((sum, r) => sum + (r.results?.errors || 0) + (r.results?.timeouts || 0) + (r.results?.non2xx || 0), 0);
    
    return totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests * 100).toFixed(2) : 0;
  }

  /**
   * Analyze cacheable endpoints performance
   */
  analyzeCacheableEndpoints() {
    const cacheableTests = this.testResults.filter(r => r.expectedCacheHit && r.success);
    
    if (cacheableTests.length === 0) return null;
    
    const avgLatency = cacheableTests.reduce((sum, r) => sum + r.results.latency.average, 0) / cacheableTests.length;
    const avgRps = cacheableTests.reduce((sum, r) => sum + r.results.requestsPerSecond, 0) / cacheableTests.length;
    
    return {
      endpoints: cacheableTests.length,
      avgLatency: Math.round(avgLatency * 100) / 100,
      avgRps: Math.round(avgRps),
      cacheEffectiveness: avgLatency < 50 ? 'Excellent' : avgLatency < 100 ? 'Good' : 'Needs Improvement'
    };
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance() {
    const analysis = [];
    const successfulTests = this.testResults.filter(r => r.success);
    
    if (successfulTests.length === 0) {
      return [{ metric: 'Overall', status: '❌', message: 'No successful tests to analyze' }];
    }

    // Latency Analysis
    const avgLatency = successfulTests.reduce((sum, r) => sum + r.results.latency.average, 0) / successfulTests.length;
    if (avgLatency < 50) {
      analysis.push({ metric: 'Latency', status: '🟢', message: `Excellent response times (${avgLatency.toFixed(1)}ms avg)` });
    } else if (avgLatency < 200) {
      analysis.push({ metric: 'Latency', status: '🟡', message: `Acceptable response times (${avgLatency.toFixed(1)}ms avg)` });
    } else {
      analysis.push({ metric: 'Latency', status: '🔴', message: `High latency detected (${avgLatency.toFixed(1)}ms avg)` });
    }

    // Throughput Analysis
    const avgRps = successfulTests.reduce((sum, r) => sum + r.results.requestsPerSecond, 0) / successfulTests.length;
    if (avgRps > 1000) {
      analysis.push({ metric: 'Throughput', status: '🟢', message: `High throughput achieved (${Math.round(avgRps)} RPS avg)` });
    } else if (avgRps > 500) {
      analysis.push({ metric: 'Throughput', status: '🟡', message: `Moderate throughput (${Math.round(avgRps)} RPS avg)` });
    } else {
      analysis.push({ metric: 'Throughput', status: '🔴', message: `Low throughput (${Math.round(avgRps)} RPS avg)` });
    }

    // Error Rate Analysis
    const overallSuccessRate = parseFloat(this.calculateOverallSuccessRate());
    if (overallSuccessRate >= 99) {
      analysis.push({ metric: 'Reliability', status: '🟢', message: `Excellent reliability (${overallSuccessRate}% success)` });
    } else if (overallSuccessRate >= 95) {
      analysis.push({ metric: 'Reliability', status: '🟡', message: `Good reliability (${overallSuccessRate}% success)` });
    } else {
      analysis.push({ metric: 'Reliability', status: '🔴', message: `Poor reliability (${overallSuccessRate}% success)` });
    }

    return analysis;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const successfulTests = this.testResults.filter(r => r.success);
    
    if (successfulTests.length === 0) {
      recommendations.push('Fix application errors before conducting performance analysis');
      return recommendations;
    }

    const avgLatency = successfulTests.reduce((sum, r) => sum + r.results.latency.average, 0) / successfulTests.length;
    const avgRps = successfulTests.reduce((sum, r) => sum + r.results.requestsPerSecond, 0) / successfulTests.length;
    const errorRate = parseFloat(this.testResults.reduce((sum, r) => sum + parseFloat(r.performance?.errorRate || 0), 0) / this.testResults.length);

    if (avgLatency > 100) {
      recommendations.push('Consider optimizing database queries and increasing cache TTL values');
    }

    if (avgRps < 500) {
      recommendations.push('Implement connection pooling and consider horizontal scaling');
    }

    if (errorRate > 1) {
      recommendations.push('Investigate and fix error sources to improve reliability');
    }

    const cacheableTests = successfulTests.filter(r => r.expectedCacheHit);
    if (cacheableTests.length > 0) {
      const cacheLatency = cacheableTests.reduce((sum, r) => sum + r.results.latency.average, 0) / cacheableTests.length;
      if (cacheLatency > 50) {
        recommendations.push('Optimize Redis configuration and consider Redis clustering for better cache performance');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks excellent! Consider testing with higher load to find the breaking point.');
    }

    return recommendations;
  }

  /**
   * Calculate overall performance score (0-100)
   */
  calculatePerformanceScore() {
    const successfulTests = this.testResults.filter(r => r.success);
    if (successfulTests.length === 0) return 0;

    let score = 0;

    // Success Rate (40 points max)
    const successRate = parseFloat(this.calculateOverallSuccessRate());
    score += Math.min(successRate * 0.4, 40);

    // Latency Score (30 points max)
    const avgLatency = successfulTests.reduce((sum, r) => sum + r.results.latency.average, 0) / successfulTests.length;
    if (avgLatency <= 50) score += 30;
    else if (avgLatency <= 100) score += 20;
    else if (avgLatency <= 200) score += 10;

    // Throughput Score (20 points max)
    const avgRps = successfulTests.reduce((sum, r) => sum + r.results.requestsPerSecond, 0) / successfulTests.length;
    if (avgRps >= 1000) score += 20;
    else if (avgRps >= 500) score += 15;
    else if (avgRps >= 250) score += 10;
    else if (avgRps >= 100) score += 5;

    // Consistency Score (10 points max)
    const latencyVariance = this.calculateLatencyVariance(successfulTests);
    if (latencyVariance < 50) score += 10;
    else if (latencyVariance < 100) score += 5;

    return Math.round(score);
  }

  /**
   * Calculate latency variance across tests
   */
  calculateLatencyVariance(tests) {
    const latencies = tests.map(r => r.results.latency.average);
    const mean = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const variance = latencies.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / latencies.length;
    return Math.sqrt(variance);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new LoadTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎯 Load testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Load testing failed:', error);
      process.exit(1);
    });
}

module.exports = LoadTester;