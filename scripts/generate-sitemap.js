#!/usr/bin/env node
/**
 * 🗺️ DealRadarUS - Sitemap Generator
 * Generate SEO-optimized XML sitemap with clean URLs
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️ DEALRADARUS - Sitemap Generation\n');
console.log('==================================');

// Site configuration
const config = {
    baseUrl: 'https://dealradarus.com',
    lastModified: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    defaultPriority: 0.5,
    defaultChangeFreq: 'weekly'
};

// URL structure with SEO priorities
const sitePages = [
    { url: '/', priority: 1.0, changefreq: 'daily', description: 'Homepage' },
    { url: '/deals/', priority: 0.9, changefreq: 'daily', description: 'Deals page' },
    { url: '/blog/', priority: 0.8, changefreq: 'weekly', description: 'Blog page' },
    { url: '/contact/', priority: 0.6, changefreq: 'monthly', description: 'Contact page' },
    { url: '/affiliate-disclosure/', priority: 0.4, changefreq: 'monthly', description: 'Affiliate disclosure' },
    { url: '/privacy-policy/', priority: 0.4, changefreq: 'monthly', description: 'Privacy policy' },
    { url: '/terms-of-service/', priority: 0.4, changefreq: 'monthly', description: 'Terms of service' },
    
    // Deal categories (if they exist)
    { url: '/deals/refurbished/', priority: 0.7, changefreq: 'daily', description: 'Refurbished deals' },
    { url: '/deals/smart-home/', priority: 0.7, changefreq: 'daily', description: 'Smart home deals' },
    { url: '/deals/open-box/', priority: 0.7, changefreq: 'daily', description: 'Open box deals' },
    { url: '/deals/trending/', priority: 0.8, changefreq: 'hourly', description: 'Trending deals' }
];

// Generate XML sitemap
function generateSitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    let totalUrls = 0;

    sitePages.forEach(page => {
        console.log(`📝 Adding: ${page.url} (Priority: ${page.priority}, Freq: ${page.changefreq})`);
        
        sitemap += `    <url>
        <loc>${config.baseUrl}${page.url}</loc>
        <lastmod>${config.lastModified}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`;
        totalUrls++;
    });

    sitemap += `</urlset>`;

    // Write sitemap.xml
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log(`✅ Generated sitemap.xml with ${totalUrls} URLs`);
    
    return { sitemap, totalUrls };
}

// Generate robots.txt sitemap reference validation
function validateRobotsTxt() {
    if (fs.existsSync('robots.txt')) {
        const robotsContent = fs.readFileSync('robots.txt', 'utf8');
        const sitemapLine = robotsContent.includes('Sitemap: https://dealradarus.com/sitemap.xml');
        
        if (sitemapLine) {
            console.log('✅ robots.txt contains correct sitemap reference');
        } else {
            console.log('⚠️  robots.txt missing or incorrect sitemap reference');
        }
    } else {
        console.log('⚠️  robots.txt not found');
    }
}

// Generate sitemap index (for future expansion)
function generateSitemapIndex() {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${config.baseUrl}/sitemap.xml</loc>
        <lastmod>${config.lastModified}</lastmod>
    </sitemap>
</sitemapindex>`;

    fs.writeFileSync('sitemap-index.xml', sitemapIndex);
    console.log('✅ Generated sitemap-index.xml for future expansion');
}

// Create URL validation report
function createUrlValidationReport() {
    const report = {
        timestamp: new Date().toISOString(),
        baseUrl: config.baseUrl,
        totalUrls: sitePages.length,
        sitePages: sitePages.map(page => ({
            url: config.baseUrl + page.url,
            priority: page.priority,
            changefreq: page.changefreq,
            description: page.description
        })),
        seoNotes: [
            'Homepage has highest priority (1.0)',
            'Deals pages have high priority (0.7-0.9) with frequent updates',
            'Legal pages have lower priority (0.4) with monthly updates',
            'Trending deals update hourly for maximum SEO benefit',
            'All URLs use clean structure without .html extensions'
        ]
    };

    fs.writeFileSync('sitemap-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Created sitemap validation report');
}

// Main execution
console.log('🚀 Generating XML sitemap...\n');

const { totalUrls } = generateSitemap();
validateRobotsTxt();
generateSitemapIndex();
createUrlValidationReport();

// Generate summary
console.log('\n==================================');
console.log('🗺️ SITEMAP GENERATION - SUMMARY');
console.log('==================================\n');

console.log(`🌐 Base URL: ${config.baseUrl}`);
console.log(`📄 Total URLs: ${totalUrls}`);
console.log(`📅 Last Modified: ${config.lastModified}\n`);

console.log('📊 PRIORITY BREAKDOWN:');
const priorityGroups = {};
sitePages.forEach(page => {
    if (!priorityGroups[page.priority]) priorityGroups[page.priority] = 0;
    priorityGroups[page.priority]++;
});

Object.entries(priorityGroups)
    .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
    .forEach(([priority, count]) => {
        console.log(`   Priority ${priority}: ${count} page(s)`);
    });

console.log('\n🔄 UPDATE FREQUENCIES:');
const freqGroups = {};
sitePages.forEach(page => {
    if (!freqGroups[page.changefreq]) freqGroups[page.changefreq] = 0;
    freqGroups[page.changefreq]++;
});

Object.entries(freqGroups).forEach(([freq, count]) => {
    console.log(`   ${freq}: ${count} page(s)`);
});

console.log('\n📁 FILES GENERATED:');
console.log('   • sitemap.xml (Main sitemap)');
console.log('   • sitemap-index.xml (For future expansion)');
console.log('   • sitemap-report.json (Validation report)');

console.log('\n🎯 SEO BENEFITS:');
console.log('   ✅ Clean URL structure matches site navigation');
console.log('   ✅ Priority weighting favors high-value pages');
console.log('   ✅ Update frequencies optimize crawl efficiency');
console.log('   ✅ XML format ensures maximum search engine compatibility');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Upload sitemap.xml to website root');
console.log('2. Submit to Google Search Console');
console.log('3. Submit to Bing Webmaster Tools');
console.log('4. Monitor indexing status and crawl errors');

console.log('\n==================================');