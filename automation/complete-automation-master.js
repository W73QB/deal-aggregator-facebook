#!/usr/bin/env node

/**
 * 🤖 Complete Automation Master - VIRAL EDITION
 * =============================================
 * Full automation: startup → blog creation → viral distribution → social posting
 * Runs automatically when computer starts + scheduled posts
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const SmartContentGenerator = require('./smart-content-generator');
const AdvancedBlogEngine = require('./advanced-blog-engine');
const ViralDistributionEngine = require('./viral-distribution-engine');
const FacebookComplianceSystem = require('./facebook-compliance-system');
const { Client } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CompleteAutomationMaster {
    constructor() {
        this.contentGenerator = new SmartContentGenerator();
        this.blogEngine = new AdvancedBlogEngine();
        this.viralEngine = new ViralDistributionEngine();
        this.complianceSystem = new FacebookComplianceSystem();
        this.isRunning = false;
        
        this.dailyStats = {
            startTime: new Date(),
            facebookPosts: 0,
            blogPosts: 0,
            viralDistributions: 0,
            totalReach: 0,
            platformsUsed: [],
            errors: []
        };
        
        // US Eastern Time schedule
        this.schedule = {
            morning: { hour: 8, minute: 0 },    // 8:00 AM ET
            lunch: { hour: 12, minute: 30 },    // 12:30 PM ET
            evening: { hour: 18, minute: 0 },   // 6:00 PM ET
            blog: { hour: 9, minute: 0 }        // 9:00 AM ET (daily viral blog)
        };
        
        // Set timezone to US Eastern
        process.env.TZ = 'America/New_York';
        
        this.logFile = path.join(__dirname, 'logs/complete-automation.log');
        this.ensureLogDirectory();
    }

    // 🚀 MAIN STARTUP - CALLED WHEN COMPUTER STARTS
    async startCompleteAutomation() {
        if (this.isRunning) {
            this.log('⚠️  Complete automation already running');
            return;
        }

        this.isRunning = true;
        this.log('🚀 COMPLETE AUTOMATION MASTER STARTED');
        this.log('====================================');

        try {
            // 1. Run startup tasks
            await this.runStartupTasks();
            
            // 2. Schedule all recurring tasks
            this.scheduleRecurringTasks();
            
            // 3. Start monitoring
            this.startMonitoring();
            
            this.log('✅ Complete automation system fully operational');
            this.log(`📅 Next Facebook post: ${this.getNextPostTime()}`);
            this.log(`📝 Next viral blog: ${this.getNextBlogTime()}`);
            
        } catch (error) {
            this.log(`❌ Startup failed: ${error.message}`);
            this.dailyStats.errors.push(error.message);
        }
    }

    // 🌅 STARTUP TASKS
    async runStartupTasks() {
        this.log('🌅 Running startup tasks...');
        
        // 1. System health check
        await this.checkSystemHealth();
        
        // 2. Create morning content
        this.log('🌅 Creating morning content...');
        await this.publishFacebookPost('morning');
        
        // 3. Create daily viral blog + distribution
        await this.createViralBlogWithDistribution();
        
        this.log('✅ Startup tasks completed');
    }

    // 📅 SCHEDULE ALL RECURRING TASKS
    scheduleRecurringTasks() {
        this.log('📅 Scheduling recurring tasks...');
        
        // Schedule Facebook posts (3x daily)
        this.schedulePost('morning', this.schedule.morning);
        this.schedulePost('lunch', this.schedule.lunch);
        this.schedulePost('evening', this.schedule.evening);
        
        // Schedule daily viral blog
        this.scheduleViralBlog();
        
        this.log('✅ All recurring tasks scheduled');
    }

    // 📝 CREATE VIRAL BLOG WITH FULL DISTRIBUTION
    async createViralBlogWithDistribution() {
        this.log('📝 Creating viral blog with multi-platform distribution...');
        
        try {
            // 1. Get trending deals
            const deals = await this.getTrendingDeals(3);
            if (deals.length === 0) {
                deals.push(...this.createFallbackDeals());
            }
            
            // 2. Analyze trends
            this.log('🔍 Analyzing trending topics...');
            await this.blogEngine.analyzeTrends();
            
            // 3. Select personality
            const personalities = ['dealHunter', 'techExpert', 'budgetGuru'];
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            this.log(`👤 Using ${personality} personality...`);
            
            // 4. Create human-like blog
            const blogData = await this.blogEngine.createHumanBlogPost(deals, personality);
            
            // 5. Generate HTML
            const htmlContent = this.blogEngine.createHumanBlogHTML(blogData, deals);
            
            // 6. Save blog
            const blogFileName = `viral-deals-${this.getDateString()}.html`;
            const blogPath = path.join(__dirname, `../dist/blog/${blogFileName}`);
            
            const blogDir = path.dirname(blogPath);
            if (!fs.existsSync(blogDir)) {
                fs.mkdirSync(blogDir, { recursive: true });
            }
            
            fs.writeFileSync(blogPath, htmlContent);
            this.log(`✅ Viral blog saved: ${blogFileName}`);
            
            // 7. VIRAL DISTRIBUTION TO ALL PLATFORMS
            this.log('🚀 Executing viral distribution...');
            const distribution = await this.viralEngine.distributeContent(blogData, deals);
            
            // 8. Update stats
            this.dailyStats.blogPosts++;
            this.dailyStats.viralDistributions++;
            this.dailyStats.totalReach += distribution.summary.estimatedReach;
            this.dailyStats.platformsUsed = distribution.summary.topPerformingPlatforms;
            
            this.log(`✅ Viral campaign complete!`);
            this.log(`📊 Reach: ${distribution.summary.estimatedReach.toLocaleString()} people`);
            this.log(`📱 Platforms: ${distribution.summary.successfulPosts}/${distribution.summary.platformsTargeted}`);
            
            return {
                success: true,
                blog: blogData,
                distribution: distribution,
                fileName: blogFileName
            };
            
        } catch (error) {
            this.log(`❌ Viral blog creation failed: ${error.message}`);
            this.dailyStats.errors.push(error.message);
            return { success: false, error: error.message };
        }
    }

    // 📱 FACEBOOK POSTING WITH TRAFFIC OPTIMIZATION
    async publishFacebookPost(timeOfDay = 'general') {
        this.log(`📱 Publishing ${timeOfDay} Facebook post...`);
        
        try {
            const deals = await this.getTrendingDeals(1);
            if (deals.length === 0) {
                deals.push(this.createFallbackDeals()[0]);
            }
            
            const deal = deals[0];
            
            // Generate content with traffic optimization
            const postResult = await this.contentGenerator.generateFacebookPost(deal, {
                timeOfDay: timeOfDay,
                audience: 'deal_hunters',
                urgency: this.calculateUrgencyLevel(deal),
                includeWebsiteRedirection: true
            });
            
            if (!postResult.success) {
                throw new Error('Failed to generate Facebook content');
            }
            
            // Add UTM tracking
            const utmParams = this.generateUTMParameters(deal, timeOfDay);
            const trackingUrl = `${process.env.FRONTEND_URL}/deal/${deal.id}?${utmParams}`;
            
            const finalContent = postResult.content + `\n\n🔗 Get this deal: ${trackingUrl}\n🌐 More deals: DealRadarUS.com`;
            
            // Post to Facebook
            const fbResponse = await axios.post(
                `https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}/feed`,
                {
                    message: finalContent,
                    access_token: process.env.FB_PAGE_ACCESS_TOKEN
                }
            );
            
            this.dailyStats.facebookPosts++;
            this.log(`✅ Facebook post published: ${fbResponse.data.id}`);
            
            return { success: true, postId: fbResponse.data.id };
            
        } catch (error) {
            this.log(`❌ Facebook posting failed: ${error.message}`);
            this.dailyStats.errors.push(error.message);
            return { success: false, error: error.message };
        }
    }

    // ⏰ SCHEDULING FUNCTIONS
    schedulePost(timeOfDay, schedule) {
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);
        
        const scheduledTime = new Date(nowET);
        scheduledTime.setHours(schedule.hour, schedule.minute, 0, 0);
        
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const localNow = new Date();
        const localScheduled = new Date(scheduledTime.toLocaleString());
        const delay = localScheduled.getTime() - localNow.getTime();
        
        setTimeout(() => {
            this.publishFacebookPost(timeOfDay);
            setInterval(() => {
                this.publishFacebookPost(timeOfDay);
            }, 24 * 60 * 60 * 1000);
        }, delay);
        
        const etTime = scheduledTime.toLocaleString("en-US", {
            timeZone: "America/New_York",
            weekday: 'short',
            month: 'numeric',
            day: 'numeric', 
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        this.log(`📅 ${timeOfDay} post scheduled for ${etTime}`);
    }

    scheduleViralBlog() {
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);
        
        const scheduledTime = new Date(nowET);
        scheduledTime.setHours(this.schedule.blog.hour, this.schedule.blog.minute, 0, 0);
        
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const localNow = new Date();
        const localScheduled = new Date(scheduledTime.toLocaleString());
        const delay = localScheduled.getTime() - localNow.getTime();
        
        setTimeout(() => {
            this.createViralBlogWithDistribution();
            setInterval(() => {
                this.createViralBlogWithDistribution();
            }, 24 * 60 * 60 * 1000);
        }, delay);
        
        const etTime = scheduledTime.toLocaleString("en-US", {
            timeZone: "America/New_York",
            weekday: 'short',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        this.log(`📝 Viral blog scheduled for ${etTime}`);
    }

    // 🔧 UTILITY FUNCTIONS
    async getTrendingDeals(limit = 5) {
        try {
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            
            await client.connect();
            
            const result = await client.query(`
                SELECT id, title, price, original_price, discount_percentage, 
                       category, condition, deal_url, affiliate_url
                FROM deals 
                WHERE active = true AND discount_percentage > 20
                ORDER BY discount_percentage DESC, created_at DESC
                LIMIT $1
            `, [limit]);
            
            await client.end();
            
            return result.rows.map(row => ({
                id: row.id,
                title: row.title,
                price: parseFloat(row.price),
                originalPrice: parseFloat(row.original_price),
                discount: row.discount_percentage,
                category: row.category,
                condition: row.condition,
                dealUrl: row.deal_url,
                affiliateUrl: row.affiliate_url || row.deal_url
            }));
            
        } catch (error) {
            this.log(`❌ Database query failed: ${error.message}`);
            return [];
        }
    }

    createFallbackDeals() {
        return [
            {
                id: 'fallback-001',
                title: 'MacBook Air 13" M2 Chip',
                price: 899,
                originalPrice: 1299,
                discount: 31,
                category: 'electronics',
                condition: 'refurbished',
                affiliateUrl: 'https://dealradarus.com/deals/macbook-air'
            },
            {
                id: 'fallback-002',
                title: 'Smart Security Camera System',
                price: 119.99,
                originalPrice: 199.99,
                discount: 40,
                category: 'smart-home',
                condition: 'new',
                affiliateUrl: 'https://dealradarus.com/deals/security-camera'
            },
            {
                id: 'fallback-003',
                title: 'Wireless Gaming Headset Pro',
                price: 74.99,
                originalPrice: 149.99,
                discount: 50,
                category: 'gaming',
                condition: 'open-box',
                affiliateUrl: 'https://dealradarus.com/deals/gaming-headset'
            }
        ];
    }

    calculateUrgencyLevel(deal) {
        if (deal.discount >= 50) return 'high';
        if (deal.discount >= 30) return 'medium';
        return 'low';
    }

    generateUTMParameters(deal, timeOfDay) {
        const params = new URLSearchParams({
            utm_source: 'facebook',
            utm_medium: 'social',
            utm_campaign: 'daily_deals',
            utm_content: `${timeOfDay}_post`,
            utm_term: deal.category.toLowerCase(),
            utm_id: `fb_${deal.id}_${Date.now()}`
        });
        return params.toString();
    }

    getNextPostTime() {
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);
        
        const times = [
            { name: 'morning', hour: 8, minute: 0 },
            { name: 'lunch', hour: 12, minute: 30 },
            { name: 'evening', hour: 18, minute: 0 }
        ];
        
        for (const time of times) {
            const target = new Date(nowET);
            target.setHours(time.hour, time.minute, 0, 0);
            
            if (target > now) {
                return target.toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    weekday: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
            }
        }
        
        // Next day morning
        const tomorrow = new Date(nowET);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        
        return tomorrow.toLocaleString("en-US", {
            timeZone: "America/New_York", 
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    }

    getNextBlogTime() {
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);
        
        const blogTime = new Date(nowET);
        blogTime.setHours(9, 0, 0, 0);
        
        if (blogTime <= now) {
            blogTime.setDate(blogTime.getDate() + 1);
        }
        
        return blogTime.toLocaleString("en-US", {
            timeZone: "America/New_York",
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit', 
            timeZoneName: 'short'
        });
    }

    async checkSystemHealth() {
        this.log('🔍 Checking system health...');
        
        const health = {
            database: false,
            facebook: false,
            ai: false
        };
        
        try {
            // Test database
            const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
            await client.connect();
            await client.query('SELECT 1');
            await client.end();
            health.database = true;
        } catch (error) {
            this.log('❌ Database health check failed');
        }
        
        try {
            // Test Facebook API
            const response = await axios.get(`https://graph.facebook.com/v18.0/me?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`);
            health.facebook = !!response.data.id;
        } catch (error) {
            this.log('❌ Facebook API health check failed');
        }
        
        try {
            // Test AI
            const result = await this.contentGenerator.model.generateContent('Test');
            health.ai = !!result.response;
        } catch (error) {
            this.log('❌ AI health check failed');
        }
        
        this.log(`✅ System health - DB:${health.database}, FB:${health.facebook}, AI:${health.ai}`);
        return health;
    }

    startMonitoring() {
        this.log('📊 Starting monitoring system...');
        
        setInterval(() => {
            this.logStats();
        }, 60 * 60 * 1000); // Every hour
    }

    logStats() {
        const runtime = Math.round((new Date() - this.dailyStats.startTime) / (1000 * 60 * 60));
        this.log(`📊 Stats: FB:${this.dailyStats.facebookPosts}, Blogs:${this.dailyStats.blogPosts}, Reach:${this.dailyStats.totalReach.toLocaleString()}, Runtime:${runtime}h, Errors:${this.dailyStats.errors.length}`);
    }

    // 📝 LOGGING
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${message}`;
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error('Failed to write log:', error.message);
        }
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }
}

module.exports = CompleteAutomationMaster;

// Start automation if called directly
if (require.main === module) {
    const automation = new CompleteAutomationMaster();
    automation.startCompleteAutomation().catch(console.error);
    
    // Keep process alive
    setInterval(() => {}, 1000);
}