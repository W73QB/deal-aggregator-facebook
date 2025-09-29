#!/usr/bin/env node

/**
 * Pages Image Replacer - Fix source pages first
 * Replace placeholder images in pages/ directory with real product URLs
 */

const fs = require('fs');

const REAL_PRODUCT_IMAGES = {
  // iPhone products
  'iPhone 14': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1663703841896',
  
  // Amazon Echo
  'Amazon Echo': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  'Echo Dot': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  
  // Gaming Monitor
  'Gaming Monitor': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  
  // AirPods Pro
  'AirPods Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
  
  // MacBook Pro
  'MacBook Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90'
};

class PagesImageReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = [];
  }

  findProductMatch(text) {
    for (const [productName, imageUrl] of Object.entries(REAL_PRODUCT_IMAGES)) {
      if (text.includes(productName)) {
        return imageUrl;
      }
    }
    return null;
  }

  processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return 0;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    // Find placehold.co images and SVG placeholders
    const placeholderRegexes = [
      /src=\"https:\/\/placehold\.co\/[^\"]*\"/g,
      /src=\"data:image\/svg\+xml;base64,[^\"]*\"/g
    ];
    
    placeholderRegexes.forEach(regex => {
      const matches = content.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          // Extract surrounding context to identify product
          const matchIndex = content.indexOf(match);
          const contextStart = Math.max(0, matchIndex - 500);
          const contextEnd = Math.min(content.length, matchIndex + 500);
          const context = content.substring(contextStart, contextEnd);
          
          // Find product name in context
          const realImageUrl = this.findProductMatch(context);
          
          if (realImageUrl) {
            const newImageTag = `src="${realImageUrl}"`;
            content = content.replace(match, newImageTag);
            fileReplacements++;
            this.replacements++;
            
            console.log(`  ✅ Replaced: ${realImageUrl.substring(0, 50)}...`);
          }
        });
      }
    });
    
    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.filesProcessed.push({
        file: filePath,
        replacements: fileReplacements
      });
      console.log(`  📝 Updated ${filePath} with ${fileReplacements} replacements`);
    }
    
    return fileReplacements;
  }

  run() {
    console.log('🖼️  Running Pages Image Replacement...\n');
    
    const pageFiles = [
      'pages/index.html',
      'pages/deals.html',
      'pages/blog.html'
    ];
    
    pageFiles.forEach(file => {
      this.processFile(file);
    });
    
    console.log(`\n📊 Pages Image Replacement Summary:`);
    console.log(`✅ Total Replacements: ${this.replacements}`);
    console.log(`📁 Files Updated: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in pages/!`);
    } else {
      console.log('\n✅ All placeholder images in pages/ are already replaced.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new PagesImageReplacer();
  replacer.run();
}

module.exports = PagesImageReplacer;