/**
 * Welcome Email Template (sent after email verification)
 */

function generateWelcomeEmail(user) {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
  const settingsUrl = `${process.env.FRONTEND_URL}/settings`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DealRadarUS - You're All Set!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .button-secondary { background: #6c757d; }
    .button:hover { opacity: 0.9; }
    .feature-grid { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
    .feature { flex: 1; min-width: 250px; background: #f8f9fa; padding: 20px; border-radius: 5px; }
    .feature h3 { color: #28a745; margin-top: 0; }
    .tips { background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    @media (max-width: 600px) { .feature-grid { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to DealRadarUS!</h1>
    </div>
    
    <div class="content">
      <h2>You're All Set Up!</h2>
      
      <p>Hi ${user.first_name || 'there'},</p>
      
      <p>🎊 Congratulations! Your email has been verified and your DealRadarUS account is now fully active.</p>
      
      <p>You're now part of a community of smart deal hunters who never miss out on the best Facebook Marketplace finds!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" class="button">🚀 Go to Your Dashboard</a>
        <a href="${settingsUrl}" class="button button-secondary">⚙️ Customize Settings</a>
      </div>
      
      <div class="feature-grid">
        <div class="feature">
          <h3>🔍 Smart Deal Alerts</h3>
          <p>Set up personalized alerts for items you're looking for. We'll notify you the moment they appear!</p>
        </div>
        
        <div class="feature">  
          <h3>💾 Save Favorites</h3>
          <p>Found something interesting? Save it to your favorites and track price changes over time.</p>
        </div>
        
        <div class="feature">
          <h3>📊 Deal Analytics</h3>
          <p>Get insights on market prices, deal frequency, and the best times to buy.</p>
        </div>
        
        <div class="feature">
          <h3>🚀 Early Access</h3>
          <p>Be the first to know about hot deals before they go viral and sell out.</p>
        </div>
      </div>
      
      <div class="tips">
        <h3>💡 Pro Tips to Get Started:</h3>
        <ol>
          <li><strong>Set Your Preferences:</strong> Tell us what you're interested in for better recommendations</li>
          <li><strong>Enable Notifications:</strong> Don't miss out on time-sensitive deals</li>
          <li><strong>Explore Categories:</strong> Check out deals in Electronics, Furniture, Cars, and more</li>
          <li><strong>Follow Deal Trends:</strong> See what's popular and trending in your area</li>
        </ol>
      </div>
      
      <h3>🎯 What's Next?</h3>
      <ul>
        <li>Complete your profile to get personalized recommendations</li>
        <li>Set up your first deal alert</li>
        <li>Browse today's hottest deals</li>
        <li>Connect with other deal hunters in your area</li>
      </ul>
      
      <p>Have questions or need help getting started? Just reply to this email - we're here to help!</p>
      
      <p>Happy deal hunting! 🎯</p>
      
      <p>The DealRadarUS Team</p>
      
      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      
      <p><small>P.S. Follow us on social media for daily deal highlights and exclusive offers!</small></p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>Welcome email sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Welcome to DealRadarUS - You're All Set!

Hi ${user.first_name || 'there'},

🎊 Congratulations! Your email has been verified and your DealRadarUS account is now fully active.

You're now part of a community of smart deal hunters who never miss out on the best Facebook Marketplace finds!

WHAT YOU CAN DO NOW:
🔍 Smart Deal Alerts - Set up personalized alerts for items you're looking for
💾 Save Favorites - Save deals and track price changes over time  
📊 Deal Analytics - Get insights on market prices and deal frequency
🚀 Early Access - Be first to know about hot deals before they sell out

PRO TIPS TO GET STARTED:
1. Set Your Preferences: Tell us what you're interested in for better recommendations
2. Enable Notifications: Don't miss out on time-sensitive deals
3. Explore Categories: Check out deals in Electronics, Furniture, Cars, and more
4. Follow Deal Trends: See what's popular and trending in your area

WHAT'S NEXT?
- Complete your profile to get personalized recommendations
- Set up your first deal alert
- Browse today's hottest deals  
- Connect with other deal hunters in your area

Visit your dashboard: ${dashboardUrl}
Customize settings: ${settingsUrl}

Have questions or need help getting started? Just reply to this email - we're here to help!

Happy deal hunting! 🎯

The DealRadarUS Team

P.S. Follow us on social media for daily deal highlights and exclusive offers!

---
Welcome email sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: '🎉 Welcome to DealRadarUS - Your Account is Ready!',
    html,
    text
  };
}

module.exports = { generateWelcomeEmail };