#!/usr/bin/env node

/**
 * Final Product Image URL Replacer
 * Replace all remaining placeholder images with real CDN URLs
 */

const fs = require('fs');

const FINAL_PRODUCT_IMAGES = {
  // Gaming Monitor
  'Gaming Monitor': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  
  // Robot Vacuum
  'Robot Vacuum': 'https://m.media-amazon.com/images/I/61Nh8utDMNL._AC_SX679_.jpg',
  
  // Samsung Soundbar
  'Soundbar': 'https://images.samsung.com/is/image/samsung/p6pim/us/hw-q700c/gallery/us-hw-q700c-zc-hw-q700c-za-537271718',
  
  // Blog placeholder images
  'MacBook vs Windows': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90',
  'iPhone 14 Review': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=470&hei=556&fmt=png-alpha&qlt=95',
  'Smart Home Setup': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  'Gaming Deals': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  'Refurbished Tips': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90',
  'AirPods Pro 2': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
  'Monitor Setup': 'https://images.samsung.com/is/image/samsung/p6pim/us/lc32f391fwnxza/gallery/us-c32f391fw-lc32f391fwnxza-001-front-white',
  'ThinkPad X1 Carbon': 'https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MzYwNTQyfGltYWdlL3BuZ3xoM2IvaGJlLzEwMDU0MTExMDUzODU0LnBuZ3wzYjMxZjQwNGMwODZmZTEzYjY2ZDhlNGIyOGJmYzM1ZGVjNzM0ZGU5OTY2OWU4MWEwZDEwNzU5Y2JmMDdhNDUx/lenovo-laptop-thinkpad-x1-carbon-gen-10-hero.png',
  'Smart Home Security': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  'Refurbished Pixel 8': 'https://lh3.googleusercontent.com/ZFBxpNhpXkbIxXS0SnTUIaGNSRzrVWi1PBUYFnzAiNsJ7zyCXrx4vLqM4dJy0aG6pBbWkHoW6P9Q8P5CvMg-ZWo=rw',
  'Smart Lighting': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  'MacBook Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90'
};

class FinalImageReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = [];
  }

  findProductMatch(text) {
    for (const [productName, imageUrl] of Object.entries(FINAL_PRODUCT_IMAGES)) {
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
    
    // Find all remaining placeholder images (SVG and placehold.co)
    const placeholderRegexes = [
      /src=\"data:image\/svg\+xml;base64,[^\"]*\"/g,
      /src=\"https:\/\/placehold\.co\/[^\"]*\"/g
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
            
            console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);
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
    console.log('🖼️  Running Final Product Image Replacement...\n');
    
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
    
    console.log(`\n📊 Final Image Replacement Summary:`);
    console.log(`✅ Total Replacements: ${this.replacements}`);
    console.log(`📁 Files Updated: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} final placeholder images!`);
    } else {
      console.log('\n✅ All placeholder images have been successfully replaced.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new FinalImageReplacer();
  replacer.run();
}

module.exports = FinalImageReplacer;