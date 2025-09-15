#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Official social media URLs provided by user
const officialUrls = {
  facebook: 'https://www.facebook.com/DealRadarUS',
  tiktok: 'https://www.tiktok.com/@dealradar_us',
  youtube: 'https://www.youtube.com/@Deal_Radar_US'
};

// URL patterns to replace (current URLs we need to update)
const replacements = [
  // Facebook replacements
  {
    pattern: /https?:\/\/(www\.)?facebook\.com\/dealradarus/g,
    replacement: officialUrls.facebook,
    platform: 'Facebook'
  },
  
  // TikTok replacements
  {
    pattern: /https?:\/\/(www\.)?tiktok\.com\/@dealradarus/g,
    replacement: officialUrls.tiktok,
    platform: 'TikTok'
  },
  
  // YouTube replacements
  {
    pattern: /https?:\/\/(www\.)?youtube\.com\/@dealradarus/g,
    replacement: officialUrls.youtube,
    platform: 'YouTube'
  }
];

// Find HTML files
function findHtmlFiles(dir) {
  let htmlFiles = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      htmlFiles = htmlFiles.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

// Process files
const htmlFiles = findHtmlFiles('.');
let totalReplacements = 0;
let filesModified = 0;
const platformStats = { Facebook: 0, TikTok: 0, YouTube: 0 };

console.log(`🔍 Updating to OFFICIAL social media URLs...`);
console.log(`📘 Facebook: ${officialUrls.facebook}`);
console.log(`🎵 TikTok: ${officialUrls.tiktok}`);
console.log(`📹 YouTube: ${officialUrls.youtube}`);
console.log(`\n🔍 Processing ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;
  let fileReplacements = 0;
  
  // Apply all replacements
  replacements.forEach(({ pattern, replacement, platform }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      const count = matches.length;
      fileReplacements += count;
      platformStats[platform] += count;
      fileModified = true;
    }
  });
  
  if (fileModified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath}: ${fileReplacements} URLs updated`);
    filesModified++;
    totalReplacements += fileReplacements;
  }
});

console.log(`\n📊 OFFICIAL URL UPDATE RESULTS:`);
console.log(`📁 Files processed: ${htmlFiles.length}`);
console.log(`✏️  Files modified: ${filesModified}`);
console.log(`🔗 Total URLs updated: ${totalReplacements}`);
console.log(`\n📱 Platform Breakdown:`);
console.log(`📘 Facebook: ${platformStats.Facebook} URLs updated`);
console.log(`🎵 TikTok: ${platformStats.TikTok} URLs updated`);
console.log(`📹 YouTube: ${platformStats.YouTube} URLs updated`);
console.log(`\n✅ ALL SOCIAL MEDIA LINKS NOW USE OFFICIAL URLS!`);
console.log(`\n🎯 FINAL OFFICIAL SOCIAL MEDIA URLS:`);
console.log(`📘 Facebook: ${officialUrls.facebook}`);
console.log(`🎵 TikTok: ${officialUrls.tiktok}`);
console.log(`📹 YouTube: ${officialUrls.youtube}`);