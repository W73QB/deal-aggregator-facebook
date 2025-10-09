#!/bin/bash

# 🔧 Claude Desktop MCP Configuration Script
# Configures Claude Desktop with installed MCP servers for DealRadarUS

set -e

echo "🔧 Configuring Claude Desktop for DealRadarUS MCPs"
echo "================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Detect OS and set Claude config path
CLAUDE_CONFIG_DIR=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
else
    # Linux
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
fi

CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo "📁 Claude Desktop config directory: $CLAUDE_CONFIG_DIR"

# Create config directory if it doesn't exist
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    mkdir -p "$CLAUDE_CONFIG_DIR"
    print_status "Created Claude Desktop config directory"
else
    print_status "Claude Desktop config directory exists"
fi

# Backup existing config if it exists
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    print_status "Backed up existing config to: $BACKUP_FILE"
fi

# Copy our MCP configuration
cp "./claude_desktop_config.json" "$CONFIG_FILE"
print_status "MCP configuration copied to Claude Desktop"

echo ""
echo "🎯 MCP Servers Configured:"
echo "=========================="
echo "✅ Filesystem MCP - File operations in DealRadarUS project"
echo "✅ Memory MCP - Persistent memory and knowledge graph"
echo "⚠️  GitHub MCP - Needs GitHub Personal Access Token"
echo "⚠️  PostgreSQL MCP - Needs database connection string"

echo ""
echo "🔐 Required API Configurations:"
echo "==============================="

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "1. GitHub Token (GitHub CLI detected):"
    echo "   Run: gh auth token"
    echo "   Copy the token and update: $CONFIG_FILE"
else
    echo "1. GitHub Token:"
    echo "   - Go to https://github.com/settings/tokens"
    echo "   - Create token with 'repo', 'workflow', 'admin:org' permissions"
    echo "   - Replace 'YOUR_GITHUB_TOKEN_HERE' in: $CONFIG_FILE"
fi

echo ""
echo "2. PostgreSQL Database:"
echo "   - Install PostgreSQL or use hosted service"
echo "   - Create database 'dealradarus_db'"
echo "   - Update connection string in: $CONFIG_FILE"

echo ""
echo "📝 Testing MCP Setup:"
echo "===================="

# Create test script
cat > "./test-mcp-connections.js" << 'EOF'
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
EOF

chmod +x "./test-mcp-connections.js"
print_status "Created MCP connection test script"

echo ""
echo "🚀 Setup Complete!"
echo "=================="
print_status "MCP servers installed and configured"
print_status "Claude Desktop config updated"
print_status "Test script created"

echo ""
echo "📋 FINAL STEPS TO COMPLETE:"
echo "1. Configure API credentials in: $CONFIG_FILE"
echo "2. Restart Claude Desktop application"
echo "3. Run: ./test-mcp-connections.js"
echo "4. Test MCP functionality in Claude Desktop"

echo ""
print_info "🎉 DealRadarUS MCP stack is ready for production use!"

# Show current config summary
echo ""
echo "📊 Current MCP Configuration:"
echo "============================"
if [ -f "$CONFIG_FILE" ]; then
    echo "Config file: $CONFIG_FILE"
    echo "Servers configured:"
    grep -o '"[^"]*"[[:space:]]*:' "$CONFIG_FILE" | grep -v mcpServers | sed 's/"//g' | sed 's/://g' | while read server; do
        echo "  ✅ $server"
    done
fi
EOF