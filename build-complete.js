#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting complete build process...');

// 1. Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('dist')) {
    execSync('rm -rf dist');
}
fs.mkdirSync('dist', { recursive: true });

// 2. Run webpack build
console.log('📦 Running webpack build...');
execSync('webpack --mode production', { stdio: 'inherit' });

// 3. Copy all required files
console.log('📁 Copying files...');

// Copy basic files
execSync('cp robots.txt sitemap*.xml dist/');
execSync('cp favicon.ico dist/');

// Copy pages
execSync('mkdir -p dist/pages');
execSync('cp -r pages/* dist/pages/');

// Copy main HTML files to root
execSync('cp pages/index.html dist/index.html');
execSync('cp pages/deals.html dist/deals.html'); 
execSync('cp pages/blog.html dist/blog.html');

// Copy JS files
execSync('mkdir -p dist/js');
execSync('cp js/*.js dist/js/');

// Copy CSS files
execSync('mkdir -p dist/css');
execSync('cp css/styles.css dist/css/');

// Copy assets
execSync('cp -r assets dist/');

console.log('✅ Complete build finished!');

// 4. Verify structure
console.log('📋 Verifying structure...');
const distFiles = fs.readdirSync('dist');
console.log('📁 dist/ contents:', distFiles);

if (fs.existsSync('dist/css/styles.css')) {
    console.log('✅ CSS file exists');
} else {
    console.log('❌ CSS file missing');
}

if (fs.existsSync('dist/assets')) {
    console.log('✅ Assets directory exists');
} else {
    console.log('❌ Assets directory missing');
}

console.log('🎉 Build process complete!');