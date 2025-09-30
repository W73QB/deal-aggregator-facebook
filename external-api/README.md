# Deal Aggregator External API

## Purpose

This is a standalone Express API server created as a workaround for the Vercel API routing issue. All API endpoints that were failing on Vercel are migrated here and deployed to Railway.app.

**Issue**: All Vercel API endpoints return `/api/posts` response instead of their intended responses.
**Solution**: Serve APIs from external server, frontend calls this server instead.

---

## Project Status

- ✅ Project structure created
- ✅ Server.js with Express setup
- ✅ Example route: `/api/simple-test`
- ⏳ Remaining routes need conversion
- ⏳ Database connections need setup
- ⏳ Railway deployment pending

---

## Quick Start

### 1. Install Dependencies

```bash
cd external-api
npm install
```

### 2. Setup Environment Variables

Create `.env` file:

```bash
# Copy from main project
cp ../.env.production .env

# Or create manually:
cat > .env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=your_postgresql_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
EOF
```

### 3. Start Development Server

```bash
npm run dev
# Server runs on http://localhost:3001
```

### 4. Test Endpoint

```bash
curl http://localhost:3001/api/simple-test
# Should return correct JSON (not blog posts!)
```

---

## Route Conversion Guide

### Pattern: Next.js → Express

#### Next.js Handler (Before):
```javascript
// pages/api/endpoint.js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ data: 'response' });
}
```

#### Express Router (After):
```javascript
// routes/endpoint.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ data: 'response' });
});

router.post('/', (req, res) => {
  // POST logic
});

module.exports = router;
```

### Conversion Steps for Each Endpoint:

1. **Read original handler**: `pages/api/[endpoint].js`
2. **Create router file**: `routes/[endpoint].js`
3. **Convert to Express**:
   - Replace `export default function handler` with Express router
   - Handle methods via `router.get()`, `router.post()`, etc.
   - Keep all business logic
4. **Test locally**: `curl http://localhost:3001/api/[endpoint]`
5. **Mount in server.js**: Already done (with try-catch)

---

## Endpoints to Convert

Total: **9 endpoints**

| Priority | Endpoint | File | Status | Notes |
|----------|----------|------|--------|-------|
| ✅ Done | `/api/simple-test` | routes/simple-test.js | Complete | Example template |
| 🔴 High | `/api/health` | routes/health.js | TODO | Needs DB connection |
| 🔴 High | `/api/posts` | routes/posts.js | TODO | Static data, easy |
| 🔴 High | `/api/deals` | routes/deals.js | TODO | Needs DB |
| 🟡 Medium | `/api/analytics` | routes/analytics.js | TODO | Needs DB, POST only |
| 🟡 Medium | `/api/errors` | routes/errors.js | TODO | Needs DB, POST only |
| 🟡 Medium | `/api/errors/summary` | routes/errors/summary.js | TODO | Nested route, needs DB |
| 🟢 Low | `/api/newsletter` | routes/newsletter.js | TODO | Email service |
| 🟢 Low | `/api/auth/me` | routes/auth/me.js | TODO | Auth check |

### Priority Explanation:
- **High**: Critical for site functionality
- **Medium**: Important for monitoring/analytics
- **Low**: Nice to have, not blocking

---

## Database Setup

### Required Libraries

```bash
# Already in package.json
npm install pg  # PostgreSQL client
```

### Create Database Helper

Create `lib/db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = {
  query,
  getClient,
  pool
};
```

### Usage in Routes:

```javascript
const db = require('../lib/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM table');
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Example: Converting `/api/posts`

### Step 1: Copy Original Logic

```bash
# Read original
cat ../pages/api/posts.js

# Create new file
touch routes/posts.js
```

### Step 2: Convert to Router

```javascript
// routes/posts.js
const express = require('express');
const router = express.Router();

// Import blog posts data (if external file)
// const posts = require('../data/posts.json');

router.get('/', (req, res) => {
  // Copy original posts array from pages/api/posts.js
  const posts = [
    { id: 1, title: "...", /* rest of data */ },
    { id: 2, title: "...", /* rest of data */ }
  ];

  res.status(200).json({ posts });
});

module.exports = router;
```

### Step 3: Mount in server.js

```javascript
// Already done in server.js:
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);
```

### Step 4: Test

```bash
npm run dev
curl http://localhost:3001/api/posts
# Should return posts array
```

---

## Testing

### Local Testing

```bash
# Start server
npm run dev

# Test each endpoint
curl http://localhost:3001/api/simple-test
curl http://localhost:3001/api/posts
curl http://localhost:3001/api/health
curl http://localhost:3001/api/deals

# Test POST endpoints
curl -X POST http://localhost:3001/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'
```

### Automated Testing

Create `test.sh`:

```bash
#!/bin/bash
BASE_URL="http://localhost:3001"

echo "Testing endpoints..."

echo "\n1. Simple Test:"
curl -s $BASE_URL/api/simple-test | jq

echo "\n2. Posts:"
curl -s $BASE_URL/api/posts | jq '.posts | length'

echo "\n3. Health:"
curl -s $BASE_URL/api/health | jq

echo "\nDone!"
```

---

## Railway Deployment

### Prerequisites

1. Railway account: https://railway.app/
2. Railway CLI: `npm install -g @railway/cli`

### Deployment Steps

#### 1. Login to Railway

```bash
railway login
```

#### 2. Initialize Project

```bash
# In external-api directory
railway init
# Select: Create new project
# Name: deal-aggregator-api
```

#### 3. Set Environment Variables

```bash
# Set all variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set SUPABASE_URL="..."
railway variables set SUPABASE_ANON_KEY="..."
railway variables set NODE_ENV="production"

# Verify
railway variables
```

#### 4. Create railway.json

Already created in root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 5. Deploy

```bash
railway up
```

#### 6. Get Deployment URL

```bash
railway status
# Example: https://deal-aggregator-api-production.up.railway.app
```

#### 7. Test Deployed API

```bash
RAILWAY_URL="your-railway-url"

curl https://$RAILWAY_URL/api/simple-test
curl https://$RAILWAY_URL/api/posts
curl https://$RAILWAY_URL/api/health
```

---

## Connecting Frontend

### 1. Add Environment Variable

In main project `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://deal-aggregator-api-production.up.railway.app
```

### 2. Create API Client

Create `lib/apiClient.js` in main project:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function fetchPosts() {
  const response = await fetch(`${API_BASE}/api/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
}

export async function trackAnalytics(data) {
  const response = await fetch(`${API_BASE}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Add more API functions as needed
```

### 3. Update Pages

```javascript
// pages/blog.js
import { fetchPosts } from '../lib/apiClient';

export async function getStaticProps() {
  const posts = await fetchPosts();
  return { props: { posts }, revalidate: 300 };
}
```

### 4. Deploy Frontend

```bash
vercel --prod
```

---

## Troubleshooting

### CORS Issues

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Update `server.js` CORS config:

```javascript
app.use(cors({
  origin: [
    'https://your-domain.com',
    'https://*.vercel.app'
  ],
  credentials: true
}));
```

### Database Connection Errors

**Problem**: `Connection refused` or timeout

**Solutions**:
1. Check `DATABASE_URL` is correct
2. Verify database allows connections from Railway IP
3. Check SSL settings: `ssl: { rejectUnauthorized: false }`

### Module Not Found

**Problem**: `Cannot find module './routes/xyz'`

**Solution**: Route file doesn't exist yet. Create it or comment out in `server.js`.

### Port Already in Use

**Problem**: `EADDRINUSE`

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

---

## Monitoring

### Railway Dashboard

- View logs: `railway logs`
- View metrics: https://railway.app/dashboard
- Set up alerts for:
  - CPU > 80%
  - Memory > 80%
  - Error rate > 5%

### Health Checks

Create monitoring script:

```bash
#!/bin/bash
# monitor.sh
RAILWAY_URL="your-url"

while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL/api/health)
  if [ $STATUS -eq 200 ]; then
    echo "✅ $(date): Health check passed"
  else
    echo "❌ $(date): Health check failed (Status: $STATUS)"
  fi
  sleep 60
done
```

---

## Rollback Plan

If external API has issues:

### 1. Quick Disable

```bash
# Main project
vercel env rm NEXT_PUBLIC_API_URL production
vercel --prod
```

### 2. Full Rollback

```bash
# Stop Railway deployment
railway down

# Remove environment variable
vercel env rm NEXT_PUBLIC_API_URL

# Redeploy
vercel --prod
```

---

## Cost Estimation

### Railway Pricing

- **Free Tier**: $0/month (sufficient for testing)
- **Starter**: $5/month (for production)
- **Pro**: $20/month (better performance)

### Estimated Monthly Cost

- Basic deployment: **$5-10/month**
- With monitoring: **$10-15/month**
- High traffic: **$20-30/month**

---

## Next Steps

1. **Convert remaining endpoints** (Priority: High → Medium → Low)
2. **Setup database connections** (lib/db.js)
3. **Test locally** (npm run dev)
4. **Deploy to Railway** (railway up)
5. **Connect frontend** (NEXT_PUBLIC_API_URL)
6. **Test production** (smoke tests)
7. **Monitor performance** (Railway dashboard)
8. **Document** (Update this README with learnings)

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app/
- **Express Docs**: https://expressjs.com/
- **Vercel Issue**: docs/VERCEL-SUPPORT-TICKET.md
- **Workaround Options**: docs/WORKAROUND-OPTIONS.md

---

**Created**: September 30, 2025
**Status**: Phase 2 - Setup Complete, Conversion In Progress
**Next**: Convert high-priority endpoints