const fs = require('fs');
const path = require('path');

// Load configurations
const env = JSON.parse(fs.readFileSync('../../config/.env.local.json', 'utf8'));
const sources = JSON.parse(fs.readFileSync('../../config/sources.json', 'utf8'));

// Date utilities
const today = new Date();
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

// Logging function
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}\n`;
    console.log(logMessage.trim());
    
    const logFile = path.join(env.LOGS_DIR, `crawl-${dateStr}.log`);
    fs.appendFileSync(logFile, logMessage);
}

// Currency normalization
function normalizeCurrency(priceText, region) {
    if (!priceText) return null;
    
    const cleanPrice = priceText.replace(/[^0-9.,]/g, '');
    const amount = parseFloat(cleanPrice.replace(',', ''));
    
    if (isNaN(amount)) return null;
    
    return {
        currency: region === 'US' ? 'USD' : 'GBP',
        amount: amount
    };
}

// Category inference
function inferCategory(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('pc')) return 'Electronics';
    if (titleLower.includes('phone') || titleLower.includes('mobile')) return 'Mobile';
    if (titleLower.includes('headphone') || titleLower.includes('speaker') || titleLower.includes('audio')) return 'Audio';
    if (titleLower.includes('game') || titleLower.includes('gaming')) return 'Gaming';
    if (titleLower.includes('home') || titleLower.includes('kitchen')) return 'Home';
    if (titleLower.includes('fashion') || titleLower.includes('clothing')) return 'Fashion';
    return 'General';
}

// Generate random delay
function getRandomDelay() {
    const baseDelay = sources.crawl_settings.request_delay_seconds * 1000;
    const jitter = sources.crawl_settings.random_jitter_percent / 100;
    const variation = baseDelay * jitter * (Math.random() - 0.5) * 2;
    return Math.max(1000, baseDelay + variation);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock crawler function (simulates scraping)
async function mockCrawlSource(sourceConfig, region) {
    log(`Starting crawl for ${sourceConfig.name} (${region})`);
    
    // Simulate realistic data for demo
    const mockDeals = [];
    const numItems = Math.min(sources.crawl_settings.max_items_per_source, Math.floor(Math.random() * 8) + 3);
    
    for (let i = 0; i < numItems; i++) {
        const dealId = `${sourceConfig.name}_${region.toLowerCase()}_${dateStr}_${i + 1}`;
        const basePrice = Math.floor(Math.random() * 200) + 20;
        const discount = Math.floor(Math.random() * 50) + 10;
        const finalPrice = basePrice * (1 - discount / 100);
        
        const mockDeal = {
            id: dealId,
            source: sourceConfig.name,
            region: region,
            title: `${sourceConfig.name.charAt(0).toUpperCase() + sourceConfig.name.slice(1)} Deal ${i + 1} - Premium Product`,
            url: `${sourceConfig.url}/product/${dealId}`,
            price: normalizeCurrency(`${finalPrice.toFixed(2)}`, region),
            priceCompare: normalizeCurrency(`${basePrice.toFixed(2)}`, region),
            discountText: `${discount}% OFF`,
            category: inferCategory(`Product ${i + 1}`),
            image: `https://via.placeholder.com/300x300?text=${sourceConfig.name}+${i + 1}`,
            timestamp: today.toISOString()
        };
        
        mockDeals.push(mockDeal);
    }
    
    log(`Successfully crawled ${mockDeals.length} deals from ${sourceConfig.name}`);
    await sleep(getRandomDelay());
    
    return mockDeals;
}

// Main crawling function
async function crawlAllSources() {
    const allDeals = [];
    const crawlResults = {};
    
    log('Starting multi-source deal crawling');
    
    // Crawl US sources
    for (const source of sources.sources.US) {
        if (!source.active) {
            log(`Skipping inactive source: ${source.name}`);
            continue;
        }
        
        try {
            const deals = await mockCrawlSource(source, 'US');
            allDeals.push(...deals);
            crawlResults[`${source.name}_US`] = { success: true, count: deals.length, error: null };
        } catch (error) {
            log(`Error crawling ${source.name}: ${error.message}`, 'ERROR');
            crawlResults[`${source.name}_US`] = { success: false, count: 0, error: error.message };
        }
    }
    
    // Crawl UK sources
    for (const source of sources.sources.UK) {
        if (!source.active) {
            log(`Skipping inactive source: ${source.name}`);
            continue;
        }
        
        try {
            const deals = await mockCrawlSource(source, 'UK');
            allDeals.push(...deals);
            crawlResults[`${source.name}_UK`] = { success: true, count: deals.length, error: null };
        } catch (error) {
            log(`Error crawling ${source.name}: ${error.message}`, 'ERROR');
            crawlResults[`${source.name}_UK`] = { success: false, count: 0, error: error.message };
        }
    }
    
    // Save raw deals
    const outputFile = path.join(env.DEALS_RAW_DIR, `raw-multi-${dateStr}.jsonl`);
    const jsonlContent = allDeals.map(deal => JSON.stringify(deal)).join('\n');
    fs.writeFileSync(outputFile, jsonlContent);
    
    log(`Saved ${allDeals.length} total deals to ${outputFile}`);
    
    // Summary
    const successCount = Object.values(crawlResults).filter(r => r.success).length;
    const totalSources = Object.keys(crawlResults).length;
    
    log(`Crawling complete: ${successCount}/${totalSources} sources successful, ${allDeals.length} total items`);
    
    return { deals: allDeals, results: crawlResults };
}

// Execute crawling
crawlAllSources().then((crawlResult) => {
    console.log('\\n=== CRAWL SUMMARY ===');
    console.log(`Total deals: ${crawlResult.deals.length}`);
    console.log('Source results:');
    for (const [source, sourceResult] of Object.entries(crawlResult.results)) {
        const status = sourceResult.success ? '✅' : '❌';
        console.log(`  ${source}: ${status} ${sourceResult.count} items${sourceResult.error ? ` (${sourceResult.error})` : ''}`);
    }
}).catch(console.error);