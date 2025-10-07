#!/bin/bash

# 🚀 DealRadarUS Daily Automation Startup Script
# =============================================
# This script runs automatically when your computer starts
# Triggers the complete daily automation system

# Set working directory
cd "/Users/admin/projects/deal-aggregator-facebook"

# Log startup
echo "$(date): 🚀 DealRadarUS Daily Automation Starting..." >> automation/logs/startup.log

# Wait for network connection
echo "$(date): 📡 Waiting for network connection..." >> automation/logs/startup.log
while ! ping -c 1 google.com &> /dev/null; do
    sleep 5
done
echo "$(date): ✅ Network connected" >> automation/logs/startup.log

# Wait additional 30 seconds for system stability
sleep 30

# Load environment variables (filter ALL comments - start of line, inline, emojis)
# Only process lines with KEY=VALUE format (alphanumeric + underscore), strip inline comments
export $(grep -E '^[A-Z_][A-Z0-9_]*=.+' .env.dealradarus.local | sed 's/#.*$//' | sed 's/[[:space:]]*$//' | xargs)

# Start the complete automation master (viral edition)
echo "$(date): 🤖 Starting Complete Automation Master (Viral Edition)..." >> automation/logs/startup.log
node automation/complete-automation-master.cjs >> automation/logs/complete.log 2>&1 &

# Log completion
echo "$(date): ✅ Daily Automation Started Successfully" >> automation/logs/startup.log

# Keep the script running to maintain automation
tail -f automation/logs/complete.log