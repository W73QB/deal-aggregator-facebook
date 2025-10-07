/**
 * 💎 Gemini Pro AI Integration
 * ===========================
 * Advanced AI content generation using Google's Gemini Pro
 * Cost-effective alternative to OpenAI with superior capabilities
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiProContentGenerator {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_PRO_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Content generation statistics
        this.stats = {
            postsGenerated: 0,
            emailsGenerated: 0,
            cost: 0,
            successRate: 0
        };
    }

    // 📱 FACEBOOK POST GENERATION
    async generateFacebookPost(dealData, options = {}) {
        const { category, timeOfDay, audience, tone } = options;
        
        const prompt = this.buildFacebookPrompt(dealData, { category, timeOfDay, audience, tone });
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const post = response.text();
            
            this.stats.postsGenerated++;
            this.updateCostTracking('facebook_post');
            
            return {
                success: true,
                content: post,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    tokens: this.estimateTokens(post),
                    category: category,
                    audience: audience
                }
            };
        } catch (error) {
            console.error('Gemini Pro Facebook post generation failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackTemplate(dealData, 'facebook')
            };
        }
    }

    // 📧 EMAIL NEWSLETTER GENERATION
    async generateEmailNewsletter(deals, options = {}) {
        const { subscriberType, season, specialEvent } = options;
        
        const prompt = this.buildEmailPrompt(deals, { subscriberType, season, specialEvent });
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text();
            
            // Parse the structured response
            const emailContent = this.parseEmailResponse(content);
            
            this.stats.emailsGenerated++;
            this.updateCostTracking('email_newsletter');
            
            return {
                success: true,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    dealCount: deals.length,
                    subscriberType: subscriberType
                }
            };
        } catch (error) {
            console.error('Gemini Pro email generation failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackTemplate(deals, 'email')
            };
        }
    }

    // 🔍 SEO DESCRIPTION GENERATION
    async generateSEODescription(dealData, options = {}) {
        const { keywords, length, intent } = options;
        
        const prompt = `Generate an SEO-optimized product description for:
        
        Product: ${dealData.title}
        Price: $${dealData.price} (${dealData.discount}% off from $${dealData.originalPrice})
        Category: ${dealData.category}
        Condition: ${dealData.condition}
        
        Requirements:
        - Include keywords: ${keywords || 'deals, discount, save money, ' + dealData.category}
        - Length: ${length || 150-160} characters
        - Intent: ${intent || 'commercial'}
        - Include savings amount: $${(dealData.originalPrice - dealData.price).toFixed(2)}
        - Make it compelling and action-oriented
        - Include urgency if appropriate
        
        Return only the description, no additional text.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const description = response.text().trim();
            
            this.updateCostTracking('seo_description');
            
            return {
                success: true,
                description: description,
                metadata: {
                    length: description.length,
                    keywords: keywords,
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Gemini Pro SEO generation failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateBasicSEODescription(dealData)
            };
        }
    }

    // 🧠 INTELLIGENT CONTENT OPTIMIZATION
    async optimizeContentBasedOnPerformance(contentType, performanceData) {
        const prompt = `Analyze this content performance data and provide optimization recommendations:
        
        Content Type: ${contentType}
        Performance Data: ${JSON.stringify(performanceData, null, 2)}
        
        Based on this data, suggest:
        1. What content elements are working best
        2. What should be changed or improved
        3. Optimal posting times and frequencies
        4. Audience segments that respond best
        5. Content tone and style adjustments
        
        Provide actionable recommendations in JSON format.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const recommendations = JSON.parse(response.text());
            
            return {
                success: true,
                recommendations: recommendations,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini Pro optimization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🎯 PERSONALIZED CONTENT GENERATION
    async generatePersonalizedContent(dealData, userProfile) {
        const prompt = `Create personalized content for this user profile:
        
        Deal: ${dealData.title} - ${dealData.discount}% off ($${dealData.price})
        Category: ${dealData.category}
        
        User Profile:
        - Previous purchases: ${userProfile.previousCategories?.join(', ') || 'None'}
        - Budget range: ${userProfile.budgetRange || 'Unknown'}
        - Interests: ${userProfile.interests?.join(', ') || 'General'}
        - Engagement history: ${userProfile.engagementScore || 'New user'}
        
        Generate a Facebook post that speaks directly to this user's interests and buying behavior.
        Make it feel personal and relevant to their shopping patterns.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const personalizedContent = response.text();
            
            return {
                success: true,
                content: personalizedContent,
                personalizationScore: this.calculatePersonalizationScore(userProfile),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini Pro personalization failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: await this.generateFacebookPost(dealData)
            };
        }
    }

    // 📊 TREND-AWARE CONTENT GENERATION
    async generateTrendAwareContent(dealData, currentTrends) {
        const prompt = `Create content that incorporates current trends:
        
        Deal: ${dealData.title} - ${dealData.discount}% off
        Category: ${dealData.category}
        
        Current Trends:
        ${currentTrends.map(trend => `- ${trend.topic}: ${trend.description}`).join('\n')}
        
        Create a Facebook post that naturally incorporates relevant trending topics,
        hashtags, or cultural moments. Make it feel current and engaging without being forced.
        
        Format: Social media post with appropriate emojis and hashtags.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const trendContent = response.text();
            
            return {
                success: true,
                content: trendContent,
                trendsUsed: currentTrends.map(t => t.topic),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini Pro trend generation failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: await this.generateFacebookPost(dealData)
            };
        }
    }

    // 🏗️ PROMPT BUILDERS
    buildFacebookPrompt(dealData, options) {
        const { category, timeOfDay, audience, tone } = options;
        
        return `Create an engaging Facebook post for this deal:
        
        Product: ${dealData.title}
        Original Price: $${dealData.originalPrice}
        Sale Price: $${dealData.price}
        Discount: ${dealData.discount}%
        Category: ${category || dealData.category}
        Condition: ${dealData.condition}
        
        Context:
        - Time of day: ${timeOfDay || 'general'}
        - Target audience: ${audience || 'deal hunters'}
        - Tone: ${tone || 'enthusiastic but not pushy'}
        
        Requirements:
        - Use compelling emojis (but not excessive)
        - Include savings amount in dollars
        - Create urgency without being spammy
        - Add relevant hashtags (5-8 hashtags max)
        - Keep under 280 characters for optimal engagement
        - Include a clear call-to-action
        - Make it shareable and engaging
        
        Format: Ready-to-post Facebook content with emojis and hashtags.`;
    }

    buildEmailPrompt(deals, options) {
        const { subscriberType, season, specialEvent } = options;
        
        const dealsText = deals.map(deal => 
            `${deal.title} - ${deal.discount}% off ($${deal.originalPrice} → $${deal.price})`
        ).join('\n');
        
        return `Create a complete email newsletter with these deals:
        
        ${dealsText}
        
        Context:
        - Subscriber type: ${subscriberType || 'general'}
        - Season: ${season || this.getCurrentSeason()}
        - Special event: ${specialEvent || 'none'}
        
        Create a complete email including:
        1. Compelling subject line
        2. Engaging header/intro
        3. Individual deal presentations with descriptions
        4. Social proof elements
        5. Call-to-actions
        6. Footer with social links
        
        Format as JSON with: {subject: "", html: "", text: ""}
        
        Make it professional, engaging, and conversion-focused.`;
    }

    // 🔧 UTILITY FUNCTIONS
    estimateTokens(text) {
        return Math.ceil(text.length / 4); // Rough estimation
    }

    updateCostTracking(operationType) {
        const costs = {
            'facebook_post': 0.001,    // ~500 tokens
            'email_newsletter': 0.005,  // ~2500 tokens  
            'seo_description': 0.0008,  // ~400 tokens
        };
        
        this.stats.cost += costs[operationType] || 0.001;
    }

    calculatePersonalizationScore(userProfile) {
        let score = 0;
        if (userProfile.previousCategories?.length > 0) score += 30;
        if (userProfile.budgetRange) score += 20;
        if (userProfile.interests?.length > 0) score += 25;
        if (userProfile.engagementScore > 50) score += 25;
        return score;
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    parseEmailResponse(content) {
        try {
            return JSON.parse(content);
        } catch (error) {
            // Fallback parsing if JSON format is not perfect
            const lines = content.split('\n');
            return {
                subject: this.extractSection(content, 'subject'),
                html: this.extractSection(content, 'html'),
                text: this.extractSection(content, 'text')
            };
        }
    }

    extractSection(content, section) {
        const regex = new RegExp(`"${section}":\\s*"([^"]+)"`, 'i');
        const match = content.match(regex);
        return match ? match[1] : `Generated ${section} content`;
    }

    getFallbackTemplate(dealData, type) {
        // Import existing template system as fallback
        if (type === 'facebook') {
            const FacebookTemplates = require('../content/facebook-post-templates.cjs');
            return FacebookTemplates.generatePost(dealData);
        } else if (type === 'email') {
            const EmailTemplates = require('../content/email-newsletter-templates.cjs');
            return EmailTemplates.generateCompleteEmail([dealData]);
        }
        return null;
    }

    generateBasicSEODescription(dealData) {
        const savings = (dealData.originalPrice - dealData.price).toFixed(2);
        return `${dealData.title} - ${dealData.discount}% OFF! Save $${savings}. ${dealData.condition} ${dealData.category} at unbeatable price. Limited time deal!`;
    }

    // 📊 ANALYTICS & REPORTING
    getUsageStats() {
        return {
            ...this.stats,
            averageCostPerPost: this.stats.postsGenerated > 0 ? this.stats.cost / this.stats.postsGenerated : 0,
            estimatedMonthlyCost: this.stats.cost * 30, // Extrapolate based on daily usage
            successRate: this.stats.successRate
        };
    }

    resetStats() {
        this.stats = {
            postsGenerated: 0,
            emailsGenerated: 0,
            cost: 0,
            successRate: 0
        };
    }
}

module.exports = GeminiProContentGenerator;