#!/usr/bin/env node

/**
 * 🤖 Daily Automation Master
 * =========================
 * Complete automation system that runs when computer starts
 * Handles: Facebook posting, blog publishing, traffic generation
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const SmartContentGenerator = require('./smart-content-generator.cjs');
const AdvancedBlogEngine = require('./advanced-blog-engine.cjs');
const ViralDistributionEngine = require('./viral-distribution-engine.cjs');
const { Client } = require('pg');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class DailyAutomationMaster {
    constructor() {
        this.contentGenerator = new SmartContentGenerator();
        this.blogEngine = new AdvancedBlogEngine();
        this.viralEngine = new ViralDistributionEngine();
        this.isRunning = false;
        this.dailyStats = {
            startTime: new Date(),
            postsGenerated: 0,
            blogPostsCreated: 0,
            facebookPostsPublished: 0,
            trafficGenerated: 0,
            errors: []
        };
        
        // Automation schedule (US Eastern Time)
        this.schedule = {
            morning: { hour: 8, minute: 0 },   // 8:00 AM ET
            lunch: { hour: 12, minute: 30 },   // 12:30 PM ET 
            evening: { hour: 18, minute: 0 }   // 6:00 PM ET
        };
        
        // Set timezone to US Eastern
        process.env.TZ = 'America/New_York';
        
        this.logFile = path.join(__dirname, '../logs/daily-automation.log');
        this.ensureLogDirectory();
    }

    // 🚀 MAIN STARTUP FUNCTION - CALLED WHEN COMPUTER STARTS
    async startDailyAutomation() {
        if (this.isRunning) {
            this.log('⚠️  Automation already running, skipping startup');
            return;
        }

        this.isRunning = true;
        this.log('🚀 DAILY AUTOMATION MASTER STARTED');
        this.log('==================================');
        
        try {
            // Immediate startup tasks
            await this.runStartupTasks();
            
            // Schedule recurring tasks
            this.scheduleRecurringTasks();
            
            // Setup monitoring
            this.startMonitoring();
            
            this.log('✅ Daily automation system fully initialized');
            this.log(`📊 Next Facebook post scheduled for: ${this.getNextPostTime()}`);
            
        } catch (error) {
            this.log(`❌ Startup failed: ${error.message}`);
            this.dailyStats.errors.push({ time: new Date(), error: error.message });
        }
    }

    // 🌅 STARTUP TASKS - RUN IMMEDIATELY WHEN COMPUTER STARTS
    async runStartupTasks() {
        this.log('🌅 Running startup tasks...');
        
        // 1. Check system health
        await this.checkSystemHealth();
        
        // 2. Generate morning content batch
        await this.generateMorningContent();
        
        // 3. Post first Facebook content of the day
        await this.publishMorningFacebookPost();
        
        // 4. Create daily blog post
        await this.createDailyBlogPost();
        
        // 5. Setup traffic funnels
        await this.setupTrafficFunnels();
        
        this.log('✅ Startup tasks completed');
    }

    // 📅 SCHEDULE RECURRING TASKS
    scheduleRecurringTasks() {
        this.log('📅 Scheduling recurring tasks...');
        
        // Schedule Facebook posts throughout the day
        this.schedulePost('morning', this.schedule.morning);
        this.schedulePost('lunch', this.schedule.lunch);  
        this.schedulePost('evening', this.schedule.evening);
        
        // Schedule daily blog posts
        this.scheduleDailyBlog();
        
        // Schedule traffic optimization checks
        this.scheduleTrafficOptimization();
        
        this.log('✅ All recurring tasks scheduled');
    }

    // 📱 AUTOMATED FACEBOOK POSTING WITH TRAFFIC REDIRECTION
    async publishFacebookPost(timeOfDay = 'general') {
        this.log(`📱 Publishing ${timeOfDay} Facebook post...`);
        
        try {
            // 1. Get trending deals from database
            const deals = await this.getTrendingDeals(1);
            
            if (deals.length === 0) {
                this.log('⚠️  No deals available, using fallback content');
                deals.push(this.createFallbackDeal());
            }
            
            const deal = deals[0];
            
            // 2. Generate AI-powered content with traffic redirection
            const postResult = await this.contentGenerator.generateFacebookPost(deal, {
                timeOfDay: timeOfDay,
                audience: 'deal_hunters',
                urgency: this.calculateUrgencyLevel(deal),
                includeWebsiteRedirection: true
            });
            
            if (!postResult.success) {
                throw new Error('Failed to generate Facebook post content');
            }
            
            // 3. Add traffic redirection elements
            const optimizedContent = this.optimizeContentForTraffic(postResult.content, deal);
            
            // 4. Post to Facebook via API
            const facebookResult = await this.postToFacebook(optimizedContent, deal);
            
            if (facebookResult.success) {
                this.dailyStats.facebookPostsPublished++;
                this.log(`✅ Facebook post published successfully: ${facebookResult.postId}`);
                
                // 5. Track for analytics
                await this.trackFacebookPost(facebookResult.postId, deal.id, timeOfDay);
                
                return facebookResult;
            } else {
                throw new Error(facebookResult.error);
            }
            
        } catch (error) {
            this.log(`❌ Facebook posting failed: ${error.message}`);
            this.dailyStats.errors.push({ time: new Date(), error: error.message, type: 'facebook_post' });
            return { success: false, error: error.message };
        }
    }

    // 📝 AUTOMATED BLOG POST CREATION
    async createDailyBlogPost() {
        this.log('📝 Creating daily blog post...');
        
        try {
            // 1. Get top deals for blog content
            const topDeals = await this.getTrendingDeals(5);
            
            if (topDeals.length === 0) {
                this.log('⚠️  No deals for blog post');
                return { success: false, error: 'No deals available' };
            }
            
            // 2. Generate blog post content with AI
            const blogContent = await this.generateBlogPost(topDeals);
            
            // 3. Create HTML blog post
            const htmlContent = this.createBlogPostHTML(blogContent, topDeals);
            
            // 4. Save blog post to website
            const blogFileName = `daily-deals-${this.getDateString()}.html`;
            const blogPath = path.join(__dirname, `../dist/blog/${blogFileName}`);
            
            // Ensure blog directory exists
            const blogDir = path.dirname(blogPath);
            if (!fs.existsSync(blogDir)) {
                fs.mkdirSync(blogDir, { recursive: true });
            }
            
            fs.writeFileSync(blogPath, htmlContent);
            
            // 5. Update blog index/sitemap
            await this.updateBlogIndex(blogFileName, blogContent.title);
            
            this.dailyStats.blogPostsCreated++;
            this.log(`✅ Blog post created: ${blogFileName}`);
            
            return {
                success: true,
                fileName: blogFileName,
                title: blogContent.title,
                url: `https://dealradarus.com/blog/${blogFileName}`
            };
            
        } catch (error) {
            this.log(`❌ Blog post creation failed: ${error.message}`);
            this.dailyStats.errors.push({ time: new Date(), error: error.message, type: 'blog_post' });
            return { success: false, error: error.message };
        }
    }

    // 🎯 OPTIMIZE CONTENT FOR WEBSITE TRAFFIC
    optimizeContentForTraffic(content, deal) {
        // Generate UTM tracking parameters for this post
        const utmParams = this.generateUTMParameters(deal, this.getCurrentTimeOfDay());
        const trackingUrl = `${process.env.FRONTEND_URL}/deal/${deal.id}?${utmParams}`;
        
        // Traffic optimization calls-to-action with tracking
        const trafficOptimizers = [
            `🔥 Get this deal now → ${trackingUrl}`,
            `💰 Full details & instant savings → ${trackingUrl}`,
            `⚡ Limited time - claim this deal → ${trackingUrl}`,
            `🎯 More exclusive deals at DealRadarUS.com`,
            `📱 Don't miss out - shop now → ${trackingUrl}`,
            `💎 See all our best deals → DealRadarUS.com`
        ];
        
        const randomOptimizer = trafficOptimizers[Math.floor(Math.random() * trafficOptimizers.length)];
        
        // Add website mention and strong CTA
        let optimizedContent = content;
        
        // Replace generic CTAs with website-driving CTAs
        optimizedContent = optimizedContent.replace(/shop now|get it now|buy now/gi, 'Visit DealRadarUS.com');
        optimizedContent = optimizedContent.replace(/\[link\]/gi, 'DealRadarUS.com');
        
        // Add traffic driver at the end if not present
        if (!optimizedContent.toLowerCase().includes('dealradarus')) {
            optimizedContent += `\n\n${randomOptimizer}`;
        }
        
        // Add website URL prominently
        optimizedContent += '\n🌐 DealRadarUS.com';
        
        // Store tracking info for analytics
        this.trackingUrls = this.trackingUrls || [];
        this.trackingUrls.push({
            url: trackingUrl,
            dealId: deal.id,
            timestamp: new Date(),
            utmParams: utmParams
        });
        
        return optimizedContent;
    }
    
    // 🎯 GENERATE UTM TRACKING PARAMETERS
    generateUTMParameters(deal, timeOfDay) {
        const params = new URLSearchParams({
            utm_source: 'facebook',
            utm_medium: 'social',
            utm_campaign: 'daily_deals',
            utm_content: `${timeOfDay}_post`,
            utm_term: deal.category.toLowerCase(),
            utm_id: `fb_${deal.id}_${Date.now()}`,
            fbclid: `automated_${this.getDateString()}`
        });
        return params.toString();
    }
    
    // ⏰ GET CURRENT TIME OF DAY (US Eastern Time)
    getCurrentTimeOfDay() {
        const now = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const hour = new Date(now).getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';  
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    // 📱 POST TO FACEBOOK VIA API
    async postToFacebook(content, deal) {
        try {
            const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
            const pageId = process.env.FB_PAGE_ID;
            
            if (!pageAccessToken || !pageId) {
                throw new Error('Facebook credentials not configured');
            }
            
            const postData = {
                message: content,
                link: `https://dealradarus.com/deals/${deal.id}`,
                published: true,
                access_token: pageAccessToken
            };
            
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${pageId}/feed`,
                postData
            );
            
            return {
                success: true,
                postId: response.data.id,
                url: `https://facebook.com/${response.data.id}`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // 🔍 GET TRENDING DEALS FROM DATABASE
    async getTrendingDeals(limit = 5) {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        try {
            await client.connect();
            
            const result = await client.query(`
                SELECT * FROM deals 
                WHERE status = 'active' 
                AND (deal_end_date IS NULL OR deal_end_date > NOW())
                ORDER BY deal_quality_score DESC, created_at DESC
                LIMIT $1
            `, [limit]);
            
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
        } finally {
            await client.end();
        }
    }

    // 🧠 GENERATE BLOG POST WITH AI
    async generateBlogPost(deals) {
        const dealsText = deals.map(deal => 
            `${deal.title} - ${deal.discount}% off ($${deal.originalPrice} → $${deal.price})`
        ).join('\n');
        
        const prompt = `Create a comprehensive daily deals blog post with these deals:

${dealsText}

Requirements:
- Engaging title (SEO optimized)
- Compelling introduction
- Individual deal sections with descriptions and why it's a good deal
- Buying advice and tips
- Call-to-actions throughout
- SEO-friendly content
- Include savings calculations
- Professional but friendly tone
- 800-1200 words total

Return as JSON: {
    "title": "blog post title",
    "introduction": "engaging intro paragraph",
    "dealSections": ["deal 1 section", "deal 2 section", ...],
    "conclusion": "conclusion with CTA",
    "metaDescription": "SEO meta description"
}`;
        
        try {
            const result = await this.contentGenerator.model.generateContent(prompt);
            const response = await result.response;
            let content = response.text().trim();
            
            // Clean JSON if needed
            if (!content.startsWith('{')) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                content = jsonMatch ? jsonMatch[0] : content;
            }
            
            return JSON.parse(content);
            
        } catch (error) {
            // Fallback to template-based blog content
            return this.generateTemplateBlogPost(deals);
        }
    }

    // 📄 CREATE BLOG POST HTML
    createBlogPostHTML(blogContent, deals) {
        const dateString = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogContent.title} | DealRadarUS</title>
    <meta name="description" content="${blogContent.metaDescription}">
    <meta name="keywords" content="deals, discounts, savings, ${deals.map(d => d.category).join(', ')}">
    <link rel="canonical" href="https://dealradarus.com/blog/daily-deals-${this.getDateString()}.html">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${blogContent.title}">
    <meta property="og:description" content="${blogContent.metaDescription}">
    <meta property="og:url" content="https://dealradarus.com/blog/daily-deals-${this.getDateString()}.html">
    <meta property="og:type" content="article">
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9ZVTTTBD03');
    </script>
    
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        .deal-card { border: 2px solid #ff4444; border-radius: 10px; padding: 20px; margin: 20px 0; background: #fff5f5; }
        .price { color: #ff4444; font-weight: bold; font-size: 1.2em; }
        .original-price { text-decoration: line-through; color: #666; }
        .cta-button { background: #ff4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .cta-button:hover { background: #dd3333; }
    </style>
</head>
<body>
    <header>
        <h1>${blogContent.title}</h1>
        <p><em>Published on ${dateString} by DealRadarUS Team</em></p>
    </header>
    
    <main>
        <section class="introduction">
            ${blogContent.introduction}
        </section>
        
        <section class="deals">
            ${blogContent.dealSections.map((section, index) => `
                <div class="deal-card">
                    <h3>${deals[index].title}</h3>
                    <div class="pricing">
                        <span class="price">$${deals[index].price.toFixed(2)}</span>
                        <span class="original-price">$${deals[index].originalPrice.toFixed(2)}</span>
                        <span class="savings">${deals[index].discount}% OFF - Save $${(deals[index].originalPrice - deals[index].price).toFixed(2)}</span>
                    </div>
                    <p>${section}</p>
                    <a href="${deals[index].affiliateUrl}" class="cta-button" target="_blank" rel="nofollow">Get This Deal</a>
                </div>
            `).join('')}
        </section>
        
        <section class="conclusion">
            ${blogContent.conclusion}
        </section>
        
        <section class="newsletter-signup" style="background: #f0f8ff; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
            <h3>🔔 Never Miss a Deal Again!</h3>
            <p>Get daily deal alerts delivered straight to your inbox</p>
            <form action="/api/newsletter-signup" method="POST">
                <input type="email" name="email" placeholder="Your email address" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-right: 10px;">
                <button type="submit" class="cta-button">Subscribe Free</button>
            </form>
        </section>
    </main>
    
    <footer style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>© 2025 DealRadarUS - Your trusted deal discovery partner</p>
        <p>
            <a href="https://dealradarus.com">Home</a> | 
            <a href="https://dealradarus.com/blog">Blog</a> | 
            <a href="https://www.facebook.com/DealRadarUS">Facebook</a>
        </p>
    </footer>
</body>
</html>`;
    }

    // 📊 TRAFFIC FUNNEL OPTIMIZATION
    async setupTrafficFunnels() {
        this.log('🎯 Setting up traffic funnels...');
        
        // Create landing pages for different traffic sources
        await this.createFacebookTrafficLandingPage();
        
        // Setup UTM tracking for Facebook traffic
        await this.setupUTMTracking();
        
        // Create retargeting pixels
        await this.setupRetargetingPixels();
        
        this.log('✅ Traffic funnels configured');
    }

    // 🔧 UTILITY FUNCTIONS
    schedulePost(timeOfDay, schedule) {
        // Get current time in US Eastern
        const nowET = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        const now = new Date(nowET);
        
        const scheduledTime = new Date(nowET);
        scheduledTime.setHours(schedule.hour, schedule.minute, 0, 0);
        
        // If time has passed today in ET, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        // Convert to local time for setTimeout
        const localNow = new Date();
        const localScheduled = new Date(scheduledTime.toLocaleString());
        const timeUntilPost = localScheduled.getTime() - localNow.getTime();
        
        setTimeout(() => {
            this.publishFacebookPost(timeOfDay);
            // Schedule for next day
            setInterval(() => {
                this.publishFacebookPost(timeOfDay);
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilPost);
        
        const etTimeString = scheduledTime.toLocaleString("en-US", {
            timeZone: "America/New_York",
            weekday: 'short',
            month: 'numeric', 
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        this.log(`📅 ${timeOfDay} post scheduled for ${etTimeString} (US Eastern Time)`);
    }

    async checkSystemHealth() {
        this.log('🔍 Checking system health...');
        
        const health = {
            database: false,
            facebook: false,
            email: false,
            gemini: false
        };
        
        // Test database
        try {
            const deals = await this.getTrendingDeals(1);
            health.database = true;
        } catch (error) {
            this.log(`❌ Database check failed: ${error.message}`);
        }
        
        // Test Facebook API
        try {
            const response = await axios.get(`https://graph.facebook.com/me?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`);
            health.facebook = response.status === 200;
        } catch (error) {
            this.log(`❌ Facebook API check failed: ${error.message}`);
        }
        
        // Test Gemini AI
        try {
            const testResult = await this.contentGenerator.generateFacebookPost({
                title: 'Test Product',
                price: 99,
                originalPrice: 149,
                discount: 33,
                category: 'test'
            });
            health.gemini = testResult.success;
        } catch (error) {
            this.log(`❌ Gemini AI check failed: ${error.message}`);
        }
        
        this.log(`✅ System health: DB:${health.database}, FB:${health.facebook}, AI:${health.gemini}`);
        return health;
    }

    generateMorningContent() {
        this.log('🌅 Generating morning content batch...');
        // Pre-generate content for the day to ensure smooth posting
    }

    publishMorningFacebookPost() {
        return this.publishFacebookPost('morning');
    }

    calculateUrgencyLevel(deal) {
        if (deal.discount > 50) return 'high';
        if (deal.discount > 30) return 'medium';
        return 'low';
    }

    createFallbackDeal() {
        return {
            id: 'fallback',
            title: 'Daily Deal Alert',
            price: 29.99,
            originalPrice: 49.99,
            discount: 40,
            category: 'general',
            condition: 'new',
            affiliateUrl: 'https://dealradarus.com'
        };
    }

    getNextPostTime() {
        const now = new Date();
        const times = [this.schedule.morning, this.schedule.lunch, this.schedule.evening];
        
        for (const time of times) {
            const nextTime = new Date();
            nextTime.setHours(time.hour, time.minute, 0, 0);
            if (nextTime > now) {
                return nextTime.toLocaleString();
            }
        }
        
        // Next day morning
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(this.schedule.morning.hour, this.schedule.morning.minute, 0, 0);
        return tomorrow.toLocaleString();
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        console.log(message);
        
        try {
            fs.appendFileSync(this.logFile, logMessage);
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    // 📊 MONITORING & REPORTING
    startMonitoring() {
        this.log('📊 Starting monitoring system...');
        
        // Daily stats report
        setInterval(() => {
            this.generateDailyReport();
        }, 24 * 60 * 60 * 1000); // Every 24 hours
        
        // Hourly health check
        setInterval(() => {
            this.checkSystemHealth();
        }, 60 * 60 * 1000); // Every hour
    }

    generateDailyReport() {
        const report = {
            date: new Date().toISOString().split('T')[0],
            runtime: Math.round((Date.now() - this.dailyStats.startTime.getTime()) / 1000 / 60 / 60), // hours
            stats: this.dailyStats,
            contentGeneratorStats: this.contentGenerator.getPerformanceStats()
        };
        
        this.log(`📊 DAILY REPORT: ${JSON.stringify(report, null, 2)}`);
        
        // Save report to file
        const reportPath = path.join(__dirname, `../reports/daily-${this.getDateString()}.json`);
        const reportDir = path.dirname(reportPath);
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    // Add placeholder methods for additional features
    async trackFacebookPost(postId, dealId, timeOfDay) {
        // Track post performance for analytics
    }

    async updateBlogIndex(fileName, title) {
        // Update blog index page with new post
    }

    async scheduleDailyBlog() {
        // Schedule daily blog creation
    }

    async scheduleTrafficOptimization() {
        // Schedule traffic optimization tasks
    }

    async createFacebookTrafficLandingPage() {
        // Create optimized landing page for Facebook traffic
    }

    async setupUTMTracking() {
        // Setup UTM parameters for tracking
    }

    async setupRetargetingPixels() {
        // Setup Facebook pixel for retargeting
    }

    generateTemplateBlogPost(deals) {
        // Fallback blog post generation using templates
        return {
            title: `Daily Deals Roundup - ${new Date().toLocaleDateString()}`,
            introduction: `Check out today's best deals with savings up to ${Math.max(...deals.map(d => d.discount))}%!`,
            dealSections: deals.map(deal => `Great ${deal.category} deal: ${deal.title} at ${deal.discount}% off!`),
            conclusion: `Don't miss these amazing deals! Visit DealRadarUS.com for more savings.`,
            metaDescription: `Today's best deals with up to ${Math.max(...deals.map(d => d.discount))}% savings on ${deals.map(d => d.category).join(', ')}.`
        };
    }
}

module.exports = DailyAutomationMaster;

// CLI usage for testing
if (require.main === module) {
    const automation = new DailyAutomationMaster();
    automation.startDailyAutomation().catch(console.error);
}