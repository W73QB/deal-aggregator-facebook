const fs = require('fs');
const path = require('path');

// Load configurations
const env = JSON.parse(fs.readFileSync("../../config/.env.local.json", 'utf8'));
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

// Load enriched deals
const enrichedFile = path.join(env.DEALS_ENRICHED_DIR, `enriched-multi-${dateStr}.jsonl`);
const enrichedDeals = fs.readFileSync(enrichedFile, 'utf8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

console.log(`Loaded ${enrichedDeals.length} enriched deals for scheduling`);

// Configuration
const maxPostsPerDay = env.MAX_POSTS_PER_DAY || 10;
const timezones = env.TIMEZONES || { "US_ET": "America/New_York", "UK": "Europe/London" };

// Optimal posting times (hours in local timezone)
const optimalTimes = {
  US_ET: [9, 12, 15, 18], // 9 AM, 12 PM, 3 PM, 6 PM EST
  UK: [8, 13, 17, 20]     // 8 AM, 1 PM, 5 PM, 8 PM GMT
};

// Generate 7-day schedule
function generateSchedule() {
  const schedule = {
    generated: new Date().toISOString(),
    period: "7_days",
    maxPostsPerDay: maxPostsPerDay,
    timezones: timezones,
    optimalTimes: optimalTimes,
    dailySchedules: {}
  };
  
  let dealIndex = 0;
  
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + day);
    const dateKey = currentDate.toISOString().slice(0, 10);
    
    const usDeals = enrichedDeals.filter(d => d.region === 'US');
    const ukDeals = enrichedDeals.filter(d => d.region === 'UK');
    
    schedule.dailySchedules[dateKey] = {
      date: dateKey,
      dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      posts: []
    };
    
    // Schedule US posts
    const usPostsToday = Math.min(3, Math.ceil(maxPostsPerDay * 0.7)); // 70% US
    for (let post = 0; post < usPostsToday && dealIndex < usDeals.length; post++) {
      const deal = usDeals[dealIndex % usDeals.length];
      const timeSlot = optimalTimes.US_ET[post % optimalTimes.US_ET.length];
      
      const postTime = new Date(currentDate);
      postTime.setHours(timeSlot, Math.floor(Math.random() * 60), 0, 0);
      
      schedule.dailySchedules[dateKey].posts.push({
        id: `${dateKey}_us_${post + 1}`,
        dealId: deal.id,
        region: 'US',
        timezone: 'America/New_York',
        scheduledTime: postTime.toISOString(),
        localTime: postTime.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        source: deal.source,
        title: deal.title.substring(0, 60) + '...',
        targetUrl: deal.affiliateUrl,
        mediaPath: `./media/${deal.id}.png`
      });
      
      dealIndex++;
    }
    
    // Schedule UK posts
    const ukPostsToday = Math.min(2, Math.ceil(maxPostsPerDay * 0.3)); // 30% UK
    for (let post = 0; post < ukPostsToday && dealIndex < enrichedDeals.length; post++) {
      const ukDealIndex = dealIndex % ukDeals.length;
      const deal = ukDeals[ukDealIndex];
      const timeSlot = optimalTimes.UK[post % optimalTimes.UK.length];
      
      const postTime = new Date(currentDate);
      postTime.setHours(timeSlot, Math.floor(Math.random() * 60), 0, 0);
      
      schedule.dailySchedules[dateKey].posts.push({
        id: `${dateKey}_uk_${post + 1}`,
        dealId: deal.id,
        region: 'UK',
        timezone: 'Europe/London',
        scheduledTime: postTime.toISOString(),
        localTime: postTime.toLocaleString('en-GB', { timeZone: 'Europe/London' }),
        source: deal.source,
        title: deal.title.substring(0, 60) + '...',
        targetUrl: deal.affiliateUrl,
        mediaPath: `./media/${deal.id}.png`
      });
      
      dealIndex++;
    }
    
    // Sort posts by time
    schedule.dailySchedules[dateKey].posts.sort((a, b) => 
      new Date(a.scheduledTime) - new Date(b.scheduledTime)
    );
    
    schedule.dailySchedules[dateKey].totalPosts = schedule.dailySchedules[dateKey].posts.length;
  }
  
  return schedule;
}

// Generate schedule
const schedule = generateSchedule();

// Save schedule
const scheduleFile = path.join(env.CONFIG_DIR, `posting-schedule-${dateStr}.json`);
fs.writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));

console.log(`\n📅 7-Day Posting Schedule Generated`);
console.log(`📁 Saved to: ${scheduleFile}`);

// Display summary
console.log('\n=== SCHEDULE SUMMARY ===');
let totalPosts = 0;
Object.entries(schedule.dailySchedules).forEach(([date, daySchedule]) => {
  const usCount = daySchedule.posts.filter(p => p.region === 'US').length;
  const ukCount = daySchedule.posts.filter(p => p.region === 'UK').length;
  totalPosts += daySchedule.totalPosts;
  
  console.log(`${daySchedule.dayOfWeek} (${date}): ${daySchedule.totalPosts} posts (${usCount} US, ${ukCount} UK)`);
  
  daySchedule.posts.forEach(post => {
    console.log(`  • ${post.localTime} - ${post.source} (${post.region}): ${post.title}`);
  });
});

console.log(`\n📊 Total posts scheduled: ${totalPosts} over 7 days`);
console.log(`📈 Average: ${(totalPosts / 7).toFixed(1)} posts/day`);

console.log(`\n✅ Schedule generation complete`);