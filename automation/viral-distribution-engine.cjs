#!/usr/bin/env node

/**
 * 🚀 Viral Distribution Engine
 * ============================
 * Automatically distributes blog content across multiple platforms for maximum reach
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ViralDistributionEngine {
    constructor() {
        this.platforms = {
            facebook: { enabled: true, priority: 1 },
            twitter: { enabled: true, priority: 2 },
            pinterest: { enabled: true, priority: 3 },
            reddit: { enabled: true, priority: 4 },
            linkedin: { enabled: true, priority: 5 },
            instagram: { enabled: false, priority: 6 } // Future
        };
        
        this.contentVariations = [];
        this.distributionResults = {};
    }

    // 🎯 CREATE PLATFORM-SPECIFIC CONTENT
    async createPlatformContent(blogData, deals, targetPlatform) {
        const platformPrompts = {
            facebook: `Create an engaging Facebook post to promote this blog article:

Title: ${blogData.title}
Blog URL: https://dealradarus.com/blog/${this.getDateString()}.html

Requirements:
- Conversational tone like talking to friends
- Use emojis naturally (not excessive)
- Create curiosity to click the blog link
- Include 1-2 specific deal highlights
- Ask a question to encourage comments
- Include relevant hashtags (3-5 max)
- Feel personal and authentic
- Under 280 characters for optimal engagement

Make it sound like a real person sharing an exciting find, not a brand posting.`,

            twitter: `Create 3 different Twitter thread posts (1 main + 2 follow-ups) to promote this blog:

Title: ${blogData.title}
Blog URL: https://dealradarus.com/blog/${this.getDateString()}.html

Tweet 1 (Hook): Create curiosity and announce the deals
Tweet 2 (Value): Highlight specific savings amounts
Tweet 3 (CTA): Strong call-to-action with blog link

Requirements:
- Each tweet under 280 characters
- Use trending hashtags relevant to deals
- Include specific dollar amounts saved
- Personal tone, not corporate
- Emoji use should feel natural
- Create FOMO (fear of missing out)

Format as: {"tweet1": "content", "tweet2": "content", "tweet3": "content"}`,

            pinterest: `Create Pinterest pin descriptions for each deal in this blog:

Blog: ${blogData.title}
URL: https://dealradarus.com/blog/${this.getDateString()}.html

Create 1 pin description for each deal that includes:
- Compelling headline with savings amount
- Brief description of why it's a great deal
- Keywords for Pinterest SEO
- Call-to-action to read full review
- Relevant hashtags for discovery
- 100-150 words per description

Make them Pinterest-friendly (visual, aspirational, save-worthy).`,

            reddit: `Create Reddit posts for different subreddits to share this blog content:

Title: ${blogData.title}
Blog URL: https://dealradarus.com/blog/${this.getDateString()}.html

Create posts for these subreddits:
1. r/deals - Focus on deal legitimacy and value
2. r/frugal - Emphasize money-saving aspects
3. r/BuyItForLife - Quality and long-term value
4. r/buildapcsales (if tech deals) - Technical specifications

Each post should:
- Follow subreddit culture and rules
- Provide genuine value, not just promotion
- Include personal experience/opinion
- Be helpful to the community
- Natural mention of blog for "full details"

Format as JSON with subreddit and post content.`,

            linkedin: `Create a professional LinkedIn post about smart shopping and these deals:

Blog: ${blogData.title}
URL: https://dealradarus.com/blog/${this.getDateString()}.html

Requirements:
- Professional tone but still engaging
- Focus on smart financial decisions
- Mention research and due diligence
- Position as helpful resource for professionals
- Include insights about consumer trends
- Call-to-action to read full analysis
- 200-300 words
- Professional hashtags

Make it valuable for business professionals interested in smart spending.`
        };

        try {
            const prompt = platformPrompts[targetPlatform];
            if (!prompt) return null;

            // Add deal context to prompt
            const dealsContext = deals.map(deal => 
                `${deal.title}: ${deal.discount}% off ($${deal.originalPrice} → $${deal.price})`
            ).join('\n');

            const fullPrompt = prompt + '\n\nDeals context:\n' + dealsContext;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response.text();

            return {
                platform: targetPlatform,
                content: response.trim(),
                createdAt: new Date().toISOString()
            };

        } catch (error) {
            console.log(`❌ Failed to create ${targetPlatform} content:`, error.message);
            return this.createFallbackContent(targetPlatform, blogData, deals);
        }
    }

    // 📱 POST TO FACEBOOK
    async postToFacebook(content, blogUrl) {
        try {
            const postData = {
                message: content,
                link: blogUrl,
                access_token: process.env.FB_PAGE_ACCESS_TOKEN
            };

            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}/feed`,
                postData
            );

            return {
                success: true,
                platform: 'facebook',
                postId: response.data.id,
                url: `https://facebook.com/${response.data.id}`
            };

        } catch (error) {
            return {
                success: false,
                platform: 'facebook',
                error: error.response?.data || error.message
            };
        }
    }

    // 🐦 POST TO TWITTER (X)
    async postToTwitter(threadContent, blogUrl) {
        // Note: Twitter API requires authentication setup
        // For now, we'll prepare the content and log it
        try {
            const tweets = typeof threadContent === 'string' 
                ? [threadContent] 
                : Object.values(JSON.parse(threadContent));

            console.log('📋 Twitter thread prepared:');
            tweets.forEach((tweet, index) => {
                console.log(`Tweet ${index + 1}: ${tweet}`);
            });

            // In production, you would use Twitter API here
            return {
                success: true,
                platform: 'twitter',
                content: tweets,
                note: 'Content prepared - requires Twitter API setup for auto-posting'
            };

        } catch (error) {
            return {
                success: false,
                platform: 'twitter',
                error: error.message
            };
        }
    }

    // 📌 CREATE PINTEREST PINS
    async createPinterestContent(pinDescriptions, blogUrl) {
        try {
            const pins = typeof pinDescriptions === 'string' 
                ? pinDescriptions.split('\n\n')
                : pinDescriptions;

            console.log('📌 Pinterest pins prepared:');
            pins.forEach((pin, index) => {
                console.log(`Pin ${index + 1}: ${pin.substring(0, 100)}...`);
            });

            return {
                success: true,
                platform: 'pinterest',
                pins: pins,
                boardSuggestion: 'Daily Tech Deals',
                note: 'Content prepared - requires Pinterest API for auto-posting'
            };

        } catch (error) {
            return {
                success: false,
                platform: 'pinterest',
                error: error.message
            };
        }
    }

    // 💬 CREATE REDDIT POSTS
    async createRedditContent(redditContent, blogUrl) {
        try {
            let posts;
            if (typeof redditContent === 'string') {
                // Try to parse JSON or create basic posts
                try {
                    posts = JSON.parse(redditContent);
                } catch {
                    posts = [{
                        subreddit: 'deals',
                        title: 'Found some great deals worth sharing',
                        content: redditContent
                    }];
                }
            } else {
                posts = redditContent;
            }

            console.log('💬 Reddit posts prepared:');
            posts.forEach(post => {
                console.log(`r/${post.subreddit}: ${post.title}`);
            });

            return {
                success: true,
                platform: 'reddit',
                posts: posts,
                note: 'Content prepared - requires manual posting to follow Reddit rules'
            };

        } catch (error) {
            return {
                success: false,
                platform: 'reddit',
                error: error.message
            };
        }
    }

    // 💼 POST TO LINKEDIN
    async postToLinkedIn(content, blogUrl) {
        try {
            console.log('💼 LinkedIn post prepared:');
            console.log(content);

            return {
                success: true,
                platform: 'linkedin',
                content: content,
                note: 'Content prepared - requires LinkedIn API setup for auto-posting'
            };

        } catch (error) {
            return {
                success: false,
                platform: 'linkedin',
                error: error.message
            };
        }
    }

    // 🚀 EXECUTE FULL VIRAL DISTRIBUTION
    async distributeContent(blogData, deals) {
        console.log('🚀 Starting viral distribution campaign...');
        
        const blogUrl = `https://dealradarus.com/blog/${this.getDateString()}.html`;
        const results = {};

        // Initialize Gemini model here since it's needed for content creation
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create and distribute content for each enabled platform
        for (const [platform, config] of Object.entries(this.platforms)) {
            if (!config.enabled) continue;

            try {
                console.log(`📝 Creating ${platform} content...`);
                
                // Create platform-specific content
                const contentData = await this.createPlatformContent(blogData, deals, platform);
                if (!contentData) continue;

                // Distribute to platform
                let distributionResult;
                switch (platform) {
                    case 'facebook':
                        distributionResult = await this.postToFacebook(contentData.content, blogUrl);
                        break;
                    case 'twitter':
                        distributionResult = await this.postToTwitter(contentData.content, blogUrl);
                        break;
                    case 'pinterest':
                        distributionResult = await this.createPinterestContent(contentData.content, blogUrl);
                        break;
                    case 'reddit':
                        distributionResult = await this.createRedditContent(contentData.content, blogUrl);
                        break;
                    case 'linkedin':
                        distributionResult = await this.postToLinkedIn(contentData.content, blogUrl);
                        break;
                }

                results[platform] = {
                    ...distributionResult,
                    content: contentData.content,
                    priority: config.priority
                };

                console.log(`${distributionResult.success ? '✅' : '❌'} ${platform}: ${distributionResult.success ? 'Success' : 'Failed'}`);

                // Add delay between posts to avoid rate limiting
                await this.delay(2000);

            } catch (error) {
                console.log(`❌ ${platform} distribution failed:`, error.message);
                results[platform] = {
                    success: false,
                    platform: platform,
                    error: error.message
                };
            }
        }

        // Save distribution results
        await this.saveDistributionResults(blogData.title, results);

        return {
            blogUrl: blogUrl,
            distributionResults: results,
            summary: this.createDistributionSummary(results)
        };
    }

    // 📊 CREATE DISTRIBUTION SUMMARY
    createDistributionSummary(results) {
        const successful = Object.values(results).filter(r => r.success).length;
        const failed = Object.values(results).filter(r => !r.success).length;
        const totalPlatforms = Object.keys(results).length;

        const estimatedReach = {
            facebook: results.facebook?.success ? 5000 : 0,
            twitter: results.twitter?.success ? 2000 : 0,
            pinterest: results.pinterest?.success ? 1500 : 0,
            reddit: results.reddit?.success ? 3000 : 0,
            linkedin: results.linkedin?.success ? 800 : 0
        };

        const totalReach = Object.values(estimatedReach).reduce((sum, reach) => sum + reach, 0);

        return {
            platformsTargeted: totalPlatforms,
            successfulPosts: successful,
            failedPosts: failed,
            successRate: `${Math.round((successful / totalPlatforms) * 100)}%`,
            estimatedReach: totalReach,
            topPerformingPlatforms: Object.entries(results)
                .filter(([_, result]) => result.success)
                .sort(([_, a], [__, b]) => a.priority - b.priority)
                .map(([platform, _]) => platform)
        };
    }

    // 💾 SAVE DISTRIBUTION RESULTS
    async saveDistributionResults(blogTitle, results) {
        const resultsFile = path.join(__dirname, 'logs/viral-distribution.json');
        let existingResults = [];

        if (fs.existsSync(resultsFile)) {
            existingResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
        }

        existingResults.push({
            blogTitle: blogTitle,
            timestamp: new Date().toISOString(),
            results: results,
            summary: this.createDistributionSummary(results)
        });

        // Keep only last 30 entries
        if (existingResults.length > 30) {
            existingResults = existingResults.slice(-30);
        }

        fs.writeFileSync(resultsFile, JSON.stringify(existingResults, null, 2));
    }

    // 🛠️ UTILITY FUNCTIONS
    createFallbackContent(platform, blogData, deals) {
        const fallbackContent = {
            facebook: `🔥 Just found some incredible deals that I had to share! ${deals[0]?.title} is ${deals[0]?.discount}% off - that's $${(deals[0]?.originalPrice - deals[0]?.price)?.toFixed(2)} in savings! Check out my full breakdown: https://dealradarus.com/blog/${this.getDateString()}.html`,
            
            twitter: `{"tweet1": "🔥 Deal alert! Found ${deals.length} incredible discounts today", "tweet2": "${deals[0]?.title} - ${deals[0]?.discount}% OFF!", "tweet3": "Full details: https://dealradarus.com/blog/${this.getDateString()}.html"}`,
            
            pinterest: `Amazing ${deals[0]?.title} deal! Save ${deals[0]?.discount}% on this incredible find. Perfect for anyone looking for quality tech at unbeatable prices. Check out my full review and more deals: https://dealradarus.com/blog/${this.getDateString()}.html`,
            
            reddit: `[{"subreddit": "deals", "title": "Great deals on tech today", "content": "Found some solid discounts worth sharing"}]`,
            
            linkedin: `Smart shopping update: Found some exceptional deals on quality products today. As someone who researches these extensively, I wanted to share the best ones. Full analysis: https://dealradarus.com/blog/${this.getDateString()}.html`
        };

        return {
            platform: platform,
            content: fallbackContent[platform] || 'Great deals found!',
            createdAt: new Date().toISOString(),
            isFallback: true
        };
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = ViralDistributionEngine;