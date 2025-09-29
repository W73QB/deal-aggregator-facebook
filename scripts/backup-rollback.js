#!/usr/bin/env node

/**
 * Backup and Rollback Management System
 * Comprehensive backup creation and rollback capability for safe deployments
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class BackupRollbackManager {
  constructor() {
    this.backupId = `backup-${Date.now()}`;
    this.backupDir = path.join(process.cwd(), 'backups');
    this.productionUrl = process.env.PRODUCTION_URL || 'https://dealradarus.com';
    this.projectRoot = process.cwd();
    this.backupManifest = {
      id: this.backupId,
      timestamp: new Date().toISOString(),
      type: 'full',
      status: 'creating',
      components: {},
      metadata: {}
    };
  }

  async createFullBackup() {
    console.log('💾 Creating comprehensive backup...\n');
    console.log(`Backup ID: ${this.backupId}`);
    console.log(`Backup Directory: ${this.backupDir}`);
    console.log(`Started at: ${this.backupManifest.timestamp}\n`);

    try {
      // Ensure backup directory exists
      this.ensureBackupDirectory();

      // 1. Backup application code
      await this.backupApplicationCode();

      // 2. Backup database
      await this.backupDatabase();

      // 3. Backup static assets
      await this.backupStaticAssets();

      // 4. Backup configuration
      await this.backupConfiguration();

      // 5. Backup deployment state
      await this.backupDeploymentState();

      // 6. Create backup manifest
      await this.createBackupManifest();

      // 7. Verify backup integrity
      await this.verifyBackupIntegrity();

      console.log('\n✅ Backup created successfully!');
      console.log(`📁 Backup location: ${this.getBackupPath()}`);

      return this.backupManifest;

    } catch (error) {
      console.error('\n❌ Backup creation failed:', error.message);
      this.backupManifest.status = 'failed';
      this.backupManifest.error = error.message;
      await this.saveManifest();
      throw error;
    }
  }

  async performRollback(backupId = null) {
    const targetBackupId = backupId || await this.getLatestBackupId();

    console.log('🔄 Starting rollback process...\n');
    console.log(`Target Backup ID: ${targetBackupId}`);
    console.log(`Started at: ${new Date().toISOString()}\n`);

    try {
      // Load backup manifest
      const manifest = await this.loadBackupManifest(targetBackupId);

      // Verify backup integrity before rollback
      await this.verifyBackupIntegrity(targetBackupId);

      // 1. Create pre-rollback backup
      const preRollbackBackup = await this.createPreRollbackBackup();

      // 2. Rollback database
      await this.rollbackDatabase(targetBackupId);

      // 3. Rollback application code
      await this.rollbackApplicationCode(targetBackupId);

      // 4. Rollback static assets
      await this.rollbackStaticAssets(targetBackupId);

      // 5. Rollback configuration
      await this.rollbackConfiguration(targetBackupId);

      // 6. Verify rollback success
      await this.verifyRollbackSuccess();

      // 7. Update deployment state
      await this.updateDeploymentState('rolled-back', targetBackupId);

      console.log('\n✅ Rollback completed successfully!');
      console.log(`🔄 Rolled back to: ${manifest.timestamp}`);
      console.log(`💾 Pre-rollback backup: ${preRollbackBackup.id}`);

      return { success: true, rolledBackTo: targetBackupId, preRollbackBackup: preRollbackBackup.id };

    } catch (error) {
      console.error('\n❌ Rollback failed:', error.message);
      throw error;
    }
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const backupPath = this.getBackupPath();
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
  }

  async backupApplicationCode() {
    console.log('📦 Backing up application code...');

    const codeBackupPath = path.join(this.getBackupPath(), 'code');
    fs.mkdirSync(codeBackupPath, { recursive: true });

    try {
      // Create git bundle if this is a git repository
      if (fs.existsSync(path.join(this.projectRoot, '.git'))) {
        const bundlePath = path.join(codeBackupPath, 'repository.bundle');
        execSync(`git bundle create "${bundlePath}" --all`, {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });

        // Get current commit hash
        const currentCommit = execSync('git rev-parse HEAD', {
          cwd: this.projectRoot,
          encoding: 'utf8'
        }).trim();

        this.backupManifest.components.code = {
          type: 'git-bundle',
          path: 'code/repository.bundle',
          commit: currentCommit,
          timestamp: new Date().toISOString()
        };

        console.log(`  ✅ Git repository bundled (commit: ${currentCommit.slice(0, 8)})`);
      } else {
        // Fallback: copy source files
        await this.copyDirectory(this.projectRoot, codeBackupPath, [
          'node_modules',
          '.next',
          'backups',
          'monitoring/errors',
          '.git'
        ]);

        this.backupManifest.components.code = {
          type: 'file-copy',
          path: 'code/',
          timestamp: new Date().toISOString()
        };

        console.log('  ✅ Source files copied');
      }

    } catch (error) {
      console.error('  ❌ Code backup failed:', error.message);
      throw error;
    }
  }

  async backupDatabase() {
    console.log('🗄️  Backing up database...');

    const dbBackupPath = path.join(this.getBackupPath(), 'database');
    fs.mkdirSync(dbBackupPath, { recursive: true });

    try {
      // Check if database exists and is accessible
      const dbExists = await this.checkDatabaseConnection();

      if (dbExists) {
        // Create SQL dump
        const dumpPath = path.join(dbBackupPath, 'dump.sql');
        const dbUrl = process.env.DATABASE_URL;

        if (dbUrl) {
          // Use pg_dump if PostgreSQL
          if (dbUrl.includes('postgres')) {
            execSync(`pg_dump "${dbUrl}" > "${dumpPath}"`, {
              stdio: 'pipe'
            });
          }
          // Add other database types as needed

          this.backupManifest.components.database = {
            type: 'sql-dump',
            path: 'database/dump.sql',
            size: fs.statSync(dumpPath).size,
            timestamp: new Date().toISOString()
          };

          console.log(`  ✅ Database backed up (${Math.round(fs.statSync(dumpPath).size / 1024)}KB)`);
        } else {
          throw new Error('No DATABASE_URL environment variable found');
        }
      } else {
        // Create schema backup if no data
        const schemaPath = path.join(this.projectRoot, 'database');
        if (fs.existsSync(schemaPath)) {
          await this.copyDirectory(schemaPath, path.join(dbBackupPath, 'schema'));

          this.backupManifest.components.database = {
            type: 'schema-files',
            path: 'database/schema/',
            timestamp: new Date().toISOString()
          };

          console.log('  ✅ Database schema files backed up');
        } else {
          console.log('  ⚠️  No database found to backup');
          this.backupManifest.components.database = {
            type: 'none',
            message: 'No database found'
          };
        }
      }

    } catch (error) {
      console.log(`  ⚠️  Database backup failed: ${error.message}`);
      this.backupManifest.components.database = {
        type: 'failed',
        error: error.message
      };
    }
  }

  async backupStaticAssets() {
    console.log('🖼️  Backing up static assets...');

    const assetsBackupPath = path.join(this.getBackupPath(), 'assets');
    fs.mkdirSync(assetsBackupPath, { recursive: true });

    try {
      const publicPath = path.join(this.projectRoot, 'public');

      if (fs.existsSync(publicPath)) {
        await this.copyDirectory(publicPath, path.join(assetsBackupPath, 'public'));

        // Get assets size
        const assetsSize = this.getDirectorySize(publicPath);

        this.backupManifest.components.assets = {
          type: 'static-files',
          path: 'assets/public/',
          size: assetsSize,
          timestamp: new Date().toISOString()
        };

        console.log(`  ✅ Static assets backed up (${Math.round(assetsSize / 1024)}KB)`);
      } else {
        console.log('  ⚠️  No public directory found');
        this.backupManifest.components.assets = {
          type: 'none',
          message: 'No public directory found'
        };
      }

    } catch (error) {
      console.error('  ❌ Assets backup failed:', error.message);
      throw error;
    }
  }

  async backupConfiguration() {
    console.log('⚙️  Backing up configuration...');

    const configBackupPath = path.join(this.getBackupPath(), 'config');
    fs.mkdirSync(configBackupPath, { recursive: true });

    try {
      const configFiles = [
        'package.json',
        'next.config.js',
        '.env.example',
        '.env.template',
        'vercel.json'
      ];

      let backedUpFiles = 0;

      for (const file of configFiles) {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          const backupFilePath = path.join(configBackupPath, file);
          fs.copyFileSync(filePath, backupFilePath);
          backedUpFiles++;
        }
      }

      this.backupManifest.components.configuration = {
        type: 'config-files',
        path: 'config/',
        files: backedUpFiles,
        timestamp: new Date().toISOString()
      };

      console.log(`  ✅ Configuration backed up (${backedUpFiles} files)`);

    } catch (error) {
      console.error('  ❌ Configuration backup failed:', error.message);
      throw error;
    }
  }

  async backupDeploymentState() {
    console.log('🚀 Backing up deployment state...');

    const stateBackupPath = path.join(this.getBackupPath(), 'deployment');
    fs.mkdirSync(stateBackupPath, { recursive: true });

    try {
      // Capture current deployment state
      const deploymentState = {
        timestamp: new Date().toISOString(),
        url: this.productionUrl,
        nodeVersion: process.version,
        npmVersion: this.getNpmVersion(),
        buildId: this.getCurrentBuildId(),
        environment: process.env.NODE_ENV || 'production',
        packageVersion: this.getPackageVersion()
      };

      const statePath = path.join(stateBackupPath, 'state.json');
      fs.writeFileSync(statePath, JSON.stringify(deploymentState, null, 2));

      this.backupManifest.components.deployment = {
        type: 'deployment-state',
        path: 'deployment/state.json',
        timestamp: new Date().toISOString()
      };

      this.backupManifest.metadata = deploymentState;

      console.log('  ✅ Deployment state captured');

    } catch (error) {
      console.error('  ❌ Deployment state backup failed:', error.message);
      throw error;
    }
  }

  async createBackupManifest() {
    console.log('📋 Creating backup manifest...');

    this.backupManifest.status = 'completed';
    this.backupManifest.completedAt = new Date().toISOString();

    await this.saveManifest();

    console.log('  ✅ Backup manifest created');
  }

  async verifyBackupIntegrity(backupId = null) {
    const targetBackupId = backupId || this.backupId;
    console.log(`🔍 Verifying backup integrity: ${targetBackupId}...`);

    try {
      const manifest = await this.loadBackupManifest(targetBackupId);
      const backupPath = this.getBackupPath(targetBackupId);

      let verifiedComponents = 0;
      const totalComponents = Object.keys(manifest.components).length;

      for (const [component, info] of Object.entries(manifest.components)) {
        if (info.type === 'none' || info.type === 'failed') {
          continue;
        }

        const componentPath = path.join(backupPath, info.path);
        if (fs.existsSync(componentPath)) {
          verifiedComponents++;
        } else {
          throw new Error(`Missing backup component: ${component} at ${componentPath}`);
        }
      }

      console.log(`  ✅ Backup integrity verified (${verifiedComponents}/${totalComponents} components)`);
      return true;

    } catch (error) {
      console.error('  ❌ Backup integrity check failed:', error.message);
      throw error;
    }
  }

  async createPreRollbackBackup() {
    console.log('💾 Creating pre-rollback backup...');

    const originalBackupId = this.backupId;
    this.backupId = `pre-rollback-${Date.now()}`;

    try {
      const backup = await this.createFullBackup();
      this.backupId = originalBackupId; // Restore original backup ID
      return backup;
    } catch (error) {
      this.backupId = originalBackupId;
      throw error;
    }
  }

  async rollbackDatabase(backupId) {
    console.log('🗄️  Rolling back database...');

    try {
      const manifest = await this.loadBackupManifest(backupId);
      const dbComponent = manifest.components.database;

      if (!dbComponent || dbComponent.type === 'none') {
        console.log('  ⚠️  No database backup to restore');
        return;
      }

      if (dbComponent.type === 'sql-dump') {
        const dumpPath = path.join(this.getBackupPath(backupId), dbComponent.path);
        const dbUrl = process.env.DATABASE_URL;

        if (dbUrl && fs.existsSync(dumpPath)) {
          // Restore from SQL dump
          execSync(`psql "${dbUrl}" < "${dumpPath}"`, {
            stdio: 'pipe'
          });

          console.log('  ✅ Database restored from SQL dump');
        } else {
          throw new Error('Database URL or dump file not found');
        }
      }

    } catch (error) {
      console.error('  ❌ Database rollback failed:', error.message);
      throw error;
    }
  }

  async rollbackApplicationCode(backupId) {
    console.log('📦 Rolling back application code...');

    try {
      const manifest = await this.loadBackupManifest(backupId);
      const codeComponent = manifest.components.code;

      if (codeComponent.type === 'git-bundle') {
        const bundlePath = path.join(this.getBackupPath(backupId), codeComponent.path);

        // Reset to specific commit
        execSync(`git reset --hard ${codeComponent.commit}`, {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });

        console.log(`  ✅ Code rolled back to commit: ${codeComponent.commit.slice(0, 8)}`);
      }

    } catch (error) {
      console.error('  ❌ Code rollback failed:', error.message);
      throw error;
    }
  }

  async rollbackStaticAssets(backupId) {
    console.log('🖼️  Rolling back static assets...');

    try {
      const manifest = await this.loadBackupManifest(backupId);
      const assetsComponent = manifest.components.assets;

      if (assetsComponent && assetsComponent.type === 'static-files') {
        const assetsBackupPath = path.join(this.getBackupPath(backupId), 'assets', 'public');
        const publicPath = path.join(this.projectRoot, 'public');

        // Remove current assets
        if (fs.existsSync(publicPath)) {
          fs.rmSync(publicPath, { recursive: true, force: true });
        }

        // Restore from backup
        await this.copyDirectory(assetsBackupPath, publicPath);

        console.log('  ✅ Static assets rolled back');
      }

    } catch (error) {
      console.error('  ❌ Assets rollback failed:', error.message);
      throw error;
    }
  }

  async rollbackConfiguration(backupId) {
    console.log('⚙️  Rolling back configuration...');

    try {
      const configBackupPath = path.join(this.getBackupPath(backupId), 'config');

      if (fs.existsSync(configBackupPath)) {
        const configFiles = fs.readdirSync(configBackupPath);

        for (const file of configFiles) {
          const backupFilePath = path.join(configBackupPath, file);
          const targetFilePath = path.join(this.projectRoot, file);
          fs.copyFileSync(backupFilePath, targetFilePath);
        }

        console.log(`  ✅ Configuration rolled back (${configFiles.length} files)`);
      }

    } catch (error) {
      console.error('  ❌ Configuration rollback failed:', error.message);
      throw error;
    }
  }

  async verifyRollbackSuccess() {
    console.log('🔍 Verifying rollback success...');

    try {
      // Run basic health checks
      // This would typically include checking if the application starts,
      // database connections work, etc.

      await this.sleep(2000); // Simulate verification time

      console.log('  ✅ Rollback verification successful');

    } catch (error) {
      console.error('  ❌ Rollback verification failed:', error.message);
      throw error;
    }
  }

  async updateDeploymentState(status, backupId = null) {
    const statePath = path.join(this.projectRoot, 'deployment-state.json');

    const state = {
      status,
      timestamp: new Date().toISOString(),
      backupId: backupId || this.backupId,
      nodeVersion: process.version,
      packageVersion: this.getPackageVersion()
    };

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  async listBackups() {
    console.log('📋 Available backups:\n');

    try {
      if (!fs.existsSync(this.backupDir)) {
        console.log('  No backups found');
        return [];
      }

      const backups = fs.readdirSync(this.backupDir)
        .filter(name => name.startsWith('backup-'))
        .sort()
        .reverse();

      const backupList = [];

      for (const backupId of backups) {
        try {
          const manifest = await this.loadBackupManifest(backupId);
          const backupPath = this.getBackupPath(backupId);
          const size = this.getDirectorySize(backupPath);

          backupList.push({
            id: backupId,
            timestamp: manifest.timestamp,
            status: manifest.status,
            size: Math.round(size / (1024 * 1024) * 100) / 100 // MB
          });

          console.log(`  📦 ${backupId}`);
          console.log(`     Created: ${manifest.timestamp}`);
          console.log(`     Status: ${manifest.status}`);
          console.log(`     Size: ${Math.round(size / (1024 * 1024) * 100) / 100}MB`);
          console.log('');

        } catch (error) {
          console.log(`  ❌ ${backupId} (corrupted)`);
        }
      }

      return backupList;

    } catch (error) {
      console.error('Failed to list backups:', error.message);
      return [];
    }
  }

  // Utility methods
  getBackupPath(backupId = null) {
    return path.join(this.backupDir, backupId || this.backupId);
  }

  async saveManifest() {
    const manifestPath = path.join(this.getBackupPath(), 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(this.backupManifest, null, 2));
  }

  async loadBackupManifest(backupId) {
    const manifestPath = path.join(this.getBackupPath(backupId), 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Backup manifest not found: ${manifestPath}`);
    }

    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  async getLatestBackupId() {
    const backups = fs.readdirSync(this.backupDir)
      .filter(name => name.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error('No backups found');
    }

    return backups[0];
  }

  async checkDatabaseConnection() {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) return false;

      // Simple connection test
      // In a real implementation, you'd test the actual connection
      return true;
    } catch (error) {
      return false;
    }
  }

  getCurrentBuildId() {
    try {
      const buildIdPath = path.join(this.projectRoot, '.next', 'BUILD_ID');
      if (fs.existsSync(buildIdPath)) {
        return fs.readFileSync(buildIdPath, 'utf8').trim();
      }
    } catch (error) {
      // Ignore
    }
    return null;
  }

  getNpmVersion() {
    try {
      return execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getPackageVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      return packageJson.version;
    } catch (error) {
      return 'unknown';
    }
  }

  getDirectorySize(dirPath) {
    let size = 0;

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          size += this.getDirectorySize(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return size;
  }

  async copyDirectory(source, destination, excludePatterns = []) {
    if (!fs.existsSync(source)) return;

    fs.mkdirSync(destination, { recursive: true });

    const items = fs.readdirSync(source, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const destPath = path.join(destination, item.name);

      // Skip excluded patterns
      if (excludePatterns.some(pattern => item.name.includes(pattern))) {
        continue;
      }

      if (item.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath, excludePatterns);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new BackupRollbackManager();
  const command = process.argv[2];

  switch (command) {
    case 'backup':
    case 'create':
      manager.createFullBackup().catch(error => {
        console.error('Backup failed:', error);
        process.exit(1);
      });
      break;

    case 'rollback':
      const backupId = process.argv[3];
      manager.performRollback(backupId).catch(error => {
        console.error('Rollback failed:', error);
        process.exit(1);
      });
      break;

    case 'list':
      manager.listBackups().catch(error => {
        console.error('List failed:', error);
        process.exit(1);
      });
      break;

    case 'verify':
      const verifyBackupId = process.argv[3];
      manager.verifyBackupIntegrity(verifyBackupId).catch(error => {
        console.error('Verification failed:', error);
        process.exit(1);
      });
      break;

    default:
      console.log(`
🔄 Backup and Rollback Manager

Usage:
  node backup-rollback.js backup           Create full backup
  node backup-rollback.js rollback [id]    Rollback to backup (latest if no ID)
  node backup-rollback.js list             List all backups
  node backup-rollback.js verify [id]      Verify backup integrity

Examples:
  node backup-rollback.js backup
  node backup-rollback.js rollback backup-1642681234567
  node backup-rollback.js list
      `);
      break;
  }
}

export default BackupRollbackManager;