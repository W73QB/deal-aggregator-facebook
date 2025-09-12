#!/usr/bin/env node

/**
 * 🏗️ Database Schema Setup
 * ========================
 * Initializes production database schema for DealRadarUS
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🏗️ Setting up DealRadarUS Production Database Schema');
console.log('==================================================\n');

async function setupDatabaseSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Database connection successful\n');

        // Read the SQL schema file
        console.log('📖 Reading schema file...');
        const schemaPath = path.join(__dirname, '../database/init-production-schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log(`✅ Schema loaded (${schemaSql.length} characters)\n`);

        // Execute the schema
        console.log('🚀 Executing database schema...');
        console.log('   This may take a moment...');
        
        await client.query(schemaSql);
        
        console.log('✅ Schema execution completed successfully!\n');

        // Verify the setup
        console.log('🔍 Verifying schema setup...');
        
        // Check tables
        const tablesResult = await client.query(`
            SELECT tablename, schemaname 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        
        console.log('📋 Created tables:');
        tablesResult.rows.forEach(table => {
            console.log(`   ✅ ${table.tablename}`);
        });
        console.log('');

        // Check views
        const viewsResult = await client.query(`
            SELECT viewname 
            FROM pg_views 
            WHERE schemaname = 'public' 
            ORDER BY viewname
        `);
        
        if (viewsResult.rows.length > 0) {
            console.log('👁️ Created views:');
            viewsResult.rows.forEach(view => {
                console.log(`   ✅ ${view.viewname}`);
            });
            console.log('');
        }

        // Check sample data
        const dealsCount = await client.query('SELECT COUNT(*) FROM deals');
        console.log(`📊 Sample deals inserted: ${dealsCount.rows[0].count}`);

        const configCount = await client.query('SELECT COUNT(*) FROM system_config');
        console.log(`⚙️ Configuration entries: ${configCount.rows[0].count}`);

        // Test a complex query
        console.log('\n🧪 Testing database functionality...');
        const testResult = await client.query(`
            SELECT 
                d.title,
                d.price,
                d.discount_percentage,
                d.category
            FROM deals d
            WHERE d.status = 'active'
            LIMIT 3
        `);
        
        if (testResult.rows.length > 0) {
            console.log('✅ Sample query successful:');
            testResult.rows.forEach(deal => {
                console.log(`   📦 ${deal.title} - $${deal.price} (${deal.discount_percentage}% off)`);
            });
        }

        console.log('\n🎉 Database schema setup completed successfully!');
        console.log('\n📊 Database Statistics:');
        console.log(`   📋 Tables: ${tablesResult.rows.length}`);
        console.log(`   👁️ Views: ${viewsResult.rows.length}`);
        console.log(`   📦 Sample deals: ${dealsCount.rows[0].count}`);
        console.log(`   ⚙️ Config entries: ${configCount.rows[0].count}`);
        console.log('\n✅ Database is now production-ready!');

    } catch (error) {
        console.log('❌ Database schema setup failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.message.includes('already exists')) {
            console.log('   💡 Some tables may already exist - this is usually fine');
        } else if (error.message.includes('permission')) {
            console.log('   🔑 Check database user permissions');
        } else if (error.message.includes('syntax')) {
            console.log('   📝 SQL syntax error in schema file');
        }
        
        throw error;
        
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the setup
if (require.main === module) {
    setupDatabaseSchema().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { setupDatabaseSchema };