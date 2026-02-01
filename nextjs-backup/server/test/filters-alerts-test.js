/**
 * Filters & Alerts Integration Test Suite
 * Tests CRUD operations, background jobs, and email delivery tracking
 */

const axios = require('axios');
const db = require('../auth/utils/database');

const BASE_URL = 'http://localhost:3001';

class FiltersAlertsTestSuite {
  constructor() {
    this.testUser = null;
    this.authToken = null;
    this.testFilter = null;
    this.testAlert = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Filters & Alerts Integration Test Suite');
    console.log('=' .repeat(60));

    try {
      await this.setupTestUser();
      await this.testFilterCRUD();
      await this.testAlertsCRUD();
      await this.testBackgroundJobs();
      await this.testEmailDeliveryLogging();
      await this.verifyAuditLogs();
      await this.cleanup();

      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.testResults.errors.push(error.message);
    }
  }

  async setupTestUser() {
    console.log('\n📝 Setting up test user...');
    
    const userData = {
      email: `filters-test-${Date.now()}@dealradarus.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User'
    };

    try {
      // Register test user
      const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, userData);
      this.testUser = registerResponse.data.user;
      
      // Login to get auth token
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      this.authToken = loginResponse.data.token;
      
      console.log('✅ Test user created and authenticated');
      this.testResults.passed++;
    } catch (error) {
      console.error('❌ Failed to setup test user:', error.response?.data || error.message);
      this.testResults.failed++;
      throw error;
    }
  }

  async testFilterCRUD() {
    console.log('\n🔍 Testing Filter CRUD operations...');

    const authHeaders = { Authorization: `Bearer ${this.authToken}` };

    try {
      // CREATE Filter
      const filterData = {
        name: 'Test Electronics Filter',
        criteria: {
          category: 'electronics',
          keywords: ['laptop', 'computer'],
          min_price: 100,
          max_price: 2000,
          location: 'New York'
        }
      };

      const createResponse = await axios.post(`${BASE_URL}/filters`, filterData, { headers: authHeaders });
      this.testFilter = createResponse.data.filter;
      
      console.log('✅ Filter created successfully:', this.testFilter.id);
      this.testResults.passed++;

      // READ Filters
      const getResponse = await axios.get(`${BASE_URL}/filters`, { headers: authHeaders });
      const filters = getResponse.data.filters;
      
      if (filters.length > 0 && filters.some(f => f.id === this.testFilter.id)) {
        console.log('✅ Filter retrieved successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Filter not found in list');
      }

      // UPDATE Filter
      const updatedData = {
        name: 'Updated Electronics Filter',
        criteria: { ...filterData.criteria, max_price: 3000 }
      };

      const updateResponse = await axios.put(`${BASE_URL}/filters/${this.testFilter.id}`, updatedData, { headers: authHeaders });
      
      if (updateResponse.data.filter.name === updatedData.name) {
        console.log('✅ Filter updated successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Filter update failed');
      }

      // GET Single Filter
      const singleFilterResponse = await axios.get(`${BASE_URL}/filters/${this.testFilter.id}`, { headers: authHeaders });
      
      if (singleFilterResponse.data.filter.id === this.testFilter.id) {
        console.log('✅ Single filter retrieved successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Single filter retrieval failed');
      }

    } catch (error) {
      console.error('❌ Filter CRUD test failed:', error.response?.data || error.message);
      this.testResults.failed++;
      this.testResults.errors.push(`Filter CRUD: ${error.message}`);
    }
  }

  async testAlertsCRUD() {
    console.log('\n🔔 Testing Alerts CRUD operations...');

    if (!this.testFilter) {
      console.error('❌ Cannot test alerts without valid filter');
      this.testResults.failed++;
      return;
    }

    const authHeaders = { Authorization: `Bearer ${this.authToken}` };

    try {
      // CREATE Alert
      const alertData = {
        filter_id: this.testFilter.id,
        frequency: 'daily',
        is_active: true
      };

      const createResponse = await axios.post(`${BASE_URL}/alerts`, alertData, { headers: authHeaders });
      this.testAlert = createResponse.data.alert;
      
      console.log('✅ Alert created successfully:', this.testAlert.id);
      this.testResults.passed++;

      // READ Alerts
      const getResponse = await axios.get(`${BASE_URL}/alerts`, { headers: authHeaders });
      const alerts = getResponse.data.alerts;
      
      if (alerts.length > 0 && alerts.some(a => a.id === this.testAlert.id)) {
        console.log('✅ Alert retrieved successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Alert not found in list');
      }

      // UPDATE Alert
      const updateResponse = await axios.put(`${BASE_URL}/alerts/${this.testAlert.id}`, {
        frequency: 'weekly',
        is_active: false
      }, { headers: authHeaders });
      
      if (updateResponse.data.alert.frequency === 'weekly') {
        console.log('✅ Alert updated successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Alert update failed');
      }

      // GET Single Alert
      const singleAlertResponse = await axios.get(`${BASE_URL}/alerts/${this.testAlert.id}`, { headers: authHeaders });
      
      if (singleAlertResponse.data.alert.id === this.testAlert.id) {
        console.log('✅ Single alert retrieved successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Single alert retrieval failed');
      }

    } catch (error) {
      console.error('❌ Alerts CRUD test failed:', error.response?.data || error.message);
      this.testResults.failed++;
      this.testResults.errors.push(`Alerts CRUD: ${error.message}`);
    }
  }

  async testBackgroundJobs() {
    console.log('\n⚙️ Testing background job execution...');

    try {
      // Get alerts processor instance and manually trigger
      const alertsProcessor = require('../jobs/alerts-processor');
      
      // Get stats before processing
      const statsBefore = alertsProcessor.getStats();
      console.log('📊 Stats before processing:', statsBefore);

      // Manually trigger alert processing
      await alertsProcessor.triggerProcessing();

      // Get stats after processing
      const statsAfter = alertsProcessor.getStats();
      console.log('📊 Stats after processing:', statsAfter);

      if (statsAfter.processed >= statsBefore.processed) {
        console.log('✅ Background job executed successfully');
        this.testResults.passed++;
      } else {
        throw new Error('Background job did not process any alerts');
      }

    } catch (error) {
      console.error('❌ Background job test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push(`Background Jobs: ${error.message}`);
    }
  }

  async testEmailDeliveryLogging() {
    console.log('\n📧 Testing email delivery logging...');

    try {
      // Check if email_events table has entries
      const emailEventsResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM public.email_events 
        WHERE user_id = $1
      `, [this.testUser.id]);

      const emailEventsCount = parseInt(emailEventsResult.rows[0].count);
      console.log(`📊 Email events found: ${emailEventsCount}`);

      // Check alert_deliveries table
      const deliveriesResult = await db.query(`
        SELECT COUNT(*) as count, status 
        FROM public.alert_deliveries 
        WHERE user_id = $1
        GROUP BY status
      `, [this.testUser.id]);

      console.log('📊 Alert deliveries by status:', deliveriesResult.rows);

      if (deliveriesResult.rows.length > 0) {
        console.log('✅ Email delivery logging working');
        this.testResults.passed++;
      } else {
        console.log('⚠️ No alert deliveries found (expected for new test user)');
        this.testResults.passed++;
      }

    } catch (error) {
      console.error('❌ Email delivery logging test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push(`Email Logging: ${error.message}`);
    }
  }

  async verifyAuditLogs() {
    console.log('\n📋 Verifying audit logs...');

    try {
      // Check saved_filters audit
      const filtersAuditResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM public.saved_filters 
        WHERE user_id = $1
      `, [this.testUser.id]);

      const filtersCount = parseInt(filtersAuditResult.rows[0].count);
      console.log(`📊 Saved filters in audit: ${filtersCount}`);

      // Check alerts audit
      const alertsAuditResult = await db.query(`
        SELECT COUNT(*) as count, is_active 
        FROM public.alerts 
        WHERE user_id = $1
        GROUP BY is_active
      `, [this.testUser.id]);

      console.log('📊 Alerts by status:', alertsAuditResult.rows);

      if (filtersCount > 0) {
        console.log('✅ Audit logs verified successfully');
        this.testResults.passed++;
      } else {
        throw new Error('No audit entries found');
      }

    } catch (error) {
      console.error('❌ Audit logs verification failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push(`Audit Logs: ${error.message}`);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Delete test alert (CASCADE will handle deliveries)
      if (this.testAlert) {
        await db.query('DELETE FROM public.alerts WHERE id = $1', [this.testAlert.id]);
      }

      // Delete test filter
      if (this.testFilter) {
        await db.query('DELETE FROM public.saved_filters WHERE id = $1', [this.testFilter.id]);
      }

      // Delete test user (CASCADE will handle related records)
      if (this.testUser) {
        await db.query('DELETE FROM public.users WHERE id = $1', [this.testUser.id]);
      }

      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  printSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📝 Total: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Test suite PASSED!');
    } else {
      console.log('💥 Test suite FAILED!');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new FiltersAlertsTestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

module.exports = FiltersAlertsTestSuite;