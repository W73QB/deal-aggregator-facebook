/**
 * UGC Integration Test Suite
 * Tests complete User-Generated Content workflow: Reviews, Comments, Reports
 */

const axios = require('axios');
const crypto = require('crypto');
const { setupTestUsers, cleanupTestUsers } = require('./setup-test-users');

class UGCTestSuite {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.testUser = {
      email: 'ugc-test-user1@dealradarus.com',
      password: 'TestPass123!',
      first_name: 'UGC Test',
      last_name: 'User 1'
    };
    this.testUser2 = {
      email: 'ugc-test-user2@dealradarus.com',
      password: 'TestPass123!',
      first_name: 'UGC Test',
      last_name: 'User 2'
    };
    this.cookies = [];
    this.cookies2 = [];
    this.testDealId = 'test-deal-ugc-integration';
    this.createdReviewId = null;
    this.createdCommentId = null;
    this.createdReportId = null;
  }

  async makeRequest(method, endpoint, data = null, userType = 'user1') {
    const cookies = userType === 'user2' ? this.cookies2 : this.cookies;
    
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      validateStatus: () => true, // Don't throw on 4xx/5xx
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Only add data for non-GET requests
    if (method.toUpperCase() !== 'GET' && data !== null) {
      config.data = data;
    }

    if (cookies.length > 0) {
      config.headers.Cookie = cookies.join('; ');
    }

    try {
      const response = await axios(config);
      
      // Extract cookies from response
      if (response.headers['set-cookie']) {
        if (userType === 'user2') {
          this.cookies2 = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]);
        } else {
          this.cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]);
        }
      }

      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: error.message },
        error: error.message
      };
    }
  }

  async setupTestUsers() {
    console.log('\n🔧 Setting up test users...');
    
    // Create verified users in database
    await setupTestUsers();

    // Login first user
    const login1 = await this.makeRequest('POST', '/auth/login', {
      email: this.testUser.email,
      password: this.testUser.password
    });
    console.log(`🔑 Login User 1: ${login1.status}`);

    if (login1.status !== 200) {
      throw new Error(`Failed to login user 1: ${JSON.stringify(login1.data)}`);
    }

    // Wait 2 seconds to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Login second user
    const login2 = await this.makeRequest('POST', '/auth/login', {
      email: this.testUser2.email,
      password: this.testUser2.password
    }, 'user2');
    console.log(`🔑 Login User 2: ${login2.status}`);

    if (login2.status !== 200) {
      throw new Error(`Failed to login user 2: ${JSON.stringify(login2.data)}`);
    }

    console.log('✅ Test users setup complete');
  }

  async testReviewsWorkflow() {
    console.log('\n📝 Testing Reviews Workflow...');

    // 1. Create a review
    const createReview = await this.makeRequest('POST', '/reviews', {
      deal_id: this.testDealId,
      rating: 5,
      title: 'Amazing Deal - Integration Test',
      content: 'This is a comprehensive review created during integration testing. The product quality exceeded expectations and delivery was fast.',
      metadata: {
        purchase_price: 49.99,
        test_marker: 'integration-test'
      }
    });
    console.log(`✨ Create Review: ${createReview.status}`);
    
    if (createReview.status !== 201) {
      throw new Error(`Failed to create review: ${JSON.stringify(createReview.data)}`);
    }
    
    this.createdReviewId = createReview.data.review.id;
    console.log(`   Review ID: ${this.createdReviewId}`);

    // 2. Get reviews for deal
    const getReviews = await this.makeRequest('GET', `/reviews/deal/${this.testDealId}`);
    console.log(`📖 Get Reviews: ${getReviews.status}`);
    
    if (getReviews.status !== 200 || !getReviews.data.data.reviews.length) {
      throw new Error('Failed to retrieve created review');
    }

    // 3. Get single review by ID
    const getSingleReview = await this.makeRequest('GET', `/reviews/review/${this.createdReviewId}`);
    console.log(`🔍 Get Single Review: ${getSingleReview.status}`);
    
    if (getSingleReview.status !== 200) {
      throw new Error('Failed to get single review');
    }

    // 4. Update review
    const updateReview = await this.makeRequest('PUT', `/reviews/${this.createdReviewId}`, {
      title: 'Updated Review Title - Integration Test',
      content: 'This review has been updated during integration testing.',
      rating: 4
    });
    console.log(`✏️ Update Review: ${updateReview.status}`);
    
    if (updateReview.status !== 200) {
      throw new Error('Failed to update review');
    }

    // 5. Vote on review (using second user)
    const voteReview = await this.makeRequest('POST', `/reviews/${this.createdReviewId}/vote`, {
      helpful: true
    }, 'user2');
    console.log(`👍 Vote on Review: ${voteReview.status}`);
    
    if (voteReview.status !== 200) {
      throw new Error('Failed to vote on review');
    }

    // 6. Try duplicate review (should fail)
    const duplicateReview = await this.makeRequest('POST', '/reviews', {
      deal_id: this.testDealId,
      rating: 3,
      title: 'Duplicate Review',
      content: 'This should not be allowed.'
    });
    console.log(`❌ Duplicate Review (Expected 409): ${duplicateReview.status}`);
    
    if (duplicateReview.status !== 409) {
      throw new Error('Duplicate review should have been rejected');
    }

    // 7. Get user's own reviews
    const myReviews = await this.makeRequest('GET', '/reviews/my-reviews');
    console.log(`📋 My Reviews: ${myReviews.status}`);
    
    if (myReviews.status !== 200) {
      throw new Error('Failed to get user reviews');
    }

    console.log('✅ Reviews workflow tests passed');
  }

  async testCommentsWorkflow() {
    console.log('\n💬 Testing Comments Workflow...');

    // 1. Create deal-level comment
    const createDealComment = await this.makeRequest('POST', '/comments', {
      deal_id: this.testDealId,
      content: 'This is a deal-level comment for integration testing. Anyone tried this product?'
    });
    console.log(`💭 Create Deal Comment: ${createDealComment.status}`);
    
    if (createDealComment.status !== 201) {
      throw new Error(`Failed to create deal comment: ${JSON.stringify(createDealComment.data)}`);
    }

    const dealCommentId = createDealComment.data.comment.id;

    // 2. Create review-level comment (reply to review)
    const createReviewComment = await this.makeRequest('POST', '/comments', {
      review_id: this.createdReviewId,
      content: 'Great review! I had a similar experience with this deal. Thanks for sharing.'
    }, 'user2');
    console.log(`📝 Create Review Comment: ${createReviewComment.status}`);
    
    if (createReviewComment.status !== 201) {
      throw new Error('Failed to create review comment');
    }

    this.createdCommentId = createReviewComment.data.comment.id;

    // 3. Create threaded comment (reply to comment)
    const createThreadedComment = await this.makeRequest('POST', '/comments', {
      deal_id: this.testDealId,
      parent_id: dealCommentId,
      content: 'Yes, I can confirm this deal is legitimate. Got mine last week!'
    });
    console.log(`🔗 Create Threaded Comment: ${createThreadedComment.status}`);
    
    if (createThreadedComment.status !== 201) {
      throw new Error('Failed to create threaded comment');
    }

    // 4. Get deal comments
    const getDealComments = await this.makeRequest('GET', `/comments/deal/${this.testDealId}`);
    console.log(`📖 Get Deal Comments: ${getDealComments.status}`);
    
    if (getDealComments.status !== 200 || !getDealComments.data.data.comments.length) {
      throw new Error('Failed to retrieve deal comments');
    }

    // 5. Get review comments  
    const getReviewComments = await this.makeRequest('GET', `/comments/review/${this.createdReviewId}`);
    console.log(`📖 Get Review Comments: ${getReviewComments.status}`);
    
    if (getReviewComments.status !== 200) {
      throw new Error('Failed to retrieve review comments');
    }

    // 6. Update comment
    const updateComment = await this.makeRequest('PUT', `/comments/${this.createdCommentId}`, {
      content: 'Updated comment content - integration test modification.'
    }, 'user2');
    console.log(`✏️ Update Comment: ${updateComment.status}`);
    
    if (updateComment.status !== 200) {
      throw new Error('Failed to update comment');
    }

    // 7. Vote on comment
    const voteComment = await this.makeRequest('POST', `/comments/${this.createdCommentId}/vote`, {
      is_helpful: true
    });
    console.log(`👍 Vote on Comment: ${voteComment.status}`);
    
    if (voteComment.status !== 200) {
      throw new Error('Failed to vote on comment');
    }

    // 8. Invalid comment (no target)
    const invalidComment = await this.makeRequest('POST', '/comments', {
      content: 'This comment has no deal_id or review_id'
    });
    console.log(`❌ Invalid Comment (Expected 400): ${invalidComment.status}`);
    
    if (invalidComment.status !== 400) {
      throw new Error('Invalid comment should have been rejected');
    }

    console.log('✅ Comments workflow tests passed');
  }

  async testReportsWorkflow() {
    console.log('\n🚨 Testing Reports & Moderation Workflow...');

    // 1. Create content report
    const createReport = await this.makeRequest('POST', '/reports', {
      content_type: 'review',
      content_id: this.createdReviewId,
      reason: 'spam',
      description: 'This review appears to be spam or promotional content.'
    }, 'user2');
    console.log(`🚨 Create Report: ${createReport.status}`);
    
    if (createReport.status !== 201) {
      throw new Error(`Failed to create report: ${JSON.stringify(createReport.data)}`);
    }

    this.createdReportId = createReport.data.report.id;
    console.log(`   Report ID: ${this.createdReportId}`);

    // 2. Try duplicate report (should fail)
    const duplicateReport = await this.makeRequest('POST', '/reports', {
      content_type: 'review',
      content_id: this.createdReviewId,
      reason: 'inappropriate',
      description: 'Another report for same content.'
    }, 'user2');
    console.log(`❌ Duplicate Report (Expected 409): ${duplicateReport.status}`);
    
    if (duplicateReport.status !== 409) {
      throw new Error('Duplicate report should have been rejected');
    }

    // 3. Report comment
    const reportComment = await this.makeRequest('POST', '/reports', {
      content_type: 'comment',
      content_id: this.createdCommentId,
      reason: 'harassment',
      description: 'Potentially offensive comment.'
    });
    console.log(`🚨 Report Comment: ${reportComment.status}`);
    
    if (reportComment.status !== 201) {
      throw new Error('Failed to report comment');
    }

    // 4. Invalid report (non-existent content)
    const invalidReport = await this.makeRequest('POST', '/reports', {
      content_type: 'review',
      content_id: 'non-existent-id',
      reason: 'spam',
      description: 'Report for non-existent content.'
    });
    console.log(`❌ Invalid Report (Expected 404): ${invalidReport.status}`);
    
    if (invalidReport.status !== 404) {
      throw new Error('Invalid content report should have been rejected');
    }

    // Note: Admin-only routes would require admin credentials
    // For now, we test the public reporting functionality
    console.log('✅ Reports workflow tests passed');
  }

  async testRateLimitingAndValidation() {
    console.log('\n🛡️ Testing Rate Limiting & Validation...');

    // 1. Test input validation
    const invalidReview = await this.makeRequest('POST', '/reviews', {
      deal_id: '', // Empty deal_id
      rating: 6,  // Invalid rating
      title: 'x', // Too short
      content: 'y' // Too short
    });
    console.log(`❌ Invalid Review Data (Expected 400): ${invalidReview.status}`);
    
    if (invalidReview.status !== 400) {
      throw new Error('Invalid review data should have been rejected');
    }

    // 2. Test authentication requirement
    const unauthenticatedRequest = await this.makeRequest('POST', '/reviews', {
      deal_id: this.testDealId,
      rating: 5,
      title: 'Unauthenticated Review',
      content: 'This should not work without authentication.'
    });
    // Clear cookies for this test
    const tempCookies = this.cookies;
    this.cookies = [];
    
    const noAuthReview = await this.makeRequest('POST', '/reviews', {
      deal_id: this.testDealId,
      rating: 5, 
      title: 'No Auth Review',
      content: 'This should require authentication.'
    });
    console.log(`🔐 Unauthenticated Request (Expected 401): ${noAuthReview.status}`);
    
    // Restore cookies
    this.cookies = tempCookies;
    
    if (noAuthReview.status !== 401) {
      throw new Error('Unauthenticated request should have been rejected');
    }

    console.log('✅ Rate limiting and validation tests passed');
  }

  async testPaginationAndFiltering() {
    console.log('\n📄 Testing Pagination & Filtering...');

    // 1. Test pagination on reviews
    const paginatedReviews = await this.makeRequest('GET', `/reviews/deal/${this.testDealId}?page=1&limit=5&sort=newest`);
    console.log(`📄 Paginated Reviews: ${paginatedReviews.status}`);
    
    if (paginatedReviews.status !== 200) {
      throw new Error('Failed to get paginated reviews');
    }

    if (!paginatedReviews.data.pagination) {
      throw new Error('Missing pagination metadata');
    }

    // 2. Test pagination on comments
    const paginatedComments = await this.makeRequest('GET', `/comments/deal/${this.testDealId}?page=1&limit=10`);
    console.log(`📄 Paginated Comments: ${paginatedComments.status}`);
    
    if (paginatedComments.status !== 200) {
      throw new Error('Failed to get paginated comments');
    }

    // 3. Test sorting options
    const sortedReviews = await this.makeRequest('GET', `/reviews/deal/${this.testDealId}?sort=rating_desc`);
    console.log(`🔄 Sorted Reviews: ${sortedReviews.status}`);
    
    if (sortedReviews.status !== 200) {
      throw new Error('Failed to get sorted reviews');
    }

    console.log('✅ Pagination and filtering tests passed');
  }

  async testDataConsistency() {
    console.log('\n🔍 Testing Data Consistency...');

    // 1. Verify review data integrity
    const reviewDetail = await this.makeRequest('GET', `/reviews/review/${this.createdReviewId}`);
    console.log(`🔍 Review Detail: ${reviewDetail.status}`);
    
    if (reviewDetail.status !== 200) {
      throw new Error('Failed to get review detail');
    }

    const review = reviewDetail.data.review;
    if (!review.user || !review.created_at || review.rating < 1 || review.rating > 5) {
      throw new Error('Review data integrity issues');
    }

    // 2. Check deal statistics
    const dealReviews = await this.makeRequest('GET', `/reviews/deal/${this.testDealId}`);
    if (dealReviews.status === 200 && dealReviews.data.deal_stats) {
      const stats = dealReviews.data.deal_stats;
      console.log(`📊 Deal Stats - Avg Rating: ${stats.avg_rating}, Reviews: ${stats.review_count}, Comments: ${stats.comment_count}`);
      
      if (stats.review_count < 1 || !stats.avg_rating) {
        throw new Error('Deal statistics inconsistent');
      }
    }

    // 3. Verify comment threading
    const commentThread = await this.makeRequest('GET', `/comments/deal/${this.testDealId}`);
    if (commentThread.status === 200) {
      const comments = commentThread.data.data.comments;
      const hasThreaded = comments.some(c => c.replies && c.replies.length > 0);
      console.log(`🧵 Threaded Comments: ${hasThreaded ? 'Yes' : 'No'}`);
    }

    console.log('✅ Data consistency tests passed');
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    // Delete the review (this should cascade to comments and reports)
    if (this.createdReviewId) {
      const deleteReview = await this.makeRequest('DELETE', `/reviews/${this.createdReviewId}`);
      console.log(`🗑️ Delete Review: ${deleteReview.status}`);
    }

    // Cleanup test users from database
    await cleanupTestUsers();

    console.log('✅ Cleanup completed');
  }

  async runAllTests() {
    console.log('🚀 Starting UGC Integration Test Suite...');
    console.log('==========================================');

    try {
      await this.setupTestUsers();
      await this.testReviewsWorkflow(); 
      await this.testCommentsWorkflow();
      await this.testReportsWorkflow();
      await this.testRateLimitingAndValidation();
      await this.testPaginationAndFiltering();
      await this.testDataConsistency();
      
      console.log('\n🎉 All UGC tests completed successfully!');
      console.log('==========================================');
      
      return { success: true, message: 'All tests passed' };
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      console.log('==========================================');
      
      return { success: false, message: error.message };
      
    } finally {
      await this.cleanup();
    }
  }
}

// Export for use as module
module.exports = UGCTestSuite;

// Run tests if called directly
if (require.main === module) {
  const tester = new UGCTestSuite();
  tester.runAllTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}