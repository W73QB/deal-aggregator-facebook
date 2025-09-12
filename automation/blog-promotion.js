#!/usr/bin/env node

/**
 * 📈 Blog Post Promotion & Traffic Generation
 * ==========================================
 * Automatically promote blog posts across multiple channels
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BlogPromotionEngine {
    constructor() {
        this.blogBaseUrl = process.env.FRONTEND_URL + '/blog/';
    }

    // 📱 PROMOTE BLOG POST ON FACEBOOK
    async promoteBlogOnFacebook(blogFileName, blogTitle) {
        const blogUrl = this.blogBaseUrl + blogFileName;
        
        const promotionMessages = [
            `🔥 NEW BLOG POST ALERT! 🔥
            
"${blogTitle}"

💰 Today's hottest deals featuring:
✅ MacBook Air - 31% OFF ($400 savings!)  
✅ Smart Security Camera - 38% OFF
✅ Gaming Headset - 50% OFF

👉 Read the full breakdown with buying tips: ${blogUrl}

#DailyDeals #TechDeals #Savings #MacBook #SmartHome #Gaming`,

            `📝 Fresh deals just dropped on our blog! 

"${blogTitle}"

Don't miss these incredible discounts we found for you:
🍎 MacBook Air at unbeatable price
🏠 Smart home security on sale  
🎮 Gaming gear half price

Get all the details: ${blogUrl}

Which deal caught your eye? 👀`,

            `💡 DEAL HUNTER TIP: Check our latest blog post!

"${blogTitle}" 

We've done the research so you don't have to:
• Price history analysis ✅
• Best time to buy ✅  
• Alternative options ✅
• Exclusive discount codes ✅

Start saving: ${blogUrl}`
        ];

        try {
            // Select random promotion message
            const message = promotionMessages[Math.floor(Math.random() * promotionMessages.length)];
            
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}/feed`,
                {
                    message: message,
                    link: blogUrl,
                    access_token: process.env.FB_PAGE_ACCESS_TOKEN
                }
            );

            console.log('✅ Blog promoted on Facebook:', response.data.id);
            return { success: true, postId: response.data.id };

        } catch (error) {
            console.log('❌ Facebook promotion failed:', error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }

    // 📧 CREATE EMAIL NEWSLETTER WITH BLOG LINK
    async createNewsletterPromotion(blogFileName, blogTitle, deals) {
        const blogUrl = this.blogBaseUrl + blogFileName;
        
        const newsletterHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">📡 DealRadarUS Daily Digest</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">Today's Hottest Deals Are Live!</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #eee;">
                <h2 style="color: #333; margin-top: 0;">🔥 NEW: ${blogTitle}</h2>
                
                <p style="font-size: 16px; color: #555;">We've just published our latest deal roundup featuring incredible discounts on premium tech and home essentials. Don't miss out on these limited-time offers!</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #ff4444;">Today's Featured Deals:</h3>
                    ${deals.map(deal => `
                        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                            <strong>${deal.title}</strong><br>
                            <span style="color: #ff4444; font-weight: bold;">$${deal.price}</span> 
                            <span style="text-decoration: line-through; color: #999;">$${deal.originalPrice}</span>
                            <span style="background: #ff4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${deal.discount}% OFF</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${blogUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=blog_promotion" 
                       style="background: #ff4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        📖 Read Full Article & Get Deals
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">Why our blog?</p>
                <ul style="font-size: 14px; color: #666;">
                    <li>✅ Price history analysis</li>
                    <li>✅ Detailed product reviews</li>  
                    <li>✅ Shopping tips & alternatives</li>
                    <li>✅ Exclusive discount codes</li>
                </ul>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                    Follow us: <a href="https://www.facebook.com/DealRadarUS">Facebook</a> | 
                    <a href="${process.env.FRONTEND_URL}">DealRadarUS.com</a>
                </p>
            </div>
        </div>`;

        return {
            subject: `🔥 ${blogTitle.substring(0, 40)}...`,
            html: newsletterHTML,
            trackingUrl: blogUrl + '?utm_source=newsletter&utm_medium=email&utm_campaign=blog_promotion'
        };
    }

    // 🎯 PINTEREST PROMOTION
    async createPinterestPromotion(blogFileName, blogTitle, deals) {
        const blogUrl = this.blogBaseUrl + blogFileName;
        
        const pinDescriptions = deals.map(deal => 
            `💰 ${deal.title} - ${deal.discount}% OFF! Save $${(deal.originalPrice - deal.price).toFixed(2)}! 
            
Perfect for: ${deal.category.replace('-', ' ')} lovers
Original: $${deal.originalPrice} → Now: $${deal.price}
            
Get this deal: ${blogUrl}?utm_source=pinterest&utm_medium=social&utm_campaign=deal_${deal.id}

#deals #savings #${deal.category} #discount #shopping`
        );

        return {
            pins: pinDescriptions,
            boardName: 'Daily Tech Deals',
            blogUrl: blogUrl
        };
    }

    // 📊 REDDIT PROMOTION STRATEGY  
    createRedditPromotions(blogFileName, blogTitle, deals) {
        const blogUrl = this.blogBaseUrl + blogFileName;
        
        return {
            subreddits: ['deals', 'frugal', 'BuyItForLife', 'buildapcsales'],
            posts: [
                {
                    title: `MacBook Air 31% OFF - $899 (was $1299) - Worth it?`,
                    content: `Found this deal while researching for my blog post. MacBook Air M2 for $899 seems like a solid price. What do you think?\n\nFull analysis: ${blogUrl}`,
                    subreddit: 'deals'
                },
                {
                    title: `Smart Home Security Camera 38% OFF - Good starter option?`,
                    content: `Looking at smart home options and found this camera at $49.99 (was $79.99). Anyone have experience with this model?\n\nMore details in my review: ${blogUrl}`,
                    subreddit: 'smarthome'
                }
            ]
        };
    }

    // 🚀 EXECUTE FULL PROMOTION CAMPAIGN
    async launchFullPromotionCampaign(blogFileName, blogTitle, deals) {
        console.log(`🚀 Launching promotion campaign for: ${blogTitle}`);
        
        const results = {
            facebook: null,
            newsletter: null,
            pinterest: null,
            reddit: null,
            totalReach: 0
        };

        try {
            // 1. Facebook Promotion
            console.log('📱 Promoting on Facebook...');
            results.facebook = await this.promoteBlogOnFacebook(blogFileName, blogTitle);
            if (results.facebook.success) results.totalReach += 5000; // Estimated reach
            
            // 2. Newsletter Creation
            console.log('📧 Creating newsletter version...');
            results.newsletter = await this.createNewsletterPromotion(blogFileName, blogTitle, deals);
            results.totalReach += 2000; // Estimated subscribers
            
            // 3. Pinterest Strategy
            console.log('📌 Preparing Pinterest content...');
            results.pinterest = await this.createPinterestPromotion(blogFileName, blogTitle, deals);
            results.totalReach += 1000; // Estimated Pinterest reach
            
            // 4. Reddit Strategy
            console.log('💬 Creating Reddit promotion strategy...');
            results.reddit = this.createRedditPromotions(blogFileName, blogTitle, deals);
            results.totalReach += 3000; // Estimated Reddit reach
            
            console.log(`✅ Promotion campaign launched! Estimated reach: ${results.totalReach.toLocaleString()} people`);
            
            return results;
            
        } catch (error) {
            console.error('❌ Promotion campaign failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // 📈 TRACK PROMOTION PERFORMANCE
    async trackPromotionResults(blogFileName, promotionResults) {
        const trackingData = {
            blogPost: blogFileName,
            timestamp: new Date().toISOString(),
            promotions: promotionResults,
            expectedTraffic: {
                facebook: 200, // Expected clicks from Facebook
                newsletter: 100, // Expected clicks from newsletter
                pinterest: 50, // Expected clicks from Pinterest  
                reddit: 150, // Expected clicks from Reddit
                total: 500
            }
        };

        // Save tracking data
        const trackingFile = path.join(__dirname, 'logs/promotion-tracking.json');
        let existingData = [];
        
        if (fs.existsSync(trackingFile)) {
            existingData = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
        }
        
        existingData.push(trackingData);
        fs.writeFileSync(trackingFile, JSON.stringify(existingData, null, 2));
        
        console.log('📊 Promotion tracking data saved');
        return trackingData;
    }
}

module.exports = BlogPromotionEngine;

// CLI usage for testing
if (require.main === module) {
    const promotion = new BlogPromotionEngine();
    
    const testDeals = [
        { id: 1, title: 'MacBook Air M2', originalPrice: 1299, price: 899, discount: 31, category: 'electronics' },
        { id: 2, title: 'Smart Security Camera', originalPrice: 79.99, price: 49.99, discount: 38, category: 'smart-home' },
        { id: 3, title: 'Gaming Headset', originalPrice: 59.99, price: 29.99, discount: 50, category: 'gaming' }
    ];
    
    promotion.launchFullPromotionCampaign(
        'daily-deals-2025-09-01.html',
        'Score HUGE Savings Today! Top Daily Deals on Tech & More!',
        testDeals
    ).then(results => {
        console.log('\n📊 PROMOTION RESULTS:');
        console.log('Facebook:', results.facebook?.success ? '✅ Success' : '❌ Failed');
        console.log('Newsletter:', results.newsletter ? '✅ Created' : '❌ Failed');
        console.log('Pinterest:', results.pinterest ? '✅ Prepared' : '❌ Failed');
        console.log('Reddit:', results.reddit ? '✅ Strategy Ready' : '❌ Failed');
        console.log(`Total Estimated Reach: ${results.totalReach?.toLocaleString()} people`);
    }).catch(console.error);
}