#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load affiliate data
const affiliateData = JSON.parse(fs.readFileSync('config/affiliate-links.json', 'utf8'));

// Define replacement mapping
const linkReplacements = {
  'https://example.com/macbook-deal?utm_source=site&utm_medium=featured&utm_campaign=dotd': 
    `https://www.amazon.com/dp/${affiliateData.deals.macbook.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
  
  'https://example.com/iphone14-deal?utm_source=site&utm_medium=grid&utm_campaign=latest':
    `https://www.amazon.com/dp/${affiliateData.deals.iphone14.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':
    `https://www.amazon.com/dp/${affiliateData.deals.iphone14.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/echo-deal?utm_source=site&utm_medium=grid&utm_campaign=latest':
    `https://www.amazon.com/dp/${affiliateData.deals.echo.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/monitor-deal?utm_source=site&utm_medium=grid&utm_campaign=latest':
    `https://www.amazon.com/dp/${affiliateData.deals.monitor.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/airpods-deal?utm_source=site&utm_medium=grid&utm_campaign=latest':
    `https://www.amazon.com/dp/${affiliateData.deals.airpods.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':
    `https://www.amazon.com/dp/${affiliateData.deals.airfryer.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':
    `https://www.amazon.com/dp/${affiliateData.deals.kindle.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':
    `https://www.amazon.com/dp/${affiliateData.deals.vacuum.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`,
    
  'https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':
    `https://www.amazon.com/dp/${affiliateData.deals.soundbar.amazon}?tag=${affiliateData.amazon.tag}&linkCode=osi&th=1&psc=1`
};

// Find all HTML files
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

console.log(`🔍 Processing ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;
  let fileReplacements = 0;
  
  // Replace all placeholder links
  for (const [placeholder, realLink] of Object.entries(linkReplacements)) {
    if (content.includes(placeholder)) {
      content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), realLink);
      fileReplacements++;
      fileModified = true;
    }
  }
  
  if (fileModified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath}: ${fileReplacements} replacements`);
    filesModified++;
    totalReplacements += fileReplacements;
  }
});

console.log(`\n📊 RESULTS:`);
console.log(`📁 Files processed: ${htmlFiles.length}`);
console.log(`✏️  Files modified: ${filesModified}`);
console.log(`🔗 Total replacements: ${totalReplacements}`);
console.log(`\n✅ All example.com links replaced with real affiliate links!`);