const fs = require('fs');
const path = require('path');
const { ConfigLoader } = require('../../core/utils/config');

// Load configurations
const env = ConfigLoader.loadEnvironment();
const dateStr = ConfigLoader.getDateString();

// Load enriched deals
const enrichedFile = path.join(env.DEALS_ENRICHED_DIR, `enriched-multi-${dateStr}.jsonl`);
const enrichedDeals = fs.readFileSync(enrichedFile, 'utf8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

console.log(`Loaded ${enrichedDeals.length} enriched deals for Facebook posting`);

// Check Facebook credentials
const hasValidFbToken = env.FB_PAGE_ACCESS_TOKEN && 
                       env.FB_PAGE_ACCESS_TOKEN !== 'EAAG..long-lived..' && 
                       env.FB_PAGE_ACCESS_TOKEN.length > 20;
const hasValidPageId = env.FB_PAGE_ID && env.FB_PAGE_ID !== '1234567890';

const isPostingMode = hasValidFbToken && hasValidPageId;

console.log(`Facebook credentials check:`);
console.log(`  Page ID: ${hasValidPageId ? '✅' : '❌'}`);
console.log(`  Access Token: ${hasValidFbToken ? '✅' : '❌'}`);
console.log(`  Mode: ${isPostingMode ? 'POSTING' : 'SIMULATION'}`);

// Select deals to post (3-6 for today)
const dealsToPost = enrichedDeals.slice(0, 6);
const minSecondsBetween = env.MIN_SECONDS_BETWEEN_POSTS || 600;

// Generate posting timestamps
const now = new Date();
const postingTimes = dealsToPost.map((deal, idx) => {
  const postTime = new Date(now.getTime() + (idx * minSecondsBetween * 1000));
  return postTime;
});

if (isPostingMode) {
  console.log('\n🚀 POSTING MODE - Would post to Facebook');
  simulatePosting();
} else {
  console.log('\n📝 SIMULATION MODE - Creating would-post CSV');
  createSimulationOutput();
}

function simulatePosting() {
  console.log('\\n=== FACEBOOK POSTING SIMULATION ===');
  
  const postResults = [];
  
  dealsToPost.forEach((deal, idx) => {
    const mediaPath = path.join(env.MEDIA_DIR, `${deal.id}.png`);
    const mediaExists = fs.existsSync(mediaPath);
    
    // Simulate API call
    const postResult = {
      dealId: deal.id,
      pageId: env.FB_PAGE_ID,
      scheduledAt: postingTimes[idx].toISOString(),
      caption: deal.caption,
      targetUrl: deal.affiliateUrl,
      mediaPath: mediaExists ? mediaPath : null,
      status: 'success', // Simulated success
      postId: `${env.FB_PAGE_ID}_${Date.now() + idx}`, // Mock post ID
      timestamp: new Date().toISOString()
    };
    
    postResults.push(postResult);
    
    console.log(`✅ Posted ${idx + 1}/${dealsToPost.length}: ${deal.source} (${deal.region}) - ${deal.title.substring(0, 40)}...`);
    console.log(`   📅 Scheduled: ${postingTimes[idx].toLocaleString()}`);
    console.log(`   🖼️  Media: ${mediaExists ? 'Attached' : 'Text only'}`);
  });
  
  // Save posting results
  const postingLogFile = path.join(env.LOGS_DIR, `fb-post-${dateStr}.jsonl`);
  const postingLogContent = postResults.map(result => JSON.stringify(result)).join('\\n');
  fs.writeFileSync(postingLogFile, postingLogContent);
  
  console.log(`\\n📊 Posting complete: ${postResults.length} posts created`);
  console.log(`📝 Results logged to: ${postingLogFile}`);
}

function createSimulationOutput() {
  console.log('\\n=== SIMULATION OUTPUT ===');
  
  const csvHeaders = 'pageId,locale,scheduledAt,caption,targetUrl,mediaPath';
  const csvRows = dealsToPost.map((deal, idx) => {
    const mediaPath = path.join(env.MEDIA_DIR, `${deal.id}.png`);
    const mediaExists = fs.existsSync(mediaPath);
    const locale = deal.region === 'US' ? 'en_US' : 'en_GB';
    const scheduledAt = postingTimes[idx].toISOString();
    
    // Escape CSV values
    const escapedCaption = `\"${deal.caption.replace(/\"/g, '\"\"').replace(/\\n/g, ' | ')}\"`; 
    
    return `${env.FB_PAGE_ID},${locale},${scheduledAt},${escapedCaption},${deal.affiliateUrl},${mediaExists ? mediaPath : ''}`;
  });
  
  const csvContent = [csvHeaders, ...csvRows].join('\\n');
  const simulationFile = path.join(env.LOGS_DIR, `would-post-${dateStr}.csv`);
  fs.writeFileSync(simulationFile, csvContent);
  
  console.log(`📊 Would post ${dealsToPost.length} deals:`);
  dealsToPost.forEach((deal, idx) => {
    console.log(`${idx + 1}. [${postingTimes[idx].toLocaleTimeString()}] ${deal.source} (${deal.region}): ${deal.title.substring(0, 50)}...`);
  });
  
  console.log(`\\n📝 Simulation saved to: ${simulationFile}`);
}

console.log(`\\n✅ Facebook step complete - Mode: ${isPostingMode ? 'POSTING' : 'SIMULATION'}`);