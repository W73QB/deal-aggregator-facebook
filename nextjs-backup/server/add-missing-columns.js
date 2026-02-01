#!/usr/bin/env node

/**
 * Add Missing Columns to Deals Table
 * Targeted fix for the missing columns identified in verification
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const db = require('./auth/utils/database');

class MissingColumnsFixer {
  constructor() {
    this.db = db;
  }

  async addMissingColumns() {
    try {
      console.log('🔧 Adding missing columns to deals table...');

      const missingColumns = [
        { name: 'sale_price', type: 'NUMERIC(10, 2) NOT NULL DEFAULT 0' },
        { name: 'discount', type: 'INTEGER' },
        { name: 'rating', type: 'NUMERIC(2, 1)' },
        { name: 'featured', type: 'BOOLEAN NOT NULL DEFAULT FALSE' },
        { name: 'store', type: 'TEXT' },
        { name: 'tags', type: 'TEXT' },
        { name: 'stock_count', type: 'INTEGER' },
        { name: 'active', type: 'BOOLEAN NOT NULL DEFAULT TRUE' },
        { name: 'expires_at', type: 'TIMESTAMPTZ' }
      ];

      let added = 0;
      let skipped = 0;

      for (const column of missingColumns) {
        try {
          const addColumnQuery = `
            ALTER TABLE public.deals
            ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
          `;

          await this.db.query(addColumnQuery);
          console.log(`  ✅ Added: ${column.name} (${column.type})`);
          added++;

        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`  ⏭️  Exists: ${column.name}`);
            skipped++;
          } else {
            console.error(`  ❌ Failed: ${column.name} - ${error.message}`);
          }
        }
      }

      console.log(`📊 Results: ${added} added, ${skipped} skipped`);

    } catch (error) {
      console.error('❌ Adding columns failed:', error.message);
      throw error;
    }
  }

  async addMissingIndexes() {
    try {
      console.log('🔧 Adding missing indexes...');

      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_deals_featured ON public.deals (featured);',
        'CREATE INDEX IF NOT EXISTS idx_deals_sale_price ON public.deals (sale_price);',
        'CREATE INDEX IF NOT EXISTS idx_deals_rating ON public.deals (rating);'
      ];

      for (const indexQuery of indexes) {
        try {
          await this.db.query(indexQuery);
          const indexName = indexQuery.match(/idx_deals_(\w+)/)?.[1] || 'unknown';
          console.log(`  ✅ Index: ${indexName}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`  ⏭️  Index exists`);
          } else {
            console.error(`  ❌ Index failed: ${error.message}`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Adding indexes failed:', error.message);
      throw error;
    }
  }

  async testFullQuery() {
    try {
      console.log('🧪 Testing complete deals API query...');

      const fullQuery = `
        SELECT
          id, title, description, image, original_price, sale_price,
          discount, rating, category, featured, store, affiliate_url,
          tags, stock_count, expires_at, created_at, updated_at,
          (original_price - sale_price) as savings_amount
        FROM deals
        WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 3;
      `;

      const result = await this.db.query(fullQuery);
      console.log(`✅ Complete query successful! Found ${result.rows.length} deals`);

      if (result.rows.length > 0) {
        console.log('📄 Sample deal with all columns:', {
          id: result.rows[0].id,
          title: result.rows[0].title,
          original_price: result.rows[0].original_price,
          sale_price: result.rows[0].sale_price,
          featured: result.rows[0].featured,
          active: result.rows[0].active
        });
      } else {
        console.log('📄 Table structure is correct (no data yet)');
      }

    } catch (error) {
      console.error('❌ Full query test failed:', error.message);
      throw error;
    }
  }

  async addSampleData() {
    try {
      console.log('🌱 Adding sample deal for testing...');

      const insertQuery = `
        INSERT INTO public.deals (
          title, description, image, original_price, sale_price,
          discount, rating, category, featured, store,
          tags, stock_count, active
        ) VALUES (
          'Test Deal - E2E Fix',
          'Sample deal to test E2E functionality',
          'https://via.placeholder.com/300x200',
          29.99, 19.99, 33, 4.5, 'electronics',
          true, 'Test Store', 'test,sample,e2e', 10, true
        )
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;

      const result = await this.db.query(insertQuery);
      if (result.rows.length > 0) {
        console.log(`  ✅ Sample deal created with ID: ${result.rows[0].id}`);
      } else {
        console.log('  ⏭️  Sample data already exists');
      }

    } catch (error) {
      console.error('❌ Adding sample data failed:', error.message);
      // Don't throw - this is optional
    }
  }

  async run() {
    try {
      console.log('🚀 Missing Columns Fix - Starting...\n');

      await this.addMissingColumns();
      console.log('');

      await this.addMissingIndexes();
      console.log('');

      await this.testFullQuery();
      console.log('');

      await this.addSampleData();

      console.log('\n✅ Database columns fix completed successfully!');
      console.log('🔄 API endpoints should now work properly');
      console.log('🧪 E2E tests should pass');

      return true;
    } catch (error) {
      console.error('\n❌ Database columns fix failed:', error.message);
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
  const fixer = new MissingColumnsFixer();

  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MissingColumnsFixer;