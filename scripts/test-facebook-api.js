#!/usr/bin/env node

/**
 * 📱 Facebook API Tester
 * ======================
 * Tests Facebook Graph API connectivity and permissions
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const axios = require('axios');

console.log('📱 Testing Facebook API Integration');
console.log('===================================\n');

async function testFacebookAPI() {
    const appId = process.env.FACEBOOK_APP_ID || process.env.FB_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.FB_APP_SECRET;
    const pageId = process.env.FB_PAGE_ID;
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
    
    console.log('🔧 Configuration:');
    console.log(`   📱 App ID: ${appId ? appId.substring(0, 8) + '...' : 'NOT SET'}`);
    console.log(`   🔐 App Secret: ${appSecret ? '[SET]' : 'NOT SET'}`);
    console.log(`   📄 Page ID: ${pageId ? pageId : 'NOT SET'}`);
    console.log(`   🎫 Page Token: ${pageToken ? '[SET]' : 'NOT SET'}\n`);

    if (!appId || !appSecret || !pageId || !pageToken) {
        console.log('❌ Missing required Facebook configuration');
        return;
    }

    try {
        // Test 1: Verify App Access Token
        console.log('🧪 Test 1: Generating App Access Token...');
        const appTokenResponse = await axios.get(`https://graph.facebook.com/oauth/access_token`, {
            params: {
                client_id: appId,
                client_secret: appSecret,
                grant_type: 'client_credentials'
            }
        });
        
        const appAccessToken = appTokenResponse.data.access_token;
        console.log('✅ App access token generated successfully');
        console.log(`   🎫 Token: ${appAccessToken.substring(0, 20)}...\n`);

        // Test 2: Verify Page Access Token
        console.log('🧪 Test 2: Verifying Page Access Token...');
        const tokenInfoResponse = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                access_token: pageToken,
                fields: 'id,name,access_token'
            }
        });
        
        console.log('✅ Page token verified successfully');
        console.log(`   📄 Page ID: ${tokenInfoResponse.data.id}`);
        console.log(`   📝 Page Name: ${tokenInfoResponse.data.name}\n`);

        // Test 3: Get Page Information
        console.log('🧪 Test 3: Fetching Page Details...');
        const pageInfoResponse = await axios.get(`https://graph.facebook.com/${pageId}`, {
            params: {
                access_token: pageToken,
                fields: 'id,name,category,fan_count,followers_count,about,website'
            }
        });
        
        const pageInfo = pageInfoResponse.data;
        console.log('✅ Page information retrieved');
        console.log(`   📝 Name: ${pageInfo.name}`);
        console.log(`   📂 Category: ${pageInfo.category || 'N/A'}`);
        console.log(`   👥 Fans: ${pageInfo.fan_count || 'N/A'}`);
        console.log(`   📊 Followers: ${pageInfo.followers_count || 'N/A'}`);
        console.log(`   🌐 Website: ${pageInfo.website || 'N/A'}\n`);

        // Test 4: Check Page Permissions
        console.log('🧪 Test 4: Checking Page Permissions...');
        const permissionsResponse = await axios.get(`https://graph.facebook.com/${pageId}`, {
            params: {
                access_token: pageToken,
                fields: 'tasks'
            }
        });
        
        if (permissionsResponse.data.tasks) {
            console.log('✅ Page permissions retrieved');
            console.log(`   🔑 Permissions: ${permissionsResponse.data.tasks.join(', ')}\n`);
        }

        // Test 5: Test Webhook Verification
        console.log('🧪 Test 5: Testing Webhook Configuration...');
        const webhookToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
        console.log(`   🔐 Webhook Token: ${webhookToken ? '[SET]' : 'NOT SET'}`);
        
        if (webhookToken) {
            console.log('✅ Webhook verification token configured\n');
        }

        // Test 6: Check Recent Posts (Read Permission)
        console.log('🧪 Test 6: Testing Read Permissions...');
        try {
            const postsResponse = await axios.get(`https://graph.facebook.com/${pageId}/posts`, {
                params: {
                    access_token: pageToken,
                    limit: 3,
                    fields: 'id,message,created_time'
                }
            });
            
            console.log('✅ Read permissions working');
            console.log(`   📋 Recent posts: ${postsResponse.data.data.length}`);
            
            if (postsResponse.data.data.length > 0) {
                postsResponse.data.data.forEach((post, index) => {
                    console.log(`   ${index + 1}. ${post.message ? post.message.substring(0, 50) + '...' : 'No message'}`);
                });
            }
        } catch (readError) {
            console.log('⚠️  Read permissions limited or no posts available');
            console.log(`   📋 Error: ${readError.response?.data?.error?.message || readError.message}`);
        }

        console.log('\n🎉 Facebook API integration test completed successfully!');
        console.log('✅ All core functionality appears to be working');

    } catch (error) {
        console.log('❌ Facebook API test failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.response) {
            const errorData = error.response.data;
            console.log(`   📊 Status: ${error.response.status}`);
            
            if (errorData.error) {
                console.log(`   🔍 FB Error: ${errorData.error.message}`);
                console.log(`   📝 Type: ${errorData.error.type}`);
                console.log(`   🔢 Code: ${errorData.error.code}`);
                
                if (errorData.error.code === 190) {
                    console.log('   🔑 Token issue - check access token validity');
                } else if (errorData.error.code === 100) {
                    console.log('   🚫 Permission issue - check app permissions');
                }
            }
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify Facebook App ID and Secret');
        console.log('   2. Check Page Access Token validity');
        console.log('   3. Confirm app has necessary permissions');
        console.log('   4. Ensure page is published and accessible');
    }
}

// Run the test
testFacebookAPI().catch(console.error);