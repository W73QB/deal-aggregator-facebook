/**
 * Admin User Seeding Script
 * Creates/Updates admin user with deals@dealradarus.com
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.dealradarus.local' });

async function seedAdmin() {
  console.log('🌱 DealRadarUS Admin Seeding');
  console.log('============================\n');

  // Environment variables
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not found in .env.dealradarus.local');
  }

  const email = (process.env.ADMIN_EMAIL || 'deals@dealradarus.com').trim();
  console.log(`📧 Admin email: ${email}`);

  // Password handling
  let pwd = process.env.ADMIN_TEMP_PASSWORD;
  let justGenerated = false;
  
  if (!pwd) {
    pwd = crypto.randomBytes(18).toString('base64url'); // ~24 chars
    justGenerated = true;
    console.log('🔐 Generated new temporary password');
  } else {
    console.log('🔐 Using provided ADMIN_TEMP_PASSWORD');
  }

  // Hash password
  const hash = await bcrypt.hash(pwd, 10);
  console.log('✅ Password hashed with bcrypt(10)');

  // Database connection
  const client = new Client({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    console.log('🔄 Executing admin upsert...');
    
    const sql = `
      INSERT INTO public.users (email, password_hash, role, email_verified)
      VALUES ($1, $2, 'admin', true)
      ON CONFLICT (email)
      DO UPDATE SET role='admin', email_verified=true, updated_at=NOW()
      RETURNING id, email, role, email_verified, created_at, updated_at;
    `;
    
    const { rows } = await client.query(sql, [email, hash]);
    const adminUser = rows[0];

    console.log('✅ Admin user upsert completed\n');

    // Prepare output (no password hash!)
    const result = {
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        email_verified: adminUser.email_verified,
        created_at: adminUser.created_at,
        updated_at: adminUser.updated_at
      },
      temp_password_notice: justGenerated 
        ? '⚠️ Generated ADMIN_TEMP_PASSWORD — copy & store securely' 
        : 'Using provided ADMIN_TEMP_PASSWORD',
      database_url_source: '.env.dealradarus.local',
      operation: 'UPSERT_ADMIN_USER'
    };

    console.log('📋 Admin Setup Result:');
    console.log('======================');
    console.log(JSON.stringify(result, null, 2));

    if (justGenerated) {
      console.log('\n⚠️ ⚠️ ⚠️ IMPORTANT - COPY & STORE SECURELY ⚠️ ⚠️ ⚠️');
      console.log(`ADMIN_TEMP_PASSWORD: ${pwd}`);
      console.log('Store this securely and rotate ASAP.');
      console.log('⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️ ⚠️');
    }

    return result;

  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Execute seeding
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('\n🎉 Admin seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Admin seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedAdmin };