/**
 * UGC Moderation Email Templates
 * For reviews, comments, reports, and moderation actions
 */

function generateNewContentAlert(admin, contentType, content) {
  const dashboardUrl = `${process.env.FRONTEND_URL}/admin/moderation`;
  const contentUrl = `${process.env.FRONTEND_URL}/admin/moderation/${contentType}s/${content.id}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${contentType} Posted - Moderation Review</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .button-primary { background: #007bff; color: white; }
    .button:hover { opacity: 0.9; }
    .content-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
    .metadata { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; font-size: 14px; }
    .rating { color: #ffc107; font-size: 18px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Posted</h1>
    </div>
    
    <div class="content">
      <h2>Moderation Review Required</h2>
      
      <p>Hi ${admin.first_name},</p>
      
      <p>A new ${contentType} has been posted and requires your review.</p>
      
      <div class="content-box">
        ${contentType === 'review' ? `
        <h3>${content.title}</h3>
        <div class="rating">${'★'.repeat(content.rating)}${'☆'.repeat(5 - content.rating)} (${content.rating}/5)</div>
        ` : ''}
        <p><strong>Content:</strong></p>
        <p>${content.content}</p>
      </div>
      
      <div class="metadata">
        <strong>Details:</strong><br>
        • User: ${content.user?.first_name} ${content.user?.last_name} (${content.user?.email})<br>
        • ${contentType === 'review' ? `Deal ID: ${content.deal_id}` : contentType === 'comment' ? `Target: ${content.deal_id ? `Deal ${content.deal_id}` : `Review ${content.review_id}`}` : ''}<br>
        • Posted: ${new Date(content.created_at).toLocaleString()}<br>
        • Content ID: ${content.id}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${contentUrl}" class="button button-primary">📝 Review Content</a>
        <a href="${dashboardUrl}" class="button">🔧 Moderation Dashboard</a>
      </div>
      
      <p><small>This is an automated notification for content moderation. You can adjust your notification preferences in the admin settings.</small></p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Content Moderation System</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
New ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Posted - Moderation Review Required

Hi ${admin.first_name},

A new ${contentType} has been posted and requires your review.

${contentType === 'review' ? `TITLE: ${content.title}\nRATING: ${content.rating}/5 stars\n` : ''}
CONTENT:
${content.content}

DETAILS:
• User: ${content.user?.first_name} ${content.user?.last_name} (${content.user?.email})
• ${contentType === 'review' ? `Deal ID: ${content.deal_id}` : contentType === 'comment' ? `Target: ${content.deal_id ? `Deal ${content.deal_id}` : `Review ${content.review_id}`}` : ''}
• Posted: ${new Date(content.created_at).toLocaleString()}
• Content ID: ${content.id}

ACTIONS:
Review Content: ${contentUrl}
Moderation Dashboard: ${dashboardUrl}

This is an automated notification for content moderation. You can adjust your notification preferences in the admin settings.

---
DealRadarUS - Content Moderation System
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `🔔 New ${contentType} posted - Moderation review required`,
    html,
    text
  };
}

function generateContentReportAlert(admin, report, content) {
  const dashboardUrl = `${process.env.FRONTEND_URL}/admin/moderation`;
  const reportUrl = `${process.env.FRONTEND_URL}/admin/moderation/reports/${report.id}`;
  
  const severityColor = {
    'spam': '#ffc107',
    'harassment': '#dc3545', 
    'inappropriate': '#fd7e14',
    'copyright': '#6f42c1',
    'other': '#6c757d'
  }[report.reason] || '#6c757d';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Reported - Urgent Moderation Required</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .button-secondary { background: #6c757d; }
    .button:hover { opacity: 0.9; }
    .report-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${severityColor}; }
    .content-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7; }
    .metadata { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; font-size: 14px; }
    .priority-high { background: #f8d7da; border-color: #dc3545; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Content Reported</h1>
    </div>
    
    <div class="content">
      <h2>Urgent Moderation Required</h2>
      
      <p>Hi ${admin.first_name},</p>
      
      <p>A ${report.content_type} has been reported by a user and requires immediate attention.</p>
      
      <div class="report-box ${report.reason === 'harassment' ? 'priority-high' : ''}">
        <h3>📋 Report Details</h3>
        <p><strong>Reason:</strong> ${report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Reporter:</strong> ${report.reporter?.first_name} ${report.reporter?.last_name}</p>
        <p><strong>Reported:</strong> ${new Date(report.created_at).toLocaleString()}</p>
      </div>
      
      <div class="content-box">
        <h3>🎯 Reported Content</h3>
        ${report.content_type === 'review' ? `
        <p><strong>Title:</strong> ${content.title}</p>
        <p><strong>Rating:</strong> ${content.rating}/5 stars</p>
        ` : ''}
        <p><strong>Content:</strong></p>
        <p>${content.content}</p>
        <p><strong>Author:</strong> ${content.user?.first_name} ${content.user?.last_name}</p>
      </div>
      
      <div class="metadata">
        <strong>Content Details:</strong><br>
        • Content ID: ${content.id}<br>
        • Content Type: ${report.content_type}<br>
        • Posted: ${new Date(content.created_at).toLocaleString()}<br>
        • ${report.content_type === 'review' ? `Deal ID: ${content.deal_id}` : `Target: ${content.deal_id || content.review_id}`}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reportUrl}" class="button">🚨 Review Report</a>
        <a href="${dashboardUrl}" class="button button-secondary">🔧 Moderation Dashboard</a>
      </div>
      
      <p><strong>Action Required:</strong> Please review this report and take appropriate moderation action within 24 hours.</p>
      
      <p><small>This is a high-priority automated notification. Response time affects user trust and platform safety.</small></p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Content Moderation System</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Content Reported - Urgent Moderation Required

Hi ${admin.first_name},

A ${report.content_type} has been reported by a user and requires immediate attention.

REPORT DETAILS:
• Reason: ${report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}
• Description: ${report.description}
• Reporter: ${report.reporter?.first_name} ${report.reporter?.last_name}
• Reported: ${new Date(report.created_at).toLocaleString()}

REPORTED CONTENT:
${report.content_type === 'review' ? `Title: ${content.title}\nRating: ${content.rating}/5 stars\n` : ''}
Content: ${content.content}
Author: ${content.user?.first_name} ${content.user?.last_name}

CONTENT DETAILS:
• Content ID: ${content.id}
• Content Type: ${report.content_type}
• Posted: ${new Date(content.created_at).toLocaleString()}
• ${report.content_type === 'review' ? `Deal ID: ${content.deal_id}` : `Target: ${content.deal_id || content.review_id}`}

ACTIONS:
Review Report: ${reportUrl}
Moderation Dashboard: ${dashboardUrl}

ACTION REQUIRED: Please review this report and take appropriate moderation action within 24 hours.

This is a high-priority automated notification. Response time affects user trust and platform safety.

---
DealRadarUS - Content Moderation System
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `⚠️ Content reported: ${report.reason} - ${report.content_type} requires moderation`,
    html,
    text
  };
}

function generateModerationActionNotification(user, action, content, reason = null) {
  const supportUrl = `${process.env.FRONTEND_URL}/support`;
  const guidelinesUrl = `${process.env.FRONTEND_URL}/community-guidelines`;
  
  const actionMessages = {
    'approved': {
      title: '✅ Content Approved',
      message: 'Your content has been reviewed and approved.',
      color: '#28a745'
    },
    'removed': {
      title: '🚫 Content Removed',
      message: 'Your content has been removed for violating our community guidelines.',
      color: '#dc3545'
    },
    'warning': {
      title: '⚠️ Content Warning',
      message: 'Your content has been flagged but remains visible with a warning.',
      color: '#ffc107'
    }
  };

  const actionInfo = actionMessages[action] || actionMessages['removed'];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionInfo.title} - DealRadarUS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, ${actionInfo.color} 0%, ${actionInfo.color}dd 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: ${actionInfo.color}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .button-secondary { background: #6c757d; }
    .button:hover { opacity: 0.9; }
    .content-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${actionInfo.color}; }
    .guidelines { background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${actionInfo.title}</h1>
    </div>
    
    <div class="content">
      <p>Hi ${user.first_name},</p>
      
      <p>${actionInfo.message}</p>
      
      <div class="content-box">
        <h3>Your Content</h3>
        ${content.title ? `<p><strong>Title:</strong> ${content.title}</p>` : ''}
        <p><strong>Content:</strong> ${content.content}</p>
        <p><strong>Posted:</strong> ${new Date(content.created_at).toLocaleString()}</p>
      </div>
      
      ${reason ? `
      <div class="guidelines">
        <h3>Reason for Action</h3>
        <p>${reason}</p>
      </div>
      ` : ''}
      
      ${action === 'removed' || action === 'warning' ? `
      <div class="guidelines">
        <h3>📋 Community Guidelines</h3>
        <p>To maintain a positive environment for all users, please review our community guidelines:</p>
        <ul>
          <li>Be respectful and constructive in your reviews and comments</li>
          <li>Provide honest and helpful feedback about deals</li>
          <li>Avoid spam, duplicate content, or promotional material</li>
          <li>Report inappropriate content instead of engaging with it</li>
          <li>Respect other users' privacy and personal information</li>
        </ul>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${guidelinesUrl}" class="button">📋 Community Guidelines</a>
        <a href="${supportUrl}" class="button button-secondary">💬 Contact Support</a>
      </div>
      
      ${action === 'warning' ? `
      <p><strong>What This Means:</strong> Your content remains visible but has been flagged. Future violations may result in content removal or account restrictions.</p>
      ` : action === 'removed' ? `
      <p><strong>What This Means:</strong> Your content has been removed and is no longer visible to other users. Repeated violations may result in account restrictions.</p>
      ` : `
      <p><strong>What This Means:</strong> Your content follows our community guidelines and is visible to all users. Thank you for contributing positively to our community!</p>
      `}
      
      <p>If you believe this action was taken in error, you can <a href="${supportUrl}">contact our support team</a> for review.</p>
      
      <p>Thank you for being part of the DealRadarUS community!</p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Community Moderation</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
${actionInfo.title} - DealRadarUS

Hi ${user.first_name},

${actionInfo.message}

YOUR CONTENT:
${content.title ? `Title: ${content.title}\n` : ''}Content: ${content.content}
Posted: ${new Date(content.created_at).toLocaleString()}

${reason ? `REASON FOR ACTION:\n${reason}\n\n` : ''}

${action === 'removed' || action === 'warning' ? `
COMMUNITY GUIDELINES:
To maintain a positive environment for all users, please review our community guidelines:
• Be respectful and constructive in your reviews and comments
• Provide honest and helpful feedback about deals
• Avoid spam, duplicate content, or promotional material
• Report inappropriate content instead of engaging with it
• Respect other users' privacy and personal information

` : ''}

${action === 'warning' ? `
WHAT THIS MEANS: Your content remains visible but has been flagged. Future violations may result in content removal or account restrictions.
` : action === 'removed' ? `
WHAT THIS MEANS: Your content has been removed and is no longer visible to other users. Repeated violations may result in account restrictions.
` : `
WHAT THIS MEANS: Your content follows our community guidelines and is visible to all users. Thank you for contributing positively to our community!
`}

If you believe this action was taken in error, you can contact our support team for review.

Community Guidelines: ${guidelinesUrl}
Contact Support: ${supportUrl}

Thank you for being part of the DealRadarUS community!

---
DealRadarUS - Community Moderation
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `${actionInfo.title} - DealRadarUS Moderation Update`,
    html,
    text
  };
}

function generateReviewReplyNotification(reviewer, reply, originalReview) {
  const reviewUrl = `${process.env.FRONTEND_URL}/deals/${originalReview.deal_id}#review-${originalReview.id}`;
  const unsubscribeUrl = `${process.env.FRONTEND_URL}/settings/notifications`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone Replied to Your Review - DealRadarUS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .button:hover { opacity: 0.9; }
    .review-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; }
    .reply-box { background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #b3d9ff; }
    .rating { color: #ffc107; font-size: 18px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 Someone Replied to Your Review</h1>
    </div>
    
    <div class="content">
      <p>Hi ${reviewer.first_name},</p>
      
      <p>Great news! ${reply.user?.first_name} ${reply.user?.last_name} has replied to your review. Your insights are helping other deal hunters make better decisions!</p>
      
      <div class="review-box">
        <h3>📝 Your Original Review</h3>
        <h4>${originalReview.title}</h4>
        <div class="rating">${'★'.repeat(originalReview.rating)}${'☆'.repeat(5 - originalReview.rating)} (${originalReview.rating}/5)</div>
        <p>${originalReview.content.substring(0, 200)}${originalReview.content.length > 200 ? '...' : ''}</p>
      </div>
      
      <div class="reply-box">
        <h3>💬 ${reply.user?.first_name}'s Reply</h3>
        <p>${reply.content}</p>
        <p><small>Posted ${new Date(reply.created_at).toLocaleString()}</small></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewUrl}" class="button">👀 View Full Conversation</a>
      </div>
      
      <h3>🎯 Keep the Conversation Going!</h3>
      <p>Your review is sparking great discussions. Consider:</p>
      <ul>
        <li>Replying to ${reply.user?.first_name}'s comment</li>
        <li>Adding more details about your experience</li>
        <li>Sharing photos if you have them</li>
        <li>Helping other users with their questions</li>
      </ul>
      
      <p>Thank you for being an active member of the DealRadarUS community!</p>
      
      <p><small>You can manage your notification preferences <a href="${unsubscribeUrl}">here</a>.</small></p>
    </div>
    
    <div class="footer">
      <p>DealRadarUS - Community Conversations</p>
      <p>© 2025 DealRadarUS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Someone Replied to Your Review - DealRadarUS

Hi ${reviewer.first_name},

Great news! ${reply.user?.first_name} ${reply.user?.last_name} has replied to your review. Your insights are helping other deal hunters make better decisions!

YOUR ORIGINAL REVIEW:
Title: ${originalReview.title}
Rating: ${originalReview.rating}/5 stars
Content: ${originalReview.content.substring(0, 200)}${originalReview.content.length > 200 ? '...' : ''}

${reply.user?.first_name.toUpperCase()}'S REPLY:
${reply.content}
Posted: ${new Date(reply.created_at).toLocaleString()}

View Full Conversation: ${reviewUrl}

KEEP THE CONVERSATION GOING!
Your review is sparking great discussions. Consider:
• Replying to ${reply.user?.first_name}'s comment
• Adding more details about your experience
• Sharing photos if you have them
• Helping other users with their questions

Thank you for being an active member of the DealRadarUS community!

You can manage your notification preferences here: ${unsubscribeUrl}

---
DealRadarUS - Community Conversations
© 2025 DealRadarUS. All rights reserved.
`;

  return {
    subject: `💬 ${reply.user?.first_name} replied to your review - DealRadarUS`,
    html,
    text
  };
}

module.exports = {
  generateNewContentAlert,
  generateContentReportAlert,
  generateModerationActionNotification,
  generateReviewReplyNotification
};