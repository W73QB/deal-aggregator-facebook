#!/usr/bin/env node

/**
 * 🧮 Redis Connection Tester
 * ==========================
 * Tests Upstash Redis connectivity via REST API
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const axios = require('axios');

console.log('🧮 Testing Redis Cache Connectivity');
console.log('===================================\n');

async function testRedisConnection() {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const redisUrl = process.env.REDIS_URL;
    
    console.log('🔧 Configuration:');
    console.log(`   🌐 REST URL: ${restUrl ? restUrl.substring(0, 30) + '...' : 'NOT SET'}`);
    console.log(`   🎫 REST Token: ${restToken ? '[SET]' : 'NOT SET'}`);
    console.log(`   🔗 Redis URL: ${redisUrl ? 'rediss://default@...' : 'NOT SET'}\n`);

    if (!restUrl || !restToken) {
        console.log('❌ Missing Upstash Redis configuration');
        return;
    }

    try {
        const headers = {
            'Authorization': `Bearer ${restToken}`,
            'Content-Type': 'application/json'
        };

        // Test 1: Ping Redis
        console.log('🧪 Test 1: Redis PING...');
        const pingResponse = await axios.post(`${restUrl}/ping`, {}, { headers });
        console.log('✅ Redis PING successful');
        console.log(`   📨 Response: ${JSON.stringify(pingResponse.data)}\n`);

        // Test 2: Set a test key
        console.log('🧪 Test 2: Setting test key...');
        const testKey = `dealradarus_test_${Date.now()}`;
        const testValue = `Test value at ${new Date().toISOString()}`;
        
        const setResponse = await axios.post(`${restUrl}/set/${testKey}`, JSON.stringify(testValue), { headers });
        console.log('✅ Test key set successfully');
        console.log(`   🔑 Key: ${testKey}`);
        console.log(`   💾 Value: ${testValue}\n`);

        // Test 3: Get the test key
        console.log('🧪 Test 3: Retrieving test key...');
        const getResponse = await axios.get(`${restUrl}/get/${testKey}`, { headers });
        console.log('✅ Test key retrieved successfully');
        console.log(`   📊 Retrieved: ${JSON.stringify(getResponse.data)}\n`);

        // Test 4: Check Redis Info
        console.log('🧪 Test 4: Getting Redis server info...');
        try {
            const infoResponse = await axios.post(`${restUrl}/info`, {}, { headers });
            if (infoResponse.data && infoResponse.data.result) {
                const infoText = infoResponse.data.result;
                const serverVersion = infoText.match(/redis_version:([^\r\n]+)/)?.[1];
                const usedMemory = infoText.match(/used_memory_human:([^\r\n]+)/)?.[1];
                const connectedClients = infoText.match(/connected_clients:([^\r\n]+)/)?.[1];
                
                console.log('✅ Redis info retrieved');
                console.log(`   🚀 Version: ${serverVersion || 'Unknown'}`);
                console.log(`   💾 Memory: ${usedMemory || 'Unknown'}`);
                console.log(`   👥 Clients: ${connectedClients || 'Unknown'}\n`);
            }
        } catch (infoError) {
            console.log('⚠️  Redis info not available (limited permissions)\n');
        }

        // Test 5: Test key expiration
        console.log('🧪 Test 5: Testing key expiration...');
        const expireKey = `dealradarus_expire_test_${Date.now()}`;
        
        // Set key with 10 second expiration
        await axios.post(`${restUrl}/setex/${expireKey}/10`, JSON.stringify('expires in 10s'), { headers });
        
        // Check TTL
        const ttlResponse = await axios.get(`${restUrl}/ttl/${expireKey}`, { headers });
        console.log('✅ Key expiration test successful');
        console.log(`   ⏱️  TTL: ${ttlResponse.data.result} seconds\n`);

        // Test 6: Clean up test keys
        console.log('🧪 Test 6: Cleaning up test keys...');
        await axios.post(`${restUrl}/del/${testKey}`, {}, { headers });
        await axios.post(`${restUrl}/del/${expireKey}`, {}, { headers });
        console.log('✅ Test keys cleaned up\n');

        console.log('🎉 Redis connectivity test completed successfully!');
        console.log('✅ All cache operations are working correctly');

    } catch (error) {
        console.log('❌ Redis connectivity test failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.response) {
            console.log(`   📊 Status: ${error.response.status}`);
            console.log(`   📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
            
            if (error.response.status === 401) {
                console.log('   🔑 Authentication failed - check REST token');
            } else if (error.response.status === 403) {
                console.log('   🚫 Permission denied - verify token permissions');
            } else if (error.response.status === 404) {
                console.log('   🌐 Endpoint not found - check REST URL');
            }
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify Upstash Redis REST URL');
        console.log('   2. Check REST token validity');
        console.log('   3. Confirm Redis instance is active');
        console.log('   4. Test network connectivity to Upstash');
    }
}

// Run the test
testRedisConnection().catch(console.error);