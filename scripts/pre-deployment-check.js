#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 * Comprehensive checks before production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class PreDeploymentChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      passed: 0,
      failed: 0,
      warnings: 0,
      overallStatus: 'unknown'
    };
  }

  async runAllChecks() {
    console.log('🚀 Starting pre-deployment checklist...\n');

    const checks = [
      { name: 'Environment Variables', fn: this.checkEnvironmentVariables },
      { name: 'Build Process', fn: this.checkBuildProcess },
      { name: 'Test Suite', fn: this.checkTests },
      { name: 'Security Audit', fn: this.checkSecurity },
      { name: 'Performance Benchmarks', fn: this.checkPerformance },
      { name: 'Code Quality', fn: this.checkCodeQuality },
      { name: 'Dependencies', fn: this.checkDependencies },
      { name: 'Database Schema', fn: this.checkDatabaseSchema },
      { name: 'API Endpoints', fn: this.checkApiEndpoints },
      { name: 'Static Assets', fn: this.checkStaticAssets },
      { name: 'SEO Requirements', fn: this.checkSEORequirements },
      { name: 'Accessibility', fn: this.checkAccessibility },
      { name: 'Monitoring Setup', fn: this.checkMonitoring },
      { name: 'Backup Strategy', fn: this.checkBackupStrategy },
      { name: 'Documentation', fn: this.checkDocumentation }
    ];

    for (const check of checks) {
      await this.runCheck(check.name, check.fn.bind(this));
    }

    this.generateReport();
  }

  async runCheck(name, checkFunction) {
    console.log(`🔍 Checking: ${name}...`);

    const result = {
      name,
      status: 'unknown',
      message: '',
      details: [],
      timestamp: new Date().toISOString()
    };

    try {
      const checkResult = await checkFunction();
      result.status = checkResult.status;
      result.message = checkResult.message;
      result.details = checkResult.details || [];

      if (result.status === 'pass') {
        this.results.passed++;
        console.log(`  ✅ ${result.message}`);
      } else if (result.status === 'warning') {
        this.results.warnings++;
        console.log(`  ⚠️  ${result.message}`);
      } else {
        this.results.failed++;
        console.log(`  ❌ ${result.message}`);
      }

    } catch (error) {
      result.status = 'fail';
      result.message = `Check failed: ${error.message}`;
      this.results.failed++;
      console.log(`  ❌ ${result.message}`);
    }

    this.results.checks.push(result);
    console.log('');
  }

  async checkEnvironmentVariables() {
    const requiredVars = [
      'NEXT_PUBLIC_API_URL',
      'DATABASE_URL',
      'NODE_ENV'
    ];

    const missing = [];
    const present = [];

    // Check .env.example for documentation
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (!fs.existsSync(envExamplePath)) {
      return {
        status: 'warning',
        message: '.env.example file missing - consider adding for documentation'
      };
    }

    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        present.push(varName);
      } else if (envExampleContent.includes(varName)) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      return {
        status: 'fail',
        message: `Missing required environment variables: ${missing.join(', ')}`,
        details: missing
      };
    }

    return {
      status: 'pass',
      message: `All required environment variables present (${present.length})`,
      details: present
    };
  }

  async checkBuildProcess() {
    try {
      console.log('    Running build...');
      execSync('npm run build', {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      return {
        status: 'pass',
        message: 'Build completed successfully'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Build failed',
        details: [error.stdout?.toString() || error.message]
      };
    }
  }

  async checkTests() {
    try {
      // Check if test script exists
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      if (!packageJson.scripts || !packageJson.scripts.test) {
        return {
          status: 'warning',
          message: 'No test script defined in package.json'
        };
      }

      console.log('    Running tests...');
      const testOutput = execSync('npm test', {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      return {
        status: 'pass',
        message: 'All tests passed',
        details: [testOutput.toString()]
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Tests failed',
        details: [error.stdout?.toString() || error.message]
      };
    }
  }

  async checkSecurity() {
    try {
      console.log('    Running security audit...');
      const { default: SecurityAuditor } = await import('./security-audit.js');
      const auditor = new SecurityAuditor();

      // Run audit in test mode
      await auditor.runFullAudit();

      return {
        status: 'pass',
        message: 'Security audit passed'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Security audit failed',
        details: [error.message]
      };
    }
  }

  async checkPerformance() {
    // Check if Lighthouse CI or similar is configured
    const lighthouseConfigExists = fs.existsSync(path.join(process.cwd(), 'lighthouse.config.js')) ||
                                  fs.existsSync(path.join(process.cwd(), '.lighthouserc.js'));

    if (lighthouseConfigExists) {
      return {
        status: 'pass',
        message: 'Performance monitoring configured'
      };
    }

    // Check for performance monitoring in code
    const performanceMonitoringExists = fs.existsSync(path.join(process.cwd(), 'lib', 'monitoring'));

    if (performanceMonitoringExists) {
      return {
        status: 'pass',
        message: 'Performance monitoring implemented'
      };
    }

    return {
      status: 'warning',
      message: 'No performance monitoring detected'
    };
  }

  async checkCodeQuality() {
    try {
      // Check for linting
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      if (packageJson.scripts && packageJson.scripts.lint) {
        console.log('    Running linter...');
        execSync('npm run lint', {
          stdio: 'pipe',
          cwd: process.cwd()
        });

        return {
          status: 'pass',
          message: 'Code quality checks passed'
        };
      }

      return {
        status: 'warning',
        message: 'No linting script configured'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Code quality checks failed',
        details: [error.stdout?.toString() || error.message]
      };
    }
  }

  async checkDependencies() {
    try {
      console.log('    Checking for outdated dependencies...');
      const outdatedOutput = execSync('npm outdated --json', {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      const outdated = JSON.parse(outdatedOutput.toString());
      const outdatedCount = Object.keys(outdated).length;

      if (outdatedCount === 0) {
        return {
          status: 'pass',
          message: 'All dependencies up to date'
        };
      }

      return {
        status: 'warning',
        message: `${outdatedCount} outdated dependencies found`,
        details: Object.keys(outdated)
      };
    } catch (error) {
      // npm outdated exits with code 1 when outdated packages exist
      if (error.stdout) {
        try {
          const outdated = JSON.parse(error.stdout.toString());
          const outdatedCount = Object.keys(outdated).length;

          return {
            status: 'warning',
            message: `${outdatedCount} outdated dependencies found`,
            details: Object.keys(outdated)
          };
        } catch (parseError) {
          return {
            status: 'pass',
            message: 'Dependency check completed'
          };
        }
      }

      return {
        status: 'warning',
        message: 'Could not check dependency status'
      };
    }
  }

  async checkDatabaseSchema() {
    const schemaPath = path.join(process.cwd(), 'database');

    if (fs.existsSync(schemaPath)) {
      const schemaFiles = fs.readdirSync(schemaPath).filter(file =>
        file.endsWith('.sql') || file.endsWith('.js')
      );

      if (schemaFiles.length > 0) {
        return {
          status: 'pass',
          message: `Database schema files present (${schemaFiles.length})`,
          details: schemaFiles
        };
      }
    }

    return {
      status: 'warning',
      message: 'No database schema files found'
    };
  }

  async checkApiEndpoints() {
    const apiPath = path.join(process.cwd(), 'pages', 'api');

    if (fs.existsSync(apiPath)) {
      const apiFiles = this.getAllFiles(apiPath, ['.js', '.ts']);

      // Check for basic error handling in API routes
      let routesWithErrorHandling = 0;

      for (const file of apiFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('try') && content.includes('catch')) {
          routesWithErrorHandling++;
        }
      }

      const coverage = Math.round((routesWithErrorHandling / apiFiles.length) * 100);

      if (coverage >= 80) {
        return {
          status: 'pass',
          message: `API endpoints have good error handling coverage (${coverage}%)`,
          details: [`${apiFiles.length} endpoints, ${routesWithErrorHandling} with error handling`]
        };
      }

      return {
        status: 'warning',
        message: `API endpoints need better error handling (${coverage}% coverage)`,
        details: [`${apiFiles.length} endpoints, ${routesWithErrorHandling} with error handling`]
      };
    }

    return {
      status: 'warning',
      message: 'No API endpoints found'
    };
  }

  async checkStaticAssets() {
    const publicPath = path.join(process.cwd(), 'public');

    if (fs.existsSync(publicPath)) {
      const essentialAssets = ['favicon.ico', 'robots.txt'];
      const foundAssets = [];
      const missingAssets = [];

      for (const asset of essentialAssets) {
        if (fs.existsSync(path.join(publicPath, asset))) {
          foundAssets.push(asset);
        } else {
          missingAssets.push(asset);
        }
      }

      if (missingAssets.length === 0) {
        return {
          status: 'pass',
          message: 'All essential static assets present',
          details: foundAssets
        };
      }

      return {
        status: 'warning',
        message: `Missing static assets: ${missingAssets.join(', ')}`,
        details: { found: foundAssets, missing: missingAssets }
      };
    }

    return {
      status: 'fail',
      message: 'Public directory not found'
    };
  }

  async checkSEORequirements() {
    const checks = [];

    // Check for sitemap
    if (fs.existsSync(path.join(process.cwd(), 'public', 'sitemap.xml'))) {
      checks.push('Sitemap present');
    } else {
      checks.push('Sitemap missing');
    }

    // Check for robots.txt
    if (fs.existsSync(path.join(process.cwd(), 'public', 'robots.txt'))) {
      checks.push('Robots.txt present');
    } else {
      checks.push('Robots.txt missing');
    }

    // Check for Schema.org implementation
    const schemaPath = path.join(process.cwd(), 'lib', 'schema');
    if (fs.existsSync(schemaPath)) {
      checks.push('Schema.org implementation found');
    } else {
      checks.push('Schema.org implementation missing');
    }

    const passedChecks = checks.filter(check => !check.includes('missing')).length;
    const totalChecks = checks.length;

    if (passedChecks === totalChecks) {
      return {
        status: 'pass',
        message: 'All SEO requirements met',
        details: checks
      };
    }

    return {
      status: 'warning',
      message: `SEO requirements partially met (${passedChecks}/${totalChecks})`,
      details: checks
    };
  }

  async checkAccessibility() {
    // Check for accessibility implementation
    const a11yIndicators = [
      { path: 'components/Layout.js', content: 'skip-link' },
      { path: 'components/Layout.js', content: 'aria-label' },
      { path: 'components/Layout.js', content: 'role=' }
    ];

    let a11yScore = 0;

    for (const indicator of a11yIndicators) {
      const filePath = path.join(process.cwd(), indicator.path);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(indicator.content)) {
          a11yScore++;
        }
      }
    }

    const percentage = Math.round((a11yScore / a11yIndicators.length) * 100);

    if (percentage >= 80) {
      return {
        status: 'pass',
        message: `Good accessibility implementation (${percentage}%)`,
        details: [`${a11yScore}/${a11yIndicators.length} accessibility features`]
      };
    }

    return {
      status: 'warning',
      message: `Accessibility needs improvement (${percentage}%)`,
      details: [`${a11yScore}/${a11yIndicators.length} accessibility features`]
    };
  }

  async checkMonitoring() {
    const monitoringPath = path.join(process.cwd(), 'lib', 'monitoring');

    if (fs.existsSync(monitoringPath)) {
      const monitoringFiles = fs.readdirSync(monitoringPath);
      return {
        status: 'pass',
        message: `Monitoring system implemented (${monitoringFiles.length} files)`,
        details: monitoringFiles
      };
    }

    return {
      status: 'fail',
      message: 'No monitoring system found'
    };
  }

  async checkBackupStrategy() {
    const backupIndicators = [
      'scripts/backup.js',
      'database/backup.sql',
      '.github/workflows/backup.yml'
    ];

    const foundBackups = backupIndicators.filter(file =>
      fs.existsSync(path.join(process.cwd(), file))
    );

    if (foundBackups.length > 0) {
      return {
        status: 'pass',
        message: `Backup strategy implemented (${foundBackups.length} components)`,
        details: foundBackups
      };
    }

    return {
      status: 'warning',
      message: 'No backup strategy found'
    };
  }

  async checkDocumentation() {
    const docFiles = ['README.md', 'DEPLOYMENT.md', 'API.md'];
    const foundDocs = docFiles.filter(file =>
      fs.existsSync(path.join(process.cwd(), file))
    );

    if (foundDocs.length >= 1) {
      return {
        status: 'pass',
        message: `Documentation present (${foundDocs.length}/${docFiles.length})`,
        details: foundDocs
      };
    }

    return {
      status: 'warning',
      message: 'Minimal documentation found'
    };
  }

  getAllFiles(dirPath, extensions) {
    const files = [];

    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    traverse(dirPath);
    return files;
  }

  generateReport() {
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = Math.round((this.results.passed / total) * 100);

    if (this.results.failed > 0) {
      this.results.overallStatus = 'FAILED';
    } else if (this.results.warnings > 0) {
      this.results.overallStatus = 'PASSED_WITH_WARNINGS';
    } else {
      this.results.overallStatus = 'PASSED';
    }

    console.log('\n🚀 PRE-DEPLOYMENT CHECKLIST REPORT');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log(`Overall Status: ${this.results.overallStatus}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Warnings: ${this.results.warnings}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log('');

    // Show failed checks
    const failedChecks = this.results.checks.filter(check => check.status === 'fail');
    if (failedChecks.length > 0) {
      console.log('❌ FAILED CHECKS:');
      failedChecks.forEach(check => {
        console.log(`  • ${check.name}: ${check.message}`);
      });
      console.log('');
    }

    // Show warnings
    const warningChecks = this.results.checks.filter(check => check.status === 'warning');
    if (warningChecks.length > 0) {
      console.log('⚠️  WARNINGS:');
      warningChecks.forEach(check => {
        console.log(`  • ${check.name}: ${check.message}`);
      });
      console.log('');
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'monitoring', 'pre-deployment-report.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);

    // Deployment recommendation
    if (this.results.overallStatus === 'PASSED') {
      console.log('\n✅ READY FOR DEPLOYMENT');
      console.log('All checks passed. Safe to deploy to production.');
    } else if (this.results.overallStatus === 'PASSED_WITH_WARNINGS') {
      console.log('\n⚠️  DEPLOY WITH CAUTION');
      console.log('Deployment possible but warnings should be addressed.');
    } else {
      console.log('\n❌ NOT READY FOR DEPLOYMENT');
      console.log('Critical issues must be resolved before deployment.');
      process.exit(1);
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreDeploymentChecker();
  checker.runAllChecks().catch(error => {
    console.error('Pre-deployment check failed:', error);
    process.exit(1);
  });
}

export default PreDeploymentChecker;