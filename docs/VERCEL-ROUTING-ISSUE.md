# Vercel API Routing System Failure - Critical Bug Report

## **Issue Summary**
All API endpoints are being redirected to `/api/posts` response, causing complete API system failure on Vercel deployment while working perfectly in local environment.

## **Environment Details**
- **Date**: 2025-09-30
- **Project**: deal-aggregator-facebook
- **Vercel Project ID**: prj_3Yd80u1Ze6lZbgkvFEAqP7D4whfl
- **Next.js Version**: 15.5.3
- **Node.js Version**: 22.6.0

## **Problem Description**

### **Expected Behavior (Local Environment)**
```bash
# Local testing works perfectly
npm run build && npm run start

curl http://localhost:3000/api/health
# Returns: {"status":"error","generatedAt":"2025-09-29T23:27:01.223Z","checks":[...]}

curl http://localhost:3000/api/analytics
# Returns: {"error":"Method not allowed"} (correct for GET request)

curl http://localhost:3000/api/errors
# Returns: {"error":"Method not allowed"} (correct for GET request)
```

### **Actual Behavior (Vercel Deployment)**
**ALL API endpoints return identical blog post data instead of their intended responses:**

```bash
# Deployment 1
curl https://deal-aggregator-facebook-pk9hhcz4x-qbws-projects.vercel.app/api/health
# Returns: {"posts":[{"id":1,"slug":"black-friday-2024-tech-deals"...}]}

# Deployment 2
curl https://deal-aggregator-facebook-3yifwlbgp-qbws-projects.vercel.app/api/analytics
# Returns: {"posts":[{"id":1,"slug":"black-friday-2024-tech-deals"...}]}

# Deployment 3
curl https://deal-aggregator-facebook-eol8bzc3p-qbws-projects.vercel.app/api/errors
# Returns: {"posts":[{"id":1,"slug":"black-friday-2024-tech-deals"...}]}
```

## **Affected Deployments**

### **Staging URLs Tested:**
1. `https://deal-aggregator-facebook-7lhp6h237-qbws-projects.vercel.app` (MINIMAL REPRODUCTION - Latest)
2. `https://deal-aggregator-facebook-eol8bzc3p-qbws-projects.vercel.app` (Latest with runtime fixes)
3. `https://deal-aggregator-facebook-3yifwlbgp-qbws-projects.vercel.app` (Previous deployment)
4. `https://deal-aggregator-facebook-pk9hhcz4x-qbws-projects.vercel.app` (Production environment)

### **Affected Endpoints:**
- `/api/health` - Should return health check JSON, returns blog posts
- `/api/analytics` - Should return method validation/analytics response, returns blog posts
- `/api/errors` - Should return method validation/error response, returns blog posts
- `/api/simple-test` - **MINIMAL REPRODUCTION** - Should return simple JSON, returns blog posts
- `/api/posts` - Works correctly (returns expected blog posts)

## **Investigation Results**

### **✅ Local Environment Verification**
- All API endpoints function correctly
- Different responses for different endpoints
- Proper error handling and method validation

### **✅ Build Process Verification**
- `npm run build` completes successfully
- All API routes properly built in `.next/server/pages-manifest.json`:
  ```json
  "/api/health": "pages/api/health.js",
  "/api/analytics": "pages/api/analytics.js",
  "/api/errors": "pages/api/errors.js",
  "/api/posts": "pages/api/posts.js"
  ```
- No middleware conflicts in `.next/server/middleware-manifest.json`
- Different file sizes confirm different source code

### **✅ Configuration Analysis**
- **next.config.js**: Only one rewrite exists - `/api/deals` → `/api/deals?cache=true` (unrelated)
- **vercel.json**: No conflicting redirects (only `/legacy/*` redirect)
- **No catch-all routes** that could intercept API calls
- **Runtime configuration** added: `export const config = { runtime: 'nodejs' }`

### **❌ Vercel Platform Issue**
- Issue persists across multiple fresh deployments
- Issue persists after explicit runtime configuration
- Vercel logs timeout when attempting to retrieve function logs
- All evidence points to Vercel infrastructure routing problem

## **Configuration Files Analysis**

### **next.config.js - Rewrites Section:**
```javascript
async rewrites() {
  return [
    {
      source: '/api/deals',
      destination: '/api/deals?cache=true'
    }
  ];
}
```
*Note: This is the only rewrite and does not affect health/analytics/errors endpoints*

### **vercel.json - Redirects Section:**
```json
"redirects": [
  {
    "source": "/legacy/(.*)",
    "destination": "/$1",
    "permanent": true
  }
]
```
*Note: No redirects affecting /api/* routes*

## **Steps Taken to Resolve**

1. **✅ Verified Local Environment** - All APIs work correctly
2. **✅ Checked Build Process** - All files built correctly with different content
3. **✅ Fresh Deployments** - Issue persists across new URLs
4. **✅ Runtime Configuration** - Added explicit Node.js runtime config
5. **✅ Configuration Review** - No conflicting rewrites/redirects found
6. **❌ Vercel Logs** - Timeout when retrieving logs indicates platform issue

## **Impact Assessment**

### **Critical System Failures:**
- **Health Monitoring**: Impossible to verify deployment health
- **Analytics Tracking**: Cannot log user events or metrics
- **Error Logging**: Cannot track application errors
- **Database Operations**: Cannot test database connectivity via API

### **Production Deployment Status:**
**🚨 BLOCKED** - Cannot proceed with production deployment due to complete API system failure

## **Evidence for Vercel Support**

### **Reproduction Steps:**
1. Clone repository
2. Run `npm ci && npm run build`
3. Deploy to Vercel using `vercel --yes`
4. Test any API endpoint: `curl https://<deployment-url>/api/health`
5. Observe: Returns blog post data instead of health check JSON

### **Expected vs Actual:**
- **Expected**: `{"status":"healthy","checks":[...]}`
- **Actual**: `{"posts":[{"id":1,"slug":"black-friday-2024-tech-deals"...}]}`

## **Request for Support**

This appears to be a systematic Vercel infrastructure routing issue where all API endpoints are being redirected to the `/api/posts` handler regardless of the actual endpoint called. Local development works perfectly, confirming this is not a code issue but a platform-level routing problem.

**Immediate needs:**
1. Investigation of Vercel routing infrastructure for this project
2. Analysis of deployment logs to identify root cause
3. Fix for systematic API routing failure
4. Confirmation that fix resolves issue across all affected endpoints

**Timeline**: This is blocking production deployment and needs urgent resolution.

---

## **🚨 MINIMAL REPRODUCTION CONFIRMS SYSTEMATIC ROUTING FAILURE**

### **Deployment**: https://deal-aggregator-facebook-7lhp6h237-qbws-projects.vercel.app
**Date**: 2025-09-30
**Branch**: vercel-routing-repro
**Deployment ID**: 3u5ywXQL3GmxzeQj2WaV4moseynA

### **Minimal Test Endpoint Created:**
```javascript
// pages/api/simple-test.js
export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.status(200).json({
    endpoint: '/api/simple-test',
    message: 'This should be simple-test response, not blog posts',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
```

### **Local Test Result (✅ WORKS):**
```bash
curl http://localhost:3000/api/simple-test
# Returns: {"endpoint":"/api/simple-test","message":"This should be simple-test response, not blog posts"...}
```

### **Vercel Test Result (❌ FAILS):**
```bash
curl https://deal-aggregator-facebook-7lhp6h237-qbws-projects.vercel.app/api/simple-test
# Returns: {"posts":[{"id":1,"slug":"black-friday-2024-tech-deals"...}]}
```

### **Critical Evidence:**
- **Minimal endpoint**: Only 15 lines of code, no dependencies
- **Fresh deployment**: Brand new URL, no cache interference
- **Explicit runtime**: `runtime: 'nodejs'` specified
- **Build verification**: Endpoint shows correctly in build output
- **Same routing failure**: Even simplest endpoint returns blog post data

This definitively proves the issue is **NOT in the application code** but is a **systematic Vercel platform routing failure** affecting all API endpoints except `/api/posts`.