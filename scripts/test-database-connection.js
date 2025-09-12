#!/usr/bin/env node

/**
 * 🔍 Database Connection Tester
 * =============================
 * Tests Neon Postgres connectivity with real credentials
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const { Client } = require('pg');

console.log('🔍 Testing Database Connectivity');
console.log('================================\n');

async function testDatabaseConnection() {
    const configs = [
        {
            name: 'Primary Database',
            connectionString: process.env.DATABASE_URL
        },
        {
            name: 'Pooled Database', 
            connectionString: process.env.DATABASE_URL_POOLER
        }
    ];

    for (const config of configs) {
        console.log(`🔌 Testing ${config.name}...`);
        
        if (!config.connectionString) {
            console.log('❌ Connection string not found in environment');
            continue;
        }

        const client = new Client({
            connectionString: config.connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });

        try {
            console.log('   📡 Connecting...');
            await client.connect();
            
            console.log('   ✅ Connection successful');
            
            // Test basic query
            const result = await client.query('SELECT NOW() as current_time, version() as db_version');
            console.log(`   🕐 Server time: ${result.rows[0].current_time}`);
            console.log(`   📊 DB version: ${result.rows[0].db_version.split(' ')[0]}`);
            
            // Test tables existence
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `);
            
            console.log(`   📋 Tables found: ${tablesResult.rows.length}`);
            if (tablesResult.rows.length > 0) {
                console.log('      ' + tablesResult.rows.map(r => r.table_name).slice(0, 5).join(', ') + 
                          (tablesResult.rows.length > 5 ? '...' : ''));
            }
            
        } catch (error) {
            console.log(`   ❌ Connection failed: ${error.message}`);
            
            if (error.message.includes('password')) {
                console.log('   🔐 Check database credentials');
            } else if (error.message.includes('timeout')) {
                console.log('   ⏱️  Network timeout - check connection');
            } else if (error.message.includes('ENOTFOUND')) {
                console.log('   🌐 DNS resolution failed - check hostname');
            }
        } finally {
            try {
                await client.end();
            } catch (e) {
                // Ignore close errors
            }
        }
        
        console.log('');
    }
}

// Run the test
testDatabaseConnection().catch(console.error);