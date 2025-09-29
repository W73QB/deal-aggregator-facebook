#!/usr/bin/env node

/**
 * Real Product Image URL Replacer
 * Replaces placeholder SVG images with actual product image URLs
 */

const fs = require('fs');
const path = require('path');

const REAL_PRODUCT_IMAGES = {
  // MacBook Air M2 - Real Apple product image
  'MacBook Air': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90',
  
  // AirPods Pro - Real Apple product image  
  'AirPods Pro': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
  
  // Samsung 4K Monitor - Real Samsung product image
  'Samsung 32"': 'https://images.samsung.com/is/image/samsung/p6pim/us/lc32f391fwnxza/gallery/us-c32f391fw-lc32f391fwnxza-001-front-white',
  
  // iPad Air - Real Apple product image
  'iPad Air': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=940&hei=1112&fmt=png-alpha&qlt=80',
  
  // iPhone 15 Pro - Real Apple product image
  'iPhone 15': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-naturaltitanium-select?wid=470&hei=556&fmt=png-alpha&qlt=95',
  
  // Dell XPS 13 - Real Dell product image  
  'Dell XPS 13': 'https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/13-9315/media-gallery/notebook-xps-13-9315-nt-blue-gallery-4.psd',
  
  // Sony WH-1000XM4 - Real Sony product image
  'Sony WH-1000XM4': 'https://www.sony.com/image/5d02da5df4d2cf7531c74634c8bb8b8e?fmt=pjpeg&wid=330&bgcolor=FFFFFF',
  
  // Nintendo Switch - Real Nintendo product image
  'Nintendo Switch': 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/hardware/switch/Nintendo_Switch_hardware_Console_Joy-Con_RB',
  
  // Apple Watch - Real Apple product image
  'Apple Watch': 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/watch-s9-gps-pink-nc-45?wid=572&hei=572&fmt=jpeg&qlt=90',
  
  // Samsung Galaxy Buds - Real Samsung product image
  'Samsung Galaxy Buds': 'https://images.samsung.com/is/image/samsung/p6pim/us/sm-r180nzkaxar/gallery/us-galaxy-buds2-r180-sm-r180nzkaxar-530575260'
};

class ImageReplacer {
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
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    // Find all placeholder SVG images
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
          
          console.log(`  ✅ Replaced placeholder with real image`);
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
    console.log('🖼️  Starting Real Product Image Replacement...\n');
    
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
    
    console.log(`\n📊 Image Replacement Summary:`);
    console.log(`✅ Total Replacements: ${this.replacements}`);
    console.log(`📁 Files Processed: ${this.filesProcessed.length}`);
    
    this.filesProcessed.forEach(file => {
      console.log(`   ${file.file}: ${file.replacements} images`);
    });
    
    if (this.replacements > 0) {
      console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images with real product photos.`);
    } else {
      console.log('\n⚠️  No placeholder images found to replace.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const replacer = new ImageReplacer();
  replacer.run();
}

module.exports = ImageReplacer;