#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining issues...');

// 1. Replace Soundbar SVG placeholder
const SOUNDBAR_SVG_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFBNzNFOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0+U291bmRiYXI8L3RleHQ+PC9zdmc+';
const SOUNDBAR_REAL_IMAGE = 'https://m.media-amazon.com/images/I/61SJJ1eEq3L._AC_SX679_.jpg';

// Files to fix
const filesToFix = [
    'dist/deals.html',
    'dist/pages/deals.html',
    'pages/deals.html'
];

let totalReplacements = 0;
let filesFixed = 0;

filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace soundbar placeholder
        const soundbarReplacements = (content.match(new RegExp(SOUNDBAR_SVG_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (soundbarReplacements > 0) {
            content = content.replace(new RegExp(SOUNDBAR_SVG_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), SOUNDBAR_REAL_IMAGE);
            fs.writeFileSync(filePath, content);
            console.log(`✅ ${filePath}: Fixed ${soundbarReplacements} soundbar placeholder(s)`);
            totalReplacements += soundbarReplacements;
            filesFixed++;
        }
    }
});

// 2. Check and fix CSS issues for text overlap
const cssFile = 'css/main-1757840397.css';
if (fs.existsSync(cssFile)) {
    let cssContent = fs.readFileSync(cssFile, 'utf8');
    let cssFixed = false;
    
    // Fix countdown timer positioning issues
    const countdownTimerFix = `
/* Fix countdown timer overlapping issues */
.countdown-timer {
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
    padding: 0.5rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    position: relative;
    z-index: 1;
    clear: both;
}`;

    // Fix deal card grid layout issues
    const dealCardFix = `
/* Fix deal card layout overlapping */
.deal-card.featured {
    max-width: 800px;
    margin: 0 auto 2rem auto;
    background: var(--white);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    min-height: 400px;
}

.deal-info {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    z-index: 2;
}`;

    // Add fixes if not already present
    if (!cssContent.includes('position: relative;\n    z-index: 1;\n    clear: both;')) {
        cssContent = cssContent.replace(
            /\.countdown-timer \{[^}]*\}/g,
            countdownTimerFix.trim()
        );
        cssFixed = true;
    }

    if (!cssContent.includes('min-height: 400px;')) {
        cssContent = cssContent.replace(
            /\.deal-card\.featured \{[^}]*\}/g,
            dealCardFix.split('.deal-info')[0].trim()
        );
        cssFixed = true;
    }

    if (cssFixed) {
        fs.writeFileSync(cssFile, cssContent);
        console.log('✅ Fixed CSS layout issues for text overlapping');
        filesFixed++;
    }
}

console.log('\n📊 Final Fixes Summary:');
console.log(`✅ Total Image Replacements: ${totalReplacements}`);
console.log(`📁 Files Fixed: ${filesFixed}`);
console.log('🎯 Fixed Issues:');
console.log('  - Soundbar placeholder → Real Samsung soundbar image');
console.log('  - CSS text overlapping issues');
console.log('\n✨ All visual issues should now be resolved!');