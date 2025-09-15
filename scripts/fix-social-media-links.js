#!/usr/bin/env node
/**
 * 🔗 DealRadarUS - Fix Social Media Links
 * Replace placeholder href="#" with real social media URLs + UTM tracking
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 DEALRADARUS - Social Media Links Fixer\n');
console.log('==========================================');

// Real social media URLs for DealRadarUS
const socialMediaUrls = {
    facebook: 'https://www.facebook.com/DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow',
    twitter: 'https://twitter.com/DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow', 
    instagram: 'https://instagram.com/DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow',
    linkedin: 'https://linkedin.com/company/dealradarus?utm_source=website&utm_medium=social&utm_campaign=footer_follow',
    youtube: 'https://youtube.com/@DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow',
    pinterest: 'https://pinterest.com/DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow',
    reddit: 'https://reddit.com/r/DealRadarUS?utm_source=website&utm_medium=social&utm_campaign=footer_follow'
};

// Social sharing URLs (dynamic based on current page)
const shareUrls = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    twitter: 'https://twitter.com/intent/tweet?url=',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=',
    reddit: 'https://reddit.com/submit?url='
};

const htmlFiles = [
    'index.html',
    'home.html', 
    'blog.html',
    'deals.html',
    'pages/index.html',
    'pages/blog.html',
    'pages/deals.html'
];

const results = {
    filesProcessed: 0,
    linksFixed: 0,
    socialFollowLinks: 0,
    socialShareLinks: 0
};

function fixSocialLinks(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${filePath} (not found)`);
        return;
    }

    console.log(`\n🔧 Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    const originalContent = content;

    // Fix follow/profile links (footer social icons)
    const followMappings = [
        {
            pattern: /<a([^>]*class="[^"]*fb[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${socialMediaUrls.facebook}"$2`,
            type: 'Facebook Follow'
        },
        {
            pattern: /<a([^>]*class="[^"]*tw[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi, 
            replacement: `<a$1 href="${socialMediaUrls.twitter}"$2`,
            type: 'Twitter Follow'
        },
        {
            pattern: /<a([^>]*class="[^"]*ig[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${socialMediaUrls.instagram}"$2`, 
            type: 'Instagram Follow'
        },
        {
            pattern: /<a([^>]*class="[^"]*li[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${socialMediaUrls.linkedin}"$2`,
            type: 'LinkedIn Follow'
        },
        {
            pattern: /<a([^>]*class="[^"]*yt[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${socialMediaUrls.youtube}"$2`,
            type: 'YouTube Follow'
        }
    ];

    // Fix social sharing links (blog sharing buttons)
    const currentUrl = `https://dealradarus.com/${filePath.replace('.html', '').replace('pages/', '')}`;
    const shareText = encodeURIComponent('Check out these amazing deals from DealRadarUS!');
    
    const shareMappings = [
        {
            pattern: /<a([^>]*class="[^"]*share[^"]*fb[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${shareUrls.facebook}${encodeURIComponent(currentUrl)}&utm_source=facebook&utm_medium=social_share&utm_campaign=content_sharing"$2`,
            type: 'Facebook Share'
        },
        {
            pattern: /<a([^>]*class="[^"]*share[^"]*tw[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${shareUrls.twitter}${encodeURIComponent(currentUrl)}&text=${shareText}&utm_source=twitter&utm_medium=social_share&utm_campaign=content_sharing"$2`,
            type: 'Twitter Share'
        },
        {
            pattern: /<a([^>]*class="[^"]*share[^"]*li[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${shareUrls.linkedin}${encodeURIComponent(currentUrl)}&utm_source=linkedin&utm_medium=social_share&utm_campaign=content_sharing"$2`,
            type: 'LinkedIn Share'
        },
        {
            pattern: /<a([^>]*class="[^"]*share[^"]*rd[^"]*"[^>]*)\s+href="#"([^>]*>.*?<\/a>)/gi,
            replacement: `<a$1 href="${shareUrls.reddit}${encodeURIComponent(currentUrl)}&title=${shareText}&utm_source=reddit&utm_medium=social_share&utm_campaign=content_sharing"$2`,
            type: 'Reddit Share'
        }
    ];

    // Apply follow link fixes
    followMappings.forEach(mapping => {
        const matches = content.match(mapping.pattern);
        if (matches) {
            content = content.replace(mapping.pattern, mapping.replacement);
            const fixCount = matches.length;
            changes += fixCount;
            results.socialFollowLinks += fixCount;
            console.log(`   ✅ Fixed ${fixCount} ${mapping.type} link(s)`);
        }
    });

    // Apply share link fixes  
    shareMappings.forEach(mapping => {
        const matches = content.match(mapping.pattern);
        if (matches) {
            content = content.replace(mapping.pattern, mapping.replacement);
            const fixCount = matches.length;
            changes += fixCount;
            results.socialShareLinks += fixCount;
            console.log(`   ✅ Fixed ${fixCount} ${mapping.type} link(s)`);
        }
    });

    if (changes > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`   💾 Saved ${filePath} with ${changes} fixes`);
        results.linksFixed += changes;
    } else {
        console.log(`   ℹ️  No social media placeholder links found`);
    }

    results.filesProcessed++;
}

// Process all HTML files
htmlFiles.forEach(fixSocialLinks);

// Generate summary report
console.log('\n==========================================');
console.log('📊 SOCIAL MEDIA LINKS - FIX SUMMARY');
console.log('==========================================\n');

console.log(`📄 Files processed: ${results.filesProcessed}`);
console.log(`🔗 Total links fixed: ${results.linksFixed}`);
console.log(`👥 Follow links fixed: ${results.socialFollowLinks}`);
console.log(`📤 Share links fixed: ${results.socialShareLinks}\n`);

console.log('🎯 SOCIAL MEDIA URLS CONFIGURED:');
Object.entries(socialMediaUrls).forEach(([platform, url]) => {
    console.log(`   • ${platform}: ${url}`);
});

// Save results for reporting
const reportData = {
    timestamp: new Date().toISOString(),
    filesProcessed: results.filesProcessed,
    totalLinksFixed: results.linksFixed,
    followLinksFixed: results.socialFollowLinks,
    shareLinksFixed: results.socialShareLinks,
    socialUrls: socialMediaUrls
};

fs.writeFileSync('social-media-fix-report.json', JSON.stringify(reportData, null, 2));

console.log('\n💾 Report saved to: social-media-fix-report.json');

if (results.linksFixed > 0) {
    console.log('\n🎉 SUCCESS: Social media links have been fixed!');
    console.log('📊 GA4 social_click events will now track properly');  
    console.log('🔗 Users can now follow and share content');
} else {
    console.log('\nℹ️  No placeholder social media links found to fix');
}

console.log('\n==========================================');