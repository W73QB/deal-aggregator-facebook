# 🔑 GitHub Token Setup Instructions

To execute the automated hotfix deployment script, you need to create a GitHub Personal Access Token.

## 📋 Quick Setup Steps

### 1. **Create GitHub Token**
1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set **Token name:** `DealRadarUS Hotfix Deployment`
4. Set **Expiration:** 30 days (or as needed)

### 2. **Required Permissions**
Select these scopes for the token:
- [x] **`repo`** (Full control of private repositories)
  - [x] `repo:status`
  - [x] `repo_deployment` 
  - [x] `public_repo`
- [x] **`workflow`** (Update GitHub Action workflows)

### 3. **Copy Token**
- Click **"Generate token"**
- **⚠️ COPY THE TOKEN IMMEDIATELY** - it will only be shown once
- Store it securely (password manager recommended)

## 🚀 Execute the Script

### Option 1: Direct Export (Recommended)
```bash
# Replace YOUR_TOKEN_HERE with your actual token
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
chmod +x auto-merge-hotfix.sh
./auto-merge-hotfix.sh
```

### Option 2: Edit Script File
1. Open `auto-merge-hotfix.sh`
2. Replace `PASTE_YOUR_GITHUB_TOKEN_HERE` with your token
3. Run the script:
```bash
chmod +x auto-merge-hotfix.sh
./auto-merge-hotfix.sh
```

## 🛡️ Security Notes

### ✅ **Safe Practices:**
- Use token with minimal required permissions
- Set reasonable expiration (30-90 days)
- Store in secure password manager
- Never commit token to repository

### ❌ **Avoid:**
- Sharing token in messages/emails
- Using token in CI without secrets management
- Setting unnecessarily broad permissions
- Long-lived tokens without expiration

## 🧪 Token Verification

Test your token works:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/W73QB/deal-aggregator-facebook
```

Should return repository information (not 401/403 error).

## 🔄 Alternative: Manual PR Creation

If you prefer not to use tokens, create PR manually:
1. **Go to:** https://github.com/W73QB/deal-aggregator-facebook/compare/main...hotfix/remove-cicd-debugline
2. **Click:** "Create pull request" 
3. **Title:** `fix(html): remove stray CI/CD Test tail from all HTML`
4. **Merge** the PR after creation
5. **Wait** for deployment (~5-10 minutes)
6. **Verify** live site endpoints are clean

---

**Ready to deploy once you have your GitHub token! 🚀**