# Production Environment Variables

## Required for Vercel Dashboard

Add these to **Settings → Environment Variables (Production)**:

### Facebook Integration
```bash
FACEBOOK_APP_ID=1427920308500326
FACEBOOK_APP_SECRET=<your_facebook_app_secret>
FACEBOOK_WEBHOOK_VERIFY_TOKEN=<your_custom_secure_token>
```

### API Endpoints Status
✅ **Health Check**: https://api.dealradarus.com/api/hello
✅ **Webhook**: https://api.dealradarus.com/api/webhooks/facebook

## Facebook App Configuration

### Webhook Registration
```bash
curl -i -X POST \
  "https://graph.facebook.com/v20.0/1427920308500326/subscriptions" \
  -d "object=page" \
  -d "callback_url=https://api.dealradarus.com/api/webhooks/facebook" \
  -d "verify_token=<FACEBOOK_WEBHOOK_VERIFY_TOKEN>" \
  -d "fields=feed,messages" \
  -d "access_token=1427920308500326|<FACEBOOK_APP_SECRET>"
```

### Test Commands
```bash
# Health check
curl -s https://api.dealradarus.com/api/hello

# Webhook verification
curl -i "https://api.dealradarus.com/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=TEST123"

# Webhook POST
curl -i -X POST "https://api.dealradarus.com/api/webhooks/facebook" \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[]}'
```

## Security Features
- ✅ HMAC SHA-256 signature verification
- ✅ Custom domain SSL (api.dealradarus.com)
- ✅ Environment variable isolation
- ✅ Request method validation
- ✅ Token verification

## Deployment Status
- **Domain**: api.dealradarus.com → cname.vercel-dns.com ✅
- **SSL**: Valid Vercel certificate ✅
- **API Routes**: Working with proper routing ✅
- **Webhook**: HMAC verification enabled ✅

## Next Steps
1. Set environment variables in Vercel Dashboard
2. Register webhook with Facebook using the curl command above
3. Monitor webhook events in Vercel Function Logs