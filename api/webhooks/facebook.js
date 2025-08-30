const crypto = require("crypto");

module.exports = (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  
  // Environment check logging (dev only)
  if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() !== 'production') {
    console.log('Environment check:', {
      hasVerifyToken: !!VERIFY_TOKEN,
      hasAppSecret: !!APP_SECRET,
      method: req.method
    });
  }

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    
    // Trim whitespace from environment variable
    const expectedToken = VERIFY_TOKEN ? VERIFY_TOKEN.trim() : '';
    const receivedToken = token ? token.trim() : '';
    
    // Debug logging for verification (dev only)
    if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() !== 'production') {
      console.log('Verification attempt:', {
        mode,
        receivedToken,
        expectedToken,
        tokenMatch: receivedToken === expectedToken,
        challenge
      });
    }
    
    if (mode === "subscribe" && receivedToken === expectedToken) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() !== 'production') {
        console.log('Verification successful!');
      }
      return res.status(200).send(challenge);
    }
    
    if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() !== 'production') {
      console.log('Verification failed - sending 403');
    }
    return res.status(403).json({
      error: "Verification failed",
      mode,
      receivedToken,
      expectedToken,
      challenge
    });
  }

  if (req.method === "POST") {
    // Verify signature nếu có
    const sig = req.headers["x-hub-signature-256"];
    if (APP_SECRET && sig) {
      const expectedSig = "sha256=" +
        crypto.createHmac("sha256", APP_SECRET)
              .update(req.rawBody || JSON.stringify(req.body))
              .digest("hex");
      if (sig !== expectedSig) {
        return res.status(403).send("Invalid signature");
      }
    }
    console.log("Webhook event received:", req.body);
    return res.status(200).end();
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end("Method Not Allowed");
};