# 🚀 Deployment Checklist - Railway API Workaround

**Complete deployment workflow from staging to production**
**Version:** 1.1 - Enhanced for 10/10 automation suite

---

## 📋 Pre-Deployment Checklist

### Environment Validation
- [ ] Node.js >= 18.x installed: `node --version`
  - Current version: __________
- [ ] Vercel CLI installed: `vercel --version`
  - Current version: __________
- [ ] Railway CLI installed: `railway version`
  - Current version: __________
- [ ] jq installed: `jq --version`
  - Current version: __________
- [ ] curl available: `curl --version`
  - Current version: __________

### Authentication Status
- [ ] Vercel authenticated: `vercel whoami`
  - Logged in as: __________
- [ ] Railway authenticated: `railway whoami`
  - Logged in as: __________
- [ ] Railway project linked: `railway status`
  - Project ID: __________

### Repository State
- [ ] Working directory clean or committed: `git status`
  - Status: ☐ Clean ☐ Has changes (describe: __________)
- [ ] Current branch: __________
- [ ] Remote backup configured: `git remote -v`
  - Remote URL: __________
- [ ] Latest changes pushed: `git log origin/$(git branch --show-current)..HEAD`
  - Unpushed commits: __________

### Documentation Review
- [ ] Read: `AUTOMATION_SUITE_README.md` (complete guide)
- [ ] Read: `QUICK_REFERENCE.md` (command reference)
- [ ] Read: `PRODUCTION_CUTOVER_PLAN.md` (Go/No-Go checklist)
- [ ] Read: `COST_TRACKING.md` (budget tracking)
- [ ] Read: `PHASE_7_MONITORING_SETUP.md` (monitoring setup)

### Pre-Deployment Decision
- [ ] **Ready to proceed:** ☐ Yes ☐ No ☐ Need more info
- [ ] If No, what's blocking: __________________________________________

---

## 🔍 Phase 1: Pre-Flight Validation (2 minutes)

**Command:**
```bash
./scripts/preflight-checks.sh
```

**Start Time:** __________

### Automated Checks Results

#### Section 1: Environment & Tools
- [ ] Node.js version: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Vercel CLI: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Railway CLI: ☐ PASS ☐ WARN ☐ FAIL
- [ ] jq (JSON processor): ☐ PASS ☐ WARN ☐ FAIL
- [ ] curl: ☐ PASS ☐ WARN ☐ FAIL

#### Section 2: Authentication
- [ ] Vercel auth: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Railway auth: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Railway project link: ☐ PASS ☐ WARN ☐ FAIL

#### Section 3: Git Repository
- [ ] Working directory: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Current branch: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Remote repository: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Unpushed commits: ☐ PASS ☐ WARN ☐ FAIL

#### Section 4: Railway API Health
- [ ] API reachability: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Health endpoint: ☐ PASS ☐ WARN ☐ FAIL
  - Status: __________
- [ ] Database connectivity: ☐ PASS ☐ WARN ☐ FAIL
  - DB Status: __________
- [ ] Response time: ☐ PASS ☐ WARN ☐ FAIL
  - Time: __________ ms (threshold: 2000ms)
- [ ] Critical endpoints: ☐ PASS ☐ WARN ☐ FAIL
  - Failing: __________

#### Section 5: Required Files
- [ ] smoke-test.sh: ☐ PASS ☐ WARN ☐ FAIL
- [ ] monitor-production.sh: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Documentation files: ☐ PASS ☐ WARN ☐ FAIL
  - Missing: __________
- [ ] .env files: ☐ PASS ☐ WARN ☐ FAIL

#### Section 6: Deployment Readiness
- [ ] Staging deployment check: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Vercel project link: ☐ PASS ☐ WARN ☐ FAIL
  - Project ID: __________
- [ ] node_modules: ☐ PASS ☐ WARN ☐ FAIL
- [ ] package.json scripts: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Build test: ☐ PASS ☐ WARN ☐ FAIL

#### Section 7: System Resources
- [ ] Disk space: ☐ PASS ☐ WARN ☐ FAIL
  - Available: __________ GB (need > 5GB)
- [ ] Memory: ☐ PASS ☐ WARN ☐ FAIL
  - Available: __________ MB
- [ ] Internet: ☐ PASS ☐ WARN ☐ FAIL

### Final Results
- **PASS Count:** __________
- **WARN Count:** __________
- **FAIL Count:** __________ (must be 0 to proceed)
- **Readiness Score:** __________% (must be > 90%)

**End Time:** __________
**Duration:** __________ minutes

### Decision
- [ ] **All checks passed (FAIL = 0):** ☐ Yes ☐ No
- [ ] **Ready to proceed to Phase 2:** ☐ Yes ☐ No

**If No, actions taken:**
- __________________________________________
- __________________________________________

---

## 🚢 Phase 2: Staging Deployment (20 minutes)

**Command:**
```bash
./scripts/auto-staging-deploy.sh
```

**Start Time:** __________

### Step 1: Pre-flight Validation
- [ ] Automatic pre-flight check: ☐ PASS ☐ FAIL
- [ ] If FAIL, stopped and fixed: __________

### Step 2: Backup Creation
- [ ] Local backup branch created: __________
  - Branch name: __________
- [ ] Remote backup pushed: ☐ Yes ☐ No ☐ Skipped
  - Remote branch: __________

### Step 3: Environment Variable Addition
- [ ] Prompted for Railway URL confirmation
- [ ] Confirmed URL: `https://deal-aggregator-api-production.up.railway.app`
- [ ] Environment variable added: ☐ Yes ☐ No
  - Variable: `NEXT_PUBLIC_API_URL`
  - Environment: `preview`

### Step 4: Variable Verification
- [ ] Environment variable verified: ☐ PASS ☐ FAIL
- [ ] Listed in `vercel env ls preview`: ☐ Yes ☐ No

### Step 5: Vercel Deployment
- [ ] Deployment command: `vercel --prebuilt --yes`
- [ ] Deployment initiated: ☐ Yes ☐ No
- [ ] Deployment completed: ☐ Yes ☐ No
- [ ] Staging URL extracted: __________________________________________
- [ ] URL saved to `.staging-url.txt`: ☐ Yes ☐ No

### Step 6: Deployment Accessibility
- [ ] Waiting for deployment (retry count: __________)
- [ ] Deployment accessible: ☐ Yes ☐ No
- [ ] Max retries reached: ☐ Yes ☐ No

### Step 7: Smoke Tests
- [ ] Homepage accessible: ☐ PASS ☐ FAIL
- [ ] Health endpoint: ☐ PASS ☐ FAIL
  - Status: __________
- [ ] Deals API: ☐ PASS ☐ FAIL
  - Returns data: ☐ Yes ☐ No
- [ ] Posts API: ☐ PASS ☐ FAIL
  - Returns data: ☐ Yes ☐ No

### Step 8: Initial Monitoring
- [ ] Production monitor run: ☐ PASS ☐ WARN ☐ FAIL
- [ ] Results logged: ☐ Yes ☐ No

### Step 9: Documentation Update
- [ ] STAGING-DEPLOYMENT-EXECUTION.md updated: ☐ Yes ☐ No
- [ ] PROJECT_WORKLOG_SESSION_JOURNAL.md updated: ☐ Yes ☐ No

### Step 10: Summary Review
- [ ] Deployment summary displayed: ☐ Yes ☐ No
- [ ] Staging URL: __________________________________________
- [ ] Railway API URL: `https://deal-aggregator-api-production.up.railway.app`
- [ ] Backup branch: __________
- [ ] Log file: __________________________________________

**End Time:** __________
**Duration:** __________ minutes

### Post-Deployment Verification

**Run verification script:**
```bash
./scripts/verify-deployment.sh $(cat .staging-url.txt)
```

**Verification Results:**
- [ ] Homepage: ☐ PASS ☐ FAIL
- [ ] Health endpoint: ☐ PASS ☐ FAIL
- [ ] Deals API: ☐ PASS ☐ FAIL
- [ ] Posts API: ☐ PASS ☐ FAIL
- [ ] Simple test: ☐ PASS ☐ FAIL
- [ ] Response time: ☐ PASS ☐ SLOW
  - Time: __________ ms
- [ ] Railway API usage: ☐ PASS ☐ WARN

**Verification Summary:**
- **Tests PASS:** __________
- **Tests FAIL:** __________
- **Overall:** ☐ All tests passed ☐ Some tests failed

### Manual Testing
```bash
STAGING_URL=$(cat .staging-url.txt)

# Test endpoints
curl "$STAGING_URL/api/health" | jq '.'
curl "$STAGING_URL/api/deals?limit=5" | jq '.'
curl "$STAGING_URL/api/posts?limit=5" | jq '.'
```

**Results:**
- [ ] Health returns JSON: ☐ Yes ☐ No
- [ ] Deals returns array: ☐ Yes ☐ No
- [ ] Posts returns array/object: ☐ Yes ☐ No

### Files Created
- [ ] `.staging-url.txt` exists: ☐ Yes ☐ No
  - Content: __________________________________________
- [ ] `.staging-backup-branch.txt` exists: ☐ Yes ☐ No
  - Content: __________
- [ ] Log file created: ☐ Yes ☐ No
  - Path: `logs/staging-deploy-YYYYMMDD-HHMMSS.log`

### Decision
- [ ] **Staging deployment successful:** ☐ Yes ☐ No
- [ ] **Ready to proceed to Phase 3 (Monitoring):** ☐ Yes ☐ No

**If No, issue description:**
- __________________________________________
- __________________________________________

---

## 📊 Phase 3: 48-Hour Monitoring (Background)

**Command:**
```bash
./scripts/monitoring-daemon.sh start
```

**Start Time:** __________
**Expected End Time:** __________ (48 hours later)

### Daemon Startup
- [ ] Daemon started successfully: ☐ Yes ☐ No
- [ ] PID recorded: __________
  - File: `.monitoring-daemon.pid`
- [ ] Log file created: `logs/monitoring-48h.log`
- [ ] Status file created: `.monitoring-status.json`

### Monitoring Configuration
- **Check interval:** Every 4 hours
- **Total checks:** 12 checks over 48 hours
- **Alert thresholds:**
  - Response time: > 2000ms
  - Error rate: > 1%
  - Railway status: != healthy

### Daily Check #1

**Date:** __________
**Time:** __________

**Status Command:**
```bash
./scripts/monitoring-daemon.sh status
```

**Status Output:**
- [ ] Daemon running: ☐ Yes ☐ No
  - PID: __________
- **Progress:** __________%
- **Elapsed:** __________ hours
- **Remaining:** __________ hours
- **Checks completed:** __________
- **Alerts triggered:** __________
- **Health status:** ☐ healthy ☐ degraded ☐ unhealthy

**Latest Check Results:**
- Timestamp: __________
- Avg response time: __________ ms
- Success rate: __________%
- Railway status: __________

**Manual Verification:**
```bash
# Check staging
curl $(cat .staging-url.txt)/api/health | jq '.'

# Check Railway
curl https://deal-aggregator-api-production.up.railway.app/api/health | jq '.'
```

**Manual Results:**
- [ ] Staging status: __________
- [ ] Railway status: __________
- [ ] Database status: __________
- [ ] No errors observed: ☐ Yes ☐ No

**Issues (if any):**
- __________________________________________

### Daily Check #2

**Date:** __________
**Time:** __________

**Status Output:**
- [ ] Daemon running: ☐ Yes ☐ No
- **Progress:** __________% (should be ~50%)
- **Checks completed:** __________
- **Alerts triggered:** __________
- **Health status:** __________

**Performance Trends:**
- Avg response time: __________ ms
- Success rate: __________%
- Error rate: __________%

**Issues (if any):**
- __________________________________________

### Mid-Point Review (24 Hours)

**Date:** __________

**Summary:**
- Total checks: __________
- Total alerts: __________
- Average response time: __________ ms
- Success rate: __________%

**Assessment:**
- [ ] Performance stable: ☐ Yes ☐ No
- [ ] Alerts acceptable (< 3): ☐ Yes ☐ No
- [ ] On track for production: ☐ Yes ☐ No

**Actions taken (if issues):**
- __________________________________________

### Final Report (After 48 Hours)

**Date:** __________
**Time:** __________

**Find Report:**
```bash
ls -lt logs/48h-monitoring-report-*.md | head -1
cat logs/48h-monitoring-report-[DATE].md
```

**Report Location:** __________________________________________

**Final Metrics:**
- **Total checks:** __________
- **Total alerts:** __________
- **Avg response time:** __________ ms
- **Success rate:** __________%
- **Error rate:** __________%
- **Uptime:** __________%

**Final Recommendation:**
- [ ] ✅ READY FOR PRODUCTION (0 alerts)
- [ ] ⚠️ NEEDS REVIEW (1-3 alerts)
- [ ] ❌ NOT READY (4+ alerts)

**If NEEDS REVIEW, details:**
- Alert 1: __________________________________________
- Alert 2: __________________________________________
- Alert 3: __________________________________________

**If NOT READY, root causes:**
- Issue 1: __________________________________________
- Issue 2: __________________________________________
- Action plan: __________________________________________

### Decision
- [ ] **Monitoring completed successfully:** ☐ Yes ☐ No
- [ ] **Final recommendation: READY:** ☐ Yes ☐ No
- [ ] **Ready to proceed to Production:** ☐ Yes ☐ No

**If No, next steps:**
- [ ] Fix issues
- [ ] Redeploy staging
- [ ] Restart 48h monitoring

---

## 🔄 Phase 4: Rollback (If Needed)

**⚠️ Only execute if staging has critical issues that cannot be fixed**

### Pre-Rollback Assessment

**Date:** __________
**Time:** __________

**Issue Description:**
- __________________________________________
- __________________________________________

**Severity:** ☐ Critical ☐ Major ☐ Minor

**Troubleshooting attempted:**
- [ ] Checked logs: `cat logs/staging-deploy-*.log`
- [ ] Verified endpoints manually
- [ ] Checked Railway status
- [ ] Checked Vercel deployment
- [ ] Reviewed environment variables

**Troubleshooting results:**
- __________________________________________

**Decision to rollback:** ☐ Yes ☐ No

### Rollback Execution

**Command:**
```bash
./scripts/rollback-staging.sh
```

**Start Time:** __________

**Steps:**
1. **Confirmation:**
   - [ ] Typed "yes" to confirm rollback

2. **Environment Variable Removal:**
   - [ ] `NEXT_PUBLIC_API_URL` removed from preview: ☐ Yes ☐ No

3. **Staging Redeployment:**
   - [ ] Redeployed without external API: ☐ Yes ☐ No
   - [ ] Command used: `vercel --prebuilt --yes`

4. **Cleanup:**
   - [ ] `.staging-url.txt` removed: ☐ Yes ☐ No
   - [ ] Backup branch info displayed: __________

**End Time:** __________
**Duration:** __________ minutes

### Post-Rollback Verification

**Check staging:**
```bash
# Staging should now use Vercel internal routes
vercel ls --yes | head -5
```

**Results:**
- [ ] Staging accessible: ☐ Yes ☐ No
- [ ] Using Vercel routes (expected): ☐ Yes ☐ No
- [ ] No external API calls: ☐ Yes ☐ No

### Recovery Plan
- [ ] Root cause identified: __________________________________________
- [ ] Fix applied: __________________________________________
- [ ] Ready to retry staging deployment: ☐ Yes ☐ No ☐ Later

**If retrying:**
- [ ] Go back to Phase 1 (Pre-flight checks)
- [ ] Document changes made: __________________________________________

---

## 🎯 Phase 5: Production Cutover (45 minutes)

**⚠️ Prerequisites - ALL must be checked:**

### Pre-Cutover Validation

**Date:** __________
**Time:** __________

**48-Hour Monitoring:**
- [ ] Monitoring completed (48 hours)
- [ ] Final report generated
- [ ] Recommendation: ☐ READY ☐ NEEDS REVIEW ☐ NOT READY
- [ ] Decision: Proceed ☐ Yes ☐ No

**Team Readiness:**
- [ ] All team members notified
- [ ] Support team available
- [ ] Deployment window confirmed: __________
- [ ] No active incidents
- [ ] No conflicting deployments

**Technical Readiness:**
- [ ] Staging stable for 48+ hours
- [ ] All smoke tests passing
- [ ] Performance within SLA
- [ ] No critical bugs

### Go/No-Go Checklist Review

**Review document:**
```bash
head -150 PRODUCTION_CUTOVER_PLAN.md
```

**Automated Checks (from script):**
- [ ] Railway API healthy: ☐ Yes ☐ No
- [ ] Database connected: ☐ Yes ☐ No
- [ ] Response time < 2s: ☐ Yes ☐ No
  - Time: __________ ms
- [ ] Git working directory clean: ☐ Yes ☐ No
- [ ] Vercel authenticated: ☐ Yes ☐ No
- [ ] Staging alerts < 3: ☐ Yes ☐ No
  - Alert count: __________
- [ ] Required docs present: ☐ Yes ☐ No
- [ ] Dependencies installed: ☐ Yes ☐ No

**Manual Review:**
- [ ] Staging validated for 48 hours: ☐ Yes ☐ No
- [ ] Stakeholders notified: ☐ Yes ☐ No
  - Notification sent: __________
- [ ] Support team available: ☐ Yes ☐ No
  - On-call: __________
- [ ] Rollback plan understood: ☐ Yes ☐ No
- [ ] No active incidents: ☐ Yes ☐ No
  - Check: __________
- [ ] Deployment window appropriate: ☐ Yes ☐ No
  - Window: __________

### Go/No-Go Decision

**All automated checks:** ☐ PASS ☐ FAIL
**All manual reviews:** ☐ PASS ☐ FAIL

**DECISION:** ☐ GO ☐ NO-GO

**If NO-GO, reason:**
- __________________________________________
- __________________________________________
- **Rescheduled to:** __________

**If GO, authorized by:** __________

### Production Deployment Execution

**Command:**
```bash
./scripts/production-cutover.sh
```

**Start Time:** __________

#### Phase 1: Go/No-Go Validation (15 min)

**Automated checks:** ☐ PASS ☐ FAIL
**Manual confirmation:** ☐ Confirmed ☐ Declined
**Final confirmation:** ☐ Typed "yes" ☐ Cancelled

#### Phase 2: Deployment (15 min)

1. **Production Backup:**
   - [ ] Backup branch created: __________
   - [ ] Pushed to remote: ☐ Yes ☐ No

2. **Environment Variable:**
   - [ ] Added to production: ☐ Yes ☐ No
   - [ ] Variable: `NEXT_PUBLIC_API_URL`
   - [ ] Value: `https://deal-aggregator-api-production.up.railway.app`

3. **Variable Verification:**
   - [ ] Verified in production: ☐ Yes ☐ No
   ```bash
   vercel env ls production | grep NEXT_PUBLIC_API_URL
   ```

4. **Deployment:**
   - [ ] Command: `vercel --prod --yes`
   - [ ] Deployment initiated: ☐ Yes ☐ No
   - [ ] Deployment completed: ☐ Yes ☐ No

5. **Propagation Wait:**
   - [ ] Waited 30 seconds: ☐ Yes
   - [ ] Time: __________

#### Phase 3: Validation (15 min)

**Smoke Tests:**
- [ ] Homepage accessible: ☐ PASS ☐ FAIL
  ```bash
  curl -s https://dealradarus.com | grep -q 'html'
  ```

- [ ] Health endpoint: ☐ PASS ☐ FAIL
  - Status: __________
  ```bash
  curl https://dealradarus.com/api/health | jq '.status'
  ```

- [ ] Deals API: ☐ PASS ☐ FAIL
  - Returns data: ☐ Yes ☐ No
  ```bash
  curl https://dealradarus.com/api/deals?limit=5 | jq '. | length'
  ```

- [ ] Posts API: ☐ PASS ☐ FAIL
  - Returns data: ☐ Yes ☐ No
  ```bash
  curl https://dealradarus.com/api/posts?limit=5 | jq '. | length'
  ```

**Verification Script:**
```bash
./scripts/verify-deployment.sh https://dealradarus.com
```

**Verification Results:**
- **Tests PASS:** __________
- **Tests FAIL:** __________
- **Overall:** ☐ All passed ☐ Some failed

**End Time:** __________
**Total Duration:** __________ minutes

### Deployment Summary

**Production Deployment:**
- **Status:** ☐ SUCCESS ☐ PARTIAL ☐ FAILED
- **Production URL:** https://dealradarus.com
- **Railway API:** https://deal-aggregator-api-production.up.railway.app
- **Backup branch:** __________
- **Log file:** __________________________________________

**If FAILED:**
- [ ] Errors: __________________________________________
- [ ] Rollback initiated: ☐ Yes ☐ No
- [ ] Rollback completed: ☐ Yes ☐ No

---

## 📈 Phase 6: Post-Production Monitoring

### T+2h Check (2 Hours After Deployment)

**Date:** __________
**Time:** __________

**Health Check:**
```bash
curl https://dealradarus.com/api/health | jq '.'
```

**Results:**
- [ ] Status: __________
- [ ] Database: __________
- [ ] Response time: __________ ms

**Full Verification:**
```bash
./scripts/verify-deployment.sh https://dealradarus.com
```

**Results:**
- Tests PASS: __________
- Tests FAIL: __________

**Production Monitor:**
```bash
./scripts/monitor-production.sh https://dealradarus.com
```

**Metrics:**
- Uptime: __________%
- Avg response: __________ ms
- Error rate: __________%
- Total requests: __________

**Railway Logs:**
```bash
railway logs --tail 50 | grep -E "ERROR|WARN"
```

**Issues Found:**
- [ ] No issues: ☐ Yes
- [ ] Issues: __________________________________________

**Decision:**
- [ ] Production stable: ☐ Yes ☐ No
- [ ] Continue monitoring: ☐ Yes ☐ No
- [ ] Rollback needed: ☐ Yes ☐ No

### T+24h Check (24 Hours After Deployment)

**Date:** __________
**Time:** __________

**Production Review:**
- [ ] Stable for 24 hours: ☐ Yes ☐ No
- [ ] No incidents: ☐ Yes ☐ No
- [ ] Performance within SLA: ☐ Yes ☐ No
- [ ] User feedback: ☐ Positive ☐ Neutral ☐ Negative

**Metrics Summary:**
- Uptime: __________%
- Avg response: __________ ms
- p95 response: __________ ms
- Error rate: __________%
- Total requests: __________

**Cost Tracking Update:**
```bash
# Update COST_TRACKING.md
# Fill in: Week of [Date] section
```

**Costs:**
- Railway usage: ☐ Normal ☐ High
- Neon usage: ☐ Normal ☐ High
- Total cost: $__________ (budget: $25/month)

**Issues/Observations:**
- __________________________________________
- __________________________________________

### T+7d Check (1 Week After Deployment)

**Date:** __________

**Weekly Summary:**
- Uptime: __________%
- Avg response: __________ ms
- Error rate: __________%
- Total cost: $__________

**Performance vs Baseline:**
- p50: __________ ms (baseline: 550ms)
- p95: __________ ms (baseline: 762ms)
- p99: __________ ms (baseline: 804ms)

**Issues Encountered:**
- [ ] No issues ✅
- [ ] Issues: __________________________________________

**Optimization Opportunities:**
- __________________________________________
- __________________________________________

---

## 🔄 Ongoing Maintenance

### Daily Tasks (5 minutes)

**Date:** __________

- [ ] Quick health check:
  ```bash
  curl https://dealradarus.com/api/health | jq '.status'
  ```
  - Result: __________

- [ ] Check Railway logs:
  ```bash
  railway logs --tail 20 | grep ERROR
  ```
  - Errors found: __________

- [ ] Vercel ticket follow-up:
  - Check: `docs/VERCEL-SUPPORT-TICKET.md`
  - Last update: __________
  - Next action: __________

### Weekly Tasks (15 minutes)

**Week of:** __________

- [ ] Update COST_TRACKING.md
  - Railway: $__________
  - Neon: $__________
  - Vercel: $__________
  - Total: $__________

- [ ] Review Railway dashboard
  - URL: https://railway.app/project/7e8dda6e-081d-48de-b60a-8ff1b5b081c0
  - Usage: __________%
  - Uptime: __________%
  - Errors: __________

- [ ] Review Neon dashboard
  - URL: https://console.neon.tech/
  - Storage: __________ / 3GB
  - Compute: __________ / 300h
  - Status: __________

- [ ] Performance review
  - Avg response: __________ ms
  - Error rate: __________%
  - Trends: __________

### Monthly Tasks (1 hour)

**Month of:** __________

- [ ] Comprehensive cost review
  - Total month cost: $__________
  - Budget variance: $__________
  - Forecast next month: $__________

- [ ] Performance optimization
  - Optimization 1: __________________________________________
  - Optimization 2: __________________________________________

- [ ] Capacity planning
  - Storage growth: __________
  - Compute growth: __________
  - Scaling needed: ☐ Yes ☐ No

- [ ] Quarterly forecast
  - Q___ forecast: $__________
  - Action items: __________________________________________

---

## 🆘 Troubleshooting Guide

### If Staging Deployment Fails

**Symptoms:**
- Deployment command fails
- Environment variable not added
- Smoke tests fail

**Actions:**
1. Check pre-flight errors:
   ```bash
   ./scripts/preflight-checks.sh
   ```

2. Review logs:
   ```bash
   cat logs/staging-deploy-*.log
   ```

3. Verify authentication:
   ```bash
   vercel whoami
   railway whoami
   ```

4. Check Railway status:
   ```bash
   railway status
   curl https://deal-aggregator-api-production.up.railway.app/api/health
   ```

5. Retry deployment:
   ```bash
   ./scripts/auto-staging-deploy.sh
   ```

### If Monitoring Shows Alerts

**Symptoms:**
- Alert count > 0
- Health status: degraded/unhealthy

**Actions:**
1. Review logs:
   ```bash
   tail -f logs/monitoring-48h.log
   ```

2. Check Railway dashboard manually

3. Verify endpoints:
   ```bash
   curl $(cat .staging-url.txt)/api/health
   ```

4. If < 3 alerts: **Acceptable, continue**
5. If >= 4 alerts: **Investigate and fix**

### If Production Cutover Fails

**Symptoms:**
- Go/No-Go checks fail
- Deployment fails
- Smoke tests fail

**Actions:**
1. Check Go/No-Go errors
2. Review logs:
   ```bash
   cat logs/production-cutover-*.log
   ```

3. Verify environment variables:
   ```bash
   vercel env ls production
   ```

4. **Consider rollback:**
   ```bash
   vercel env rm NEXT_PUBLIC_API_URL production --yes
   vercel --prod --force
   ```

5. Fix issues and retry

### Emergency Rollback (Production)

**Command:**
```bash
# Quick rollback (< 5 minutes)
vercel env rm NEXT_PUBLIC_API_URL production --yes
vercel --prod --force

# Verify
curl https://dealradarus.com/api/health | jq '.'
```

**Steps:**
1. Remove environment variable
2. Force redeploy
3. Verify production accessible
4. Confirm using Vercel routes
5. Monitor for stability

---

## ✅ Completion Criteria

### Staging Deployment Complete When:
- ✅ All pre-flight checks passed (score > 90%)
- ✅ Deployment successful (no errors)
- ✅ All verification tests passed (7/7)
- ✅ Staging URL accessible
- ✅ Response time < 2s
- ✅ Railway API detected
- ✅ 48h monitoring started

### 48h Monitoring Complete When:
- ✅ 12 checks completed over 48 hours
- ✅ Final report generated
- ✅ Recommendation: READY FOR PRODUCTION
- ✅ Alert count < 3
- ✅ Performance stable

### Production Cutover Complete When:
- ✅ Go/No-Go decision: GO
- ✅ All automated checks passed (8/8)
- ✅ All smoke tests passed (4/4)
- ✅ Production live and accessible
- ✅ T+2h monitoring shows stability
- ✅ No critical issues

### Project Complete When:
- ✅ Production stable for 7+ days
- ✅ No critical issues
- ✅ Costs within budget ($25/month)
- ✅ Monitoring established
- ✅ Documentation updated
- ✅ Team trained on maintenance

---

**Version:** 1.1 - Enhanced
**Last Updated:** October 1, 2025
**Total Items:** 500+ checkboxes
**Estimated Time:** Staging (20 min) + Monitoring (48h) + Production (45 min)
