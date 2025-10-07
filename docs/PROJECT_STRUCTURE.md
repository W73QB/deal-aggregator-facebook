# Project Structure Guidelines

**Last Updated**: October 7, 2025
**Status**: Mandatory
**Applies To**: All Next.js projects on Vercel

---

## 🎯 Overview

This document defines the required project structure for this Next.js application to prevent routing conflicts and ensure proper deployment on Vercel.

---

## ✅ Required Directory Structure

```
deal-aggregator-facebook/
├── pages/                      # Next.js pages and API routes
│   ├── api/                    # ✅ ONLY location for API routes
│   │   ├── health.js
│   │   ├── posts.js
│   │   ├── diagnostic.js
│   │   └── ...
│   ├── index.js                # Homepage
│   ├── deals.js
│   ├── blog/
│   └── ...
│
├── components/                 # React components
├── lib/                        # Utility functions
├── public/                     # Static assets
├── styles/                     # CSS/styling
│
├── server/                     # Backend logic (NOT exposed to Vercel)
│   └── api/                    # ✅ OK - Server-side only, not in routing
│
├── docs/                       # Documentation
│   └── api/                    # ✅ OK - Documentation, not code
│
├── external-api/               # External API scripts
│   └── ...                     # ✅ OK - Not in Vercel build
│
└── api.old/                    # Archived conflicting directory
    └── ...                     # ⚠️ DEPRECATED - To be deleted
```

---

## 🚫 PROHIBITED Structures

### ❌ NEVER Create These:

```
# 1. API directory at project root
./api/                          # ❌ CAUSES ROUTING CONFLICTS
├── hello.js
└── ...

# 2. Multiple API directories in pages/
./pages/api/
./pages/apis/                   # ❌ Confusing, don't do this
./pages/api-v2/                 # ❌ Use versioning in routes instead

# 3. API routes outside pages/
./src/api/                      # ❌ Not recognized by Next.js
./routes/api/                   # ❌ Wrong framework (Express-style)
```

---

## 📋 API Routes Standards

### File Naming

```
✅ CORRECT:
pages/api/health.js             # Simple endpoint
pages/api/posts.js              # Resource collection
pages/api/posts/[id].js         # Dynamic route
pages/api/users/[userId]/posts.js  # Nested dynamic route

❌ WRONG:
pages/api/Health.js             # Don't use PascalCase for files
pages/api/get-posts.js          # Don't use HTTP verbs in filename
pages/api/postsAPI.js           # Don't add "API" suffix
```

### Route Organization

```
pages/api/
├── health.js                   # System endpoints
├── diagnostic.js
│
├── posts.js                    # Blog posts
├── posts/
│   └── [slug].js
│
├── deals.js                    # Deals
├── deals/
│   └── [id].js
│
├── auth/                       # Authentication
│   ├── login.js
│   ├── logout.js
│   └── register.js
│
└── webhooks/                   # External webhooks
    ├── stripe.js
    └── github.js
```

---

## 🔍 Verification Commands

### Check for Conflicting Directories

```bash
# Must only show: ./pages/api
find . -type d -name "api" 2>/dev/null | grep -v node_modules | grep -v .next | grep -v .git

# Should NOT find any directories named "api" outside of pages/
```

### Verify Build Output

```bash
# Build locally
npm run build

# Check serverless functions generated
ls -la .next/server/pages/api/

# Should only show functions from pages/api/
```

### Verify Vercel Deployment

```bash
# Deploy to preview
vercel

# Inspect build output
vercel inspect [deployment-url]

# Look for unexpected routes in "Builds" section
# All λ (lambda) functions should match your pages/api/ files
```

---

## 🎯 Next.js API Routes Best Practices

### 1. Use Correct Export Format

```javascript
// ✅ CORRECT
export default function handler(req, res) {
  res.status(200).json({ message: 'Success' });
}

// ❌ WRONG
module.exports = (req, res) => {
  // Don't use CommonJS in Next.js API routes
};
```

### 2. Set Proper Headers

```javascript
export default function handler(req, res) {
  // Content type
  res.setHeader('Content-Type', 'application/json');

  // Cache control
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');

  // CORS (if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).json({ data: 'value' });
}
```

### 3. Handle Methods Properly

```javascript
export default function handler(req, res) {
  // Check method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle request
  // ...
}
```

### 4. Error Handling

```javascript
export default async function handler(req, res) {
  try {
    const data = await fetchData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
```

---

## 🚀 Deployment Checklist

Before deploying to production:

### 1. Structure Verification
- [ ] Run directory check command
- [ ] Verify no `./api` directory at root
- [ ] Confirm all API routes in `pages/api/`
- [ ] Check for accidentally committed build artifacts

### 2. Build Verification
- [ ] `npm run build` succeeds locally
- [ ] Check `.next/server/pages/api/` contents
- [ ] Verify no unexpected files in build output

### 3. Vercel Verification
- [ ] Deploy to preview first
- [ ] Run `vercel inspect [preview-url]`
- [ ] Verify all lambda functions are expected
- [ ] Check for phantom routes
- [ ] Run smoke tests on preview

### 4. Production Deployment
- [ ] Deploy to production
- [ ] Run comprehensive API tests
- [ ] Verify all endpoints return correct data
- [ ] Monitor error rates for 24 hours

---

## 📚 Related Documentation

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Deployment](https://vercel.com/docs/concepts/deployments/overview)
- [Incident Report: Vercel Routing Bug](./incidents/INCIDENT-2025-10-07-vercel-routing-bug.md)

---

## 🔄 Review Schedule

This document should be reviewed:
- After any major Next.js version upgrade
- After any Vercel platform changes
- Quarterly (January, April, July, October)
- After any routing-related incidents

---

**Document Owner**: Development Team
**Next Review**: January 7, 2026
