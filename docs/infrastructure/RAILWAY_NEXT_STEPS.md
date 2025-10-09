# Railway CLI Installed - Next Steps

✅ **Railway CLI v4.10.0 installed successfully!**

---

## Quick Start Guide

Railway CLI is now ready. Follow these steps to complete deployment:

### Step 1: Login to Railway (REQUIRED - Opens Browser)

```bash
cd /Users/admin/projects/deal-aggregator-facebook/external-api
railway login
```

**What happens:**
- Opens browser window for authentication
- Login with your Railway account (or create one at https://railway.app/)
- After successful login, return to terminal

---

### Step 2: Initialize Railway Project

```bash
railway init
```

**Prompts you'll see:**
- "Create new project or link existing?" → **Create new project**
- "Project name:" → Type: **deal-aggregator-api**
- "Environment:" → Select: **production**

---

### Step 3: Set Environment Variables

You need DATABASE_URL and SUPABASE credentials from main project.

#### Get values from main project:

```bash
# From project root
cd /Users/admin/projects/deal-aggregator-facebook
cat .env | grep DATABASE_URL
cat .env | grep SUPABASE
```

Or check:
- `.env.dealradarus.local`
- Vercel dashboard → Project Settings → Environment Variables
- Neon dashboard → Connection Details
- Supabase dashboard → Settings → API

#### Set variables in Railway:

```bash
cd external-api

# Database (use actual value from your .env)
railway variables set DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Or if you have pooler URL (recommended)
railway variables set DATABASE_URL_POOLER="postgresql://..."

# Supabase
railway variables set SUPABASE_URL="https://your-project-id.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Production mode
railway variables set NODE_ENV="production"
```

#### Verify variables:

```bash
railway variables
```

You should see all 4 variables listed.

---

### Step 4: Deploy to Railway

```bash
railway up
```

**This will:**
1. Upload your code
2. Install dependencies (171 packages)
3. Build the Express server
4. Deploy to Railway infrastructure
5. Provide deployment URL

**Expected output:**
```
✓ Building...
✓ Deploying...
✓ Deployed successfully!

Service URL: https://deal-aggregator-api-production.up.railway.app
```

**🚨 SAVE THIS URL!** You'll need it for frontend integration.

---

### Step 5: Test Deployed Endpoints

Replace `<YOUR_RAILWAY_URL>` with the actual URL from Step 4:

```bash
# Set your Railway URL
RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"

# Test 1: Simple Test
curl -s $RAILWAY_URL/api/simple-test | jq

# Expected: {"endpoint":"/api/simple-test","message":"This should be simple-test response, not blog posts",...}

# Test 2: Posts Endpoint
curl -s $RAILWAY_URL/api/posts | jq '.posts | length'

# Expected: 5

# Test 3: Health Check
curl -s $RAILWAY_URL/api/health | jq

# Expected: {"status":"healthy" or "degraded", "checks":[...]}

# Test 4: Deals
curl -s $RAILWAY_URL/api/deals | jq '.meta'

# Expected: {"total":9,"source":"static" or "database",...}

# Test 5: Analytics (POST)
curl -s -X POST $RAILWAY_URL/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","events":[{"type":"deployment_test","data":{"source":"railway_verification"}}]}' | jq

# Expected: {"message":"Events processed successfully","count":1,...}
```

---

### Step 6: Update Documentation

After successful deployment and testing:

#### A. Update RAILWAY_DEPLOYMENT.md:

```bash
# Edit external-api/RAILWAY_DEPLOYMENT.md
# Replace line: "Deployment URL: [PENDING]"
# With: "Deployment URL: https://your-actual-railway-url.up.railway.app"
# Add: "Deployment Date: September 30, 2025"
```

#### B. Update PROJECT_WORKLOG_SESSION_JOURNAL.md:

Add to Phase 3 section:
```
✅ Railway Deployment Complete:
- URL: https://your-railway-url.up.railway.app
- Deployment Date: [timestamp]
- All 9 endpoints tested and verified
```

---

### Step 7: Configure Frontend to Use External API

```bash
cd /Users/admin/projects/deal-aggregator-facebook

# Add to .env.production
echo 'NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app' >> .env.production

# Add to .env.dealradarus.local (for local testing)
echo 'NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app' >> .env.dealradarus.local
```

⚠️ **Do NOT commit these .env changes!** They contain the Railway URL which should be kept in environment variables only.

---

### Step 8: Test Frontend Locally

```bash
# Build and start
npm run build
npm run start

# In browser, go to:
# http://localhost:3000

# Check that pages load correctly
# API calls should now go to Railway instead of broken Vercel routes
```

---

## Troubleshooting

### Issue: "railway: command not found"

**Solution:**
```bash
# Add Railway to PATH
export PATH="$HOME/.railway/bin:$PATH"

# Or restart terminal
```

### Issue: Build fails on Railway

**Solution:**
```bash
# Check logs
railway logs

# Common fixes:
# 1. Ensure package.json has correct start script
# 2. Verify all dependencies are listed
# 3. Check Node version compatibility
```

### Issue: Database connection errors

**Solution:**
```bash
# Verify DATABASE_URL is correct
railway variables | grep DATABASE

# Test locally first
cd external-api
npm run dev
curl http://localhost:3001/api/health
```

### Issue: CORS errors from frontend

**Solution:**

Check `external-api/server.js` CORS config includes your domains:
```javascript
origin: [
  'https://dealradarus.com',
  'https://www.dealradarus.com',
  'https://*.vercel.app',
  // Add your specific Vercel URLs if needed
]
```

---

## Railway Dashboard

View your deployment:
```bash
railway open
```

This opens Railway dashboard where you can:
- View logs
- Monitor resource usage
- Manage environment variables
- View deployment history
- Configure domains

---

## After Deployment Success

Once Railway is deployed and tested:

### ✅ Phase 3 Complete Checklist:
- [x] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Project created (deal-aggregator-api)
- [ ] Environment variables configured
- [ ] Deployed successfully
- [ ] All 9 endpoints tested
- [ ] URL saved and documented

### 🔄 Next: Phase 4 - Frontend Integration
- [ ] NEXT_PUBLIC_API_URL added to .env files
- [ ] Pages refactored to use lib/apiClient.js
- [ ] Local testing verified
- [ ] Committed changes

### 🔄 Then: Phase 5-7
- Phase 5: Automated testing & documentation updates
- Phase 6: Staging deployment
- Phase 7: Monitoring & reporting

---

## Support

If you need help:
- **Railway Docs**: https://docs.railway.com/
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app/

---

## Summary

```bash
# Quick command sequence:
cd /Users/admin/projects/deal-aggregator-facebook/external-api
railway login              # Opens browser
railway init               # Create: deal-aggregator-api
railway variables set ...  # Set DATABASE_URL, SUPABASE_*, NODE_ENV
railway up                 # Deploy!
railway status            # Get URL

# Test
curl https://your-url.railway.app/api/health

# Configure frontend
cd ..
echo 'NEXT_PUBLIC_API_URL=https://your-url' >> .env.production

# Test
npm run build && npm run start
```

---

**Current Status:**
- ✅ Railway CLI installed (v4.10.0)
- ⏳ Waiting for: User to login and deploy
- 📍 You are here: Ready for `railway login`

**Time to Complete:** ~15 minutes

**Created:** September 30, 2025
**Railway CLI Version:** 4.10.0