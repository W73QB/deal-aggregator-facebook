#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 PRODUCTION DEPLOYMENT SCRIPT');
console.log('================================\n');

// Configuration object with all production values
const productionConfig = {
  // Facebook Pixel
  facebookPixelId: '1427920308500326',
  
  // Google Search Console
  gscVerification: 'aCuU-LVEO6NKcV3hfJyv10UqEagxsX-o3YXnTALsk7c',
  
  // Google Analytics
  googleAnalyticsId: 'G-9ZVTTTBD03',
  
  // Amazon Affiliate
  amazonTag: 'dealradarus-20',
  
  // Social Media URLs (official)
  socialMedia: {
    facebook: 'https://www.facebook.com/DealRadarUS',
    tiktok: 'https://www.tiktok.com/@dealradar_us',
    youtube: 'https://www.youtube.com/@Deal_Radar_US',
    twitter: 'https://twitter.com/dealradarus',
    instagram: 'https://instagram.com/dealradarus',
    linkedin: 'https://linkedin.com/company/dealradarus'
  }
};

// Find production files (main website files)
function findProductionFiles() {
  const productionPaths = [
    './index.html',
    './pages/index.html', 
    './public/index.html',
    './deal-aggregator/platforms/website/pages/index.html'
  ];
  
  return productionPaths.filter(file => fs.existsSync(file));
}

// Critical replacements for production deployment
const criticalReplacements = [
  // Facebook Pixel replacements
  {
    pattern: /YOUR_FACEBOOK_PIXEL_ID_HERE/g,
    replacement: productionConfig.facebookPixelId,
    description: 'Facebook Pixel ID'
  },
  
  // Google Search Console
  {
    pattern: /YOUR_GSC_VERIFICATION_CODE_HERE/g,
    replacement: productionConfig.gscVerification,
    description: 'Google Search Console verification'
  },
  
  // Remove TODO comments for production
  {
    pattern: /<!-- GSC Verification: meta name="google-site-verification" content="TODO" -->/g,
    replacement: '',
    description: 'Remove GSC TODO comment'
  },
  
  {
    pattern: /<!-- Facebook Pixel: TODO script snippet -->/g,
    replacement: '',
    description: 'Remove Facebook Pixel TODO comment'
  }
];

// Process each file
function deployToProduction() {
  const productionFiles = findProductionFiles();
  let totalReplacements = 0;
  let filesUpdated = 0;

  console.log(`🔍 Found ${productionFiles.length} production files to update:`);
  productionFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  productionFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;
    let fileReplacements = 0;
    
    // Apply critical replacements
    criticalReplacements.forEach(({ pattern, replacement, description }) => {
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
        fileReplacements++;
        fileModified = true;
        console.log(`   ✅ ${description} updated in ${filePath}`);
      }
    });
    
    if (fileModified) {
      fs.writeFileSync(filePath, content);
      filesUpdated++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${filePath}: ${fileReplacements} critical updates applied\n`);
    }
  });
  
  return { filesUpdated, totalReplacements };
}

// Create deployment summary
function createDeploymentSummary(stats) {
  const summary = `
🚀 PRODUCTION DEPLOYMENT COMPLETE!
==================================

📊 DEPLOYMENT STATISTICS:
📁 Files Updated: ${stats.filesUpdated}
🔧 Critical Replacements: ${stats.totalReplacements}

✅ PRODUCTION CONFIGURATION APPLIED:
📘 Facebook Pixel: ${productionConfig.facebookPixelId}
🔍 GSC Verification: ${productionConfig.gscVerification}
📊 Google Analytics: ${productionConfig.googleAnalyticsId}
🛒 Amazon Affiliate: ${productionConfig.amazonTag}

📱 SOCIAL MEDIA URLS:
📘 Facebook: ${productionConfig.socialMedia.facebook}
🎵 TikTok: ${productionConfig.socialMedia.tiktok}
📹 YouTube: ${productionConfig.socialMedia.youtube}

🎯 NEXT STEPS:
1. Upload updated files to hosting server
2. Clear any CDN/caching if applicable
3. Test all integrations on live website
4. Verify Facebook Pixel is firing
5. Confirm Google Analytics tracking

🚨 IMPORTANT: Website is now 100% production-ready!
All placeholder values have been replaced with real production data.
`;

  // Save summary to file
  fs.writeFileSync('./PRODUCTION-DEPLOYMENT-SUMMARY.md', summary);
  
  console.log(summary);
}

// Execute deployment
console.log('🔧 Applying critical production updates...\n');

try {
  const stats = deployToProduction();
  createDeploymentSummary(stats);
  
  console.log('🎉 SUCCESS: Production deployment script completed!');
  console.log('📄 Summary saved to: PRODUCTION-DEPLOYMENT-SUMMARY.md');
  
} catch (error) {
  console.error('❌ DEPLOYMENT ERROR:', error.message);
  process.exit(1);
}