# Incident Report: Vercel API Routing Bug

**Date**: October 7, 2025
**Status**: RESOLVED ✅
**Severity**: CRITICAL
**Duration**: 6+ hours (investigation + resolution)
**Impact**: All API endpoints returning incorrect data (blog posts)

---

## 📋 Executive Summary

All API endpoints on Vercel production were returning blog post data instead of their correct responses. Root cause was a conflicting `./api` directory at project root that interfered with Next.js's `pages/api/` routing structure.

**Resolution**: Created new Vercel project, renamed conflicting directory to `api.old`, redeployed. 100% success rate achieved.

---

## 🔴 Symptoms

### What Users Saw:
- `/api/health` endpoint returned blog posts instead of health check data
- `/api/diagnostic` endpoint returned blog posts instead of diagnostic info
- All API endpoints returned identical blog post JSON response
- Only `/api/posts` worked correctly (because it WAS serving posts)

### Technical Symptoms:
```bash
# Expected response from /api/health:
{"status":"healthy","checks":[...]}

# Actual response (WRONG):
{"success":true,"posts":[{"id":1,"title":"Best Refurbished MacBook Deals",...}]}
```

### Impact:
- 🔴 API health monitoring broken
- 🔴 Diagnostic endpoints non-functional
- 🔴 Potential data inconsistency for clients
- 🔴 All non-posts API endpoints compromised

---

## 🔍 Root Cause Analysis

### The Problem:

Project had **TWO** API directory structures:

```
deal-aggregator-facebook/
├── api/                    ❌ CONFLICTING DIRECTORY (old/demo files)
│   ├── hello.js
│   ├── contact.js
│   ├── posts.js
│   └── posts/[slug].js
│
└── pages/
    └── api/                ✅ CORRECT Next.js API routes
        ├── health.js
        ├── posts.js
        ├── diagnostic.js
        └── ...
```

### Why This Caused Issues:

1. **Vercel's Build Process**: Scans for ALL directories named "api" in project
2. **Multiple Sources**: Built serverless functions from BOTH `./api` AND `./pages/api`
3. **Routing Conflict**: When both directories had overlapping routes, Vercel prioritized `./api`
4. **Cross-Contamination**: Endpoints in `pages/api/` were overshadowed by `./api` files

### Evidence from `vercel inspect`:

```bash
$ vercel inspect https://[deployment-url]

Builds:
├── λ api/hello (3.7KB) [iad1]              # ❌ PHANTOM - not in source
├── λ api/posts/[slug] (27.49KB) [iad1]     # ❌ PHANTOM - not in source
├── λ api/contact (2.1KB) [iad1]            # ❌ PHANTOM - not in source
├── λ api/health (4.2KB) [iad1]             # ✅ Should exist
├── λ api/posts (5.8KB) [iad1]              # ✅ Should exist
```

The "phantom routes" from `./api` directory confirmed the conflict.

---

## 🛠️ Resolution Steps

### Step 1: Investigation (3 hours)
- ✅ Fixed smoke test script to handle errors gracefully
- ✅ Created minimal reproduction project
- ✅ Tested local builds (worked correctly)
- ✅ Used `vercel inspect` to examine build artifacts
- ✅ Discovered phantom routes from hidden directory

### Step 2: Root Cause Identification (1 hour)
```bash
# Found conflicting directory
find . -type d -name "api" 2>/dev/null | grep -v node_modules
# Output showed: ./api (the culprit!)

# Verified contents
ls -la ./api/
# Found old demo files: hello.js, contact.js, posts/[slug].js
```

### Step 3: Solution Implementation (2 hours)
```bash
# 1. Created new Vercel project
vercel --project-name deal-aggregator-facebook-v2

# 2. Renamed conflicting directory
mv api api.old

# 3. Redeployed to production
vercel --prod --yes

# 4. Verified success
curl https://deal-aggregator-facebook-v2.vercel.app/api/health
# ✅ Returns correct health check data

curl https://deal-aggregator-facebook-v2.vercel.app/api/diagnostic
# ✅ Returns correct diagnostic data
```

### Step 4: Verification (30 minutes)
- ✅ Tested all 14 critical endpoints
- ✅ Verified page routes (6/6 passed)
- ✅ Confirmed dynamic routes working
- ✅ Validated security headers
- ✅ Checked performance metrics
- **Result**: 100% success rate

---

## 📊 Test Results After Fix

| Endpoint | Before | After | Status |
|----------|--------|-------|--------|
| `/api/health` | Returns posts ❌ | Returns health check ✅ | FIXED |
| `/api/diagnostic` | Returns posts ❌ | Returns diagnostic ✅ | FIXED |
| `/api/posts` | Works ✅ | Works ✅ | OK |
| `/api/hello` | Exists (shouldn't) ⚠️ | 404 (correct) ✅ | FIXED |
| `/` | Works ✅ | Works ✅ | OK |
| `/deals` | Works ✅ | Works ✅ | OK |
| `/blog` | Works ✅ | Works ✅ | OK |

---

## 🎓 Lessons Learned

### For Developers:

1. **Next.js Project Structure Rules**:
   - ✅ ONLY use `pages/api/` for API routes
   - ❌ NEVER create `./api` directory at project root
   - ❌ NEVER create multiple API directories

2. **Vercel-Specific Gotchas**:
   - Vercel scans entire project for "api" directories
   - Multiple API directories cause routing conflicts
   - Build artifacts may differ from local development
   - Always use `vercel inspect` to verify builds

3. **Debugging Techniques**:
   - Use `vercel inspect [url]` to see actual build output
   - Create minimal reproductions to isolate issues
   - Compare local builds with production builds
   - Check for "phantom routes" that don't exist in source

### For Operations:

4. **Monitoring**:
   - Smoke tests should validate RESPONSE CONTENT, not just status codes
   - Test endpoints should return unique identifiable data
   - Monitor for cross-contamination between endpoints

5. **Deployment Safety**:
   - Test in staging environment first
   - Validate all API endpoints after deployment
   - Keep old deployment active during verification
   - Document rollback procedures

---

## 🚫 Prevention Guidelines

### Project Structure Requirements:

```markdown
✅ CORRECT Structure:
project/
└── pages/
    └── api/
        ├── health.js
        ├── posts.js
        └── ...

❌ WRONG Structure:
project/
├── api/              ❌ Don't do this!
│   └── ...
└── pages/
    └── api/
        └── ...
```

### Code Review Checklist:

- [ ] No `./api` directory at project root
- [ ] No `./server/api` exposed to Vercel build
- [ ] No conflicting route names across directories
- [ ] All API routes in `pages/api/` only

### Pre-Deployment Checklist:

```bash
# 1. Verify no conflicting directories
find . -type d -name "api" | grep -v node_modules | grep -v .next

# Should only show: ./pages/api

# 2. Test build locally
npm run build
ls -la .next/server/pages/api/

# 3. Test deployment on staging
vercel --prod=false
vercel inspect [staging-url]

# 4. Run comprehensive smoke tests
./scripts/smoke-test.sh [staging-url]
```

---

## 📚 Reference Materials

### Investigation Reports:
- `/tmp/FINAL_SUCCESS_REPORT.md` - Complete validation report
- `/tmp/vercel_routing_bug_comprehensive_report.md` - Full investigation timeline
- `PROJECT_WORKLOG_SESSION_JOURNAL.md` - Session notes

### Commands Used:
```bash
# Inspect Vercel build
vercel inspect [deployment-url]

# Check build artifacts locally
npm run build && ls -la .next/server/pages/

# Find conflicting directories
find . -type d -name "api" 2>/dev/null | grep -v node_modules

# Test endpoint responses
curl -i https://[domain]/api/[endpoint]

# Deploy with force rebuild
vercel --prod --force --yes
```

### Useful Links:
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Build Output API](https://vercel.com/docs/build-output-api/v3)

---

## 📞 Related Documentation

- Project Structure Guidelines: `docs/PROJECT_STRUCTURE.md` (to be created)
- Deployment Runbook: `docs/DEPLOYMENT.md` (to be created)
- Troubleshooting Guide: `docs/TROUBLESHOOTING.md` (to be created)

---

## ✅ Resolution Status

**Current Production**: https://deal-aggregator-facebook-v2.vercel.app
**Old Project**: deal-aggregator-facebook (deprecated)
**Git Commit**: 70581bb (fix: resolve Vercel API routing bug)

**Verification Date**: October 7, 2025
**Verified By**: Full Feature Validation (14/14 tests passed)
**Status**: ✅ RESOLVED - Production Ready

---

**Last Updated**: October 7, 2025
**Document Owner**: Development Team
**Review Date**: October 14, 2025 (1 week follow-up)
