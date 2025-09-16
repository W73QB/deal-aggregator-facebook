#!/usr/bin/env node

/**
 * Post-Deploy Verification Script
 * Ensures new deployments serve fresh content with modern UI elements
 */

import https from 'https';

class PostDeployVerification {
  constructor(url) {
    this.baseUrl = url;
    this.results = {
      cacheBusting: false,
      modernElements: false,
      animatedLogo: false,
      heroGradient: false,
      styledDeals: false,
      cssIntegrity: false
    };
  }

  async makeRequest(path = '/') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl.replace(/https?:\/\//, ''),
        port: 443,
        path,
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'User-Agent': 'PostDeployVerification/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            data,
            headers: res.headers,
            statusCode: res.statusCode
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  }

  async verifyHomepage() {
    console.log('🔍 Verifying homepage content...');

    try {
      const response = await this.makeRequest('/');
      const html = response.data;
      const headers = response.headers;

      // Check cache headers
      const cacheControl = headers['cache-control'];
      this.results.cacheBusting = cacheControl && cacheControl.includes('no-cache');
      console.log(`  📦 Cache busting: ${this.results.cacheBusting ? '✅' : '❌'} (${cacheControl})`);

      // Check for animated logo
      this.results.animatedLogo = html.includes('logo-animated') && html.includes('animateTransform');
      console.log(`  🎨 Animated logo: ${this.results.animatedLogo ? '✅' : '❌'}`);

      // Check for hero gradient
      this.results.heroGradient = html.includes('hero-content') && html.includes('linear-gradient');
      console.log(`  🌅 Hero gradient: ${this.results.heroGradient ? '✅' : '❌'}`);

      // Check for styled deal cards
      this.results.styledDeals = html.includes('deal-card') && html.includes('deals-grid');
      console.log(`  🃏 Styled deals: ${this.results.styledDeals ? '✅' : '❌'}`);

      // Check modern elements
      this.results.modernElements = html.includes('app-layout') && html.includes('main-header');
      console.log(`  🏗️  Modern elements: ${this.results.modernElements ? '✅' : '❌'}`);

      return response;

    } catch (error) {
      console.error('❌ Homepage verification failed:', error.message);
      throw error;
    }
  }

  async verifyCSSIntegrity() {
    console.log('🎨 Verifying CSS integrity...');

    try {
      const response = await this.makeRequest('/');
      const html = response.data;

      // Extract CSS file path
      const cssMatch = html.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
      if (!cssMatch) {
        throw new Error('CSS file path not found in HTML');
      }

      const cssPath = cssMatch[1];
      console.log(`  📄 Found CSS file: ${cssPath}`);

      const cssResponse = await this.makeRequest(cssPath);
      const css = cssResponse.data;

      // Check for key CSS classes
      const hasHeroCSS = css.includes('.hero{background:linear-gradient');
      const hasDealCards = css.includes('.deal-card');
      const hasAppLayout = css.includes('.app-layout');

      this.results.cssIntegrity = hasHeroCSS && hasDealCards && hasAppLayout;

      console.log(`  🎨 Hero gradient CSS: ${hasHeroCSS ? '✅' : '❌'}`);
      console.log(`  🃏 Deal cards CSS: ${hasDealCards ? '✅' : '❌'}`);
      console.log(`  🏗️  App layout CSS: ${hasAppLayout ? '✅' : '❌'}`);
      console.log(`  ✅ CSS integrity: ${this.results.cssIntegrity ? '✅' : '❌'}`);

    } catch (error) {
      console.error('❌ CSS verification failed:', error.message);
      this.results.cssIntegrity = false;
    }
  }

  async run() {
    console.log(`🚀 Starting post-deploy verification for: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    try {
      await this.verifyHomepage();
      await this.verifyCSSIntegrity();

      const allPassed = Object.values(this.results).every(result => result === true);

      console.log('=' .repeat(60));
      console.log('📊 VERIFICATION SUMMARY:');

      Object.entries(this.results).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`  ${value ? '✅' : '❌'} ${label}`);
      });

      console.log('=' .repeat(60));

      if (allPassed) {
        console.log('🎉 ALL VERIFICATIONS PASSED - Deployment successful!');
        process.exit(0);
      } else {
        console.log('❌ SOME VERIFICATIONS FAILED - Check deployment!');
        process.exit(1);
      }

    } catch (error) {
      console.error('💥 Verification failed with error:', error.message);
      process.exit(1);
    }
  }
}

// CLI usage
const url = process.argv[2];
if (!url) {
  console.error('Usage: node post-deploy-verification.js <URL>');
  process.exit(1);
}

const verifier = new PostDeployVerification(url);
verifier.run();

export default PostDeployVerification;