#!/usr/bin/env node

/**
 * M3.7 Performance Indexes Migration Runner
 * Executes the performance optimization database migration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.dealradarus.local' });
const { Pool } = require('pg');

// Database connection using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🔍 M3.7 Performance & Caching - Database Indexes Migration');
    console.log('=====================================================');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'server', 'migrations', '2025-08-28-m37-performance-indexes-simple.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📁 Migration file: ${migrationPath}`);
    console.log(`📏 File size: ${migrationSQL.length} characters\n`);
    
    // Connect to database
    console.log('✅ Connecting to PostgreSQL...');
    const client = await pool.connect();
    
    try {
      console.log('🚀 Executing M3.7 performance indexes migration...\n');
      
      // Execute the migration
      await client.query(migrationSQL);
      
      // Verify indexes were created
      const indexQuery = `
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (indexname LIKE 'idx_%reviews%' 
             OR indexname LIKE 'idx_%comments%' 
             OR indexname LIKE 'idx_%reports%'
             OR indexname LIKE 'idx_%notifications%'
             OR indexname LIKE 'idx_%alert%'
             OR indexname LIKE 'idx_%users%')
        ORDER BY tablename, indexname;
      `;
      
      const result = await client.query(indexQuery);
      
      console.log('✅ M3.7 migration executed successfully!\n');
      console.log(`✅ Performance indexes created: ${result.rows.length}\n`);
      
      // Group by table for better display
      const indexesByTable = {};
      result.rows.forEach(row => {
        if (!indexesByTable[row.tablename]) {
          indexesByTable[row.tablename] = [];
        }
        indexesByTable[row.tablename].push(row.indexname);
      });
      
      Object.keys(indexesByTable).sort().forEach(tablename => {
        console.log(`📊 ${tablename} (${indexesByTable[tablename].length} indexes):`);
        indexesByTable[tablename].forEach(indexname => {
          console.log(`   • ${indexname}`);
        });
        console.log('');
      });
      
      console.log('🎉 M3.7 Database optimization completed successfully!');
      console.log('✅ All performance indexes are now active');
      console.log('✅ Query performance should be significantly improved');
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();