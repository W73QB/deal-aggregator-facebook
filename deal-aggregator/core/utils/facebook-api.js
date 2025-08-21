/**
 * TODO: FACEBOOK API UTILITY MODULE
 * 
 * MỤC TIÊU: Gói các hàm gọi Facebook API (post, live post, test access)
 * 
 * HIỆN TẠI TRÙNG LẶP Ở:
 * - deal-aggregator/platforms/facebook/facebook-post.js
 * - deal-aggregator/platforms/facebook/facebook-post-live.js  
 * - deal-aggregator/platforms/facebook/test-facebook-access.js
 * 
 * FUNCTIONS TRÙNG LẶP (85% similarity):
 * - makeRequest() function (95% identical)
 * - Facebook credentials validation (80% identical)
 * - HTTPS request setup patterns (90% identical)
 * 
 * TODO IMPLEMENTATION:
 * - [ ] Tạo class FacebookAPI với constructor(pageId, accessToken)
 * - [ ] Methods:
 *   - makeRequest(options, postData)
 *   - validateCredentials()
 *   - postMessage(message, link)
 *   - testAccess()
 * - [ ] Error handling và timeout standardized
 * - [ ] Export module
 * - [ ] Refactor 3 Facebook files để sử dụng class này
 * 
 * ESTIMATED REDUCTION: ~150 lines duplicate code
 */

const https = require('https');
const querystring = require('querystring');

class FacebookAPI {
  /**
   * Facebook API client
   * @param {string} pageId - Facebook page ID
   * @param {string} accessToken - Facebook page access token
   * @param {Object} options - Configuration options
   * @param {number} options.timeoutMs - Request timeout in milliseconds
   * @param {string} options.baseURL - Facebook Graph API base URL
   */
  constructor(pageId, accessToken, options = {}) {
    this.pageId = pageId;
    this.accessToken = accessToken;
    this.timeoutMs = options.timeoutMs || 20000;
    this.baseURL = options.baseURL || 'graph.facebook.com';
    this.userAgent = 'DealAggregator/1.0';
  }

  /**
   * Make HTTPS request to Facebook API with timeout and retry
   * @param {Object} options - HTTPS request options
   * @param {string} postData - POST data for request body
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Object>} Response with statusCode and data
   */
  _makeRequest(options, postData = null, retryCount = 0) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (err) => {
        if (retryCount < 1 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
          console.log(`Network error, retrying... (${err.code})`);
          setTimeout(() => {
            this._makeRequest(options, postData, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          reject(err);
        }
      });

      req.setTimeout(this.timeoutMs, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  /**
   * Validate Facebook credentials by checking page access
   * @returns {Promise<Object>} Validation result with success status and data
   */
  async validateCredentials() {
    try {
      console.log('Verifying Facebook Page Token...');
      
      const options = {
        hostname: this.baseURL,
        path: `/v23.0/me?fields=id,name&access_token=${this.accessToken}`,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent
        }
      };

      const response = await this._makeRequest(options);
      
      if (response.statusCode === 200 && response.data.id) {
        const isCorrectPage = response.data.id === this.pageId;
        return {
          success: isCorrectPage,
          pageId: response.data.id,
          pageName: response.data.name,
          message: isCorrectPage ? 'Token valid for specified page' : 'Token valid but for different page'
        };
      } else {
        return {
          success: false,
          error: response.data.error || response.data,
          message: 'Token validation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Network error during validation'
      };
    }
  }

  /**
   * Post a message to Facebook page
   * @param {Object} params - Post parameters
   * @param {string} params.message - Message content
   * @param {string} params.link - Optional link to include
   * @returns {Promise<Object>} Post result with success status and post ID
   */
  async postMessage({ message, link = null }) {
    try {
      const postData = querystring.stringify({
        message: message,
        ...(link && { link }),
        access_token: this.accessToken
      });

      const options = {
        hostname: this.baseURL,
        path: '/v23.0/me/feed',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': this.userAgent
        }
      };

      const response = await this._makeRequest(options, postData);

      if (response.statusCode === 200 && response.data.id) {
        return {
          success: true,
          postId: response.data.id,
          message: 'Post created successfully'
        };
      } else {
        return {
          success: false,
          error: response.data.error || response.data,
          message: 'Failed to create post'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Network error during posting'
      };
    }
  }

  /**
   * Test Facebook API access and credentials
   * @returns {Promise<Object>} Test result with detailed status
   */
  async testAccess() {
    console.log('🔍 Testing Facebook API Access...\n');
    
    // Test 1: Validate credentials
    const credentialTest = await this.validateCredentials();
    console.log(`✅ Credential Test: ${credentialTest.success ? 'PASS' : 'FAIL'}`);
    if (credentialTest.success) {
      console.log(`   Page: ${credentialTest.pageName} (${credentialTest.pageId})`);
    } else {
      console.log(`   Error: ${credentialTest.message}`);
    }
    
    // Test 2: Check permissions
    try {
      const options = {
        hostname: this.baseURL,
        path: `/v23.0/me/permissions?access_token=${this.accessToken}`,
        method: 'GET',
        headers: { 'User-Agent': this.userAgent }
      };

      const permResponse = await this._makeRequest(options);
      const hasPublishPermission = permResponse.data.data?.some(
        perm => perm.permission === 'pages_manage_posts' && perm.status === 'granted'
      );
      
      console.log(`✅ Permission Test: ${hasPublishPermission ? 'PASS' : 'FAIL'}`);
      if (!hasPublishPermission) {
        console.log('   Missing: pages_manage_posts permission');
      }
      
      return {
        credentials: credentialTest.success,
        permissions: hasPublishPermission,
        overall: credentialTest.success && hasPublishPermission
      };
    } catch (error) {
      console.log(`❌ Permission Test: FAIL (${error.message})`);
      return {
        credentials: credentialTest.success,
        permissions: false,
        overall: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  FacebookAPI
};