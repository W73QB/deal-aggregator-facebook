#!/usr/bin/env node

/**
 * 🤖 Smart Content Generator
 * ==========================  
 * AI-powered content automation with template fallback
 * Combines Gemini Pro AI with template system for 100% reliability
 */

require('dotenv').config({ path: '.env.dealradarus.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FacebookTemplates = require('../content/facebook-post-templates');
const EmailTemplates = require('../content/email-newsletter-templates');

class SmartContentGenerator {
    constructor() {
        this.aiEnabled = process.env.AI_CONTENT_ENABLED === 'true';
        this.fallbackEnabled = process.env.AI_FALLBACK_TO_TEMPLATES === 'true';
        
        if (this.aiEnabled) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ 
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash" 
            });
        }
        
        this.stats = {
            aiGenerated: 0,
            templateGenerated: 0,
            aiFailures: 0,
            totalCost: 0,
            averageResponseTime: 0
        };
    }

    // 📱 SMART FACEBOOK POST GENERATION
    async generateFacebookPost(dealData, options = {}) {
        const startTime = Date.now();
        
        // Try AI generation first if enabled
        if (this.aiEnabled) {
            try {
                const aiResult = await this.generateAIFacebookPost(dealData, options);
                if (aiResult.success) {
                    this.stats.aiGenerated++;
                    this.updateStats(startTime, 'ai');
                    return aiResult;
                }
            } catch (error) {
                console.log(`AI Facebook generation failed: ${error.message}`);
                this.stats.aiFailures++;
            }
        }
        
        // Fallback to templates
        if (this.fallbackEnabled) {
            const templateResult = this.generateTemplateFacebookPost(dealData, options);
            this.stats.templateGenerated++;
            this.updateStats(startTime, 'template');
            return templateResult;
        }
        
        throw new Error('No content generation method available');
    }

    // 📧 SMART EMAIL GENERATION  
    async generateEmail(deals, options = {}) {
        const startTime = Date.now();
        
        // Try AI generation first if enabled
        if (this.aiEnabled) {
            try {
                const aiResult = await this.generateAIEmail(deals, options);
                if (aiResult.success) {
                    this.stats.aiGenerated++;
                    this.updateStats(startTime, 'ai');
                    return aiResult;
                }
            } catch (error) {
                console.log(`AI email generation failed: ${error.message}`);
                this.stats.aiFailures++;
            }
        }
        
        // Fallback to templates
        if (this.fallbackEnabled) {
            const templateResult = this.generateTemplateEmail(deals, options);
            this.stats.templateGenerated++;
            this.updateStats(startTime, 'template');
            return templateResult;
        }
        
        throw new Error('No email generation method available');
    }

    // 🧠 AI-POWERED FACEBOOK POST
    async generateAIFacebookPost(dealData, options) {
        const { timeOfDay, audience, urgency } = options;
        const savings = (dealData.originalPrice - dealData.price).toFixed(2);
        
        const prompt = `Create an engaging Facebook post for this deal:

Product: ${dealData.title}
Original Price: $${dealData.originalPrice}
Sale Price: $${dealData.price}  
Discount: ${dealData.discount}%
Savings: $${savings}
Category: ${dealData.category}
Condition: ${dealData.condition}

Context:
- Time of posting: ${timeOfDay || 'general'}
- Target audience: ${audience || 'deal hunters'}
- Urgency level: ${urgency || 'medium'}
- Current season: ${this.getCurrentSeason()}
- Today: ${this.getDayOfWeek()}

Requirements:
- Use compelling emojis (but not excessive, max 6)
- Include exact savings amount in dollars
- Create appropriate urgency without being spammy
- Add relevant hashtags (5-7 hashtags max)
- Keep under 250 characters for optimal engagement
- Include a clear call-to-action
- Make it shareable and engaging
- Match the tone to time of day (energetic morning, relaxed evening)

Return only the Facebook post content, no additional explanation.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const content = response.text().trim();
        
        // Estimate cost (rough calculation)
        const tokens = Math.ceil(content.length / 4);
        const cost = tokens * 0.000002; // Gemini Flash pricing
        this.stats.totalCost += cost;
        
        return {
            success: true,
            content: content,
            method: 'ai',
            metadata: {
                generatedAt: new Date().toISOString(),
                estimatedTokens: tokens,
                estimatedCost: cost,
                dealId: dealData.id,
                options: options
            }
        };
    }

    // 🧠 AI-POWERED EMAIL GENERATION
    async generateAIEmail(deals, options) {
        const { emailType, subscriberSegment } = options;
        
        const dealsText = deals.map(deal => {
            const savings = (deal.originalPrice - deal.price).toFixed(2);
            return `${deal.title} - ${deal.discount}% OFF ($${deal.originalPrice} → $${deal.price}, save $${savings})`;
        }).join('\n');

        const prompt = `Create a complete email newsletter with these deals:

${dealsText}

Context:
- Email type: ${emailType || 'daily digest'}
- Subscriber segment: ${subscriberSegment || 'general'}
- Season: ${this.getCurrentSeason()}
- Day: ${this.getDayOfWeek()}
- Number of deals: ${deals.length}

Create a complete email including:
1. Compelling subject line (under 50 characters)
2. Engaging header/intro (2-3 sentences)
3. Individual deal presentations with descriptions
4. Social proof elements
5. Clear call-to-actions
6. Professional footer

Requirements:
- Professional but friendly tone
- Include exact savings amounts
- Create urgency appropriately
- Mobile-friendly format
- High conversion focus
- Include relevant emojis sparingly

Return as JSON with: {"subject": "", "intro": "", "dealsHtml": "", "footer": ""}`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let content = response.text().trim();
        
        // Clean up JSON response if needed
        if (!content.startsWith('{')) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }
        }
        
        const parsedContent = JSON.parse(content);
        
        // Build complete HTML email
        const htmlEmail = this.buildCompleteEmail(parsedContent);
        
        const tokens = Math.ceil(content.length / 4);
        const cost = tokens * 0.000002;
        this.stats.totalCost += cost;
        
        return {
            success: true,
            subject: parsedContent.subject,
            html: htmlEmail,
            text: this.generateTextVersion(parsedContent, deals),
            method: 'ai',
            metadata: {
                generatedAt: new Date().toISOString(),
                estimatedTokens: tokens,
                estimatedCost: cost,
                dealCount: deals.length,
                options: options
            }
        };
    }

    // 🎨 TEMPLATE FALLBACK METHODS
    generateTemplateFacebookPost(dealData, options) {
        const content = FacebookTemplates.generatePost(dealData);
        
        return {
            success: true,
            content: content,
            method: 'template',
            metadata: {
                generatedAt: new Date().toISOString(),
                estimatedCost: 0,
                dealId: dealData.id,
                template: 'facebook_post_templates'
            }
        };
    }

    generateTemplateEmail(deals, options) {
        const emailData = EmailTemplates.generateCompleteEmail(deals, options.emailType);
        
        return {
            success: true,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
            method: 'template',
            metadata: {
                generatedAt: new Date().toISOString(),
                estimatedCost: 0,
                dealCount: deals.length,
                template: 'email_newsletter_templates'
            }
        };
    }

    // 🔧 UTILITY METHODS
    buildCompleteEmail(parsedContent) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${parsedContent.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">📡 DealRadarUS</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${parsedContent.intro}</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    ${parsedContent.dealsHtml}
                </div>
                
                <!-- Footer -->
                <div style="background: #f5f5f5; padding: 30px; text-align: center; border-top: 3px solid #ff4444;">
                    ${parsedContent.footer}
                    <p style="color: #666; font-size: 14px;">Follow us: 
                        <a href="https://www.facebook.com/DealRadarUS" style="color: #ff4444;">Facebook</a> | 
                        <a href="https://dealradarus.com" style="color: #ff4444;">Website</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateTextVersion(parsedContent, deals) {
        let textContent = `DealRadarUS - ${parsedContent.intro}\n\n`;
        
        deals.forEach((deal, index) => {
            const savings = (deal.originalPrice - deal.price).toFixed(2);
            textContent += `${index + 1}. ${deal.title}\n`;
            textContent += `   ${deal.discount}% OFF - $${deal.price.toFixed(2)} (was $${deal.originalPrice.toFixed(2)})\n`;
            textContent += `   Save $${savings}! Link: ${deal.affiliateUrl}\n\n`;
        });
        
        textContent += `Visit: https://dealradarus.com\nUnsubscribe: {unsubscribeUrl}`;
        return textContent;
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    getDayOfWeek() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    }

    updateStats(startTime, method) {
        const responseTime = Date.now() - startTime;
        this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
    }

    // 📊 ANALYTICS & MONITORING
    getPerformanceStats() {
        const total = this.stats.aiGenerated + this.stats.templateGenerated;
        
        return {
            totalGenerated: total,
            aiGenerated: this.stats.aiGenerated,
            templateGenerated: this.stats.templateGenerated,
            aiSuccessRate: total > 0 ? ((this.stats.aiGenerated / total) * 100).toFixed(1) : 0,
            aiFailures: this.stats.aiFailures,
            totalCost: this.stats.totalCost.toFixed(4),
            averageResponseTime: Math.round(this.stats.averageResponseTime),
            estimatedDailyCost: (this.stats.totalCost * 24).toFixed(4),
            costSavingsVsOpenAI: ((0.02 - 0.000002) * this.stats.aiGenerated * 500).toFixed(2)
        };
    }

    resetStats() {
        this.stats = {
            aiGenerated: 0,
            templateGenerated: 0,
            aiFailures: 0,
            totalCost: 0,
            averageResponseTime: 0
        };
    }

    // 🎯 BATCH GENERATION FOR AUTOMATION
    async generateBatchFacebookPosts(deals, options = {}) {
        const results = [];
        
        for (const deal of deals) {
            try {
                const result = await this.generateFacebookPost(deal, {
                    ...options,
                    timeOfDay: this.getTimeOfDay()
                });
                results.push(result);
                
                // Small delay to avoid rate limiting
                await this.sleep(100);
                
            } catch (error) {
                console.error(`Failed to generate post for deal ${deal.id}: ${error.message}`);
                results.push({
                    success: false,
                    error: error.message,
                    dealId: deal.id
                });
            }
        }
        
        return results;
    }

    async generateDailyNewsletter(deals, subscriberSegment = 'general') {
        return await this.generateEmail(deals, {
            emailType: 'daily',
            subscriberSegment: subscriberSegment
        });
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SmartContentGenerator;

// CLI usage
if (require.main === module) {
    const generator = new SmartContentGenerator();
    
    // Test generation
    const sampleDeal = {
        id: 1,
        title: "MacBook Air 13-inch",
        originalPrice: 1299,
        price: 899,
        discount: 31,
        category: "electronics",
        condition: "refurbished"
    };
    
    console.log('🤖 Testing Smart Content Generator...\n');
    
    generator.generateFacebookPost(sampleDeal, { timeOfDay: 'morning' })
        .then(result => {
            console.log('📱 Facebook Post Result:');
            console.log('Content:', result.content);
            console.log('Method:', result.method);
            console.log('Cost:', result.metadata?.estimatedCost || 'Free');
            console.log('\n📊 Performance Stats:');
            console.log(JSON.stringify(generator.getPerformanceStats(), null, 2));
        })
        .catch(error => {
            console.error('❌ Generation failed:', error.message);
        });
}