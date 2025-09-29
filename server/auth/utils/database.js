/**
 * Professional Database Connection Utilities
 * Proper error handling with no dangerous fallback patterns
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.dealradarus.local' });

let dbInstance = null;

class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
    this.connected = false;

    if (!this.connectionString) {
      throw new Error('DATABASE_URL is required. Please configure your database connection string.');
    }

    this.pool = new Pool({
      connectionString: this.connectionString,
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
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
    this.pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
      this.connected = false;
    });

    this.pool.on('connect', () => {
      this.connected = true;
    });
  }

  async getClient() {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error('Failed to get database client:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }

  async query(text, params = []) {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW() as current_time');
      this.connected = true;
      console.log('✅ Database connection verified');
      return result;
    } catch (error) {
      this.connected = false;
      console.error('❌ Database connection test failed:', error.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('📝 Database connection pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed, rolled back:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Health check method for monitoring
  async healthCheck() {
    try {
      const start = Date.now();
      const result = await this.query('SELECT 1 as health_check');
      const duration = Date.now() - start;

      return {
        status: 'healthy',
        connected: this.connected,
        response_time: `${duration}ms`,
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
}

// Export singleton instance and helpers for hybrid environments
if (!dbInstance) {
  dbInstance = new DatabaseConnection();
}

module.exports = dbInstance;
module.exports.DatabaseConnection = DatabaseConnection;
module.exports.getInstance = () => dbInstance;
