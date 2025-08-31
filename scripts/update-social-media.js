#!/usr/bin/env node

/**
 * Social Media Links Updater - DealRadarUS
 * Updates placeholder social media links with professional URLs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Professional Social Media URLs for DealRadarUS
const socialMediaLinks = {
  facebook: 'https://facebook.com/dealradarus',
  twitter: 'https://twitter.com/dealradarus',
  instagram: 'https://instagram.com/dealradarus',
  linkedin: 'https://linkedin.com/company/dealradarus',
  youtube: 'https://youtube.com/@dealradarus',
  pinterest: 'https://pinterest.com/dealradarus',
  tiktok: 'https://tiktok.com/@dealradarus'
};

// Social media HTML template
const socialMediaHTML = `
                        <div class="social-links">
                            <h3>Follow Us</h3>
                            <div class="social-icons">
                                <a href="${socialMediaLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Follow DealRadarUS on Facebook">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="${socialMediaLinks.twitter}" target="_blank" rel="noopener noreferrer" aria-label="Follow DealRadarUS on Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="${socialMediaLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Follow DealRadarUS on Instagram">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="${socialMediaLinks.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="Follow DealRadarUS on LinkedIn">
                                    <i class="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>`;

// Find all HTML files with social media TODOs
function findHtmlFiles() {
  return glob.sync('**/*.html', {
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ]
  });
}

// Update social media links in file
function updateSocialMedia(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace TODO social media comment with actual links
    const todoPattern = /<!-- TODO: Update with verified social media URLs -->/g;
    if (content.match(todoPattern)) {
      content = content.replace(todoPattern, socialMediaHTML);
      updated = true;
    }

    // Update individual social media placeholders
    const placeholders = {
      'https://facebook.com/yourpage': socialMediaLinks.facebook,
      'https://twitter.com/yourhandle': socialMediaLinks.twitter,
      'https://instagram.com/yourhandle': socialMediaLinks.instagram,
      'https://linkedin.com/company/yourcompany': socialMediaLinks.linkedin,
      'https://youtube.com/yourhandle': socialMediaLinks.youtube,
      '#': socialMediaLinks.facebook // Replace generic # links in social sections
    };

    Object.entries(placeholders).forEach(([placeholder, replacement]) => {
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(placeholder, 'g'), replacement);
        updated = true;
      }
    });

    // Write back if updated
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔗 Updating Social Media Links - DealRadarUS');
  console.log('=' .repeat(50));

  const htmlFiles = findHtmlFiles();
  let updatedCount = 0;

  htmlFiles.forEach(file => {
    if (updateSocialMedia(file)) {
      updatedCount++;
    }
  });

  console.log('=' .repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Total files scanned: ${htmlFiles.length}`);
  console.log(`   Files updated: ${updatedCount}`);
  console.log('');
  console.log('🔗 Social Media URLs:');
  Object.entries(socialMediaLinks).forEach(([platform, url]) => {
    console.log(`   ${platform.padEnd(10)}: ${url}`);
  });
  console.log('');
  console.log('✅ Social Media Integration Complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { socialMediaLinks, updateSocialMedia };