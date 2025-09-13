#!/usr/bin/env node

/**
 * M3.8 Phase 4: Robust E2E Test Launcher
 * Ensures proper server startup coordination before running tests
 */

const http = require('http');
const { spawn, exec } = require('child_process');
const path = require('path');

class E2ELauncher {
  constructor() {
    this.servers = [];
    this.maxRetries = 60; // Increased from 30
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Main entry point for E2E test execution
   */
  async run(options = {}) {
    const {
      backend = true,
      frontend = true,
      cypress = true,
      verbose = false
    } = options;

    console.log('🚀 M3.8 E2E Test Launcher Starting...');
    console.log('=====================================\n');

    try {
      if (backend) {
        await this.startBackendServer();
      }

      if (frontend) {
        await this.startFrontendServer();  
      }

      // Wait for all servers to be fully ready
      await this.waitForAllServers();

      if (cypress) {
        await this.runCypressTests();
      }

      console.log('\n✅ E2E tests completed successfully!');
      return true;

    } catch (error) {
      console.error('\n❌ E2E tests failed:', error.message);
      return false;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Start backend server with enhanced monitoring
   */
  async startBackendServer() {
    console.log('🔧 Starting backend server...');

    // First check if backend is already running
    try {
      await this.healthCheck('http://localhost:3001/health');
      console.log('  ✅ Backend server already running and healthy');
      return;
    } catch (error) {
      console.log('  📡 Backend not running, starting new instance...');
    }

    const backendProcess = spawn('npm', ['run', 'dev:backend'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    this.servers.push({
      name: 'backend',
      process: backendProcess,
      port: 3001,
      url: 'http://localhost:3001',
      healthEndpoint: '/health'
    });

    // Monitor backend startup
    let startupComplete = false;
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('server running on port 3001')) {
        startupComplete = true;
      }
      if (process.env.E2E_VERBOSE) {
        console.log('[BACKEND]', output.trim());
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (process.env.E2E_VERBOSE) {
        console.log('[BACKEND ERROR]', output.trim());
      }
      if (output.includes('Error') && !output.includes('deprecated')) {
        throw new Error(`Backend startup error: ${output.trim()}`);
      }
    });

    // Wait for initial startup signal
    let retries = 0;
    while (!startupComplete && retries < this.maxRetries) {
      await this.delay(500);
      retries++;
    }

    if (!startupComplete) {
      throw new Error('Backend server failed to start within timeout');
    }

    console.log('  ✅ Backend server started');
  }

  /**
   * Start frontend development server
   */
  async startFrontendServer() {
    console.log('🔧 Starting frontend server...');

    const frontendProcess = spawn('npm', ['run', 'dev:frontend'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.servers.push({
      name: 'frontend',
      process: frontendProcess,
      port: 3000,
      url: 'http://localhost:3000',
      healthEndpoint: '/'
    });

    // Monitor frontend startup
    let webpackReady = false;
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        webpackReady = true;
      }
      if (process.env.E2E_VERBOSE) {
        console.log('[FRONTEND]', output.trim());
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (process.env.E2E_VERBOSE) {
        console.log('[FRONTEND WARN]', output.trim());
      }
    });

    // Wait for webpack compilation
    let retries = 0;
    while (!webpackReady && retries < this.maxRetries) {
      await this.delay(1000);
      retries++;
    }

    console.log('  ✅ Frontend server started');
  }

  /**
   * Wait for all servers to respond to health checks
   */
  async waitForAllServers() {
    console.log('🔍 Performing health checks...');

    for (const server of this.servers) {
      await this.waitForServer(server);
    }

    console.log('✅ All servers are healthy and ready');
  }

  /**
   * Wait for specific server to be ready
   */
  async waitForServer(server) {
    console.log(`  🔍 Checking ${server.name} server...`);

    let retries = 0;
    let isReady = false;

    while (!isReady && retries < this.maxRetries) {
      try {
        await this.healthCheck(server.url + server.healthEndpoint);
        isReady = true;
        console.log(`    ✅ ${server.name} server is ready`);
      } catch (error) {
        retries++;
        if (retries < this.maxRetries) {
          console.log(`    ⏳ ${server.name} not ready, retrying... (${retries}/${this.maxRetries})`);
          await this.delay(this.retryDelay);
        } else {
          throw new Error(`${server.name} server failed health check after ${this.maxRetries} attempts`);
        }
      }
    }
  }

  /**
   * Perform HTTP health check
   */
  healthCheck(url) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          reject(new Error(`Health check failed with status ${res.statusCode}`));
        }
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error('Health check timeout'));
      });
    });
  }

  /**
   * Run Cypress tests with retry logic
   */
  async runCypressTests() {
    console.log('🧪 Running Cypress E2E tests...');

    return new Promise((resolve, reject) => {
      const cypressProcess = spawn('npx', ['cypress', 'run'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          CYPRESS_baseUrl: 'http://localhost:3000',
          CYPRESS_apiUrl: 'http://localhost:3001'
        }
      });

      cypressProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Cypress tests passed');
          resolve(true);
        } else {
          reject(new Error(`Cypress tests failed with exit code ${code}`));
        }
      });

      cypressProcess.on('error', (error) => {
        reject(new Error(`Cypress execution error: ${error.message}`));
      });
    });
  }

  /**
   * Clean up all spawned processes
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up servers...');

    for (const server of this.servers) {
      try {
        console.log(`  🛑 Stopping ${server.name} server...`);
        
        // Graceful shutdown
        server.process.kill('SIGTERM');
        
        // Wait briefly for graceful shutdown
        await this.delay(2000);
        
        // Force kill if still running
        if (!server.process.killed) {
          server.process.kill('SIGKILL');
        }

      } catch (error) {
        console.log(`  ⚠️  Error stopping ${server.name}: ${error.message}`);
      }
    }

    console.log('✅ Cleanup completed');
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get server status for debugging
   */
  getServerStatus() {
    return this.servers.map(server => ({
      name: server.name,
      port: server.port,
      running: !server.process.killed,
      pid: server.process.pid
    }));
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || process.env.E2E_VERBOSE === 'true',
    backend: !args.includes('--no-backend'),
    frontend: !args.includes('--no-frontend'),
    cypress: !args.includes('--no-cypress')
  };

  const launcher = new E2ELauncher();
  
  launcher.run(options)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ E2E Launcher Error:', error.message);
      process.exit(1);
    });
}

module.exports = E2ELauncher;