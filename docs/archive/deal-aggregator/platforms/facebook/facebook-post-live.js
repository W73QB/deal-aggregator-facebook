const fs = require('fs');
const path = require('path');
const { ConfigLoader } = require('../../core/utils/config');
const { FacebookAPI } = require('../../core/utils/facebook-api');

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

// Initialize Facebook API client
const facebookAPI = new FacebookAPI(env.FB_PAGE_ID, env.FB_PAGE_ACCESS_TOKEN);

async function postToFacebook(deal) {
  console.log(`\n📝 Posting: ${deal.source} (${deal.region}) - ${deal.title.substring(0, 50)}...`);
  
  const result = await facebookAPI.postMessage({
    message: deal.caption,
    link: deal.affiliateUrl
  });
  
  if (result.success) {
    console.log(`✅ Success! Post ID: ${result.postId}`);
    return {
      success: true,
      postId: result.postId,
      dealId: deal.id,
      timestamp: new Date().toISOString()
    };
  } else {
    console.log(`❌ Failed: ${result.error?.error?.message || result.error?.message || result.message || 'Unknown error'}`);
    return {
      success: false,
      error: result.error || result.message,
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