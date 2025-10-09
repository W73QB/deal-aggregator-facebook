const path = require('path');
const { ConfigLoader } = require('../utils/config');
const { FileProcessor } = require('../utils/file-processor');

// Load configurations
const env = ConfigLoader.loadEnvironment();
const dateStr = ConfigLoader.getDateString();

// Load raw deals
const rawFile = path.join(env.DEALS_RAW_DIR, `raw-multi-${dateStr}.jsonl`);
const rawDeals = FileProcessor.loadJSONL(rawFile);

console.log(`Loaded ${rawDeals.length} raw deals from ${rawFile}`);

// Deduplication function
function deduplicateDeals(deals) {
  const seen = new Set();
  const deduped = [];
  
  for (const deal of deals) {
    // Create a normalized key for comparison
    const titleKey = deal.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const urlKey = deal.url.split('/').pop(); // Use last URL segment
    const key = `${titleKey}_${urlKey}_${deal.price?.amount || 'null'}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(deal);
    }
  }
  
  console.log(`Deduplication: ${deals.length} → ${deduped.length} deals`);
  return deduped;
}

// Quality scoring function
function calculateQualityScore(deal) {
  let score = 0;
  
  // Discount percentage (higher is better)
  const discountMatch = deal.discountText?.match(/(\d+)%/);
  const discountPercent = discountMatch ? parseInt(discountMatch[1]) : 0;
  score += Math.min(discountPercent * 2, 100); // Max 100 points for 50%+ discount
  
  // Price range (under $200 preferred)
  const price = deal.price?.amount || 0;
  if (price > 0) {
    if (price < 50) score += 50;
    else if (price < 100) score += 30;
    else if (price < 200) score += 20;
    else score += 5;
  }
  
  // Source reputation
  const sourceScores = {
    'amazon_us': 40, 'amazon_uk': 40,
    'walmart': 30, 'bestbuy': 30, 'target': 30,
    'ebay': 20, 'newegg': 25, 'currys': 25
  };
  score += sourceScores[deal.source] || 10;
  
  // Has valid image
  if (deal.image && deal.image.includes('http')) score += 20;
  
  // Title quality (longer titles generally better)
  if (deal.title && deal.title.length > 30) score += 15;
  
  // Has compare price (shows savings)
  if (deal.priceCompare && deal.priceCompare.amount > deal.price?.amount) score += 25;
  
  return Math.round(score);
}

// Process deals
const dedupedDeals = deduplicateDeals(rawDeals);

// Add quality scores
const scoredDeals = dedupedDeals.map(deal => ({
  ...deal,
  qualityScore: calculateQualityScore(deal)
}));

// Sort by quality score (descending)
scoredDeals.sort((a, b) => b.qualityScore - a.qualityScore);

// Select top deals (US priority: 8, UK: 4)
const usDeals = scoredDeals.filter(d => d.region === 'US').slice(0, 8);
const ukDeals = scoredDeals.filter(d => d.region === 'UK').slice(0, 4);
const selectedDeals = [...usDeals, ...ukDeals];

console.log(`Selected top deals: ${usDeals.length} US + ${ukDeals.length} UK = ${selectedDeals.length} total`);

// Show top deals
console.log('\n=== TOP SELECTED DEALS ===');
selectedDeals.forEach((deal, idx) => {
  const price = deal.price ? `${deal.price.currency} ${deal.price.amount}` : 'N/A';
  console.log(`${idx + 1}. [${deal.qualityScore}] ${deal.source} (${deal.region}): ${deal.title.substring(0, 50)}... - ${price} (${deal.discountText})`);
});

// Save selected deals for next step
const outputPath = path.join(env.DEALS_RAW_DIR, `../../data/selected/selected-deals-${dateStr}.jsonl`);
FileProcessor.saveJSONL(outputPath, selectedDeals, { createDirs: true });

console.log(`\nSaved ${selectedDeals.length} selected deals for affiliate enrichment`);