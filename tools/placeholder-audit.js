#!/usr/bin/env node
/**
 * M3.9 Enhanced Placeholder Sweep - Enterprise Grade
 * - Comprehensive placeholder detection with advanced patterns
 * - Security-first approach with encryption support
 * - Performance-optimized parallel processing
 * - Production-ready CI/CD integration
 * - Advanced validation with environment-specific rules
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { glob } = require('glob');

// Import real values mapping for comprehensive validation
const realValuesConfig = require('../config/real-values-mapping.js');

const ROOT = process.cwd();
const args = process.argv.slice(2);
const fixMapPath = args.includes('--fix') ? args[args.indexOf('--fix') + 1] : null;
const reportPath = args.includes('--report') ? args[args.indexOf('--report') + 1] : 'PLACEHOLDER-AUDIT.md';
const verbose = args.includes('--verbose') || args.includes('-v');
const dryRun = args.includes('--dry-run');
const encryptionKey = process.env.AUDIT_ENCRYPTION_KEY;

// Enhanced ignore patterns
const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**', 
  'build/**',
  '.git/**',
  'coverage/**',
  '**/*lock*',
  '**/*.{png,jpg,jpeg,gif,webp,ico,svg,woff,woff2,ttf,eot}',
  '**/*.{zip,tar,gz,rar,7z}',
  '**/.*cache/**',
  'logs/**',
  'tmp/**',
  'temp/**'
];

// Comprehensive file patterns to scan
const FILE_PATTERNS = [
  '**/*.{js,ts,tsx,jsx,mjs,cjs}',
  '**/*.{json,jsonc,json5}', 
  '**/*.{env,env.*}',
  '**/*.{md,mdx,txt}',
  '**/*.{yml,yaml}',
  '**/*.{xml,html,htm}',
  '**/*.{sh,bash,zsh,fish}',
  '**/*.{py,rb,php,go,java,cs}',
  '**/Dockerfile*',
  '**/docker-compose*',
  '**/.env*',
  '**/.*rc',
  '**/.*config*'
];

// Enhanced placeholder detection patterns
const PLACEHOLDER_PATTERNS = [
  // Generic placeholders
  {
    name: 'Generic Placeholders',
    pattern: /\b(placeholder|change[_-]?me|replace[_-]?me|to[_-]?be[_-]?filled|your-api-key-here|dummy|sample|tbd|todo|fixme|hack)\b/i,
    severity: 'high'
  },
  // Analytics placeholders
  {
    name: 'Analytics Placeholders',
    pattern: /\b(G-(TEST[0-9A-Z]*|XXXX|YYYY|ZZZZ|MEASUREMENT_ID|AAAAAAAAAA|123456789|[A-Z0-9]{10}))\b/,
    severity: 'critical'
  },
  {
    name: 'GTM Placeholders', 
    pattern: /\b(GTM-(TEST[0-9A-Z]*|XXXX|YYYY|ZZZZ|CONTAINER_ID|[A-Z0-9]{7}))\b/,
    severity: 'critical'
  },
  {
    name: 'Legacy UA Tracking',
    pattern: /\bUA-\d{4,}-\d+\b/,
    severity: 'medium'
  },
  // API Keys and secrets
  {
    name: 'API Key Placeholders',
    pattern: /(API_KEY|SECRET|TOKEN|PRIVATE_KEY|ACCESS_KEY|WEBHOOK_SIGNATURE_SECRET)\s*[=:]\s*(change.*|replace.*|test.*|dummy.*|sample.*|placeholder.*|your.*|xxx.*|yyy.*)/i,
    severity: 'critical'
  },
  // URLs and domains
  {
    name: 'Example Domains',
    pattern: /\b(example\.(com|org|net)|localhost|127\.0\.0\.1|0\.0\.0\.0)(?!.*test)/i,
    severity: 'medium'
  },
  // Email placeholders
  {
    name: 'Email Placeholders',
    pattern: /(EMAIL_FROM|FROM_EMAIL|SMTP_USER)\s*[=:]\s*(no-reply@example\.com|test@.*|example@.*|admin@localhost)/i,
    severity: 'high'
  },
  // Database placeholders
  {
    name: 'Database Placeholders',
    pattern: /(DATABASE_URL|DB_.*|POSTGRES_.*|MYSQL_.*|MONGO_.*)\s*[=:]\s*(postgres:\/\/.*@localhost|mysql:\/\/.*test|mongodb:\/\/.*test)/i,
    severity: 'high'
  },
  // Sentry placeholders
  {
    name: 'Sentry Placeholders',
    pattern: /(SENTRY_DSN\s*[=:]\s*$|https?:\/\/.*@.*\.ingest\.sentry\.io\/.*test|https?:\/\/example.*sentry\.io\/\d+)/i,
    severity: 'medium'
  },
  // Redis placeholders
  {
    name: 'Redis Placeholders',
    pattern: /(REDIS_URL\s*[=:]\s*redis:\/\/(localhost|127\.0\.0\.1).*TEST)/i,
    severity: 'medium'
  },
  // Common test/dev patterns
  {
    name: 'Test/Dev Patterns',
    pattern: /\b(test[_-]?(key|secret|token|password)|dev[_-]?(key|secret|token)|debug[_-]?(mode|flag))\b/i,
    severity: 'low'
  },
  // Hardcoded credentials
  {
    name: 'Hardcoded Credentials',
    pattern: /(password|pwd|pass)\s*[=:]\s*(123456|password|admin|root|test|demo)/i,
    severity: 'critical'
  }
];

// Enhanced validators with environment-specific rules
const VALIDATORS = [
  {
    key: 'GA4_MEASUREMENT_ID',
    pattern: /^G-[A-Z0-9]{8,}$/i,
    message: 'GA4_MEASUREMENT_ID phải dạng G-[A-Z0-9]{8,} (ví dụ: G-XXXXXXXXXX)',
    required: ['production'],
    severity: 'high'
  },
  {
    key: 'GTM_CONTAINER_ID', 
    pattern: /^GTM-[A-Z0-9]{6,}$/i,
    message: 'GTM_CONTAINER_ID phải dạng GTM-[A-Z0-9]{6,} (ví dụ: GTM-XXXXXXX)',
    required: ['production'],
    severity: 'high'
  },
  {
    key: 'SENTRY_DSN',
    pattern: /^https?:\/\/[a-f0-9]+@[a-z0-9]+\.ingest\.sentry\.io\/\d+$/i,
    allowEmpty: true,
    message: 'SENTRY_DSN sai định dạng URL DSN của Sentry',
    severity: 'medium'
  },
  {
    key: 'WEBHOOK_SIGNATURE_SECRET',
    pattern: /^.{32,}$/,
    message: 'WEBHOOK_SIGNATURE_SECRET phải có ít nhất 32 ký tự ngẫu nhiên',
    required: ['production'],
    severity: 'critical'
  },
  {
    key: 'EMAIL_FROM',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'EMAIL_FROM phải là địa chỉ email hợp lệ',
    required: ['production'],
    severity: 'high'
  },
  {
    key: 'FRONTEND_BASE_URL',
    pattern: /^https?:\/\/[a-zA-Z0-9.-]+/i,
    message: 'FRONTEND_BASE_URL phải là URL http/https hợp lệ',
    required: ['production'], 
    severity: 'high'
  },
  {
    key: 'DATABASE_URL',
    pattern: /^postgres(ql)?:\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+(\?.*)?$/i,
    message: 'DATABASE_URL sai định dạng PostgreSQL connection string',
    required: ['production', 'staging'],
    severity: 'critical'
  },
  {
    key: 'REDIS_URL',
    pattern: /^redis(s)?:\/\/([^:@]+:[^@]+@)?[^:]+:\d+(\?.*)?$/i,
    message: 'REDIS_URL sai định dạng Redis connection string',
    required: ['production'],
    severity: 'high'
  },
  {
    key: 'JWT_SECRET',
    pattern: /^.{64,}$/,
    message: 'JWT_SECRET phải có ít nhất 64 ký tự để bảo mật',
    required: ['production', 'staging'],
    severity: 'critical'
  },
  {
    key: 'SESSION_SECRET',
    pattern: /^.{32,}$/,
    message: 'SESSION_SECRET phải có ít nhất 32 ký tự ngẫu nhiên',
    required: ['production'],
    severity: 'critical'
  }
];

class PlaceholderAuditor {
  constructor() {
    this.stats = {
      filesScanned: 0,
      filesWithPlaceholders: 0,
      placeholdersFound: 0,
      envErrors: 0,
      autoFixed: 0,
      startTime: Date.now()
    };
    this.findings = [];
    this.envErrors = [];
    this.fixedFiles = [];
  }

  /**
   * Main audit execution
   */
  async run() {
    this.log('🔍 Starting M3.9 Enhanced Placeholder Sweep...');
    this.log('='.repeat(50));

    try {
      // Get all files to scan
      const files = await this.getFilesToScan();
      this.stats.filesScanned = files.length;
      
      this.log(`📁 Found ${files.length} files to scan`);

      // Process files with parallel workers for performance
      await this.processFiles(files);

      // Load fix map if provided
      let fixMap = null;
      if (fixMapPath) {
        fixMap = await this.loadFixMap(fixMapPath);
      }

      // Load fix map automatically if --fix is specified without path
      if (args.includes('--fix') && !fixMapPath) {
        fixMap = await this.loadFixMap(null); // Use built-in mapping
      }

      // Apply fixes if requested
      if (fixMap && !dryRun) {
        await this.applyFixes(fixMap);
      }

      // Generate comprehensive report
      await this.generateReport();

      // Display results
      this.displayResults();

      // Exit with appropriate code for CI
      this.exitWithCode();

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      if (verbose) console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Get all files to scan with enhanced glob patterns
   */
  async getFilesToScan() {
    const allFiles = new Set();
    
    for (const pattern of FILE_PATTERNS) {
      try {
        const files = await glob(pattern, { 
          ignore: IGNORE_PATTERNS,
          nodir: true,
          absolute: false
        });
        files.forEach(f => allFiles.add(f));
      } catch (error) {
        this.log(`⚠️ Warning: Failed to scan pattern ${pattern}: ${error.message}`);
      }
    }

    return Array.from(allFiles).sort();
  }

  /**
   * Process files with performance optimization and worker threads
   */
  async processFiles(files) {
    const availableWorkers = Math.min(4, Math.max(1, require('os').cpus().length - 1));
    const batchSize = Math.min(100, Math.max(10, Math.ceil(files.length / availableWorkers)));
    const batches = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    this.log(`⚡ Processing ${files.length} files using ${availableWorkers} workers in ${batches.length} batches of ~${batchSize} files each`);

    // Use worker threads for large file sets (>500 files)
    if (files.length > 500 && isMainThread && !process.env.DISABLE_WORKERS) {
      return await this.processFilesWithWorkers(batches);
    }

    // Standard processing for smaller file sets
    let processedCount = 0;
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(file => this.processFile(file))
      );

      // Collect results
      batchResults.forEach(result => {
        if (result.findings.length > 0) {
          this.findings.push(result);
          this.stats.filesWithPlaceholders++;
          this.stats.placeholdersFound += result.findings.length;
        }
        this.envErrors = this.envErrors.concat(result.envErrors);
      });

      processedCount += batch.length;
      if (verbose || processedCount % 100 === 0) {
        this.log(`📊 Processed ${processedCount}/${files.length} files...`);
      }
    }
  }

  /**
   * Process files with worker threads for improved performance
   */
  async processFilesWithWorkers(batches) {
    this.log('🚀 Using worker threads for parallel processing...');
    
    const workerPromises = batches.map((batch, index) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: {
            batch,
            patterns: PLACEHOLDER_PATTERNS,
            validators: VALIDATORS,
            verbose,
            workerId: index
          }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    });

    try {
      const results = await Promise.all(workerPromises);
      
      // Aggregate results from all workers
      results.forEach(workerResult => {
        if (workerResult.findings) {
          this.findings = this.findings.concat(workerResult.findings);
          this.stats.filesWithPlaceholders += workerResult.filesWithPlaceholders;
          this.stats.placeholdersFound += workerResult.placeholdersFound;
        }
        if (workerResult.envErrors) {
          this.envErrors = this.envErrors.concat(workerResult.envErrors);
        }
      });

      this.log(`✅ Worker processing completed: ${results.length} workers processed ${this.stats.filesScanned} files`);
      
    } catch (error) {
      this.log(`⚠️ Worker processing failed, falling back to single-threaded: ${error.message}`);
      // Fallback to single-threaded processing
      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(file => this.processFile(file))
        );
        
        batchResults.forEach(result => {
          if (result.findings.length > 0) {
            this.findings.push(result);
            this.stats.filesWithPlaceholders++;
            this.stats.placeholdersFound += result.findings.length;
          }
          this.envErrors = this.envErrors.concat(result.envErrors);
        });
      }
    }
  }

  /**
   * Process individual file
   */
  async processFile(filePath) {
    const result = {
      file: filePath,
      findings: [],
      envErrors: []
    };

    try {
      const content = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
      const lines = content.split(/\r?\n/);
      const findingsMap = new Map();
      const severityOrder = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };

      // Scan for placeholder patterns
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        PLACEHOLDER_PATTERNS.forEach(patternObj => {
          if (patternObj.pattern.test(line)) {
            const existingFinding = findingsMap.get(lineNumber);
            if (!existingFinding || severityOrder[patternObj.severity] > severityOrder[existingFinding.severity]) {
              findingsMap.set(lineNumber, {
                line: lineNumber,
                pattern: patternObj.name,
                severity: patternObj.severity,
                snippet: line.trim().slice(0, 200),
                fullPattern: patternObj.pattern.toString()
              });
            }
          }
        });
      });

      result.findings = Array.from(findingsMap.values());

      // Validate environment files
      if (/\.env($|\.)/i.test(filePath)) {
        const envObj = this.parseEnvFile(content);
        result.envErrors = this.validateEnvFile(filePath, envObj);
        this.stats.envErrors += result.envErrors.length;
      }

    } catch (error) {
      if (verbose) {
        this.log(`⚠️ Warning: Could not process ${filePath}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Parse environment file content
   */
  parseEnvFile(content) {
    const envObj = {};
    content.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (match) {
        const [, key, value] = match;
        envObj[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
      }
    });
    return envObj;
  }

  /**
   * Validate environment file with enhanced rules and security classification
   */
  validateEnvFile(filePath, envObj) {
    const errors = [];
    const currentEnv = envObj.NODE_ENV || 'development';
    const envRules = realValuesConfig.validateEnvironment(currentEnv);

    for (const validator of VALIDATORS) {
      const value = envObj[validator.key];
      
      // Check if required for current environment
      const isRequired = validator.required && validator.required.includes(currentEnv);
      
      // Skip if empty and allowed
      if ((!value || value === '') && (validator.allowEmpty || !isRequired)) {
        continue;
      }

      // Get security level for this key
      const securityLevel = realValuesConfig.getSecurityLevel(validator.key);

      // Check for placeholder values with enhanced patterns
      const placeholderPatterns = [
        /^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i,
        /YOUR_[A-Z_]+_HERE/i,
        /\${[A-Z_]+}/,
        /(API_KEY|SECRET|TOKEN).*HERE/i
      ];

      const hasPlaceholder = !value || placeholderPatterns.some(pattern => pattern.test(value));
      
      if (hasPlaceholder) {
        errors.push({
          key: validator.key,
          file: filePath,
          severity: validator.severity,
          securityLevel,
          message: `${validator.key} contains placeholder or missing real value in ${filePath}`,
          type: 'placeholder',
          suggestion: realValuesConfig.getRealValue(validator.key, currentEnv) || 'Set appropriate value for your environment'
        });
        continue;
      }

      // Enhanced security validation
      if (securityLevel === 'HIGH_RISK' && !envRules.allowHardcodedSecrets) {
        // Check if value looks like a hardcoded secret in production
        if (currentEnv === 'production' && (
          value.length < 32 || 
          /^(test|dev|local|demo)/i.test(value) ||
          value === value.toLowerCase() || // All lowercase might be weak
          !/[A-Za-z0-9+/=_-]{20,}/.test(value) // Should look like proper key
        )) {
          errors.push({
            key: validator.key,
            file: filePath,
            severity: 'critical',
            securityLevel,
            message: `${validator.key} appears to have weak or test value in production environment`,
            type: 'security'
          });
        }
      }

      // Validate format with enhanced pattern matching
      if (validator.pattern && !validator.pattern.test(value)) {
        errors.push({
          key: validator.key,
          file: filePath,
          severity: validator.severity,
          securityLevel,
          message: `${validator.message} in ${filePath}: "${value.slice(0, 50)}..."`,
          type: 'format'
        });
      }
    }

    // Check for mandatory environment variables in production
    if (currentEnv === 'production' && envRules.mandatoryEnvironmentVars) {
      envRules.mandatoryEnvironmentVars.forEach(key => {
        if (!envObj[key] || envObj[key] === '') {
          errors.push({
            key,
            file: filePath,
            severity: 'critical',
            securityLevel: realValuesConfig.getSecurityLevel(key),
            message: `Missing mandatory environment variable ${key} for production environment`,
            type: 'missing'
          });
        }
      });
    }

    return errors;
  }

  /**
   * Load fix map with encryption support and real values integration
   */
  async loadFixMap(mapPath) {
    try {
      let fixMap = {};

      // If no specific map provided, use default real values mapping
      if (!mapPath || !fs.existsSync(mapPath)) {
        const currentEnv = process.env.NODE_ENV || 'development';
        this.log(`🔑 Using built-in real values mapping for environment: ${currentEnv}`);
        
        // Merge all mapping sources
        fixMap = {
          ...realValuesConfig.realValuesMapping.common,
          ...realValuesConfig.realValuesMapping.domains,
          ...realValuesConfig.realValuesMapping.database,
          ...realValuesConfig.realValuesMapping.environments[currentEnv],
          ...Object.values(realValuesConfig.realValuesMapping.services).reduce((acc, service) => ({...acc, ...service}), {})
        };
        
        this.log(`🔑 Generated fix map with ${Object.keys(fixMap).length} values from real-values-mapping.js`);
        return fixMap;
      }

      // Load custom fix map file
      let content = fs.readFileSync(mapPath, 'utf8');

      // Decrypt if encrypted
      if (content.startsWith('ENCRYPTED:')) {
        if (!encryptionKey) {
          throw new Error('Encrypted fix map requires AUDIT_ENCRYPTION_KEY environment variable');
        }
        content = this.decrypt(content.slice(10), encryptionKey);
      }

      const customMap = JSON.parse(content);
      this.log(`🔑 Loaded custom fix map with ${Object.keys(customMap).length} values`);
      
      return customMap;
    } catch (error) {
      throw new Error(`Failed to load fix map: ${error.message}`);
    }
  }

  /**
   * Apply automatic fixes with intelligent replacement
   */
  async applyFixes(fixMap) {
    this.log('🔧 Applying automatic fixes...');
    
    // Process environment files
    const envFiles = this.findings
      .map(f => f.file)
      .filter(f => /\.env($|\.)/i.test(f))
      .filter((f, i, arr) => arr.indexOf(f) === i); // unique

    for (const envFile of envFiles) {
      await this.fixEnvFile(envFile, fixMap);
    }

    // Process configuration files (JSON, JS)
    const configFiles = this.findings
      .map(f => f.file)
      .filter(f => /\.(json|js|ts|jsx|tsx)$/i.test(f))
      .filter((f, i, arr) => arr.indexOf(f) === i); // unique

    for (const configFile of configFiles) {
      await this.fixConfigFile(configFile, fixMap);
    }

    this.log(`✅ Auto-fix completed: ${this.stats.autoFixed} files processed`);
  }

  /**
   * Fix environment files with smart replacement
   */
  async fixEnvFile(envFile, fixMap) {
    try {
      const filePath = path.join(ROOT, envFile);
      const content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      const changes = [];

      // Process each line for environment variables
      const lines = content.split(/\r?\n/);
      const newLines = lines.map(line => {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
        if (match) {
          const [, key, value] = match;
          
          // Check if this key has a replacement in our fix map
          if (fixMap[key] && fixMap[key] !== value.replace(/^["']|["']$/g, '')) {
            const newValue = fixMap[key];
            const newLine = `${key}=${newValue}`;
            changes.push(`${key}: "${value}" → "${newValue}"`);
            changed = true;
            return newLine;
          }
          
          // Check for placeholder patterns and suggest replacements
          const placeholderPatterns = [
            /YOUR_[A-Z_]+_HERE/i,
            /\${[A-Z_]+}/,
            /(placeholder|change.*|replace.*|your.*|example.*)/i
          ];
          
          if (placeholderPatterns.some(pattern => pattern.test(value))) {
            const suggestion = realValuesConfig.getRealValue(key, process.env.NODE_ENV || 'development');
            if (suggestion) {
              const newLine = `${key}=${suggestion}`;
              changes.push(`${key}: "${value}" → "${suggestion}" (auto-suggested)`);
              changed = true;
              return newLine;
            }
          }
        }
        return line;
      });

      if (changed) {
        if (!dryRun) {
          // Backup original file
          fs.copyFileSync(filePath, `${filePath}.backup-${Date.now()}`);
          fs.writeFileSync(filePath, newLines.join('\n'));
        }
        
        this.fixedFiles.push({
          file: envFile,
          type: 'environment',
          changes: changes
        });
        this.stats.autoFixed++;
        
        this.log(`✅ Fixed ${envFile}:`);
        changes.forEach(change => this.log(`   - ${change}`));
      }

    } catch (error) {
      this.log(`❌ Failed to fix ${envFile}: ${error.message}`);
    }
  }

  /**
   * Fix configuration files (JSON, JS) with intelligent replacement
   */
  async fixConfigFile(configFile, fixMap) {
    try {
      const filePath = path.join(ROOT, configFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      const changes = [];

      // Smart replacement for different patterns
      const replacements = [
        // Common placeholder patterns
        { 
          pattern: /"dev-api-key-12345"/gi, 
          replacement: (match) => fixMap['YOUR_API_KEY_HERE'] ? `"${fixMap['YOUR_API_KEY_HERE']}"` : match 
        },
        { 
          pattern: /"example\.com"/gi, 
          replacement: (match) => fixMap['example.com'] ? `"${fixMap['example.com']}"` : match 
        },
        { 
          pattern: /"localhost:3000"/gi, 
          replacement: (match) => fixMap['localhost:3000'] ? `"${fixMap['localhost:3000']}"` : match 
        },
        { 
          pattern: /G-XXXXXXXXXX/gi, 
          replacement: (match) => fixMap['GA4_MEASUREMENT_ID'] || fixMap['YOUR_GA_TRACKING_ID'] || match 
        },
        { 
          pattern: /GTM-XXXXXXX/gi, 
          replacement: (match) => fixMap['GTM_CONTAINER_ID'] || fixMap['YOUR_GTM_ID'] || match 
        }
      ];

      replacements.forEach(({ pattern, replacement }) => {
        const originalContent = content;
        content = content.replace(pattern, (match) => {
          const newValue = typeof replacement === 'function' ? replacement(match) : replacement;
          if (newValue !== match) {
            changes.push(`${match} → ${newValue}`);
            changed = true;
          }
          return newValue;
        });
      });

      if (changed) {
        if (!dryRun) {
          // Backup original file
          fs.copyFileSync(filePath, `${filePath}.backup-${Date.now()}`);
          fs.writeFileSync(filePath, content);
        }
        
        this.fixedFiles.push({
          file: configFile,
          type: 'configuration',
          changes: changes
        });
        this.stats.autoFixed++;
        
        this.log(`✅ Fixed ${configFile}:`);
        changes.forEach(change => this.log(`   - ${change}`));
      }

    } catch (error) {
      this.log(`❌ Failed to fix ${configFile}: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const duration = Date.now() - this.stats.startTime;
    const lines = [];

    // Header
    lines.push('# 🔍 M3.9 Enhanced Placeholder Audit Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Duration:** ${duration}ms`);
    lines.push(`**Environment:** ${process.env.NODE_ENV || 'development'}`);
    lines.push('');

    // Executive Summary
    lines.push('## 📊 Executive Summary');
    lines.push('');
    lines.push(`- **Files Scanned:** ${this.stats.filesScanned}`);
    lines.push(`- **Files with Placeholders:** ${this.stats.filesWithPlaceholders}`);
    lines.push(`- **Total Placeholders Found:** ${this.stats.placeholdersFound}`);
    lines.push(`- **Environment Validation Errors:** ${this.stats.envErrors}`);
    if (fixMapPath) {
      lines.push(`- **Files Auto-fixed:** ${this.stats.autoFixed}`);
    }
    lines.push('');

    // Severity breakdown
    const severityCounts = this.getSeverityCounts();
    if (Object.keys(severityCounts).length > 0) {
      lines.push('## ⚠️ Issues by Severity');
      lines.push('');
      Object.entries(severityCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([severity, count]) => {
          const emoji = this.getSeverityEmoji(severity);
          lines.push(`- **${emoji} ${severity.toUpperCase()}:** ${count} issues`);
        });
      lines.push('');
    }

    // Critical environment errors
    const criticalErrors = this.envErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      lines.push('## 🚨 Critical Environment Issues');
      lines.push('');
      criticalErrors.forEach(error => {
        lines.push(`- **${error.key}** in \`${error.file}\`: ${error.message}`);
      });
      lines.push('');
    }

    // All environment errors
    if (this.envErrors.length > 0) {
      lines.push('## ❌ Environment Validation Errors');
      lines.push('');
      this.envErrors.forEach(error => {
        const emoji = this.getSeverityEmoji(error.severity);
        lines.push(`- ${emoji} **${error.key}** in \`${error.file}\`: ${error.message}`);
      });
      lines.push('');
    }

    // Placeholder findings
    if (this.findings.length > 0) {
      lines.push('## 🔍 Placeholder Findings');
      lines.push('');
      
      this.findings.forEach(finding => {
        lines.push(`### 📁 \`${finding.file}\``);
        lines.push('');
        
        finding.findings.forEach(f => {
          const emoji = this.getSeverityEmoji(f.severity);
          lines.push(`- ${emoji} **Line ${f.line}** (${f.pattern}): \`${f.snippet}\``);
        });
        lines.push('');
      });
    }

    // Fixed files
    if (this.fixedFiles.length > 0) {
      lines.push('## ✅ Auto-Fixed Files');
      lines.push('');
      this.fixedFiles.forEach(file => {
        lines.push(`- \`${file}\``);
      });
      lines.push('');
    }

    // Recommendations
    lines.push('## 💡 Recommendations');
    lines.push('');
    
    if (this.stats.placeholdersFound > 0 || this.stats.envErrors > 0) {
      lines.push('### Immediate Actions Required');
      lines.push('');
      if (criticalErrors.length > 0) {
        lines.push('1. **🚨 Fix Critical Issues**: Address all critical environment configuration errors immediately');
      }
      if (this.stats.placeholdersFound > 0) {
        lines.push('2. **🔄 Replace Placeholders**: Update all placeholder values with production-ready configurations');
      }
      lines.push('3. **🔐 Security Review**: Ensure no sensitive data is hardcoded or exposed');
      lines.push('4. **✅ Re-run Audit**: Execute audit again after fixes to verify resolution');
      lines.push('');
    }

    lines.push('### Best Practices');
    lines.push('');
    lines.push('- Use environment-specific configuration files');
    lines.push('- Implement proper secret management for production');
    lines.push('- Add pre-commit hooks to prevent placeholder commits');
    lines.push('- Regular audit runs in CI/CD pipeline');
    lines.push('- Encrypt sensitive configuration data');
    lines.push('');

    // Footer
    lines.push('---');
    lines.push('');
    lines.push('*Generated by M3.9 Enhanced Placeholder Sweep - Enterprise Grade Security Audit*');

    // Write report
    fs.writeFileSync(reportPath, lines.join('\n'));
    this.log(`📄 Comprehensive report written to ${reportPath}`);
  }

  /**
   * Get severity counts for summary
   */
  getSeverityCounts() {
    const counts = {};
    
    this.findings.forEach(finding => {
      finding.findings.forEach(f => {
        counts[f.severity] = (counts[f.severity] || 0) + 1;
      });
    });

    this.envErrors.forEach(error => {
      counts[error.severity] = (counts[error.severity] || 0) + 1;
    });

    return counts;
  }

  /**
   * Get emoji for severity level
   */
  getSeverityEmoji(severity) {
    const emojis = {
      critical: '🚨',
      high: '⚠️',
      medium: '🔸', 
      low: '💡'
    };
    return emojis[severity] || '📌';
  }

  /**
   * Display results summary
   */
  displayResults() {
    const duration = Date.now() - this.stats.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 M3.9 PLACEHOLDER AUDIT RESULTS');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📁 Files Scanned: ${this.stats.filesScanned}`);
    console.log(`🔍 Files with Issues: ${this.stats.filesWithPlaceholders}`);
    console.log(`⚠️  Placeholders Found: ${this.stats.placeholdersFound}`);
    console.log(`❌ Environment Errors: ${this.stats.envErrors}`);
    
    if (this.stats.autoFixed > 0) {
      console.log(`✅ Files Auto-Fixed: ${this.stats.autoFixed}`);
    }

    // Severity breakdown
    const severityCounts = this.getSeverityCounts();
    if (Object.keys(severityCounts).length > 0) {
      console.log('\n🎯 Issues by Severity:');
      Object.entries(severityCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([severity, count]) => {
          const emoji = this.getSeverityEmoji(severity);
          console.log(`   ${emoji} ${severity.toUpperCase()}: ${count}`);
        });
    }

    console.log('='.repeat(60));
  }

  /**
   * Exit with appropriate code for CI
   */
  exitWithCode() {
    const criticalErrors = this.envErrors.filter(e => e.severity === 'critical').length;
    const highErrors = this.envErrors.filter(e => e.severity === 'high').length + 
                      this.findings.reduce((sum, f) => sum + f.findings.filter(ff => ff.severity === 'high').length, 0);
    
    if (criticalErrors > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND - Deployment blocked');
      process.exit(2); // Critical errors
    } else if (highErrors > 0 || this.stats.placeholdersFound > 0) {
      console.log('\n⚠️  HIGH-PRIORITY ISSUES FOUND - Review required');
      process.exit(1); // High priority issues
    } else {
      console.log('\n✅ AUDIT PASSED - No critical issues found');
      process.exit(0); // Success
    }
  }

  /**
   * Encryption utilities for sensitive data
   */
  encrypt(text, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData, key) {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedData.split(':');
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Logging utility
   */
  log(message) {
    if (verbose) {
      console.log(message);
    }
  }
}

// Worker thread execution
if (!isMainThread) {
  const { batch, patterns, validators, verbose, workerId } = workerData;
  
  async function processWorkerBatch() {
    const findings = [];
    const envErrors = [];
    let filesWithPlaceholders = 0;
    let placeholdersFound = 0;
    const severityOrder = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    
    for (const filePath of batch) {
      try {
        const result = {
          file: filePath,
          findings: [],
          envErrors: []
        };

        const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
        const lines = content.split(/\r?\n/);
        const findingsMap = new Map();

        // Scan for placeholder patterns
        lines.forEach((line, index) => {
          const lineNumber = index + 1;
          patterns.forEach(patternObj => {
            if (patternObj.pattern.test(line)) {
              const existingFinding = findingsMap.get(lineNumber);
              if (!existingFinding || severityOrder[patternObj.severity] > severityOrder[existingFinding.severity]) {
                findingsMap.set(lineNumber, {
                  line: lineNumber,
                  pattern: patternObj.name,
                  severity: patternObj.severity,
                  snippet: line.trim().slice(0, 200),
                  fullPattern: patternObj.pattern.toString()
                });
              }
            }
          });
        });

        result.findings = Array.from(findingsMap.values());

        // Validate environment files
        if (/\.env($|\.)/i.test(filePath)) {
          const envObj = {};
          content.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
            if (match) {
              const [, key, value] = match;
              envObj[key] = value.replace(/^["']|["']$/g, '');
            }
          });

          // Basic validation (simplified for worker)
          result.envErrors = validators.filter(v => {
            const value = envObj[v.key];
            return value && /^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i.test(value);
          }).map(v => ({
            key: v.key,
            file: filePath,
            severity: v.severity,
            message: `${v.key} contains placeholder value in ${filePath}`,
            type: 'placeholder'
          }));
        }

        if (result.findings.length > 0) {
          findings.push(result);
          filesWithPlaceholders++;
          placeholdersFound += result.findings.length;
        }
        
        if (result.envErrors.length > 0) {
          envErrors.push(...result.envErrors);
        }

      } catch (error) {
        if (verbose) {
          console.log(`Worker ${workerId}: Warning - Could not process ${filePath}: ${error.message}`);
        }
      }
    }

    parentPort.postMessage({
      findings,
      envErrors,
      filesWithPlaceholders,
      placeholdersFound,
      workerId
    });
  }

  processWorkerBatch().catch(error => {
    console.error(`Worker ${workerId} error:`, error);
    process.exit(1);
  });
}

// Main execution
if (require.main === module && isMainThread) {
  const auditor = new PlaceholderAuditor();
  auditor.run().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = PlaceholderAuditor;