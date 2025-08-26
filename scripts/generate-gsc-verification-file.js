#!/usr/bin/env node
/**
 * 🔍 DealRadarUS - Google Search Console Verification Helper
 * Generate verification file and setup instructions
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DEALRADARUS - Google Search Console Setup Helper\n');
console.log('=================================================');

const config = {
    domain: 'dealradarus.com',
    protocol: 'https://',
    sitemapPath: '/sitemap.xml',
    robotsPath: '/robots.txt'
};

// Generate placeholder verification file
function generateVerificationFile() {
    const verificationContent = `google-site-verification: google-site-verification-dealradarus.html`;
    const filename = 'google-site-verification-dealradarus.html';
    
    fs.writeFileSync(filename, verificationContent);
    console.log(`📁 Generated placeholder verification file: ${filename}`);
    console.log('   Replace with actual verification file from Google Search Console');
    
    return filename;
}

// Generate meta tag template
function generateMetaTagTemplate() {
    const metaTemplate = `<!-- Google Search Console Verification -->
<!-- Replace YOUR_VERIFICATION_CODE with actual code from GSC -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />`;
    
    fs.writeFileSync('gsc-meta-tag-template.html', metaTemplate);
    console.log('📄 Generated meta tag template: gsc-meta-tag-template.html');
}

// Generate DNS TXT record template  
function generateDNSTemplate() {
    const dnsTemplate = `# Google Search Console DNS Verification
# Add this TXT record to your DNS settings for ${config.domain}

Record Type: TXT
Host: @ (or root domain)
Value: google-site-verification=YOUR_VERIFICATION_CODE_HERE
TTL: 3600 (1 hour)

# Verification Steps:
1. Log into your DNS provider (Cloudflare, Namecheap, etc.)
2. Add the TXT record above with your actual verification code
3. Wait for DNS propagation (up to 24 hours)
4. Click "Verify" in Google Search Console`;

    fs.writeFileSync('gsc-dns-verification.txt', dnsTemplate);
    console.log('🌐 Generated DNS verification template: gsc-dns-verification.txt');
}

// Create GSC submission checklist
function createSubmissionChecklist() {
    const checklist = {
        timestamp: new Date().toISOString(),
        domain: config.domain,
        fullUrl: config.protocol + config.domain,
        sitemapUrl: config.protocol + config.domain + config.sitemapPath,
        robotsUrl: config.protocol + config.domain + config.robotsPath,
        
        verificationMethods: {
            htmlFile: {
                status: 'pending',
                filename: 'google-site-verification-dealradarus.html',
                instructions: 'Download from GSC, replace placeholder file, upload to root'
            },
            metaTag: {
                status: 'template_ready', 
                file: 'gsc-meta-tag-template.html',
                instructions: 'Add meta tag to <head> of all HTML pages'
            },
            dnsRecord: {
                status: 'template_ready',
                file: 'gsc-dns-verification.txt', 
                instructions: 'Add TXT record to DNS settings'
            }
        },
        
        submissionUrls: [
            config.protocol + config.domain + '/',
            config.protocol + config.domain + '/deals/',
            config.protocol + config.domain + '/blog/',
            config.protocol + config.domain + '/contact/',
            config.protocol + config.domain + '/affiliate-disclosure/',
            config.protocol + config.domain + '/privacy-policy/'
        ],
        
        sitemapInfo: {
            totalUrls: 11,
            lastGenerated: '2025-08-26',
            priority_pages: [
                { url: '/', priority: 1.0 },
                { url: '/deals/', priority: 0.9 },
                { url: '/blog/', priority: 0.8 }
            ]
        },
        
        expectedTimeline: {
            verification: '1-2 hours after file upload',
            sitemapProcessing: '1-3 days', 
            initialIndexing: '1-2 weeks',
            fullDataAvailable: '2-4 weeks'
        },
        
        nextSteps: [
            'Visit https://search.google.com/search-console',
            'Add property: ' + config.protocol + config.domain,
            'Choose verification method and complete setup',
            'Submit sitemap: ' + config.sitemapPath,
            'Request indexing for key pages',
            'Set up monitoring and alerts',
            'Configure international targeting (US)',
            'Monitor Core Web Vitals'
        ]
    };
    
    fs.writeFileSync('gsc-submission-checklist.json', JSON.stringify(checklist, null, 2));
    console.log('📋 Generated submission checklist: gsc-submission-checklist.json');
    
    return checklist;
}

// Validate current site structure
function validateSiteStructure() {
    console.log('\n🔍 VALIDATING CURRENT SITE STRUCTURE');
    console.log('=====================================');
    
    const checks = [
        { file: 'sitemap.xml', required: true },
        { file: 'robots.txt', required: true },
        { file: 'index.html', required: true },
        { file: 'pages/contact.html', required: true }
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
        const exists = fs.existsSync(check.file);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${check.file}: ${exists ? 'Found' : 'Missing'}`);
        
        if (!exists && check.required) {
            allValid = false;
        }
    });
    
    console.log(`\n📊 Site Structure: ${allValid ? '✅ Ready for GSC submission' : '❌ Issues need fixing'}`);
    return allValid;
}

// Generate quick setup script
function generateQuickSetupScript() {
    const setupScript = `#!/bin/bash
# Quick Google Search Console Setup for DealRadarUS

echo "🔍 DealRadarUS - Google Search Console Quick Setup"
echo "================================================="

# Step 1: Validate files exist
echo "Step 1: Validating required files..."
[ -f "sitemap.xml" ] && echo "✅ sitemap.xml found" || echo "❌ sitemap.xml missing"
[ -f "robots.txt" ] && echo "✅ robots.txt found" || echo "❌ robots.txt missing"

# Step 2: Show URLs to test
echo ""
echo "Step 2: Test these URLs before GSC submission:"
echo "https://dealradarus.com/"
echo "https://dealradarus.com/sitemap.xml"  
echo "https://dealradarus.com/robots.txt"

# Step 3: GSC submission reminder
echo ""
echo "Step 3: Manual GSC setup required:"
echo "1. Visit: https://search.google.com/search-console"
echo "2. Add property: https://dealradarus.com"
echo "3. Complete verification (HTML file/DNS/Meta tag)"
echo "4. Submit sitemap: sitemap.xml"
echo "5. Request indexing for key pages"

echo ""
echo "✅ Setup files generated. Complete manual GSC setup when ready."`;

    fs.writeFileSync('gsc-quick-setup.sh', setupScript);
    fs.chmodSync('gsc-quick-setup.sh', '755');
    console.log('🚀 Generated quick setup script: gsc-quick-setup.sh');
}

// Main execution
console.log('🚀 Generating Google Search Console setup files...\n');

generateVerificationFile();
generateMetaTagTemplate();
generateDNSTemplate();
const checklist = createSubmissionChecklist();
const siteValid = validateSiteStructure();
generateQuickSetupScript();

// Summary report
console.log('\n=================================================');
console.log('🔍 GOOGLE SEARCH CONSOLE SETUP - SUMMARY');
console.log('=================================================\n');

console.log(`🌐 Target Domain: ${config.domain}`);
console.log(`📊 Sitemap URLs: ${checklist.sitemapInfo.totalUrls}`);
console.log(`📁 Files Generated: 5`);
console.log(`✅ Site Structure: ${siteValid ? 'Ready' : 'Needs fixes'}\n`);

console.log('📋 GENERATED FILES:');
console.log('   • google-site-verification-dealradarus.html (placeholder)');
console.log('   • gsc-meta-tag-template.html (meta tag template)');
console.log('   • gsc-dns-verification.txt (DNS instructions)');
console.log('   • gsc-submission-checklist.json (complete checklist)');
console.log('   • gsc-quick-setup.sh (setup script)');

console.log('\n🎯 NEXT ACTIONS:');
console.log('1. Visit Google Search Console');
console.log('2. Add property: https://dealradarus.com');
console.log('3. Choose verification method:');
console.log('   - HTML file (recommended): Replace placeholder file');
console.log('   - Meta tag: Add to all pages <head>');
console.log('   - DNS TXT: Add record to DNS provider');
console.log('4. Submit sitemap.xml');
console.log('5. Request indexing for key pages');

console.log('\n📈 EXPECTED TIMELINE:');
console.log('   • Verification: 1-2 hours');
console.log('   • Sitemap processing: 1-3 days');
console.log('   • Initial indexing: 1-2 weeks');
console.log('   • Full data: 2-4 weeks');

console.log('\n=================================================');

console.log('\n💡 TIP: Run ./gsc-quick-setup.sh for automated validation checks');
console.log('📖 See: google-search-console-setup.md for detailed instructions');