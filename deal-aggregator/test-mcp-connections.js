#!/usr/bin/env node

// Test MCP connections
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🧪 Testing MCP Connections');
console.log('=========================\n');

// Find Claude config
let configPath;
if (os.platform() === 'darwin') {
    configPath = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
} else if (os.platform() === 'win32') {
    configPath = path.join(os.homedir(), 'AppData/Roaming/Claude/claude_desktop_config.json');
} else {
    configPath = path.join(os.homedir(), '.config/claude/claude_desktop_config.json');
}

if (fs.existsSync(configPath)) {
    console.log('✅ Claude Desktop config found');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const servers = Object.keys(config.mcpServers || {});
    
    console.log(`✅ MCP Servers configured: ${servers.length}`);
    servers.forEach(server => {
        console.log(`   • ${server}`);
    });
    
    // Check credentials
    const needsGitHub = config.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN === 'YOUR_GITHUB_TOKEN_HERE';
    const needsDB = config.mcpServers?.postgres?.env?.POSTGRES_CONNECTION_STRING?.includes('username:password');
    
    console.log('\n🔐 Credential Status:');
    console.log(needsGitHub ? '⚠️  GitHub token needs configuration' : '✅ GitHub token configured');
    console.log(needsDB ? '⚠️  PostgreSQL connection needs configuration' : '✅ PostgreSQL configured');
    
} else {
    console.log('❌ Claude Desktop config not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Configure missing credentials in Claude config');
console.log('2. Restart Claude Desktop');
console.log('3. Look for MCP indicator in Claude chat input');
console.log('4. Test MCP commands in Claude conversation');
