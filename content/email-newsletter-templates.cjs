/**
 * 📧 Email Newsletter Templates Generator
 * ======================================
 * Comprehensive email templates for automated newsletters
 * Self-generated content - no external AI needed
 */

const EmailNewsletterTemplates = {
    
    // 📨 SUBJECT LINES
    subjectLines: {
        daily: [
            "🔥 5 Red-Hot Deals You Can't Miss Today",
            "💰 Daily Steal Alert: Save Up to 70% Today",
            "⚡ Flash Deals: Limited Time Offers Inside",
            "🎯 Handpicked Deals Just for You",
            "🚨 Deal Alert: Today's Top 5 Bargains",
            "💎 Premium Deals at Budget Prices",
            "⏰ 24-Hour Special: Don't Sleep on These",
            "🏆 Winner's Circle: Best Deals of the Day",
            "🔔 Deal Radar: 5 Amazing Finds Today",
            "💸 Money-Saving Monday/Tuesday/etc Deals"
        ],
        
        weekly: [
            "📊 Weekly Roundup: Top 10 Deals You Loved",
            "🎪 Week's Best Show: Spectacular Savings",
            "🗓️ 7 Days of Deals: The Highlights",
            "📈 Trending This Week: Hot Deals Report",
            "🎉 Weekly Winners: Deals That Dominated",
            "📋 Your Weekly Deal Digest",
            "🌟 Star Performers: This Week's Top Deals",
            "📸 Weekly Snapshot: Best Bargains Captured",
            "🏅 Champion Deals: Weekly Hall of Fame",
            "💌 Weekly Love Letter: Deals We Adore"
        ],
        
        special: [
            "🚨 BREAKING: Price Drop Alert on Popular Items",
            "🎁 Exclusive Member Deal: Just for Subscribers",
            "⚡ Flash Sale: 2 Hours Only!",
            "🔥 Hottest Deal of the Month Inside",
            "💥 Explosive Savings: Limited Quantity",
            "🎪 Special Event: Deals Extravaganza",
            "🌟 VIP Access: Premium Deals Unlocked",
            "🎯 Targeted Savings: Picked Just for You",
            "🏃‍♂️ Race Against Time: Ending Soon",
            "💎 Rare Find: Exclusive Deal Discovery"
        ]
    },

    // 📋 EMAIL HEADERS
    headers: {
        daily: [
            "🌅 Good morning, deal hunter! Ready to save big today?",
            "☕ Grab your coffee and these amazing deals!",
            "🎯 5 bull's-eye deals picked just for you",
            "💰 Your daily dose of spectacular savings",
            "🔍 Deal radar detected these hot bargains",
            "⚡ Lightning-fast deals before they disappear",
            "🏆 Today's championship savings lineup",
            "🎪 Step right up to today's deal spectacular",
            "🌟 Shine bright with these stellar deals",
            "🚀 Blast off to savings with today's deals"
        ],
        
        weekly: [
            "📊 This week's deal performance was incredible!",
            "🎉 What a week for savings! Here's the recap",
            "📈 Trending deals report: You'll love these stats",
            "🌟 Star deals that stole the show this week",
            "📸 Picture perfect deals from the past 7 days",
            "🏅 Hall of fame: This week's champion deals",
            "💌 Love letter to the deals that made us smile",
            "🎭 Drama-free deals: The week's best performers",
            "🗓️ Weekly wisdom: Deals that taught us something",
            "🎪 The greatest deal show on earth continues"
        ]
    },

    // 📝 DEAL ITEM TEMPLATES
    dealItemTemplates: [
        `
        <div style="border: 2px solid #ff4444; border-radius: 10px; padding: 20px; margin: 15px 0; background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background: #ff4444; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">🔥 {discount}% OFF</span>
                <span style="margin-left: 10px; color: #666; text-decoration: line-through; font-size: 14px;">\${originalPrice}</span>
                <span style="margin-left: 10px; color: #ff4444; font-weight: bold; font-size: 18px;">\${price}</span>
            </div>
            <h3 style="margin: 10px 0; color: #333; font-size: 18px;">{title}</h3>
            <p style="color: #666; font-size: 14px; margin: 10px 0;">{description}</p>
            <div style="margin-top: 15px;">
                <a href="{link}" style="background: #ff4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">🛒 Get This Deal</a>
                <span style="margin-left: 15px; color: #ff4444; font-size: 12px; font-weight: bold;">💰 Save \${savings}!</span>
            </div>
        </div>
        `,
        
        `
        <div style="border-left: 5px solid #00cc88; padding: 20px; margin: 15px 0; background: #f0fffb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333; font-size: 18px;">{title}</h3>
                <div style="text-align: right;">
                    <div style="color: #999; text-decoration: line-through; font-size: 14px;">\${originalPrice}</div>
                    <div style="color: #00cc88; font-weight: bold; font-size: 20px;">\${price}</div>
                </div>
            </div>
            <div style="background: #00cc88; color: white; padding: 8px 15px; border-radius: 25px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 10px;">
                ✨ {discount}% OFF - Save \${savings}
            </div>
            <p style="color: #555; font-size: 14px; margin: 10px 0;">{description}</p>
            <a href="{link}" style="background: #00cc88; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">👆 Claim Deal</a>
        </div>
        `,
        
        `
        <table style="width: 100%; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin: 15px 0;">
            <tr style="background: linear-gradient(135deg, #6a5acd 0%, #4169e1 100%); color: white;">
                <td style="padding: 15px; text-align: center;">
                    <h3 style="margin: 0; font-size: 18px;">{title}</h3>
                    <div style="margin-top: 5px; font-size: 24px; font-weight: bold;">{discount}% OFF</div>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; background: #f8f9ff;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="color: #999; text-decoration: line-through; font-size: 16px; margin-right: 10px;">\${originalPrice}</span>
                        <span style="color: #6a5acd; font-size: 24px; font-weight: bold;">\${price}</span>
                        <div style="color: #6a5acd; font-size: 14px; margin-top: 5px;">You save \${savings}!</div>
                    </div>
                    <p style="color: #555; font-size: 14px; text-align: center; margin-bottom: 15px;">{description}</p>
                    <div style="text-align: center;">
                        <a href="{link}" style="background: #6a5acd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">🎯 Get Deal Now</a>
                    </div>
                </td>
            </tr>
        </table>
        `
    ],

    // 📱 FOOTER TEMPLATES
    footers: [
        `
        <div style="background: #f5f5f5; padding: 30px; margin-top: 40px; text-align: center; border-top: 3px solid #ff4444;">
            <h3 style="color: #333; margin-bottom: 20px;">🎯 Why Choose DealRadarUS?</h3>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin-bottom: 20px;">
                <div style="margin: 10px; text-align: center;">
                    <div style="font-size: 24px;">🔍</div>
                    <div style="font-weight: bold; color: #333;">Expert Curation</div>
                    <div style="font-size: 12px; color: #666;">Hand-picked deals</div>
                </div>
                <div style="margin: 10px; text-align: center;">
                    <div style="font-size: 24px;">⚡</div>
                    <div style="font-weight: bold; color: #333;">Lightning Fast</div>
                    <div style="font-size: 12px; color: #666;">Real-time alerts</div>
                </div>
                <div style="margin: 10px; text-align: center;">
                    <div style="font-size: 24px;">💰</div>
                    <div style="font-weight: bold; color: #333;">Maximum Savings</div>
                    <div style="font-size: 12px; color: #666;">Best prices guaranteed</div>
                </div>
            </div>
            <p style="color: #666; font-size: 14px;">Follow us for daily deals: 
                <a href="https://www.facebook.com/DealRadarUS" style="color: #ff4444; text-decoration: none;">Facebook</a> | 
                <a href="https://www.tiktok.com/@dealradar_us" style="color: #ff4444; text-decoration: none;">TikTok</a> | 
                <a href="https://www.youtube.com/@Deal_Radar_US" style="color: #ff4444; text-decoration: none;">YouTube</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                You're receiving this because you subscribed to DealRadarUS deals.<br>
                <a href="{unsubscribeUrl}" style="color: #999;">Unsubscribe</a> | 
                <a href="https://dealradarus.com" style="color: #999;">Visit Website</a>
            </p>
        </div>
        `,
        
        `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; margin-top: 40px; text-align: center; color: white;">
            <h3 style="margin-bottom: 20px;">🌟 Join the Deal Community!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">Over 50,000 smart shoppers trust DealRadarUS for the best deals</p>
            <div style="margin-bottom: 20px;">
                <a href="https://www.facebook.com/DealRadarUS" style="background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; margin: 0 10px; display: inline-block;">📘 Facebook</a>
                <a href="https://dealradarus.com" style="background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; margin: 0 10px; display: inline-block;">🌐 Website</a>
            </div>
            <p style="font-size: 12px; opacity: 0.8;">
                © 2025 DealRadarUS - Your trusted deal discovery partner<br>
                <a href="{unsubscribeUrl}" style="color: rgba(255,255,255,0.8);">Unsubscribe</a>
            </p>
        </div>
        `
    ],

    // 🎉 SPECIAL OCCASION TEMPLATES
    specialOccasions: {
        welcome: `
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 10px;">
            <h1 style="font-size: 32px; margin-bottom: 20px;">🎉 Welcome to DealRadarUS!</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">You've just joined thousands of smart shoppers who save big every day!</p>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">🎁 Welcome Gift: Exclusive Deals Below!</h3>
                <p>As a new member, here are 3 handpicked deals just for you:</p>
            </div>
        </div>
        `,
        
        birthday: `
        <div style="background: linear-gradient(135deg, #ffc837 0%, #ff8008 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 10px;">
            <h1 style="font-size: 32px; margin-bottom: 20px;">🎂 Happy Birthday from DealRadarUS!</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">Celebrating another year of smart shopping with you!</p>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">🎁 Birthday Special: Extra Savings Inside!</h3>
                <p>Your birthday gift: Our best deals of the month!</p>
            </div>
        </div>
        `,
        
        milestone: `
        <div style="background: linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%); padding: 40px 20px; text-align: center; color: #333; border-radius: 10px;">
            <h1 style="font-size: 32px; margin-bottom: 20px;">🏆 Milestone Achievement!</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">You've saved over $1,000 with DealRadarUS deals!</p>
            <div style="background: rgba(255,255,255,0.7); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px; color: #333;">🎯 VIP Status Unlocked!</h3>
                <p style="color: #333;">Exclusive deals reserved for our top savers:</p>
            </div>
        </div>
        `
    },

    // 🎯 CTA VARIATIONS
    ctaButtons: [
        '🛒 Shop This Deal',
        '🔥 Get It Now',
        '💰 Save Money',
        '⚡ Grab Deal',
        '🎯 Claim Offer',
        '✨ Buy Now',
        '🚀 Get Started',
        '💎 Unlock Savings',
        '🏆 Win This Deal',
        '⭐ Premium Access'
    ]
};

// 📊 EMAIL GENERATION FUNCTIONS
function generateSubjectLine(type = 'daily', dealCount = 5) {
    const subjects = EmailNewsletterTemplates.subjectLines[type];
    let subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Replace dynamic content
    subject = subject.replace(/\d+/, dealCount);
    subject = subject.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/, getDayName());
    
    return subject;
}

function generateEmailHeader(type = 'daily') {
    const headers = EmailNewsletterTemplates.headers[type];
    return headers[Math.floor(Math.random() * headers.length)];
}

function generateDealItem(dealData) {
    const template = EmailNewsletterTemplates.dealItemTemplates[
        Math.floor(Math.random() * EmailNewsletterTemplates.dealItemTemplates.length)
    ];
    
    const savings = (dealData.originalPrice - dealData.price).toFixed(2);
    
    return template
        .replace(/\{title\}/g, dealData.title)
        .replace(/\{price\}/g, dealData.price.toFixed(2))
        .replace(/\{originalPrice\}/g, dealData.originalPrice.toFixed(2))
        .replace(/\{discount\}/g, dealData.discount)
        .replace(/\{savings\}/g, savings)
        .replace(/\{description\}/g, dealData.description || generateDealDescription(dealData))
        .replace(/\{link\}/g, dealData.affiliateUrl);
}

function generateDealDescription(dealData) {
    const descriptions = [
        `Premium ${dealData.category} at an unbeatable price. Don't miss this limited-time offer!`,
        `Top-rated ${dealData.title} with excellent customer reviews. Perfect for your ${getCurrentSeason()} needs.`,
        `Professional-grade quality at budget-friendly pricing. Ideal for ${dealData.category} enthusiasts.`,
        `Customer favorite with outstanding value. This ${dealData.condition} item won't last long at this price.`,
        `Trending ${dealData.category} item with verified quality. Great for gifting or personal use.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateCompleteEmail(deals, type = 'daily') {
    const subject = generateSubjectLine(type, deals.length);
    const header = generateEmailHeader(type);
    const footer = EmailNewsletterTemplates.footers[Math.floor(Math.random() * EmailNewsletterTemplates.footers.length)];
    
    let dealItems = '';
    deals.forEach(deal => {
        dealItems += generateDealItem(deal);
    });
    
    const emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">📡 DealRadarUS</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${header}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                ${dealItems}
                
                <!-- Social Proof -->
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                    <h3 style="color: #333; margin-bottom: 15px;">💬 What Our Community Says</h3>
                    <p style="color: #666; font-style: italic;">"DealRadarUS saves me hundreds every month!" - Sarah K.</p>
                    <p style="color: #666; font-style: italic;">"Best deal alerts I've ever subscribed to!" - Mike R.</p>
                    <div style="margin-top: 15px;">
                        <span style="color: #ffa500; font-size: 20px;">⭐⭐⭐⭐⭐</span>
                        <div style="color: #333; font-weight: bold;">4.9/5 from 10,000+ subscribers</div>
                    </div>
                </div>
            </div>
            
            ${footer}
        </div>
    </body>
    </html>
    `;
    
    return {
        subject: subject,
        html: emailBody,
        text: generateTextVersion(deals, header)
    };
}

function generateTextVersion(deals, header) {
    let textContent = `DealRadarUS - ${header}\n\n`;
    
    deals.forEach((deal, index) => {
        const savings = (deal.originalPrice - deal.price).toFixed(2);
        textContent += `${index + 1}. ${deal.title}\n`;
        textContent += `   ${deal.discount}% OFF - Now $${deal.price.toFixed(2)} (was $${deal.originalPrice.toFixed(2)})\n`;
        textContent += `   Save $${savings}!\n`;
        textContent += `   Link: ${deal.affiliateUrl}\n\n`;
    });
    
    textContent += `Follow us:\n`;
    textContent += `Facebook: https://www.facebook.com/DealRadarUS\n`;
    textContent += `Website: https://dealradarus.com\n\n`;
    textContent += `Unsubscribe: {unsubscribeUrl}`;
    
    return textContent;
}

function getDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

module.exports = {
    EmailNewsletterTemplates,
    generateSubjectLine,
    generateEmailHeader,
    generateDealItem,
    generateDealDescription,
    generateCompleteEmail,
    generateTextVersion,
    getDayName,
    getCurrentSeason
};