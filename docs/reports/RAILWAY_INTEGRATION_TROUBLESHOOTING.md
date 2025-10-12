# 🔧 Railway API Integration Troubleshooting Report

**Date**: October 11, 2025
**Engineer**: Claude Code
**Duration**: ~90 minutes
**Status**: 🟡 **PARTIALLY RESOLVED** - Requires Additional Investigation

---

## Executive Summary

Attempted to integrate Railway API with production frontend to replace static fallback data. Multiple fixes were implemented to resolve environment variable resolution issues, but production is still serving static data instead of Railway database content.

### Key Findings

- ✅ **Railway API**: Working perfectly, serving from database
- ❌ **Production Frontend**: Still using static data fallback
- 🔍 **Root Cause**: Environment variable availability in Vercel SSG build context

---

## Problem Statement

After ChatGPT's code review and refactoring, production API endpoint (`https://dealradarus.com/api/deals`) returns:
```json
{
  "source": "static",
  "total": 9
}
```

Expected result (from Railway):
```json
{
  "source": "database",
  "total": 9
}
```

---

## Work Completed

### 1. Code Review & Refactoring ✅

**Commits**:
- `5dda19f` - Refactor: extract API URL resolution and add cookie security
- `971139a` - Fix: resolve API URL at runtime instead of module load time
- `1e9c5fe` - Fix: resolve API base URL at runtime for SSG compatibility
- `b5101df` - Fix: add API_URL fallback for SSG builds on Vercel

**Changes**:
1. Extracted `resolveApiBaseUrl()` to shared utility (`lib/utils/apiConfig.js`)
2. Removed code duplication from `hooks/useDeals.js` and `contexts/AuthContext.js`
3. Added cookie secret support with warning (`server/app.cjs`)
4. Fixed ChatGPT's bugs (source tracking, ReferenceError fixes)

### 2. Environment Variable Configuration ✅

**Vercel Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=https://deal-aggregator-api-production.up.railway.app (Production)
API_URL=https://deal-aggregator-api-production.up.railway.app (Production, server-side)
```

**Local Environment** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://deal-aggregator-api-production.up.railway.app
```

### 3. API Resolution Fixes ✅

**Before** (Module Load Time):
```javascript
// ❌ Resolved during module import, environment vars not available
const API_BASE_URL = resolveApiBaseUrl();
```

**After** (Runtime):
```javascript
// ✅ Resolved during function execution, environment vars available
export const useDeals = (filters = {}) => {
  const API_BASE_URL = resolveApiBaseUrl();
  // ...
}
```

### 4. SSG Build Support ✅

**Updated `lib/utils/apiConfig.js`**:
```javascript
export function resolveApiBaseUrl() {
  // Client-side: NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Server-side SSG: API_URL
  if (typeof window === 'undefined') {
    if (process.env.API_URL) {
      return process.env.API_URL;
    }
    return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';
  }

  // Fallback
  return process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5000/api'
    : '/api';
}
```

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Flow                           │
└─────────────────────────────────────────────────────────────┘

User Request: https://dealradarus.com/deals
                    ↓
            Vercel Edge Network
                    ↓
    Pre-rendered Static Page (from SSG)
                    ↓
        getStaticProps() at Build Time
                    ↓
       fetchDeals() from lib/apiClient.js
                    ↓
         resolveApiBaseUrl() → ???
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
[Expected Path]              [Actual Path?]
Railway API                  Next.js /api/deals
database                     static fallback
```

---

## Verification Results

### Railway API (Direct) ✅
```bash
$ curl https://deal-aggregator-api-production.up.railway.app/api/deals?limit=1

{
  "meta": {
    "source": "database",  ← ✅ Database working
    "total": 9
  }
}
```

### Production Frontend ❌
```bash
$ curl https://dealradarus.com/api/deals

{
  "meta": {
    "source": "static",  ← ❌ Using fallback
    "total": 9,
    "timestamp": "2025-10-11T12:43:00.607Z"
  }
}
```

---

## Potential Remaining Issues

### Issue 1: Vercel Environment Variable Scope

**Problem**: `NEXT_PUBLIC_*` variables may not be available during `getStaticProps` execution on Vercel build servers.

**Evidence**:
- Environment variables added via Vercel CLI
- Code checks for `process.env.API_URL` (server-side)
- Production still returns static data

**Hypothesis**:
1. Vercel may require environment variables to be present BEFORE first deployment
2. Or variables need different configuration for SSG context

### Issue 2: Next.js API Route Called Instead of Railway

**Problem**: Production may still be calling `/api/deals` (Next.js route) instead of Railway.

**Evidence**:
- Next.js route `pages/api/deals.js` has fallback logic
- Fallback returns `source: "static"` when database fails

**Hypothesis**:
```javascript
// In getStaticProps on Vercel:
process.env.API_URL = undefined
process.env.NEXT_PUBLIC_API_URL = undefined
→ resolveApiBaseUrl() returns '/api'
→ calls Next.js route
→ Next.js route database connection fails
→ returns static fallback
```

### Issue 3: Database Connection in Next.js Route

**Problem**: `pages/api/deals.js` may be unable to connect to PostgreSQL from Vercel.

**Reason**: Next.js API routes run on Vercel serverless functions, may lack database credentials.

---

## Recommended Next Steps

### Option A: Verify Environment Variables in Build Logs 🔍

```bash
# Check Vercel build logs to see if API_URL is available
vercel logs <deployment-url>
```

Look for:
- Environment variable values during build
- Any errors about missing Railway URL
- Database connection attempts

### Option B: Force Environment Variable Injection 💉

Add to `next.config.js`:
```javascript
module.exports = {
  env: {
    API_URL: process.env.API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            'https://deal-aggregator-api-production.up.railway.app',
  },
}
```

This ensures Railway URL is baked into build.

### Option C: Switch from SSG to SSR 🔄

Change `pages/deals.js`:
```javascript
// Replace getStaticProps with getServerSideProps
export async function getServerSideProps() {
  const data = await fetchDeals();
  return { props: { dealsData: data } };
}
```

Benefits:
- Environment variables available at request time
- Always fresh data from Railway
- No build-time resolution issues

Drawbacks:
- Slower page load (no pre-rendering)
- Higher serverless function costs

### Option D: Client-Side Data Fetching 🌐

Remove SSG entirely, use `useDeals` hook:
```javascript
export default function Deals() {
  const { deals, loading } = useDeals();
  // ...
}
```

Benefits:
- Definitely uses Railway API (client-side)
- Environment variables available in browser

Drawbacks:
- Worse SEO (no pre-rendered content)
- Slower initial load

---

## Testing Checklist

Before marking as resolved, verify:

- [ ] `curl https://dealradarus.com/api/deals` returns `"source": "database"`
- [ ] Frontend uses Railway API in production
- [ ] SSG pages display database content, not fallback
- [ ] Client-side `useDeals` hook connects to Railway
- [ ] Authentication flow works with Railway API
- [ ] Environment variables available in build logs
- [ ] No database connection attempts to Vercel serverless

---

## Files Modified

```
lib/utils/apiConfig.js       - API URL resolution utility
lib/apiClient.js             - Runtime API base URL
hooks/useDeals.js            - Runtime API resolution in hook
contexts/AuthContext.js      - Uses shared utility
server/app.cjs               - Cookie secret warning
pages/api/deals.js           - Source tracking (ChatGPT fix)
```

---

## Related Documentation

- [ChatGPT Code Review](./CHATGPT_CODE_REVIEW.md) - 6.5/10, approved with conditions
- [Railway Production Cutover Success](../deployment/RAILWAY_PRODUCTION_CUTOVER_SUCCESS.md) - Initial Railway setup

---

## Conclusion

**Status**: 🟡 **IN PROGRESS**

Multiple architectural fixes have been implemented to support Railway API integration:
1. ✅ Runtime API URL resolution
2. ✅ SSG-compatible environment variable checks
3. ✅ Server-side and client-side configuration
4. ✅ Code refactoring (removed duplication)

However, production is still serving static data. The issue appears to be related to **Vercel's environment variable availability during SSG builds**.

**Immediate Action Required**:
1. Check Vercel build logs for environment variable values
2. Consider switching to SSR (`getServerSideProps`) for guaranteed Railway API access
3. Or add explicit Railway URL to `next.config.js` env injection

**Estimated Time to Resolution**: 15-30 minutes with proper Vercel configuration access

---

**Engineer**: Claude Code
**Review Date**: October 11, 2025
**Next Review**: After Vercel build log analysis
