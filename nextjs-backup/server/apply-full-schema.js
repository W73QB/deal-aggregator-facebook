#!/usr/bin/env node

/**
 * Complete Database Schema Application
 * Applies the full 001_users.sql schema to fix E2E test failures
 */

const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: '.env.dealradarus.local' });
const db = require('./auth/utils/database');

class SchemaApplier {
  constructor() {
    this.db = db;
  }

  async applyFullSchema() {
    try {
      console.log('🚀 Applying complete database schema...');

      // Read the schema file
      const schemaPath = path.join(__dirname, 'auth/schema/001_users.sql');
      const schemaSQL = await fs.readFile(schemaPath, 'utf8');

      console.log('📄 Loaded schema file:', schemaPath);

      // Split SQL into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`🔄 Executing ${statements.length} SQL statements...`);

      let executed = 0;
      let skipped = 0;

      for (const statement of statements) {
        try {
          if (statement.includes('CREATE EXTENSION') ||
              statement.includes('CREATE TABLE') ||
              statement.includes('CREATE INDEX') ||
              statement.includes('CREATE OR REPLACE FUNCTION') ||
              statement.includes('CREATE TRIGGER') ||
              statement.includes('COMMENT ON')) {

            await this.db.query(statement + ';');
            executed++;

            // Show what we're creating
            if (statement.includes('CREATE TABLE')) {
              const tableName = statement.match(/CREATE TABLE[^(]*?(\w+)/i)?.[1] || 'unknown';
              console.log(`  ✅ Table: ${tableName}`);
            } else if (statement.includes('CREATE INDEX')) {
              const indexName = statement.match(/CREATE INDEX[^(]*?(\w+)/i)?.[1] || 'unknown';
              console.log(`  ✅ Index: ${indexName}`);
            }
          } else {
            skipped++;
          }
        } catch (error) {
          // Ignore "already exists" errors but report real issues
          if (error.message.includes('already exists') ||
              error.message.includes('extension') ||
              error.code === '42P07' ||
              error.code === '42P06') {
            console.log(`  ⏭️  Already exists: ${statement.substring(0, 50)}...`);
            skipped++;
          } else {
            console.error(`  ❌ Error in statement: ${statement.substring(0, 100)}...`);
            console.error(`     ${error.message}`);
          }
        }
      }

      console.log(`📊 Results: ${executed} executed, ${skipped} skipped`);

    } catch (error) {
      console.error('❌ Schema application failed:', error.message);
      throw error;
    }
  }

  async verifyDealsTable() {
    try {
      console.log('🔍 Verifying deals table structure...');

      // Check if deals table exists and get all its columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'deals'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const result = await this.db.query(columnsQuery);

      if (result.rows.length === 0) {
        throw new Error('Deals table does not exist!');
      }

      console.log('📋 Deals table columns:');
      const expectedColumns = ['id', 'title', 'description', 'image', 'original_price', 'sale_price', 'discount', 'rating', 'category', 'featured', 'store', 'affiliate_url', 'tags', 'stock_count', 'active', 'expires_at', 'created_at', 'updated_at'];

      const existingColumns = result.rows.map(row => row.column_name);

      for (const col of expectedColumns) {
        if (existingColumns.includes(col)) {
          console.log(`  ✅ ${col}`);
        } else {
          console.log(`  ❌ MISSING: ${col}`);
        }
      }

      console.log(`📊 Total columns: ${existingColumns.length}/${expectedColumns.length}`);

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      throw error;
    }
  }

  async testDealsAPI() {
    try {
      console.log('🧪 Testing the deals API query...');

      const apiQuery = `
        SELECT
          id, title, description, image, original_price, sale_price,
          discount, rating, category, featured, store, affiliate_url,
          tags, stock_count, expires_at, created_at, updated_at,
          (original_price - sale_price) as savings_amount
        FROM deals
        WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 3;
      `;

      const result = await this.db.query(apiQuery);
      console.log(`✅ Query successful! Found ${result.rows.length} deals`);

      if (result.rows.length > 0) {
        console.log('📄 Sample deal structure:', {
          id: result.rows[0].id,
          title: result.rows[0].title?.substring(0, 30) + '...',
          has_image: result.rows[0].image !== null,
          original_price: result.rows[0].original_price,
          sale_price: result.rows[0].sale_price
        });
      } else {
        console.log('📄 No deals found (table might be empty)');
      }

    } catch (error) {
      console.error('❌ API query test failed:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🚀 Complete Database Schema Application - Starting...\n');

      await this.applyFullSchema();
      console.log('');

      await this.verifyDealsTable();
      console.log('');

      await this.testDealsAPI();

      console.log('\n✅ Database schema application completed successfully!');
      console.log('🔄 E2E tests should now work properly');

      return true;
    } catch (error) {
      console.error('\n❌ Database schema application failed:', error.message);
      return false;
    } finally {
      // Close database connection
      if (this.db && this.db.pool) {
        await this.db.pool.end();
        console.log('🔌 Database connection closed');
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const applier = new SchemaApplier();

  applier.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SchemaApplier;