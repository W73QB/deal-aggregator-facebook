/**
 * Generic SQL File Executor
 * Executes SQL queries from file and outputs JSON results
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.dealradarus.local' });

async function runSqlFile(sqlFilePath) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not found in .env.dealradarus.local');
  }

  if (!sqlFilePath) {
    throw new Error('Usage: node server/run-sql.js <path-to-sql-file>');
  }

  const fullPath = path.resolve(sqlFilePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`SQL file not found: ${fullPath}`);
  }

  console.log(`📄 SQL File: ${fullPath}`);
  console.log(`🔗 Database: ${url.split('@')[1]?.split('?')[0] || 'Neon PostgreSQL'}\n`);

  const sqlContent = fs.readFileSync(fullPath, 'utf8');
  const queries = sqlContent
    .split(';')
    .map(q => q.trim())
    .filter(q => q && !q.startsWith('--'));

  console.log(`📋 Found ${queries.length} queries to execute\n`);

  const client = new Client({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    const results = [];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`🔍 Query ${i + 1}: ${query.substring(0, 60)}${query.length > 60 ? '...' : ''}`);
      
      try {
        const result = await client.query(query);
        const queryResult = {
          query_number: i + 1,
          query: query,
          row_count: result.rowCount,
          rows: result.rows
        };
        
        results.push(queryResult);
        console.log(`✅ Result: ${result.rowCount} row(s)`);
        
        // Pretty print first few rows
        if (result.rows.length > 0) {
          console.log('📊 Sample data:');
          result.rows.slice(0, 3).forEach((row, idx) => {
            console.log(`   ${idx + 1}: ${JSON.stringify(row)}`);
          });
        }
        console.log('');

      } catch (error) {
        console.error(`❌ Query ${i + 1} failed: ${error.message}`);
        results.push({
          query_number: i + 1,
          query: query,
          error: error.message
        });
      }
    }

    const output = {
      timestamp: new Date().toISOString(),
      sql_file: fullPath,
      database_url: url.split('@')[1]?.split('?')[0] || 'Unknown',
      queries_executed: queries.length,
      results: results
    };

    console.log('📋 Final Results JSON:');
    console.log('======================');
    console.log(JSON.stringify(output, null, 2));

    return output;

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Execute from command line
if (require.main === module) {
  const sqlFile = process.argv[2];
  runSqlFile(sqlFile)
    .then(() => {
      console.log('\n🎉 SQL execution completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 SQL execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runSqlFile };