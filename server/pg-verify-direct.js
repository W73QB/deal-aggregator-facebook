/**
 * Direct PostgreSQL Connection and Verification
 * Uses pg library to execute verification queries directly
 */

const { Client } = require('pg');

const DB_URL = "postgres://neondb_owner:npg_3qb0XYBhGgAn@ep-old-lake-a1dal75m.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function executeVerificationQueries() {
  const client = new Client({ connectionString: DB_URL });
  
  try {
    console.log('🔍 DealRadarUS Database Verification');
    console.log('====================================\n');
    
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    // Query 1: PostgreSQL Version
    console.log('1️⃣ SELECT version();');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const versionResult = await client.query('SELECT version();');
    console.log(`✅ ${versionResult.rows[0].version}\n`);

    // Query 2: Database Context
    console.log('2️⃣ SELECT current_database(), current_user, now();');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const contextResult = await client.query('SELECT current_database(), current_user, now();');
    const context = contextResult.rows[0];
    console.log(`✅ Database: ${context.current_database}`);
    console.log(`✅ User: ${context.current_user}`);
    console.log(`✅ Timestamp: ${context.now}\n`);

    // Query 3: Public Tables
    console.log('3️⃣ SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\' AND table_type=\'BASE TABLE\' ORDER BY table_name;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;");
    if (tablesResult.rows.length > 0) {
      console.log(`✅ Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => console.log(`   • ${row.table_name}`));
    } else {
      console.log('❌ No tables found');
    }
    console.log('');

    // Query 4: Extensions
    console.log('4️⃣ SELECT extname FROM pg_extension WHERE extname IN (\'pgcrypto\',\'citext\') ORDER BY extname;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const extensionsResult = await client.query("SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto','citext') ORDER BY extname;");
    if (extensionsResult.rows.length > 0) {
      console.log(`✅ Found ${extensionsResult.rows.length} extensions:`);
      extensionsResult.rows.forEach(row => console.log(`   • ${row.extname}`));
    } else {
      console.log('❌ Required extensions not found');
    }

    return {
      success: true,
      results: {
        version: versionResult.rows[0].version,
        context: context,
        tables: tablesResult.rows.map(r => r.table_name),
        extensions: extensionsResult.rows.map(r => r.extname)
      }
    };

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// Execute verification
if (require.main === module) {
  executeVerificationQueries().then(result => {
    if (result.success) {
      console.log('\n✅ Database verification completed successfully');
    } else {
      console.log('\n❌ Database verification failed');
      process.exit(1);
    }
  });
}

module.exports = { executeVerificationQueries };