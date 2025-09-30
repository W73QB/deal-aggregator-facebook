# Vercel API Routing Issue - Test Documentation

## Purpose

This test suite (`vercel-routing-issue.test.js`) is designed to demonstrate the systematic API routing failure on Vercel's platform where all API endpoints incorrectly return `/api/posts` response instead of their intended responses.

## Test Strategy

- **Local Environment**: Tests should PASS (all endpoints return correct, different responses)
- **Vercel Environment**: Tests will FAIL (all endpoints return identical blog post data)

This failure pattern proves the issue is platform-specific and not application code related.

## Running Tests

### Option 1: Manual Testing (Recommended)

Instead of automated Jest tests, use curl to verify:

```bash
# Test locally (should work correctly)
npm run dev
curl http://localhost:3000/api/health        # Should return health status
curl http://localhost:3000/api/simple-test   # Should return test response
curl http://localhost:3000/api/posts         # Should return blog posts

# Test on Vercel (all return blog posts)
curl https://deal-aggregator-facebook-idgkpy30n-qbws-projects.vercel.app/api/health
curl https://deal-aggregator-facebook-idgkpy30n-qbws-projects.vercel.app/api/simple-test
curl https://deal-aggregator-facebook-idgkpy30n-qbws-projects.vercel.app/api/analytics
```

###Option 2: Jest Tests (Requires Setup)

To run the automated Jest tests:

1. **Install fetch polyfill** (if Jest doesn't support global fetch):
   ```bash
   npm install --save-dev whatwg-fetch
   ```

2. **Create Jest setup file** (`jest.setup.js`):
   ```javascript
   // Enable fetch in Jest environment
   require('whatwg-fetch');
   ```

3. **Update jest.config.js**:
   ```javascript
   module.exports = {
     testEnvironment: 'node',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
   };
   ```

4. **Run tests**:
   ```bash
   # With local dev server running
   npm run dev &
   npm test -- vercel-routing-issue.test.js
   ```

### Option 3: Vercel CI Testing

The ideal way to run these tests is in Vercel's CI environment where they will naturally fail, demonstrating the platform issue:

1. **Add to package.json**:
   ```json
   {
     "scripts": {
       "test:routing": "jest vercel-routing-issue.test.js"
     }
   }
   ```

2. **Add to Vercel build command**:
   ```json
   {
     "buildCommand": "next build && npm run test:routing"
   }
   ```

3. Deploy - tests will fail on Vercel, proving the routing issue.

## Test Cases

### 1. Response Differentiation
- Verifies `/api/health`, `/api/posts`, and `/api/simple-test` return DIFFERENT content
- **Local**: ✅ PASS (all different)
- **Vercel**: ❌ FAIL (all identical - blog posts)

### 2. Health Endpoint Verification
- Verifies `/api/health` does NOT return blog posts
- **Local**: ✅ PASS (returns health status)
- **Vercel**: ❌ FAIL (returns blog posts)

### 3. Simple-Test Endpoint Verification
- Verifies `/api/simple-test` returns test-specific fields
- **Local**: ✅ PASS (returns `{"endpoint": "/api/simple-test"...}`)
- **Vercel**: ❌ FAIL (returns blog posts)

### 4. Analytics Endpoint Verification
- Verifies `/api/analytics` does NOT return blog posts
- **Local**: ✅ PASS (returns error or analytics data)
- **Vercel**: ❌ FAIL (returns blog posts)

### 5. Cache Header Verification
- Verifies API endpoints have correct no-cache headers
- **Local**: ✅ PASS
- **Vercel**: ✅ PASS (headers correct, but routing still broken)

### 6. Routing Path Verification
- Verifies `x-matched-path` header reflects correct endpoint
- **Local**: ✅ PASS
- **Vercel**: ⚠️ PASS (path matches but response is wrong - proves routing layer issue)

## Evidence for Vercel Support

When submitting to Vercel support, include:

1. **Local Test Results**: Screenshot/log showing all tests passing
2. **Vercel Test Results**: Screenshot/log showing tests failing
3. **curl Commands**: Output from manual curl tests showing response mismatch
4. **Headers Analysis**: Output showing correct cache headers but wrong response body

## Key Observations

- **Headers are correct**: `cache-control: no-cache`, `x-vercel-cache: MISS`
- **Routing path matches**: `x-matched-path: /api/simple-test`
- **Response body is wrong**: Contains blog posts instead of endpoint-specific data

This combination definitively proves the issue is in Vercel's routing infrastructure between path matching and handler execution.

## Related Files

- `docs/VERCEL-SUPPORT-TICKET.md` - Complete support ticket with evidence
- `docs/VERCEL-ROUTING-ISSUE.md` - Detailed investigation documentation
- `pages/api/simple-test.js` - Minimal reproduction endpoint (15 lines)
- `next.config.js` - Configuration (verified correct)
- `vercel.json` - Deployment configuration (verified correct)

## Next Steps

1. Run manual curl tests to generate fresh evidence
2. Collect X-Vercel-Id from failed responses
3. Update support ticket with test results
4. Request Vercel platform team investigation