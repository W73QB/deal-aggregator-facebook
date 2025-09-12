#!/bin/bash

# 🔧 Install DealRadarUS Startup Automation
# ========================================
# This script installs the daily automation to run at computer startup

echo "🚀 Installing DealRadarUS Daily Automation Startup System..."
echo "============================================================"

# Create Launch Agents directory if it doesn't exist
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENTS_DIR"

# Copy the plist file to LaunchAgents
PLIST_FILE="com.dealradarus.dailyautomation.plist"
cp "./automation/$PLIST_FILE" "$LAUNCH_AGENTS_DIR/"

echo "✅ Copied $PLIST_FILE to $LAUNCH_AGENTS_DIR"

# Set proper permissions
chmod 644 "$LAUNCH_AGENTS_DIR/$PLIST_FILE"

# Load the launch agent
launchctl unload "$LAUNCH_AGENTS_DIR/$PLIST_FILE" 2>/dev/null || true
launchctl load "$LAUNCH_AGENTS_DIR/$PLIST_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Launch Agent loaded successfully"
else
    echo "❌ Failed to load Launch Agent"
    exit 1
fi

# Enable the service
launchctl enable "gui/$(id -u)/$PLIST_FILE"

echo ""
echo "🎉 INSTALLATION COMPLETE!"
echo "========================"
echo ""
echo "✅ Daily automation will now start automatically when you boot your computer"
echo "✅ The system will:"
echo "   📱 Post automatically to Facebook (8AM, 12:30PM, 6PM)"
echo "   📝 Generate and publish blog posts daily"
echo "   📈 Redirect Facebook traffic to your website"
echo "   📊 Monitor performance and optimize content"
echo ""
echo "📋 Log files location: ./automation/logs/"
echo "📋 To check status: launchctl list | grep dealradarus"
echo "📋 To stop: launchctl unload ~/Library/LaunchAgents/$PLIST_FILE"
echo "📋 To restart: launchctl load ~/Library/LaunchAgents/$PLIST_FILE"
echo ""
echo "🔄 System will start working after your next computer restart"
echo "   Or run manually: ./automation/startup-automation.sh"