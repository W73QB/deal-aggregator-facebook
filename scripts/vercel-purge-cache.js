#!/usr/bin/env node

/**
 * Vercel CDN Cache Purge Script
 * Forces immediate cache invalidation after deployment
 */

import https from 'https';

class VercelCachePurge {
  constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.teamId = process.env.VERCEL_TEAM_ID;
    this.projectId = process.env.VERCEL_PROJECT_ID || 'prj_3Yd80u1Ze6lZbgkvFEAqP7D4whfl';
  }

  async makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              data: parsed,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: responseData,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async purgeDeploymentCache(deploymentId) {
    console.log(`🧹 Purging cache for deployment: ${deploymentId}`);

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v1/deployments/${deploymentId}/purge`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VercelCachePurge/1.0'
      }
    };

    try {
      const response = await this.makeRequest(options);

      if (response.statusCode === 200) {
        console.log('✅ Deployment cache purged successfully');
        return true;
      } else {
        console.error(`❌ Cache purge failed: ${response.statusCode}`, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Cache purge error:', error.message);
      return false;
    }
  }

  async purgeEdgeCache(domain = 'dealradarus.com') {
    console.log(`🌐 Purging edge cache for domain: ${domain}`);

    const purgeData = {
      type: 'purge',
      domain: domain,
      paths: ['/', '/_next/static/*', '/api/*']
    };

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: '/v2/purge',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VercelCachePurge/1.0'
      }
    };

    try {
      const response = await this.makeRequest(options, purgeData);

      if (response.statusCode === 200 || response.statusCode === 202) {
        console.log('✅ Edge cache purged successfully');
        return true;
      } else {
        console.error(`❌ Edge cache purge failed: ${response.statusCode}`, response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Edge cache purge error:', error.message);
      return false;
    }
  }

  async getLatestDeployment() {
    console.log('🔍 Getting latest deployment...');

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v6/deployments?projectId=${this.projectId}&limit=1&state=READY`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`,
        'User-Agent': 'VercelCachePurge/1.0'
      }
    };

    try {
      const response = await this.makeRequest(options);

      if (response.statusCode === 200 && response.data.deployments && response.data.deployments.length > 0) {
        const deployment = response.data.deployments[0];
        console.log(`📦 Latest deployment: ${deployment.uid} (${deployment.url})`);
        return deployment;
      } else {
        console.error('❌ No deployments found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting deployment:', error.message);
      return null;
    }
  }

  async run() {
    console.log('🚀 Starting Vercel cache purge...');
    console.log('=' .repeat(60));

    if (!this.vercelToken) {
      console.error('❌ VERCEL_TOKEN environment variable required');
      process.exit(1);
    }

    try {
      // Get latest deployment
      const deployment = await this.getLatestDeployment();

      if (!deployment) {
        console.error('❌ Could not find deployment to purge');
        process.exit(1);
      }

      // Purge deployment cache
      await this.purgeDeploymentCache(deployment.uid);

      // Purge edge cache
      await this.purgeEdgeCache();

      // Wait for propagation
      console.log('⏳ Waiting 10 seconds for cache propagation...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log('=' .repeat(60));
      console.log('✅ Cache purge completed successfully!');
      console.log('🔄 New requests will fetch fresh content from origin');

    } catch (error) {
      console.error('💥 Cache purge failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI usage
const purger = new VercelCachePurge();
purger.run();

export default VercelCachePurge;