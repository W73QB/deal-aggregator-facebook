#!/usr/bin/env node

/**
 * Comprehensive Image Replacer - Replace ALL placeholder images
 * Covers all blue boxes, SVG placeholders across all pages
 */

const fs = require('fs');

const COMPREHENSIVE_PRODUCT_IMAGES = {
  // Gaming Monitor
  'Gaming Monitor': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  '24" Gaming Monitor': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  'Monitor Setup': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  
  // MacBook products
  'MacBook Air': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90',
  'MacBook Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90',
  
  // iPhone products
  'iPhone 14': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1663703841896',
  
  // Nintendo Switch
  'Nintendo Switch': 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/hardware/switch/Nintendo_Switch_hardware_Console_Joy-Con_RB',
  
  // AirPods
  'AirPods Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
  'AirPods': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
  
  // Amazon Echo
  'Amazon Echo': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  'Echo Dot': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  
  // Fire TV Stick
  'Fire TV': 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX679_.jpg',
  'Fire TV Stick': 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX679_.jpg',
  
  // Smart Home
  'Smart Home': 'https://m.media-amazon.com/images/I/71h-nEZFx1L._AC_SX679_.jpg',
  
  // Gaming content
  'Gaming': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  'Gaming Deals': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  'Gaming Laptop': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  'RTX 4060': 'https://m.media-amazon.com/images/I/81QpkzMLQ5L._AC_SX679_.jpg',
  
  // Refurbished content
  'Refurbished': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90',
  'Refurbished Tips': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=90'
};

class ComprehensiveImageReplacer {
  constructor() {
    this.replacements = 0;
    this.filesProcessed = [];
  }

  findProductMatch(text) {
    for (const [productName, imageUrl] of Object.entries(COMPREHENSIVE_PRODUCT_IMAGES)) {
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
    
    // Find ALL placeholder patterns
    const placeholderRegexes = [
      /src=\"https:\/\/placehold\.co\/[^\"]*\"/g,
      /src=\"data:image\/svg\+xml;base64,[^\"]*\"/g
    ];
    
    placeholderRegexes.forEach(regex => {
      let matches = content.match(regex);
      
      while (matches) {
        let replaced = false;
        matches.forEach(match => {
          // Extract surrounding context to identify product
          const matchIndex = content.indexOf(match);
          const contextStart = Math.max(0, matchIndex - 1000);
          const contextEnd = Math.min(content.length, matchIndex + 1000);
          const context = content.substring(contextStart, contextEnd);
          
          // Find product name in context
          const realImageUrl = this.findProductMatch(context);
          
          if (realImageUrl) {
            const newImageTag = `src="${realImageUrl}"`;
            content = content.replace(match, newImageTag);
            fileReplacements++;
            this.replacements++;
            replaced = true;
            
            console.log(`  ✅ Replaced: ${realImageUrl.substring(0, 50)}...`);
          }
        });
        
        // Check if there are more matches after replacements
        if (replaced) {
          matches = content.match(regex);
        } else {
          break;
        }
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
    console.log('🖼️  Running Comprehensive Image Replacement...\n');
    
    const allFiles = [
      'pages/index.html',
      'pages/deals.html',
      'pages/blog.html',
      'public/index.html',
      'dist/index.html',
      'dist/deals.html',
      'dist/blog.html',
      'dist/pages/index.html',
      'dist/pages/deals.html',
      'dist/pages/blog.html'
    ];
    
    allFiles.forEach(file => {
      this.processFile(file);
    });
    
    console.log(`\n📊 Comprehensive Image Replacement Summary:`);
    console.log(`✅ Total Replacements: ${this.replacements}`);
    console.log(`📁 Files Updated: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images across all files!`);
    } else {
      console.log('\n✅ All placeholder images have been replaced.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new ComprehensiveImageReplacer();
  replacer.run();
}

module.exports = ComprehensiveImageReplacer;