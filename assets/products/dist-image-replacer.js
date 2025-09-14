#!/usr/bin/env node

/**
 * Dist Image Replacer - Update dist files directly
 * Replace placeholder images in dist directory with real product URLs
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
  
  // Additional products
  'Robot Vacuum': 'https://m.media-amazon.com/images/I/61Nh8utDMNL._AC_SX679_.jpg',
  'Soundbar': 'https://images.samsung.com/is/image/samsung/p6pim/us/hw-q700c/gallery/us-hw-q700c-zc-hw-q700c-za-537271718',
  'Fire TV': 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX679_.jpg',
  'Air Fryer': 'https://m.media-amazon.com/images/I/71k+M2CwDdL._AC_SX679_.jpg',
  'Kindle': 'https://m.media-amazon.com/images/I/61paxCqcMaL._AC_SX679_.jpg'
};

class DistImageReplacer {
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
    
    // Find placehold.co images
    const placeholderRegex = /src=\"https:\/\/placehold\.co\/[^\"]*\"/g;
    const matches = content.match(placeholderRegex);
    
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
    console.log('🖼️  Running Dist Image Replacement...\n');
    
    const distFiles = [
      'dist/index.html',        // Root index file
      'dist/deals.html',        // Root deals file  
      'dist/blog.html',         // Root blog file
      'dist/pages/index.html',  // Pages subdirectory
      'dist/pages/deals.html',
      'dist/pages/blog.html'
    ];
    
    distFiles.forEach(file => {
      this.processFile(file);
    });
    
    console.log(`\n📊 Dist Image Replacement Summary:`);
    console.log(`✅ Total Replacements: ${this.replacements}`);
    console.log(`📁 Files Updated: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in dist files!`);
    } else {
      console.log('\n✅ All placeholder images in dist files are already replaced.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new DistImageReplacer();
  replacer.run();
}

module.exports = DistImageReplacer;