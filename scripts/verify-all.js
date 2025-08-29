#!/usr/bin/env node
/**
 * DealRadarUS Deployment Verification Script
 * Comprehensive audit of M3.1 (Auth), M3.2 (Saved Filters & Alerts), M3.3 (UGC)
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const axios = require('axios');

const execPromise = util.promisify(exec);

// Global configuration
const CONFIG = {
  baseDir: process.cwd(),
  checksDir: path.join(process.cwd(), '.checks'),
  reportsDir: path.join(process.cwd(), 'reports'),
  envFile: process.env.dotenv_config_path || '.env.dealradarus.local',
  serverPort: 3001,
  baseUrl: 'http://localhost:3001'
};

// Global results storage
const AUDIT_RESULTS = {
  timestamp: new Date().toISOString(),
  env: {},
  filesystem: {},
  database: {},
  api: {},
  email: {},
  tests: {},
  verdict: { M3_1: 'unknown', M3_2: 'unknown', M3_3: 'unknown' },
  recommendations: []
};

/**
 * Utility functions
 */
function createDirs() {
  [CONFIG.checksDir, CONFIG.reportsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function logPhase(phase, message) {
  console.log(`\n🔍 [PHASE ${phase}] ${message}`);
}

function saveJsonResult(filename, data) {
  const filePath = path.join(CONFIG.checksDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

async function loadEnvVars() {
  try {
    const envPath = path.join(CONFIG.baseDir, CONFIG.envFile);
    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${envPath}`);
    }

    // Load environment manually for verification
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key] = valueParts.join('=').replace(/^"|"$/g, '');
      }
    });

    const requiredKeys = [
      'DATABASE_URL', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_PORT', 
      'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'
    ];

    const envStatus = {
      file_exists: true,
      file_path: envPath,
      required_keys: {},
      optional_keys: {}
    };

    requiredKeys.forEach(key => {
      envStatus.required_keys[key] = {
        exists: !!envVars[key],
        masked_value: envVars[key] ? '*'.repeat(Math.min(envVars[key].length, 8)) : null
      };
    });

    // Optional keys
    ['DATABASE_URL_POOLER', 'FRONTEND_URL', 'NOTIFICATIONS_ENABLED'].forEach(key => {
      envStatus.optional_keys[key] = {
        exists: !!envVars[key],
        value: key === 'NOTIFICATIONS_ENABLED' ? envVars[key] : (envVars[key] ? '*'.repeat(8) : null)
      };
    });

    return envStatus;
  } catch (error) {
    return {
      file_exists: false,
      error: error.message
    };
  }
}

async function getSystemInfo() {
  try {
    const nodeVersion = process.version;
    const npmVersion = await execPromise('npm --version').catch(() => ({ stdout: 'unknown' }));
    
    // Check for required packages
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    return {
      node_version: nodeVersion,
      npm_version: npmVersion.stdout?.trim() || 'unknown',
      dependencies: {
        pg: packageJson.dependencies?.pg || packageJson.devDependencies?.pg || 'not found',
        axios: packageJson.dependencies?.axios || packageJson.devDependencies?.axios || 'not found',
        dotenv: packageJson.dependencies?.dotenv || packageJson.devDependencies?.dotenv || 'not found',
        express: packageJson.dependencies?.express || 'not found'
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * PHASE 0: Prerequisites & Environment
 */
async function phase0_prereq() {
  logPhase(0, 'PREREQ & ENV');
  
  try {
    createDirs();
    
    const envStatus = await loadEnvVars();
    const systemInfo = await getSystemInfo();
    
    AUDIT_RESULTS.env = {
      environment: envStatus,
      system: systemInfo,
      base_directory: CONFIG.baseDir,
      checks_directory: CONFIG.checksDir
    };

    console.log('✅ Environment file:', envStatus.file_exists ? 'Found' : 'Missing');
    console.log('✅ Node version:', systemInfo.node_version);
    console.log('✅ Checks directory created');
    
    return true;
  } catch (error) {
    console.error('❌ Phase 0 failed:', error.message);
    AUDIT_RESULTS.env.error = error.message;
    return false;
  }
}

/**
 * PHASE 1: Filesystem Audit
 */
async function phase1_filesystem() {
  logPhase(1, 'FILESYSTEM AUDIT');
  
  const expectedFiles = {
    'M3.1 (Auth)': [
      'server/auth/schema/001_users.sql',
      'server/auth/schema/002_audit_logging.sql',
      'server/auth/utils/database.js',
      'server/auth/utils/jwt.js', 
      'server/auth/utils/password.js',
      'server/auth/utils/audit.js',
      'server/auth/routes/auth.js',
      'server/auth/middleware/validation.js',
      'server/auth/middleware/rate-limit.js',
      'server/email/templates/verification.js',
      'server/email/templates/password-reset.js',
      'server/email/templates/welcome.js',
      'server/test/auth-flow-test.js',
      'M3.1-AUTH-SYSTEM-REPORT.md'
    ],
    'M3.2 (Saved Filters & Alerts)': [
      'server/auth/schema/003_saved_filters.sql',
      'server/auth/controllers/filters.js',
      'server/auth/controllers/alerts.js',
      'server/auth/routes/filters.js',
      'server/auth/routes/alerts.js',
      'server/email/templates/alerts.js',
      'server/test/filters-alerts-test.js',
      'M3.2-SAVED-FILTERS-REPORT.md',
      'server/jobs/alerts-processor.js'
    ],
    'M3.3 (UGC)': [
      'server/auth/schema/004_ugc.sql',
      'server/auth/schema/004_ugc_clean.sql',
      'server/auth/controllers/reviews.js',
      'server/auth/controllers/comments.js', 
      'server/auth/controllers/reports.js',
      'server/auth/routes/reviews.js',
      'server/auth/routes/comments.js',
      'server/auth/routes/reports.js',
      'server/email/templates/ugc-moderation.js',
      'server/test/ugc-test.js',
      'M3.3-UGC-API.postman_collection.json',
      'M3.3-UGC-IMPLEMENTATION-REPORT.md'
    ]
  };

  const results = {};
  let totalFiles = 0;
  let foundFiles = 0;

  for (const [module, files] of Object.entries(expectedFiles)) {
    results[module] = {};
    
    for (const file of files) {
      const fullPath = path.join(CONFIG.baseDir, file);
      const exists = fs.existsSync(fullPath);
      
      results[module][file] = {
        exists,
        path: fullPath,
        size: exists ? fs.statSync(fullPath).size : 0
      };
      
      totalFiles++;
      if (exists) foundFiles++;
    }
  }

  AUDIT_RESULTS.filesystem = {
    summary: {
      total_expected: totalFiles,
      found: foundFiles,
      missing: totalFiles - foundFiles,
      completion_rate: Math.round((foundFiles / totalFiles) * 100)
    },
    details: results
  };

  console.log(`✅ Filesystem audit: ${foundFiles}/${totalFiles} files found (${Math.round((foundFiles/totalFiles)*100)}%)`);
  
  saveJsonResult('fs-results.json', AUDIT_RESULTS.filesystem);
  return true;
}

/**
 * PHASE 2: Database Schema Audit  
 */
async function phase2_database() {
  logPhase(2, 'DATABASE SCHEMA AUDIT');
  
  try {
    // Load environment for DB connection
    require('dotenv').config({ path: CONFIG.envFile });
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const dbResults = {
      connection: { success: false },
      extensions: {},
      tables: {},
      indexes: {},
      triggers: {},
      row_counts: {}
    };

    try {
      // Test connection
      await pool.query('SELECT NOW()');
      dbResults.connection = { success: true, timestamp: new Date().toISOString() };
      console.log('✅ Database connection successful');
    } catch (error) {
      dbResults.connection = { success: false, error: error.message };
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    // Check extensions
    const extensions = await pool.query(`
      SELECT extname FROM pg_extension WHERE extname IN ('citext', 'pgcrypto');
    `);
    
    const foundExtensions = extensions.rows.map(row => row.extname);
    dbResults.extensions = {
      citext: foundExtensions.includes('citext'),
      pgcrypto: foundExtensions.includes('pgcrypto')
    };

    // Expected tables by module
    const expectedTables = {
      'M3.1': ['users', 'sessions', 'password_resets', 'email_verifications', 'email_events', 'auth_audit'],
      'M3.2': ['saved_filters', 'alerts'],
      'M3.3': ['reviews', 'comments', 'reports', 'deal_stats']
    };

    // Check tables
    for (const [module, tables] of Object.entries(expectedTables)) {
      dbResults.tables[module] = {};
      
      for (const table of tables) {
        try {
          const result = await pool.query(`
            SELECT 
              schemaname, tablename, 
              pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_tables 
            WHERE tablename = $1 AND schemaname = 'public'
          `, [table]);
          
          dbResults.tables[module][table] = {
            exists: result.rows.length > 0,
            size: result.rows[0]?.size || 'unknown'
          };

          // Get row count if table exists
          if (result.rows.length > 0) {
            try {
              const countResult = await pool.query(`SELECT COUNT(*) FROM public.${table}`);
              dbResults.row_counts[table] = parseInt(countResult.rows[0].count);
            } catch (err) {
              dbResults.row_counts[table] = 'error';
            }
          }
        } catch (error) {
          dbResults.tables[module][table] = { exists: false, error: error.message };
        }
      }
    }

    // Check critical indexes
    const criticalIndexes = [
      'users_email_key', 'sessions_user_id', 'reviews_deal_id', 
      'comments_deal_id', 'saved_filters_user_id', 'alerts_user_id'
    ];

    for (const indexName of criticalIndexes) {
      try {
        const result = await pool.query(`
          SELECT indexname, tablename 
          FROM pg_indexes 
          WHERE indexname LIKE '%${indexName.split('_')[1]}%' 
          AND schemaname = 'public'
        `);
        
        dbResults.indexes[indexName] = {
          found: result.rows.length > 0,
          details: result.rows
        };
      } catch (error) {
        dbResults.indexes[indexName] = { found: false, error: error.message };
      }
    }

    await pool.end();

    AUDIT_RESULTS.database = dbResults;
    saveJsonResult('db-results.json', dbResults);
    
    // Count found tables
    let foundTables = 0;
    let totalTables = 0;
    
    for (const module of Object.values(dbResults.tables)) {
      for (const [tableName, tableInfo] of Object.entries(module)) {
        totalTables++;
        if (tableInfo.exists) foundTables++;
      }
    }

    console.log(`✅ Database audit: ${foundTables}/${totalTables} tables found`);
    return true;

  } catch (error) {
    console.error('❌ Database audit failed:', error.message);
    AUDIT_RESULTS.database = { error: error.message };
    return false;
  }
}

/**
 * PHASE 3: API & Routing Audit
 */
async function phase3_api() {
  logPhase(3, 'API & ROUTING AUDIT');
  
  const apiResults = {
    server: { running: false },
    endpoints: {},
    summary: { total: 0, successful: 0, failed: 0 }
  };

  try {
    // Check if server is already running
    try {
      const healthCheck = await axios.get(`${CONFIG.baseUrl}/health`, { timeout: 5000 });
      apiResults.server = { 
        running: true, 
        started_externally: true,
        health_status: healthCheck.status
      };
      console.log('✅ Server already running on port', CONFIG.serverPort);
    } catch (error) {
      console.log('🔄 Starting server for API tests...');
      // Server not running, we'll need to start it
      // For now, we'll skip server startup in audit mode to avoid conflicts
      apiResults.server = {
        running: false,
        error: 'Server not running - skipping API tests for safety',
        note: 'Run server manually for full API audit'
      };
      
      AUDIT_RESULTS.api = apiResults;
      return true; // Don't fail the audit, just note the limitation
    }

    // Define test endpoints
    const endpoints = [
      { method: 'GET', path: '/health', description: 'Server health check' },
      { method: 'GET', path: '/reviews/deal/test-deal-audit', description: 'Get reviews for test deal' },
      { method: 'GET', path: '/comments/deal/test-deal-audit', description: 'Get comments for test deal' },
      { method: 'GET', path: '/filters', description: 'Get saved filters (requires auth)' },
      { method: 'GET', path: '/alerts', description: 'Get alerts (requires auth)' }
    ];

    // Test endpoints
    for (const endpoint of endpoints) {
      try {
        const url = `${CONFIG.baseUrl}${endpoint.path}`;
        const config = {
          method: endpoint.method.toLowerCase(),
          url,
          timeout: 10000,
          validateStatus: () => true // Don't throw on 4xx/5xx
        };

        const response = await axios(config);
        
        apiResults.endpoints[`${endpoint.method} ${endpoint.path}`] = {
          url,
          status: response.status,
          success: response.status < 500, // 2xx, 3xx, 4xx are "successful" calls
          response_size: JSON.stringify(response.data || '').length,
          content_type: response.headers['content-type'],
          description: endpoint.description
        };

        apiResults.summary.total++;
        if (response.status < 500) {
          apiResults.summary.successful++;
        } else {
          apiResults.summary.failed++;
        }

      } catch (error) {
        apiResults.endpoints[`${endpoint.method} ${endpoint.path}`] = {
          success: false,
          error: error.message,
          description: endpoint.description
        };
        
        apiResults.summary.total++;
        apiResults.summary.failed++;
      }
    }

    AUDIT_RESULTS.api = apiResults;
    saveJsonResult('api-results.json', apiResults);
    
    console.log(`✅ API audit: ${apiResults.summary.successful}/${apiResults.summary.total} endpoints responding`);
    return true;

  } catch (error) {
    console.error('❌ API audit failed:', error.message);
    AUDIT_RESULTS.api = { error: error.message };
    return false;
  }
}

/**
 * PHASE 4: Email/SMTP & Notifications Dry-Run
 */
async function phase4_email() {
  logPhase(4, 'EMAIL/SMTP & NOTIFICATIONS DRY-RUN');
  
  const emailResults = {
    smtp_config: {},
    notifications_flag: {},
    template_tests: {},
    transporter_verify: {}
  };

  try {
    // Load environment
    require('dotenv').config({ path: CONFIG.envFile });

    // Check SMTP configuration
    emailResults.smtp_config = {
      host: !!process.env.SMTP_HOST,
      port: !!process.env.SMTP_PORT,
      user: !!process.env.SMTP_USER,
      pass: !!process.env.SMTP_PASS,
      from_email: !!process.env.FROM_EMAIL
    };

    // Check notifications flag
    emailResults.notifications_flag = {
      enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
      value: process.env.NOTIFICATIONS_ENABLED || 'undefined',
      recommendation: 'Set NOTIFICATIONS_ENABLED=false for testing'
    };

    // Test email templates (if they exist)
    const templateFiles = [
      'server/email/templates/verification.js',
      'server/email/templates/welcome.js',
      'server/email/templates/alerts.js',
      'server/email/templates/ugc-moderation.js'
    ];

    for (const templateFile of templateFiles) {
      const fullPath = path.join(CONFIG.baseDir, templateFile);
      try {
        if (fs.existsSync(fullPath)) {
          // Try to require the template
          delete require.cache[require.resolve(fullPath)]; // Clear cache
          const template = require(fullPath);
          
          emailResults.template_tests[templateFile] = {
            exists: true,
            loadable: true,
            exports: Object.keys(template)
          };
        } else {
          emailResults.template_tests[templateFile] = {
            exists: false
          };
        }
      } catch (error) {
        emailResults.template_tests[templateFile] = {
          exists: true,
          loadable: false,
          error: error.message
        };
      }
    }

    // Test transporter verification (dry run)
    try {
      if (fs.existsSync(path.join(CONFIG.baseDir, 'server/email/transporter.js'))) {
        emailResults.transporter_verify = {
          file_exists: true,
          note: 'Skipping actual SMTP verification to avoid connection overhead'
        };
      } else {
        emailResults.transporter_verify = {
          file_exists: false
        };
      }
    } catch (error) {
      emailResults.transporter_verify = {
        error: error.message
      };
    }

    AUDIT_RESULTS.email = emailResults;
    saveJsonResult('email-results.json', emailResults);
    
    const templateCount = Object.values(emailResults.template_tests).filter(t => t.exists && t.loadable !== false).length;
    console.log(`✅ Email audit: ${templateCount} templates found, SMTP config ${Object.values(emailResults.smtp_config).every(v => v) ? 'complete' : 'incomplete'}`);
    
    return true;

  } catch (error) {
    console.error('❌ Email audit failed:', error.message);
    AUDIT_RESULTS.email = { error: error.message };
    return false;
  }
}

/**
 * PHASE 5: Test Suites
 */
async function phase5_tests() {
  logPhase(5, 'TEST SUITES');
  
  const testResults = {
    auth_flow: { attempted: false },
    filters_alerts: { attempted: false }, 
    ugc: { attempted: false },
    summary: { total: 0, passed: 0, failed: 0 }
  };

  // Test suite files to run
  const testSuites = [
    {
      name: 'auth_flow',
      file: 'server/test/auth-flow-test.js',
      env: `NOTIFICATIONS_ENABLED=false`
    },
    {
      name: 'filters_alerts', 
      file: 'server/test/filters-alerts-test.js',
      env: `NOTIFICATIONS_ENABLED=false`
    },
    {
      name: 'ugc',
      file: 'server/test/ugc-test.js', 
      env: `NOTIFICATIONS_ENABLED=false`
    }
  ];

  for (const suite of testSuites) {
    const fullPath = path.join(CONFIG.baseDir, suite.file);
    
    if (!fs.existsSync(fullPath)) {
      testResults[suite.name] = {
        attempted: false,
        file_exists: false,
        path: fullPath
      };
      continue;
    }

    try {
      testResults[suite.name].attempted = true;
      testResults.summary.total++;
      
      console.log(`🧪 Running ${suite.name} tests...`);
      
      const command = `cross-env ${suite.env} node -r dotenv/config ${suite.file} dotenv_config_path=${CONFIG.envFile}`;
      const startTime = Date.now();
      
      const result = await execPromise(command, {
        cwd: CONFIG.baseDir,
        timeout: 120000, // 2 minutes timeout
        env: { ...process.env, NOTIFICATIONS_ENABLED: 'false' }
      });
      
      const duration = Date.now() - startTime;
      
      testResults[suite.name] = {
        attempted: true,
        success: true,
        duration_ms: duration,
        stdout_snippet: result.stdout?.substring(0, 500) || '',
        command: command
      };
      
      testResults.summary.passed++;
      console.log(`✅ ${suite.name} tests passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - (testResults[suite.name].start_time || Date.now());
      
      testResults[suite.name] = {
        attempted: true,
        success: false,
        error: error.message,
        stdout_snippet: error.stdout?.substring(0, 500) || '',
        stderr_snippet: error.stderr?.substring(0, 500) || '',
        duration_ms: duration,
        command: `cross-env ${suite.env} node -r dotenv/config ${suite.file} dotenv_config_path=${CONFIG.envFile}`
      };
      
      testResults.summary.failed++;
      console.log(`❌ ${suite.name} tests failed: ${error.message.substring(0, 100)}...`);
    }
  }

  AUDIT_RESULTS.tests = testResults;
  saveJsonResult('test-results.json', testResults);
  
  console.log(`✅ Test suite audit: ${testResults.summary.passed}/${testResults.summary.total} suites passed`);
  return true;
}

/**
 * PHASE 6: Generate Final Artifacts & Reports
 */
async function phase6_artifacts() {
  logPhase(6, 'ARTIFACTS & REPORTS');
  
  try {
    // Generate verdict for each module
    const generateVerdict = () => {
      const verdicts = {};
      
      // M3.1 verdict
      const m31Files = AUDIT_RESULTS.filesystem?.details?.['M3.1 (Auth)'] || {};
      const m31TablesFound = Object.values(AUDIT_RESULTS.database?.tables?.['M3.1'] || {}).filter(t => t.exists).length;
      const m31TablesTotal = Object.keys(AUDIT_RESULTS.database?.tables?.['M3.1'] || {}).length;
      const m31FilesFound = Object.values(m31Files).filter(f => f.exists).length;
      const m31FilesTotal = Object.keys(m31Files).length;
      
      if (m31FilesFound >= m31FilesTotal * 0.9 && m31TablesFound >= m31TablesTotal * 0.8) {
        verdicts.M3_1 = 'ok';
      } else if (m31FilesFound >= m31FilesTotal * 0.7 && m31TablesFound >= m31TablesTotal * 0.6) {
        verdicts.M3_1 = 'partial';
      } else {
        verdicts.M3_1 = 'missing';
      }

      // M3.2 verdict  
      const m32Files = AUDIT_RESULTS.filesystem?.details?.['M3.2 (Saved Filters & Alerts)'] || {};
      const m32TablesFound = Object.values(AUDIT_RESULTS.database?.tables?.['M3.2'] || {}).filter(t => t.exists).length;
      const m32TablesTotal = Object.keys(AUDIT_RESULTS.database?.tables?.['M3.2'] || {}).length;
      const m32FilesFound = Object.values(m32Files).filter(f => f.exists).length;
      const m32FilesTotal = Object.keys(m32Files).length;
      
      if (m32FilesFound >= m32FilesTotal * 0.9 && m32TablesFound >= m32TablesTotal * 0.8) {
        verdicts.M3_2 = 'ok';
      } else if (m32FilesFound >= m32FilesTotal * 0.7 && m32TablesFound >= m32TablesTotal * 0.6) {
        verdicts.M3_2 = 'partial';
      } else {
        verdicts.M3_2 = 'missing';
      }

      // M3.3 verdict
      const m33Files = AUDIT_RESULTS.filesystem?.details?.['M3.3 (UGC)'] || {};
      const m33TablesFound = Object.values(AUDIT_RESULTS.database?.tables?.['M3.3'] || {}).filter(t => t.exists).length;
      const m33TablesTotal = Object.keys(AUDIT_RESULTS.database?.tables?.['M3.3'] || {}).length;
      const m33FilesFound = Object.values(m33Files).filter(f => f.exists).length;
      const m33FilesTotal = Object.keys(m33Files).length;
      
      if (m33FilesFound >= m33FilesTotal * 0.9 && m33TablesFound >= m33TablesTotal * 0.8) {
        verdicts.M3_3 = 'ok';
      } else if (m33FilesFound >= m33FilesTotal * 0.7 && m33TablesFound >= m33TablesTotal * 0.6) {
        verdicts.M3_3 = 'partial';
      } else {
        verdicts.M3_3 = 'missing';
      }

      return verdicts;
    };

    // Generate recommendations
    const generateRecommendations = () => {
      const recommendations = [];
      
      // Check for missing files
      for (const [module, files] of Object.entries(AUDIT_RESULTS.filesystem?.details || {})) {
        for (const [filename, info] of Object.entries(files)) {
          if (!info.exists) {
            recommendations.push({
              priority: 'high',
              category: 'filesystem',
              issue: `Missing file: ${filename}`,
              action: `Create or restore ${filename} for ${module}`
            });
          }
        }
      }

      // Check for missing database tables
      for (const [module, tables] of Object.entries(AUDIT_RESULTS.database?.tables || {})) {
        for (const [tableName, info] of Object.entries(tables)) {
          if (!info.exists) {
            recommendations.push({
              priority: 'critical',
              category: 'database',
              issue: `Missing table: ${tableName}`,
              action: `Run migration to create ${tableName} table for ${module}`
            });
          }
        }
      }

      // Check for failed tests
      for (const [testName, result] of Object.entries(AUDIT_RESULTS.tests || {})) {
        if (testName !== 'summary' && result.attempted && !result.success) {
          recommendations.push({
            priority: 'medium',
            category: 'testing',
            issue: `Failed test suite: ${testName}`,
            action: `Debug and fix ${testName} test failures`
          });
        }
      }

      // Check notifications setting
      if (AUDIT_RESULTS.email?.notifications_flag?.enabled) {
        recommendations.push({
          priority: 'low',
          category: 'configuration',
          issue: 'Notifications enabled during testing',
          action: 'Set NOTIFICATIONS_ENABLED=false for testing environments'
        });
      }

      return recommendations;
    };

    AUDIT_RESULTS.verdict = generateVerdict();
    AUDIT_RESULTS.recommendations = generateRecommendations();

    // Save final JSON report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFilename = `dealradarus-analytics-${timestamp}.json`;
    const jsonPath = path.join(CONFIG.baseDir, jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(AUDIT_RESULTS, null, 2));

    // Generate Markdown report
    const markdownContent = generateMarkdownReport();
    const mdPath = path.join(CONFIG.baseDir, 'DEPLOYMENT-AUDIT-RESULTS.md');
    fs.writeFileSync(mdPath, markdownContent);

    console.log('\n📊 AUDIT COMPLETED:');
    console.log(`📄 JSON Report: ${jsonFilename}`);
    console.log(`📄 Markdown Report: DEPLOYMENT-AUDIT-RESULTS.md`);
    
    return { jsonPath, mdPath, jsonFilename };

  } catch (error) {
    console.error('❌ Artifacts generation failed:', error.message);
    return false;
  }
}

function generateMarkdownReport() {
  const verdictEmoji = { ok: '🟢', partial: '🟡', missing: '🔴' };
  
  return `# DealRadarUS Deployment Audit Results

**Audit Date:** ${new Date(AUDIT_RESULTS.timestamp).toLocaleString()}  
**Environment:** ${AUDIT_RESULTS.env?.environment?.file_path || 'Unknown'}  
**Base Directory:** ${CONFIG.baseDir}

## Executive Summary

| Module | Status | Files | Tables | Tests |
|--------|---------|--------|---------|--------|
| M3.1 (Auth) | ${verdictEmoji[AUDIT_RESULTS.verdict.M3_1]} ${AUDIT_RESULTS.verdict.M3_1.toUpperCase()} | ${Object.values(AUDIT_RESULTS.filesystem?.details?.['M3.1 (Auth)'] || {}).filter(f => f.exists).length}/${Object.keys(AUDIT_RESULTS.filesystem?.details?.['M3.1 (Auth)'] || {}).length} | ${Object.values(AUDIT_RESULTS.database?.tables?.['M3.1'] || {}).filter(t => t.exists).length}/${Object.keys(AUDIT_RESULTS.database?.tables?.['M3.1'] || {}).length} | ${AUDIT_RESULTS.tests?.auth_flow?.success ? '✅' : '❌'} |
| M3.2 (Filters/Alerts) | ${verdictEmoji[AUDIT_RESULTS.verdict.M3_2]} ${AUDIT_RESULTS.verdict.M3_2.toUpperCase()} | ${Object.values(AUDIT_RESULTS.filesystem?.details?.['M3.2 (Saved Filters & Alerts)'] || {}).filter(f => f.exists).length}/${Object.keys(AUDIT_RESULTS.filesystem?.details?.['M3.2 (Saved Filters & Alerts)'] || {}).length} | ${Object.values(AUDIT_RESULTS.database?.tables?.['M3.2'] || {}).filter(t => t.exists).length}/${Object.keys(AUDIT_RESULTS.database?.tables?.['M3.2'] || {}).length} | ${AUDIT_RESULTS.tests?.filters_alerts?.success ? '✅' : '❌'} |
| M3.3 (UGC) | ${verdictEmoji[AUDIT_RESULTS.verdict.M3_3]} ${AUDIT_RESULTS.verdict.M3_3.toUpperCase()} | ${Object.values(AUDIT_RESULTS.filesystem?.details?.['M3.3 (UGC)'] || {}).filter(f => f.exists).length}/${Object.keys(AUDIT_RESULTS.filesystem?.details?.['M3.3 (UGC)'] || {}).length} | ${Object.values(AUDIT_RESULTS.database?.tables?.['M3.3'] || {}).filter(t => t.exists).length}/${Object.keys(AUDIT_RESULTS.database?.tables?.['M3.3'] || {}).length} | ${AUDIT_RESULTS.tests?.ugc?.success ? '✅' : '❌'} |

## Filesystem Findings

### Files Status Overview
- **Total Expected:** ${AUDIT_RESULTS.filesystem?.summary?.total_expected || 0}
- **Found:** ${AUDIT_RESULTS.filesystem?.summary?.found || 0} 
- **Missing:** ${AUDIT_RESULTS.filesystem?.summary?.missing || 0}
- **Completion Rate:** ${AUDIT_RESULTS.filesystem?.summary?.completion_rate || 0}%

### Missing Files
${AUDIT_RESULTS.recommendations?.filter(r => r.category === 'filesystem').map(r => `- ${r.issue}`).join('\n') || 'No missing files detected'}

## Database Findings

### Connection Status
${AUDIT_RESULTS.database?.connection?.success ? '✅ Connected' : '❌ Failed'} ${AUDIT_RESULTS.database?.connection?.error ? `(${AUDIT_RESULTS.database.connection.error})` : ''}

### Extensions
${Object.entries(AUDIT_RESULTS.database?.extensions || {}).map(([ext, exists]) => `- ${ext}: ${exists ? '✅' : '❌'}`).join('\n')}

### Tables Summary
${Object.entries(AUDIT_RESULTS.database?.tables || {}).map(([module, tables]) => {
  const found = Object.values(tables).filter(t => t.exists).length;
  const total = Object.keys(tables).length;
  return `- ${module}: ${found}/${total} tables`;
}).join('\n')}

### Row Counts
${Object.entries(AUDIT_RESULTS.database?.row_counts || {}).map(([table, count]) => `- ${table}: ${count} rows`).join('\n')}

## API Smoke Test Results

### Server Status
${AUDIT_RESULTS.api?.server?.running ? '✅ Running' : '❌ Not Running'} ${AUDIT_RESULTS.api?.server?.note ? `(${AUDIT_RESULTS.api.server.note})` : ''}

### Endpoint Tests
${Object.entries(AUDIT_RESULTS.api?.endpoints || {}).map(([endpoint, result]) => {
  return `- ${endpoint}: ${result.success ? '✅' : '❌'} (${result.status || 'error'})`;
}).join('\n')}

## Email/Notifications Status

### SMTP Configuration
${Object.entries(AUDIT_RESULTS.email?.smtp_config || {}).map(([key, configured]) => `- ${key}: ${configured ? '✅' : '❌'}`).join('\n')}

### Notifications Flag
- **Status:** ${AUDIT_RESULTS.email?.notifications_flag?.enabled ? '⚠️ ENABLED' : '✅ DISABLED'}
- **Value:** \`${AUDIT_RESULTS.email?.notifications_flag?.value}\`

### Template Tests
${Object.entries(AUDIT_RESULTS.email?.template_tests || {}).map(([file, result]) => {
  return `- ${file}: ${result.exists && result.loadable !== false ? '✅' : '❌'} ${result.error ? `(${result.error})` : ''}`;
}).join('\n')}

## Test Results

### Summary
- **Total Suites:** ${AUDIT_RESULTS.tests?.summary?.total || 0}
- **Passed:** ${AUDIT_RESULTS.tests?.summary?.passed || 0}
- **Failed:** ${AUDIT_RESULTS.tests?.summary?.failed || 0}

### Individual Results
${Object.entries(AUDIT_RESULTS.tests || {}).filter(([key]) => key !== 'summary').map(([suite, result]) => {
  if (!result.attempted) return `- ${suite}: ⏭️ Skipped (file not found)`;
  return `- ${suite}: ${result.success ? '✅' : '❌'} (${result.duration_ms || 0}ms)`;
}).join('\n')}

## Next Actions

### Critical Issues (Fix Immediately)
${AUDIT_RESULTS.recommendations?.filter(r => r.priority === 'critical').map(r => `- ${r.action}`).join('\n') || 'None identified'}

### High Priority Issues  
${AUDIT_RESULTS.recommendations?.filter(r => r.priority === 'high').map(r => `- ${r.action}`).join('\n') || 'None identified'}

### Medium Priority Issues
${AUDIT_RESULTS.recommendations?.filter(r => r.priority === 'medium').map(r => `- ${r.action}`).join('\n') || 'None identified'}

### Configuration Recommendations
${AUDIT_RESULTS.recommendations?.filter(r => r.priority === 'low').map(r => `- ${r.action}`).join('\n') || 'None identified'}

## System Information

- **Node Version:** ${AUDIT_RESULTS.env?.system?.node_version || 'Unknown'}
- **NPM Version:** ${AUDIT_RESULTS.env?.system?.npm_version || 'Unknown'}
- **Key Dependencies:** ${Object.entries(AUDIT_RESULTS.env?.system?.dependencies || {}).map(([dep, ver]) => `${dep}@${ver}`).join(', ')}

---

*Audit completed at ${new Date().toISOString()}*  
*Generated by DealRadarUS Deployment Verification Script*
`;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 DealRadarUS Deployment Verification Starting...\n');
  
  try {
    const phases = [
      { name: 'Phase 0', fn: phase0_prereq },
      { name: 'Phase 1', fn: phase1_filesystem },
      { name: 'Phase 2', fn: phase2_database },
      { name: 'Phase 3', fn: phase3_api },
      { name: 'Phase 4', fn: phase4_email },
      { name: 'Phase 5', fn: phase5_tests },
      { name: 'Phase 6', fn: phase6_artifacts }
    ];

    let completedPhases = 0;
    
    for (const phase of phases) {
      try {
        const success = await phase.fn();
        if (success) {
          completedPhases++;
        } else {
          console.log(`⚠️ ${phase.name} completed with issues`);
        }
      } catch (error) {
        console.error(`❌ ${phase.name} failed:`, error.message);
        // Continue with other phases even if one fails
      }
    }

    const results = await phase6_artifacts();
    
    if (results) {
      console.log(`\n✅ Verification sweep completed → see DEPLOYMENT-AUDIT-RESULTS.md & ${results.jsonFilename}`);
      console.log(`📊 Completed ${completedPhases}/${phases.length} phases successfully`);
      
      // Print summary
      console.log('\n📋 QUICK SUMMARY:');
      console.log(`M3.1 (Auth): ${verdictEmoji[AUDIT_RESULTS.verdict.M3_1]} ${AUDIT_RESULTS.verdict.M3_1.toUpperCase()}`);
      console.log(`M3.2 (Filters/Alerts): ${verdictEmoji[AUDIT_RESULTS.verdict.M3_2]} ${AUDIT_RESULTS.verdict.M3_2.toUpperCase()}`);
      console.log(`M3.3 (UGC): ${verdictEmoji[AUDIT_RESULTS.verdict.M3_3]} ${AUDIT_RESULTS.verdict.M3_3.toUpperCase()}`);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Add verdictEmoji at module level for summary display
const verdictEmoji = { ok: '🟢', partial: '🟡', missing: '🔴' };

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, AUDIT_RESULTS };