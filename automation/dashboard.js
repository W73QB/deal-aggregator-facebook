#!/usr/bin/env node

/**
 * 📊 Daily Automation Performance Dashboard  
 * =========================================
 * Real-time monitoring for automation performance
 */

const fs = require('fs');
const path = require('path');

class AutomationDashboard {
    constructor() {
        this.logFile = path.join(__dirname, 'logs/daily-automation.log');
        this.startupLogFile = path.join(__dirname, 'logs/startup.log');
    }

    // 📊 DISPLAY REAL-TIME DASHBOARD
    async showDashboard() {
        console.clear();
        console.log('🤖 DealRadarUS Daily Automation Dashboard');
        console.log('========================================\n');

        // System status
        const status = await this.getSystemStatus();
        console.log('📡 SYSTEM STATUS:');
        console.log(`   Automation Running: ${status.isRunning ? '✅ YES' : '❌ NO'}`);
        console.log(`   Last Activity: ${status.lastActivity || 'Unknown'}`);
        console.log(`   Uptime: ${status.uptime || 'Unknown'}\n`);

        // Today's performance
        const performance = await this.getTodayPerformance();
        console.log('📈 TODAY\'S PERFORMANCE:');
        console.log(`   Facebook Posts: ${performance.facebookPosts} 📱`);
        console.log(`   Blog Posts: ${performance.blogPosts} 📝`);
        console.log(`   Content Generated: ${performance.contentGenerated} 🤖`);
        console.log(`   Traffic Redirects: ${performance.trafficRedirects} 🔗`);
        console.log(`   Errors: ${performance.errors} ${performance.errors > 0 ? '⚠️' : '✅'}\n`);

        // AI Usage Stats
        const aiStats = await this.getAIStats();
        console.log('🧠 AI CONTENT STATS:');
        console.log(`   AI Generated: ${aiStats.aiGenerated} posts`);
        console.log(`   Template Generated: ${aiStats.templateGenerated} posts`);
        console.log(`   Success Rate: ${aiStats.successRate}%`);
        console.log(`   Estimated Cost: $${aiStats.estimatedCost}\n`);

        // Schedule status
        const schedule = await this.getScheduleStatus();
        console.log('⏰ SCHEDULE STATUS:');
        console.log(`   Next Morning Post: ${schedule.nextMorning} 🌅`);
        console.log(`   Next Lunch Post: ${schedule.nextLunch} 🌇`);
        console.log(`   Next Evening Post: ${schedule.nextEvening} 🌙`);
        console.log(`   Next Blog Post: ${schedule.nextBlog} 📝\n`);

        // Recent activity
        const recentActivity = await this.getRecentActivity();
        console.log('📋 RECENT ACTIVITY:');
        recentActivity.forEach(activity => {
            console.log(`   ${activity.time} - ${activity.action} ${activity.status}`);
        });

        console.log('\n🔄 Dashboard refreshes every 30 seconds...');
        console.log('🛑 Press Ctrl+C to exit dashboard');
    }

    // 📡 GET SYSTEM STATUS
    async getSystemStatus() {
        try {
            if (fs.existsSync(this.logFile)) {
                const logs = fs.readFileSync(this.logFile, 'utf-8');
                const lines = logs.split('\n').filter(line => line.trim());
                
                if (lines.length > 0) {
                    const lastLine = lines[lines.length - 1];
                    const timeMatch = lastLine.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
                    const lastActivity = timeMatch ? new Date(timeMatch[1]).toLocaleString() : 'Unknown';
                    
                    const isRunning = lines.some(line => 
                        line.includes('STARTED') && 
                        new Date() - new Date(line.split(' ')[0]) < 24 * 60 * 60 * 1000
                    );
                    
                    return {
                        isRunning,
                        lastActivity,
                        uptime: isRunning ? this.calculateUptime() : '0 hours'
                    };
                }
            }
            
            return { isRunning: false, lastActivity: 'No logs found', uptime: '0 hours' };
        } catch (error) {
            return { isRunning: false, lastActivity: 'Error reading logs', uptime: '0 hours' };
        }
    }

    // 📈 GET TODAY'S PERFORMANCE
    async getTodayPerformance() {
        const today = new Date().toDateString();
        let facebookPosts = 0;
        let blogPosts = 0;
        let contentGenerated = 0;
        let trafficRedirects = 0;
        let errors = 0;

        try {
            if (fs.existsSync(this.logFile)) {
                const logs = fs.readFileSync(this.logFile, 'utf-8');
                const todayLogs = logs.split('\n').filter(line => {
                    const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
                    return dateMatch && new Date(dateMatch[1]).toDateString() === today;
                });

                facebookPosts = todayLogs.filter(line => 
                    line.includes('Facebook post published successfully')).length;
                blogPosts = todayLogs.filter(line => 
                    line.includes('Blog post created:')).length;
                contentGenerated = todayLogs.filter(line => 
                    line.includes('generated successfully') || line.includes('Content generated')).length;
                trafficRedirects = todayLogs.filter(line => 
                    line.includes('tracking URL:') || line.includes('UTM tracking')).length;
                errors = todayLogs.filter(line => 
                    line.includes('❌') || line.includes('ERROR') || line.includes('failed:')).length;
            }
        } catch (error) {
            // Silent fail for file reading errors
        }

        return { facebookPosts, blogPosts, contentGenerated, trafficRedirects, errors };
    }

    // 🧠 GET AI USAGE STATS
    async getAIStats() {
        // Estimate based on logs (in production, this would read from actual stats)
        const performance = await this.getTodayPerformance();
        const aiGenerated = Math.round(performance.contentGenerated * 0.8); // ~80% AI
        const templateGenerated = performance.contentGenerated - aiGenerated;
        const successRate = performance.contentGenerated > 0 ? 
            Math.round((performance.contentGenerated - performance.errors) / performance.contentGenerated * 100) : 100;
        const estimatedCost = (aiGenerated * 0.002).toFixed(4); // ~$0.002 per AI generation

        return { aiGenerated, templateGenerated, successRate, estimatedCost };
    }

    // ⏰ GET SCHEDULE STATUS (US Eastern Time)
    async getScheduleStatus() {
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);

        const getNextTime = (hour, minute) => {
            const target = new Date(nowET);
            target.setHours(hour, minute, 0, 0);
            
            if (target <= now) {
                target.setDate(target.getDate() + 1);
            }
            
            return target.toLocaleTimeString('en-US', { 
                timeZone: 'America/New_York',
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }) + ' ET';
        };

        return {
            nextMorning: getNextTime(8, 0),
            nextLunch: getNextTime(12, 30),
            nextEvening: getNextTime(18, 0),
            nextBlog: getNextTime(9, 0) // Daily blog at 9 AM ET
        };
    }

    // 📋 GET RECENT ACTIVITY
    async getRecentActivity() {
        const activities = [];
        
        try {
            if (fs.existsSync(this.logFile)) {
                const logs = fs.readFileSync(this.logFile, 'utf-8');
                const lines = logs.split('\n').filter(line => line.trim());
                
                // Get last 5 meaningful log entries
                const recentLines = lines.slice(-10).reverse();
                
                recentLines.forEach(line => {
                    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
                    const time = timeMatch ? timeMatch[1] : 'Unknown';
                    
                    let action = 'Activity';
                    let status = '✅';
                    
                    if (line.includes('Facebook post published')) {
                        action = 'Facebook post published';
                        status = '📱';
                    } else if (line.includes('Blog post created')) {
                        action = 'Blog post created';
                        status = '📝';
                    } else if (line.includes('Content generated')) {
                        action = 'Content generated';
                        status = '🤖';
                    } else if (line.includes('❌') || line.includes('failed')) {
                        action = 'Error occurred';
                        status = '❌';
                    } else if (line.includes('Started') || line.includes('STARTED')) {
                        action = 'System started';
                        status = '🚀';
                    }
                    
                    if (activities.length < 5) {
                        activities.push({ time, action, status });
                    }
                });
            }
        } catch (error) {
            activities.push({ time: 'Error', action: 'Failed to read activity logs', status: '❌' });
        }
        
        return activities.length > 0 ? activities : [
            { time: 'No logs', action: 'No recent activity found', status: '💤' }
        ];
    }

    // ⏱️ CALCULATE UPTIME
    calculateUptime() {
        try {
            if (fs.existsSync(this.startupLogFile)) {
                const logs = fs.readFileSync(this.startupLogFile, 'utf-8');
                const startMatch = logs.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*Started/);
                
                if (startMatch) {
                    const startTime = new Date(startMatch[1]);
                    const uptime = Math.floor((new Date() - startTime) / (1000 * 60 * 60));
                    return `${uptime} hours`;
                }
            }
        } catch (error) {
            // Silent fail
        }
        
        return 'Unknown';
    }

    // 🔄 START LIVE DASHBOARD
    startLiveDashboard() {
        this.showDashboard();
        
        // Refresh every 30 seconds
        setInterval(() => {
            this.showDashboard();
        }, 30000);
    }
}

// Run dashboard if called directly
if (require.main === module) {
    const dashboard = new AutomationDashboard();
    
    console.log('🚀 Starting DealRadarUS Automation Dashboard...\n');
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
        console.log('\n\n👋 Dashboard stopped. Thanks for monitoring!');
        process.exit(0);
    });
    
    dashboard.startLiveDashboard();
}

module.exports = AutomationDashboard;