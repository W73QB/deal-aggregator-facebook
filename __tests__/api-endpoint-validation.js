/**
 * API Endpoint Validation Tests
 * Tests for /api/health, /api/analytics, and /api/errors endpoints
 */

const API_BASE = 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  const response = await fetch(`${API_BASE}/api/health`);
  const data = await response.json();

  console.log(`  Status: ${response.status}`);
  console.log(`  Response structure: ${Object.keys(data).join(', ')}`);
  console.log(`  Health status: ${data.status}`);

  return response.status === 200 || response.status === 503; // Either healthy or degraded is OK
}

async function testAnalyticsEndpoint() {
  console.log('📊 Testing Analytics Endpoint...');

  const testPayload = {
    sessionId: 'test_session_123',
    events: [{
      type: 'test_event',
      data: { testField: 'testValue' },
      timestamp: new Date().toISOString()
    }]
  };

  const response = await fetch(`${API_BASE}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  });

  const data = await response.json();

  console.log(`  Status: ${response.status}`);
  console.log(`  Message: ${data.message}`);
  console.log(`  Events processed: ${data.count}`);

  return response.status === 200 || response.status === 202; // Accept or deferred is OK
}

async function testErrorsEndpoint() {
  console.log('🚨 Testing Errors Endpoint...');

  const testError = {
    type: 'test_error',
    message: 'Test error message',
    severity: 'info',
    stack: 'Test stack trace'
  };

  const response = await fetch(`${API_BASE}/api/errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testError)
  });

  const data = await response.json();

  console.log(`  Status: ${response.status}`);
  console.log(`  Message: ${data.message}`);

  return response.status === 200 || response.status === 202; // Logged or deferred is OK
}

async function testCORS() {
  console.log('🌐 Testing CORS Support...');

  const response = await fetch(`${API_BASE}/api/analytics`, {
    method: 'OPTIONS'
  });

  console.log(`  OPTIONS Status: ${response.status}`);
  console.log(`  CORS Headers: ${response.headers.get('Access-Control-Allow-Origin')}`);

  return response.status === 200;
}

async function testMethodValidation() {
  console.log('🔒 Testing Method Validation...');

  const response = await fetch(`${API_BASE}/api/analytics`, {
    method: 'GET'
  });

  const data = await response.json();

  console.log(`  GET Status: ${response.status}`);
  console.log(`  Error message: ${data.error}`);

  return response.status === 405 && data.error === 'Method not allowed';
}

async function runAllTests() {
  console.log('🚀 Starting API Endpoint Validation Tests\n');

  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Analytics Endpoint', fn: testAnalyticsEndpoint },
    { name: 'Errors Endpoint', fn: testErrorsEndpoint },
    { name: 'CORS Support', fn: testCORS },
    { name: 'Method Validation', fn: testMethodValidation }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
      console.log(`  ✅ ${test.name}: ${passed ? 'PASS' : 'FAIL'}\n`);
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
      console.log(`  ❌ ${test.name}: FAIL (${error.message})\n`);
    }
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n📋 Test Summary: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }

  return passed === total;
}

// For Node.js execution
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests };