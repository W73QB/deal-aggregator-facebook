#!/usr/bin/env node
/**
 * 📊 DealRadarUS - SEO Status Monitoring
 * Check site health before and after GSC submission
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

console.log('📊 DEALRADARUS - SEO Status Monitor\n');
console.log('===================================');

const config = {
    domain: 'dealradarus.com',
    protocol: 'https://',
    testUrls: [
        '/',
        '/deals/',
        '/blog/', 
        '/contact/',
        '/sitemap.xml',
        '/robots.txt'
    ]
};

// HTTP request helper
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { timeout: 10000 }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve({
                statusCode: response.statusCode,
                headers: response.headers,
                body: data,
                url: url
            }));
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Check URL accessibility
async function checkUrlAccessibility() {
    console.log('🔍 CHECKING URL ACCESSIBILITY');
    console.log('==============================');
    
    const results = [];
    
    for (const path of config.testUrls) {
        const fullUrl = config.protocol + config.domain + path;
        
        try {
            const response = await makeRequest(fullUrl);
            const status = response.statusCode < 400 ? '✅' : '❌';
            const statusText = response.statusCode < 400 ? 'OK' : 'ERROR';
            
            console.log(`   ${status} ${path}: ${response.statusCode} ${statusText}`);
            
            results.push({
                path,
                url: fullUrl,
                status: response.statusCode,
                success: response.statusCode < 400,
                headers: response.headers
            });
            
        } catch (error) {
            console.log(`   ❌ ${path}: ${error.message}`);
            results.push({
                path,
                url: fullUrl,
                status: 0,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// Validate sitemap content
function validateSitemap() {
    console.log('\n📄 VALIDATING SITEMAP CONTENT');
    console.log('==============================');
    
    try {
        const sitemapContent = fs.readFileSync('sitemap.xml', 'utf8');
        const urlMatches = sitemapContent.match(/<loc>.*?<\/loc>/g);
        const urls = urlMatches ? urlMatches.map(match => 
            match.replace(/<\/?loc>/g, '')
        ) : [];
        
        console.log(`   ✅ Sitemap found: ${urls.length} URLs`);
        
        urls.forEach((url, index) => {
            console.log(`      ${index + 1}. ${url}`);
        });
        
        // Check for required URLs
        const requiredPaths = ['/', '/deals/', '/blog/', '/contact/'];
        const missingPaths = requiredPaths.filter(path => 
            !urls.some(url => url.endsWith(path))
        );
        
        if (missingPaths.length > 0) {
            console.log(`   ⚠️  Missing paths: ${missingPaths.join(', ')}`);
        } else {
            console.log('   ✅ All required paths present');
        }
        
        return { 
            success: true, 
            totalUrls: urls.length, 
            urls, 
            missingPaths 
        };
        
    } catch (error) {
        console.log(`   ❌ Sitemap error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Validate robots.txt
function validateRobotsTxt() {
    console.log('\n🤖 VALIDATING ROBOTS.TXT');
    console.log('=========================');
    
    try {
        const robotsContent = fs.readFileSync('robots.txt', 'utf8');
        
        const checks = [
            { pattern: /User-agent:\s*\*/, name: 'User-agent directive' },
            { pattern: /Allow:\s*\//, name: 'Allow directive' },
            { pattern: /Sitemap:\s*https?:\/\/dealradarus\.com\/sitemap\.xml/i, name: 'Sitemap reference' }
        ];
        
        let allPassed = true;
        
        checks.forEach(check => {
            const passed = check.pattern.test(robotsContent);
            const status = passed ? '✅' : '❌';
            console.log(`   ${status} ${check.name}`);
            if (!passed) allPassed = false;
        });
        
        return { success: allPassed, content: robotsContent };
        
    } catch (error) {
        console.log(`   ❌ robots.txt error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Check meta tags in HTML
function checkMetaTags() {
    console.log('\n🏷️  CHECKING HTML META TAGS');
    console.log('=============================');
    
    const htmlFiles = ['index.html', 'pages/contact.html', 'deals.html'];
    const results = [];
    
    htmlFiles.forEach(file => {
        try {
            if (!fs.existsSync(file)) {
                console.log(`   ⏭️  ${file}: Not found (skipping)`);
                return;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            const checks = [
                { pattern: /<title>.*?<\/title>/i, name: 'Title tag' },
                { pattern: /<meta\s+name=["']description["']/i, name: 'Meta description' },
                { pattern: /<meta\s+name=["']viewport["']/i, name: 'Viewport meta' },
                { pattern: /mailto:deals@dealradarus\.com/i, name: 'Contact email' }
            ];
            
            console.log(`   📄 ${file}:`);
            let fileScore = 0;
            
            checks.forEach(check => {
                const passed = check.pattern.test(content);
                const status = passed ? '✅' : '⚠️ ';
                console.log(`      ${status} ${check.name}`);
                if (passed) fileScore++;
            });
            
            results.push({
                file,
                score: fileScore,
                maxScore: checks.length,
                percentage: Math.round((fileScore / checks.length) * 100)
            });
            
        } catch (error) {
            console.log(`   ❌ ${file}: ${error.message}`);
        }
    });
    
    return results;
}

// Generate SEO readiness report
async function generateReadinessReport() {
    const timestamp = new Date().toISOString();
    
    console.log('\n📋 GENERATING SEO READINESS REPORT');
    console.log('===================================');
    
    // Run all checks
    const urlResults = await checkUrlAccessibility();
    const sitemapResult = validateSitemap();
    const robotsResult = validateRobotsTxt();
    const metaResults = checkMetaTags();
    
    // Calculate overall scores
    const urlsAccessible = urlResults.filter(r => r.success).length;
    const urlsTotal = urlResults.length;
    const urlScore = Math.round((urlsAccessible / urlsTotal) * 100);
    
    const averageMetaScore = metaResults.length > 0 
        ? Math.round(metaResults.reduce((sum, r) => sum + r.percentage, 0) / metaResults.length)
        : 0;
    
    const overallScore = Math.round(
        (urlScore * 0.4) + 
        (sitemapResult.success ? 25 : 0) + 
        (robotsResult.success ? 25 : 0) + 
        (averageMetaScore * 0.1)
    );
    
    const report = {
        timestamp,
        domain: config.domain,
        overallScore,
        readiness: overallScore >= 80 ? 'Ready' : overallScore >= 60 ? 'Needs fixes' : 'Not ready',
        
        urlAccessibility: {
            score: urlScore,
            accessible: urlsAccessible,
            total: urlsTotal,
            results: urlResults
        },
        
        sitemap: sitemapResult,
        robotsTxt: robotsResult,
        
        metaTags: {
            averageScore: averageMetaScore,
            results: metaResults
        },
        
        gscReadiness: {
            sitemapReady: sitemapResult.success,
            robotsReady: robotsResult.success,
            urlsAccessible: urlScore >= 90,
            metaTagsPresent: averageMetaScore >= 75
        },
        
        recommendations: []
    };
    
    // Add recommendations
    if (urlScore < 90) report.recommendations.push('Fix URL accessibility issues');
    if (!sitemapResult.success) report.recommendations.push('Fix sitemap.xml errors');
    if (!robotsResult.success) report.recommendations.push('Fix robots.txt configuration');
    if (averageMetaScore < 75) report.recommendations.push('Improve meta tags on key pages');
    
    if (report.recommendations.length === 0) {
        report.recommendations.push('Site ready for Google Search Console submission');
    }
    
    // Save report
    fs.writeFileSync('seo-readiness-report.json', JSON.stringify(report, null, 2));
    
    return report;
}

// Main execution
async function main() {
    try {
        const report = await generateReadinessReport();
        
        // Display summary
        console.log('\n===================================');
        console.log('📊 SEO READINESS SUMMARY');
        console.log('===================================');
        
        console.log(`🎯 Overall Score: ${report.overallScore}/100`);
        console.log(`📊 Readiness: ${report.readiness}`);
        console.log(`🌐 URL Accessibility: ${report.urlAccessibility.score}%`);
        console.log(`📄 Sitemap: ${report.sitemap.success ? '✅ Valid' : '❌ Issues'}`);
        console.log(`🤖 Robots.txt: ${report.robotsTxt.success ? '✅ Valid' : '❌ Issues'}`);
        console.log(`🏷️  Meta Tags: ${report.metaTags.averageScore}% average`);
        
        console.log('\n📋 RECOMMENDATIONS:');
        report.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
        
        console.log(`\n💾 Report saved: seo-readiness-report.json`);
        
        if (report.overallScore >= 80) {
            console.log('\n🎉 READY FOR GOOGLE SEARCH CONSOLE SUBMISSION!');
            console.log('Next: Visit https://search.google.com/search-console');
        } else {
            console.log('\n⚠️  Fix issues above before GSC submission');
        }
        
        console.log('\n===================================');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();