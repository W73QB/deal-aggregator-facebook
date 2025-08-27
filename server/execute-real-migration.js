/**
 * Real Database Migration Executor
 * Executes 001_users.sql against Neon PostgreSQL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = "postgres://neondb_owner:npg_3qb0XYBhGgAn@ep-old-lake-a1dal75m.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function executeMigration() {
  const client = new Client({ connectionString: DB_URL });
  
  try {
    console.log('🔍 DealRadarUS Real Migration Execution');
    console.log('======================================\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'auth/schema/001_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📁 Migration file: ${migrationPath}`);
    console.log(`📏 File size: ${migrationSQL.length} characters\n`);
    
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    console.log('🚀 Executing migration SQL...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully\n');

    // Verify results
    console.log('🔍 Post-migration verification:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check extensions
    const extensionsResult = await client.query("SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto','citext') ORDER BY extname;");
    console.log(`✅ Extensions (${extensionsResult.rows.length}):`);
    extensionsResult.rows.forEach(row => console.log(`   • ${row.extname}`));

    // Check tables
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;");
    console.log(`\n✅ Tables (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => console.log(`   • ${row.table_name}`));

    // Check indexes
    const indexesResult = await client.query("SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' ORDER BY indexname;");
    console.log(`\n✅ Indexes (${indexesResult.rows.length}):`);
    indexesResult.rows.forEach(row => console.log(`   • ${row.indexname} (${row.tablename})`));

    return {
      success: true,
      extensions: extensionsResult.rows.map(r => r.extname),
      tables: tablesResult.rows.map(r => r.table_name),
      indexes: indexesResult.rows.map(r => ({name: r.indexname, table: r.tablename}))
    };

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// Execute migration
if (require.main === module) {
  executeMigration().then(result => {
    if (result.success) {
      console.log('\n🎉 Migration completed successfully!');
      console.log(`✅ ${result.extensions.length} extensions installed`);
      console.log(`✅ ${result.tables.length} tables created`);
      console.log(`✅ ${result.indexes.length} indexes created`);
    } else {
      console.log('\n❌ Migration failed');
      process.exit(1);
    }
  });
}

module.exports = { executeMigration };