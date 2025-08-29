/**
 * Test User Setup
 * Creates verified test users for integration testing
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../auth/utils/database');

async function createVerifiedTestUser(email, password, firstName, lastName) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user with verified email
    const result = await db.query(`
      INSERT INTO public.users 
      (id, email, password_hash, first_name, last_name, email_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email_verified = true
      RETURNING id, email, first_name, last_name
    `, [uuidv4(), email, hashedPassword, firstName, lastName]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

async function setupTestUsers() {
  console.log('🔧 Setting up verified test users...');
  
  const testUsers = [
    {
      email: 'ugc-test-user1@dealradarus.com',
      password: 'TestPass123!',
      firstName: 'UGC Test',
      lastName: 'User 1'
    },
    {
      email: 'ugc-test-user2@dealradarus.com', 
      password: 'TestPass123!',
      firstName: 'UGC Test',
      lastName: 'User 2'
    }
  ];
  
  const createdUsers = [];
  
  for (const user of testUsers) {
    const created = await createVerifiedTestUser(
      user.email, 
      user.password, 
      user.firstName, 
      user.lastName
    );
    createdUsers.push(created);
    console.log(`✅ Created user: ${created.email}`);
  }
  
  console.log('🎉 Test users setup complete!');
  return createdUsers;
}

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...');
  
  const testEmails = [
    'ugc-test-user1@dealradarus.com',
    'ugc-test-user2@dealradarus.com'
  ];
  
  for (const email of testEmails) {
    await db.query('DELETE FROM public.users WHERE email = $1', [email]);
    console.log(`🗑️ Removed user: ${email}`);
  }
  
  console.log('✅ Cleanup complete!');
}

module.exports = {
  setupTestUsers,
  cleanupTestUsers,
  createVerifiedTestUser
};

// Run setup if called directly
if (require.main === module) {
  setupTestUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
}