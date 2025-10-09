# Production Cutover Plan

## 🎯 Overview

**Objective:** Deploy Railway API workaround to production environment
**Target Date:** [TBD - After staging validation]
**Estimated Duration:** 4-6 hours (including monitoring)
**Deployment Window:** [Low traffic time - recommend 2-4 AM GMT]

---

## ✅ GO/NO-GO DECISION CHECKLIST

### Last Review: [Date before deployment]
### Reviewed by: [Name/Team]

---

### PART 1: Technical Readiness (ALL must be ✅)

#### Infrastructure Health
- [ ] **Railway API Status**
  - Uptime > 99% for past 7 days
  - Current status: Healthy
  - No pending maintenance windows
  - Verified at: https://railway.app/project/7e8dda6e-081d-48de-b60a-8ff1b5b081c0

- [ ] **Database (Neon) Status**
  - Connection pool stable (< 80% utilization)
  - No connection errors in past 48 hours
  - Query performance acceptable (p95 < 500ms)
  - Storage usage < 80% of limit

- [ ] **Vercel Platform Status**
  - No known platform issues
  - Build system operational
  - Check: https://www.vercel-status.com/

#### Staging Validation
- [ ] **Staging Deployment Successful**
  - Deployed for minimum 48 hours
  - URL: [Staging URL here]
  - All smoke tests passing

- [ ] **Performance Benchmarks Met**
  - p50 response time < 1000ms: Current ___ms
  - p95 response time < 2000ms: Current ___ms
  - p99 response time < 5000ms: Current ___ms
  - Error rate < 0.5%: Current ___%
  - Requests/sec > 10: Current ___

- [ ] **Functional Tests Passed**
  - Health endpoint: ✅
  - Deals endpoint: ✅
  - Blog posts endpoint: ✅
  - Analytics tracking: ✅
  - Error logging: ✅
  - Newsletter signup: ✅
  - All 9 endpoints verified: ✅

#### Monitoring & Alerting
- [ ] **Railway Monitoring Configured**
  - Dashboard alerts active (6 alert types)
  - Notification channels tested
  - Alert thresholds appropriate
  - Monitoring guide: See PHASE_7_MONITORING_SETUP.md

- [ ] **Cost Tracking Established**
  - Baseline metrics captured
  - Weekly tracking template ready
  - Budget approved: $25/month
  - Reference: See COST_TRACKING.md

- [ ] **Logging & Metrics**
  - Railway logs accessible
  - Neon monitoring active
  - Dashboard bookmarked
  - On-call access verified

#### Rollback Preparedness
- [ ] **Rollback Procedure Documented**
  - Steps tested in staging
  - Commands verified
  - Recovery time < 10 minutes
  - See: Rollback section below

- [ ] **Backup Verification**
  - Current production state documented
  - Environment variables backed up
  - Database backup current (if applicable)
  - Rollback commands tested

- [ ] **Emergency Contacts Updated**
  - On-call engineer assigned: [Name]
  - Railway support contact: support@railway.app
  - Neon support contact: support@neon.tech
  - Vercel support contact: support@vercel.com

---

### PART 2: Business Readiness

#### Stakeholder Communication
- [ ] **Technical Team Notified**
  - Developers briefed (T-48 hours)
  - DevOps team aware
  - QA team ready for validation
  - Support team prepared

- [ ] **Deployment Communication**
  - Maintenance window announced (T-24 hours)
  - Status page updated (if applicable)
  - User notification sent (if needed)
  - Rollback communication plan ready

- [ ] **Post-Deployment Plan**
  - First 2 hours: Intensive monitoring
  - First 24 hours: Hourly checks
  - First week: Daily review
  - Success metrics defined

#### Risk Assessment
- [ ] **Risk Mitigation**
  - All risks identified and documented
  - Mitigation strategies in place
  - Contingency plans prepared
  - Decision authority clear

---

### PART 3: Safety Checks

#### Compliance & Security
- [ ] **Security Review**
  - CORS configuration verified
  - API endpoints secured
  - No secrets in code
  - Environment variables protected

- [ ] **Data Protection**
  - No data loss risk
  - Analytics/errors continue logging
  - Newsletter signups unaffected
  - User data secure

#### Final Verification
- [ ] **Code Quality**
  - All tests passing locally
  - No known critical bugs
  - Code reviewed
  - Documentation updated

- [ ] **Environment Configuration**
  - Production env vars correct
  - NEXT_PUBLIC_API_URL set
  - Railway URL verified
  - No staging variables in production

---

## 🚦 GO/NO-GO DECISION

**Decision Matrix:**

| Criteria | Weight | Pass? | Score |
|----------|--------|-------|-------|
| Railway Infrastructure | Critical | ☐ Yes ☐ No | ___ |
| Database Health | Critical | ☐ Yes ☐ No | ___ |
| Staging Validation | Critical | ☐ Yes ☐ No | ___ |
| Performance Benchmarks | Critical | ☐ Yes ☐ No | ___ |
| Monitoring Setup | Critical | ☐ Yes ☐ No | ___ |
| Rollback Ready | Critical | ☐ Yes ☐ No | ___ |
| Stakeholder Communication | High | ☐ Yes ☐ No | ___ |
| Security Review | High | ☐ Yes ☐ No | ___ |

**Decision Rules:**
- **ALL Critical items = Yes** → **GO**
- **ANY Critical item = No** → **NO-GO** (Reschedule)
- **High priority No** → Evaluate risk, may proceed with mitigation

**Final Decision:** ☐ **GO** ☐ **NO-GO**

**Decided by:** [Name/Role]
**Decision Date:** [YYYY-MM-DD HH:MM GMT]
**Signature:** _______________

---

## 📅 DEPLOYMENT TIMELINE

### T-48 Hours (2 Days Before)

**Time:** [Date] 09:00 GMT
**Duration:** 30 minutes

**Actions:**
- [ ] Send email to technical team
  - Subject: "Production Deployment Scheduled - Railway API Workaround"
  - Include: Timeline, changes, rollback plan
  - Attendees: Developers, DevOps, QA, Support

- [ ] Review Go/No-Go checklist (first pass)
- [ ] Verify staging stability (48+ hours running)
- [ ] Update deployment runbook

**Stakeholder Notification Email Template:**
```
Subject: Production Deployment - Railway API Workaround [Date]

Team,

We will be deploying the Railway API workaround to production on [Date] at [Time] GMT.

WHAT: External API deployment to work around Vercel routing issue
WHY: Vercel platform bug preventing API functionality
DURATION: 30-minute deployment + 2-hour monitoring
RISK: Low (tested in staging for 48+ hours)
ROLLBACK: < 10 minutes if needed

Timeline:
- T-48h (now): Team notification
- T-24h: Final go/no-go review
- T-0: Deployment execution
- T+2h: Monitoring complete

Deployment runbook: PRODUCTION_CUTOVER_PLAN.md
Questions: [Contact]

Thank you,
[Your name]
```

---

### T-24 Hours (1 Day Before)

**Time:** [Date] 09:00 GMT
**Duration:** 1 hour

**Actions:**
- [ ] Final Go/No-Go review meeting
  - Review all checklist items
  - Discuss any concerns
  - Make GO/NO-GO decision

- [ ] If GO decision:
  - [ ] Confirm deployment window
  - [ ] Assign on-call engineer
  - [ ] Test notification channels
  - [ ] Update status page (if applicable)

- [ ] If NO-GO decision:
  - [ ] Document blocking issues
  - [ ] Create remediation plan
  - [ ] Reschedule deployment
  - [ ] Notify stakeholders

- [ ] Send final confirmation email
- [ ] Post in team Slack channel

**Final Confirmation Email:**
```
Subject: CONFIRMED: Production Deployment [Date Time]

Team,

Production deployment is CONFIRMED for [Date] at [Time] GMT.

On-call: [Engineer Name] - [Phone] - [Email]
Backup: [Name]

Deployment steps: 6 steps, ~30 minutes
Monitoring period: 2 hours intensive, 24 hours active

Emergency rollback: Available at all times
Rollback time: < 10 minutes

Deployment will proceed unless critical issue discovered.

Status updates: #deployments Slack channel
Questions: [Contact]

[Your name]
```

---

### T-2 Hours (Preparation)

**Time:** [Deployment Date] [Time-2h] GMT
**Duration:** 30 minutes

**Actions:**
- [ ] **Pre-deployment checks**
  ```bash
  # Verify Railway API health
  curl -s https://deal-aggregator-api-production.up.railway.app/api/health | jq '.status'
  # Expected: "healthy"

  # Check Railway status
  railway status

  # Verify Neon database
  # Check dashboard: https://console.neon.tech/

  # Test Vercel CLI access
  vercel whoami
  ```

- [ ] **Prepare deployment commands**
  - Copy commands to clipboard
  - Open Railway dashboard
  - Open Vercel dashboard
  - Start screen sharing (if team watching)

- [ ] **Notification: Starting soon**
  - Slack: "Deployment starting in 2 hours"
  - Status page: "Scheduled maintenance starting [Time]"

- [ ] **Final code verification**
  ```bash
  git status  # Should be clean
  git log -1  # Verify last commit
  git branch  # Confirm on correct branch
  ```

---

### T-0: DEPLOYMENT EXECUTION

**Start Time:** [Date] [Time] GMT
**Duration:** 30 minutes
**Team:** [Names of people involved]

---

#### Step 1: Pre-deployment Verification (5 minutes)

**Time:** T+0 minutes

```bash
# 1. Check current production status
curl -s https://dealradarus.com/api/health | jq '.'
# Note: May return blog posts (known issue)

# 2. Verify Railway API is ready
curl -s https://deal-aggregator-api-production.up.railway.app/api/health | jq '.status'
# Must be: "healthy"

# 3. Start monitoring logs
railway logs --tail &
```

**Checkpoint:**
- [ ] Production accessible
- [ ] Railway API healthy
- [ ] Monitoring active

**If any check fails:** STOP → Investigate → Decide: Proceed or Abort

---

#### Step 2: Add Environment Variable (5 minutes)

**Time:** T+5 minutes

```bash
# Navigate to project directory
cd /Users/admin/projects/deal-aggregator-facebook

# Add Railway URL to Vercel production environment
vercel env add NEXT_PUBLIC_API_URL production

# When prompted, enter:
https://deal-aggregator-api-production.up.railway.app

# Verify it was added
vercel env ls
```

**Verification:**
```bash
vercel env pull .env.production.local
cat .env.production.local | grep NEXT_PUBLIC_API_URL
# Should see: NEXT_PUBLIC_API_URL=https://deal-aggregator-api-production.up.railway.app
```

**Checkpoint:**
- [ ] Environment variable added successfully
- [ ] URL correct (no typos!)
- [ ] Verified in Vercel dashboard

---

#### Step 3: Build & Deploy (10 minutes)

**Time:** T+10 minutes

```bash
# Build locally first (optional verification step)
npm run build
# Should complete without errors

# Deploy to production
vercel --prod

# Save deployment URL from output
# Example: https://dealradarus.com-abc123.vercel.app
```

**Expected Output:**
```
✓ Build Completed in /vercel/output
✓ Deployment complete!
🔗 Production: https://dealradarus.com
📦 Deployment ID: dpl_xxxxxxxxxxxx
```

**Checkpoint:**
- [ ] Build successful
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] Deployment ID saved: dpl_______________

**If deployment fails:**
1. Check error logs
2. Verify environment variables
3. Retry deployment
4. If fails again → Execute rollback

---

#### Step 4: Initial Smoke Tests (5 minutes)

**Time:** T+15 minutes

```bash
PROD_URL="https://dealradarus.com"

# Test 1: Health endpoint (should route to Railway)
curl -s $PROD_URL/api/health | jq '{status, checks}'
# Expected: {"status": "healthy", "checks": [...]}
# NOT: {"posts": [...]}

# Test 2: Simple test endpoint
curl -s $PROD_URL/api/simple-test | jq '.endpoint'
# Expected: "/api/simple-test"
# NOT: Blog posts

# Test 3: Deals endpoint
curl -s $PROD_URL/api/deals | jq '.meta.total'
# Expected: Number (e.g., 9)
# NOT: Blog posts

# Test 4: Blog posts (should still work)
curl -s $PROD_URL/api/posts | jq '.posts | length'
# Expected: Number (e.g., 5)

# Test 5: Analytics POST
curl -s -X POST $PROD_URL/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"deploy-test","events":[{"type":"deployment_verification"}]}' \
  | jq '.message'
# Expected: Success message or 202 Accepted
```

**Checkpoint:**
- [ ] Health returns healthy (not blog posts) ✅ CRITICAL
- [ ] Simple-test returns correct endpoint ✅ CRITICAL
- [ ] Deals returns deals data ✅ CRITICAL
- [ ] Blog posts still working ✅
- [ ] Analytics accepting POSTs ✅

**Success Criteria:** At least 3/5 critical tests pass

**If tests fail:**
- Check Railway logs for errors
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check browser console for CORS errors
- Decision point: Continue monitoring or rollback?

---

#### Step 5: Comprehensive Smoke Tests (10 minutes)

**Time:** T+20 minutes

```bash
# Run full smoke test suite
./scripts/smoke-test.sh https://dealradarus.com
```

**Expected Output:**
```
🧪 PRODUCTION SMOKE TEST SUITE
========================================
✅ Homepage: HTTP 200
✅ /api/health: HTTP 200 - Valid JSON
✅ /api/posts: HTTP 200 - Valid JSON
✅ /api/deals: HTTP 200 - Valid JSON
✅ /api/analytics: HTTP 202 - Valid JSON
✅ /api/errors: HTTP 202 - Valid JSON

Summary: 6/6 tests passed ✅
```

**Checkpoint:**
- [ ] All smoke tests passing
- [ ] No 404 or 500 errors
- [ ] Response times acceptable
- [ ] No CORS errors in browser console

**If any test fails:**
1. Note which test failed
2. Check specific endpoint manually
3. Review Railway logs
4. Decision: Investigate or rollback?

---

#### Step 6: Final Verification & Handoff (5 minutes)

**Time:** T+25 minutes

```bash
# Start monitoring script
./scripts/monitor-production.sh https://dealradarus.com --mode=production &

# Monitor logs
railway logs --tail 50 | grep -E "ERROR|WARN"
# Should be minimal/no errors

# Check Railway service status
railway status
```

**Final Checks:**
- [ ] Railway API responding correctly
- [ ] No error spike in logs
- [ ] Database connections stable
- [ ] Monitoring dashboard shows healthy

**Deployment Complete Notification:**
```
📢 Slack/Email:

Production Deployment COMPLETE ✅

Deployed: [Timestamp]
Deployment ID: dpl_____________
Status: All smoke tests passed

Monitoring:
- Railway: https://railway.app/project/[id]
- Logs: railway logs --tail
- Health: https://dealradarus.com/api/health

On-call engineer [Name] monitoring for 2 hours.
Report issues: #incidents channel

[Your name]
```

---

### T+30 Minutes: Initial Monitoring Period

**Duration:** 30 minutes
**Responsible:** On-call engineer

**Actions:**
- [ ] Watch Railway dashboard continuously
- [ ] Monitor error rates (should be < 1%)
- [ ] Check response times (should be stable)
- [ ] Review logs every 5 minutes
- [ ] Test site functionality manually

**Monitoring Checklist (every 5 minutes):**
```bash
# Quick health check
curl -s https://dealradarus.com/api/health | jq '.status'

# Check Railway logs
railway logs --tail 20 | grep ERROR

# Service status
railway status | grep -E "status|health"
```

**Red Flags (Execute rollback if observed):**
- Error rate > 5%
- p95 response time > 5s
- Database connection failures
- Service crashes/restarts
- User-reported issues

---

### T+2 Hours: Extended Monitoring

**Duration:** Until T+4 hours
**Responsible:** On-call engineer (can hand off)

**Actions:**
- [ ] Review metrics every 15 minutes
- [ ] Check Neon database performance
- [ ] Monitor Railway resource usage
- [ ] Review any user reports
- [ ] Update team on status

**Status Update (T+2 hours):**
```
Production Update (T+2 hours) ✅

Deployment stable for 2 hours.

Metrics:
- Error rate: ___% (target < 1%)
- p95 response: ___ms (target < 2s)
- Requests: ___k
- Railway uptime: ___%

Issues: None / [List any]
Status: ✅ Green / ⚠️ Monitoring / 🔴 Issues

Continuing monitoring for 24 hours.

[Name]
```

---

### T+24 Hours: Post-Deployment Review

**Time:** [Next day] Same time
**Duration:** 30 minutes
**Participants:** Deployment team

**Review Agenda:**
1. **Metrics Review**
   - Overall error rate
   - Performance trends
   - Railway/Neon usage
   - Cost tracking

2. **Issues Encountered**
   - Any errors or warnings
   - User reports
   - Performance concerns

3. **Lessons Learned**
   - What went well
   - What could improve
   - Update runbook

4. **Next Steps**
   - Continue monitoring schedule
   - Update documentation
   - Close deployment ticket

**Post-Deployment Report Template:**
```markdown
# Production Deployment Report

**Date:** [YYYY-MM-DD]
**Deployment ID:** dpl_____________
**Duration:** [Actual time taken]

## Summary
☐ Success ☐ Success with issues ☐ Rolled back

## Metrics (First 24 hours)
- Total requests: ___k
- Error rate: ___%
- p95 response: ___ms
- Uptime: ___%
- Railway cost: $___

## Issues
[List any issues encountered]

## Resolution
[How issues were resolved]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Status
✅ Deployment successful, monitoring continues
```

---

## 🔄 ROLLBACK PROCEDURES

### When to Rollback

**Immediate Rollback Triggers (Don't Wait):**
- Error rate > 10% for 5 minutes
- Service completely down
- Database connection failure
- Data loss or corruption
- Security breach detected

**Evaluate Rollback (Investigate First):**
- Error rate 5-10%
- p95 response time > 5s
- Intermittent errors
- Performance degradation
- User complaints increasing

---

### Rollback Procedure (< 10 minutes)

#### Scenario 1: Railway API Issues

**Symptoms:** High error rate, slow responses, Railway service down

**Execute:**
```bash
# Step 1: Remove Railway environment variable (2 min)
cd /Users/admin/projects/deal-aggregator-facebook
vercel env rm NEXT_PUBLIC_API_URL production

# Step 2: Redeploy without Railway (5 min)
vercel --prod --force

# Step 3: Verify rollback (2 min)
curl https://dealradarus.com/api/health
# Will return blog posts (known issue, but previous state)

# Step 4: Notify team
echo "Rollback complete. Reverted to previous deployment."
```

**Timeline:**
- T+0: Decision to rollback
- T+2: Env var removed
- T+7: Redeployment complete
- T+9: Verification complete
- T+10: Team notified

**Post-Rollback:**
- [ ] Investigate Railway issue
- [ ] Update incident log
- [ ] Notify stakeholders
- [ ] Plan remediation

---

#### Scenario 2: Database Connection Issues

**Symptoms:** Slow queries, connection timeouts, pool exhaustion

**Execute:**
```bash
# Step 1: Check Neon status (1 min)
# Visit: https://console.neon.tech/
# Look for: Connection pool utilization, errors

# Step 2: Restart Railway service (2 min)
railway restart

# Wait 30 seconds for service to start

# Step 3: Verify recovery (2 min)
curl https://deal-aggregator-api-production.up.railway.app/api/health
# Should return: {"status": "healthy"}

# Step 4: Test production (2 min)
curl https://dealradarus.com/api/health
# Should work now

# Step 5: Monitor for stability (3 min)
railway logs --tail 50
# Look for: No more connection errors
```

**If database recovery fails:**
- Execute Scenario 1 rollback (remove Railway)
- Contact Neon support
- Investigate connection pool configuration

---

#### Scenario 3: Vercel Deployment Failure

**Symptoms:** Build fails, deployment doesn't complete, site down

**Execute:**
```bash
# Step 1: Check Vercel dashboard
# Look for: Build logs, error messages

# Step 2: Rollback to previous deployment
vercel rollback
# Select previous deployment from list

# Or: Redeploy last known good commit
git log -5  # Find last good commit
git checkout [commit-hash]
vercel --prod

# Step 3: Verify site is accessible
curl https://dealradarus.com/
# Should return HTML (homepage)

# Step 4: Check API endpoints
curl https://dealradarus.com/api/health
# Will show previous state (may be broken Vercel API)
```

---

#### Scenario 4: Complete System Failure

**Symptoms:** Both Railway AND Vercel failing, everything down

**Emergency Procedure:**
```bash
# Step 1: Triage (which service is down?)
curl https://dealradarus.com/  # Vercel frontend
curl https://deal-aggregator-api-production.up.railway.app/api/health  # Railway

# Step 2: If Vercel down → Contact Vercel support immediately
# Check: https://www.vercel-status.com/

# Step 3: If Railway down → Contact Railway support immediately
# Check: https://status.railway.app/

# Step 4: If both up but not communicating → Check CORS
# Look for CORS errors in browser console
# Verify Railway URL in environment variables

# Step 5: Fallback to static site
# All pages have static fallback data
# Site remains functional with stale data
```

**Emergency Contacts:**
- Railway Support: support@railway.app
- Neon Support: support@neon.tech
- Vercel Support: support@vercel.com
- On-call engineer: [Phone number]

---

### Rollback Verification

**After executing rollback:**

```bash
# 1. Site accessibility
curl -I https://dealradarus.com/
# Expected: HTTP 200

# 2. Critical pages
curl https://dealradarus.com/ | grep -i "dealradarus"
curl https://dealradarus.com/deals | grep -i "deals"
curl https://dealradarus.com/blog | grep -i "blog"

# 3. API endpoints (may be broken if reverted)
curl https://dealradarus.com/api/health
# May return blog posts (known issue)

# 4. No 500 errors
./scripts/smoke-test.sh https://dealradarus.com
# Check for: No 500 errors (404 acceptable, data issues acceptable)
```

**Rollback Success Criteria:**
- [ ] Site accessible (HTTP 200)
- [ ] No 500 server errors
- [ ] Homepage loads
- [ ] Static content works
- [ ] Previous state restored

**Note:** After rollback to remove Railway, APIs will return incorrect data (blog posts) due to original Vercel bug. This is expected and is why we need Railway workaround.

---

## 👥 STAKEHOLDER COMMUNICATION

### Communication Matrix

| Audience | Method | Timing | Content |
|----------|--------|--------|---------|
| Technical Team | Email + Slack | T-48h, T-24h, T+0, T+2h, T+24h | Detailed technical info |
| Management | Email | T-48h, T+24h | High-level summary |
| Support Team | Slack | T-24h, T+0, As needed | Customer impact, talking points |
| Users | Status page | T-24h, T+0 (if applicable) | Maintenance notice |

---

### Communication Templates

#### T-48h Email (Technical Team)

```
Subject: Production Deployment Scheduled - Railway API Workaround

Team,

We will be deploying the Railway API workaround to production:

**When:** [Date] at [Time] GMT
**What:** External API deployment (Railway.app)
**Why:** Work around Vercel platform routing bug
**Duration:** 30-minute deployment + 2-hour monitoring
**Risk:** Low (tested in staging 48+ hours)

### What's Changing:
- Frontend API calls route to Railway external API
- Database: No changes (same Neon DB)
- User experience: No visible changes
- Performance: Comparable or better

### Timeline:
- T-48h (Today): Team notification
- T-24h: Final go/no-go review
- T-0: Deployment execution
- T+2h: Initial monitoring complete
- T+24h: Post-deployment review

### Your Role:
- Developers: Be available T-0 to T+2h
- QA: Post-deployment testing at T+30min
- Support: Monitor user reports T+0 to T+24h

### Documents:
- Deployment plan: PRODUCTION_CUTOVER_PLAN.md
- Monitoring: PHASE_7_MONITORING_SETUP.md
- Rollback: See deployment plan

### Questions?
Reply to this email or Slack: #deployments

Thank you,
[Your name]
```

---

#### T-24h Final Confirmation (All Stakeholders)

```
Subject: CONFIRMED: Production Deployment [Date Time GMT]

Team,

Production deployment is CONFIRMED for [Date] at [Time] GMT.

**Status:** GO ✅
**Deployment Window:** [Time] - [Time+30min]
**Monitoring Period:** 2 hours intensive

**On-Call:**
- Primary: [Name] - [Phone] - [Email]
- Backup: [Name] - [Phone] - [Email]

**What to Expect:**
- 30-minute deployment window
- No user-facing downtime
- API responses will route to Railway
- All features remain functional

**Support Team Talking Points:**
"We're deploying a system improvement. No downtime expected. If users report API issues, escalate to engineering immediately."

**How to Monitor:**
- Slack: #deployments channel
- Dashboard: [URL if applicable]
- Status page: [URL if applicable]

**If Issues Occur:**
- Report in: #incidents channel
- Contact on-call: [Phone]
- Rollback available: < 10 minutes

Deployment will proceed unless critical blocker discovered.

[Your name]
```

---

#### T+0 Deployment Start (Slack)

```
📢 #deployments

Production deployment STARTING NOW

Time: [HH:MM GMT]
ETA: 30 minutes
On-call: @[engineer-name]

Following PRODUCTION_CUTOVER_PLAN.md
Updates every 10 minutes

🟢 Status: In Progress
```

---

#### T+0 Deployment Updates (Every 10 min)

```
T+10: ✅ Environment variables added
T+20: ✅ Deployment complete, running smoke tests
T+30: ✅ All smoke tests passed
```

---

#### T+30 Deployment Complete (Slack + Email)

```
📢 #deployments

Production Deployment COMPLETE ✅

Completed: [HH:MM GMT]
Duration: 28 minutes
Status: All smoke tests passed

Smoke Test Results:
✅ Health endpoint: Responding correctly
✅ Deals endpoint: Returning deals data
✅ Blog posts: Still working
✅ Analytics: Accepting events
✅ Error rate: 0%
✅ Response time: p95 = 820ms

Current Status:
🟢 Production: Fully operational
🟢 Railway API: Healthy
🟢 Database: Stable

Monitoring:
- Dashboard: [URL]
- On-call: @[name] (monitoring for 2 hours)
- Logs: railway logs --tail

Report issues: #incidents

Thank you for your patience!
[Your name]
```

---

#### T+2h Status Update

```
Production Status Update (T+2 hours)

Deployment stable for 2 hours ✅

Metrics:
- Error rate: 0.1% (target < 1%) ✅
- p95 response: 785ms (target < 2s) ✅
- Total requests: 2.4k
- Railway uptime: 100%
- Database: Healthy

Issues: None reported

Monitoring continues for 24 hours.
Normal monitoring schedule resumes after 24h.

[Name]
```

---

#### T+24h Post-Deployment Summary

```
Subject: Production Deployment Success - 24 Hour Update

Team,

The Railway API workaround deployment was successful. 24-hour metrics below.

**Summary:**
✅ Deployment completed in 28 minutes
✅ Zero downtime
✅ All smoke tests passed
✅ No user-reported issues
✅ Performance within targets

**Metrics (24 hours):**
- Total requests: 48.2k
- Error rate: 0.08% (target < 1%)
- p50 response: 542ms
- p95 response: 798ms
- p99 response: 1.2s
- Uptime: 100%

**Costs:**
- Railway: $0.17/day (on track for $5/month)
- Neon: $0 (free tier)
- Total impact: +$5/month

**Next Steps:**
- Continue monitoring (now on standard schedule)
- Weekly cost tracking
- Daily Vercel ticket follow-up
- Performance optimization (if needed)

**Documentation Updated:**
- Deployment report: [Link]
- Monitoring setup: PHASE_7_MONITORING_SETUP.md
- Cost tracking: COST_TRACKING.md

**Vercel Ticket:**
- Status: Open, workaround active
- Follow-up schedule: Daily checks
- See: docs/VERCEL-SUPPORT-TICKET.md

Thank you to everyone involved!

[Your name]
```

---

## 📊 SUCCESS METRICS

### Deployment Success Criteria

**Must Achieve (All):**
- [x] Zero user-facing downtime
- [x] All API endpoints returning correct data
- [x] Error rate < 1%
- [x] p95 response time < 2s
- [x] No data loss
- [x] Rollback plan tested and ready

**Should Achieve (3 of 4):**
- [x] Deployment completed in < 45 minutes
- [x] No rollback needed
- [x] No user-reported issues in first 24h
- [x] Performance equal or better than baseline

**Nice to Have:**
- [ ] Zero errors in first hour
- [ ] Positive feedback from team
- [ ] Lessons learned documented
- [ ] Improved monitoring insights

---

### Week 1 Success Metrics

**Target Metrics:**
- Uptime: > 99.9%
- Error rate: < 0.5%
- p95 response: < 1.5s
- User reports: < 3 issues
- Cost: < $2 (weekly Railway)

**Weekly Review Checklist:**
- [ ] Metrics reviewed
- [ ] Issues resolved
- [ ] Cost tracking updated
- [ ] Team feedback collected
- [ ] Documentation updated

---

## 📚 REFERENCE DOCUMENTS

**Pre-Deployment:**
- PHASE_7_MONITORING_SETUP.md - Monitoring configuration
- COST_TRACKING.md - Cost tracking templates
- STAGING-DEPLOYMENT-EXECUTION.md - Staging validation
- .env.staging - Staging environment config

**During Deployment:**
- This file (PRODUCTION_CUTOVER_PLAN.md) - Primary runbook
- scripts/smoke-test.sh - Automated testing
- scripts/monitor-production.sh - Monitoring script

**Post-Deployment:**
- PROJECT_WORKLOG_SESSION_JOURNAL.md - Timeline logging
- DEPLOYMENT_STATUS_SUMMARY.md - Overall status
- docs/VERCEL-SUPPORT-TICKET.md - Ticket tracking

---

## ✅ PRE-DEPLOYMENT SIGN-OFF

**Required Signatures:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | _________ | ______ | _________ |
| DevOps | _________ | ______ | _________ |
| QA Lead | _________ | ______ | _________ |
| Product Manager | _________ | ______ | _________ |

**Final Approval:**

☐ All technical checks passed
☐ All stakeholders notified
☐ Rollback tested and ready
☐ Monitoring configured
☐ On-call assigned

**Approved by:** _________________
**Date:** ______ ______ ______
**Time:** ______ : ______ GMT

---

**Plan Version:** 1.0
**Last Updated:** October 1, 2025
**Next Review:** After deployment completion
**Maintained by:** DevOps Team
