/**
 * Database Fallback System
 * Provides mock database functionality when connection fails
 */

class DatabaseFallback {
  constructor() {
    this.inMemoryStorage = new Map();
    this.connected = false;
    console.log('⚠️  Database fallback mode active - using in-memory storage');
  }

  async query(text, params = []) {
    // Basic query parsing for demo purposes
    const queryType = text.trim().toLowerCase();
    
    if (queryType.includes('select now()')) {
      return { rows: [{ now: new Date() }] };
    }
    
    if (queryType.includes('select') && queryType.includes('users')) {
      return { 
        rows: [
          { 
            id: 1, 
            email: 'demo@dealradarus.com', 
            username: 'demo_user',
            created_at: new Date(),
            verified: true 
          }
        ] 
      };
    }
    
    if (queryType.includes('insert') && queryType.includes('users')) {
      const mockId = Math.floor(Math.random() * 1000);
      return { 
        rows: [{ 
          id: mockId,
          email: params[0] || 'mock@email.com',
          created_at: new Date() 
        }],
        rowCount: 1
      };
    }
    
    if (queryType.includes('select') && queryType.includes('comments')) {
      return {
        rows: [
          {
            id: 1,
            content: 'Great deal! Thanks for sharing.',
            user_id: 1,
            deal_id: params[0] || 'demo-deal',
            created_at: new Date(),
            helpfulness_score: 5
          },
          {
            id: 2,
            content: 'Saved me $50! Highly recommended.',
            user_id: 2,
            deal_id: params[0] || 'demo-deal',
            created_at: new Date(),
            helpfulness_score: 8
          }
        ]
      };
    }
    
    if (queryType.includes('select') && queryType.includes('reviews')) {
      return {
        rows: [
          {
            id: 1,
            rating: 5,
            content: 'Excellent product quality and fast shipping.',
            user_id: 1,
            deal_id: params[0] || 'demo-deal',
            created_at: new Date(),
            verified_purchase: true
          }
        ]
      };
    }
    
    // Default response for other queries
    return { rows: [], rowCount: 0 };
  }

  async testConnection() {
    return { rows: [{ now: new Date() }] };
  }

  async getClient() {
    return {
      query: this.query.bind(this),
      release: () => {},
      end: () => {}
    };
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
    }
  }

  async close() {
    console.log('📝 Database fallback closed');
  }
}

module.exports = new DatabaseFallback();