/**
 * 📱 Facebook Post Templates Generator
 * ==================================
 * Comprehensive templates for automated social media posting
 * Eliminates need for OpenAI API - 100% self-generated content
 */

const FacebookPostTemplates = {
    
    // 🔥 HIGH-IMPACT DEAL ALERTS
    dealAlerts: [
        "🚨 DEAL ALERT: {title} - {discount}% OFF!\n💰 Now only ${price} (was ${originalPrice})\n⏰ Limited time - don't miss out!\n🔗 {link}\n{hashtags}",
        
        "🔥 HOT DEAL: {title}\n💵 Save ${savings} today!\n⭐ {discount}% discount - grab it fast!\n👆 Link in bio\n{hashtags}",
        
        "💎 DEAL OF THE DAY: {title}\n🎯 {discount}% OFF - Best price we've seen!\n💳 ${price} (originally ${originalPrice})\n🛒 Shop now: {link}\n{hashtags}",
        
        "⚡ FLASH SALE: {title}\n🏃‍♂️ Running out fast at {discount}% OFF\n💰 Your price: ${price}\n🔔 Set alert for more deals like this\n{hashtags}",
        
        "🎉 AMAZING FIND: {title}\n✨ {discount}% savings = ${savings} in your pocket\n🛍️ Perfect for {season} season\n👇 Get yours: {link}\n{hashtags}"
    ],

    // 🌅 TIME-BASED POSTING
    timeBasedPosts: {
        morning: [
            "☀️ GOOD MORNING DEAL HUNTERS!\n🔥 Start your day with {title}\n💰 {discount}% OFF - ${price}\n☕ Perfect with your morning coffee\n{hashtags}",
            
            "🌅 RISE & SAVE: {title}\n⏰ Early bird gets {discount}% OFF\n💵 ${price} - limited morning deal\n🏃‍♀️ Before it's gone!\n{hashtags}",
            
            "🌤️ MORNING MOTIVATION: {title}\n✨ {discount}% discount to start your day right\n💳 ${price} - treat yourself!\n☕ Fuel for your day\n{hashtags}"
        ],
        
        lunch: [
            "🍽️ LUNCH BREAK DEALS: {title}\n🥪 Take a bite out of these savings\n💰 {discount}% OFF - ${price}\n⏱️ Quick shopping during break\n{hashtags}",
            
            "🌮 MIDDAY MADNESS: {title}\n🎯 {discount}% discount for lunch shoppers\n💵 ${price} - satisfy your deal cravings\n🔔 Back to work savings\n{hashtags}",
            
            "🥗 HEALTHY DEALS: {title}\n💪 Good for you AND your wallet\n💰 {discount}% OFF - ${price}\n⚡ Energy boost pricing\n{hashtags}"
        ],
        
        evening: [
            "🌙 EVENING STEALS: {title}\n🛋️ Unwind with {discount}% savings\n💰 ${price} - end your day right\n🌟 Night owl special\n{hashtags}",
            
            "🌆 SUNSET SAVINGS: {title}\n🎭 {discount}% OFF for evening shoppers\n💵 ${price} - perfect timing\n🌙 Before you sleep on this deal\n{hashtags}",
            
            "⭐ AFTER HOURS: {title}\n🛏️ {discount}% discount - dream deal pricing\n💳 ${price} - worth staying up for\n💤 Sweet dreams of savings\n{hashtags}"
        ]
    },

    // 📅 SEASONAL & HOLIDAY CONTENT
    seasonal: {
        backToSchool: [
            "🎒 BACK TO SCHOOL: {title}\n📚 Student-approved {discount}% OFF\n💰 ${price} - perfect for semester\n🎓 Smart shopping for smart students\n{hashtags}",
            
            "✏️ SCHOOL SEASON: {title}\n📖 {discount}% discount for education\n💵 ${price} - ace this deal\n🏫 Ready for learning\n{hashtags}"
        ],
        
        blackFriday: [
            "🛍️ BLACK FRIDAY PREVIEW: {title}\n🖤 {discount}% OFF - early access\n💰 ${price} - beat the rush\n⚡ Before the chaos begins\n{hashtags}",
            
            "🔥 BLACK FRIDAY DEAL: {title}\n🛒 {discount}% savings - the main event\n💵 ${price} - holiday magic pricing\n🎁 Gift or treat yourself\n{hashtags}"
        ],
        
        christmas: [
            "🎄 CHRISTMAS DEAL: {title}\n🎁 {discount}% OFF - gift idea alert\n💰 ${price} - under the tree worthy\n🎅 Ho ho ho-ly good deal\n{hashtags}",
            
            "❄️ HOLIDAY SPECIAL: {title}\n⛄ {discount}% discount - winter wonderland pricing\n💵 ${price} - Christmas miracle deal\n🔔 Jingle all the way to savings\n{hashtags}"
        ],
        
        newYear: [
            "🎊 NEW YEAR, NEW DEALS: {title}\n✨ {discount}% OFF - resolution pricing\n💰 ${price} - fresh start savings\n🥂 Cheers to great deals\n{hashtags}",
            
            "🎆 2025 KICKOFF: {title}\n🚀 Start the year with {discount}% savings\n💵 ${price} - future-proof pricing\n⭐ Resolution-worthy deal\n{hashtags}"
        ]
    },

    // 🏷️ CATEGORY-SPECIFIC TEMPLATES
    categories: {
        electronics: [
            "📱 TECH TUESDAY: {title}\n🔌 {discount}% OFF latest technology\n💰 ${price} - cutting-edge pricing\n⚡ Power up your setup\n{hashtags}",
            
            "💻 GADGET ALERT: {title}\n🖥️ {discount}% discount for tech lovers\n💵 ${price} - innovation at its finest\n🔋 Charge up your savings\n{hashtags}",
            
            "🎮 GAMER DEAL: {title}\n🕹️ Level up with {discount}% OFF\n💰 ${price} - boss battle pricing\n🏆 Victory through savings\n{hashtags}"
        ],
        
        home: [
            "🏠 HOME SWEET SAVINGS: {title}\n🛋️ {discount}% OFF for your space\n💰 ${price} - domestic bliss pricing\n✨ Transform your home\n{hashtags}",
            
            "🛏️ COZY DEALS: {title}\n🏡 {discount}% discount for comfort lovers\n💵 ${price} - nest-worthy pricing\n🌿 Home is where the deals are\n{hashtags}",
            
            "🍳 KITCHEN MAGIC: {title}\n👨‍🍳 Chef-approved {discount}% OFF\n💰 ${price} - recipe for savings\n🔥 Cooking up great deals\n{hashtags}"
        ],
        
        fashion: [
            "👗 FASHION FRIDAY: {title}\n✨ Stylish {discount}% OFF\n💰 ${price} - runway-worthy pricing\n👠 Strut your savings\n{hashtags}",
            
            "🕶️ STYLE STEAL: {title}\n💅 {discount}% discount for fashionistas\n💵 ${price} - trendsetter pricing\n📸 Instagram-ready deals\n{hashtags}",
            
            "👔 WARDROBE REFRESH: {title}\n🌟 {discount}% OFF - closet upgrade\n💰 ${price} - fashion-forward pricing\n💃 Dance into savings\n{hashtags}"
        ],
        
        fitness: [
            "💪 FITNESS FRIDAY: {title}\n🏋️‍♀️ Strong {discount}% OFF\n💰 ${price} - muscle-building pricing\n🏃‍♂️ Run to this deal\n{hashtags}",
            
            "🧘‍♀️ WELLNESS WEDNESDAY: {title}\n🌱 Healthy {discount}% discount\n💵 ${price} - mind-body-wallet balance\n⚡ Energize your savings\n{hashtags}",
            
            "🏃‍♀️ CARDIO DEALS: {title}\n❤️ Heart-pumping {discount}% OFF\n💰 ${price} - endurance pricing\n🔥 Burn calories, not money\n{hashtags}"
        ]
    },

    // 💬 ENGAGEMENT-FOCUSED POSTS
    engagement: [
        "🤔 DEAL OR NO DEAL: {title}\n💭 {discount}% OFF - what do you think?\n💰 ${price} - worth it?\n👇 Comment your thoughts!\n{hashtags}",
        
        "🎯 TARGET AUDIENCE: Who needs {title}?\n🙋‍♀️ {discount}% OFF for the right person\n💵 ${price} - tag someone who'd love this\n💌 Share the love!\n{hashtags}",
        
        "⭐ RATE THIS DEAL: {title}\n📊 {discount}% OFF - scale of 1-10?\n💰 ${price} - deal score?\n🔢 Drop your rating below!\n{hashtags}",
        
        "🏆 DEAL CHAMPION: {title}\n👑 {discount}% OFF - are you the winner?\n💵 ${price} - claim your prize\n🎉 First come, first served!\n{hashtags}"
    ],

    // 🚨 URGENCY & SCARCITY
    urgency: [
        "⏰ ONLY {hours} HOURS LEFT: {title}\n🏃‍♂️ {discount}% OFF expires soon\n💰 ${price} - clock is ticking\n🚨 Don't wait!\n{hashtags}",
        
        "📦 LAST {quantity} UNITS: {title}\n🔥 {discount}% OFF while supplies last\n💵 ${price} - going fast\n⚡ Grab it now!\n{hashtags}",
        
        "🚨 PRICE DROP ALERT: {title}\n📉 {discount}% OFF - lowest ever\n💰 ${price} - won't see this again\n⏰ Limited time only\n{hashtags}",
        
        "🎪 FINAL CALL: {title}\n🎭 {discount}% OFF - show's almost over\n💵 ${price} - curtain falling\n👏 Last chance applause\n{hashtags}"
    ],

    // 📈 SOCIAL PROOF & REVIEWS
    socialProof: [
        "⭐⭐⭐⭐⭐ 5-STAR DEAL: {title}\n👥 Thousands love this at {discount}% OFF\n💰 ${price} - customer approved\n💬 Join the happy buyers\n{hashtags}",
        
        "🗣️ CUSTOMER FAVORITE: {title}\n❤️ 98% recommend at {discount}% OFF\n💵 ${price} - proven popular\n📸 Check the reviews\n{hashtags}",
        
        "🏅 BEST SELLER: {title}\n📊 #1 choice with {discount}% discount\n💰 ${price} - crowd pleaser\n🔥 Join the trend\n{hashtags}",
        
        "💌 TESTIMONIAL TUESDAY: {title}\n🌟 'Best purchase ever' + {discount}% OFF\n💵 ${price} - happiness guaranteed\n😊 Smile-worthy savings\n{hashtags}"
    ]
};

// 🎯 HASHTAG COLLECTIONS
const HashtagSets = {
    general: "#Deals #Shopping #SaveMoney #DealRadarUS #Discounts #Sale",
    electronics: "#TechDeals #Electronics #Gadgets #Technology #SmartHome #Gaming",
    home: "#HomeDeals #Decor #Furniture #Kitchen #HomeImprovement #Cozy",
    fashion: "#FashionDeals #Style #OOTD #Shopping #Trendy #Wardrobe",
    fitness: "#FitnessDeals #Workout #Healthy #Wellness #FitLife #Strong",
    seasonal: "#SeasonalDeals #Holiday #SpecialOffer #LimitedTime #Exclusive",
    urgency: "#LastChance #LimitedTime #FlashSale #ActFast #DontMiss #GoingFast"
};

// 🎲 RANDOM SELECTION FUNCTIONS
function getRandomTemplate(category, subcategory = null) {
    if (subcategory && FacebookPostTemplates[category][subcategory]) {
        const templates = FacebookPostTemplates[category][subcategory];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    const templates = FacebookPostTemplates[category];
    return templates[Math.floor(Math.random() * templates.length)];
}

function getHashtagsForCategory(category) {
    return HashtagSets[category] || HashtagSets.general;
}

function generatePost(dealData) {
    const { title, price, originalPrice, discount, category, isUrgent, timeOfDay } = dealData;
    
    let template;
    
    // Select template based on context
    if (isUrgent) {
        template = getRandomTemplate('urgency');
    } else if (timeOfDay) {
        template = getRandomTemplate('timeBasedPosts', timeOfDay);
    } else if (category) {
        template = getRandomTemplate('categories', category);
    } else {
        template = getRandomTemplate('dealAlerts');
    }
    
    // Calculate savings
    const savings = (originalPrice - price).toFixed(2);
    
    // Get appropriate hashtags
    const hashtags = getHashtagsForCategory(category) + " " + HashtagSets.general;
    
    // Replace placeholders
    return template
        .replace(/\{title\}/g, title)
        .replace(/\{price\}/g, price.toFixed(2))
        .replace(/\{originalPrice\}/g, originalPrice.toFixed(2))
        .replace(/\{discount\}/g, discount)
        .replace(/\{savings\}/g, savings)
        .replace(/\{hashtags\}/g, hashtags)
        .replace(/\{link\}/g, dealData.link || 'Link in bio')
        .replace(/\{season\}/g, getCurrentSeason())
        .replace(/\{hours\}/g, Math.floor(Math.random() * 12) + 1)
        .replace(/\{quantity\}/g, Math.floor(Math.random() * 50) + 10);
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

module.exports = {
    FacebookPostTemplates,
    HashtagSets,
    getRandomTemplate,
    getHashtagsForCategory,
    generatePost,
    getCurrentSeason
};