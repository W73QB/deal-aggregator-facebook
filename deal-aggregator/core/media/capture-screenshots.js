const fs = require('fs');
const path = require('path');

// Load configurations and deals
const env = JSON.parse(fs.readFileSync("../../config/.env.local.json", 'utf8'));
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

const enrichedFile = path.join(env.DEALS_ENRICHED_DIR, `enriched-multi-${dateStr}.jsonl`);
const enrichedDeals = fs.readFileSync(enrichedFile, 'utf8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

console.log(`Loaded ${enrichedDeals.length} enriched deals for screenshots`);

// Select top 6-10 deals for screenshots
const dealsToScreenshot = enrichedDeals.slice(0, 10);

console.log(`Will attempt screenshots for top ${dealsToScreenshot.length} deals:`);
dealsToScreenshot.forEach((deal, idx) => {
  console.log(`${idx + 1}. ${deal.id} - ${deal.source} (${deal.region}): ${deal.title.substring(0, 50)}...`);
});

// Save the screenshot list for external processing
const screenshotList = dealsToScreenshot.map(deal => ({
  id: deal.id,
  url: deal.affiliateUrl || deal.url,
  originalUrl: deal.url,
  title: deal.title,
  source: deal.source,
  region: deal.region
}));

const screenshotFile = path.join(env.CONFIG_DIR, `screenshot-targets-${dateStr}.json`);
fs.writeFileSync(screenshotFile, JSON.stringify(screenshotList, null, 2));

console.log(`\nSaved screenshot targets to ${screenshotFile}`);
console.log(`Next: Use MCP Playwright to capture screenshots for these ${screenshotList.length} deals`);

// Output the URLs for manual verification
console.log('\n=== URLs TO SCREENSHOT ===');
screenshotList.forEach((item, idx) => {
  console.log(`${idx + 1}. ${item.url}`);
});

module.exports = { screenshotList };