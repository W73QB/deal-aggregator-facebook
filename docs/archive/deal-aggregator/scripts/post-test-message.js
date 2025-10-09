const fs = require('fs');
const https = require('https');
const querystring = require('querystring');

// Load environment (check both locations)
let env;
try {
  env = JSON.parse(fs.readFileSync('../config/.env.local.json', 'utf8'));
} catch (e) {
  try {
    env = JSON.parse(fs.readFileSync('config/.env.local.json', 'utf8'));
  } catch (e2) {
    console.log('❌ Could not find .env.local.json file');
    process.exit(1);
  }
}

const FB_PAGE_ID = env.FB_PAGE_ID;
const FB_ACCESS_TOKEN = env.FB_PAGE_ACCESS_TOKEN;

// Test message content
const testMessage = "A A A đã xong website";

console.log('🚀 Facebook Test Post');
console.log('====================');
console.log(`📝 Message: "${testMessage}"`);
console.log(`📊 Page ID: ${FB_PAGE_ID}`);
console.log(`🔑 Token: ${FB_ACCESS_TOKEN.length > 20 ? '[Valid length]' : '[Placeholder]'}`);

// Helper function for HTTPS requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(10000);

    if (postData) req.write(postData);
    req.end();
  });
}

async function postToFacebook() {
  // Check credentials first
  if (!FB_PAGE_ID || FB_PAGE_ID === 'YOUR_PAGE_ID') {
    console.log('❌ FB_PAGE_ID not configured. Please set your Facebook Page ID in config/.env.local.json');
    console.log('💡 To get your Page ID: Go to your Facebook Page → About → Page ID');
    return false;
  }

  if (!FB_ACCESS_TOKEN || FB_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN' || FB_ACCESS_TOKEN.length < 20) {
    console.log('❌ FB_PAGE_ACCESS_TOKEN not configured. Please set your Page Access Token in config/.env.local.json');
    console.log('💡 To get your token:');
    console.log('   1. Go to https://developers.facebook.com/');
    console.log('   2. Create/select your app');
    console.log('   3. Add Facebook Login product');
    console.log('   4. Get Page Access Token from Access Token Debugger');
    return false;
  }

  try {
    console.log('\n🔄 Posting to Facebook...');
    
    const postData = querystring.stringify({
      message: testMessage,
      access_token: FB_ACCESS_TOKEN
    });

    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v18.0/${FB_PAGE_ID}/feed`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const result = await makeRequest(options, postData);
    
    if (result.status === 200 && result.data.id) {
      console.log('✅ Successfully posted to Facebook!');
      console.log(`📬 Post ID: ${result.data.id}`);
      console.log(`🔗 View post: https://facebook.com/${result.data.id}`);
      return true;
    } else {
      console.log('❌ Facebook API Error:');
      console.log(JSON.stringify(result.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Network Error:');
    console.log(error.message);
    return false;
  }
}

// Run the post
postToFacebook().then(success => {
  if (success) {
    console.log('\n🎉 Test post completed successfully!');
  } else {
    console.log('\n⚠️  Configure your Facebook credentials to enable posting.');
    console.log('📝 Edit: config/.env.local.json');
  }
});