/**
 * Database Connection Utilities for Auth System
 * Auto-fallback to in-memory storage when connection fails
 */

const { Pool } = require('pg');
const fallbackDb = require('./database-fallback');
require('dotenv').config({ path: '.env.dealradarus.local' });

let dbInstance = null;

class DatabaseConnection {
  constructor() {
    this.useFallback = false;
    this.connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
    
    if (!this.connectionString) {
      console.log('⚠️  No DATABASE_URL found, using fallback mode');
      this.useFallback = true;
      return;
    }
    
    this.pool = new Pool({
      connectionString: this.connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
    
    // Test connection on startup
    this.testConnection().catch(() => {
      console.log('⚠️  Database connection failed, switching to fallback mode');
      this.useFallback = true;
    });
  }

  async getClient() {
    if (this.useFallback) {
      return await fallbackDb.getClient();
    }
    return await this.pool.connect();
  }

  async query(text, params) {
    if (this.useFallback) {
      return await fallbackDb.query(text, params);
    }
    
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error, switching to fallback:', error.message);
      this.useFallback = true;
      return await fallbackDb.query(text, params);
    }
  }

  async testConnection() {
    if (this.useFallback) {
      return await fallbackDb.testConnection();
    }
    
    try {
      const result = await this.pool.query('SELECT NOW()');
      return result;
    } catch (error) {
      console.error('Database connection test failed:', error.message);
      this.useFallback = true;
      return await fallbackDb.testConnection();
    }
  }

  async close() {
    if (this.useFallback) {
      return await fallbackDb.close();
    }
    await this.pool.end();
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
      throw error;
    } finally {
      await client.end();
    }
  }
}

// Export singleton instance
if (!dbInstance) {
  dbInstance = new DatabaseConnection();
}

module.exports = dbInstance;