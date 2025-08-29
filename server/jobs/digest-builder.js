#!/usr/bin/env node

/**
 * M3.6 Digest Builder
 * Builds daily and weekly digest notifications for users
 */

const { Pool } = require('pg');
const cron = require('node-cron');
const { logger } = require('../monitoring/logger');
const { notificationService } = require('../notifications/service');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class DigestBuilder {
  constructor() {
    this.isRunning = false;
  }

  async initialize() {
    try {
      // Initialize notification service
      if (!notificationService.isInitialized) {
        await notificationService.initialize();
      }

      logger.info('Digest builder initialized');

    } catch (error) {
      logger.error('Failed to initialize digest builder', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Build and enqueue daily digests
   */
  async buildDailyDigests() {
    if (this.isRunning) {
      logger.warn('Digest builder already running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    let processedUsers = 0;

    try {
      logger.info('Building daily digests');

      // Get users who want daily digests
      const users = await this.getUsersForDigest('daily');
      
      if (users.length === 0) {
        logger.info('No users configured for daily digests');
        return;
      }

      // Build digest for each user
      for (const user of users) {
        try {
          await this.buildUserDigest(user, 'daily');
          processedUsers++;
        } catch (error) {
          logger.error('Failed to build digest for user', {
            userId: user.id,
            frequency: 'daily',
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      
      logger.info('Daily digests completed', {
        processedUsers,
        totalUsers: users.length,
        duration
      });

    } catch (error) {
      logger.error('Daily digest building failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Build and enqueue weekly digests
   */
  async buildWeeklyDigests() {
    if (this.isRunning) {
      logger.warn('Digest builder already running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    let processedUsers = 0;

    try {
      logger.info('Building weekly digests');

      // Get users who want weekly digests
      const users = await this.getUsersForDigest('weekly');
      
      if (users.length === 0) {
        logger.info('No users configured for weekly digests');
        return;
      }

      // Build digest for each user
      for (const user of users) {
        try {
          await this.buildUserDigest(user, 'weekly');
          processedUsers++;
        } catch (error) {
          logger.error('Failed to build digest for user', {
            userId: user.id,
            frequency: 'weekly',
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      
      logger.info('Weekly digests completed', {
        processedUsers,
        totalUsers: users.length,
        duration
      });

    } catch (error) {
      logger.error('Weekly digest building failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get users configured for specific digest frequency
   */
  async getUsersForDigest(frequency) {
    try {
      const query = `
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          np.digest_frequency,
          np.timezone,
          np.quiet_hours_start,
          np.quiet_hours_end
        FROM users u
        JOIN notification_preferences np ON u.id = np.user_id
        WHERE np.digest_frequency = $1
        AND np.email_enabled = true
        ORDER BY u.created_at ASC
      `;

      const result = await pool.query(query, [frequency]);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get users for digest', { 
        frequency, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Build digest for individual user
   */
  async buildUserDigest(user, frequency) {
    const userId = user.id;

    try {
      // Get date range for digest
      const { startDate, endDate } = this.getDigestDateRange(frequency, user.timezone);

      // Get user's saved filters
      const filters = await this.getUserFilters(userId);
      
      if (filters.length === 0) {
        logger.debug('User has no saved filters, skipping digest', { userId });
        return;
      }

      // Collect deals for each filter
      const digestData = {
        user: {
          id: userId,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email
        },
        period: {
          frequency,
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        categories: [],
        totalDeals: 0,
        bestSaving: 0,
        avgDiscount: 0,
        topCategory: null
      };

      let allDeals = [];

      for (const filter of filters) {
        const deals = await this.getDealsForFilter(filter, startDate, endDate);
        
        if (deals.length > 0) {
          digestData.categories.push({
            name: filter.name,
            filterId: filter.id,
            deals: deals.slice(0, 10) // Limit to top 10 deals per category
          });

          allDeals = allDeals.concat(deals);
        }
      }

      if (allDeals.length === 0) {
        logger.debug('No deals found for user digest', { userId, frequency });
        return;
      }

      // Calculate digest statistics
      digestData.totalDeals = allDeals.length;
      digestData.bestSaving = this.calculateBestSaving(allDeals);
      digestData.avgDiscount = this.calculateAverageDiscount(allDeals);
      digestData.topCategory = this.getTopCategory(digestData.categories);

      // Enqueue digest alert
      const alertResult = await notificationService.enqueueAlert({
        userId,
        filterId: null, // Digest is not tied to specific filter
        type: 'digest',
        payload: digestData,
        priority: 1 // Normal priority for digests
      });

      logger.info('Digest enqueued for user', {
        userId,
        frequency,
        totalDeals: digestData.totalDeals,
        categories: digestData.categories.length,
        alertId: alertResult.alertId
      });

      return alertResult;

    } catch (error) {
      logger.error('Failed to build user digest', {
        userId,
        frequency,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get date range for digest period
   */
  getDigestDateRange(frequency, timezone = 'UTC') {
    const now = new Date();
    const endDate = new Date(now);
    let startDate;

    if (frequency === 'daily') {
      // Yesterday's deals
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      
    } else if (frequency === 'weekly') {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  /**
   * Get user's saved filters
   */
  async getUserFilters(userId) {
    try {
      const query = `
        SELECT id, name, filter_data, created_at
        FROM saved_filters
        WHERE user_id = $1 
        AND active = true
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get user filters', { userId, error: error.message });
      return [];
    }
  }

  /**
   * Get deals matching filter criteria for date range
   */
  async getDealsForFilter(filter, startDate, endDate) {
    try {
      // This is a simplified version - in a real system, you'd have a deals table
      // and complex filtering logic based on the saved filter criteria
      
      // For demo purposes, we'll create mock deals based on filter
      const filterData = filter.filter_data;
      const mockDeals = this.generateMockDeals(filter, 3); // 3 deals per filter

      return mockDeals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate >= startDate && dealDate <= endDate;
      });

    } catch (error) {
      logger.error('Failed to get deals for filter', {
        filterId: filter.id,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Generate mock deals for demonstration
   */
  generateMockDeals(filter, count = 3) {
    const baseDeals = [
      {
        title: 'Premium Wireless Headphones',
        price: 89.99,
        originalPrice: 199.99,
        category: 'Electronics',
        discount: 55,
        url: `${process.env.FRONTEND_BASE_URL}/deals/headphones-${filter.id}`
      },
      {
        title: 'Smart Home Security Camera',
        price: 49.99,
        originalPrice: 129.99,
        category: 'Smart Home',
        discount: 62,
        url: `${process.env.FRONTEND_BASE_URL}/deals/camera-${filter.id}`
      },
      {
        title: 'Bluetooth Speaker with LED',
        price: 24.99,
        originalPrice: 59.99,
        category: 'Audio',
        discount: 58,
        url: `${process.env.FRONTEND_BASE_URL}/deals/speaker-${filter.id}`
      },
      {
        title: 'Wireless Phone Charger',
        price: 15.99,
        originalPrice: 39.99,
        category: 'Accessories',
        discount: 60,
        url: `${process.env.FRONTEND_BASE_URL}/deals/charger-${filter.id}`
      },
      {
        title: 'Gaming Mouse RGB',
        price: 19.99,
        originalPrice: 49.99,
        category: 'Gaming',
        discount: 60,
        url: `${process.env.FRONTEND_BASE_URL}/deals/mouse-${filter.id}`
      }
    ];

    return baseDeals.slice(0, count).map((deal, index) => ({
      ...deal,
      id: `deal-${filter.id}-${index}`,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      filterId: filter.id
    }));
  }

  /**
   * Calculate best saving from deals
   */
  calculateBestSaving(deals) {
    return deals.reduce((max, deal) => {
      const saving = deal.originalPrice - deal.price;
      return saving > max ? saving : max;
    }, 0);
  }

  /**
   * Calculate average discount percentage
   */
  calculateAverageDiscount(deals) {
    if (deals.length === 0) return 0;

    const totalDiscount = deals.reduce((sum, deal) => sum + (deal.discount || 0), 0);
    return Math.round(totalDiscount / deals.length);
  }

  /**
   * Get category with most deals
   */
  getTopCategory(categories) {
    if (categories.length === 0) return null;

    return categories.reduce((top, category) => {
      return category.deals.length > (top?.deals?.length || 0) ? category : top;
    })?.name || null;
  }

  /**
   * Start digest schedulers
   */
  startSchedulers() {
    if (!process.env.DIGEST_ENABLED || process.env.DIGEST_ENABLED !== 'true') {
      logger.info('Digest building is disabled');
      return;
    }

    // Daily digest: Run at 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
      try {
        await this.buildDailyDigests();
      } catch (error) {
        logger.error('Scheduled daily digest failed', { error: error.message });
      }
    });

    // Weekly digest: Run at 9:00 AM every Monday
    cron.schedule('0 9 * * 1', async () => {
      try {
        await this.buildWeeklyDigests();
      } catch (error) {
        logger.error('Scheduled weekly digest failed', { error: error.message });
      }
    });

    logger.info('Digest schedulers started', {
      daily: '9:00 AM every day',
      weekly: '9:00 AM every Monday'
    });
  }

  /**
   * Get digest statistics
   */
  async getDigestStats() {
    try {
      const statsQuery = `
        SELECT 
          np.digest_frequency,
          COUNT(*) as user_count,
          COUNT(CASE WHEN np.email_enabled THEN 1 END) as email_enabled_count
        FROM notification_preferences np
        JOIN users u ON np.user_id = u.id
        WHERE np.digest_frequency IN ('daily', 'weekly')
        GROUP BY np.digest_frequency
        ORDER BY np.digest_frequency
      `;

      const result = await pool.query(statsQuery);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get digest stats', { error: error.message });
      return [];
    }
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const builder = new DigestBuilder();
  
  try {
    await builder.initialize();

    if (args.includes('--once')) {
      // Build all digests once
      console.log('🏗️  Building digests once...');
      await builder.buildDailyDigests();
      await builder.buildWeeklyDigests();
      console.log('✅ Digests completed');
      process.exit(0);
      
    } else if (args.includes('--daily')) {
      // Build daily digests only
      console.log('📅 Building daily digests...');
      await builder.buildDailyDigests();
      console.log('✅ Daily digests completed');
      process.exit(0);
      
    } else if (args.includes('--weekly')) {
      // Build weekly digests only
      console.log('📊 Building weekly digests...');
      await builder.buildWeeklyDigests();
      console.log('✅ Weekly digests completed');
      process.exit(0);
      
    } else if (args.includes('--stats')) {
      // Show digest statistics
      console.log('📊 Digest Statistics:');
      const stats = await builder.getDigestStats();
      console.table(stats);
      process.exit(0);
      
    } else {
      // Start schedulers
      builder.startSchedulers();
      
      console.log('🚀 Digest builder running with schedulers');
      console.log('📅 Daily digests: 9:00 AM every day');
      console.log('📊 Weekly digests: 9:00 AM every Monday');
      console.log('⏹️  Press Ctrl+C to stop');
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down digest builder...');
        process.exit(0);
      });
    }

  } catch (error) {
    console.error('❌ Digest builder failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { DigestBuilder };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}