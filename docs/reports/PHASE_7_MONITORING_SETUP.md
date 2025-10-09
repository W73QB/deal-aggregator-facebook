# Phase 7: Production Monitoring & Cutover Guide

## 🎯 Overview

**Duration:** 2-3 days
**Status:** Ready for Execution
**Prerequisites:** Phase 6 staging deployment successful

---

## 📊 PART 1: RAILWAY MONITORING SETUP (2-3 hours)

### 1.1 Access Railway Dashboard

**Navigation:**
1. Visit: https://railway.app/project/7e8dda6e-081d-48de-b60a-8ff1b5b081c0
2. Login with: hoanggiangwqb@gmail.com
3. Select Service: `deal-aggregator-api-production`
4. Click: **Observability** tab

---

### 1.2 Configure Monitoring Alerts

**Alert Configuration Table:**

| Alert Name | Metric | Threshold | Notification | Priority |
|------------|--------|-----------|--------------|----------|
| **Response Time** | p95 latency | > 5000ms for 5min | Email + Slack | HIGH |
| **Error Rate** | 5xx errors | > 5% over 5min | Email + Slack | CRITICAL |
| **CPU Usage** | CPU percentage | > 80% for 10min | Email | MEDIUM |
| **Memory Usage** | RAM percentage | > 90% for 5min | Email + Slack | HIGH |
| **DB Connection Errors** | Connection failures | > 0 in 5min | Email + Slack | CRITICAL |
| **Service Health** | Health check | 2 consecutive fails | SMS + Email | CRITICAL |
| **Request Rate Spike** | Requests/sec | > 200% baseline | Email | MEDIUM |
| **Service Restarts** | Restart count | > 3 per hour | Email | HIGH |

---

### 1.3 Setup Instructions (Railway Dashboard)

**Step-by-step:**

```markdown
1. Navigate to: Settings → Notifications
2. Click: "Add Alert Rule"
3. For each alert in table above:
   a. Name: [Alert Name from table]
   b. Metric: [Select from dropdown]
   c. Condition: [Threshold from table]
   d. Duration: [Time period from table]
   e. Notify via: [Notification channels]
   f. Click: "Create Alert"
4. Test each alert: Click "Test Notification"
5. Screenshot: Save to docs/screenshots/railway-alerts.png
```

---

### 1.4 Notification Channels Setup

**Email Notifications:**
```bash
# Primary contact
Email: hoanggiangwqb@gmail.com
Verified: ✅ (during Railway signup)
```

**Slack Integration (Optional but Recommended):**
```markdown
1. Create Slack webhook:
   - Go to: https://api.slack.com/apps
   - Create app: "Railway Alerts"
   - Add Incoming Webhook
   - Copy webhook URL

2. In Railway:
   - Settings → Integrations
   - Add Webhook
   - Paste Slack webhook URL
   - Test notification

3. Example alert in Slack:
   ```
   🚨 Railway Alert: Response Time
   Service: deal-aggregator-api-production
   Metric: p95 latency = 6200ms
   Threshold: > 5000ms
   Time: 2025-10-01 15:30:00 GMT
   Action: Investigate immediately
   ```
```

---

### 1.5 Railway CLI Monitoring Commands

**Real-time Monitoring:**
```bash
# Tail logs (run in separate terminal)
railway logs --tail 100

# Filter errors and warnings
railway logs --tail 50 | grep -E "ERROR|WARN|CRITICAL"

# Service status check
railway status

# JSON output for parsing
railway status --json | jq '{status: .status, health: .health, uptime: .uptime}'

# Usage metrics
railway usage --json | jq '{compute: .compute, bandwidth: .bandwidth}'
```

**Create monitoring script:**
```bash
#!/bin/bash
# scripts/check-railway-status.sh

echo "🔍 Railway Service Health Check"
echo "================================"

railway status --json | jq '{
  service: "deal-aggregator-api-production",
  status: .status,
  health: .health,
  uptime_minutes: .uptime,
  last_deploy: .lastDeploy,
  memory_mb: .memory,
  cpu_percent: .cpu
}'

echo ""
echo "📊 Recent Error Logs:"
railway logs --tail 20 | grep -E "ERROR|FATAL" || echo "No errors found ✅"
```

**Make executable:**
```bash
chmod +x scripts/check-railway-status.sh
```

---

## 🗄️ PART 2: NEON DATABASE MONITORING (1 hour)

### 2.1 Access Neon Dashboard

**Navigation:**
1. Visit: https://console.neon.tech/
2. Login with: hoanggiangwqb@gmail.com
3. Select Project: [Your project name]
4. Go to: **Monitoring** tab

---

### 2.2 Neon Metrics to Monitor

**Critical Metrics:**

| Metric | Current Baseline | Alert Threshold | Action |
|--------|------------------|-----------------|--------|
| **Connection Pool Usage** | 2-5 connections | > 16/20 (80%) | Scale pooler |
| **Database Size** | ~512 MB | > 2.5 GB (83% of 3GB) | Cleanup or upgrade |
| **Compute Hours** | ~68h/month | > 250h (83% of 300h) | Review queries |
| **Data Transfer** | ~1.5 GB/month | > 4 GB (80% of 5GB) | Optimize queries |
| **Query Duration** | p95: 71ms | > 1000ms | Index optimization |
| **Active Connections** | 2-5 | > 15 | Connection leak |

---

### 2.3 Neon Monitoring Setup

**Weekly Checks (15 minutes):**
```markdown
1. Dashboard → Usage → Review metrics
2. Check: Storage usage trend (growing?)
3. Check: Compute hours consumption rate
4. Check: Data transfer patterns
5. Check: Slow query log (if available)
6. Screenshot: Save weekly snapshot
7. Update: COST_TRACKING.md (see Part 3)
```

**Query Performance Monitoring:**
```sql
-- Run in Neon SQL Editor

-- Check connection pool status
SELECT
  count(*) as active_connections,
  max(pg_stat_activity.backend_start) as oldest_connection
FROM pg_stat_activity
WHERE state = 'active';

-- Check slow queries (if pg_stat_statements enabled)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Database size
SELECT
  pg_size_pretty(pg_database_size(current_database())) as db_size;
```

---

### 2.4 Neon Alerting Strategy

**Manual Checks (until automated alerts available):**

```markdown
## Neon Weekly Checklist

**Week of:** [Date]
**Checked by:** [Name]
**Date:** [YYYY-MM-DD]

### Storage
- [ ] Current size: _____ MB / 3000 MB
- [ ] Growth rate: _____ MB/week
- [ ] Projected to limit: _____ weeks
- [ ] Action needed: ☐ Yes ☐ No

### Compute
- [ ] Hours used: _____ / 300 hours
- [ ] Daily average: _____ hours
- [ ] Projected month total: _____ hours
- [ ] Action needed: ☐ Yes ☐ No

### Performance
- [ ] Average query time: _____ ms
- [ ] Slow queries (>1s): _____ count
- [ ] Connection errors: _____ count
- [ ] Action needed: ☐ Yes ☐ No

### Notes:
[Any observations, trends, or concerns]
```

---

## 💰 PART 3: COST & PERFORMANCE TRACKING (1 hour setup + 15 min/week)

### 3.1 Capture Current Baseline

**Execute NOW (save outputs):**

```bash
# 1. Railway baseline
railway status --json > docs/baseline/railway-status-$(date +%Y%m%d).json
railway usage --json > docs/baseline/railway-usage-$(date +%Y%m%d).json

# Create baseline directory
mkdir -p docs/baseline

# 2. Performance baseline (from Phase 5)
cat > docs/baseline/performance-baseline.txt <<EOF
# Performance Baseline - October 1, 2025
# Source: Phase 5 load testing (ab -n 100 -c 10)

Railway API Response Times:
- p50 (median): 550ms
- p66: 561ms
- p75: 588ms
- p80: 600ms
- p90: 666ms
- p95: 762ms
- p98: 799ms
- p99: 804ms
- p100 (max): 804ms

Throughput:
- Requests/sec: 12.47
- Time per request: 801.809ms (mean)
- Concurrent requests: 10

Error Rate:
- Total requests: 100
- Failed requests: 92 (length mismatch - expected behavior)
- Success rate: 100% (no actual errors)

Database:
- Connection time: 71ms (from health check)
- Status: healthy
- Uptime: 757 minutes (at time of test)
EOF

# 3. Neon baseline (manual - copy from dashboard)
echo "Take screenshot: Neon Dashboard → Usage → Save as docs/baseline/neon-baseline-$(date +%Y%m%d).png"
```

---

### 3.2 Weekly Cost Tracking Template

**Create tracking file:**
