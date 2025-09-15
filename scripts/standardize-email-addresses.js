#!/usr/bin/env node
/**
 * ✉️ DealRadarUS - Standardize Email Addresses  
 * Replace inconsistent email addresses with standardized contact email
 */

const fs = require('fs');
const path = require('path');

console.log('✉️ DEALRADARUS - Email Address Standardization\n');
console.log('===============================================');

// Standard email configuration for DealRadarUS
const emailConfig = {
    // Primary email for all customer-facing communication
    primary: 'deals@dealradarus.com',
    
    // Email mappings for different purposes
    purposes: {
        support: 'deals@dealradarus.com',      // General support & questions
        contact: 'deals@dealradarus.com',      // Contact form submissions  
        legal: 'legal@dealradarus.com',          // Privacy/Terms/Legal issues
        business: 'partnerships@dealradarus.com', // Business partnerships
        affiliate: 'affiliates@dealradarus.com'  // Affiliate program inquiries
    }
};

// Emails to find and replace
const emailReplacements = [
    { 
        from: 'deals@dealradarus.com', 
        to: emailConfig.primary,
        context: 'General contact'
    },
    {
        from: 'deals@dealradarus.com',
        to: emailConfig.primary,
        context: 'Information requests'
    },
    {
        from: 'deals@dealradarus.com', 
        to: emailConfig.primary,
        context: 'Administrative contact'
    },
    {
        from: 'deals@dealradarus.com',
        to: emailConfig.primary,
        context: 'General greeting'
    }
];

const htmlFiles = [
    'index.html',
    'home.html',
    'blog.html', 
    'deals.html',
    'pages/index.html',
    'pages/blog.html',
    'pages/deals.html',
    'pages/contact.html',
    'pages/affiliate-disclosure.html',
    'pages/privacy-policy.html',
    'pages/terms-of-service.html'
];

const results = {
    filesProcessed: 0,
    emailsReplaced: 0,
    replacementsByType: {},
    filesChanged: []
};

function standardizeEmailsInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${filePath} (not found)`);
        return;
    }

    console.log(`\n🔧 Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    const originalContent = content;

    // Apply email replacements
    emailReplacements.forEach(replacement => {
        // Replace in href="mailto:" links
        const mailtoPattern = new RegExp(`mailto:${replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        const mailtoMatches = content.match(mailtoPattern) || [];
        
        if (mailtoMatches.length > 0) {
            content = content.replace(mailtoPattern, `mailto:${replacement.to}`);
            changes += mailtoMatches.length;
            console.log(`   ✅ Updated ${mailtoMatches.length} mailto: ${replacement.from} → ${replacement.to}`);
        }

        // Replace in plain text
        const textPattern = new RegExp(`\\b${replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const textMatches = content.match(textPattern) || [];
        
        if (textMatches.length > 0) {
            content = content.replace(textPattern, replacement.to);
            changes += textMatches.length;
            console.log(`   ✅ Updated ${textMatches.length} text: ${replacement.from} → ${replacement.to}`);
        }

        // Track replacement statistics
        const totalMatches = mailtoMatches.length + textMatches.length;
        if (totalMatches > 0) {
            results.replacementsByType[replacement.from] = (results.replacementsByType[replacement.from] || 0) + totalMatches;
        }
    });

    if (changes > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`   💾 Saved ${filePath} with ${changes} email updates`);
        results.emailsReplaced += changes;
        results.filesChanged.push(filePath);
    } else {
        console.log(`   ℹ️  No email standardization needed`);
    }

    results.filesProcessed++;
}

// Process all HTML files
htmlFiles.forEach(standardizeEmailsInFile);

// Generate summary report
console.log('\n===============================================');
console.log('📧 EMAIL STANDARDIZATION - SUMMARY REPORT');
console.log('===============================================\n');

console.log(`📄 Files processed: ${results.filesProcessed}`);
console.log(`✉️ Total emails replaced: ${results.emailsReplaced}`);
console.log(`📁 Files modified: ${results.filesChanged.length}\n`);

if (Object.keys(results.replacementsByType).length > 0) {
    console.log('🔄 REPLACEMENTS BY EMAIL:');
    Object.entries(results.replacementsByType).forEach(([oldEmail, count]) => {
        console.log(`   • ${oldEmail} → ${emailConfig.primary} (${count} instances)`);
    });
    console.log();
}

console.log('📧 STANDARDIZED EMAIL CONFIGURATION:');
console.log(`   📮 Primary Email: ${emailConfig.primary}`);
console.log('   🎯 Purpose-specific emails:');
Object.entries(emailConfig.purposes).forEach(([purpose, email]) => {
    console.log(`      • ${purpose}: ${email}`);
});

// Verify email consistency across all files
console.log('\n🔍 VERIFICATION - Checking for remaining inconsistencies...');
let allConsistent = true;
const emailPattern = /[a-zA-Z0-9._%+-]+@dealradarus\.com/g;

htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const emails = content.match(emailPattern) || [];
        
        emails.forEach(email => {
            if (!Object.values(emailConfig.purposes).includes(email)) {
                console.log(`   ⚠️  Non-standard email found in ${filePath}: ${email}`);
                allConsistent = false;
            }
        });
    }
});

if (allConsistent) {
    console.log('   ✅ All emails are now standardized!');
} else {
    console.log('   ❌ Some non-standard emails still exist');
}

// Save results for reporting
const reportData = {
    timestamp: new Date().toISOString(),
    filesProcessed: results.filesProcessed,
    totalReplacements: results.emailsReplaced,
    replacementBreakdown: results.replacementsByType,
    filesModified: results.filesChanged,
    standardizedConfig: emailConfig,
    allEmailsConsistent: allConsistent
};

fs.writeFileSync('email-standardization-report.json', JSON.stringify(reportData, null, 2));

console.log('\n💾 Report saved to: email-standardization-report.json');

if (results.emailsReplaced > 0) {
    console.log('\n🎉 SUCCESS: Email addresses have been standardized!');
    console.log('📧 All customer communication now routes to: deals@dealradarus.com');
    console.log('🎯 Brand consistency improved across all pages');
} else {
    console.log('\nℹ️  All email addresses were already standardized');
}

console.log('\n===============================================');