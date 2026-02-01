#!/usr/bin/env node

/**
 * M3.8 Phase 0: Preflight Validation & Safety Checks
 * Validates environment and system health before deployment
 */

const { Pool } = require('pg');
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

class PreflightValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
    this.redisClient = null;
    this.pgPool = null;
  }

  /**
   * Run comprehensive preflight validation
   */
  async runValidation() {
    console.log('🚀 M3.8 Preflight Validation & Safety Checks');
    console.log('============================================\n');

    try {
      await this.checkEnvironmentVariables();
      await this.checkDatabaseConnection();
      await this.checkRedisConnection();
      await this.checkFileSystem();
      await this.checkRateLimiting();
      await this.checkCacheSystem();
      await this.checkNotificationSystem();
      
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Preflight validation failed:', error.message);
      this.errors.push({ check: 'general', error: error.message });
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Check critical environment variables
   */
  async checkEnvironmentVariables() {
    console.log('🔍 Checking Environment Variables...');
    
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'REDIS_URL'
    ];
    
    const missing = [];
    const weak = [];
    
    required.forEach(envVar => {
      const value = process.env[envVar];
      if (!value) {
        missing.push(envVar);
      } else if (envVar.includes('SECRET') && value.length < 32) {
        weak.push(envVar);
      }
    });
    
    if (missing.length > 0) {
      this.errors.push({ 
        check: 'Environment Variables', 
        error: `Missing required variables: ${missing.join(', ')}` 
      });
    }
    
    if (weak.length > 0) {
      this.warnings.push({ 
        check: 'Environment Variables', 
        warning: `Weak secrets detected: ${weak.join(', ')}` 
      });
    }

    // Check rate limiting configuration
    const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
    
    if (rateLimitMax < 200 && process.env.NODE_ENV === 'development') {
      this.warnings.push({
        check: 'Rate Limiting',
        warning: `Rate limit too restrictive for dev: ${rateLimitMax} req/${Math.round(rateLimitWindow/60000)}min`
      });
    }
    
    this.checks.push({
      name: 'Environment Variables',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: {
        required: required.length,
        missing: missing.length,
        weak: weak.length,
        rateLimitConfig: `${rateLimitMax} req/${Math.round(rateLimitWindow/60000)}min`
      }
    });
    
    console.log(`  ${missing.length === 0 ? '✅' : '❌'} ${missing.length === 0 ? 'PASS' : 'FAIL'} - ${required.length - missing.length}/${required.length} required variables present`);
  }

  /**
   * Test database connectivity and basic operations
   */
  async checkDatabaseConnection() {
    console.log('🔍 Checking Database Connection...');
    
    try {
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test basic connectivity
      const startTime = Date.now();
      await this.pgPool.query('SELECT 1 as health, NOW() as timestamp');
      const duration = Date.now() - startTime;

      // Test table existence
      const tables = await this.pgPool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      const expectedTables = ['users', 'saved_filters', 'notifications', 'alert_queue'];
      const existingTables = tables.rows.map(r => r.table_name);
      const missingTables = expectedTables.filter(t => !existingTables.includes(t));

      this.checks.push({
        name: 'Database Connection',
        status: duration < 1000 && missingTables.length === 0 ? 'PASS' : 'WARN',
        details: {
          responseTime: `${duration}ms`,
          tablesFound: existingTables.length,
          missingTables: missingTables.length > 0 ? missingTables : 'none'
        }
      });

      if (missingTables.length > 0) {
        this.warnings.push({
          check: 'Database Schema',
          warning: `Missing tables: ${missingTables.join(', ')}`
        });
      }

      console.log(`  ✅ PASS - Database connected (${duration}ms), ${existingTables.length} tables found`);

    } catch (error) {
      this.errors.push({ check: 'Database Connection', error: error.message });
      console.log(`  ❌ FAIL - ${error.message}`);
    }
  }

  /**
   * Test Redis connectivity and cache operations
   */
  async checkRedisConnection() {
    console.log('🔍 Checking Redis Connection...');
    
    try {
      this.redisClient = new Redis(process.env.REDIS_URL);

      // Test basic operations
      const startTime = Date.now();
      const testKey = `preflight:test:${Date.now()}`;
      const testValue = 'test-value';

      await this.redisClient.set(testKey, testValue, 'EX', 10);
      const retrievedValue = await this.redisClient.get(testKey);
      const duration = Date.now() - startTime;

      const isWorking = retrievedValue === testValue;

      // Get Redis info
      const info = await this.redisClient.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      this.checks.push({
        name: 'Redis Connection',
        status: isWorking ? 'PASS' : 'FAIL',
        details: {
          responseTime: `${duration}ms`,
          memoryUsed,
          operationSuccessful: isWorking
        }
      });

      // Cleanup test key
      await this.redisClient.del(testKey);

      console.log(`  ${isWorking ? '✅' : '❌'} ${isWorking ? 'PASS' : 'FAIL'} - Redis connected (${duration}ms), memory: ${memoryUsed}`);

    } catch (error) {
      this.errors.push({ check: 'Redis Connection', error: error.message });
      console.log(`  ❌ FAIL - ${error.message}`);
    }
  }

  /**
   * Check file system permissions and required directories
   */
  async checkFileSystem() {
    console.log('🔍 Checking File System...');
    
    const requiredDirs = [
      'server',
      'server/auth',
      'server/monitoring',
      'server/test'
    ];

    const requiredFiles = [
      'package.json',
      'server/app.js',
      'server/routes/metrics.js'
    ];

    let dirsOk = true;
    let filesOk = true;

    // Check directories
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        this.errors.push({ check: 'File System', error: `Missing directory: ${dir}` });
        dirsOk = false;
      }
    });

    // Check files
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.errors.push({ check: 'File System', error: `Missing file: ${file}` });
        filesOk = false;
      }
    });

    // Check log directory permissions (create if needed)
    const logDir = 'logs';
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Test write permissions
      const testFile = path.join(logDir, `preflight-test-${Date.now()}.tmp`);
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
    } catch (error) {
      this.warnings.push({ check: 'File System', warning: `Log directory issues: ${error.message}` });
    }

    this.checks.push({
      name: 'File System',
      status: dirsOk && filesOk ? 'PASS' : 'FAIL',
      details: {
        directoriesFound: requiredDirs.length,
        filesFound: requiredFiles.length,
        logDirWritable: fs.existsSync(logDir)
      }
    });

    console.log(`  ${dirsOk && filesOk ? '✅' : '❌'} ${dirsOk && filesOk ? 'PASS' : 'FAIL'} - File system structure verified`);
  }

  /**
   * Check rate limiting configuration
   */
  async checkRateLimiting() {
    console.log('🔍 Checking Rate Limiting Configuration...');
    
    const maxReq = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
    const reqPerMin = Math.round((maxReq / windowMs) * 60000);
    
    let status = 'PASS';
    let issue = null;
    
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      if (maxReq < 300) {
        status = 'WARN';
        issue = 'Rate limit too restrictive for development/testing';
        this.warnings.push({
          check: 'Rate Limiting',
          warning: `Consider increasing RATE_LIMIT_MAX_REQUESTS to 300+ for dev/test environments`
        });
      }
    }
    
    if (reqPerMin < 1) {
      status = 'FAIL';
      issue = 'Rate limiting too restrictive - less than 1 req/min';
      this.errors.push({
        check: 'Rate Limiting',
        error: 'Rate limiting configuration will block normal usage'
      });
    }
    
    this.checks.push({
      name: 'Rate Limiting',
      status,
      details: {
        maxRequests: maxReq,
        windowMinutes: Math.round(windowMs / 60000),
        requestsPerMinute: reqPerMin,
        environment: process.env.NODE_ENV,
        issue: issue || 'none'
      }
    });
    
    console.log(`  ${status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '✅'} ${status} - ${maxReq} req/${Math.round(windowMs/60000)}min (${reqPerMin} req/min)`);
  }

  /**
   * Test cache system functionality
   */
  async checkCacheSystem() {
    console.log('🔍 Checking Cache System...');
    
    if (!this.redisClient) {
      this.warnings.push({ check: 'Cache System', warning: 'Redis not available, skipping cache tests' });
      return;
    }
    
    try {
      const cacheEnabled = process.env.CACHE_ENABLED === 'true';
      const defaultTtl = parseInt(process.env.CACHE_DEFAULT_TTL_S || '300');
      
      if (!cacheEnabled) {
        this.warnings.push({ check: 'Cache System', warning: 'Cache is disabled' });
      }
      
      // Test cache key format
      const testKey = 'dealradarus:v1:preflight:test:123';
      await this.redisClient.set(testKey, JSON.stringify({ test: true }), 'EX', 30);
      const cached = await this.redisClient.get(testKey);
      const cacheWorking = cached !== null;
      
      // Clean up
      await this.redisClient.del(testKey);
      
      this.checks.push({
        name: 'Cache System',
        status: cacheWorking && cacheEnabled ? 'PASS' : 'WARN',
        details: {
          enabled: cacheEnabled,
          defaultTtlSeconds: defaultTtl,
          redisOperational: cacheWorking,
          keyFormatValid: testKey.startsWith('dealradarus:v1:')
        }
      });
      
      console.log(`  ${cacheWorking && cacheEnabled ? '✅' : '⚠️'} ${cacheWorking && cacheEnabled ? 'PASS' : 'WARN'} - Cache ${cacheEnabled ? 'enabled' : 'disabled'}, Redis ${cacheWorking ? 'working' : 'failed'}`);
      
    } catch (error) {
      this.errors.push({ check: 'Cache System', error: error.message });
      console.log(`  ❌ FAIL - ${error.message}`);
    }
  }

  /**
   * Check notification system configuration
   */
  async checkNotificationSystem() {
    console.log('🔍 Checking Notification System...');
    
    const emailEnabled = process.env.NOTIFY_EMAIL_ENABLED === 'true';
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const fromEmail = process.env.FROM_EMAIL;
    const alertRetryMax = parseInt(process.env.ALERT_RETRY_MAX || '3');
    
    let status = 'PASS';
    const issues = [];
    
    if (emailEnabled && !smtpConfigured) {
      status = 'FAIL';
      issues.push('Email notifications enabled but SMTP not configured');
    }
    
    if (alertRetryMax < 3) {
      status = 'WARN';
      issues.push('Alert retry count may be too low');
    }
    
    if (fromEmail && !fromEmail.includes('@')) {
      status = 'FAIL';
      issues.push('Invalid FROM_EMAIL format');
    }
    
    this.checks.push({
      name: 'Notification System',
      status,
      details: {
        emailEnabled,
        smtpConfigured,
        fromEmail: fromEmail || 'not set',
        alertRetryMax,
        issues: issues.length > 0 ? issues : 'none'
      }
    });
    
    if (status === 'FAIL') {
      this.errors.push({ check: 'Notification System', error: issues.join(', ') });
    } else if (status === 'WARN') {
      issues.forEach(issue => {
        this.warnings.push({ check: 'Notification System', warning: issue });
      });
    }
    
    console.log(`  ${status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '✅'} ${status} - Email: ${emailEnabled ? 'enabled' : 'disabled'}, SMTP: ${smtpConfigured ? 'configured' : 'missing'}`);
  }

  /**
   * Display comprehensive validation results
   */
  displayResults() {
    console.log('\n📊 PREFLIGHT VALIDATION RESULTS');
    console.log('================================');
    
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const warned = this.checks.filter(c => c.status === 'WARN').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    
    this.checks.forEach((check, index) => {
      const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${index + 1}. ${statusIcon} ${check.name}: ${check.status}`);
      
      if (check.details) {
        Object.entries(check.details).forEach(([key, value]) => {
          console.log(`   ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        });
      }
      console.log('');
    });
    
    console.log(`SUMMARY: ${passed} passed, ${warned} warnings, ${failed} failed`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach((warn, index) => {
        console.log(`${index + 1}. ${warn.check}: ${warn.warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.check}: ${error.error}`);
      });
    }
    
    // Overall assessment
    console.log('\n🏆 M3.8 SYSTEM READINESS:');
    if (failed === 0) {
      if (warned === 0) {
        console.log('🎉 EXCELLENT: System ready for deployment!');
      } else {
        console.log('✅ GOOD: System ready with minor warnings to address.');
      }
    } else {
      console.log('❌ NOT READY: Critical issues must be resolved before deployment.');
    }
    
    const readinessScore = Math.round(((passed + warned * 0.5) / this.checks.length) * 100);
    console.log(`\nSystem Readiness Score: ${readinessScore}/100`);
    
    // Exit with appropriate code
    process.exitCode = failed > 0 ? 1 : 0;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PreflightValidator();
  validator.runValidation()
    .then(() => {
      console.log('\n🎯 Preflight validation completed!');
    })
    .catch((error) => {
      console.error('❌ Preflight validation failed:', error);
      process.exit(1);
    });
}

module.exports = PreflightValidator;
