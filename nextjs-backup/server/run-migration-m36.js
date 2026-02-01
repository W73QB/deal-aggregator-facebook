#!/usr/bin/env node

/**
 * M3.6 Migration Runner
 * Executes the M3.6 notifications schema migration
 */

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env.dealradarus.local') });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Starting M3.6 Notifications migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '2025-08-28-m36-notifications.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Execute migration
    console.log('📊 Executing migration SQL...');
    await pool.query(migrationSQL);
    
    // Verify tables were created
    console.log('✅ Migration executed. Verifying tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('notifications', 'notification_preferences', 'alert_queue', 'webhook_endpoints')
      ORDER BY table_name;
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('📋 Created tables:', tables.rows.map(r => r.table_name));
    
    // Check indexes
    const indexQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('notifications', 'notification_preferences', 'alert_queue', 'webhook_endpoints')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `;
    
    const indexes = await pool.query(indexQuery);
    console.log('🔍 Created indexes:', indexes.rows.length);
    
    // Check views
    const viewQuery = `
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN ('notification_stats', 'alert_queue_health')
      ORDER BY table_name;
    `;
    
    const views = await pool.query(viewQuery);
    console.log('👁️  Created views:', views.rows.map(r => r.table_name));
    
    console.log('\n✅ M3.6 Migration completed successfully!');
    console.log('📈 Schema includes:');
    console.log('   • 4 core tables with proper relationships');
    console.log('   • Performance indexes for queries');
    console.log('   • Monitoring views for observability');
    console.log('   • Triggers for automated timestamps');
    
  } catch (_error) {
    console.error('❌ Migration failed:', _error.message);
    console.error('Details:', _error.detail || _error.hint || '');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };
