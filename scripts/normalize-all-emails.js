#!/usr/bin/env node
/**
 * 📧 DealRadarUS - Email Normalization Script
 * Normalize ALL emails to deals@dealradarus.com across entire repository
 */

const fs = require('fs');
const path = require('path');

console.log('📧 DEALRADARUS - Email Normalization to deals@dealradarus.com\n');
console.log('=======================================================');

// Configuration
const TARGET_EMAIL = 'deals@dealradarus.com';
const TARGET_DOMAIN = 'dealradarus.com';

// File extensions to process
const INCLUDE_EXTENSIONS = [
    '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', 
    '.css', '.scss', '.md', '.mdx', '.json', 
    '.yml', '.yaml', '.toml', '.xml', '.txt'
];

// Directories and files to ignore
const IGNORE_PATTERNS = [
    '.git/', 'node_modules/', 'dist/', 'build/', 'coverage/',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.zip', '.gz', '.tgz',
    '.mp4', '.mov'
];

// Email patterns to find and replace
const EMAIL_PATTERNS = [
    // Direct email patterns for dealradarus.com domain
    /support@dealradarus\.com/gi,
    /contact@dealradarus\.com/gi,
    /info@dealradarus\.com/gi,
    /admin@dealradarus\.com/gi,
    /hello@dealradarus\.com/gi,
    /sales@dealradarus\.com/gi,
    /help@dealradarus\.com/gi,
    /service@dealradarus\.com/gi,
    
    // Mailto patterns
    /mailto:support@dealradarus\.com/gi,
    /mailto:contact@dealradarus\.com/gi,
    /mailto:info@dealradarus\.com/gi,
    /mailto:admin@dealradarus\.com/gi,
    /mailto:hello@dealradarus\.com/gi,
    /mailto:sales@dealradarus\.com/gi,
    /mailto:help@dealradarus\.com/gi,
    /mailto:service@dealradarus\.com/gi,
];

// Configuration field patterns (for JSON/YAML/ENV files)
const CONFIG_EMAIL_FIELDS = [
    'email', 'contactEmail', 'supportEmail', 'adminEmail',
    'from', 'to', 'sender', 'recipient', 'replyTo',
    'CONTACT_EMAIL', 'SUPPORT_EMAIL', 'ADMIN_EMAIL'
];

// Find all files to process
function findFilesToProcess(dir = '.', files = []) {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative('.', fullPath);
            
            // Skip ignored patterns
            if (IGNORE_PATTERNS.some(pattern => 
                relativePath.includes(pattern) || entry.name.includes(pattern)
            )) {
                continue;
            }
            
            if (entry.isDirectory()) {
                findFilesToProcess(fullPath, files);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (INCLUDE_EXTENSIONS.includes(ext)) {
                    files.push(relativePath);
                }
            }
        }
    } catch (error) {
        console.log(`⚠️  Cannot read directory: ${dir}`);
    }
    
    return files;
}

// Analyze file for email occurrences
function analyzeFile(filePath, dryRun = true) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let replacements = 0;
        let newContent = content;
        const foundEmails = [];
        
        // Check for direct email patterns
        EMAIL_PATTERNS.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!foundEmails.includes(match)) {
                        foundEmails.push(match);
                    }
                });
                replacements += matches.length;
                if (!dryRun) {
                    if (match.startsWith('mailto:')) {
                        newContent = newContent.replace(pattern, `mailto:${TARGET_EMAIL}`);
                    } else {
                        newContent = newContent.replace(pattern, TARGET_EMAIL);
                    }
                }
            }
        });
        
        // For JSON/YAML files, check configuration fields
        if (['.json', '.yml', '.yaml'].includes(path.extname(filePath))) {
            CONFIG_EMAIL_FIELDS.forEach(field => {
                const fieldPatterns = [
                    new RegExp(`"${field}"\\s*:\\s*"[^@]+@${TARGET_DOMAIN.replace('.', '\\.')}"`, 'gi'),
                    new RegExp(`${field}\\s*:\\s*[^@]+@${TARGET_DOMAIN.replace('.', '\\.')}`, 'gi')
                ];
                
                fieldPatterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        matches.forEach(match => {
                            if (!foundEmails.includes(match)) {
                                foundEmails.push(match);
                            }
                        });
                        replacements += matches.length;
                        if (!dryRun) {
                            if (match.includes('"')) {
                                newContent = newContent.replace(pattern, 
                                    match.replace(/[^@]+@[^"]+/, TARGET_EMAIL));
                            } else {
                                newContent = newContent.replace(pattern, 
                                    match.replace(/[^@]+@\S+/, TARGET_EMAIL));
                            }
                        }
                    }
                });
            });
        }
        
        return {
            replacements,
            foundEmails,
            newContent: dryRun ? null : newContent
        };
        
    } catch (error) {
        console.log(`⚠️  Cannot read file: ${filePath}`);
        return { replacements: 0, foundEmails: [], newContent: null };
    }
}

// Dry run analysis
function performDryRun() {
    console.log('🔍 PHASE 1: DRY RUN ANALYSIS\n');
    
    const filesToProcess = findFilesToProcess();
    console.log(`📁 Found ${filesToProcess.length} files to analyze\n`);
    
    let totalReplacements = 0;
    const filesWithChanges = [];
    const allFoundEmails = new Set();
    
    filesToProcess.forEach(filePath => {
        const result = analyzeFile(filePath, true);
        if (result.replacements > 0) {
            filesWithChanges.push({
                file: filePath,
                replacements: result.replacements,
                emails: result.foundEmails
            });
            totalReplacements += result.replacements;
            result.foundEmails.forEach(email => allFoundEmails.add(email));
        }
    });
    
    console.log('📊 DRY RUN RESULTS:');
    console.log('==================\n');
    
    if (filesWithChanges.length === 0) {
        console.log('✅ No email addresses found that need normalization');
        return { filesWithChanges, totalReplacements };
    }
    
    console.log(`📧 Email patterns found:`);
    Array.from(allFoundEmails).forEach(email => {
        console.log(`   • ${email}`);
    });
    
    console.log(`\n📝 Files requiring changes: ${filesWithChanges.length}`);
    console.log(`🔄 Total replacements needed: ${totalReplacements}\n`);
    
    console.log('📋 Detailed breakdown:');
    filesWithChanges.forEach(({ file, replacements, emails }) => {
        console.log(`   ${file}: ${replacements} replacement(s)`);
        emails.forEach(email => console.log(`     → ${email}`));
    });
    
    return { filesWithChanges, totalReplacements };
}

// Apply changes
function applyChanges(filesWithChanges) {
    console.log('\n🔧 PHASE 2: APPLYING CHANGES\n');
    
    let processedFiles = 0;
    let totalReplacements = 0;
    
    filesWithChanges.forEach(({ file }) => {
        const result = analyzeFile(file, false);
        if (result.newContent && result.replacements > 0) {
            fs.writeFileSync(file, result.newContent);
            console.log(`✅ Updated ${file}: ${result.replacements} replacement(s)`);
            processedFiles++;
            totalReplacements += result.replacements;
        }
    });
    
    console.log(`\n💾 Successfully processed ${processedFiles} files`);
    console.log(`🔄 Total replacements applied: ${totalReplacements}`);
    
    return { processedFiles, totalReplacements };
}

// Post-change verification
function performVerification() {
    console.log('\n🔍 PHASE 3: POST-CHANGE VERIFICATION\n');
    
    const filesToCheck = findFilesToProcess();
    let remainingOldEmails = 0;
    let newEmailCount = 0;
    
    // Check for remaining old email patterns
    const oldEmailPatterns = [
        /support@dealradarus\.com/gi,
        /contact@dealradarus\.com/gi,
        /info@dealradarus\.com/gi,
        /admin@dealradarus\.com/gi,
        /hello@dealradarus\.com/gi
    ];
    
    filesToCheck.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for old emails
            oldEmailPatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    remainingOldEmails += matches.length;
                    console.log(`⚠️  Found remaining old email in ${filePath}: ${matches[0]}`);
                }
            });
            
            // Count new target emails
            const newEmailMatches = content.match(new RegExp(TARGET_EMAIL.replace('.', '\\.'), 'gi'));
            if (newEmailMatches) {
                newEmailCount += newEmailMatches.length;
            }
            
        } catch (error) {
            // Skip files we can't read
        }
    });
    
    console.log('📊 VERIFICATION RESULTS:');
    console.log('========================');
    console.log(`❌ Remaining old emails: ${remainingOldEmails}`);
    console.log(`✅ New target emails found: ${newEmailCount}`);
    
    return { remainingOldEmails, newEmailCount };
}

// Main execution
async function main() {
    // Phase 1: Dry run
    const { filesWithChanges, totalReplacements } = performDryRun();
    
    if (totalReplacements === 0) {
        console.log('\n🎉 No changes needed. All emails are already normalized!');
        return;
    }
    
    console.log('\n⏳ Proceeding with changes in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 2: Apply changes
    const { processedFiles, appliedReplacements } = applyChanges(filesWithChanges);
    
    // Phase 3: Verification
    const { remainingOldEmails, newEmailCount } = performVerification();
    
    // Summary
    console.log('\n=======================================================');
    console.log('📧 EMAIL NORMALIZATION - FINAL SUMMARY');
    console.log('=======================================================');
    
    console.log(`🎯 Target email: ${TARGET_EMAIL}`);
    console.log(`📁 Files processed: ${processedFiles}`);
    console.log(`🔄 Total replacements: ${appliedReplacements}`);
    console.log(`✅ Target emails in codebase: ${newEmailCount}`);
    console.log(`❌ Remaining old emails: ${remainingOldEmails}`);
    
    console.log('\n📋 CHECKLIST:');
    console.log(`   ${remainingOldEmails === 0 ? '✅' : '❌'} No old email patterns remaining`);
    console.log(`   ${newEmailCount > 0 ? '✅' : '❌'} Target email found in codebase`);
    console.log(`   ${processedFiles > 0 ? '✅' : '❌'} Files successfully processed`);
    
    if (remainingOldEmails === 0 && newEmailCount > 0) {
        console.log('\n🎉 EMAIL NORMALIZATION COMPLETED SUCCESSFULLY!');
    } else {
        console.log('\n⚠️  Please review the results above for any issues.');
    }
    
    console.log('\n🚀 READY FOR GIT COMMIT:');
    console.log('   git add -A');
    console.log('   git commit -m "chore(email): normalize all project emails to deals@dealradarus.com"');
    
    console.log('\n=======================================================');
}

// Execute
main().catch(console.error);