/**
 * Email Verification Template
 */

function generateVerificationEmail(user, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your DealRadarUS Account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #5a6fd8; }
    .token-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to DealRadarUS!</h1>
    </div>
    
    <div class="content">
      <h2>Verify Your Email Address</h2>
      
      <p>Hi${user.first_name ? ` ${user.first_name}` : ''},</p>
      
      <p>Thanks for signing up for DealRadarUS! We're excited to help you discover the best deals on Facebook Marketplace.</p>
      
      <p>To get started, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="button">✅ Verify Email Address</a>
      </div>
      
      <div class="token-info">
        <strong>Important:</strong>
        <ul>
          <li>This verification link will expire in <strong>24 hours</strong></li>
          <li>If you didn't create an account, you can safely ignore this email</li>
          <li>If the button doesn't work, copy and paste this link into your browser:</li>
        </ul>
        <p style="word-break: break-all; font-family: monospace; background: white; padding: 10px; border-radius: 3px;">${verifyUrl}</p>
      </div>
      
      <p>Once verified, you'll be able to:</p>
      <ul>
        <li>🔍 Set up personalized deal alerts</li>
        <li>💾 Save your favorite deals</li>
        <li>📊 Track price changes</li>
        <li>🚀 Get early access to hot deals</li>
      </ul>
      
      <p>Need help? Reply to this email and we'll get back to you quickly.</p>
      
      <p>Best regards,<br>The DealRadarUS Team</p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>This email was sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Welcome to DealRadarUS!

Hi${user.first_name ? ` ${user.first_name}` : ''},

Thanks for signing up for DealRadarUS! To get started, please verify your email address by visiting:

${verifyUrl}

This verification link will expire in 24 hours.

Once verified, you'll be able to:
- Set up personalized deal alerts
- Save your favorite deals  
- Track price changes
- Get early access to hot deals

Need help? Reply to this email and we'll get back to you quickly.

Best regards,
The DealRadarUS Team

---
This email was sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: '🎉 Welcome to DealRadarUS - Please Verify Your Email',
    html,
    text
  };
}

module.exports = { generateVerificationEmail };