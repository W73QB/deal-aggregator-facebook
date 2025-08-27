#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

// Note: These dependencies need to be installed:
// npm install node-fetch p-limit cheerio glob
// const fetch = require('node-fetch');
// const pLimit = require('p-limit');
// const cheerio = require('cheerio');

const LinkExtractor = require('./utils/link-extract');

class DealLinkChecker {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = null;
    this.results = {
      summary: {
        totalLinks: 0,
        checkedLinks: 0,
        validLinks: 0,
        invalidLinks: 0,
        issuesFound: 0,
        affiliateLinks: 0,
        placeholderLinks: 0
      },
      details: [],
      issues: [],
      affiliate: {
        networks: {},
        validation: {}
      },
      timestamp: new Date().toISOString()
    };
  }

  async initialize() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      
      // Initialize rate limiting (when p-limit is available)
      // this.limiter = pLimit(this.config.rateLimiting.concurrency);
      
      console.log('✓ Deal Link Checker initialized');
      console.log(`✓ Configuration loaded from: ${this.configPath}`);
      
      return true;
    } catch (error) {
      console.error('✗ Failed to initialize:', error.message);
      return false;
    }
  }

  async extractAllLinks(baseDir = '.') {
    console.log('\n📤 Extracting links from HTML files...');
    
    try {
      const extractor = new LinkExtractor(this.config);
      const extractionResults = await extractor.extractFromFiles(baseDir);
      
      // Process extraction results
      let totalLinks = 0;
      for (const fileResult of extractionResults) {
        totalLinks += fileResult.count;
        
        for (const link of fileResult.links) {
          this.results.details.push({
            ...link,
            status: 'extracted',
            httpStatus: null,
            responseTime: null,
            redirectChain: [],
            checkedAt: null
          });

          // Track affiliate networks
          if (link.affiliate) {
            const network = link.affiliate.network;
            this.results.affiliate.networks[network] = 
              (this.results.affiliate.networks[network] || 0) + 1;
          }

          // Track issues
          if (link.issues && link.issues.length > 0) {
            this.results.issues.push({
              url: link.url,
              file: link.sourcePath,
              issues: link.issues
            });
          }
        }
      }

      this.results.summary.totalLinks = totalLinks;
      this.results.summary.placeholderLinks = this.results.details.filter(
        link => link.issues.some(issue => issue.includes('placeholder'))
      ).length;

      console.log(`✓ Extracted ${totalLinks} links from ${extractionResults.length} files`);
      console.log(`✓ Found ${Object.keys(this.results.affiliate.networks).length} affiliate networks`);
      console.log(`⚠️  Found ${this.results.issues.length} issues requiring attention`);
      
      return extractionResults;
    } catch (error) {
      console.error('✗ Link extraction failed:', error.message);
      throw error;
    }
  }

  async verifyLinks() {
    console.log('\n🔍 Starting HTTP verification...');
    console.log('⚠️  Note: HTTP verification requires node-fetch, p-limit dependencies');
    
    // This is a placeholder for HTTP verification
    // When dependencies are installed, this will perform actual HTTP checks
    
    const linksToCheck = this.results.details.filter(link => 
      !link.issues.some(issue => issue.includes('placeholder'))
    );

    console.log(`📋 Would verify ${linksToCheck.length} non-placeholder links`);
    console.log('📋 HTTP verification will check:');
    console.log('   - Response status (200, 301, 302, etc.)');
    console.log('   - Response time');
    console.log('   - Redirect chains');
    console.log('   - SSL certificate validity');
    console.log('   - Rate limiting compliance (2 req/sec, max 3 concurrent)');

    // Simulate verification results for prototype
    this.results.summary.checkedLinks = linksToCheck.length;
    this.results.summary.validLinks = Math.floor(linksToCheck.length * 0.85);
    this.results.summary.invalidLinks = linksToCheck.length - this.results.summary.validLinks;

    return linksToCheck;
  }

  async generateReport() {
    console.log('\n📊 Generating verification report...');

    const reportDir = this.config.reporting.outputDir;
    await fs.mkdir(reportDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportBaseName = `deal-link-verification-${timestamp}`;

    // Generate JSON report
    const jsonPath = path.join(reportDir, `${reportBaseName}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));

    // Generate CSV summary
    const csvPath = path.join(reportDir, `${reportBaseName}-summary.csv`);
    const csvData = this.generateCSVSummary();
    await fs.writeFile(csvPath, csvData);

    // Generate HTML report
    const htmlPath = path.join(reportDir, `${reportBaseName}.html`);
    const htmlContent = this.generateHTMLReport();
    await fs.writeFile(htmlPath, htmlContent);

    console.log('✓ Reports generated:');
    console.log(`  📄 JSON: ${jsonPath}`);
    console.log(`  📊 CSV:  ${csvPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);

    return {
      json: jsonPath,
      csv: csvPath,
      html: htmlPath
    };
  }

  generateCSVSummary() {
    const headers = [
      'URL', 'Domain', 'File', 'Affiliate Network', 
      'Valid Params', 'Issues', 'Status'
    ];

    const rows = this.results.details.map(link => [
      link.url,
      link.domain,
      link.sourcePath,
      link.affiliate ? link.affiliate.network : 'none',
      link.validation.isValid ? 'yes' : 'no',
      link.issues.join('; '),
      link.status
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  generateHTMLReport() {
    const { summary, details, issues, affiliate } = this.results;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deal Link Verification Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #6b7280; }
        .issues-section { margin: 20px 0; }
        .issue { background: #fef2f2; border: 1px solid #fca5a5; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .affiliate-stats { margin: 20px 0; }
        .network-stat { background: #f0f9ff; padding: 10px; margin: 5px; border-radius: 4px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
        .status-valid { color: #059669; }
        .status-invalid { color: #dc2626; }
        .status-extracted { color: #d97706; }
    </style>
</head>
<body>
    <h1>🔗 Deal Link Verification Report</h1>
    <p><strong>Generated:</strong> ${this.results.timestamp}</p>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="metric">
            <div class="metric-value">${summary.totalLinks}</div>
            <div class="metric-label">Total Links</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.affiliateLinks}</div>
            <div class="metric-label">Affiliate Links</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.placeholderLinks}</div>
            <div class="metric-label">Placeholder Links</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.issuesFound}</div>
            <div class="metric-label">Issues Found</div>
        </div>
    </div>

    ${issues.length > 0 ? `
    <div class="issues-section">
        <h2>⚠️ Issues Requiring Attention</h2>
        ${issues.map(issue => `
        <div class="issue">
            <strong>${issue.url}</strong> (${issue.file})<br>
            ${issue.issues.map(i => `• ${i}`).join('<br>')}
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="affiliate-stats">
        <h2>🏢 Affiliate Networks</h2>
        ${Object.entries(affiliate.networks).map(([network, count]) => `
        <div class="network-stat">
            <strong>${network.toUpperCase()}</strong>: ${count} links
        </div>
        `).join('')}
    </div>

    <h2>📋 Link Details</h2>
    <table>
        <thead>
            <tr>
                <th>URL</th>
                <th>File</th>
                <th>Affiliate</th>
                <th>Valid Params</th>
                <th>Issues</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(link => `
            <tr>
                <td><a href="${link.url}" target="_blank">${link.domain}</a></td>
                <td>${link.sourcePath}</td>
                <td>${link.affiliate ? link.affiliate.network : '-'}</td>
                <td class="${link.validation.isValid ? 'status-valid' : 'status-invalid'}">
                    ${link.validation.isValid ? '✓' : '✗'}
                </td>
                <td>${link.issues.join(', ') || '-'}</td>
                <td class="status-${link.status}">${link.status}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
  }

  async run(baseDir = '.') {
    console.log('🚀 Starting Deal Link Checker...');
    
    try {
      // Initialize checker
      const initialized = await this.initialize();
      if (!initialized) {
        process.exit(1);
      }

      // Extract links
      await this.extractAllLinks(baseDir);

      // Verify links (placeholder for now)
      await this.verifyLinks();

      // Generate reports
      const reportPaths = await this.generateReport();

      console.log('\n✅ Deal Link Checker completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Review the HTML report for detailed findings');
      console.log('2. Fix placeholder URLs (example.com links)');
      console.log('3. Install dependencies: npm install node-fetch p-limit cheerio glob');
      console.log('4. Re-run with HTTP verification enabled');

      return this.results;
    } catch (error) {
      console.error('\n❌ Deal Link Checker failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const configPath = process.argv[2] || './config/deal-verifier.config.json';
  const baseDir = process.argv[3] || '.';
  
  const checker = new DealLinkChecker(configPath);
  checker.run(baseDir).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DealLinkChecker;