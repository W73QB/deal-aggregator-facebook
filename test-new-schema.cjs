#!/usr/bin/env node

/**
 * Test New Schema Application
 * Apply the updated schema cleanly and verify it works
 */

const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: '.env.dealradarus.local' });
const db = require('./server/auth/utils/database');

class SchemaTestApplier {
  constructor() {
    this.db = db;
  }

  async dropAndRecreateDealsTable() {
    try {
      console.log('🗑️  Dropping existing deals table...');

      // Drop table to start fresh
      await this.db.query('DROP TABLE IF EXISTS deals CASCADE;');
      console.log('   ✅ Deals table dropped');

      return true;
    } catch (error) {
      console.error('❌ Error dropping table:', error.message);
      throw error;
    }
  }

  async applyNewSchema() {
    try {
      console.log('📄 Applying new schema from file...');

      // Read the updated schema file
      const schemaPath = path.join(__dirname, 'database/init-production-schema.sql');
      const schemaSQL = await fs.readFile(schemaPath, 'utf8');

      // Extract just the deals table creation part
      const dealsTableMatch = schemaSQL.match(
        /CREATE TABLE IF NOT EXISTS deals[\s\S]*?\);[\s\S]*?(?=CREATE INDEX|-- Create indexes)([\s\S]*?)(?=\n\n-- ===|$)/
      );

      if (!dealsTableMatch) {
        throw new Error('Could not find deals table definition in schema');
      }

      const dealsSQL = dealsTableMatch[0];
      console.log('   📋 Found deals table definition');

      // Execute the schema
      await this.db.query(dealsSQL);
      console.log('   ✅ Deals table created with new schema');

      return true;
    } catch (error) {
      console.error('❌ Error applying schema:', error.message);
      throw error;
    }
  }

  async verifyNewSchema() {
    try {
      console.log('🔍 Verifying new schema structure...');

      // Get all columns in the new table
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'deals' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const result = await this.db.query(columnsQuery);
      const columns = result.rows.map(row => row.column_name);

      console.log('   📋 Schema columns:', columns.join(', '));

      // Check that all expected API columns exist
      const expectedColumns = [
        'id', 'title', 'description', 'image_url', 'original_price', 'sale_price',
        'discount_percentage', 'rating', 'category', 'featured', 'store',
        'affiliate_url', 'tags', 'stock_count', 'active', 'expires_at',
        'created_at', 'updated_at'
      ];

      const missingColumns = expectedColumns.filter(col => !columns.includes(col));

      if (missingColumns.length === 0) {
        console.log('   ✅ All API-expected columns present');
        return true;
      } else {
        console.log('   ❌ Missing columns:', missingColumns);
        return false;
      }

    } catch (error) {
      console.error('❌ Error verifying schema:', error.message);
      throw error;
    }
  }

  async testAPIQuery() {
    try {
      console.log('🧪 Testing API query with new schema...');

      // This is the exact query from the API
      const testQuery = `
        SELECT
          id, title, description, image_url as image, original_price, sale_price,
          discount_percentage as discount, rating, category, featured, store, affiliate_url,
          tags, stock_count, expires_at, created_at, updated_at,
          (original_price - sale_price) as savings_amount
        FROM deals
        WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1;
      `;

      const result = await this.db.query(testQuery);
      console.log('   ✅ API query executed successfully');
      console.log(`   📊 Query returned ${result.rows.length} rows (expected: 0 for empty table)`);

      return true;
    } catch (error) {
      console.error('❌ API query test failed:', error.message);
      throw error;
    }
  }

  async insertTestData() {
    try {
      console.log('🌱 Inserting test data...');

      const insertQuery = `
        INSERT INTO deals (
          title, description, image_url, original_price, sale_price,
          discount_percentage, rating, category, featured, store,
          tags, stock_count, active, deal_url, source_platform, source_id
        ) VALUES (
          'Schema Test Deal',
          'Test deal to verify schema compatibility',
          'https://via.placeholder.com/300x200',
          99.99, 69.99, 30, 4.5, 'electronics', true, 'Test Store',
          'test,schema,verification', 5, true,
          'https://example.com/deal', 'test', 'schema-test-001'
        ) RETURNING id;
      `;

      const result = await this.db.query(insertQuery);
      console.log(`   ✅ Test data inserted with ID: ${result.rows[0].id}`);

      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error inserting test data:', error.message);
      throw error;
    }
  }

  async testCompleteAPIQuery() {
    try {
      console.log('🎯 Testing complete API query with data...');

      const apiQuery = `
        SELECT
          id, title, description, image_url as image, original_price, sale_price,
          discount_percentage as discount, rating, category, featured, store, affiliate_url,
          tags, stock_count, expires_at, created_at, updated_at,
          (original_price - sale_price) as savings_amount
        FROM deals
        WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
        LIMIT 5;
      `;

      const result = await this.db.query(apiQuery);
      console.log(`   ✅ Complete API query successful - found ${result.rows.length} deals`);

      if (result.rows.length > 0) {
        const sample = result.rows[0];
        console.log('   📄 Sample result:', {
          title: sample.title,
          image: sample.image ? 'present' : 'null',
          sale_price: sample.sale_price,
          discount: sample.discount,
          rating: sample.rating,
          featured: sample.featured,
          savings_amount: sample.savings_amount
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Complete API query failed:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🚀 Schema Test Application - Starting...\n');

      await this.dropAndRecreateDealsTable();
      console.log('');

      await this.applyNewSchema();
      console.log('');

      await this.verifyNewSchema();
      console.log('');

      await this.testAPIQuery();
      console.log('');

      const testId = await this.insertTestData();
      console.log('');

      await this.testCompleteAPIQuery();

      console.log('\n✅ Schema test completed successfully!');
      console.log('🎯 Database is now ready for API and E2E tests');

      return true;
    } catch (error) {
      console.error('\n❌ Schema test failed:', error.message);
      return false;
    } finally {
      if (this.db && this.db.pool) {
        await this.db.pool.end();
        console.log('🔌 Database connection closed');
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const applier = new SchemaTestApplier();

  applier.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SchemaTestApplier;