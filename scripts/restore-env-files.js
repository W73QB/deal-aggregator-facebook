#!/usr/bin/env node

/**
 * 🔧 DealRadarUS .ENV File Restoration Script
 * ============================================
 * 
 * This script helps recover .env files from backups when they are accidentally lost.
 * It provides multiple restoration options and safety checks.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 DealRadarUS .ENV File Restoration Tool');
console.log('=========================================\n');

const BACKUP_DIR = '.env-backups';
const PROJECT_ROOT = process.cwd();

// ==============================================
// 1. FIND AVAILABLE BACKUPS
// ==============================================
function findAvailableBackups() {
  const backupPath = path.join(PROJECT_ROOT, BACKUP_DIR);
  
  if (!fs.existsSync(backupPath)) {
    console.log('❌ No backup directory found');
    return [];
  }
  
  const backups = fs.readdirSync(backupPath)
    .filter(dir => fs.statSync(path.join(backupPath, dir)).isDirectory())
    .sort()
    .reverse(); // Most recent first
  
  return backups;
}

// ==============================================
// 2. LIST BACKUP CONTENTS
// ==============================================
function listBackupContents(backupName) {
  const backupPath = path.join(PROJECT_ROOT, BACKUP_DIR, backupName);
  
  if (!fs.existsSync(backupPath)) {
    return [];
  }
  
  return fs.readdirSync(backupPath)
    .filter(file => file.includes('.env') && !file.includes('.template'))
    .map(file => ({
      name: file,
      path: path.join(backupPath, file),
      size: fs.statSync(path.join(backupPath, file)).size,
      modified: fs.statSync(path.join(backupPath, file)).mtime
    }));
}

// ==============================================
// 3. RESTORE SINGLE FILE
// ==============================================
function restoreFile(sourcePath, targetPath) {
  try {
    // Create target directory if needed
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy file with backup of existing
    if (fs.existsSync(targetPath)) {
      const backupName = `${targetPath}.backup-${Date.now()}`;
      fs.copyFileSync(targetPath, backupName);
      console.log(`   📦 Existing file backed up to: ${backupName}`);
    }
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`   ✅ Restored: ${targetPath}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed to restore ${targetPath}: ${error.message}`);
    return false;
  }
}

// ==============================================
// 4. INTERACTIVE RESTORATION
// ==============================================
function interactiveRestore() {
  const backups = findAvailableBackups();
  
  if (backups.length === 0) {
    console.log('❌ No backups available for restoration');
    console.log('💡 Backups are created automatically before each git commit');
    return;
  }
  
  console.log(`📂 Found ${backups.length} backup(s):`);
  backups.forEach((backup, index) => {
    const files = listBackupContents(backup);
    console.log(`   ${index + 1}. ${backup} (${files.length} files)`);
    files.forEach(file => {
      console.log(`      - ${file.name} (${Math.round(file.size/1024)}KB)`);
    });
  });
  
  console.log('\n🔧 Restoration Options:');
  console.log('   1. Restore latest backup (recommended)');
  console.log('   2. Choose specific backup');
  console.log('   3. List all backup contents');
  console.log('   4. Exit');
  
  // For automation, restore latest by default
  if (process.argv.includes('--auto')) {
    console.log('🤖 Auto-restoring latest backup...');
    restoreLatestBackup();
    return;
  }
  
  console.log('\n💡 Run with --auto flag to automatically restore latest backup');
  console.log('💡 Manual selection requires interactive terminal');
}

// ==============================================
// 5. RESTORE LATEST BACKUP
// ==============================================
function restoreLatestBackup() {
  const backups = findAvailableBackups();
  
  if (backups.length === 0) {
    console.log('❌ No backups available');
    return false;
  }
  
  const latestBackup = backups[0];
  const files = listBackupContents(latestBackup);
  
  console.log(`🚀 Restoring from backup: ${latestBackup}`);
  console.log(`📂 Found ${files.length} .env file(s) to restore:`);
  
  let successCount = 0;
  
  files.forEach(file => {
    console.log(`   🔄 Restoring ${file.name}...`);
    
    // Determine target path
    let targetPath;
    if (file.name.startsWith('config/')) {
      targetPath = path.join(PROJECT_ROOT, file.name);
    } else {
      targetPath = path.join(PROJECT_ROOT, file.name);
    }
    
    if (restoreFile(file.path, targetPath)) {
      successCount++;
    }
  });
  
  console.log(`\n✅ Restoration complete: ${successCount}/${files.length} files restored`);
  
  if (successCount > 0) {
    console.log('🛡️  Restored files are protected by git hooks and .gitignore');
    console.log('💡 Your secrets are safe and will not be committed to git');
  }
  
  return successCount > 0;
}

// ==============================================
// 6. MAIN EXECUTION
// ==============================================
function main() {
  // Check if we're in the right directory
  if (!fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))) {
    console.log('❌ Please run this script from the project root directory');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node scripts/restore-env-files.js          # Interactive mode');  
    console.log('  node scripts/restore-env-files.js --auto   # Restore latest automatically');
    console.log('  node scripts/restore-env-files.js --list   # List all backups');
    return;
  }
  
  if (args.includes('--list')) {
    const backups = findAvailableBackups();
    backups.forEach(backup => {
      const files = listBackupContents(backup);
      console.log(`📂 ${backup}:`);
      files.forEach(file => {
        console.log(`   ${file.name} - ${new Date(file.modified).toLocaleString()}`);
      });
    });
    return;
  }
  
  if (args.includes('--auto')) {
    restoreLatestBackup();
    return;
  }
  
  // Default: interactive mode
  interactiveRestore();
}

// ==============================================
// RUN SCRIPT
// ==============================================
if (require.main === module) {
  main();
}

module.exports = {
  findAvailableBackups,
  listBackupContents,
  restoreLatestBackup,
  restoreFile
};