const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

// Load environment
const env = JSON.parse(fs.readFileSync("../../config/.env.local.json", 'utf8'));

const FB_PAGE_ID = env.FB_PAGE_ID;
const FB_ACCESS_TOKEN = env.FB_PAGE_ACCESS_TOKEN;

// Helper function for HTTPS requests with timeout and retry
function makeRequest(options, postData = null, retryCount = 0) {
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
          makeRequest(options, postData, retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, 2000);
      } else {
        reject(err);
      }
    });

    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function verifyToken() {
  console.log('STEP 1 — Verifying Facebook Page Token...');
  
  const options = {
    hostname: 'graph.facebook.com',
    path: `/v23.0/me?fields=id,name&access_token=${FB_ACCESS_TOKEN}`,
    method: 'GET',
    headers: {
      'User-Agent': 'DealAggregator/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode !== 200) {
      console.log('❌ Token verification failed');
      console.log('Response:', response.data);
      return false;
    }

    const userData = response.data;
    console.log(`📋 Retrieved user data: name="${userData.name}", id="${userData.id}"`);
    
    if (userData.id !== FB_PAGE_ID) {
      console.log('❌ Token hiện tại không phải PAGE token');
      console.log(`Expected Page ID: ${FB_PAGE_ID}`);
      console.log(`Token returns ID: ${userData.id}`);
      console.log('Error payload:', userData);
      return false;
    }
    
    console.log('✅ Token verification successful');
    console.log(`✅ Page Name: ${userData.name}`);
    console.log(`✅ Page ID matches: ${userData.id}`);
    return true;
    
  } catch (error) {
    console.log('❌ Token verification failed with error:', error.message);
    return false;
  }
}

async function postTestMessage() {
  console.log('\nSTEP 2 — Posting test message...');
  
  const isoDateTime = new Date().toISOString();
  const message = `✅ Test API: Bot đã có quyền đăng bài. Thời gian: ${isoDateTime}`;
  
  const postData = querystring.stringify({
    message: message,
    access_token: FB_ACCESS_TOKEN
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: '/v23.0/me/feed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'DealAggregator/1.0'
    }
  };

  try {
    const response = await makeRequest(options, postData);
    
    if (response.statusCode !== 200) {
      console.log('❌ POST FAILED');
      const errorData = response.data;
      if (errorData.error) {
        console.log(`Code: ${errorData.error.code || 'N/A'}`);
        console.log(`Subcode: ${errorData.error.error_subcode || 'N/A'}`);
        console.log(`Message: ${errorData.error.message || 'N/A'}`);
      } else {
        console.log('Response:', errorData);
      }
      return null;
    }

    const postResult = response.data;
    if (postResult.id) {
      console.log('✅ POST OK | post_id =', postResult.id);
      return postResult.id;
    } else {
      console.log('❌ POST FAILED - No post ID returned');
      console.log('Response:', postResult);
      return null;
    }
    
  } catch (error) {
    console.log('❌ POST FAILED with error:', error.message);
    return null;
  }
}

async function getPermalink(postId) {
  console.log('\nSTEP 3 — Getting post permalink...');
  
  const options = {
    hostname: 'graph.facebook.com',
    path: `/v23.0/${postId}?fields=permalink_url&access_token=${FB_ACCESS_TOKEN}`,
    method: 'GET',
    headers: {
      'User-Agent': 'DealAggregator/1.0'
    }
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200 && response.data.permalink_url) {
      console.log('🔗 Permalink URL:', response.data.permalink_url);
      console.log('📱 Verify on browser at the above URL');
    } else {
      console.log('⚠️  Could not retrieve permalink');
    }
    
  } catch (error) {
    console.log('⚠️  Permalink retrieval failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔍 Facebook Page Access Test');
  console.log('============================');
  
  // Validate environment
  if (!FB_PAGE_ID || !FB_ACCESS_TOKEN) {
    console.log('❌ Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN in environment');
    return;
  }
  
  if (FB_PAGE_ID === '1234567890' || FB_ACCESS_TOKEN.includes('EAAG..long-lived')) {
    console.log('❌ Environment contains placeholder values');
    return;
  }
  
  console.log(`📊 Page ID: ${FB_PAGE_ID}`);
  console.log(`🔑 Token: [${FB_ACCESS_TOKEN.length} characters - not logging plaintext]`);
  
  // Step 1: Verify token
  const tokenValid = await verifyToken();
  if (!tokenValid) {
    console.log('\n❌ Test failed at token verification');
    return;
  }
  
  // Step 2: Post test message  
  const postId = await postTestMessage();
  if (!postId) {
    console.log('\n❌ Test failed at posting');
    return;
  }
  
  // Step 3: Get permalink (optional)
  await getPermalink(postId);
  
  console.log('\n✅ Facebook access test completed successfully!');
}

main().catch(console.error);