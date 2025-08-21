const fs = require('fs');
const path = require('path');

// Define the scripts that need path updates
const scriptsToUpdate = [
  '../core/crawl/crawl-multi-sources.js',
  '../core/process/process-deals.js',
  '../core/process/enrich-deals.js',
  '../core/media/capture-screenshots.js',
  '../core/schedule/generate-schedule.js',
  '../platforms/facebook/facebook-post.js',
  '../platforms/facebook/facebook-post-live.js',
  '../platforms/facebook/test-facebook-access.js'
];

console.log('Updating script paths for new directory structure...');

scriptsToUpdate.forEach(scriptPath => {
  const fullPath = path.resolve(__dirname, scriptPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Script not found: ${scriptPath}`);
    return;
  }
  
  console.log(`Processing: ${scriptPath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Update config paths
  content = content.replace(/['"]\.\/(config\/[^'"]+)['"]/g, '"../../$1"');
  content = content.replace(/['"]\.\.\/(config\/[^'"]+)['"]/g, '"../../$1"');
  content = content.replace(/['"](config\/[^'"]+)['"]/g, '"../../$1"');
  
  // Update data paths
  content = content.replace(/['"]\.\/(deals\/[^'"]+)['"]/g, '"../../data/$1"');
  content = content.replace(/['"]\.\.\/(deals\/[^'"]+)['"]/g, '"../../data/$1"');
  content = content.replace(/['"](deals\/[^'"]+)['"]/g, '"../../data/$1"');
  
  // Update logs paths
  content = content.replace(/['"]\.\/(logs\/[^'"]+)['"]/g, '"../../data/$1"');
  content = content.replace(/['"]\.\.\/(logs\/[^'"]+)['"]/g, '"../../data/$1"');
  content = content.replace(/['"](logs\/[^'"]+)['"]/g, '"../../data/$1"');
  
  // Update relative paths for deals directories
  content = content.replace(/deals\/raw/g, '../../data/raw');
  content = content.replace(/deals\/enriched/g, '../../data/enriched');
  content = content.replace(/selected-deals-/g, '../../data/selected/selected-deals-');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Updated: ${scriptPath}`);
});

console.log('Script path updates completed!');