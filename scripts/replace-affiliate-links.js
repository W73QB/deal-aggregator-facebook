/**
 * Affiliate Links Replacement Script
 * Replaces all placeholder links with real affiliate URLs
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Load affiliate links configuration
const affiliateConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/affiliate-links.json'), 'utf8')
);

class AffiliateLinksReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = 0;
    this.errors = [];
  }

  // Generate affiliate URL based on retailer and product
  generateAffiliateUrl(retailer, productId, dealKey = null) {
    const { affiliateIds, trackingParams } = affiliateConfig;
    
    switch (retailer.toLowerCase()) {
      case 'amazon':
        const utmParams = new URLSearchParams({
          tag: affiliateIds.amazon,
          linkCode: 'osi',
          th: '1',
          psc: '1',
          ...trackingParams
        });
        return `https://www.amazon.com/dp/${productId}?${utmParams.toString()}`;
        
      case 'bestbuy':
        const bbParams = new URLSearchParams(trackingParams);
        return `https://www.anrdoezrs.net/click-${affiliateIds.cjId}-${productId}?url=https://www.bestbuy.com/site/${productId}&${bbParams.toString()}`;
        
      case 'walmart':
        const wmParams = new URLSearchParams(trackingParams);
        return `https://goto.walmart.com/c/${affiliateIds.impactId}/${productId}?u=https://www.walmart.com/ip/${productId}&${wmParams.toString()}`;
        
      case 'target':
        const tgtParams = new URLSearchParams(trackingParams);
        return `https://www.anrdoezrs.net/click-${affiliateIds.targetCjId}-${productId}?url=https://www.target.com/p/${productId}&${tgtParams.toString()}`;
        
      default:
        return `#unavailable-${retailer}-${productId}`;
    }
  }

  // Get the best available affiliate link for a deal
  getBestAffiliateLink(dealKey) {
    const deal = affiliateConfig.deals[dealKey];
    if (!deal) return null;

    // Priority order: Amazon > Best Buy > Walmart > Target
    const priorities = ['amazon', 'bestbuy', 'walmart', 'target'];
    
    for (const retailer of priorities) {
      if (deal[retailer]) {
        return {
          url: this.generateAffiliateUrl(retailer, deal[retailer], dealKey),
          retailer,
          productId: deal[retailer],
          deal
        };
      }
    }
    
    return null;
  }

  // Replace placeholder links in content
  replacePlaceholderLinks(content, filename) {
    let updatedContent = content;
    let localReplacements = 0;

    // Pattern 1: example.com URLs with deal identifiers
    const exampleComPattern = /href="https:\/\/example\.com\/([a-z0-9\-_]+)-deal[^"]*"/gi;
    updatedContent = updatedContent.replace(exampleComPattern, (match, dealKey) => {
      const affiliateLink = this.getBestAffiliateLink(dealKey);
      
      if (affiliateLink) {
        localReplacements++;
        console.log(`✅ ${filename}: ${dealKey} -> ${affiliateLink.retailer} (${affiliateLink.productId})`);
        return `href="${affiliateLink.url}" data-deal-key="${dealKey}" data-retailer="${affiliateLink.retailer}"`;
      } else {
        console.warn(`⚠️  ${filename}: No affiliate link found for deal: ${dealKey}`);
        return `href="#deal-unavailable" data-deal-key="${dealKey}" title="Deal currently unavailable"`;
      }
    });

    // Pattern 2: Generic # placeholder links (convert to Amazon search)
    const hashPattern = /href="#"(?=.*class="[^"]*deal-button[^"]*")/gi;
    updatedContent = updatedContent.replace(hashPattern, (match) => {
      const amazonSearchUrl = `https://www.amazon.com/s?k=deals&tag=${affiliateConfig.affiliateIds.amazon}&linkCode=osi`;
      localReplacements++;
      return `href="${amazonSearchUrl}" data-type="search-fallback"`;
    });

    // Pattern 3: Read more buttons linking to #
    const readMorePattern = /(<a href="#"[^>]*class="[^"]*read-more[^"]*"[^>]*>)/gi;
    updatedContent = updatedContent.replace(readMorePattern, (match) => {
      localReplacements++;
      return match.replace('href="#"', 'href="/blog" data-type="blog-redirect"');
    });

    // Pattern 4: Add proper affiliate disclosures
    const dealButtonPattern = /(class="[^"]*deal-button[^"]*"[^>]*>)/gi;
    updatedContent = updatedContent.replace(dealButtonPattern, (match) => {
      if (!match.includes('rel=')) {
        return match.replace('>', ' rel="sponsored nofollow noopener" target="_blank">');
      }
      return match;
    });

    this.replacements += localReplacements;
    return updatedContent;
  }

  // Process a single file
  async processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const updatedContent = this.replacePlaceholderLinks(originalContent, path.basename(filePath));
      
      if (originalContent !== updatedContent) {
        // Create backup
        const backupPath = filePath + '.backup';
        if (!fs.existsSync(backupPath)) {
          fs.writeFileSync(backupPath, originalContent);
        }
        
        // Write updated content
        fs.writeFileSync(filePath, updatedContent);
        console.log(`📝 Updated: ${filePath}`);
      }
      
      this.filesProcessed++;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Process all HTML files
  async processAllFiles() {
    console.log('🔍 Finding HTML files to process...');
    
    const htmlFiles = [
      ...glob.sync('public/**/*.html'),
      ...glob.sync('pages/**/*.html'), 
      ...glob.sync('blog/**/*.html'),
      ...glob.sync('dist/**/*.html'),
      'test-ga4.html'
    ].filter(file => fs.existsSync(file));

    console.log(`📁 Found ${htmlFiles.length} HTML files`);

    for (const file of htmlFiles) {
      await this.processFile(file);
    }
  }

  // Generate affiliate links reference
  generateReference() {
    const reference = {
      timestamp: new Date().toISOString(),
      total_deals: Object.keys(affiliateConfig.deals).length,
      affiliate_networks: Object.keys(affiliateConfig.affiliateIds),
      deals_by_category: {},
      links_generated: []
    };

    // Group deals by category
    Object.entries(affiliateConfig.deals).forEach(([key, deal]) => {
      const category = deal.category || 'Other';
      if (!reference.deals_by_category[category]) {
        reference.deals_by_category[category] = [];
      }
      reference.deals_by_category[category].push({
        key,
        title: deal.title,
        price: deal.price,
        discount: deal.discount,
        retailers: Object.keys(deal).filter(k => ['amazon', 'bestbuy', 'walmart', 'target'].includes(k))
      });
    });

    // Generate sample links
    Object.entries(affiliateConfig.deals).forEach(([key, deal]) => {
      const link = this.getBestAffiliateLink(key);
      if (link) {
        reference.links_generated.push({
          deal_key: key,
          title: deal.title,
          retailer: link.retailer,
          url: link.url
        });
      }
    });

    return reference;
  }

  // Create deal management dashboard
  createDashboard() {
    const reference = this.generateReference();
    
    const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Links Dashboard - DealRadarUS</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
    .category { margin: 20px 0; }
    .deals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .deal-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #fafafa; }
    .deal-title { font-weight: bold; margin-bottom: 10px; }
    .deal-price { color: #28a745; font-weight: bold; }
    .deal-discount { color: #dc3545; font-size: 12px; }
    .retailers { margin-top: 10px; }
    .retailer-tag { display: inline-block; background: #007bff; color: white; padding: 3px 8px; margin: 2px; border-radius: 3px; font-size: 11px; }
    .link-preview { margin-top: 10px; font-size: 11px; color: #666; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔗 Affiliate Links Dashboard</h1>
      <p>Generated: ${reference.timestamp}</p>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${reference.total_deals}</div>
        <div>Total Deals</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${reference.affiliate_networks.length}</div>
        <div>Affiliate Networks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${reference.links_generated.length}</div>
        <div>Active Links</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${Object.keys(reference.deals_by_category).length}</div>
        <div>Categories</div>
      </div>
    </div>

    ${Object.entries(reference.deals_by_category).map(([category, deals]) => `
      <div class="category">
        <h2>📦 ${category}</h2>
        <div class="deals-grid">
          ${deals.map(deal => `
            <div class="deal-card">
              <div class="deal-title">${deal.title}</div>
              <div class="deal-price">${deal.price} <span class="deal-discount">Save ${deal.discount}</span></div>
              <div class="retailers">
                ${deal.retailers.map(retailer => `<span class="retailer-tag">${retailer.toUpperCase()}</span>`).join('')}
              </div>
              ${reference.links_generated.find(l => l.deal_key === deal.key) ? `
                <div class="link-preview">
                  <strong>${reference.links_generated.find(l => l.deal_key === deal.key).retailer}:</strong><br>
                  ${reference.links_generated.find(l => l.deal_key === deal.key).url.substring(0, 80)}...
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    fs.writeFileSync('affiliate-dashboard.html', dashboardHtml);
    console.log('📊 Affiliate dashboard created: affiliate-dashboard.html');
  }

  // Run the complete replacement process
  async run() {
    console.log('🚀 Starting affiliate links replacement...\n');
    
    try {
      await this.processAllFiles();
      
      // Generate reference and dashboard
      const reference = this.generateReference();
      fs.writeFileSync('affiliate-links-reference.json', JSON.stringify(reference, null, 2));
      this.createDashboard();
      
      // Summary
      console.log('\n📊 REPLACEMENT SUMMARY:');
      console.log(`✅ Files processed: ${this.filesProcessed}`);
      console.log(`🔗 Links replaced: ${this.replacements}`);
      console.log(`❌ Errors: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        this.errors.forEach(err => console.log(`   ${err.file}: ${err.error}`));
      }
      
      console.log('\n📁 Generated files:');
      console.log('   • affiliate-links-reference.json (API reference)');
      console.log('   • affiliate-dashboard.html (Visual dashboard)');
      console.log('   • *.backup files (Original backups)');
      
      console.log('\n✅ Affiliate links replacement completed!');
      
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new AffiliateLinksReplacer();
  replacer.run();
}

module.exports = AffiliateLinksReplacer;