# Deal Aggregator Facebook

## Overview
A comprehensive deal aggregation platform that scrapes Facebook marketplace for deals and provides user management, filtering, and notification systems.

## Architecture

### Redis Configuration
The application uses a **hybrid Redis architecture** for maximum reliability and performance:

**Primary**: Custom Upstash HTTP REST Client  
**Fallback**: ioredis with local Redis connection

#### Environment Variables (Production)
```
UPSTASH_REDIS_REST_URL=https://[instance].upstash.io
UPSTASH_REDIS_REST_TOKEN=[rest-token]
```

#### Connection Logic
1. **Upstash REST API** (preferred for serverless)
   - Direct HTTP calls using fetch()
   - Optimized for Vercel serverless functions
   - 2-second connection timeout
   - Automatic fallback on failure

2. **ioredis Fallback** (local development)
   - Traditional Redis TCP connection
   - Uses `redis://127.0.0.1:6379` for local development
   - Full Redis command compatibility

#### Custom HTTP Client
```javascript
// Custom implementation replaces @upstash/redis package
const upstashClient = {
  async ping() { /* HTTP GET /ping */ },
  async set(key, value, ...args) { /* HTTP POST with SET command */ },
  async get(key) { /* HTTP POST with GET command */ },
  // ... more Redis commands
}
```

### Health Monitoring
**Endpoint**: `GET /api/health/redis`

**Healthy Response**:
```json
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "client_type": "UpstashHttpClient",
    "responseTime": 139,
    "testSuccess": true
  }
}
```

**Performance Targets**:
- Response time: < 1 second
- Uptime: 99.9%
- Fallback activation: < 5 seconds

### Token Rotation Process
**Frequency**: Every 90 days (recommended)

**Steps**:
1. Generate new REST token in Upstash dashboard
2. Update Vercel environment variables:
   ```bash
   echo "NEW_TOKEN" | vercel env add UPSTASH_REDIS_REST_TOKEN production --force
   ```
3. Redeploy: `vercel --prod`
4. Verify: `curl https://api.dealradarus.com/api/health/redis`

## Cache Strategy

### Enhanced Methods
- `setWithTTL(key, value, ttl=3600)` - JSON storage with TTL
- `getAndParse(key)` - Graceful JSON retrieval
- `incrementWithTTL(key, ttl=3600)` - Rate limiting support
- `deleteKeys(pattern)` - Pattern-based cleanup

### Default TTL Values
- User sessions: 1 hour
- Cache data: 1 hour
- Rate limiting: 1 hour
- Worker coordination: 60 seconds

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Run tests
npm test
```

### Environment Configuration
Copy `config/.env.dealradarus.local.example` to `config/.env.dealradarus.local` and configure:
- Database credentials
- Email settings
- Facebook API keys
- Redis settings (optional for local)

### Production Deployment
```bash
# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://api.dealradarus.com/api/health/redis
```

## Monitoring & Debugging

### Health Checks
- Redis: `/api/health/redis`
- Database: (via application logs)
- Worker coordination: (via logs)

### Common Issues
1. **Redis Unhealthy**: Check Upstash dashboard and token validity
2. **Fallback Activation**: Verify local Redis or check network connectivity
3. **High Latency**: Consider token rotation or regional optimization

### Logging
- Redis operations: Info level
- Connection failures: Warn level  
- Health check failures: Error level

---

**Production URL**: https://api.dealradarus.com  
**Health Dashboard**: https://api.dealradarus.com/api/health/redis  
**Last Updated**: August 30, 2025