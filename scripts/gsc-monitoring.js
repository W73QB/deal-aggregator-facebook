#!/usr/bin/env node

const fs = require('fs').promises;
const https = require('https');
const { URL } = require('url');

class GSCMonitoring {
  constructor(domain = 'dealradarus.com') {
    this.domain = domain;
    this.baseUrl = `https://${domain}`;
    this.results = {
      timestamp: new Date().toISOString(),
      domain: domain,
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      recommendations: []
    };
  }

  async checkURL(url, description) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'DealRadarUS-GSC-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        const result = {
          url,
          description,
          status: res.statusCode,
          headers: {
            contentType: res.headers['content-type'],
            lastModified: res.headers['last-modified'],
            server: res.headers['server']
          },
          success: res.statusCode >= 200 && res.statusCode < 400
        };
        resolve(result);
      });

      req.on('error', (error) => {
        resolve({
          url,
          description,
          status: 0,
          error: error.message,
          success: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          description,
          status: 0,
          error: 'Request timeout',
          success: false
        });
      });

      req.end();
    });
  }

  async validateSitemapContent() {
    try {
      const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
      const result = await this.fetchContent(sitemapUrl);
      
      if (!result.success) {
        return {
          url: sitemapUrl,
          description: 'Sitemap content validation',
          success: false,
          error: result.error
        };
      }

      const content = result.content;
      const urlCount = (content.match(/<url>/g) || []).length;
      const hasValidStructure = content.includes('<urlset') && content.includes('</urlset>');
      const hasRequiredUrls = content.includes('dealradarus.com/') && 
                             content.includes('dealradarus.com/deals/');

      return {
        url: sitemapUrl,
        description: 'Sitemap content validation',
        success: hasValidStructure && hasRequiredUrls,
        details: {
          urlCount,
          hasValidStructure,
          hasRequiredUrls,
          contentLength: content.length
        }
      };
    } catch (error) {
      return {
        url: `${this.baseUrl}/sitemap.xml`,
        description: 'Sitemap content validation',
        success: false,
        error: error.message
      };
    }
  }

  async fetchContent(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'GET',
        timeout: 10000
      };

      let data = '';
      const req = https.request(options, (res) => {
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 400,
            content: data,
            statusCode: res.statusCode
          });
        });
      });

      req.on('error', error => {
        resolve({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });

      req.end();
    });
  }

  async runAllChecks() {
    console.log('🔍 Starting GSC Pre-submission Checks...\n');

    // Core URL checks
    const urlChecks = [
      [`${this.baseUrl}/`, 'Homepage accessibility'],
      [`${this.baseUrl}/sitemap.xml`, 'Sitemap accessibility'],
      [`${this.baseUrl}/robots.txt`, 'Robots.txt accessibility'],
      [`${this.baseUrl}/deals/`, 'Deals page accessibility'],
      [`${this.baseUrl}/blog/`, 'Blog page accessibility'],
      [`${this.baseUrl}/contact/`, 'Contact page accessibility']
    ];

    // Run URL checks
    for (const [url, description] of urlChecks) {
      const result = await this.checkURL(url, description);
      this.results.checks.push(result);
      this.results.summary.total++;
      
      if (result.success) {
        console.log(`✅ ${description}: HTTP ${result.status}`);
        this.results.summary.passed++;
      } else {
        console.log(`❌ ${description}: ${result.error || 'HTTP ' + result.status}`);
        this.results.summary.failed++;
      }
    }

    // Sitemap content validation
    console.log('\n📋 Validating sitemap content...');
    const sitemapCheck = await this.validateSitemapContent();
    this.results.checks.push(sitemapCheck);
    this.results.summary.total++;

    if (sitemapCheck.success) {
      console.log(`✅ Sitemap validation: ${sitemapCheck.details.urlCount} URLs found`);
      this.results.summary.passed++;
    } else {
      console.log(`❌ Sitemap validation: ${sitemapCheck.error}`);
      this.results.summary.failed++;
    }

    // Generate recommendations
    this.generateRecommendations();

    return this.results;
  }

  generateRecommendations() {
    const failedChecks = this.results.checks.filter(check => !check.success);
    
    if (failedChecks.length === 0) {
      this.results.recommendations.push({
        type: 'success',
        message: 'All pre-submission checks passed! Ready for GSC setup.'
      });
    }

    failedChecks.forEach(check => {
      if (check.url.includes('/sitemap.xml')) {
        this.results.recommendations.push({
          type: 'critical',
          message: 'Fix sitemap issues before GSC submission',
          action: 'Check sitemap.xml syntax and accessibility'
        });
      }
      
      if (check.url.endsWith('/')) {
        this.results.recommendations.push({
          type: 'warning',
          message: `Homepage not accessible: ${check.error}`,
          action: 'Verify domain DNS and hosting configuration'
        });
      }
    });

    // GSC-specific recommendations
    this.results.recommendations.push({
      type: 'info',
      message: 'Complete GSC setup checklist',
      action: 'Follow manual steps in GSC-SUBMISSION-REPORT.md'
    });

    this.results.recommendations.push({
      type: 'info',
      message: 'Monitor indexing progress',
      action: 'Check GSC daily for first 2 weeks after submission'
    });
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gsc-monitoring-${timestamp}.json`;
    const filepath = `./data/${filename}`;

    try {
      await fs.mkdir('./data', { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      return filepath;
    } catch (error) {
      console.error('Failed to save results:', error.message);
      return null;
    }
  }

  displaySummary() {
    console.log('\n📊 GSC Monitoring Summary');
    console.log('========================');
    console.log(`Total Checks: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : 
                    rec.type === 'warning' ? '⚠️' : 
                    rec.type === 'success' ? '✅' : '💡';
        console.log(`${icon} ${rec.message}`);
        if (rec.action) {
          console.log(`   → ${rec.action}`);
        }
      });
    }
  }

  async run() {
    try {
      await this.runAllChecks();
      this.displaySummary();
      
      const savedPath = await this.saveResults();
      if (savedPath) {
        console.log(`\n📄 Results saved: ${savedPath}`);
      }

      // Return success status
      return this.results.summary.failed === 0;
    } catch (error) {
      console.error('GSC monitoring failed:', error.message);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const domain = process.argv[2] || 'dealradarus.com';
  const monitor = new GSCMonitoring(domain);
  
  monitor.run().then(success => {
    if (success) {
      console.log('\n🎉 All GSC pre-submission checks passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some checks failed. Review and fix before GSC submission.');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GSCMonitoring;