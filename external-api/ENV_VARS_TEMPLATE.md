# Environment Variables Template

## Required Environment Variables for Railway Deployment

This document lists all environment variables needed for the external API to function properly.

---

## How to Set Variables

### Railway CLI:
```bash
railway variables set VARIABLE_NAME="value"
```

### Railway Dashboard:
1. Go to https://railway.app/dashboard
2. Select your project
3. Click "Variables" tab
4. Add each variable below

---

## Required Variables

### 1. Node Environment
```bash
NODE_ENV=production
```
**Description:** Enables production optimizations and error handling

---

### 2. Database Connection (Primary)

#### Option A: Direct Connection
```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

#### Option B: Connection Pooler (Recommended for Serverless)
```bash
DATABASE_URL_POOLER=postgresql://user:password@pooler-host:port/database?sslmode=require
```

**Where to Find:**
- Main project `.env` file
- Main project `.env.dealradarus.local`
- Neon/Supabase dashboard → Database Settings → Connection String
- Vercel Environment Variables (if already deployed)

**Example (Neon):**
```bash
DATABASE_URL=postgresql://neondb_owner:AbCdEf123456@ep-example-a1b2c3d4.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Example (Supabase):**
```bash
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

### 3. Supabase Configuration

#### Supabase URL:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
```

#### Supabase Anonymous Key:
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2MDYwODAwLCJleHAiOjE5NjE2MzY4MDB9.example_signature
```

**Where to Find:**
- Main project `.env` file
- Supabase Dashboard → Settings → API → Project URL
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

---

## Optional Variables

### 4. Server Port (Local Development Only)
```bash
PORT=3001
```
**Note:** Railway automatically assigns a port in production, this is only for local testing

---

### 5. Additional Services (If Used)

#### SendGrid (Email Service):
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

#### Stripe (Payment Processing):
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
```

---

## Verification Checklist

After setting all variables:

```bash
# List all variables
railway variables

# Should show:
# ✓ NODE_ENV
# ✓ DATABASE_URL or DATABASE_URL_POOLER
# ✓ SUPABASE_URL
# ✓ SUPABASE_ANON_KEY
```

---

## Getting Values from Main Project

### Method 1: From .env File
```bash
cd /path/to/main/project
cat .env | grep DATABASE_URL
cat .env | grep SUPABASE
```

### Method 2: From Vercel (if deployed)
```bash
vercel env pull .env.vercel
cat .env.vercel | grep DATABASE_URL
cat .env.vercel | grep SUPABASE
```

### Method 3: From Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project
3. Go to "Connection Details"
4. Copy "Connection string"

### Method 4: From Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

---

## Example: Complete Setup Script

```bash
#!/bin/bash
# Copy this script, replace values, and run in external-api directory

# Navigate to external-api
cd external-api

# Set all variables (REPLACE WITH YOUR ACTUAL VALUES)
railway variables set NODE_ENV="production"
railway variables set DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set SUPABASE_ANON_KEY="your-anon-key-here"

# Verify
railway variables

echo "✅ Environment variables configured!"
echo "Next: railway up"
```

---

## Security Notes

🔒 **IMPORTANT:**
- Never commit `.env` files to git
- Never share environment variables publicly
- Use Railway's encrypted variable storage
- Rotate keys if accidentally exposed
- Use connection pooler URLs for better performance
- Enable SSL for all database connections

---

## Troubleshooting

### Variables Not Taking Effect
```bash
# Restart service after setting variables
railway restart
```

### Database Connection Errors
```bash
# Test connection locally first
cd external-api
npm run dev
curl http://localhost:3001/api/health

# Check logs on Railway
railway logs
```

### Missing Variables
```bash
# Compare with local .env
diff .env.example .env
```

---

**Created:** September 30, 2025
**Last Updated:** September 30, 2025
**Status:** Template Ready - Update with actual values during deployment