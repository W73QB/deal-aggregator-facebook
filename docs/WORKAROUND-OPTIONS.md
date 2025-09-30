# Vercel API Routing Issue - Workaround Strategies

## Overview

While waiting for Vercel platform team to resolve the systematic API routing issue, we need temporary workarounds to unblock production deployment.

**Issue**: All API endpoints return `/api/posts` response instead of their intended responses.

**Timeline**: Support ticket submitted, awaiting response (48-72 hour SLA)

---

## Option A: External API Deployment (RECOMMENDED)

**Complexity**: Medium
**Timeline**: 2-4 hours
**Cost**: $5-10/month
**Reliability**: High

### Strategy

Deploy API routes to a separate platform while keeping frontend on Vercel.

### Implementation Steps

#### 1. Choose Alternative Platform

**Railway.app** (Recommended):
- Simple deployment
- Automatic HTTPS
- Environment variable management
- $5/month starter plan

**Fly.io** (Alternative):
- Global edge deployment
- Free tier available
- More complex setup

**Render.com** (Alternative):
- Simple like Railway
- Free tier with limitations
- $7/month for production

#### 2. Extract API Routes

```bash
# Create standalone API project
mkdir deal-aggregator-api
cd deal-aggregator-api
npm init -y
npm install express cors dotenv pg

# Copy API handlers
cp -r ../pages/api ./routes/
```

#### 3. Create Express Server

**server.js**:
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://dealradarus.com', 'https://*.vercel.app']
}));
app.use(express.json());

// Import API routes
const healthRouter = require('./routes/health');
const postsRouter = require('./routes/posts');
const analyticsRouter = require('./routes/analytics');
const errorsRouter = require('./routes/errors');
const dealsRouter = require('./routes/deals');

// Mount routes
app.use('/api/health', healthRouter);
app.use('/api/posts', postsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/errors', errorsRouter);
app.use('/api/deals', dealsRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

#### 4. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set DATABASE_URL=postgres://...
railway variables set NODE_ENV=production

# Deploy
railway up
```

#### 5. Update Frontend Configuration

**.env.production**:
```bash
NEXT_PUBLIC_API_URL=https://deal-aggregator-api.railway.app
```

**Update API calls in frontend**:
```javascript
// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
```

### Advantages
- ✅ Complete isolation from Vercel routing issue
- ✅ API works independently
- ✅ Can rollback quickly
- ✅ Simple monitoring and debugging

### Disadvantages
- ❌ Additional hosting cost
- ❌ Two deployments to manage
- ❌ Potential latency (single region vs Vercel edge)
- ❌ CORS configuration needed

---

## Option B: Next.js Middleware Proxy

**Complexity**: Low
**Timeline**: 1-2 hours
**Cost**: $0
**Reliability**: Medium

### Strategy

Use Next.js middleware to proxy API requests to external endpoint.

### Implementation Steps

#### 1. Create Middleware

**middleware.js** (root directory):
```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only proxy API routes
  if (pathname.startsWith('/api/')) {
    const EXTERNAL_API = process.env.EXTERNAL_API_URL;

    if (EXTERNAL_API) {
      // Proxy to external API
      const proxyUrl = `${EXTERNAL_API}${pathname}`;

      return fetch(proxyUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        duplex: 'half'
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

#### 2. Set Environment Variable

```bash
# .env.production
EXTERNAL_API_URL=https://deal-aggregator-api.railway.app
```

#### 3. Deploy

```bash
vercel --prod
```

### Advantages
- ✅ Simple implementation
- ✅ No code changes needed in API handlers
- ✅ Transparent to frontend
- ✅ Can toggle on/off via environment variable

### Disadvantages
- ❌ Still depends on Vercel middleware working correctly
- ❌ Additional latency (Vercel → External API)
- ❌ Requires external API deployment anyway

---

## Option C: Vercel Edge Functions

**Complexity**: Medium
**Timeline**: 2-3 hours
**Cost**: $0 (within limits)
**Reliability**: Unknown (untested)

### Strategy

Convert API routes to Vercel Edge Functions which run on a different runtime.

### Implementation Steps

#### 1. Create Edge Function Version

**api/health.js**:
```javascript
export const config = {
  runtime: 'edge',  // Instead of 'nodejs'
};

export default async function handler(request) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    runtime: 'edge'
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
```

#### 2. Test Edge Runtime

```bash
# Deploy and test
vercel --prod
curl https://dealradarus.com/api/health
```

### Advantages
- ✅ No additional hosting needed
- ✅ Edge network performance
- ✅ Different runtime might bypass issue

### Disadvantages
- ❌ Unknown if this bypasses the routing issue
- ❌ Edge runtime limitations (no Node.js APIs)
- ❌ Requires rewriting all API handlers
- ❌ Database connections more complex

---

## Option D: Next.js Version Downgrade

**Complexity**: Low
**Timeline**: 1 hour
**Cost**: $0
**Reliability**: Unknown

### Strategy

Test if issue is specific to Next.js 15.x by downgrading to 14.x.

### Implementation Steps

#### 1. Update package.json

```json
{
  "dependencies": {
    "next": "14.2.5"  // Downgrade from 15.5.3
  }
}
```

#### 2. Install and Test

```bash
rm -rf node_modules .next
npm install
npm run build
vercel --prod
```

#### 3. Test API Endpoints

```bash
curl https://dealradarus.com/api/health
curl https://dealradarus.com/api/simple-test
```

### Advantages
- ✅ Quick to test
- ✅ No architecture changes
- ✅ If works, simple solution

### Disadvantages
- ❌ May not solve the issue (likely platform-level)
- ❌ Lose Next.js 15 features
- ❌ Still on Vercel platform with potential issues

---

## Option E: Complete Platform Migration

**Complexity**: High
**Timeline**: 1-2 weeks
**Cost**: Variable
**Reliability**: High

### Strategy

Migrate entire application to alternative platform.

### Platform Options

#### Netlify
- Similar to Vercel
- Different edge network
- $19/month Pro plan

#### AWS Amplify
- Full AWS integration
- More control
- Higher complexity

#### Cloudflare Pages
- Edge network
- Workers for API
- Good performance

### Implementation Steps

1. Choose platform
2. Update deployment configuration
3. Migrate environment variables
4. Update DNS
5. Test thoroughly
6. Gradual traffic migration

### Advantages
- ✅ Complete escape from Vercel issues
- ✅ Platform diversification
- ✅ May have better support

### Disadvantages
- ❌ High complexity
- ❌ Long timeline
- ❌ Risk of new issues
- ❌ Team learning curve

---

## Recommended Approach

### Phase 1: Immediate (Day 1-2)
1. **Deploy Option A: External API Deployment**
   - Quick to implement
   - Proven reliable
   - Unblocks production immediately

### Phase 2: Monitoring (Day 3-7)
2. **Monitor Vercel support response**
   - Check ticket daily
   - Provide additional info if requested
   - Test any suggested fixes immediately

### Phase 3: Evaluation (Week 2)
3. **Evaluate permanent solution**
   - If Vercel fixes: Rollback to native API routes
   - If no fix: Continue with external API or consider migration

## Decision Matrix

| Option | Speed | Cost | Risk | Maintenance |
|--------|-------|------|------|-------------|
| A: External API | ⚡⚡⚡ | 💰 | ✅ Low | 🔧 Medium |
| B: Middleware | ⚡⚡⚡⚡ | Free | ⚠️ Medium | 🔧 Low |
| C: Edge Functions | ⚡⚡ | Free | ⚠️ High | 🔧 High |
| D: Downgrade | ⚡⚡⚡⚡ | Free | ⚠️ Medium | 🔧 Low |
| E: Migration | ⚡ | 💰💰 | ⚠️ High | 🔧 Medium |

## Implementation Timeline

```
Day 1 (Today - September 30):
- ✅ Document all options
- ✅ Commit cache fixes and evidence
- ✅ Update support ticket
- ⏳ Start Option A implementation

Day 2 (October 1):
- ⏳ Complete Option A deployment
- ⏳ Test external API thoroughly
- ⏳ Update frontend configuration
- ⏳ Deploy to production

Day 3-7:
- Monitor Vercel support response
- Monitor external API performance
- Collect metrics

Week 2:
- Evaluate permanent solution
- Document final approach
```

## Rollback Plan

If external API deployment has issues:

1. **Quick rollback**: Set `EXTERNAL_API_URL=""` to disable proxy
2. **Middleware toggle**: Comment out middleware proxy logic
3. **Emergency**: Deploy previous working version
4. **Communication**: Alert stakeholders of status

## Testing Checklist

Before considering workaround successful:

- [ ] All API endpoints return correct responses
- [ ] Health monitoring works
- [ ] Analytics tracking functions
- [ ] Error logging operational
- [ ] Database connections stable
- [ ] Performance acceptable (<500ms response)
- [ ] CORS configured correctly
- [ ] Authentication works
- [ ] Rate limiting in place
- [ ] Monitoring and alerts configured

## Contact and Support

**Primary**: Railway/Fly.io support for external API
**Secondary**: Vercel support for platform issue resolution
**Emergency**: Rollback to previous deployment config

---

**Last Updated**: September 30, 2025
**Status**: Awaiting Vercel support response (Ticket submitted with full evidence)
**Next Review**: October 2, 2025 (48 hours after ticket submission)