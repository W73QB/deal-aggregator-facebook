#!/usr/bin/env node
/**
 * Test Railway API Integration
 * Simulates browser fetch to Railway API
 */

const https = require('https');

const RAILWAY_API = 'https://deal-aggregator-api-production.up.railway.app/api/deals?limit=3';
const PRODUCTION_API = 'https://dealradarus.com/api/deals?limit=3';

function fetchAPI(url, name) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n✅ ${name}`);
          console.log(`   Source: ${json.meta?.source || 'unknown'}`);
          console.log(`   Total: ${json.meta?.total || json.data?.length || 0}`);
          console.log(`   Timestamp: ${json.meta?.timestamp || 'N/A'}`);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${name}: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      console.error(`\n❌ ${name} - Error: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  console.log('🔍 Testing Railway API Integration\n');
  console.log('=' .repeat(60));

  try {
    // Test Railway API directly
    const railwayData = await fetchAPI(RAILWAY_API, 'Railway API (Direct)');

    // Test Production API (Next.js route)
    const productionData = await fetchAPI(PRODUCTION_API, 'Production API (Next.js Route)');

    // Compare sources
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Comparison:');
    console.log(`   Railway: ${railwayData.meta?.source} (expected: "database")`);
    console.log(`   Production: ${productionData.meta?.source} (currently: "static")`);

    // Verification
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Expected Behavior:');
    console.log('   • Railway API should return "source": "database"');
    console.log('   • Client-side /deals page should fetch from Railway directly');
    console.log('   • Next.js /api/deals route may still return "static" (unused now)');

    if (railwayData.meta?.source === 'database') {
      console.log('\n✅ SUCCESS: Railway API is working with database!');
    } else {
      console.log('\n⚠️  WARNING: Railway API not using database');
    }

    console.log('\n💡 Note: To verify client-side integration:');
    console.log('   1. Open https://dealradarus.com/deals in browser');
    console.log('   2. Check Network tab for fetch to Railway API');
    console.log('   3. Look for console.log: "Fetching deals from: https://deal-aggregator-api..."');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
