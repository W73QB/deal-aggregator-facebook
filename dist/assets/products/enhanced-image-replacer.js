#!/usr/bin/env node

/**
 * Enhanced Real Product Image URL Replacer
 * Replace remaining placeholder images with real CDN URLs
 */

const fs = require('fs');

const ADDITIONAL_PRODUCT_IMAGES = {
  // Echo Dot 5th Generation
  'Echo Dot': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  
  // Gaming Monitor
  'Gaming Monitor': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  
  // Samsung 32" Monitor  
  '32"': 'https://images.samsung.com/is/image/samsung/p6pim/us/lc32f391fwnxza/gallery/us-c32f391fw-lc32f391fwnxza-292838-lc32f391fwnxza-001-front-white',
  
  // Fire TV Stick
  'Fire TV': 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX679_.jpg',
  
  // Air Fryer
  'Air Fryer': 'https://m.media-amazon.com/images/I/71k+M2CwDdL._AC_SX679_.jpg',
  
  // iPhone 14
  'iPhone 14': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1663703841896',
  
  // Kindle Oasis
  'Kindle': 'https://m.media-amazon.com/images/I/61paxCqcMaL._AC_SX679_.jpg',
  
  // Robot Vacuum
  'Robot Vacuum': 'https://m.media-amazon.com/images/I/61Nh8utDMNL._AC_SX679_.jpg',
  
  // Samsung Soundbar
  'Soundbar': 'https://images.samsung.com/is/image/samsung/p6pim/us/hw-q700c/gallery/us-hw-q700c-zc-hw-q700c-za-537271718',
};

class EnhancedImageReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = [];
  }

  findProductMatch(text) {
    for (const [productName, imageUrl] of Object.entries(ADDITIONAL_PRODUCT_IMAGES)) {
      if (text.includes(productName)) {
        return imageUrl;
      }
    }
    return null;
  }

  processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    // Find all remaining placeholder SVG images
    const svgPlaceholderRegex = /src="data:image\/svg\+xml;base64,[^"]*"/g;
    const matches = content.match(svgPlaceholderRegex);
    
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
          
          console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);
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
    console.log('🖼️  Running Enhanced Product Image Replacement...\n');
    
    const htmlFiles = [
      'pages/index.html',
      'pages/deals.html',
      'pages/blog.html'
    ];
    
    htmlFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.processFile(file);
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    });
    
    console.log(`\n📊 Enhanced Image Replacement Summary:`);
    console.log(`✅ Additional Replacements: ${this.replacements}`);
    console.log(`📁 Files Updated: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} more placeholder images!`);
    } else {
      console.log('\n✅ All placeholder images have been replaced with real product photos.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new EnhancedImageReplacer();
  replacer.run();
}

module.exports = EnhancedImageReplacer;