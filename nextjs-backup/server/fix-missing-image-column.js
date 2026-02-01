#!/usr/bin/env node

/**
 * Database Column Fix: Add missing 'image' column to deals table
 * This fixes the E2E test failures caused by database schema mismatch
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const db = require('./auth/utils/database');

class ColumnFixer {
  constructor() {
    this.db = db;
  }

  async checkAndAddImageColumn() {
    try {
      console.log('🔍 Checking if image column exists in deals table...');

      // Check if column exists
      const checkColumnQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'deals'
        AND column_name = 'image'
        AND table_schema = 'public';
      `;

      const result = await this.db.query(checkColumnQuery);

      if (result.rows.length === 0) {
        console.log('❌ Image column missing! Adding it now...');

        // Add the missing column
        const addColumnQuery = `
          ALTER TABLE public.deals
          ADD COLUMN IF NOT EXISTS image TEXT;
        `;

        await this.db.query(addColumnQuery);
        console.log('✅ Successfully added image column to deals table');

        // Verify it was added
        const verifyResult = await this.db.query(checkColumnQuery);
        if (verifyResult.rows.length > 0) {
          console.log('✅ Verification successful: image column now exists');
        } else {
          throw new Error('Column addition verification failed');
        }

      } else {
        console.log('✅ Image column already exists');
      }

    } catch (error) {
      console.error('❌ Error fixing image column:', error.message);
      throw error;
    }
  }

  async testDealsQuery() {
    try {
      console.log('🧪 Testing deals query that was failing...');

      const testQuery = `
        SELECT id, title, description, image, original_price, sale_price
        FROM deals
        WHERE active = true
        LIMIT 1;
      `;

      const result = await this.db.query(testQuery);
      console.log(`✅ Query successful! Found ${result.rows.length} deals`);

      if (result.rows.length > 0) {
        console.log('📄 Sample deal:', {
          id: result.rows[0].id,
          title: result.rows[0].title,
          has_image: result.rows[0].image !== null
        });
      }

    } catch (error) {
      console.error('❌ Test query failed:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🚀 Database Column Fix - Starting...\n');

      await this.checkAndAddImageColumn();
      await this.testDealsQuery();

      console.log('\n✅ Database column fix completed successfully!');
      console.log('🔄 E2E tests should now work properly');

      return true;
    } catch (error) {
      console.error('\n❌ Database column fix failed:', error.message);
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
  const fixer = new ColumnFixer();

  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ColumnFixer;