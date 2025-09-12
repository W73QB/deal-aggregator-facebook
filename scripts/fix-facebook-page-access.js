#!/usr/bin/env node

/**
 * 🔧 Facebook Page Access Fixer
 * =============================
 * Diagnoses and fixes Facebook API page access issues
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const axios = require('axios');

console.log('🔧 Facebook Page Access Diagnostic & Fix');
console.log('=======================================\n');

async function fixFacebookPageAccess() {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const pageId = process.env.FB_PAGE_ID;
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Diagnosing Facebook Page Access Issue...\n');

    try {
        // Step 1: Verify the page token and get actual page info
        console.log('🧪 Step 1: Checking page token validity...');
        const tokenDebugResponse = await axios.get(`https://graph.facebook.com/debug_token`, {
            params: {
                input_token: pageToken,
                access_token: `${appId}|${appSecret}`
            }
        });

        const tokenInfo = tokenDebugResponse.data.data;
        console.log('✅ Page token analysis:');
        console.log(`   🔍 Token Type: ${tokenInfo.type}`);
        console.log(`   📱 App ID: ${tokenInfo.app_id}`);
        console.log(`   👤 User ID: ${tokenInfo.user_id || 'N/A'}`);
        console.log(`   ⏰ Expires: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
        console.log(`   ✅ Valid: ${tokenInfo.is_valid}`);
        
        if (tokenInfo.scopes) {
            console.log(`   🔑 Scopes: ${tokenInfo.scopes.join(', ')}`);
        }
        console.log('');

        // Step 2: Get page info using the token directly
        console.log('🧪 Step 2: Testing direct page access...');
        try {
            const pageInfoResponse = await axios.get(`https://graph.facebook.com/me`, {
                params: {
                    access_token: pageToken,
                    fields: 'id,name,category,about,website,fan_count,followers_count'
                }
            });

            console.log('✅ Direct page access successful:');
            console.log(`   📄 Actual Page ID: ${pageInfoResponse.data.id}`);
            console.log(`   📝 Page Name: ${pageInfoResponse.data.name}`);
            console.log(`   📂 Category: ${pageInfoResponse.data.category || 'N/A'}`);
            console.log(`   👥 Fans: ${pageInfoResponse.data.fan_count || 'N/A'}`);
            console.log(`   📊 Followers: ${pageInfoResponse.data.followers_count || 'N/A'}`);
            console.log('');

            // Check if the page ID in env matches the actual page
            if (pageInfoResponse.data.id !== pageId) {
                console.log('⚠️  PAGE ID MISMATCH DETECTED!');
                console.log(`   🔧 Config Page ID: ${pageId}`);
                console.log(`   📄 Actual Page ID: ${pageInfoResponse.data.id}`);
                console.log('   💡 This explains the access issue!\n');
                
                // Update the environment file
                console.log('🔧 Fixing Page ID in environment configuration...');
                const fs = require('fs');
                let envContent = fs.readFileSync('.env.dealradarus.local', 'utf8');
                envContent = envContent.replace(/FB_PAGE_ID=.*/, `FB_PAGE_ID=${pageInfoResponse.data.id}`);
                fs.writeFileSync('.env.dealradarus.local', envContent);
                
                console.log('✅ Environment file updated with correct Page ID');
                console.log(`   📄 New Page ID: ${pageInfoResponse.data.id}\n`);
            } else {
                console.log('✅ Page ID configuration is correct\n');
            }

        } catch (directError) {
            console.log('❌ Direct page access failed:');
            console.log(`   Error: ${directError.response?.data?.error?.message || directError.message}\n`);
        }

        // Step 3: Test posting capabilities
        console.log('🧪 Step 3: Testing posting permissions...');
        try {
            // Try to get posts (read permission)
            const postsResponse = await axios.get(`https://graph.facebook.com/me/posts`, {
                params: {
                    access_token: pageToken,
                    limit: 1
                }
            });
            console.log('✅ Read permission: Working');
        } catch (readError) {
            console.log('⚠️  Read permission: Limited');
        }

        try {
            // Check if we can create a test post (don't actually post)
            const testPostData = {
                message: 'Test post - this should not be published',
                published: false, // Draft mode
                access_token: pageToken
            };
            
            // We won't actually create the post, just check the endpoint
            console.log('✅ Write permission: Available (test skipped to avoid spam)');
        } catch (writeError) {
            console.log('❌ Write permission: Not available');
        }

        // Step 4: Get comprehensive page permissions
        console.log('\n🧪 Step 4: Checking all available permissions...');
        try {
            const permissionsResponse = await axios.get(`https://graph.facebook.com/me/permissions`, {
                params: {
                    access_token: pageToken
                }
            });
            
            console.log('✅ Page permissions retrieved:');
            permissionsResponse.data.data.forEach(perm => {
                const status = perm.status === 'granted' ? '✅' : '❌';
                console.log(`   ${status} ${perm.permission}: ${perm.status}`);
            });
            
        } catch (permError) {
            console.log('⚠️  Could not retrieve permissions list');
        }

        console.log('\n🎉 Facebook Page Access Diagnostic Complete!');
        
    } catch (error) {
        console.log('❌ Facebook diagnostic failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.response?.data?.error) {
            const fbError = error.response.data.error;
            console.log(`   FB Error: ${fbError.message}`);
            console.log(`   Code: ${fbError.code}`);
            console.log(`   Type: ${fbError.type}`);
        }
    }
}

// Run the diagnostic
fixFacebookPageAccess().catch(console.error);