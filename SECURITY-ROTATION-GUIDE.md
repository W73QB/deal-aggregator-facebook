# 🔐 Security Credentials Rotation Guide

**Generated:** 2025-10-12
**Status:** URGENT - Credentials exposed in git history
**Priority:** CRITICAL

## 📋 Overview

This guide documents the credential rotation process after discovering hardcoded secrets in `.vercel_env_temp` that were committed to git history (commit history before c84d2b1).

## 🔴 Exposed Credentials

The following credentials were found hardcoded and need immediate rotation:

### 1. JWT_SECRET
- **Old Value:** `LSq3Tz5hKd1vCUGwZwDahjzUS7R7+w2MJRhROHaHZVox0ShoVPAci5aqH20ovrN9tETdUzaaTaM9kOvlYkpLEg==`
- **New Value:** `tUTmMNCGbknC3VPAI6i26cPPrMz5cDCVpgicm0mGRPSVaj1ZLj0lSK9qQkSMJSNyxVjTb7+/JkSCs5fF6M/YEQ==`
- **Impact:** All JWT tokens will be invalidated - users will need to re-login
- **Where to Update:** Vercel, Railway, local .env files

### 2. SESSION_SECRET
- **Old Value:** `glc6UYzB5cqTjGAUsmIb29qjN1xZIO05u0VWFqK5RcE=`
- **New Value:** `nFFA72O32iPyN9HyRjDLPNVELp2ctJvsaCAg+oRF/Lo=`
- **Impact:** All sessions will be invalidated - users will need to re-login
- **Where to Update:** Vercel, Railway, local .env files

### 3. DATABASE_URL (Neon PostgreSQL)
- **Exposed:** `postgresql://neondb_owner:npg_DOvMB0x2AJut@ep-bold-night-adnxdrn9.c-2.us-east-1.aws.neon.tech/neondb`
- **Action Required:** Reset password on Neon dashboard
- **Where to Update:** Vercel, Railway, local .env files

### 4. Additional Secrets Found
- **FACEBOOK_APP_SECRET:** `879b6f110d0c12c5b603c4c7fa6c1486` (found in .env.vercel.production)
- **SMTP_PASS:** `msB5nwt954PA` (Zoho email password)
- **UPSTASH_REDIS_REST_TOKEN:** `AZ4xAAIncDE4NjVhNmI5MjIzYzI0OWE1OTQ5ODE3MmNmYzMxMzdjOXAxNDA0OTc`

## 🎯 Rotation Checklist

### Phase 1: Generate New Secrets ✅

- [x] Generate new JWT_SECRET (64 bytes)
- [x] Generate new SESSION_SECRET (32 bytes)
- [ ] Reset Neon DB password
- [ ] Regenerate Facebook App Secret
- [ ] Reset Zoho email password
- [ ] Regenerate Upstash Redis token

### Phase 2: Update Vercel Production

```bash
# Update Vercel environment variables
vercel env rm JWT_SECRET production
vercel env add JWT_SECRET production
# Enter: tUTmMNCGbknC3VPAI6i26cPPrMz5cDCVpgicm0mGRPSVaj1ZLj0lSK9qQkSMJSNyxVjTb7+/JkSCs5fF6M/YEQ==

vercel env rm SESSION_SECRET production
vercel env add SESSION_SECRET production
# Enter: nFFA72O32iPyN9HyRjDLPNVELp2ctJvsaCAg+oRF/Lo=

vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Enter: [New Neon connection string after password reset]

# Redeploy to apply changes
vercel --prod
```

### Phase 3: Update Railway (if applicable)

1. Log into Railway dashboard
2. Navigate to project settings
3. Update environment variables:
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `DATABASE_URL`
4. Trigger redeploy

### Phase 4: Update Local Environment

Update these files with new secrets:
- `.env.dealradarus.local`
- `.env.production`
- `.env.staging`
- `.env.test`
- `external-api/.env.dealradarus.local`

**Do NOT commit these files to git!**

### Phase 5: Update External Services

#### Neon Database
1. Go to: https://console.neon.tech/
2. Select project: `neondb`
3. Settings → Reset Password
4. Copy new connection string
5. Update all environments

#### Facebook App
1. Go to: https://developers.facebook.com/apps/1427920308500326/
2. Settings → Basic
3. Regenerate App Secret
4. Update all environments

#### Zoho Email
1. Go to: https://mail.zoho.com/
2. Settings → Security
3. Change password or regenerate app-specific password
4. Update `SMTP_PASS` in all environments

#### Upstash Redis
1. Go to: https://console.upstash.com/
2. Select database: `adapted-basilisk-40497`
3. Rotate REST token
4. Update `UPSTASH_REDIS_REST_TOKEN` in all environments

### Phase 6: Verify & Test

- [ ] Test local development: `npm run dev`
- [ ] Test authentication flow
- [ ] Test database connection
- [ ] Test email sending
- [ ] Test Redis cache
- [ ] Verify production deployment
- [ ] Check staging environment

## 🔒 Post-Rotation Security Measures

1. **Add Pre-commit Hook for Secrets Detection:**
   ```bash
   # Already have security hook, verify it's working
   cat .git/hooks/pre-commit
   ```

2. **Audit All Config Files:**
   ```bash
   grep -r "npg_DOvMB0x2AJut" . --exclude-dir=node_modules --exclude-dir=.git
   grep -r "LSq3Tz5hKd1vCUGwZwDahjzUS7R7" . --exclude-dir=node_modules --exclude-dir=.git
   ```

3. **Update .gitignore:**
   - ✅ Already updated to exclude `.vercel_env_temp`
   - ✅ Pattern `*_env_temp` added

4. **Document Secrets Management:**
   - Use environment variables only
   - Never commit real secrets
   - Use `.env.template` for examples
   - Document required vars in README

## 📝 Template for New Environments

Copy `.env.template` and fill with actual values:

```bash
cp .env.template .env.local
# Edit .env.local with real credentials (never commit!)
```

## 🚨 If Secrets Are Compromised Again

1. Immediately rotate all affected credentials
2. Review git commit history
3. Run security audit: `npm run security:comprehensive`
4. Consider full git history cleanup if repo becomes public

## 📞 Emergency Contacts

- **Neon Support:** https://neon.tech/docs/introduction/support
- **Vercel Support:** https://vercel.com/support
- **Facebook Developer Support:** https://developers.facebook.com/support/

---

**Last Updated:** 2025-10-12
**Next Review:** After all rotations complete
**Document Owner:** DevOps Team
