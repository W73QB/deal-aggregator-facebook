#!/usr/bin/env node

/**
 * 🧠 Advanced AI Blog Engine with Human Touch
 * ==========================================
 * Creates viral, human-like blog content with trend analysis
 */

require('dotenv').config({ path: '.env.dealradarus.local' });

// Optional AI dependency - gracefully handle if not installed
let GoogleGenerativeAI;
try {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (error) {
    console.log('ℹ️  @google/generative-ai not installed - blog engine disabled');
    GoogleGenerativeAI = null;
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AdvancedBlogEngine {
    constructor() {
        if (GoogleGenerativeAI) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } else {
            this.genAI = null;
            this.model = null;
        }
        
        // Human personality traits for content
        this.personalities = {
            dealHunter: {
                tone: "excited but knowledgeable deal hunter",
                traits: ["uses personal experiences", "shares insider tips", "creates urgency naturally", "builds community"],
                phrases: ["I've been tracking this deal", "Fellow deal hunters", "Trust me on this one", "Here's what I discovered"]
            },
            techExpert: {
                tone: "tech-savvy friend who loves sharing finds",
                traits: ["explains tech simply", "compares alternatives", "shares real usage scenarios", "honest about drawbacks"],
                phrases: ["I tested this myself", "Here's the real scoop", "Let me break this down", "Been using this for months"]
            },
            budgetGuru: {
                tone: "budget-conscious advisor helping families save",
                traits: ["focuses on value", "considers family needs", "practical advice", "money-saving strategies"],
                phrases: ["This will actually save you money", "Perfect for families on a budget", "I wish I knew this sooner", "Your wallet will thank you"]
            }
        };
        
        this.currentTrends = [];
        this.contentHistory = [];
    }

    // 🔍 ADVANCED TREND ANALYSIS
    async analyzeTrends() {
        console.log('🔍 Analyzing current trends for deal content...');
        
        const trendPrompt = `Analyze current trends for September 2025 that would be relevant for deal/discount content targeting US consumers:

1. Seasonal trends (back-to-school, fall preparation, holiday prep)
2. Technology trends (popular gadgets, must-have tech)
3. Lifestyle trends (fitness, home improvement, fashion)
4. Economic trends (budget-conscious shopping, inflation concerns)
5. Social media trends (viral products, influencer recommendations)

Focus on trends that would make people interested in:
- Electronics deals (MacBooks, phones, headphones)
- Smart home products
- Gaming equipment
- Home security
- Fitness equipment
- Fashion/accessories

Return as JSON array of trending topics with:
{
  "trend": "trend name",
  "relevance": "why it's relevant to deals",
  "keywords": ["keyword1", "keyword2"],
  "urgency": "high/medium/low",
  "audience": "target audience"
}`;

        try {
            if (!this.model) {
                throw new Error('AI model not available');
            }
            const result = await this.model.generateContent(trendPrompt);
            const response = await result.response.text();
            
            // Clean and parse JSON
            let trendsData = response.replace(/```json|```/g, '').trim();
            if (!trendsData.startsWith('[')) {
                const jsonMatch = trendsData.match(/\[[^\]]*\]/s);
                trendsData = jsonMatch ? jsonMatch[0] : '[]';
            }
            
            this.currentTrends = JSON.parse(trendsData);
            console.log(`✅ Identified ${this.currentTrends.length} relevant trends`);
            
            return this.currentTrends;
            
        } catch (error) {
            console.log('❌ Trend analysis failed, using fallback trends');
            this.currentTrends = this.getFallbackTrends();
            return this.currentTrends;
        }
    }

    // 📝 CREATE HUMAN-LIKE BLOG POST
    async createHumanBlogPost(deals, selectedPersonality = 'dealHunter') {
        const personality = this.personalities[selectedPersonality];
        const relevantTrends = this.currentTrends.slice(0, 2); // Use top 2 trends
        
        const dealsText = deals.map(deal => {
            const savings = (deal.originalPrice - deal.price).toFixed(2);
            return `${deal.title} - ${deal.discount}% OFF ($${deal.originalPrice} → $${deal.price}, save $${savings})`;
        }).join('\n');

        const humanPrompt = `You are a ${personality.tone} writing a blog post about today's deals. 

PERSONALITY TRAITS:
${personality.traits.map(trait => `- ${trait}`).join('\n')}

COMMON PHRASES TO USE NATURALLY:
${personality.phrases.map(phrase => `- "${phrase}"`).join('\n')}

CURRENT TRENDS TO INCORPORATE:
${relevantTrends.map(trend => `- ${trend.trend}: ${trend.relevance}`).join('\n')}

DEALS TO FEATURE:
${dealsText}

REQUIREMENTS:
1. Write like a real person who genuinely loves finding deals
2. Include personal anecdotes (make them believable)
3. Use conversational tone with contractions (I'm, don't, you'll)
4. Add specific details that show expertise
5. Create natural urgency without being pushy
6. Include trending topics naturally in context
7. Use emotional triggers (excitement, FOMO, community)
8. Add practical buying advice
9. Include comparison with similar products
10. End with genuine call-to-action

LENGTH: 1200-1500 words (detailed, engaging content)

STRUCTURE:
- Engaging hook that references current trends
- Personal introduction to today's finds
- Detailed analysis of each deal with personal insights
- Comparison section with alternatives
- Practical buying tips
- Community engagement (asking readers questions)
- Strong but natural conclusion

TONE: Enthusiastic friend sharing amazing discoveries, not a salesperson

Return as JSON:
{
  "title": "SEO-optimized title with trending keywords",
  "metaDescription": "compelling meta description under 155 chars",
  "introduction": "engaging opening with personal touch",
  "sections": [
    {
      "heading": "section heading",
      "content": "detailed section content with personality",
      "dealId": "relevant deal id if applicable"
    }
  ],
  "conclusion": "engaging conclusion with community CTA",
  "keywords": ["primary keywords for SEO"],
  "personalityUsed": "${selectedPersonality}"
}`;

        try {
            if (!this.model) {
                throw new Error('AI model not available');
            }
            const result = await this.model.generateContent(humanPrompt);
            const response = await result.response.text();
            
            // Clean JSON response
            let content = response.replace(/```json|```/g, '').trim();
            if (!content.startsWith('{')) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                content = jsonMatch ? jsonMatch[0] : content;
            }
            
            const blogData = JSON.parse(content);
            
            // Add current trends and timestamp
            blogData.trendsUsed = relevantTrends;
            blogData.generatedAt = new Date().toISOString();
            blogData.estimatedReadTime = Math.ceil(blogData.sections.reduce((acc, section) => 
                acc + section.content.split(' ').length, 0) / 200);
            
            return blogData;
            
        } catch (error) {
            console.log('❌ Human blog creation failed:', error.message);
            return this.createFallbackHumanBlog(deals, personality);
        }
    }

    // 🎨 CREATE COMPLETE HTML WITH HUMAN TOUCH
    createHumanBlogHTML(blogData, deals) {
        if (!blogData) {
            throw new Error('blogData is required for createHumanBlogHTML');
        }

        const dateString = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const personalityKey = blogData.personalityUsed || 'dealHunter';
        const authorPersonality = this.personalities[personalityKey] || this.personalities['dealHunter'];
        const authorName = this.getAuthorName(personalityKey);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogData.title} | DealRadarUS</title>
    <meta name="description" content="${blogData.metaDescription}">
    <meta name="keywords" content="${blogData.keywords.join(', ')}">
    <meta name="author" content="${authorName}">
    <link rel="canonical" href="https://dealradarus.com/blog/${this.getDateString()}.html">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${blogData.title}">
    <meta property="og:description" content="${blogData.metaDescription}">
    <meta property="og:url" content="https://dealradarus.com/blog/${this.getDateString()}.html">
    <meta property="og:type" content="article">
    <meta property="article:author" content="${authorName}">
    <meta property="article:published_time" content="${new Date().toISOString()}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${blogData.title}",
      "description": "${blogData.metaDescription}",
      "author": {
        "@type": "Person",
        "name": "${authorName}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "DealRadarUS",
        "logo": "https://dealradarus.com/logo.png"
      },
      "datePublished": "${new Date().toISOString()}",
      "mainEntityOfPage": "https://dealradarus.com/blog/${this.getDateString()}.html"
    }
    </script>
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9ZVTTTBD03');
    </script>
    
    <style>
        body { 
            font-family: 'Georgia', serif; 
            line-height: 1.8; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #fefefe;
            color: #333;
        }
        .author-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .author-info img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid white;
        }
        .deal-card { 
            border: 2px solid #ff4444; 
            border-radius: 15px; 
            padding: 25px; 
            margin: 25px 0; 
            background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
            box-shadow: 0 4px 15px rgba(255,68,68,0.1);
        }
        .price { 
            color: #ff4444; 
            font-weight: bold; 
            font-size: 1.4em; 
        }
        .original-price { 
            text-decoration: line-through; 
            color: #999; 
            margin-left: 10px;
        }
        .savings-badge {
            background: #ff4444;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        .cta-button { 
            background: linear-gradient(135deg, #ff4444 0%, #cc3333 100%);
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            display: inline-block; 
            margin: 15px 0;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255,68,68,0.3);
            transition: transform 0.3s ease;
        }
        .cta-button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,68,68,0.4);
        }
        .trend-highlight {
            background: #f0f8ff;
            border-left: 4px solid #4285f4;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .personal-note {
            font-style: italic;
            background: #fffbf0;
            border: 1px solid #ffd700;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reading-time {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <header>
        <h1>${blogData.title}</h1>
        <div class="reading-time">📖 ${blogData.estimatedReadTime} min read | Published on ${dateString}</div>
        
        <div class="author-info">
            <div>
                <h3>✍️ ${authorName}</h3>
                <p>Your ${authorPersonality.tone} sharing today's best finds!</p>
            </div>
        </div>
    </header>
    
    <main>
        <section class="introduction">
            ${blogData.introduction}
        </section>
        
        ${blogData.sections.map((section, index) => {
            const relatedDeal = deals.find(d => d.id == section.dealId);
            return `
                <section class="content-section">
                    <h2>${section.heading}</h2>
                    ${section.content}
                    
                    ${relatedDeal ? `
                        <div class="deal-card">
                            <h3>🔥 ${relatedDeal.title}</h3>
                            <div class="pricing">
                                <span class="price">$${relatedDeal.price}</span>
                                <span class="original-price">$${relatedDeal.originalPrice}</span>
                                <div class="savings-badge">${relatedDeal.discount}% OFF - Save $${(relatedDeal.originalPrice - relatedDeal.price).toFixed(2)}</div>
                            </div>
                            <a href="https://dealradarus.com/deals/${relatedDeal.id}?utm_source=blog&utm_medium=content&utm_campaign=daily_deals" 
                               class="cta-button" target="_blank" rel="nofollow">
                               🛒 Get This Deal Now
                            </a>
                        </div>
                    ` : ''}
                </section>
            `;
        }).join('')}
        
        ${blogData.trendsUsed.length > 0 ? `
            <div class="trend-highlight">
                <h3>🔥 Why These Deals Are Trending Now</h3>
                ${blogData.trendsUsed.map(trend => `
                    <p><strong>${trend.trend}:</strong> ${trend.relevance}</p>
                `).join('')}
            </div>
        ` : ''}
        
        <section class="conclusion">
            ${blogData.conclusion}
        </section>
        
        <div class="personal-note">
            <p>👋 <strong>Personal Note from ${authorName}:</strong> I personally research every deal I share. If you found this helpful, drop a comment below or share with fellow deal hunters! Questions? I'm always here to help. Happy savings! 💰</p>
        </div>
        
        <!-- Social Sharing -->
        <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3>💬 Love These Deals? Share The Savings!</h3>
            <p>Help your friends save money too:</p>
            <div>
                <a href="https://www.facebook.com/sharer/sharer.php?u=https://dealradarus.com/blog/${this.getDateString()}.html" 
                   target="_blank" style="margin: 0 10px; padding: 10px 20px; background: #1877f2; color: white; text-decoration: none; border-radius: 5px;">
                   📱 Share on Facebook
                </a>
                <a href="https://twitter.com/intent/tweet?url=https://dealradarus.com/blog/${this.getDateString()}.html&text=${encodeURIComponent(blogData.title)}" 
                   target="_blank" style="margin: 0 10px; padding: 10px 20px; background: #1da1f2; color: white; text-decoration: none; border-radius: 5px;">
                   🐦 Tweet This
                </a>
            </div>
        </div>
        
        <!-- Newsletter Signup -->
        <section class="newsletter-signup" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 40px 0; color: white;">
            <h3>🔔 Never Miss Another Amazing Deal!</h3>
            <p>Join 50,000+ savvy shoppers getting daily deal alerts</p>
            <form action="/api/newsletter-signup" method="POST" style="margin-top: 20px;">
                <input type="email" name="email" placeholder="Your email address" required
                       style="padding: 15px; border: none; border-radius: 25px; margin-right: 10px; width: 250px; font-size: 16px;">
                <button type="submit" style="padding: 15px 25px; background: #ff4444; color: white; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 16px;">
                    ✉️ Get Daily Deals Free
                </button>
            </form>
            <p style="font-size: 14px; margin-top: 15px; opacity: 0.9;">No spam, just the best deals. Unsubscribe anytime.</p>
        </section>
    </main>
    
    <footer style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #eee;">
        <p style="color: #666;">© 2025 DealRadarUS - Helping Americans save money, one deal at a time</p>
        <p>
            <a href="https://dealradarus.com" style="color: #ff4444;">🏠 Home</a> | 
            <a href="https://dealradarus.com/blog" style="color: #ff4444;">📝 Blog</a> | 
            <a href="https://www.facebook.com/DealRadarUS" style="color: #ff4444;">📱 Facebook</a> |
            <a href="https://dealradarus.com/contact" style="color: #ff4444;">📧 Contact ${authorName}</a>
        </p>
    </footer>
    
    <!-- Engagement tracking -->
    <script>
        // Track reading progress
        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > 0 && scrollPercent % 25 === 0) {
                gtag('event', 'scroll_progress', {
                    'custom_parameter': scrollPercent + '%'
                });
            }
        });
        
        // Track CTA clicks
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', function() {
                gtag('event', 'deal_click', {
                    'deal_name': this.closest('.deal-card').querySelector('h3').textContent
                });
            });
        });
    </script>
</body>
</html>`;
    }

    // 🎭 GET AUTHOR PERSONAS
    getAuthorName(personality) {
        const authors = {
            dealHunter: "Sarah Chen",
            techExpert: "Mike Rodriguez", 
            budgetGuru: "Jennifer Kim"
        };
        return authors[personality] || "DealRadarUS Team";
    }

    // 📅 UTILITY FUNCTIONS
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    getFallbackTrends() {
        return [
            {
                trend: "Back-to-School Tech Shopping",
                relevance: "Students and parents looking for laptop and tech deals",
                keywords: ["student discounts", "laptop deals", "tech for school"],
                urgency: "high",
                audience: "students, parents"
            },
            {
                trend: "Smart Home Security Awareness",
                relevance: "Rising concern about home security drives smart camera purchases",
                keywords: ["home security", "smart cameras", "safety"],
                urgency: "medium",
                audience: "homeowners"
            }
        ];
    }

    createFallbackHumanBlog(deals, personality) {
        const validDeals = Array.isArray(deals) ? deals : [];

        return {
            title: "Amazing Daily Deals That'll Make Your Day Better!",
            metaDescription: "Discover incredible deals on tech, home, and lifestyle products. Save big today!",
            introduction: "Hey deal hunters! I've been scouring the web all morning and found some absolutely incredible deals that I just had to share with you. Trust me, these are the kind of finds that make my day!",
            sections: validDeals.length > 0 ? validDeals.map(deal => ({
                heading: `${deal.title} - This One's Special!`,
                content: `I've been tracking ${deal.title} for weeks, and this ${deal.discount}% discount is the best I've seen all year! Here's why I think it's worth your attention...`,
                dealId: deal.id
            })) : [{
                heading: "Great Deals Coming Soon!",
                content: "We're working on finding the best deals for you. Check back soon for amazing savings!",
                dealId: null
            }],
            conclusion: "These deals won't last forever, and I'd hate for you to miss out. Which one caught your eye? Let me know in the comments!",
            keywords: ["daily deals", "discounts", "savings", "tech deals"],
            personalityUsed: personality || 'dealHunter',
            trendsUsed: [], // Empty array for template rendering
            generatedAt: new Date().toISOString(),
            estimatedReadTime: 3
        };
    }
}

module.exports = AdvancedBlogEngine;