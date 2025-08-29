/**
 * Database Connection Utilities for Auth System
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.dealradarus.local' });

class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.DATABASE_URL;
    if (!this.connectionString) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
  }

  async getClient() {
    const client = new Client({
      connectionString: this.connectionString,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
  }

  async query(text, params) {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      await client.end();
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
      throw error;
    } finally {
      await client.end();
    }
  }
}

module.exports = new DatabaseConnection();