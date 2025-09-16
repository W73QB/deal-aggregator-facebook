#!/usr/bin/env node

/**
 * End-to-End Cache Test Script
 * Tests cache behavior from multiple regions and user agents
 */

import https from 'https';

class E2ECacheTest {
  constructor(url) {
    this.baseUrl = url;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ];
  }

  async makeRequest(userAgent = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl.replace(/https?:\/\//, ''),
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': userAgent || this.userAgents[0],
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            data,
            headers: res.headers,
            statusCode: res.statusCode,
            userAgent
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  }

  async testMultipleUserAgents() {
    console.log('🌍 Testing cache behavior across different user agents...');

    const results = [];
    let lastETag = null;
    let lastBuildId = null;

    for (const [index, userAgent] of this.userAgents.entries()) {
      try {
        console.log(`\n📱 Test ${index + 1}: ${userAgent.includes('iPhone') ? 'Mobile' : userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'macOS' : 'Linux'}`);

        const response = await this.makeRequest(userAgent);
        const html = response.data;
        const headers = response.headers;

        // Extract build ID
        const buildIdMatch = html.match(/buildId":"([^"]+)"/);
        const buildId = buildIdMatch ? buildIdMatch[1] : 'NOT_FOUND';

        // Check for modern elements
        const hasAnimatedLogo = html.includes('logo-animated') && html.includes('animateTransform');
        const hasHeroGradient = html.includes('hero-content');
        const hasModernLayout = html.includes('app-layout');

        const result = {
          userAgent: userAgent.substring(0, 50) + '...',
          buildId,
          etag: headers.etag || 'NONE',
          cacheControl: headers['cache-control'] || 'NONE',
          vercelCache: headers['x-vercel-cache'] || 'NONE',
          age: headers.age || '0',
          animatedLogo: hasAnimatedLogo,
          heroGradient: hasHeroGradient,
          modernLayout: hasModernLayout,
          responseTime: Date.now()
        };

        results.push(result);

        // Check consistency
        if (lastETag && result.etag !== 'NONE' && lastETag !== result.etag) {
          console.log(`⚠️  ETag mismatch: ${lastETag} vs ${result.etag}`);
        }

        if (lastBuildId && lastBuildId !== buildId) {
          console.log(`⚠️  Build ID mismatch: ${lastBuildId} vs ${buildId}`);
        }

        lastETag = result.etag;
        lastBuildId = buildId;

        console.log(`  📦 Build ID: ${buildId.substring(0, 8)}...`);
        console.log(`  🔄 Cache: ${result.vercelCache} (age: ${result.age}s)`);
        console.log(`  🎨 Modern UI: ${hasAnimatedLogo && hasHeroGradient && hasModernLayout ? '✅' : '❌'}`);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
        results.push({
          userAgent: userAgent.substring(0, 50) + '...',
          error: error.message
        });
      }
    }

    return results;
  }

  async testConditionalRequests() {
    console.log('\n🔍 Testing conditional requests behavior...');

    try {
      // First request
      const firstResponse = await this.makeRequest();
      const etag = firstResponse.headers.etag;
      const lastModified = firstResponse.headers['last-modified'];

      console.log(`  📦 ETag: ${etag || 'NONE'}`);
      console.log(`  📅 Last-Modified: ${lastModified || 'NONE'}`);

      if (etag) {
        // Test If-None-Match
        console.log('  🔄 Testing If-None-Match header...');
        const conditionalResponse = await this.makeRequest(null, {
          'If-None-Match': etag
        });

        if (conditionalResponse.statusCode === 304) {
          console.log('  ❌ Server returned 304 Not Modified - caching active!');
          return false;
        } else {
          console.log('  ✅ Server returned fresh content despite ETag');
          return true;
        }
      }

      return true;

    } catch (error) {
      console.error(`❌ Conditional request test failed: ${error.message}`);
      return false;
    }
  }

  async run() {
    console.log(`🚀 Starting E2E cache test for: ${this.baseUrl}`);
    console.log('=' .repeat(80));

    try {
      // Test multiple user agents
      const userAgentResults = await this.testMultipleUserAgents();

      // Test conditional requests
      const conditionalResult = await this.testConditionalRequests();

      console.log('\n' + '=' .repeat(80));
      console.log('📊 CACHE TEST SUMMARY:');

      // Check consistency across user agents
      const buildIds = [...new Set(userAgentResults.filter(r => r.buildId).map(r => r.buildId))];
      const modernUICount = userAgentResults.filter(r => r.animatedLogo && r.heroGradient && r.modernLayout).length;
      const cacheHitCount = userAgentResults.filter(r => r.vercelCache === 'HIT').length;

      console.log(`  🔗 Unique Build IDs: ${buildIds.length} (should be 1)`);
      console.log(`  🎨 Modern UI Responses: ${modernUICount}/${userAgentResults.length}`);
      console.log(`  📦 Cache HIT responses: ${cacheHitCount}/${userAgentResults.length}`);
      console.log(`  🔄 Conditional Requests: ${conditionalResult ? 'DISABLED ✅' : 'ENABLED ❌'}`);

      const allModern = modernUICount === userAgentResults.length;
      const consistentBuild = buildIds.length === 1;
      const noCacheHits = cacheHitCount === 0;

      console.log('\n🎯 OVERALL RESULT:');
      if (allModern && consistentBuild && !conditionalResult) {
        console.log('✅ ALL TESTS PASSED - Cache properly disabled, modern UI served consistently');
        process.exit(0);
      } else {
        console.log('❌ SOME TESTS FAILED:');
        if (!allModern) console.log('  - Modern UI not served to all clients');
        if (!consistentBuild) console.log('  - Inconsistent build versions served');
        if (conditionalResult) console.log('  - Conditional requests still causing 304 responses');
        process.exit(1);
      }

    } catch (error) {
      console.error('💥 E2E cache test failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI usage
const url = process.argv[2];
if (!url) {
  console.error('Usage: node e2e-cache-test.js <URL>');
  process.exit(1);
}

const tester = new E2ECacheTest(url);
tester.run();

export default E2ECacheTest;