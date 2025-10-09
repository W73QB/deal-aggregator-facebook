#!/bin/bash

# 🚀 DealRadarUS MCP Stack Setup Script
# Automated installation and configuration for all required MCP servers

set -e  # Exit on any error

echo "🚀 DealRadarUS MCP Stack Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "📋 Checking Prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm first."
    exit 1
fi

# Check Claude Desktop config directory
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

if [ -d "$CLAUDE_CONFIG_DIR" ]; then
    print_status "Claude Desktop config directory found: $CLAUDE_CONFIG_DIR"
else
    print_warning "Claude Desktop config directory not found. Please install Claude Desktop first."
fi

echo ""

# Phase 1: Install Core MCP Servers
echo "📦 Phase 1: Installing Core MCP Servers (Production Ready)"
echo "========================================================="

echo "1. Installing GitHub MCP Server..."
npm install -g @modelcontextprotocol/server-github
print_status "GitHub MCP Server installed globally"

echo "2. Installing Filesystem MCP Server..."
npm install -g @modelcontextprotocol/server-filesystem
print_status "Filesystem MCP Server installed"

echo "3. Installing Memory MCP Server..."
npm install -g @modelcontextprotocol/server-memory
print_status "Memory MCP Server installed"

echo ""

# Phase 2: Install Additional MCP Servers
echo "📦 Phase 2: Installing Additional MCP Servers"
echo "============================================="

echo "4. Installing PostgreSQL MCP Server..."
npm install -g @modelcontextprotocol/server-postgres
print_status "PostgreSQL MCP Server installed"

echo "5. Installing Google MCP Server (for Gmail)..."
npm install -g @modelcontextprotocol/server-google
print_status "Google MCP Server installed"

echo "6. Installing SQLite MCP Server (fallback database)..."
npm install -g @modelcontextprotocol/server-sqlite
print_status "SQLite MCP Server installed"

echo ""

# Create Claude Desktop configuration
echo "⚙️ Creating Claude Desktop Configuration..."
echo "=========================================="

CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create backup if config exists
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "Existing config backed up"
fi

# Create config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Generate Claude Desktop configuration
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/admin/projects/deal-aggregator-facebook"]
    },
    "postgres": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/dealradarus_db"
      }
    },
    "google": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google"],
      "env": {
        "GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET": "YOUR_GOOGLE_CLIENT_SECRET"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "/Users/admin/projects/deal-aggregator-facebook/deal-aggregator/data/dealradarus.db"]
    }
  }
}
EOF

print_status "Claude Desktop configuration created: $CONFIG_FILE"

echo ""

# Create environment setup script
echo "📝 Creating Environment Configuration Script..."
echo "=============================================="

cat > "./setup-mcp-credentials.sh" << 'EOF'
#!/bin/bash

# 🔐 DealRadarUS MCP Credentials Setup Script
# Run this script to configure all API keys and credentials

echo "🔐 Setting up MCP Credentials for DealRadarUS"
echo "============================================"

# GitHub Personal Access Token
echo ""
echo "1. GitHub Setup:"
echo "   - Go to https://github.com/settings/tokens"  
echo "   - Create new token with repo, workflow, admin:org permissions"
echo "   - Copy the token and paste below:"
read -p "GitHub Personal Access Token: " GITHUB_TOKEN

# Update Claude config with GitHub token
sed -i.bak "s/YOUR_GITHUB_TOKEN_HERE/$GITHUB_TOKEN/g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "✅ GitHub token configured"

# Google/Gmail Setup
echo ""
echo "2. Google/Gmail Setup:" 
echo "   - Go to https://console.developers.google.com/"
echo "   - Create new project or select existing"
echo "   - Enable Gmail API"
echo "   - Create OAuth 2.0 credentials"
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET

# Update Claude config with Google credentials
sed -i.bak "s/YOUR_GOOGLE_CLIENT_ID/$GOOGLE_CLIENT_ID/g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
sed -i.bak "s/YOUR_GOOGLE_CLIENT_SECRET/$GOOGLE_CLIENT_SECRET/g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "✅ Google/Gmail credentials configured"

# PostgreSQL Setup
echo ""
echo "3. PostgreSQL Setup:"
echo "   - Install PostgreSQL locally or use hosted service"
echo "   - Create database 'dealradarus_db'"
read -p "PostgreSQL Connection String (postgresql://user:pass@host:port/db): " POSTGRES_URL

# Update Claude config with PostgreSQL URL
sed -i.bak "s|postgresql://username:password@localhost:5432/dealradarus_db|$POSTGRES_URL|g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "✅ PostgreSQL configured"

echo ""
echo "🎉 All MCP credentials configured!"
echo "Please restart Claude Desktop to apply changes."
EOF

chmod +x "./setup-mcp-credentials.sh"
print_status "Credentials setup script created: ./setup-mcp-credentials.sh"

echo ""

# Create database schema script
echo "🗄️ Creating Database Setup Script..."
echo "===================================="

cat > "./setup-database-schema.sql" << 'EOF'
-- DealRadarUS Database Schema Setup
-- Run this script in PostgreSQL to create the required tables

-- Create database (run as superuser)
-- CREATE DATABASE dealradarus_db;

-- Connect to dealradarus_db
\c dealradarus_db;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS deals;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS system;

-- Raw deals table (from crawling)
CREATE TABLE IF NOT EXISTS deals.raw_deals (
    id VARCHAR(255) PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    region VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    price_currency VARCHAR(10),
    price_amount DECIMAL(10,2),
    price_compare_currency VARCHAR(10),
    price_compare_amount DECIMAL(10,2),
    discount_text VARCHAR(100),
    category VARCHAR(100),
    image_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enriched deals table (after processing)
CREATE TABLE IF NOT EXISTS deals.enriched_deals (
    id VARCHAR(255) PRIMARY KEY,
    raw_deal_id VARCHAR(255) REFERENCES deals.raw_deals(id),
    quality_score INTEGER,
    affiliate_url TEXT,
    caption TEXT,
    enriched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selected deals table (for posting)  
CREATE TABLE IF NOT EXISTS deals.selected_deals (
    id VARCHAR(255) PRIMARY KEY,
    enriched_deal_id VARCHAR(255) REFERENCES deals.enriched_deals(id),
    selected_for_platform VARCHAR(50),
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE,
    post_id VARCHAR(255),
    post_status VARCHAR(50) DEFAULT 'pending'
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system.logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    module VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_deals_timestamp ON deals.raw_deals(timestamp);
CREATE INDEX IF NOT EXISTS idx_raw_deals_source ON deals.raw_deals(source);
CREATE INDEX IF NOT EXISTS idx_enriched_deals_quality_score ON deals.enriched_deals(quality_score);
CREATE INDEX IF NOT EXISTS idx_selected_deals_platform ON deals.selected_deals(selected_for_platform);
CREATE INDEX IF NOT EXISTS idx_selected_deals_status ON deals.selected_deals(post_status);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA deals TO current_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO current_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA system TO current_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO current_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA system TO current_user;

-- Insert sample data for testing
INSERT INTO deals.raw_deals (id, source, region, title, url, price_currency, price_amount, category) 
VALUES ('test_001', 'amazon_us', 'US', 'Test Deal', 'https://amazon.com/test', 'USD', 29.99, 'Electronics')
ON CONFLICT (id) DO NOTHING;

SELECT 'Database schema created successfully!' as status;
EOF

print_status "Database schema script created: ./setup-database-schema.sql"

echo ""

# Create verification script
echo "🔍 Creating MCP Verification Script..."
echo "===================================="

cat > "./verify-mcp-setup.js" << 'EOF'
#!/usr/bin/env node

// DealRadarUS MCP Setup Verification Script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 Verifying MCP Setup for DealRadarUS');
console.log('=====================================\n');

// Check Node.js and npm
console.log('1. Checking Node.js and npm...');
try {
    const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Node.js: ${nodeVersion}`);
    console.log(`   ✅ npm: ${npmVersion}`);
} catch (error) {
    console.log('   ❌ Node.js or npm not found');
}

// Check installed MCP servers
console.log('\n2. Checking installed MCP servers...');
const mcpServers = [
    '@modelcontextprotocol/server-github',
    '@modelcontextprotocol/server-filesystem', 
    '@modelcontextprotocol/server-memory',
    '@modelcontextprotocol/server-postgres',
    '@modelcontextprotocol/server-google',
    '@modelcontextprotocol/server-sqlite'
];

mcpServers.forEach(server => {
    try {
        execSync(`npm list -g ${server}`, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`   ✅ ${server}`);
    } catch (error) {
        console.log(`   ❌ ${server} - Not installed globally`);
    }
});

// Check Claude Desktop config
console.log('\n3. Checking Claude Desktop configuration...');
let configPath;
if (os.platform() === 'darwin') {
    configPath = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
} else if (os.platform() === 'win32') {
    configPath = path.join(os.homedir(), 'AppData/Roaming/Claude/claude_desktop_config.json');
} else {
    configPath = path.join(os.homedir(), '.config/claude/claude_desktop_config.json');
}

if (fs.existsSync(configPath)) {
    console.log(`   ✅ Claude config found: ${configPath}`);
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const servers = Object.keys(config.mcpServers || {});
        console.log(`   ✅ Configured MCP servers: ${servers.join(', ')}`);
        
        // Check for placeholder values
        const hasGitHubToken = config.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN !== 'YOUR_GITHUB_TOKEN_HERE';
        const hasGoogleCreds = config.mcpServers?.google?.env?.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';
        
        if (hasGitHubToken) {
            console.log('   ✅ GitHub token configured');
        } else {
            console.log('   ⚠️  GitHub token needs configuration');
        }
        
        if (hasGoogleCreds) {
            console.log('   ✅ Google credentials configured'); 
        } else {
            console.log('   ⚠️  Google credentials need configuration');
        }
        
    } catch (error) {
        console.log('   ❌ Invalid JSON in Claude config');
    }
} else {
    console.log(`   ❌ Claude config not found: ${configPath}`);
}

// Check project structure
console.log('\n4. Checking DealRadarUS project structure...');
const projectPath = '/Users/admin/projects/deal-aggregator-facebook/deal-aggregator';
if (fs.existsSync(projectPath)) {
    console.log(`   ✅ Project found: ${projectPath}`);
    
    const requiredDirs = ['core', 'platforms', 'data', 'config', 'scripts'];
    requiredDirs.forEach(dir => {
        const dirPath = path.join(projectPath, dir);
        if (fs.existsSync(dirPath)) {
            console.log(`   ✅ ${dir}/ directory exists`);
        } else {
            console.log(`   ❌ ${dir}/ directory missing`);
        }
    });
} else {
    console.log(`   ❌ Project not found: ${projectPath}`);
}

console.log('\n🎉 MCP Setup Verification Complete!');
console.log('\nNext steps:');
console.log('1. Run ./setup-mcp-credentials.sh to configure API keys');
console.log('2. Setup PostgreSQL database with ./setup-database-schema.sql');
console.log('3. Restart Claude Desktop to apply MCP configuration');
console.log('4. Test MCP connections in Claude Desktop');
EOF

chmod +x "./verify-mcp-setup.js"
print_status "MCP verification script created: ./verify-mcp-setup.js"

echo ""

# Final summary
echo "🎉 MCP Stack Setup Complete!"
echo "============================"
echo ""
print_status "All MCP servers installed globally"
print_status "Claude Desktop configuration created"
print_status "Database schema script ready"  
print_status "Credentials setup script ready"
print_status "Verification script ready"

echo ""
echo "📋 Next Steps:"
echo "1. Run: ./setup-mcp-credentials.sh (configure API keys)"
echo "2. Setup PostgreSQL database with: ./setup-database-schema.sql"
echo "3. Restart Claude Desktop to load MCP configuration"
echo "4. Run: ./verify-mcp-setup.js (verify everything works)"
echo ""
print_info "All MCP servers are now ready for DealRadarUS production deployment!"

echo ""
echo "🔧 MCP Servers Installed:"
echo "• GitHub MCP - Version control & CI/CD"
echo "• Filesystem MCP - File operations"
echo "• PostgreSQL MCP - Database management"
echo "• Google MCP - Gmail & Google services"
echo "• SQLite MCP - Local database fallback"
echo "• Memory MCP - Session memory"

echo ""
print_warning "Important: Configure your API keys using ./setup-mcp-credentials.sh before use!"
EOF