const { ConfigLoader } = require('../../core/utils/config');
const { FacebookAPI } = require('../../core/utils/facebook-api');

// Load environment
const env = ConfigLoader.loadEnvironment();

const FB_PAGE_ID = env.FB_PAGE_ID;
const FB_ACCESS_TOKEN = env.FB_PAGE_ACCESS_TOKEN;

async function verifyToken() {
  console.log('STEP 1 — Verifying Facebook Page Token...');
  
  const facebookAPI = new FacebookAPI(FB_PAGE_ID, FB_ACCESS_TOKEN);
  const result = await facebookAPI.validateCredentials();
  
  if (result.success) {
    console.log(`📋 Retrieved user data: name="${result.pageName}", id="${result.pageId}"`);
    console.log('✅ Token verification successful');
    console.log(`✅ Page Name: ${result.pageName}`);
    console.log(`✅ Page ID matches: ${result.pageId}`);
    return true;
  } else {
    console.log('❌ Token verification failed');
    if (result.error) {
      console.log('Response:', result.error);
    }
    if (result.message.includes('different page')) {
      console.log('❌ Token hiện tại không phải PAGE token');
      console.log(`Expected Page ID: ${FB_PAGE_ID}`);
      console.log(`Token returns ID: ${result.pageId}`);
    }
    console.log(`Error: ${result.message}`);
    return false;
  }
}

async function postTestMessage() {
  console.log('\nSTEP 2 — Posting test message...');
  
  const isoDateTime = new Date().toISOString();
  const message = `✅ Test API: Bot đã có quyền đăng bài. Thời gian: ${isoDateTime}`;
  
  const facebookAPI = new FacebookAPI(FB_PAGE_ID, FB_ACCESS_TOKEN);
  const result = await facebookAPI.postMessage({ message });
  
  if (result.success) {
    console.log('✅ POST OK | post_id =', result.postId);
    return result.postId;
  } else {
    console.log('❌ POST FAILED');
    if (result.error && result.error.error) {
      console.log(`Code: ${result.error.error.code || 'N/A'}`);
      console.log(`Subcode: ${result.error.error.error_subcode || 'N/A'}`);
      console.log(`Message: ${result.error.error.message || 'N/A'}`);
    } else if (result.error) {
      console.log('Response:', result.error);
    } else {
      console.log(`Error: ${result.message}`);
    }
    return null;
  }
}

async function getPermalink(postId) {
  console.log('\nSTEP 3 — Getting post permalink...');
  
  const facebookAPI = new FacebookAPI(FB_PAGE_ID, FB_ACCESS_TOKEN);
  
  try {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v23.0/${postId}?fields=permalink_url&access_token=${FB_ACCESS_TOKEN}`,
      method: 'GET',
      headers: {
        'User-Agent': 'DealAggregator/1.0'
      }
    };

    const response = await facebookAPI._makeRequest(options);
    
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