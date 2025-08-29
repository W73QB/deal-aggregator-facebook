#!/usr/bin/env node

require('dotenv').config({ path: '.env.dealradarus.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkEnum() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'report_status'
      ORDER BY e.enumsortorder;
    `);
    
    console.log('Available report_status values:');
    result.rows.forEach(row => console.log(`  - ${row.enumlabel}`));
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEnum();