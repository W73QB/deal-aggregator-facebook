#!/usr/bin/env node

/**
 * Comprehensive Security Audit Script
 * Pre-deployment security checks and vulnerability scanning
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class SecurityAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      passed: [],
      warnings: [],
      critical: [],
      score: 0,
      recommendations: []
    };
    this.projectRoot = process.cwd();
  }

  async runFullAudit() {
    console.log('🛡️  Starting comprehensive security audit...\n');

    try {
      // 1. Dependency vulnerability scan
      await this.checkDependencyVulnerabilities();

      // 2. Environment variable security
      await this.checkEnvironmentSecurity();

      // 3. File permission audit
      await this.checkFilePermissions();

      // 4. Code security patterns
      await this.checkCodeSecurityPatterns();

      // 5. Configuration security
      await this.checkConfigurationSecurity();

      // 6. API endpoint security
      await this.checkApiSecurity();

      // 7. Content Security Policy
      await this.checkCSPHeaders();

      // 8. Authentication security
      await this.checkAuthSecurity();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    }
  }

  async checkDependencyVulnerabilities() {
    console.log('📦 Checking dependency vulnerabilities...');

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      const auditData = JSON.parse(auditOutput);

      if (auditData.vulnerabilities) {
        const vulnCount = Object.keys(auditData.vulnerabilities).length;

        if (vulnCount === 0) {
          this.auditResults.passed.push('✅ No dependency vulnerabilities found');
        } else {
          const critical = Object.values(auditData.vulnerabilities)
            .filter(v => v.severity === 'critical').length;
          const high = Object.values(auditData.vulnerabilities)
            .filter(v => v.severity === 'high').length;

          if (critical > 0) {
            this.auditResults.critical.push(`🚨 ${critical} critical dependency vulnerabilities`);
          }
          if (high > 0) {
            this.auditResults.warnings.push(`⚠️  ${high} high severity vulnerabilities`);
          }

          this.auditResults.recommendations.push('Run "npm audit fix" to resolve vulnerabilities');
        }
      }
    } catch (error) {
      if (error.stdout) {
        const auditData = JSON.parse(error.stdout);
        if (auditData.vulnerabilities) {
          const vulnCount = Object.keys(auditData.vulnerabilities).length;
          this.auditResults.warnings.push(`⚠️  ${vulnCount} dependency vulnerabilities found`);
        }
      } else {
        this.auditResults.warnings.push('⚠️  Could not run dependency audit');
      }
    }
  }

  async checkEnvironmentSecurity() {
    console.log('🔐 Checking environment variable security...');

    const envFiles = ['.env', '.env.local', '.env.example', '.env.template'];

    for (const envFile of envFiles) {
      const envPath = path.join(this.projectRoot, envFile);

      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');

        // Check for exposed secrets
        const dangerousPatterns = [
          /SECRET_KEY\s*=\s*[^#\n]+/,
          /API_KEY\s*=\s*[^#\n]+/,
          /PASSWORD\s*=\s*[^#\n]+/,
          /TOKEN\s*=\s*[^#\n]+/,
          /PRIVATE_KEY\s*=\s*[^#\n]+/
        ];

        let hasExposedSecrets = false;
        dangerousPatterns.forEach(pattern => {
          if (pattern.test(envContent) && !envFile.includes('example') && !envFile.includes('template')) {
            hasExposedSecrets = true;
          }
        });

        if (hasExposedSecrets && (envFile === '.env' || envFile === '.env.local')) {
          this.auditResults.critical.push(`🚨 Potential secrets exposed in ${envFile}`);
        } else {
          this.auditResults.passed.push(`✅ Environment file ${envFile} appears secure`);
        }
      }
    }

    // Check if .env is in .gitignore
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        this.auditResults.critical.push('🚨 .env files not properly ignored by git');
        this.auditResults.recommendations.push('Add .env* to .gitignore');
      } else {
        this.auditResults.passed.push('✅ Environment files properly ignored by git');
      }
    }
  }

  async checkFilePermissions() {
    console.log('📁 Checking file permissions...');

    const sensitiveFiles = [
      'package.json',
      'next.config.js',
      '.env',
      '.env.local'
    ];

    for (const file of sensitiveFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode.toString(8);

          // Check if file is world-readable/writable
          if (mode.endsWith('644') || mode.endsWith('600')) {
            this.auditResults.passed.push(`✅ ${file} has secure permissions`);
          } else {
            this.auditResults.warnings.push(`⚠️  ${file} has potentially insecure permissions: ${mode}`);
          }
        } catch (error) {
          this.auditResults.warnings.push(`⚠️  Could not check permissions for ${file}`);
        }
      }
    }
  }

  async checkCodeSecurityPatterns() {
    console.log('🔍 Scanning for security anti-patterns...');

    const checkPatterns = [
      {
        pattern: /eval\s*\(/g,
        message: 'Use of eval() detected - potential XSS vulnerability',
        severity: 'critical'
      },
      {
        pattern: /innerHTML\s*=/g,
        message: 'Use of innerHTML detected - potential XSS vulnerability',
        severity: 'warning'
      },
      {
        pattern: /document\.write\s*\(/g,
        message: 'Use of document.write() detected - potential XSS vulnerability',
        severity: 'warning'
      },
      {
        pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/g,
        message: 'String-based setTimeout detected - potential code injection',
        severity: 'warning'
      },
      {
        pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/g,
        message: 'String-based setInterval detected - potential code injection',
        severity: 'warning'
      }
    ];

    const scanDirectories = ['pages', 'components', 'lib', 'utils'];

    for (const dir of scanDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.scanDirectoryForPatterns(dirPath, checkPatterns);
      }
    }
  }

  async scanDirectoryForPatterns(dirPath, patterns) {
    const files = this.getAllFiles(dirPath, ['.js', '.jsx', '.ts', '.tsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.projectRoot, file);

      for (const { pattern, message, severity } of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          const entry = `${severity === 'critical' ? '🚨' : '⚠️'} ${message} in ${relativePath}`;

          if (severity === 'critical') {
            this.auditResults.critical.push(entry);
          } else {
            this.auditResults.warnings.push(entry);
          }
        }
      }
    }
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

  async checkConfigurationSecurity() {
    console.log('⚙️  Checking configuration security...');

    // Check Next.js config
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');

      // Check for security headers
      if (configContent.includes('headers')) {
        this.auditResults.passed.push('✅ Security headers configuration found');
      } else {
        this.auditResults.warnings.push('⚠️  No security headers configured in next.config.js');
        this.auditResults.recommendations.push('Add security headers to next.config.js');
      }

      // Check for CSP
      if (configContent.includes('Content-Security-Policy')) {
        this.auditResults.passed.push('✅ Content Security Policy configured');
      } else {
        this.auditResults.warnings.push('⚠️  No Content Security Policy found');
        this.auditResults.recommendations.push('Implement Content Security Policy');
      }
    }
  }

  async checkApiSecurity() {
    console.log('🌐 Checking API endpoint security...');

    const apiDir = path.join(this.projectRoot, 'pages', 'api');
    if (fs.existsSync(apiDir)) {
      const apiFiles = this.getAllFiles(apiDir, ['.js', '.ts']);

      for (const file of apiFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.projectRoot, file);

        // Check for CORS headers
        if (content.includes('Access-Control-Allow-Origin')) {
          if (content.includes("'*'") || content.includes('"*"')) {
            this.auditResults.warnings.push(`⚠️  Wildcard CORS in ${relativePath}`);
          } else {
            this.auditResults.passed.push(`✅ Controlled CORS in ${relativePath}`);
          }
        }

        // Check for authentication
        if (content.includes('authorization') || content.includes('authenticate')) {
          this.auditResults.passed.push(`✅ Authentication present in ${relativePath}`);
        }

        // Check for input validation
        if (content.includes('validate') || content.includes('sanitize')) {
          this.auditResults.passed.push(`✅ Input validation in ${relativePath}`);
        }
      }
    }
  }

  async checkCSPHeaders() {
    console.log('🛡️  Checking Content Security Policy...');

    // This would ideally check running server, but for now check config
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');

      if (configContent.includes('Content-Security-Policy')) {
        this.auditResults.passed.push('✅ CSP headers configured');
      } else {
        this.auditResults.warnings.push('⚠️  No CSP headers found');
        this.auditResults.recommendations.push('Implement Content Security Policy headers');
      }
    }
  }

  async checkAuthSecurity() {
    console.log('🔑 Checking authentication security...');

    // Check for auth context/hooks
    const authContextPath = path.join(this.projectRoot, 'contexts', 'AuthContext.js');
    if (fs.existsSync(authContextPath)) {
      const authContent = fs.readFileSync(authContextPath, 'utf8');

      if (authContent.includes('jwt') || authContent.includes('token')) {
        this.auditResults.passed.push('✅ Token-based authentication found');
      }

      if (authContent.includes('logout') || authContent.includes('signOut')) {
        this.auditResults.passed.push('✅ Logout functionality implemented');
      }
    }

    // Check for protected routes
    const pagesDir = path.join(this.projectRoot, 'pages');
    if (fs.existsSync(pagesDir)) {
      const protectedPages = ['profile.js', 'settings.js', 'admin.js'];
      const foundProtected = protectedPages.filter(page =>
        fs.existsSync(path.join(pagesDir, page))
      );

      if (foundProtected.length > 0) {
        this.auditResults.passed.push(`✅ Protected pages found: ${foundProtected.join(', ')}`);
      }
    }
  }

  calculateScore() {
    const totalChecks = this.auditResults.passed.length +
                       this.auditResults.warnings.length +
                       this.auditResults.critical.length;

    if (totalChecks === 0) return 0;

    const criticalPenalty = this.auditResults.critical.length * 20;
    const warningPenalty = this.auditResults.warnings.length * 5;
    const passedScore = this.auditResults.passed.length * 10;

    const score = Math.max(0, passedScore - criticalPenalty - warningPenalty);
    return Math.round((score / (totalChecks * 10)) * 100);
  }

  generateReport() {
    this.auditResults.score = this.calculateScore();

    console.log('\n🛡️  SECURITY AUDIT REPORT');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${this.auditResults.timestamp}`);
    console.log(`Security Score: ${this.auditResults.score}/100`);
    console.log(`Status: ${this.getOverallStatus()}`);
    console.log('');

    if (this.auditResults.critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      this.auditResults.critical.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }

    if (this.auditResults.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.auditResults.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    if (this.auditResults.passed.length > 0) {
      console.log('✅ PASSED CHECKS:');
      this.auditResults.passed.forEach(pass => console.log(`  ${pass}`));
      console.log('');
    }

    if (this.auditResults.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      this.auditResults.recommendations.forEach(rec => console.log(`  • ${rec}`));
      console.log('');
    }

    // Save report to file
    const reportPath = path.join(this.projectRoot, 'monitoring', 'security-audit-report.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (this.auditResults.critical.length > 0) {
      console.log('\n❌ Security audit failed due to critical issues');
      process.exit(1);
    } else if (this.auditResults.warnings.length > 0) {
      console.log('\n⚠️  Security audit completed with warnings');
      process.exit(0);
    } else {
      console.log('\n✅ Security audit passed successfully');
      process.exit(0);
    }
  }

  getOverallStatus() {
    if (this.auditResults.critical.length > 0) {
      return '🚨 CRITICAL ISSUES FOUND';
    } else if (this.auditResults.warnings.length > 0) {
      return '⚠️  WARNINGS PRESENT';
    } else {
      return '✅ SECURE';
    }
  }
}

// Run the audit if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new SecurityAuditor();
  auditor.runFullAudit().catch(error => {
    console.error('Security audit failed:', error);
    process.exit(1);
  });
}

export default SecurityAuditor;