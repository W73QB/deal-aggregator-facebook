/**
 * Migration 003 Executor - Saved Filters & Alerts
 * Executes 003_saved_filters.sql against Neon PostgreSQL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.dealradarus.local' });

async function executeMigration003() {
  const client = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    console.log('🔍 DealRadarUS Migration 003 - Saved Filters & Alerts');
    console.log('===================================================\n');
    
    const migrationPath = path.join(__dirname, 'auth/schema/003_saved_filters.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📁 Migration file: ${migrationPath}`);
    console.log(`📏 File size: ${migrationSQL.length} characters\n`);
    
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    console.log('🚀 Executing migration 003...');
    await client.query(migrationSQL);
    console.log('✅ Migration 003 executed successfully\n');

    // Verify new tables
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;");
    console.log(`✅ Total Tables (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => console.log(`   • ${row.table_name}`));

    // Check new indexes specifically for saved_filters and alerts
    const indexesResult = await client.query("SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' AND (indexname LIKE 'idx_%filters%' OR indexname LIKE 'idx_%alerts%' OR indexname LIKE 'idx_%deliveries%') ORDER BY indexname;");
    console.log(`\n✅ New Filter/Alert Indexes (${indexesResult.rows.length}):`);
    indexesResult.rows.forEach(row => console.log(`   • ${row.indexname} (${row.tablename})`));

    // Check functions created
    const functionsResult = await client.query("SELECT proname FROM pg_proc WHERE proname IN ('calculate_next_trigger', 'set_next_trigger_time');");
    console.log(`\n✅ New Functions (${functionsResult.rows.length}):`);
    functionsResult.rows.forEach(row => console.log(`   • ${row.proname}()`));

    // Test the calculate_next_trigger function
    console.log('\n🧪 Testing calculate_next_trigger function:');
    const testResults = await client.query(`
      SELECT 
        'instant' as frequency, calculate_next_trigger('instant') as next_trigger
      UNION ALL
      SELECT 
        'daily' as frequency, calculate_next_trigger('daily') as next_trigger
      UNION ALL
      SELECT 
        'weekly' as frequency, calculate_next_trigger('weekly') as next_trigger
    `);
    testResults.rows.forEach(row => {
      console.log(`   • ${row.frequency}: ${row.next_trigger}`);
    });

    return {
      success: true,
      tables_total: tablesResult.rows.length,
      new_tables: ['saved_filters', 'alerts', 'alert_deliveries'],
      new_indexes: indexesResult.rows.length,
      new_functions: functionsResult.rows.length
    };

  } catch (_error) {
    console.error('❌ Migration 003 failed:', _error.message);
    throw _error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  executeMigration003()
    .then(result => {
      console.log('\n🎉 Migration 003 completed successfully!');
      console.log(`✅ Total tables: ${result.tables_total}`);
      console.log(`✅ New tables: ${result.new_tables.join(', ')}`);
      console.log(`✅ New indexes: ${result.new_indexes}`);
      console.log(`✅ New functions: ${result.new_functions}`);
    })
    .catch(_error => {
      console.error('\n❌ Migration 003 failed');
      process.exit(1);
    });
}

module.exports = { executeMigration003 };
