/**
 * Database Connection Module for External API
 * PostgreSQL connection pool with proper error handling
 */

const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let connected = false;

function initializePool() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('⚠️  DATABASE_URL not configured - database features will be unavailable');
    return null;
  }

  pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
    acquireTimeoutMillis: 2000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    statement_timeout: 5000,
    query_timeout: 5000
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('❌ Unexpected database pool error:', err);
    connected = false;
  });

  pool.on('connect', () => {
    connected = true;
    console.log('✅ Database client connected');
  });

  return pool;
}

async function query(text, params = []) {
  const dbPool = initializePool();

  if (!dbPool) {
    throw new Error('Database connection not configured');
  }

  const start = Date.now();
  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

async function getClient() {
  const dbPool = initializePool();

  if (!dbPool) {
    throw new Error('Database connection not configured');
  }

  try {
    const client = await dbPool.connect();
    return client;
  } catch (error) {
    console.error('Failed to get database client:', error.message);
    throw error;
  }
}

async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    connected = true;
    console.log('✅ Database connection verified:', result.rows[0]);
    return { status: 'ok', ...result.rows[0] };
  } catch (error) {
    connected = false;
    console.error('❌ Database connection test failed:', error.message);
    return { status: 'error', message: error.message };
  }
}

async function healthCheck() {
  try {
    const start = Date.now();
    await query('SELECT 1 as health_check');
    const duration = Date.now() - start;

    return {
      status: 'healthy',
      connected: connected,
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function close() {
  if (pool) {
    try {
      await pool.end();
      console.log('📝 Database connection pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
}

// Check if database is configured on startup
const isConfigured = () => {
  return !!(process.env.DATABASE_URL || process.env.DATABASE_URL_POOLER);
};

module.exports = {
  query,
  getClient,
  testConnection,
  healthCheck,
  close,
  isConfigured,
  get pool() {
    return initializePool();
  },
  get connected() {
    return connected;
  }
};