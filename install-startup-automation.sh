#!/bin/bash

# 🚀 Install DealRadarUS Startup Automation
# ========================================
# This script sets up automatic startup of your Facebook posting and blog generation system

echo "🚀 Installing DealRadarUS Startup Automation"
echo "============================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Creating necessary directories${NC}"

# Create logs directory
mkdir -p automation/logs
echo -e "${GREEN}✅ Logs directory created${NC}"

# Create LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents
echo -e "${GREEN}✅ LaunchAgents directory ready${NC}"

echo ""
echo -e "${BLUE}Step 2: Installing Launch Agent${NC}"

# Copy the plist file to LaunchAgents
cp automation/com.dealradarus.daily-automation.plist ~/Library/LaunchAgents/
echo -e "${GREEN}✅ Launch Agent plist installed${NC}"

echo ""
echo -e "${BLUE}Step 3: Setting up permissions${NC}"

# Make startup script executable
chmod +x automation/startup-automation.sh
echo -e "${GREEN}✅ Startup script made executable${NC}"

# Set correct permissions for plist
chmod 644 ~/Library/LaunchAgents/com.dealradarus.daily-automation.plist
echo -e "${GREEN}✅ Launch Agent permissions set${NC}"

echo ""
echo -e "${BLUE}Step 4: Loading Launch Agent${NC}"

# Load the launch agent
launchctl load ~/Library/LaunchAgents/com.dealradarus.daily-automation.plist
echo -e "${GREEN}✅ Launch Agent loaded${NC}"

# Start the service immediately for testing
launchctl start com.dealradarus.daily-automation
echo -e "${GREEN}✅ Automation service started${NC}"

echo ""
echo -e "${GREEN}🎉 STARTUP AUTOMATION INSTALLED SUCCESSFULLY!${NC}"
echo "==============================================="
echo ""
echo -e "${BLUE}📋 What happens now:${NC}"
echo "• ✅ Your system will automatically start the automation when you boot your computer"
echo "• ✅ Facebook posts will be published automatically (morning, lunch, evening)"
echo "• ✅ Blog posts will be generated daily with SEO optimization"
echo "• ✅ Traffic will be funneled from Facebook to your website"
echo "• ✅ All activities are logged for monitoring"
echo ""
echo -e "${BLUE}📊 Management Commands:${NC}"
echo "• Check status: launchctl list | grep dealradarus"
echo "• View logs: tail -f automation/logs/startup.log"
echo "• Stop service: launchctl stop com.dealradarus.daily-automation"
echo "• Unload service: launchctl unload ~/Library/LaunchAgents/com.dealradarus.daily-automation.plist"
echo ""
echo -e "${BLUE}📁 Log Files Location:${NC}"
echo "• Startup logs: automation/logs/startup.log"
echo "• Complete automation: automation/logs/complete.log"
echo "• System logs: automation/logs/launchd.log"
echo ""
echo -e "${YELLOW}💡 Pro Tip:${NC}"
echo "Your automation will start 60 seconds after login to ensure system stability."
echo "The first posts may take a few minutes to appear as the system initializes."
echo ""
echo -e "${GREEN}🚀 Your fully automated traffic generation system is now active!${NC}"
echo -e "${GREEN}💰 Sit back and watch as your system generates traffic and revenue automatically!${NC}"