const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const { ConfigLoader } = require('../../core/utils/config');

// Load configurations
const env = ConfigLoader.loadEnvironment();
const dateStr = ConfigLoader.getDateString();

// Load enriched deals (use existing file)
const enrichedFile = path.join(env.DEALS_ENRICHED_DIR, `enriched-multi-20250819.jsonl`);
const enrichedDeals = fs.readFileSync(enrichedFile, 'utf8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

console.log(`🎯 LIVE FACEBOOK POSTING`);
console.log(`📊 Loaded ${enrichedDeals.length} enriched deals`);

// Helper function for Facebook API calls
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) req.write(postData);
    req.end();
  });
}

async function postToFacebook(deal) {
  console.log(`\n📝 Posting: ${deal.source} (${deal.region}) - ${deal.title.substring(0, 50)}...`);
  
  const postData = querystring.stringify({
    message: deal.caption,
    link: deal.affiliateUrl,
    access_token: env.FB_PAGE_ACCESS_TOKEN
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: '/v23.0/me/feed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'DealAggregator/1.0'
    }
  };

  try {
    const response = await makeRequest(options, postData);
    
    if (response.statusCode === 200 && response.data.id) {
      console.log(`✅ Success! Post ID: ${response.data.id}`);
      return {
        success: true,
        postId: response.data.id,
        dealId: deal.id,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`❌ Failed: ${response.data.error?.message || 'Unknown error'}`);
      return {
        success: false,
        error: response.data,
        dealId: deal.id,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      dealId: deal.id,
      timestamp: new Date().toISOString()
    };
  }
}

async function postDeals() {
  // Select top 1 deal for live posting demo
  const dealsToPost = enrichedDeals.slice(0, 1);
  const results = [];
  
  console.log(`\n🚀 POSTING ${dealsToPost.length} DEALS TO FACEBOOK`);
  console.log(`📄 Page: US Daily Tech Deals (${env.FB_PAGE_ID})`);
  
  for (let i = 0; i < dealsToPost.length; i++) {
    const deal = dealsToPost[i];
    
    const result = await postToFacebook(deal);
    results.push(result);
    
    // Wait between posts to respect rate limits
    if (i < dealsToPost.length - 1) {
      const waitTime = env.MIN_SECONDS_BETWEEN_POSTS || 600;
      console.log(`⏳ Waiting ${waitTime} seconds before next post...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
  }
  
  // Save results
  const logFile = path.join(env.LOGS_DIR, `fb-live-posts-${dateStr}.jsonl`);
  const logContent = results.map(r => JSON.stringify(r)).join('\n');
  fs.writeFileSync(logFile, logContent);
  
  // Summary
  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 POSTING SUMMARY`);
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`📝 Log saved: ${logFile}`);
  
  if (successful > 0) {
    console.log(`\n🎉 Live posting successful! Check your Facebook page:`);
    console.log(`🔗 https://facebook.com/${env.FB_PAGE_ID}`);
  }
  
  return results;
}

// Execute
postDeals().catch(console.error);