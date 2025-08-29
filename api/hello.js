module.exports = (req, res) => {
  const hasWebhookToken = !!process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  const hasAppSecret = !!process.env.FACEBOOK_APP_SECRET;
  
  res.status(200).json({ 
    ok: true, 
    message: 'API route hoạt động',
    env: { hasWebhookToken, hasAppSecret }
  });
};