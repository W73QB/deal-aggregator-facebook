const crypto = require("crypto");

module.exports = (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
  const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  
  // Debug logging (remove in production)
  console.log('Environment check:', {
    hasVerifyToken: !!VERIFY_TOKEN,
    hasAppSecret: !!APP_SECRET,
    method: req.method
  });

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
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