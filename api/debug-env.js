module.exports = (req, res) => {
  const debugInfo = {
    hasVerifyToken: !!process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
    hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
    verifyTokenLength: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN ? process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN.length : 0,
    appSecretLength: process.env.FACEBOOK_APP_SECRET ? process.env.FACEBOOK_APP_SECRET.length : 0,
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform
  };
  
  res.status(200).json(debugInfo);
};