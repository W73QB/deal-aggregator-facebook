# ⚡ Quick Reference Guide

**Fast command reference for deployment automation suite**

---

## 🚀 Complete Deployment (5 Commands)

```bash
# 1. Validate (2 min)
./scripts/preflight-checks.sh

# 2. Deploy staging (20 min)
./scripts/auto-staging-deploy.sh

# 3. Start monitoring (48h background)
./scripts/monitoring-daemon.sh start

# 4. Check status (anytime)
./scripts/monitoring-daemon.sh status

# 5. Production cutover (45 min, after 48h)
./scripts/production-cutover.sh
```

---

## 📋 All Commands

### Pre-Flight Validation
```bash
# Run all checks
./scripts/preflight-checks.sh

# Expected: Score > 90%, FAIL = 0
```

### Staging Deployment
```bash
# Deploy to staging
./scripts/auto-staging-deploy.sh

# Verify deployment
./scripts/verify-deployment.sh $(cat .staging-url.txt)

# View logs
cat logs/staging-deploy-$(ls -t logs/ | grep staging-deploy | head -1)
```

### Monitoring
```bash
# Start 48h monitoring
./scripts/monitoring-daemon.sh start

# Check status
./scripts/monitoring-daemon.sh status

# Stop monitoring
./scripts/monitoring-daemon.sh stop

# View logs
tail -f logs/monitoring-48h.log

# Read final report
cat logs/48h-monitoring-report-$(ls -t logs/ | grep 48h-monitoring-report | head -1)
```

### Rollback
```bash
# Rollback staging
./scripts/rollback-staging.sh

# Rollback production (manual)
vercel env rm NEXT_PUBLIC_API_URL production --yes && vercel --prod --force
```

### Production Cutover
```bash
# Deploy to production
./scripts/production-cutover.sh

# Verify production
./scripts/verify-deployment.sh https://dealradarus.com

# View logs
cat logs/production-cutover-$(ls -t logs/ | grep production-cutover | head -1)
```

### Post-Production
```bash
# Monitor production
./scripts/monitor-production.sh https://dealradarus.com

# Quick health check
curl https://dealradarus.com/api/health | jq '.'

# Check Railway logs
railway logs --tail 50 | grep -E "ERROR|WARN"
```

---

## 🔍 Verification Commands

### Check Staging URL
```bash
cat .staging-url.txt
```

### Check Backup Branches
```bash
# Staging backup
cat .staging-backup-branch.txt

# Production backup
cat .production-backup-branch.txt
```

### Test Endpoints Manually
```bash
# Variables
STAGING_URL=$(cat .staging-url.txt)
PRODUCTION_URL="https://dealradarus.com"
RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"

# Test staging
curl "$STAGING_URL/api/health" | jq '.'
curl "$STAGING_URL/api/deals?limit=5" | jq '. | length'
curl "$STAGING_URL/api/posts?limit=5" | jq 'if type=="array" then length else .posts | length end'

# Test production
curl "$PRODUCTION_URL/api/health" | jq '.'
curl "$PRODUCTION_URL/api/deals?limit=5" | jq '. | length'

# Test Railway directly
curl "$RAILWAY_URL/api/health" | jq '.'
```

### Check Environment Variables
```bash
# Preview (staging)
vercel env ls preview | grep NEXT_PUBLIC_API_URL

# Production
vercel env ls production | grep NEXT_PUBLIC_API_URL
```

---

## 📊 Monitoring & Logs

### Log Files
```bash
# All logs directory
ls -lt logs/

# Latest staging deploy log
cat logs/staging-deploy-$(ls -t logs/ | grep staging-deploy | head -1)

# Latest production cutover log
cat logs/production-cutover-$(ls -t logs/ | grep production-cutover | head -1)

# 48h monitoring log
tail -f logs/monitoring-48h.log

# Latest 48h report
cat logs/48h-monitoring-report-$(ls -t logs/ | grep 48h-monitoring-report | head -1)
```

### Status Files
```bash
# Monitoring status (JSON)
cat .monitoring-status.json | jq '.'

# Daemon PID
cat .monitoring-daemon.pid
```

### Railway Monitoring
```bash
# View logs
railway logs --tail 100

# Filter errors
railway logs --tail 50 | grep -E "ERROR|WARN|CRITICAL"

# Service status
railway status

# Service status (JSON)
railway status --json | jq '{status: .status, health: .health, uptime: .uptime}'

# Usage metrics
railway usage --json | jq '{compute: .compute, bandwidth: .bandwidth}'
```

### Neon Database
```bash
# Open console
open https://console.neon.tech/

# Check via Railway health endpoint
curl https://deal-aggregator-api-production.up.railway.app/api/health | jq '.database'
```

---

## 🆘 Emergency Commands

### Quick Health Checks
```bash
# Production health
curl -s https://dealradarus.com/api/health | jq '.status'

# Railway health
curl -s https://deal-aggregator-api-production.up.railway.app/api/health | jq '.status'

# Staging health (if deployed)
curl -s $(cat .staging-url.txt)/api/health | jq '.status' 2>/dev/null || echo "No staging"
```

### Quick Rollback
```bash
# Staging rollback (< 5 min)
./scripts/rollback-staging.sh

# Production rollback (< 5 min)
vercel env rm NEXT_PUBLIC_API_URL production --yes
vercel --prod --force
curl https://dealradarus.com/api/health | jq '.'
```

### Force Stop Monitoring
```bash
# Stop daemon
./scripts/monitoring-daemon.sh stop

# Or force kill
kill $(cat .monitoring-daemon.pid) 2>/dev/null || echo "Not running"
rm -f .monitoring-daemon.pid
```

### Clean Up Temporary Files
```bash
# Remove staging artifacts
rm -f .staging-url.txt
rm -f .staging-backup-branch.txt
rm -f .monitoring-status.json
rm -f .monitoring-daemon.pid

# Keep logs (don't delete)
ls -lh logs/
```

---

## 🛠️ Troubleshooting Quick Fixes

### "Command not found" Errors
```bash
# Check Node.js
node --version  # Should be >= 18

# Install/update Vercel CLI
npm i -g vercel@latest

# Check Railway CLI
railway version  # Should be installed

# Install jq (macOS)
brew install jq

# Install jq (Linux)
sudo apt-get install jq
```

### "Not authenticated" Errors
```bash
# Login to Vercel
vercel login

# Login to Railway
railway login

# Verify authentication
vercel whoami
railway whoami
```

### "Project not linked" Errors
```bash
# Link Vercel project
vercel link

# Link Railway project (from external-api/ directory)
cd external-api && railway link && cd ..
```

### Pre-flight Checks Failing
```bash
# Run checks to see what's failing
./scripts/preflight-checks.sh

# Common fixes:
npm install          # If node_modules missing
npm run build        # If build test fails
git add . && git commit -m "WIP"  # If working directory not clean
```

### Deployment Stuck or Slow
```bash
# Check Vercel status
open https://www.vercel-status.com/

# Check Railway status
railway status

# Check internet connectivity
ping -c 3 vercel.com

# View deployment progress
tail -f logs/staging-deploy-*.log  # During staging
tail -f logs/production-cutover-*.log  # During production
```

### Smoke Tests Failing
```bash
# Test manually
STAGING_URL=$(cat .staging-url.txt)

# Test each endpoint
curl -v "$STAGING_URL"  # Homepage (should return HTML)
curl "$STAGING_URL/api/health" | jq '.'  # Health (should return JSON)
curl "$STAGING_URL/api/deals?limit=5" | jq '.'  # Deals
curl "$STAGING_URL/api/posts?limit=5" | jq '.'  # Posts

# Check Railway API directly
curl https://deal-aggregator-api-production.up.railway.app/api/health | jq '.'
```

---

## 📚 Documentation Links

### Main Guides
- **Full Suite Documentation:** `AUTOMATION_SUITE_README.md`
- **Production Cutover Plan:** `PRODUCTION_CUTOVER_PLAN.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Cost Tracking:** `COST_TRACKING.md`
- **Monitoring Setup:** `PHASE_7_MONITORING_SETUP.md`

### Technical Docs
- **Vercel Support Ticket:** `docs/VERCEL-SUPPORT-TICKET.md`
- **Staging Deployment:** `STAGING-DEPLOYMENT-EXECUTION.md`
- **Project Worklog:** `PROJECT_WORKLOG_SESSION_JOURNAL.md`
- **Status Summary:** `DEPLOYMENT_STATUS_SUMMARY.md`

### External Links
- **Railway Dashboard:** https://railway.app/project/7e8dda6e-081d-48de-b60a-8ff1b5b081c0
- **Neon Console:** https://console.neon.tech/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Production Site:** https://dealradarus.com

---

## 🎯 Success Criteria

### Staging Deployment Success
- ✅ Pre-flight score > 90%
- ✅ Deployment completes without errors
- ✅ All verification tests pass (7/7)
- ✅ Staging URL accessible
- ✅ Response time < 2s

### 48h Monitoring Success
- ✅ Daemon runs for full 48 hours
- ✅ < 3 alerts triggered
- ✅ Average response time < 1000ms
- ✅ Success rate > 99%
- ✅ Final report: "READY FOR PRODUCTION"

### Production Cutover Success
- ✅ All Go/No-Go checks pass
- ✅ Deployment completes without errors
- ✅ All smoke tests pass (4/4)
- ✅ Production URL accessible
- ✅ T+2h monitoring shows stability

---

## 📞 Support Contacts

### Emergency Rollback
```bash
# Staging
./scripts/rollback-staging.sh

# Production
vercel env rm NEXT_PUBLIC_API_URL production --yes && vercel --prod --force
```

### Platform Support
- **Railway:** support@railway.app
- **Vercel:** support@vercel.com
- **Neon:** support@neon.tech

### Documentation
- Check `AUTOMATION_SUITE_README.md` for detailed help
- Check `DEPLOYMENT_CHECKLIST.md` for step-by-step guide
- Check logs in `logs/` directory for error details

---

**Version:** 1.0
**Last Updated:** October 1, 2025
**Keep this file handy during deployments!**
