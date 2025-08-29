/**
 * Password Reset Email Template
 */

function generatePasswordResetEmail(user, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your DealRadarUS Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #ff5252; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
    .security-info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
    </div>
    
    <div class="content">
      <h2>Reset Your Password</h2>
      
      <p>Hi${user.first_name ? ` ${user.first_name}` : ''},</p>
      
      <p>We received a request to reset the password for your DealRadarUS account (${user.email}).</p>
      
      <p>If you made this request, click the button below to reset your password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">🔑 Reset Password</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important Security Information:</strong>
        <ul>
          <li>This password reset link will expire in <strong>1 hour</strong> for security reasons</li>
          <li>You can only use this link once</li>
          <li>If you didn't request this reset, please ignore this email and your password will remain unchanged</li>
        </ul>
      </div>
      
      <div class="security-info">
        <strong>💡 If the button doesn't work:</strong>
        <p>Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-family: monospace; background: white; padding: 10px; border-radius: 3px;">${resetUrl}</p>
      </div>
      
      <div class="warning">
        <strong>🚨 Didn't request this?</strong>
        <p>If you didn't ask to reset your password, someone might be trying to access your account. For your security:</p>
        <ul>
          <li>Don't click the reset link</li>
          <li>Consider changing your password if you think your account may be compromised</li>
          <li>Contact our support team if you have concerns</li>
        </ul>
      </div>
      
      <p>For security questions or support, reply to this email and we'll help you out.</p>
      
      <p>Stay safe,<br>The DealRadarUS Security Team</p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Your Smart Deal Discovery Platform</p>
      <p>This security email was sent to ${user.email}</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Password Reset Request - DealRadarUS

Hi${user.first_name ? ` ${user.first_name}` : ''},

We received a request to reset the password for your DealRadarUS account (${user.email}).

If you made this request, visit this link to reset your password:
${resetUrl}

IMPORTANT SECURITY INFORMATION:
- This password reset link will expire in 1 hour for security reasons
- You can only use this link once  
- If you didn't request this reset, please ignore this email and your password will remain unchanged

DIDN'T REQUEST THIS?
If you didn't ask to reset your password, someone might be trying to access your account. For your security:
- Don't click the reset link
- Consider changing your password if you think your account may be compromised  
- Contact our support team if you have concerns

For security questions or support, reply to this email and we'll help you out.

Stay safe,
The DealRadarUS Security Team

---
This security email was sent to ${user.email}
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: '🔒 Reset Your DealRadarUS Password - Action Required',
    html,
    text
  };
}

module.exports = { generatePasswordResetEmail };