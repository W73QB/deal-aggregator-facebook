# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## **PRE-DEPLOYMENT VERIFICATION** ✅

### **Environment Setup**
- [ ] **Database Connection**: Verify `DATABASE_URL` is set and accessible
- [ ] **Node Environment**: Confirm `NODE_ENV=production`
- [ ] **Dependencies**: Run `npm ci` to install exact package versions
- [ ] **Build Process**: Execute `npm run build` successfully
- [ ] **Environment Variables**: All required env vars configured

### **Code Quality Verification**
- [ ] **Tests**: Primary tests pass (ConsentBanner ✅)
- [ ] **TypeScript**: No compilation errors
- [ ] **ESLint**: Code follows linting standards
- [ ] **Security**: No known vulnerabilities in dependencies

### **Database Preparation**
- [ ] **Backup**: Current database backed up (if applicable)
- [ ] **Schema Ready**: `database/monitoring-schema.sql` reviewed
- [ ] **Connection Pool**: Database connection limits configured
- [ ] **Migration Plan**: Rollback strategy prepared

---

## **DEPLOYMENT SEQUENCE** 🎯

### **Phase 1: Database Schema Deployment**
```bash
# 1. Set environment variables
export DATABASE_URL="your_production_database_url"
export NODE_ENV="production"

# 2. Run schema deployment
./scripts/deploy-schema.sh

# 3. Verify tables created
psql $DATABASE_URL -c "\dt" | grep -E "(analytics_events|error_logs)"
```

**Verification Checklist:**
- [ ] **Tables Created**: `analytics_events` and `error_logs` exist
- [ ] **Indexes Created**: Performance indexes are active
- [ ] **Permissions**: Application user has required access
- [ ] **Backup Created**: Rollback script available

### **Phase 2: Application Deployment**
```bash
# 1. Deploy application code
npm run build
npm run start  # or your deployment process

# 2. Verify deployment
curl https://your-domain.com/api/health
```

**Verification Checklist:**
- [ ] **Health Check**: `/api/health` returns `status: "healthy"`
- [ ] **Analytics API**: `/api/analytics` accepts POST requests
- [ ] **Error API**: `/api/errors` accepts POST requests
- [ ] **Consent Banner**: Displays correctly for new users

### **Phase 3: Smoke Tests**
```bash
# Test analytics endpoint
curl -X POST https://your-domain.com/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session",
    "events": [{
      "type": "test_event",
      "data": {"status": "deployment_test"}
    }]
  }'

# Test error endpoint
curl -X POST https://your-domain.com/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test_error",
    "message": "Deployment verification test"
  }'

# Verify data persisted
psql $DATABASE_URL -c "SELECT COUNT(*) FROM analytics_events WHERE event_type = 'test_event';"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM error_logs WHERE message LIKE '%Deployment verification%';"
```

**Verification Checklist:**
- [ ] **Analytics Logging**: Events persist to database
- [ ] **Error Logging**: Errors persist to database
- [ ] **Degraded Mode**: Returns HTTP 202 when DB unavailable
- [ ] **Data Validation**: Only valid events accepted

---

## **POST-DEPLOYMENT MONITORING** 📊

### **Immediate Checks (First 30 minutes)**
- [ ] **Error Rates**: No spike in application errors
- [ ] **Response Times**: API latency within acceptable limits
- [ ] **Database Performance**: No connection pool exhaustion
- [ ] **Memory Usage**: Application memory consumption stable
- [ ] **Disk Space**: Database storage not rapidly increasing

### **Functionality Verification**
- [ ] **Consent Banner**:
  - [ ] Shows for new users (no localStorage consent)
  - [ ] Hides for users with existing consent
  - [ ] All three buttons work (Accept/Essential/Decline)
- [ ] **Analytics Collection**:
  - [ ] Events collected based on consent level
  - [ ] No sensitive data in database
  - [ ] Proper degradation when DB unavailable
- [ ] **Error Tracking**:
  - [ ] JavaScript errors captured
  - [ ] Network errors tracked
  - [ ] Performance issues logged

### **Security Validation**
- [ ] **CSP Headers**: No 'unsafe-inline' or 'unsafe-eval'
- [ ] **SVG Security**: `dangerouslyAllowSVG: false`
- [ ] **Privacy Compliance**: PII data sanitized
- [ ] **Consent Tracking**: User choices respected

---

## **ROLLBACK PROCEDURES** ⏪

### **Database Rollback**
```bash
# If schema deployment fails or causes issues
psql $DATABASE_URL -f backups/[timestamp]/rollback.sql

# Verify rollback successful
psql $DATABASE_URL -c "\dt" | grep -E "(analytics_events|error_logs)"
```

### **Application Rollback**
```bash
# Revert to previous deployment
# (Specific steps depend on your deployment platform)

# For Vercel:
vercel --prod --force

# For other platforms:
# Deploy previous git commit or container image
```

### **Emergency Procedures**
- [ ] **Database Issues**: Switch to degraded mode (HTTP 202)
- [ ] **API Failures**: Monitor error rates and response times
- [ ] **Memory Issues**: Scale up infrastructure if needed
- [ ] **Contact Team**: Notify stakeholders of any issues

---

## **SUCCESS CRITERIA** 🎉

### **All Systems Green When:**
- [ ] **Health Check**: Returns `status: "healthy"` consistently
- [ ] **Error Rates**: < 1% error rate for all endpoints
- [ ] **Response Times**: < 500ms average for API endpoints
- [ ] **Database**: < 80% connection pool utilization
- [ ] **User Experience**: Consent banner functional
- [ ] **Analytics**: Data flowing to database correctly
- [ ] **Privacy**: No PII detected in analytics data

---

## **CONTACT INFORMATION** 📞

### **Deployment Team**
- **Primary**: [Your Name] - [Email]
- **Database**: [DBA Name] - [Email]
- **DevOps**: [DevOps Contact] - [Email]

### **Emergency Contacts**
- **On-call Engineer**: [Phone Number]
- **Escalation**: [Manager Contact]

---

## **DEPLOYMENT LOG** 📝

| Timestamp | Action | Status | Notes |
|-----------|--------|--------|-------|
| [Fill in] | Schema Deployment | ✅ / ❌ | |
| [Fill in] | Application Deployment | ✅ / ❌ | |
| [Fill in] | Smoke Tests | ✅ / ❌ | |
| [Fill in] | Monitoring Setup | ✅ / ❌ | |

**Deployment Completed By**: ________________
**Date**: ________________
**Sign-off**: ________________

---

*This checklist ensures safe, reliable deployment of the privacy-compliant analytics system with proper monitoring and rollback procedures.*