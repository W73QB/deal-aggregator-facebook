/**
 * Vercel API Routing Issue - Automated Test Suite
 *
 * Purpose: Demonstrate systematic routing failure on Vercel platform
 * Expected: PASS locally, FAIL on Vercel
 *
 * Issue: All API endpoints incorrectly return /api/posts response
 * Platform: Vercel
 * Local: Works correctly
 */

// Use global fetch (available in Node.js 18+)
// If running locally with Jest, ensure jest.config.js has testEnvironment: 'node'
const fetch = global.fetch || require('cross-fetch');

const CUSTOM_BASE_URL = process.env.ROUTING_TEST_BASE_URL;

const BASE_URL = CUSTOM_BASE_URL
  ? CUSTOM_BASE_URL.replace(/\/$/, '')
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

describe('Vercel API Routing Issue - Response Differentiation', () => {

  test('API endpoints should return DIFFERENT content', async () => {
    // Fetch responses from three different endpoints
    const [healthRes, postsRes, simpleRes] = await Promise.all([
      fetch(`${BASE_URL}/api/health`),
      fetch(`${BASE_URL}/api/posts`),
      fetch(`${BASE_URL}/api/simple-test`)
    ]);

    const [health, posts, simple] = await Promise.all([
      healthRes.json(),
      postsRes.json(),
      simpleRes.json()
    ]);

    // Health endpoint should have 'status' or 'generatedAt' field
    const hasHealthFields = health.status !== undefined || health.generatedAt !== undefined;

    // Posts endpoint should have 'posts' array
    const hasPostsArray = Array.isArray(posts.posts);

    // Simple-test endpoint should have 'endpoint' field
    const hasEndpointField = simple.endpoint === '/api/simple-test';

    // Log actual responses for debugging
    console.log('\n=== API Response Analysis ===');
    console.log('Health response keys:', Object.keys(health).join(', '));
    console.log('Posts response keys:', Object.keys(posts).join(', '));
    console.log('Simple-test response keys:', Object.keys(simple).join(', '));

    // Assertions
    expect(hasHealthFields).toBe(true);
    expect(hasPostsArray).toBe(true);
    expect(hasEndpointField).toBe(true);

    // Critical assertion: All three responses must be different
    expect(health).not.toEqual(posts);
    expect(health).not.toEqual(simple);
    expect(posts).not.toEqual(simple);
  }, 30000); // 30 second timeout for network requests

  test('/api/health should NOT return blog posts', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    // Health endpoint should NOT have a 'posts' array
    expect(data).not.toHaveProperty('posts');

    // Health endpoint SHOULD have health-related fields
    const hasHealthData = data.status !== undefined || data.checks !== undefined;
    expect(hasHealthData).toBe(true);
  }, 15000);

  test('/api/simple-test should return test response', async () => {
    const response = await fetch(`${BASE_URL}/api/simple-test`);
    const data = await response.json();

    // Simple-test should NOT have blog posts
    expect(data).not.toHaveProperty('posts');

    // Simple-test SHOULD have test-specific fields
    expect(data).toHaveProperty('endpoint');
    expect(data.endpoint).toBe('/api/simple-test');
    expect(data).toHaveProperty('message');
  }, 15000);

  test('/api/analytics should NOT return blog posts', async () => {
    const response = await fetch(`${BASE_URL}/api/analytics`);
    const data = await response.json();

    // Analytics endpoint should NOT have blog posts
    expect(data).not.toHaveProperty('posts');

    // Even if it returns an error (405), it shouldn't return blog posts
    if (data.error) {
      expect(data.error).toBeTruthy();
    }
  }, 15000);

});

describe('Vercel API Routing Issue - Content-Type Headers', () => {

  test('All API endpoints should return application/json', async () => {
    const endpoints = [
      '/api/health',
      '/api/posts',
      '/api/simple-test',
      '/api/analytics'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const contentType = response.headers.get('content-type');

      expect(contentType).toContain('application/json');
    }
  }, 30000);

});

describe('Vercel API Routing Issue - Cache Verification', () => {

  test('API endpoints should have no-cache headers', async () => {
    const response = await fetch(`${BASE_URL}/api/simple-test`);

    const cacheControl = response.headers.get('cache-control');
    const pragma = response.headers.get('pragma');
    const expires = response.headers.get('expires');

    // Verify no-cache headers are present
    expect(cacheControl).toContain('no-cache');
    expect(pragma).toBe('no-cache');
    expect(expires).toBe('0');
  }, 15000);

  test('API endpoints should not be served from Vercel cache', async () => {
    const response = await fetch(`${BASE_URL}/api/simple-test`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const vercelCache = response.headers.get('x-vercel-cache');

    // Should be MISS or BYPASS, never HIT
    if (vercelCache) {
      expect(vercelCache).not.toBe('HIT');
    }
  }, 15000);

});

describe('Vercel API Routing Issue - Routing Path Verification', () => {

  test('x-matched-path header should reflect correct endpoint', async () => {
    const endpoints = [
      '/api/health',
      '/api/simple-test',
      '/api/posts'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const matchedPath = response.headers.get('x-matched-path');

      if (matchedPath) {
        console.log(`${endpoint} → x-matched-path: ${matchedPath}`);
        expect(matchedPath).toBe(endpoint);
      }
    }
  }, 30000);

});

// Export test results summary
afterAll(() => {
  console.log('\n=== Test Environment ===');
  console.log('BASE_URL:', BASE_URL);
  console.log('VERCEL_URL:', process.env.VERCEL_URL || 'Not set (local environment)');
  console.log('\nExpected Results:');
  console.log('- Local: ALL TESTS PASS ✅');
  console.log('- Vercel: TESTS FAIL ❌ (proves platform routing issue)');
});