#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Standardized social media URLs
const standardUrls = {
  facebook: 'https://facebook.com/dealradarus',
  twitter: 'https://twitter.com/dealradarus', 
  instagram: 'https://instagram.com/dealradarus',
  linkedin: 'https://linkedin.com/company/dealradarus',
  tiktok: 'https://tiktok.com/@dealradarus',
  youtube: 'https://youtube.com/@dealradarus'
};

// URL variations that need to be standardized
const replacements = [
  // Facebook variations
  { pattern: /https?:\/\/(www\.)?facebook\.com\/DealRadarUS/g, replacement: standardUrls.facebook },
  { pattern: /https?:\/\/(www\.)?facebook\.com\/dealradarus/g, replacement: standardUrls.facebook },
  
  // TikTok variations  
  { pattern: /https?:\/\/(www\.)?tiktok\.com\/@DealRadarUS/g, replacement: standardUrls.tiktok },
  { pattern: /https?:\/\/(www\.)?tiktok\.com\/@dealradarus/g, replacement: standardUrls.tiktok },
  
  // YouTube variations
  { pattern: /https?:\/\/(www\.)?youtube\.com\/@DealRadarUS/g, replacement: standardUrls.youtube },
  { pattern: /https?:\/\/(www\.)?youtube\.com\/@dealradarus/g, replacement: standardUrls.youtube },
  
  // Twitter variations
  { pattern: /https?:\/\/(www\.)?twitter\.com\/DealRadarUS/g, replacement: standardUrls.twitter },
  { pattern: /https?:\/\/(www\.)?twitter\.com\/dealradarus/g, replacement: standardUrls.twitter },
  
  // Instagram variations
  { pattern: /https?:\/\/(www\.)?instagram\.com\/DealRadarUS/g, replacement: standardUrls.instagram },
  { pattern: /https?:\/\/(www\.)?instagram\.com\/dealradarus/g, replacement: standardUrls.instagram },
  
  // LinkedIn variations
  { pattern: /https?:\/\/(www\.)?linkedin\.com\/company\/DealRadarUS/g, replacement: standardUrls.linkedin },
  { pattern: /https?:\/\/(www\.)?linkedin\.com\/company\/dealradarus/g, replacement: standardUrls.linkedin }
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

console.log(`🔍 Processing ${htmlFiles.length} HTML files for social media URL standardization...`);

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;
  let fileReplacements = 0;
  
  // Apply all replacements
  replacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileReplacements += matches.length;
      fileModified = true;
    }
  });
  
  if (fileModified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath}: ${fileReplacements} URLs standardized`);
    filesModified++;
    totalReplacements += fileReplacements;
  }
});

console.log(`\n📊 STANDARDIZATION RESULTS:`);
console.log(`📁 Files processed: ${htmlFiles.length}`);
console.log(`✏️  Files modified: ${filesModified}`);
console.log(`🔗 Total URLs standardized: ${totalReplacements}`);
console.log(`\n✅ FINAL SOCIAL MEDIA URLS:`);
console.log(`📘 Facebook: ${standardUrls.facebook}`);
console.log(`🐦 Twitter: ${standardUrls.twitter}`);
console.log(`📷 Instagram: ${standardUrls.instagram}`);
console.log(`💼 LinkedIn: ${standardUrls.linkedin}`);
console.log(`🎵 TikTok: ${standardUrls.tiktok}`);
console.log(`📹 YouTube: ${standardUrls.youtube}`);
console.log(`\n🎯 All social media URLs are now standardized!`);