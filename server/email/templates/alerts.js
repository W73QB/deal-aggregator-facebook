/**
 * Alert Email Templates
 * Templates for instant, daily, and weekly deal alerts
 */

function generateInstantAlert(user, filter, deals) {
  const dealCount = deals.length;
  const frontendUrl = process.env.FRONTEND_URL || 'https://dealradarus.com';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚨 New Deals Found - ${filter.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .deal-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b35; }
    .deal-title { font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #333; }
    .deal-price { font-size: 20px; font-weight: bold; color: #ff6b35; margin: 5px 0; }
    .deal-location { color: #666; font-size: 14px; margin: 5px 0; }
    .deal-button { display: inline-block; background: #ff6b35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .deal-button:hover { background: #e55a2b; }
    .filter-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 New Deals Alert!</h1>
      <p style="margin: 10px 0 0 0;">Found ${dealCount} new deal${dealCount !== 1 ? 's' : ''} matching your filter</p>
    </div>
    
    <div class="content">
      <h2>Hi ${user.first_name || 'there'},</h2>
      
      <p>Great news! We found <strong>${dealCount} new deal${dealCount !== 1 ? 's' : ''}</strong> matching your <strong>"${filter.name}"</strong> filter.</p>
      
      <div class="filter-info">
        <strong>🔍 Filter: ${filter.name}</strong><br>
        ${formatFilterCriteria(filter.criteria)}
      </div>

      ${deals.map(deal => `
        <div class="deal-card">
          <div class="deal-title">${deal.title}</div>
          <div class="deal-price">$${deal.price}</div>
          <div class="deal-location">📍 ${deal.location}</div>
          <p>${deal.description.substring(0, 150)}${deal.description.length > 150 ? '...' : ''}</p>
          <a href="${deal.url}" class="deal-button">View Deal</a>
        </div>
      `).join('')}
      
      <p>💡 <strong>Pro Tip:</strong> Popular deals sell fast! Check them out soon to avoid missing out.</p>
      
      <p style="text-align: center;">
        <a href="${frontendUrl}/filters" style="color: #ff6b35;">Manage Your Filters</a> | 
        <a href="${frontendUrl}/alerts" style="color: #ff6b35;">Manage Your Alerts</a>
      </p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>This instant alert was sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
🚨 New Deals Alert - ${filter.name}

Hi ${user.first_name || 'there'},

Great news! We found ${dealCount} new deal${dealCount !== 1 ? 's' : ''} matching your "${filter.name}" filter.

DEALS FOUND:
${deals.map(deal => `
• ${deal.title}
  Price: $${deal.price}
  Location: ${deal.location}
  Link: ${deal.url}
`).join('\n')}

💡 Pro Tip: Popular deals sell fast! Check them out soon to avoid missing out.

Manage your filters: ${frontendUrl}/filters
Manage your alerts: ${frontendUrl}/alerts

---
This instant alert was sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `🚨 ${dealCount} New Deal${dealCount !== 1 ? 's' : ''} Found - ${filter.name}`,
    html,
    text
  };
}

function generateDailyAlert(user, filter, deals) {
  const dealCount = deals.length;
  const frontendUrl = process.env.FRONTEND_URL || 'https://dealradarus.com';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📅 Daily Deal Summary - ${filter.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .deal-card { background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
    .deal-title { font-size: 16px; font-weight: bold; margin: 0 0 8px 0; color: #333; }
    .deal-price { font-size: 18px; font-weight: bold; color: #4CAF50; margin: 5px 0; }
    .deal-location { color: #666; font-size: 13px; margin: 5px 0; }
    .deal-button { display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; }
    .deal-button:hover { background: #45a049; }
    .stats-box { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Daily Deal Summary</h1>
      <p style="margin: 10px 0 0 0;">${today}</p>
    </div>
    
    <div class="content">
      <h2>Hi ${user.first_name || 'there'},</h2>
      
      <div class="stats-box">
        <h3 style="margin: 0 0 10px 0; color: #4CAF50;">Today's Results for "${filter.name}"</h3>
        <div style="font-size: 32px; font-weight: bold; color: #4CAF50;">${dealCount}</div>
        <div style="color: #666;">New Deal${dealCount !== 1 ? 's' : ''} Found</div>
      </div>

      ${dealCount > 0 ? `
        <p>Here are the best deals we found for you today:</p>
        
        ${deals.slice(0, 5).map((deal, index) => `
          <div class="deal-card">
            <div class="deal-title">${deal.title}</div>
            <div class="deal-price">$${deal.price}</div>
            <div class="deal-location">📍 ${deal.location}</div>
            <p style="margin: 8px 0; color: #666; font-size: 14px;">${deal.description.substring(0, 120)}${deal.description.length > 120 ? '...' : ''}</p>
            <a href="${deal.url}" class="deal-button">View Deal</a>
          </div>
        `).join('')}
        
        ${dealCount > 5 ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${frontendUrl}/deals?filter=${filter.name}" style="color: #4CAF50; font-weight: bold;">
              View All ${dealCount} Deals →
            </a>
          </div>
        ` : ''}
      ` : `
        <p>No new deals matched your filter today, but don't worry! We'll keep looking and notify you as soon as something great appears.</p>
        
        <p>💡 <strong>Tip:</strong> Try adjusting your filter criteria to find more opportunities.</p>
      `}
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/filters" style="color: #4CAF50;">Manage Filters</a> | 
        <a href="${frontendUrl}/alerts" style="color: #4CAF50;">Manage Alerts</a>
      </p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>Daily summary sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
📅 Daily Deal Summary - ${today}

Hi ${user.first_name || 'there'},

TODAY'S RESULTS FOR "${filter.name}":
${dealCount} New Deal${dealCount !== 1 ? 's' : ''} Found

${dealCount > 0 ? `
DEALS FOUND TODAY:
${deals.slice(0, 5).map((deal, index) => `
${index + 1}. ${deal.title}
   Price: $${deal.price}
   Location: ${deal.location}
   Link: ${deal.url}
`).join('\n')}

${dealCount > 5 ? `View all ${dealCount} deals: ${frontendUrl}/deals?filter=${filter.name}` : ''}
` : `
No new deals matched your filter today, but don't worry! We'll keep looking and notify you as soon as something great appears.

💡 Tip: Try adjusting your filter criteria to find more opportunities.
`}

Manage your filters: ${frontendUrl}/filters
Manage your alerts: ${frontendUrl}/alerts

---
Daily summary sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `📅 Daily Summary: ${dealCount} Deal${dealCount !== 1 ? 's' : ''} - ${filter.name}`,
    html,
    text
  };
}

function generateWeeklyAlert(user, filter, deals) {
  const dealCount = deals.length;
  const frontendUrl = process.env.FRONTEND_URL || 'https://dealradarus.com';
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📊 Weekly Deal Report - ${filter.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6c5ce7 0%, #5a4fcf 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .deal-card { background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #6c5ce7; }
    .deal-title { font-size: 16px; font-weight: bold; margin: 0 0 8px 0; color: #333; }
    .deal-price { font-size: 18px; font-weight: bold; color: #6c5ce7; margin: 5px 0; }
    .deal-location { color: #666; font-size: 13px; margin: 5px 0; }
    .deal-button { display: inline-block; background: #6c5ce7; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; }
    .deal-button:hover { background: #5a4fcf; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .stat-box { background: #f0f0ff; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #6c5ce7; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly Deal Report</h1>
      <p style="margin: 10px 0 0 0;">${weekRange}</p>
    </div>
    
    <div class="content">
      <h2>Hi ${user.first_name || 'there'},</h2>
      
      <p>Here's your weekly summary for the <strong>"${filter.name}"</strong> filter:</p>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-number">${dealCount}</div>
          <div>Total Deals</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${deals.length > 0 ? Math.min(...deals.map(d => d.price)) : 0}</div>
          <div>Lowest Price</div>
        </div>
      </div>

      ${dealCount > 0 ? `
        <h3>🏆 Top Deals This Week</h3>
        
        ${deals.slice(0, 3).map((deal, index) => `
          <div class="deal-card">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="background: #6c5ce7; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px;">
                ${index + 1}
              </span>
              <div class="deal-title" style="margin: 0;">${deal.title}</div>
            </div>
            <div class="deal-price">$${deal.price}</div>
            <div class="deal-location">📍 ${deal.location}</div>
            <p style="margin: 8px 0; color: #666; font-size: 14px;">${deal.description.substring(0, 100)}${deal.description.length > 100 ? '...' : ''}</p>
            <a href="${deal.url}" class="deal-button">View Deal</a>
          </div>
        `).join('')}
        
        ${dealCount > 3 ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${frontendUrl}/deals?filter=${filter.name}&week=current" style="color: #6c5ce7; font-weight: bold;">
              View All ${dealCount} Weekly Deals →
            </a>
          </div>
        ` : ''}
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #4CAF50;">💡 Weekly Insights</h4>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            <li>Best day for deals: ${getBestDayForDeals()}</li>
            <li>Average price: $${Math.round(deals.reduce((sum, d) => sum + d.price, 0) / deals.length)}</li>
            <li>Most active location: ${getMostActiveLocation(deals)}</li>
          </ul>
        </div>
      ` : `
        <div style="text-align: center; padding: 40px 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #666;">No Deals This Week</h3>
          <p>Don't worry! Market activity varies. We'll keep monitoring and alert you when great deals appear.</p>
          <p>💡 <strong>Suggestion:</strong> Try broadening your filter criteria or adding more keywords.</p>
        </div>
      `}
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/filters" style="color: #6c5ce7;">Manage Filters</a> | 
        <a href="${frontendUrl}/alerts" style="color: #6c5ce7;">Manage Alerts</a> | 
        <a href="${frontendUrl}/insights" style="color: #6c5ce7;">View Insights</a>
      </p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>Weekly report sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
📊 Weekly Deal Report - ${weekRange}

Hi ${user.first_name || 'there'},

WEEKLY SUMMARY FOR "${filter.name}":
• Total Deals: ${dealCount}
• Lowest Price: $${deals.length > 0 ? Math.min(...deals.map(d => d.price)) : 0}

${dealCount > 0 ? `
TOP DEALS THIS WEEK:
${deals.slice(0, 3).map((deal, index) => `
${index + 1}. ${deal.title}
   Price: $${deal.price}
   Location: ${deal.location}
   Link: ${deal.url}
`).join('\n')}

WEEKLY INSIGHTS:
• Best day for deals: ${getBestDayForDeals()}
• Average price: $${Math.round(deals.reduce((sum, d) => sum + d.price, 0) / deals.length)}
• Most active location: ${getMostActiveLocation(deals)}

${dealCount > 3 ? `View all ${dealCount} deals: ${frontendUrl}/deals?filter=${filter.name}&week=current` : ''}
` : `
NO DEALS THIS WEEK

Don't worry! Market activity varies. We'll keep monitoring and alert you when great deals appear.

💡 Suggestion: Try broadening your filter criteria or adding more keywords.
`}

Manage your filters: ${frontendUrl}/filters
Manage your alerts: ${frontendUrl}/alerts

---
Weekly report sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `📊 Weekly Report: ${dealCount} Deal${dealCount !== 1 ? 's' : ''} - ${filter.name}`,
    html,
    text
  };
}

// Helper functions
function formatFilterCriteria(criteria) {
  const parts = [];
  
  if (criteria.category) parts.push(`Category: ${criteria.category}`);
  if (criteria.price_min || criteria.price_max) {
    const priceRange = `$${criteria.price_min || '0'} - $${criteria.price_max || '∞'}`;
    parts.push(`Price: ${priceRange}`);
  }
  if (criteria.location) parts.push(`Location: ${criteria.location}`);
  if (criteria.keywords) parts.push(`Keywords: ${criteria.keywords.join(', ')}`);
  
  return parts.join(' • ');
}

function getBestDayForDeals() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[Math.floor(Math.random() * days.length)]; // Mock implementation
}

function getMostActiveLocation(deals) {
  if (deals.length === 0) return 'N/A';
  
  const locations = deals.map(d => d.location);
  const locationCounts = {};
  locations.forEach(loc => {
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  
  return Object.keys(locationCounts).reduce((a, b) => 
    locationCounts[a] > locationCounts[b] ? a : b
  );
}

module.exports = {
  generateInstantAlert,
  generateDailyAlert,
  generateWeeklyAlert
};