# Railway Deployment Guide

## Status: ⏳ READY FOR DEPLOYMENT

Railway CLI installation encountered network timeout issues. This guide provides **manual deployment steps** for the user to complete.

---

## Prerequisites

### 1. Install Railway CLI

Choose one method:

#### Option A: npm (Recommended)
```bash
npm install -g @railway/cli
```

#### Option B: Homebrew (macOS)
```bash
brew install railway
```

#### Option C: Shell Script
```bash
sh <(curl -fsSL cli.new)
```

#### Verify Installation
```bash
railway --version
# Should show: Railway CLI v4.x.x
```

---

## Deployment Steps

### Step 1: Login to Railway

```bash
cd external-api
railway login
```

This will open a browser window for authentication. Log in with your Railway account (or create one at https://railway.app/).

---

### Step 2: Initialize Railway Project

```bash
railway init
```

When prompted:
- **Create new project or link existing?** → Create new project
- **Project name:** `deal-aggregator-api` (or your preferred name)
- **Environment:** production

---

### Step 3: Set Environment Variables

You need to configure the following environment variables in Railway:

#### Required Variables:

```bash
# Database Connection (from main project .env)
railway variables set DATABASE_URL="postgresql://..."

# Alternative: Database Pooler URL (if available)
railway variables set DATABASE_URL_POOLER="postgresql://..."

# Supabase Configuration (from main project .env)
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set SUPABASE_ANON_KEY="your-anon-key"

# Node Environment
railway variables set NODE_ENV="production"
```

#### Copy from Main Project:

To get the actual values:

```bash
# From project root
cd ..
cat .env | grep DATABASE_URL
cat .env | grep SUPABASE
```

Or check your environment files:
- `.env.dealradarus.local`
- `.env.production`
- Vercel environment variables dashboard

#### Verify Variables:

```bash
railway variables
```

You should see all required variables listed.

---

### Step 4: Deploy to Railway

```bash
railway up
```

This command will:
1. Build your Express server
2. Install dependencies (171 packages)
3. Deploy to Railway infrastructure
4. Provide a deployment URL

**Expected output:**
```
✓ Build logs
✓ Deploy logs
✓ Service deployed successfully

Deployment URL: https://deal-aggregator-api-production.up.railway.app
```

**🚨 IMPORTANT:** Save this deployment URL! You'll need it for frontend integration.

---

### Step 5: Get Deployment Information

```bash
railway status
```

This shows:
- Service status
- Deployment URL
- Build/deploy times
- Resource usage

**Copy the URL and save it to:**
1. This file (RAILWAY_DEPLOYMENT.md)
2. PROJECT_WORKLOG_SESSION_JOURNAL.md
3. .env.production (as NEXT_PUBLIC_API_URL)

---

### Step 6: Test Deployed Endpoints

Replace `<RAILWAY_URL>` with your actual deployment URL:

```bash
RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"

# Test 1: Simple Test Endpoint
curl -s $RAILWAY_URL/api/simple-test | jq

# Expected: {"endpoint":"/api/simple-test","message":"This should be simple-test response..."}

# Test 2: Posts Endpoint
curl -s $RAILWAY_URL/api/posts | jq '.posts | length'

# Expected: 5

# Test 3: Health Check
curl -s $RAILWAY_URL/api/health | jq '.status'

# Expected: "healthy" or "degraded" (degraded is OK if DB not fully configured)

# Test 4: Deals Endpoint
curl -s $RAILWAY_URL/api/deals | jq '.meta.total'

# Expected: 9 (static fallback data)

# Test 5: Analytics (POST)
curl -s -X POST $RAILWAY_URL/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","events":[{"type":"test_event","data":{"source":"deployment_test"}}]}' | jq

# Expected: {"message":"Events processed successfully",...}
```

---

### Step 7: Monitor Deployment

#### View Logs:
```bash
railway logs
```

#### View Metrics:
```bash
railway status --service
```

#### Open Railway Dashboard:
```bash
railway open
```

This opens the Railway web dashboard where you can monitor:
- Deployment history
- Resource usage (CPU, memory, network)
- Logs and metrics
- Environment variables
- Service settings

---

## Troubleshooting

### Issue 1: Build Failed

**Symptom:** Deployment fails during build phase

**Solution:**
```bash
# Check logs
railway logs --build

# Common fixes:
# 1. Ensure package.json is correct
# 2. Ensure all dependencies are listed
# 3. Check Node.js version compatibility
```

### Issue 2: Service Crashes on Start

**Symptom:** Service starts but immediately crashes

**Solution:**
```bash
# Check runtime logs
railway logs --runtime

# Common causes:
# 1. Missing environment variables
# 2. Database connection errors
# 3. Port binding issues

# Verify environment variables
railway variables
```

### Issue 3: Database Connection Errors

**Symptom:** Endpoints return 500 errors, logs show database connection failures

**Solution:**
```bash
# 1. Verify DATABASE_URL is set correctly
railway variables | grep DATABASE

# 2. Check if database allows Railway's IP addresses
# Railway uses dynamic IPs, ensure your database (Neon/Supabase) allows all connections
# or whitelist Railway's IP range

# 3. Test database connection
railway run -- node -e "const db = require('./lib/db'); db.testConnection();"
```

### Issue 4: CORS Errors

**Symptom:** Frontend requests fail with CORS errors

**Solution:**

Check `server.js` CORS configuration includes your domain:

```javascript
app.use(cors({
  origin: [
    'https://dealradarus.com',
    'https://www.dealradarus.com',
    'https://*.vercel.app',  // Your Vercel domains
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

If you need to add more domains, update `server.js` and redeploy:

```bash
railway up
```

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Save Railway deployment URL
- [ ] Test all 9 endpoints with curl
- [ ] Verify health check shows "healthy" or "degraded" status
- [ ] Update PROJECT_WORKLOG_SESSION_JOURNAL.md with deployment details
- [ ] Update .env.production with NEXT_PUBLIC_API_URL
- [ ] Document deployment timestamp and commit hash
- [ ] Test from local frontend (Phase 4)
- [ ] Update docs/VERCEL-SUPPORT-TICKET.md with workaround results

---

## Railway Deployment URL

**📝 Update this section after deployment:**

```
Deployment URL: [PENDING - Update after railway up]
Deployment Date: [PENDING]
Deployment Commit: 14bf97a (Phase 2 COMPLETE)
```

---

## Next Steps

After Railway deployment is complete and tested:

1. **Phase 4:** Frontend Integration
   - Add NEXT_PUBLIC_API_URL to .env.production
   - Create lib/apiClient.js
   - Update frontend API calls

2. **Phase 5:** Testing
   - Run automated tests
   - Verify all endpoints via Vercel frontend
   - Update documentation

3. **Phase 6:** Staging Deployment
   - Deploy frontend to staging
   - Run smoke tests
   - Verify end-to-end functionality

---

## Support Resources

- **Railway Documentation:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app/

---

**Created:** September 30, 2025
**Status:** Ready for User Deployment
**Next:** User to complete Steps 1-7 above