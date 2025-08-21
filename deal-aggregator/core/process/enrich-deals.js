const fs = require('fs');
const path = require('path');

// Load configurations
const env = JSON.parse(fs.readFileSync("../../config/.env.local.json", 'utf8'));
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

// Load selected deals
const selectedFile = path.join(env.DEALS_RAW_DIR, `../../data/selected/selected-deals-${dateStr}.jsonl`);
const selectedDeals = fs.readFileSync(selectedFile, 'utf8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

console.log(`Loaded ${selectedDeals.length} selected deals for enrichment`);

// Affiliate URL generation
function generateAffiliateUrl(deal) {
  const originalUrl = deal.url;
  const utmParams = 'utm_source=facebook&utm_medium=organic&utm_campaign=launch';
  
  switch (deal.source) {
    case 'amazon_us':
      return env.AFF_AMAZON_US && !env.AFF_AMAZON_US.includes('yourtag')
        ? `${originalUrl}?tag=${env.AFF_AMAZON_US}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'amazon_uk':
      return env.AFF_AMAZON_UK && !env.AFF_AMAZON_UK.includes('yourtag')
        ? `${originalUrl}?tag=${env.AFF_AMAZON_UK}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'walmart':
      return env.AFF_WALMART_ID 
        ? `${originalUrl}?affp1=${env.AFF_WALMART_ID}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'bestbuy':
      return env.AFF_BESTBUY_ID
        ? `${originalUrl}?ref=${env.AFF_BESTBUY_ID}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'target':
      return env.AFF_TARGET_ID
        ? `${originalUrl}?clkid=${env.AFF_TARGET_ID}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'ebay':
      return env.AFF_EBAY_CAMPAIGN
        ? `${originalUrl}?mkcid=1&mkrid=${env.AFF_EBAY_CAMPAIGN}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'newegg':
      return env.AFF_NEWEGG_ID
        ? `${originalUrl}?nm_mc=${env.AFF_NEWEGG_ID}&${utmParams}`
        : `${originalUrl}?${utmParams}`;
    
    case 'currys':
    default:
      return `${originalUrl}?${utmParams}`;
  }
}

// Caption generation
function generateCaption(deal) {
  const emoji = getEmoji(deal);
  const priceText = deal.price ? `${deal.price.currency} ${deal.price.amount}` : 'Great price';
  const originalPrice = deal.priceCompare ? ` (was ${deal.priceCompare.currency} ${deal.priceCompare.amount})` : '';
  
  const headline = `${emoji} DEAL ALERT: ${deal.title.substring(0, 80)}${deal.title.length > 80 ? '...' : ''}`;
  const benefit = `💰 Save big with ${deal.discountText || 'special pricing'} - Only ${priceText}${originalPrice}`;
  const urgency = '⏰ Limited time offer - Don\'t miss out!';
  const hashtags = getHashtags(deal);
  const disclosure = deal.region === 'US' ? env.AFFILIATE_DISCLOSURE_US : env.AFFILIATE_DISCLOSURE_UK;
  
  return `${headline}

${benefit}

${urgency}

${hashtags}

${disclosure}`;
}

// Emoji selection based on category/source
function getEmoji(deal) {
  const category = deal.category?.toLowerCase() || '';
  const title = deal.title.toLowerCase();
  
  if (title.includes('laptop') || title.includes('computer')) return '💻';
  if (title.includes('phone') || title.includes('mobile')) return '📱';
  if (title.includes('headphone') || title.includes('audio')) return '🎧';
  if (title.includes('game') || title.includes('gaming')) return '🎮';
  if (title.includes('home') || title.includes('kitchen')) return '🏠';
  if (category.includes('electronics')) return '⚡';
  return '🔥';
}

// Hashtag generation
function getHashtags(deal) {
  const tags = ['#deals'];
  
  if (deal.source.includes('amazon')) tags.push('#amazon');
  if (deal.source === 'walmart') tags.push('#walmart');
  if (deal.source === 'bestbuy') tags.push('#bestbuy');
  if (deal.source === 'target') tags.push('#target');
  if (deal.source === 'ebay') tags.push('#ebay');
  
  if (deal.region === 'US') tags.push('#usdeals');
  if (deal.region === 'UK') tags.push('#ukdeals');
  
  const category = deal.category?.toLowerCase() || '';
  if (category.includes('electronics')) tags.push('#electronics');
  if (category.includes('mobile')) tags.push('#mobile');
  if (category.includes('gaming')) tags.push('#gaming');
  
  return tags.slice(0, 5).join(' ');
}

// Enrich all deals
const enrichedDeals = selectedDeals.map(deal => {
  const enriched = {
    ...deal,
    affiliateUrl: generateAffiliateUrl(deal),
    caption: generateCaption(deal),
    enrichedAt: new Date().toISOString()
  };
  
  // Log affiliate URL status
  const hasAffiliateId = enriched.affiliateUrl !== deal.url + '?utm_source=facebook&utm_medium=organic&utm_campaign=launch';
  console.log(`${deal.source} (${deal.region}): ${hasAffiliateId ? '✅ Affiliate' : '⚠️  UTM only'}`);
  
  return enriched;
});

// Save enriched deals
const enrichedFile = path.join(env.DEALS_ENRICHED_DIR, `enriched-multi-${dateStr}.jsonl`);
const enrichedContent = enrichedDeals.map(deal => JSON.stringify(deal)).join('\n');
fs.writeFileSync(enrichedFile, enrichedContent);

console.log(`\nSaved ${enrichedDeals.length} enriched deals to ${enrichedFile}`);

// Show sample caption
console.log('\n=== SAMPLE CAPTION ===');
console.log(enrichedDeals[0].caption);
console.log('\n=== SAMPLE AFFILIATE URL ===');
console.log(enrichedDeals[0].affiliateUrl);

console.log(`\nEnrichment complete: ${enrichedDeals.length} deals ready for posting`);