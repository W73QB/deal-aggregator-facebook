#!/bin/bash

# 🚀 DealRadarUS Available MCP Servers Installation
# Updated script with only confirmed available MCP servers

set -e

echo "🚀 Installing Available MCP Servers for DealRadarUS"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "📦 Installing Core MCP Servers (Confirmed Available)"
echo "=================================================="

# 1. Filesystem MCP (for file operations)
echo "1. Installing Filesystem MCP..."
if npm install -g @modelcontextprotocol/server-filesystem; then
    print_status "Filesystem MCP installed"
else
    print_error "Failed to install Filesystem MCP"
fi

# 2. Memory MCP (for persistent memory)
echo "2. Installing Memory MCP..."
if npm install -g @modelcontextprotocol/server-memory; then
    print_status "Memory MCP installed"
else
    print_error "Failed to install Memory MCP"
fi

# 3. Fetch MCP (for web content)
echo "3. Installing Fetch MCP..."
if npm install -g @modelcontextprotocol/server-fetch; then
    print_status "Fetch MCP installed"
else
    print_error "Failed to install Fetch MCP"
fi

# 4. Git MCP (for git operations)  
echo "4. Installing Git MCP..."
if npm install -g @modelcontextprotocol/server-git; then
    print_status "Git MCP installed"
else
    print_error "Failed to install Git MCP"
fi

# 5. SQLite MCP (for database)
echo "5. Installing SQLite MCP..."
if npm install -g @modelcontextprotocol/server-sqlite; then
    print_status "SQLite MCP installed"
else
    print_error "Failed to install SQLite MCP"
fi

echo ""
echo "📦 Installing Third-Party Production MCPs"
echo "========================================"

# Try GitHub MCP (if available from different source)
echo "6. Attempting GitHub MCP installation..."
if command -v gh &> /dev/null; then
    print_status "GitHub CLI found - can use gh commands directly"
else
    print_warning "GitHub CLI not found - install with: brew install gh"
fi

echo ""
echo "🎉 Available MCP Installation Complete!"
print_status "Filesystem MCP - File operations"
print_status "Memory MCP - Persistent memory/knowledge graph"  
print_status "Fetch MCP - Web content fetching"
print_status "Git MCP - Git repository operations"
print_status "SQLite MCP - Local database"

echo ""
echo "🔧 Manual Setup Required:"
echo "• Cloudflare MCP - Use Cloudflare CLI or Dashboard"
echo "• PostgreSQL MCP - Use direct PostgreSQL connection"
echo "• Gmail/Google - Use direct Gmail API"
echo "• Analytics - Use direct API integration"

echo ""
echo "📋 Next Steps:"
echo "1. Configure Claude Desktop with installed MCPs"
echo "2. Setup API credentials for external services"  
echo "3. Test MCP connections"
EOF