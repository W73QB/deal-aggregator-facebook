/**
 * Migration 002 Executor - Audit Logging Tables
 * Executes 002_audit_logging.sql against Neon PostgreSQL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.dealradarus.local' });

async function executeMigration002() {
  const client = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    console.log('🔍 DealRadarUS Migration 002 - Audit Logging');
    console.log('============================================\n');
    
    const migrationPath = path.join(__dirname, 'auth/schema/002_audit_logging.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📁 Migration file: ${migrationPath}`);
    console.log(`📏 File size: ${migrationSQL.length} characters\n`);
    
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    console.log('🚀 Executing migration 002...');
    await client.query(migrationSQL);
    console.log('✅ Migration 002 executed successfully\n');

    // Verify new tables
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;");
    console.log(`✅ Total Tables (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => console.log(`   • ${row.table_name}`));

    // Check new indexes
    const indexesResult = await client.query("SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'idx_%audit%' OR indexname LIKE 'idx_%email_events%' ORDER BY indexname;");
    console.log(`\n✅ New Audit Indexes (${indexesResult.rows.length}):`);
    indexesResult.rows.forEach(row => console.log(`   • ${row.indexname} (${row.tablename})`));

    return {
      success: true,
      tables_total: tablesResult.rows.length,
      new_tables: ['email_events', 'auth_audit'],
      new_indexes: indexesResult.rows.length
    };

  } catch (_error) {
    console.error('❌ Migration 002 failed:', _error.message);
    throw _error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  executeMigration002()
    .then(result => {
      console.log('\n🎉 Migration 002 completed successfully!');
      console.log(`✅ Total tables: ${result.tables_total}`);
      console.log(`✅ New audit tables: ${result.new_tables.join(', ')}`);
    })
    .catch(_error => {
      console.error('\n❌ Migration 002 failed');
      process.exit(1);
    });
}

module.exports = { executeMigration002 };
