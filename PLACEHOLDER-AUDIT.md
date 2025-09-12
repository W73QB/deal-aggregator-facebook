# 🔍 M3.9 Enhanced Placeholder Audit Report

**Generated:** 2025-09-12T03:54:24.872Z
**Duration:** 433ms
**Environment:** development

## 📊 Executive Summary

- **Files Scanned:** 345
- **Files with Placeholders:** 125
- **Total Placeholders Found:** 852
- **Environment Validation Errors:** 8

## ⚠️ Issues by Severity

- **⚠️ HIGH:** 501 issues
- **🔸 MEDIUM:** 300 issues
- **💡 LOW:** 34 issues
- **🚨 CRITICAL:** 25 issues

## 🚨 Critical Environment Issues

- **WEBHOOK_SIGNATURE_SECRET** in `.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.example
- **DATABASE_URL** in `.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- **JWT_SECRET** in `.env.example`: JWT_SECRET contains placeholder or missing real value in .env.example
- **SESSION_SECRET** in `.env.example`: SESSION_SECRET contains placeholder or missing real value in .env.example
- **DATABASE_URL** in `.env.template`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.template: "postgresql://neondb_owner:YOUR_PASSWORD@ep-your-ho..."
- **JWT_SECRET** in `.env.template`: JWT_SECRET contains placeholder or missing real value in .env.template
- **SESSION_SECRET** in `.env.template`: SESSION_SECRET contains placeholder or missing real value in .env.template

## ❌ Environment Validation Errors

- 🔸 **SENTRY_DSN** in `.env.example`: SENTRY_DSN sai định dạng URL DSN của Sentry in .env.example: "https://xxx@xxx.ingest.sentry.io/xxx..."
- 🚨 **WEBHOOK_SIGNATURE_SECRET** in `.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.example
- 🚨 **DATABASE_URL** in `.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- 🚨 **JWT_SECRET** in `.env.example`: JWT_SECRET contains placeholder or missing real value in .env.example
- 🚨 **SESSION_SECRET** in `.env.example`: SESSION_SECRET contains placeholder or missing real value in .env.example
- 🚨 **DATABASE_URL** in `.env.template`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.template: "postgresql://neondb_owner:YOUR_PASSWORD@ep-your-ho..."
- 🚨 **JWT_SECRET** in `.env.template`: JWT_SECRET contains placeholder or missing real value in .env.template
- 🚨 **SESSION_SECRET** in `.env.template`: SESSION_SECRET contains placeholder or missing real value in .env.template

## 🔍 Placeholder Findings

### 📁 `.env.example`

- 🚨 **Line 12** (API Key Placeholders): `JWT_SECRET=your_jwt_secret_here_minimum_32_characters`
- 🚨 **Line 34** (API Key Placeholders): `SESSION_SECRET=your_session_secret_here_minimum_32_characters`
- 🚨 **Line 64** (API Key Placeholders): `WEBHOOK_SIGNATURE_SECRET=change_me_webhook_secret_key_minimum_32_chars`
- 🔸 **Line 67** (Example Domains): `FRONTEND_BASE_URL=http://localhost:3000`

### 📁 `.env.template`

- 🚨 **Line 14** (API Key Placeholders): `JWT_SECRET=YOUR_JWT_SECRET_MINIMUM_64_CHARACTERS_FOR_SECURITY`
- 🚨 **Line 38** (API Key Placeholders): `SESSION_SECRET=YOUR_SESSION_SECRET_MINIMUM_32_CHARACTERS`
- 🔸 **Line 49** (Sentry Placeholders): `SENTRY_DSN=`
- 🚨 **Line 58** (API Key Placeholders): `CRON_SECRET=YOUR_CRON_SECRET_KEY`
- 🚨 **Line 61** (API Key Placeholders): `UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN`
- 🚨 **Line 67** (API Key Placeholders): `FB_APP_SECRET=YOUR_FACEBOOK_APP_SECRET`
- 🚨 **Line 68** (API Key Placeholders): `FB_PAGE_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN`
- 🚨 **Line 70** (API Key Placeholders): `FACEBOOK_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN`

### 📁 `AFFILIATE-LINKS-SUMMARY.md`

- ⚠️ **Line 7** (Generic Placeholders): `- **Links Replaced**: 34+ placeholder links`
- ⚠️ **Line 10** (Generic Placeholders): `- **Success Rate**: 100% placeholder removal`
- ⚠️ **Line 146** (Generic Placeholders): `- All placeholder links replaced with real affiliate URLs`
- ⚠️ **Line 182** (Generic Placeholders): `✅ **All placeholder links successfully replaced with monetized affiliate URLs**`

### 📁 `FULL-AUTOMATION-GUIDE.md`

- ⚠️ **Line 58** (Generic Placeholders): `AMAZON_ACCESS_KEY_ID=[your-key]`
- ⚠️ **Line 59** (Generic Placeholders): `AMAZON_SECRET_ACCESS_KEY=[your-secret]`
- ⚠️ **Line 63** (Generic Placeholders): `WALMART_API_KEY=[your-key]`
- ⚠️ **Line 66** (Generic Placeholders): `BESTBUY_API_KEY=[your-key]`
- ⚠️ **Line 69** (Generic Placeholders): `OPENAI_API_KEY=[your-key]  # $20/tháng cho unlimited content`

### 📁 `GSC-VERIFICATION-FIXED.md`

- ⚠️ **Line 6** (Generic Placeholders): `- Comment cũ: `content="TODO"``
- ⚠️ **Line 60** (Generic Placeholders): `**Expected result**: Phải thấy verification code thật, không phải placeholder`

### 📁 `PRODUCTION-DEPLOYMENT-SUMMARY.md`

- ⚠️ **Line 28** (Generic Placeholders): `All placeholder values have been replaced with real production data.`

### 📁 `PRODUCTION-LAUNCH-CHECKLIST.md`

- ⚠️ **Line 27** (Generic Placeholders): `**Trạng thái**: ❌ Placeholder hiện tại`
- ⚠️ **Line 43** (Generic Placeholders): `**Trạng thái**: ❌ Placeholder links`

### 📁 `RECAPTCHA-DEPLOYMENT-SUMMARY.md`

- ⚠️ **Line 44** (Generic Placeholders): `# API endpoint: http://your-domain.com:3003/api/verify-recaptcha`
- ⚠️ **Line 117** (Generic Placeholders): `curl http://your-domain.com:3003/api/recaptcha-stats`
- 🔸 **Line 215** (Example Domains): `- **Server Status**: `http://localhost:3003/``

### 📁 `RECAPTCHA-IMPLEMENTATION-GUIDE.md`

- 🔸 **Line 61** (Example Domains): `# Server runs on http://localhost:3003`
- 🔸 **Line 62** (Example Domains): `# API endpoint: http://localhost:3003/api/verify-recaptcha`
- 🔸 **Line 208** (Example Domains): `- [ ] Test from actual domain (not localhost)`

### 📁 `automation/README.md`

- ⚠️ **Line 198** (Generic Placeholders): `FB_PAGE_ACCESS_TOKEN=[your_token]`

### 📁 `automation/advanced-blog-engine.js`

- ⚠️ **Line 420** (Generic Placeholders): `<input type="email" name="email" placeholder="Your email address" required`

### 📁 `automation/daily-automation-master.js`

- ⚠️ **Line 489** (Generic Placeholders): `<input type="email" name="email" placeholder="Your email address" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-right: 10px;">`
- ⚠️ **Line 715** (Generic Placeholders): `// Add placeholder methods for additional features`

### 📁 `automation/logs/new-facebook-page-guide.json`

- ⚠️ **Line 241** (Generic Placeholders): `"FB_NEW_PAGE_ID": "[to_be_filled]",`
- ⚠️ **Line 242** (Generic Placeholders): `"FB_NEW_PAGE_ACCESS_TOKEN": "[to_be_filled]",`

### 📁 `automation/new-facebook-page-setup.js`

- ⚠️ **Line 308** (Generic Placeholders): `'FB_NEW_PAGE_ID': '[to_be_filled]',`
- ⚠️ **Line 309** (Generic Placeholders): `'FB_NEW_PAGE_ACCESS_TOKEN': '[to_be_filled]',`

### 📁 `automation/weekly-experiment-tracker.js`

- ⚠️ **Line 86** (Generic Placeholders): `// Check current website analytics (placeholder - would integrate with Google Analytics)`
- ⚠️ **Line 334** (Generic Placeholders): `// Placeholder functions for real analytics integration`
- ⚠️ **Line 336** (Generic Placeholders): `// TODO: Integrate with Google Analytics API`
- ⚠️ **Line 461** (Generic Placeholders): `// Placeholder for Facebook API integration`
- ⚠️ **Line 466** (Generic Placeholders): `// Placeholder for website analytics`

### 📁 `blog.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 156** (Generic Placeholders): `<input type="search" id="search-input" placeholder="Search articles..." class="search-input" aria-label="Search for articles">`
- ⚠️ **Line 181** (Generic Placeholders): `<img src="https://via.placeholder.com/800x400/1A73E8/ffffff?text=MacBook+vs+Windows" alt="Side-by-side comparison of MacBook Pro and Windows laptop showing specs and features" class="deal-image" itemp`
- ⚠️ **Line 232** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=iPhone+14+Review" alt="iPhone 14 Pro on desk with testing equipment and review notes" itemprop="image">`
- ⚠️ **Line 258** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Setup" alt="Modern living room with smart home devices including Echo, smart lights, and security camera" itemprop="image">`
- ⚠️ **Line 284** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Gaming+Deals" alt="Gaming laptop with RGB keyboard and graphics showcasing RTX 4060 performance benchmarks" itemprop="image">`
- ⚠️ **Line 310** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Refurbished+Tips" alt="Hands inspecting refurbished laptop with checklist and magnifying glass showing quality assessment" itemprop="im`
- ⚠️ **Line 336** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=AirPods+Pro+2" alt="AirPods Pro 2nd generation in open box next to new retail package with sound quality testing equipment" itemprop="i`
- ⚠️ **Line 362** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Monitor+Setup" alt="Dual monitor workspace setup with open-box monitors, cables, and productivity tools arranged on desk" itemprop="ima`
- ⚠️ **Line 388** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=ThinkPad+X1+Carbon" alt="Refurbished ThinkPad X1 Carbon laptop showing build quality inspection and performance benchmarks" itemprop="i`
- ⚠️ **Line 418** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Security" alt="Smart home security system setup with cameras, sensors, and mobile app dashboard showing monitoring features"`
- ⚠️ **Line 448** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/34A853/ffffff?text=Refurbished+Pixel+8" alt="A refurbished Google Pixel 8 phone being inspected for quality." itemprop="image">`
- ⚠️ **Line 471** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/F9AB00/ffffff?text=Smart+Lighting" alt="A living room showing off a smart lighting setup with multiple colors." itemprop="image">`
- ⚠️ **Line 505** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 508** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `blog/affiliate-shopping-tips.html`

- ⚠️ **Line 371** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `blog/seo-trending-deals-2025.html`

- ⚠️ **Line 333** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `blog/template.html`

- ⚠️ **Line 263** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `config/deal-verifier.config.json`

- 🔸 **Line 36** (Example Domains): `"blockedDomains": ["dealradarus.com", "localhost", "127.0.0.1"],`

### 📁 `config/real-values-mapping.js`

- ⚠️ **Line 2** (Generic Placeholders): `* Real Values Mapping for Placeholder Replacement`
- 💡 **Line 11** (Test/Dev Patterns): `'YOUR_SECRET_KEY': 'dev-secret-key-67890',`
- 🔸 **Line 12** (Example Domains): `'YOUR_DATABASE_URL': 'postgresql://user:pass@localhost:5432/dealradar_dev',`
- 🔸 **Line 13** (Example Domains): `'YOUR_REDIS_URL': 'redis://localhost:6379/0',`
- 🔸 **Line 14** (Example Domains): `'YOUR_FRONTEND_URL': 'http://localhost:3000',`
- ⚠️ **Line 15** (Generic Placeholders): `'YOUR_DOMAIN': 'localhost:3001',`
- 🔸 **Line 15** (Example Domains): `'YOUR_DOMAIN': 'localhost:3001',`
- ⚠️ **Line 26** (Generic Placeholders): `'YOUR_DOMAIN': '${DOMAIN}',`
- 💡 **Line 33** (Test/Dev Patterns): `'YOUR_SECRET_KEY': 'test-secret-key-67890',`
- 🔸 **Line 35** (Example Domains): `'YOUR_REDIS_URL': 'redis://localhost:6380/0',`
- 🔸 **Line 36** (Example Domains): `'YOUR_FRONTEND_URL': 'http://localhost:3001',`
- ⚠️ **Line 37** (Generic Placeholders): `'YOUR_DOMAIN': 'localhost:3001',`
- 🔸 **Line 37** (Example Domains): `'YOUR_DOMAIN': 'localhost:3001',`
- ⚠️ **Line 109** (Generic Placeholders): `'your-secret-key-here': '${SECRET_KEY}',`
- 🔸 **Line 125** (Example Domains): `'example.com': 'dealradarus.com',`
- ⚠️ **Line 127** (Generic Placeholders): `'yourdomain.com': 'dealradarus.com',`
- 🔸 **Line 128** (Example Domains): `'localhost:3000': process.env.NODE_ENV === 'production' ? 'dealradarus.com' : 'localhost:3000'`
- 🔸 **Line 135** (Example Domains): `'localhost:5432': process.env.NODE_ENV === 'production' ? '${DB_HOST}:${DB_PORT}' : 'localhost:5432'`
- ⚠️ **Line 138** (Generic Placeholders): `// Common placeholder patterns`
- 🔸 **Line 150** (Example Domains): `'contact@example.com': 'contact@dealradarus.com',`
- 🔸 **Line 151** (Example Domains): `'support@example.com': 'support@dealradarus.com',`
- 🔸 **Line 152** (Example Domains): `'admin@example.com': 'admin@dealradarus.com',`
- 🔸 **Line 155** (Example Domains): `'https://example.com': 'https://dealradarus.com',`
- 🔸 **Line 156** (Example Domains): `'http://localhost:3000': process.env.NODE_ENV === 'production' ? 'https://dealradarus.com' : 'http://localhost:3000',`
- 🔸 **Line 172** (Example Domains): `'admin@example.com',`
- 🔸 **Line 175** (Example Domains): `'example@example.com'`
- 🔸 **Line 183** (Example Domains): `'https://example.com',`
- 🔸 **Line 184** (Example Domains): `'http://localhost:3000',`
- ⚠️ **Line 186** (Generic Placeholders): `'https://yourdomain.com'`
- ⚠️ **Line 196** (Generic Placeholders): `'api-key-placeholder',`
- ⚠️ **Line 197** (Generic Placeholders): `'insert-your-key-here'`
- 🔸 **Line 205** (Example Domains): `'postgresql://user:password@localhost:5432/database',`
- 🔸 **Line 206** (Example Domains): `'mysql://user:password@localhost:3306/database',`
- 🔸 **Line 207** (Example Domains): `'mongodb://localhost:27017/database'`
- ⚠️ **Line 270** (Generic Placeholders): `getRealValue: (placeholder, environment = 'development') => {`
- ⚠️ **Line 272** (Generic Placeholders): `if (realValuesMapping.environments[environment] && realValuesMapping.environments[environment][placeholder]) {`
- ⚠️ **Line 273** (Generic Placeholders): `return realValuesMapping.environments[environment][placeholder];`
- ⚠️ **Line 278** (Generic Placeholders): `if (realValuesMapping.services[service][placeholder]) {`
- ⚠️ **Line 279** (Generic Placeholders): `return realValuesMapping.services[service][placeholder];`
- ⚠️ **Line 284** (Generic Placeholders): `if (realValuesMapping.common[placeholder]) {`
- ⚠️ **Line 285** (Generic Placeholders): `return realValuesMapping.common[placeholder];`
- ⚠️ **Line 289** (Generic Placeholders): `if (realValuesMapping.domains[placeholder]) {`
- ⚠️ **Line 290** (Generic Placeholders): `return realValuesMapping.domains[placeholder];`
- ⚠️ **Line 294** (Generic Placeholders): `if (realValuesMapping.database[placeholder]) {`
- ⚠️ **Line 295** (Generic Placeholders): `return realValuesMapping.database[placeholder];`
- ⚠️ **Line 301** (Generic Placeholders): `getSecurityLevel: (placeholder) => {`
- ⚠️ **Line 302** (Generic Placeholders): `const lowerPlaceholder = placeholder.toLowerCase();`

### 📁 `cypress.config.js`

- 🔸 **Line 5** (Example Domains): `baseUrl: 'http://localhost:3000',`
- 🔸 **Line 26** (Example Domains): `apiUrl: 'http://localhost:3001',`

### 📁 `cypress/support/commands.js`

- ⚠️ **Line 215** (Generic Placeholders): `'input[placeholder*="title"]': 'review-title',`
- ⚠️ **Line 216** (Generic Placeholders): `'textarea[placeholder*="review"]': 'review-content',`
- ⚠️ **Line 217** (Generic Placeholders): `'textarea[placeholder*="comment"]': 'comment-textarea',`

### 📁 `data/affiliate-links.json`

- 🔸 **Line 76** (Example Domains): `"url": "https://example.com/product",`
- ⚠️ **Line 78** (Generic Placeholders): `"issue": "Placeholder URL needs replacement",`
- 🔸 **Line 82** (Example Domains): `"url": "https://example.com/deal",`
- ⚠️ **Line 84** (Generic Placeholders): `"issue": "Placeholder URL needs replacement",`

### 📁 `data/subscribers.json`

- 🔸 **Line 3** (Example Domains): `"test@example.com"`

### 📁 `data/verification-reports/deal-link-verification-2025-08-26T22-32-32-591Z.html`

- ⚠️ **Line 41** (Generic Placeholders): `<div class="metric-label">Placeholder Links</div>`
- ⚠️ **Line 55** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 55** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 60** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 60** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 65** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 65** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 70** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 70** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 75** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 75** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 80** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 80** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 85** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 85** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 90** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 90** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 95** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 95** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 100** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 100** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 105** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 105** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 110** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 110** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 115** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 115** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 120** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 120** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 125** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 125** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 130** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 130** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 135** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 135** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 140** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 140** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 145** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 145** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 150** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 150** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 155** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 155** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 160** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 160** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 165** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 165** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 170** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 170** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 175** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 175** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 180** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 180** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 185** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 185** (Example Domains): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 293** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 299** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 299** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 304** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 310** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 310** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 315** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 321** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 321** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 326** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 332** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 332** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 337** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 343** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 343** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 348** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 354** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 354** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 359** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 365** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 365** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 370** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 376** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 376** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 381** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 387** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 387** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 436** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 442** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 442** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 447** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 453** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 453** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 458** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 464** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 464** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 469** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 475** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 475** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 480** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 486** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 486** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 491** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 497** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 497** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 502** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 508** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 508** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 513** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 519** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 519** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 524** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 530** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 530** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 623** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 629** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 629** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 634** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 640** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 640** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 645** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 651** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 651** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 656** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 662** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 662** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 667** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 673** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 673** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 678** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 684** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 684** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 689** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 695** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 695** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 700** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 706** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 706** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 711** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 717** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 717** (Example Domains): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`

### 📁 `data/verification-reports/deal-link-verification-2025-08-26T22-32-32-591Z.json`

- 🔸 **Line 301** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 302** (Example Domains): `"originalUrl": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 318** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 319** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 329** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 330** (Example Domains): `"originalUrl": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 346** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 347** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 357** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 358** (Example Domains): `"originalUrl": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 374** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 375** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 385** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 386** (Example Domains): `"originalUrl": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 402** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 403** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 413** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 414** (Example Domains): `"originalUrl": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 430** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 431** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 458** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 459** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 486** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 487** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 514** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 515** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 542** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 543** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 736** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 737** (Example Domains): `"originalUrl": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 753** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 754** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 764** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 765** (Example Domains): `"originalUrl": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 781** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 782** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 792** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 793** (Example Domains): `"originalUrl": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 809** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 810** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 820** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 821** (Example Domains): `"originalUrl": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 837** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 838** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 848** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 849** (Example Domains): `"originalUrl": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 865** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 866** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 893** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 894** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 921** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 922** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 949** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 950** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 977** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 978** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1382** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1383** (Example Domains): `"originalUrl": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1399** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1400** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1410** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1411** (Example Domains): `"originalUrl": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1427** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1428** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1438** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1439** (Example Domains): `"originalUrl": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1455** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1456** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1466** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1467** (Example Domains): `"originalUrl": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1483** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1484** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1494** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1495** (Example Domains): `"originalUrl": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1511** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1512** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1539** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1540** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1567** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1568** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1595** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1596** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1623** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1624** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1657** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1660** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1661** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1665** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1668** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1669** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1673** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1676** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1677** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1681** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1684** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1685** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1689** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1692** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1693** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1700** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1701** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1708** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1709** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1716** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1717** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1724** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1725** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1729** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1732** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1733** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1737** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1740** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1741** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1745** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1748** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1749** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1753** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1756** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1757** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1761** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1764** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1765** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1772** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1773** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1780** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1781** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1788** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1789** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1796** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1797** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1801** (Example Domains): `"url": "https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1804** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1805** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1809** (Example Domains): `"url": "https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1812** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1813** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1817** (Example Domains): `"url": "https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1820** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1821** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1825** (Example Domains): `"url": "https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1828** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1829** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1833** (Example Domains): `"url": "https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid",`
- 🔸 **Line 1836** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1837** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1844** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1845** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1852** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1853** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1860** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1861** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`
- 🔸 **Line 1868** (Example Domains): `"Blocked domain detected: example.com",`
- ⚠️ **Line 1869** (Generic Placeholders): `"Placeholder URL - needs to be replaced with real affiliate link"`

### 📁 `deal-aggregator/core/crawl/crawl-multi-sources.js`

- ⚠️ **Line 85** (Generic Placeholders): `image: `https://via.placeholder.com/300x300?text=${sourceConfig.name}+${i + 1}`,`

### 📁 `deal-aggregator/core/process/enrich-deals.js`

- ⚠️ **Line 142** (Generic Placeholders): `// Show sample caption`
- ⚠️ **Line 143** (Generic Placeholders): `console.log('\n=== SAMPLE CAPTION ===');`
- ⚠️ **Line 145** (Generic Placeholders): `console.log('\n=== SAMPLE AFFILIATE URL ===');`

### 📁 `deal-aggregator/core/utils/__tests__/config.test.js`

- ⚠️ **Line 141** (Generic Placeholders): `FB_PAGE_ID: 'YOUR_PAGE_ID', // Default placeholder`
- ⚠️ **Line 153** (Generic Placeholders): `FB_PAGE_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN' // Default placeholder`

### 📁 `deal-aggregator/core/utils/__tests__/facebook-api.test.js`

- 🔸 **Line 196** (Example Domains): `link: 'https://example.com'`

### 📁 `deal-aggregator/core/utils/config.js`

- ⚠️ **Line 2** (Generic Placeholders): `* TODO: CONFIG UTILITY MODULE`
- ⚠️ **Line 21** (Generic Placeholders): `* TODO IMPLEMENTATION:`

### 📁 `deal-aggregator/data/logs/feasibility-multi-sources.md`

- ⚠️ **Line 14** (Generic Placeholders): `| Source | Region | Attempted | Success | Sample Deals | Status |`
- ⚠️ **Line 40** (Generic Placeholders): `- **Screenshot Success:** 100% (10/10 placeholder images created)`
- ⚠️ **Line 55** (Generic Placeholders): `- Page ID: ❌ Placeholder value detected`
- ⚠️ **Line 56** (Generic Placeholders): `- Access Token: ❌ Placeholder value detected`
- ⚠️ **Line 178** (Generic Placeholders): `- `./media/` - 10 product screenshots (placeholder format)`

### 📁 `deal-aggregator/data/logs/feasibility-report-final.md`

- ⚠️ **Line 112** (Generic Placeholders): `| **≥6 raw deals** | ✅ **8 deals** | US: 5, UK: 3 in `raw-sample.jsonl` |`
- ⚠️ **Line 126** (Generic Placeholders): `1. `raw-sample.jsonl` - Raw deal data (8 items)`
- ⚠️ **Line 127** (Generic Placeholders): `2. `enriched-sample.jsonl` - Processed deals (4 items)`

### 📁 `deal-aggregator/data/logs/summary-dryrun.md`

- ⚠️ **Line 15** (Generic Placeholders): `- **Source File**: `~/mcp/playwright-mcp/output/deals/raw-sample.jsonl``
- ⚠️ **Line 24** (Generic Placeholders): `- **Source File**: `~/mcp/playwright-mcp/output/deals/enriched-sample.jsonl``
- ⚠️ **Line 70** (Generic Placeholders): `1. **Raw Data**: `/Users/admin/mcp/playwright-mcp/output/deals/raw-sample.jsonl` (8 deals)`
- ⚠️ **Line 71** (Generic Placeholders): `2. **Enriched Data**: `/Users/admin/mcp/playwright-mcp/output/deals/enriched-sample.jsonl` (4 deals)`

### 📁 `deal-aggregator/docs/README.md`

- ⚠️ **Line 60** (Generic Placeholders): `- [ ] **Cập nhật Config**: Replace placeholder values trong .env.local.json`

### 📁 `deal-aggregator/docs/cj-affiliate-vietnam-registration.md`

- ⚠️ **Line 54** (Generic Placeholders): `- **URL website** (https://yourdomain.com)`

### 📁 `deal-aggregator/docs/mcp-setup-complete.md`

- 🔸 **Line 142** (Example Domains): `# postgresql://username:password@localhost:5432/dealradarus_db`

### 📁 `deal-aggregator/platforms/facebook/facebook-post.js`

- ⚠️ **Line 64** (Generic Placeholders): `// TODO: For real posting, use: await facebookAPI.postMessage({ message: deal.caption, link: deal.affiliateUrl })`

### 📁 `deal-aggregator/platforms/facebook/test-facebook-access.js`

- ⚠️ **Line 105** (Generic Placeholders): `console.log('❌ Environment contains placeholder values');`

### 📁 `deal-aggregator/platforms/facebook/test-media-post.js`

- ⚠️ **Line 21** (Generic Placeholders): `const photoPath = path.join(__dirname, '../../../media/sample.jpg');`
- ⚠️ **Line 47** (Generic Placeholders): `console.log('SKIPPED: `ffmpeg` is not available in the environment to create a sample video file.');`
- ⚠️ **Line 50** (Generic Placeholders): `const videoPath = path.join(__dirname, '../../../media/sample.mp4');`

### 📁 `deal-aggregator/platforms/website/js/shared/__tests__/dom-utils.test.js`

- 💡 **Line 106** (Test/Dev Patterns): `const saved = saveState('testKey', testState);`
- 💡 **Line 109** (Test/Dev Patterns): `const loaded = loadState('testKey');`
- 💡 **Line 131** (Test/Dev Patterns): `const result = saveState('testKey', { test: 'data' });`

### 📁 `deal-aggregator/platforms/website/pages/about.html`

- ⚠️ **Line 47** (Generic Placeholders): `<h2>Our Team (TODO: Add real team photos/bios)</h2>`

### 📁 `deal-aggregator/platforms/website/pages/blog.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 124** (Generic Placeholders): `<input type="search" id="search-input" placeholder="Search articles..." class="search-input" aria-label="Search for articles">`
- ⚠️ **Line 149** (Generic Placeholders): `<img src="https://via.placeholder.com/800x400/1A73E8/ffffff?text=MacBook+vs+Windows" alt="Side-by-side comparison of MacBook Pro and Windows laptop showing specs and features" class="deal-image" itemp`
- ⚠️ **Line 200** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=iPhone+14+Review" alt="iPhone 14 Pro on desk with testing equipment and review notes" itemprop="image">`
- ⚠️ **Line 226** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Setup" alt="Modern living room with smart home devices including Echo, smart lights, and security camera" itemprop="image">`
- ⚠️ **Line 252** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Gaming+Deals" alt="Gaming laptop with RGB keyboard and graphics showcasing RTX 4060 performance benchmarks" itemprop="image">`
- ⚠️ **Line 278** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Refurbished+Tips" alt="Hands inspecting refurbished laptop with checklist and magnifying glass showing quality assessment" itemprop="im`
- ⚠️ **Line 304** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=AirPods+Pro+2" alt="AirPods Pro 2nd generation in open box next to new retail package with sound quality testing equipment" itemprop="i`
- ⚠️ **Line 330** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Monitor+Setup" alt="Dual monitor workspace setup with open-box monitors, cables, and productivity tools arranged on desk" itemprop="ima`
- ⚠️ **Line 356** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=ThinkPad+X1+Carbon" alt="Refurbished ThinkPad X1 Carbon laptop showing build quality inspection and performance benchmarks" itemprop="i`
- ⚠️ **Line 386** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Security" alt="Smart home security system setup with cameras, sensors, and mobile app dashboard showing monitoring features"`
- ⚠️ **Line 416** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/34A853/ffffff?text=Refurbished+Pixel+8" alt="A refurbished Google Pixel 8 phone being inspected for quality." itemprop="image">`
- ⚠️ **Line 439** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/F9AB00/ffffff?text=Smart+Lighting" alt="A living room showing off a smart lighting setup with multiple colors." itemprop="image">`
- ⚠️ **Line 473** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 476** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `deal-aggregator/platforms/website/pages/contact.html`

- ⚠️ **Line 44** (Generic Placeholders): `<p><strong>Phone:</strong> (555) 123-4567 (TODO: Add real phone number or remove)</p>`

### 📁 `deal-aggregator/platforms/website/pages/deals.html`

- ⚠️ **Line 66** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 361** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 364** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `deal-aggregator/platforms/website/pages/index.html`

- ⚠️ **Line 91** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 192** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=iPhone+14" alt="iPhone 14 Pro Max Refurbished" class="deal-image">`
- ⚠️ **Line 203** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Amazon+Echo" alt="Amazon Echo Dot 5th Generation" class="deal-image">`
- ⚠️ **Line 214** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Gaming+Monitor" alt="27 inch Gaming Monitor 144Hz" class="deal-image">`
- ⚠️ **Line 225** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=AirPods+Pro" alt="AirPods Pro 2nd Generation" class="deal-image">`
- ⚠️ **Line 245** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 248** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `deal-aggregator/platforms/website/pages/privacy.html`

- ⚠️ **Line 39** (Generic Placeholders): `<p><strong>TODO: This is a template. It requires a full review by a legal professional.</strong></p>`

### 📁 `deal-aggregator/scripts/post-test-message.js`

- ⚠️ **Line 28** (Generic Placeholders): `console.log(`🔑 Token: ${FB_ACCESS_TOKEN.length > 20 ? '[Valid length]' : '[Placeholder]'}`);`

### 📁 `deal-aggregator/scripts/setup-mcp-stack.sh`

- 🔸 **Line 148** (Example Domains): `"POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/dealradarus_db"`
- 🔸 **Line 221** (Example Domains): `sed -i.bak "s|postgresql://username:password@localhost:5432/dealradarus_db|$POSTGRES_URL|g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"`
- ⚠️ **Line 327** (Generic Placeholders): `-- Insert sample data for testing`
- ⚠️ **Line 405** (Generic Placeholders): `// Check for placeholder values`

### 📁 `deals.html`

- ⚠️ **Line 125** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 465** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 468** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `docs/M3.9-PLACEHOLDER-AUDIT-GUIDE.md`

- ⚠️ **Line 1** (Generic Placeholders): `# M3.9 Enhanced Placeholder Audit - User Guide`
- ⚠️ **Line 11** (Generic Placeholders): `The M3.9 Enhanced Placeholder Audit is a comprehensive security and configuration validation tool designed to identify, validate, and automatically fix placeholder values in your codebase. This enterp`
- ⚠️ **Line 65** (Generic Placeholders): `node tools/placeholder-audit.js`
- ⚠️ **Line 68** (Generic Placeholders): `node tools/placeholder-audit.js --verbose`
- ⚠️ **Line 71** (Generic Placeholders): `node tools/placeholder-audit.js --fix`
- ⚠️ **Line 74** (Generic Placeholders): `node tools/placeholder-audit.js --fix custom-fixes.json`
- ⚠️ **Line 77** (Generic Placeholders): `node tools/placeholder-audit.js --report MY-AUDIT.md`
- ⚠️ **Line 80** (Generic Placeholders): `node tools/placeholder-audit.js --fix --dry-run`
- ⚠️ **Line 83** (Generic Placeholders): `DISABLE_WORKERS=true node tools/placeholder-audit.js`
- ⚠️ **Line 100** (Generic Placeholders): `The tool uses `config/real-values-mapping.js` for intelligent placeholder replacement:`
- 🔸 **Line 107** (Example Domains): `'YOUR_DATABASE_URL': 'postgresql://user:pass@localhost:5432/db_dev'`
- ⚠️ **Line 123** (Generic Placeholders): `"example.com": "yourdomain.com",`
- 🔸 **Line 123** (Example Domains): `"example.com": "yourdomain.com",`
- ⚠️ **Line 135** (Generic Placeholders): `- `placeholder`, `change-me`, `replace-me`, `to-be-filled``
- ⚠️ **Line 136** (Generic Placeholders): `- `your-*`, `dummy`, `sample`, `tbd`, `todo`, `fixme``
- 🚨 **Line 139** (Analytics Placeholders): `- **Google Analytics**: `G-XXXXXXXXXX`, `G-TEST*`, `UA-*``
- 🚨 **Line 140** (GTM Placeholders): `- **Google Tag Manager**: `GTM-XXXXXXX`, `GTM-TEST*``
- 🔸 **Line 142** (Example Domains): `- **URLs**: `example.com`, `localhost`, `127.0.0.1``
- 🔸 **Line 143** (Example Domains): `- **Emails**: `*@example.com`, `test@*`, `admin@localhost``
- 🔸 **Line 144** (Example Domains): `- **Databases**: Test connection strings, `localhost` databases`
- 🚨 **Line 147** (Hardcoded Credentials): `- Hardcoded credentials: `password=123456`, `pass=admin``
- 🚨 **Line 167** (Hardcoded Credentials): `| **Critical** | Hardcoded credentials, production secrets | `password=123456`, weak JWT secrets |`
- 🔸 **Line 214** (Example Domains): `DATABASE_URL=postgresql://user:pass@localhost:5432/dealradar_dev`
- 🔸 **Line 221** (Example Domains): `"domain": "example.com"`
- ⚠️ **Line 255** (Generic Placeholders): `- name: Placeholder Audit`
- ⚠️ **Line 269** (Generic Placeholders): `echo "❌ Placeholder audit failed. Fix issues before committing."`
- ⚠️ **Line 317** (Generic Placeholders): `node tools/placeholder-audit.js --fix secrets/fix-map.encrypted`
- ⚠️ **Line 345** (Generic Placeholders): `- **Cause**: Placeholder audit found in running server logs`
- ⚠️ **Line 370** (Generic Placeholders): `// In tools/placeholder-audit.js`
- ⚠️ **Line 384** (Generic Placeholders): `curl -X POST $SLACK_WEBHOOK -d '{"text":"🚨 Critical security issues found in placeholder audit!"}'`
- ⚠️ **Line 419** (Generic Placeholders): `2. **During development**: Use meaningful placeholder names`
- ⚠️ **Line 449** (Generic Placeholders): `**M3.9 Enhanced Placeholder Audit - Enterprise Grade Security Tool**`

### 📁 `docs/api/DealRadarUS-Auth-API.postman_collection.json`

- 💡 **Line 34** (Test/Dev Patterns): `"raw": "{\n  \"email\": \"{{testEmail}}\",\n  \"password\": \"{{testPassword}}\",\n  \"first_name\": \"Test\",\n  \"last_name\": \"User\",\n  \"newsletter_subscribed\": true\n}"`
- 💡 **Line 56** (Test/Dev Patterns): `"raw": "{\n  \"email\": \"{{testEmail}}\",\n  \"password\": \"{{testPassword}}\"\n}"`
- 💡 **Line 216** (Test/Dev Patterns): `"raw": "{\n  \"current_password\": \"{{testPassword}}\",\n  \"new_password\": \"{{newPassword}}\"\n}"`
- 💡 **Line 265** (Test/Dev Patterns): `"if (!pm.environment.get('testPassword')) {",`
- 💡 **Line 266** (Test/Dev Patterns): `"    pm.environment.set('testPassword', 'TestPass123!');",`
- 🔸 **Line 317** (Example Domains): `"value": "http://localhost:3001",`
- 💡 **Line 326** (Test/Dev Patterns): `"key": "testPassword",`

### 📁 `docs/api/M3.2-Filters-Alerts-Postman.json`

- 🔸 **Line 11** (Example Domains): `"value": "http://localhost:3001",`

### 📁 `docs/api/M3.3-UGC-API.postman_collection.json`

- 🔸 **Line 18** (Example Domains): `"pm.globals.set('baseUrl', 'http://localhost:3001');",`
- 🔸 **Line 27** (Example Domains): `"value": "http://localhost:3001"`

### 📁 `docs/api/M3.5-MONITORING.postman_collection.json`

- 🔸 **Line 11** (Example Domains): `"value": "http://localhost:3001",`
- 🔸 **Line 17** (Example Domains): `"value": "http://localhost:3000",`

### 📁 `docs/reports/gsc-submission-checklist.json`

- ⚠️ **Line 11** (Generic Placeholders): `"instructions": "Download from GSC, replace placeholder file, upload to root"`

### 📁 `handoff/claude_worklog.md`

- ⚠️ **Line 15** (Generic Placeholders): `- `media/sample.jpg` - Sample image file exists`
- ⚠️ **Line 27** (Generic Placeholders): `- `FB_PAGE_ID`: Currently set to placeholder "YOUR_PAGE_ID"`
- ⚠️ **Line 28** (Generic Placeholders): `- `FB_PAGE_ACCESS_TOKEN`: Currently set to placeholder "YOUR_ACCESS_TOKEN"`
- ⚠️ **Line 36** (Generic Placeholders): `- **Result:** ❌ OAuthException (code 190) - Expected with placeholder tokens`
- ⚠️ **Line 40** (Generic Placeholders): `- **Result:** ❌ OAuthException (code 190) - Expected with placeholder tokens`
- ⚠️ **Line 41** (Generic Placeholders): `- **Media Status:** Sample image exists at media/sample.jpg`
- ⚠️ **Line 54** (Generic Placeholders): `- Automatic sample video creation (3-second MP4 with text overlay)`
- ⚠️ **Line 93** (Generic Placeholders): `- Sample image available at media/sample.jpg`
- ⚠️ **Line 102** (Generic Placeholders): `- Page ID and Access Token are placeholder values`

### 📁 `handoff/qa_worklog.md`

- ⚠️ **Line 13** (Generic Placeholders): `- `/sitemap.xml` - CREATED - 7 main pages mapped (using example.com placeholder)`
- 🔸 **Line 13** (Example Domains): `- `/sitemap.xml` - CREATED - 7 main pages mapped (using example.com placeholder)`
- ⚠️ **Line 15** (Generic Placeholders): `- `favicon.ico` - CREATED - Placeholder file (HTML link already existed)`
- ⚠️ **Line 22** (Generic Placeholders): `### TODO REMAINING (Next Batches)`
- ⚠️ **Line 42** (Generic Placeholders): `**2025-08-22T17:06:45Z - Social Links Placeholder Update**`
- ⚠️ **Line 43** (Generic Placeholders): `- `index.html social icons` - UPDATED - Changed to explicit placeholders with TODO`
- ⚠️ **Line 44** (Generic Placeholders): `- `blog.html social icons` - UPDATED - Changed to explicit placeholders with TODO`
- ⚠️ **Line 45** (Generic Placeholders): `- `deals.html social icons` - UPDATED - Changed to explicit placeholders with TODO`
- ⚠️ **Line 46** (Generic Placeholders): `- **Status:** All links marked with "PLACEHOLDER" and TODO comment for future replacement`
- ⚠️ **Line 50** (Generic Placeholders): `- **Values:** "TODO-AMAZON-US", "TODO-AMAZON-UK" (ready for actual affiliate IDs)`
- ⚠️ **Line 53** (Generic Placeholders): `- `index.html newsletter form` - ANNOTATED - Added TODO comment for backend integration`
- ⚠️ **Line 54** (Generic Placeholders): `- `blog.html newsletter form` - ANNOTATED - Added TODO comment for backend integration`
- ⚠️ **Line 55** (Generic Placeholders): `- `deals.html newsletter form` - ANNOTATED - Added TODO comment for backend integration`
- ⚠️ **Line 73** (Generic Placeholders): `- `about.html` - CREATED - Full HTML5 skeleton with navigation and TODO content placeholders`
- ⚠️ **Line 74** (Generic Placeholders): `- `contact.html` - CREATED - Full HTML5 skeleton with contact form TODO and info placeholders`
- ⚠️ **Line 76** (Generic Placeholders): `- `affiliate-disclosure.html` - CREATED - Full HTML5 skeleton with affiliate program disclosures TODO`
- ⚠️ **Line 79** (Generic Placeholders): `- `index.html <head>` - UPDATED - Added GA4, GSC, and Facebook Pixel TODO comments`
- ⚠️ **Line 80** (Generic Placeholders): `- `blog.html <head>` - UPDATED - Added GA4, GSC, and Facebook Pixel TODO comments`
- ⚠️ **Line 81** (Generic Placeholders): `- `deals.html <head>` - UPDATED - Added GA4, GSC, and Facebook Pixel TODO comments`
- ⚠️ **Line 88** (Generic Placeholders): `- **Social Placeholders:** All pages include social media placeholder structure`
- ⚠️ **Line 93** (Generic Placeholders): `- **Items Prepared:** 7/28 additional checklist items (skeleton/placeholder stage)`
- ⚠️ **Line 118** (Generic Placeholders): `- TODO: Team photos and detailed bios for future`
- ⚠️ **Line 147** (Generic Placeholders): `- **GA4 Tracking ID:** G-ABCD123456 (placeholder format)`
- ⚠️ **Line 149** (Generic Placeholders): `- **Facebook Pixel ID:** 1234567890123456 (placeholder format)`
- ⚠️ **Line 159** (Generic Placeholders): `- **Tracking:** Full analytics implementation with realistic placeholder IDs`
- ⚠️ **Line 171** (Generic Placeholders): `All placeholder systems ready for production configuration.`

### 📁 `home.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 92** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 193** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=iPhone+14" alt="iPhone 14 Pro Max Refurbished" class="deal-image">`
- ⚠️ **Line 204** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Amazon+Echo" alt="Amazon Echo Dot 5th Generation" class="deal-image">`
- ⚠️ **Line 215** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Gaming+Monitor" alt="27 inch Gaming Monitor 144Hz" class="deal-image">`
- ⚠️ **Line 226** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=AirPods+Pro" alt="AirPods Pro 2nd Generation" class="deal-image">`
- ⚠️ **Line 248** (Generic Placeholders): `<input type="email" id="newsletter-email" name="email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `index.html`

- ⚠️ **Line 128** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 358** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `js/shared/__tests__/dom-utils.test.js`

- 💡 **Line 106** (Test/Dev Patterns): `const saved = saveState('testKey', testState);`
- 💡 **Line 109** (Test/Dev Patterns): `const loaded = loadState('testKey');`
- 💡 **Line 131** (Test/Dev Patterns): `const result = saveState('testKey', { test: 'data' });`

### 📁 `package.json`

- ⚠️ **Line 27** (Generic Placeholders): `"audit:placeholders": "node tools/placeholder-audit.js --verbose",`
- ⚠️ **Line 28** (Generic Placeholders): `"audit:placeholders:fix": "node tools/placeholder-audit.js --verbose --fix",`
- ⚠️ **Line 29** (Generic Placeholders): `"audit:placeholders:report": "node tools/placeholder-audit.js --verbose --report PLACEHOLDER-AUDIT-REPORT.md",`
- ⚠️ **Line 30** (Generic Placeholders): `"audit:placeholders:ci": "node tools/placeholder-audit.js --report CI-PLACEHOLDER-AUDIT.md",`
- ⚠️ **Line 31** (Generic Placeholders): `"precommit:audit": "node tools/placeholder-audit.js"`

### 📁 `pages/blog.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 192** (Generic Placeholders): `<input type="search" id="search-input" placeholder="Search articles..." class="search-input" aria-label="Search for articles">`
- ⚠️ **Line 541** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 544** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `pages/deals.html`

- ⚠️ **Line 161** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 456** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 459** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `pages/index.html`

- ⚠️ **Line 91** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 245** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 248** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `public/blog.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 156** (Generic Placeholders): `<input type="search" id="search-input" placeholder="Search articles..." class="search-input" aria-label="Search for articles">`
- ⚠️ **Line 181** (Generic Placeholders): `<img src="https://via.placeholder.com/800x400/1A73E8/ffffff?text=MacBook+vs+Windows" alt="Side-by-side comparison of MacBook Pro and Windows laptop showing specs and features" class="deal-image" itemp`
- ⚠️ **Line 232** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=iPhone+14+Review" alt="iPhone 14 Pro on desk with testing equipment and review notes" itemprop="image">`
- ⚠️ **Line 258** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Setup" alt="Modern living room with smart home devices including Echo, smart lights, and security camera" itemprop="image">`
- ⚠️ **Line 284** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Gaming+Deals" alt="Gaming laptop with RGB keyboard and graphics showcasing RTX 4060 performance benchmarks" itemprop="image">`
- ⚠️ **Line 310** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Refurbished+Tips" alt="Hands inspecting refurbished laptop with checklist and magnifying glass showing quality assessment" itemprop="im`
- ⚠️ **Line 336** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=AirPods+Pro+2" alt="AirPods Pro 2nd generation in open box next to new retail package with sound quality testing equipment" itemprop="i`
- ⚠️ **Line 362** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Monitor+Setup" alt="Dual monitor workspace setup with open-box monitors, cables, and productivity tools arranged on desk" itemprop="ima`
- ⚠️ **Line 388** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=ThinkPad+X1+Carbon" alt="Refurbished ThinkPad X1 Carbon laptop showing build quality inspection and performance benchmarks" itemprop="i`
- ⚠️ **Line 418** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/1A73E8/ffffff?text=Smart+Home+Security" alt="Smart home security system setup with cameras, sensors, and mobile app dashboard showing monitoring features"`
- ⚠️ **Line 448** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/34A853/ffffff?text=Refurbished+Pixel+8" alt="A refurbished Google Pixel 8 phone being inspected for quality." itemprop="image">`
- ⚠️ **Line 471** (Generic Placeholders): `<img src="https://via.placeholder.com/400x250/F9AB00/ffffff?text=Smart+Lighting" alt="A living room showing off a smart lighting setup with multiple colors." itemprop="image">`
- ⚠️ **Line 505** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 508** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `public/deals.html`

- ⚠️ **Line 125** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 465** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 468** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `public/index.html`

- ⚠️ **Line 128** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 358** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `scripts/README-deal-checker.md`

- ⚠️ **Line 9** (Generic Placeholders): `- ✅ **Issue Detection**: Identifies placeholder URLs, invalid domains, missing parameters`
- ⚠️ **Line 59** (Generic Placeholders): `- 🚨 **Placeholder URLs**: example.com links that need replacement`
- 🔸 **Line 59** (Example Domains): `- 🚨 **Placeholder URLs**: example.com links that need replacement`
- 🔸 **Line 62** (Example Domains): `- 🚫 **Blocked Domains**: localhost, development URLs in production`
- ⚠️ **Line 64** (Generic Placeholders): `## Sample Output`
- ⚠️ **Line 77** (Generic Placeholders): `📋 Would verify 15 non-placeholder links`
- ⚠️ **Line 105** (Generic Placeholders): `2. Fix identified placeholder URLs`

### 📁 `scripts/alerts/evaluate-metrics.js`

- 🔸 **Line 33** (Example Domains): `this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';`
- ⚠️ **Line 42** (Generic Placeholders): `const configPath = path.join(__dirname, 'sample-alerts.json');`

### 📁 `scripts/deal-link-checker.js`

- ⚠️ **Line 99** (Generic Placeholders): `link => link.issues.some(issue => issue.includes('placeholder'))`
- ⚠️ **Line 117** (Generic Placeholders): `// This is a placeholder for HTTP verification`
- ⚠️ **Line 121** (Generic Placeholders): `!link.issues.some(issue => issue.includes('placeholder'))`
- ⚠️ **Line 124** (Generic Placeholders): `console.log(`📋 Would verify ${linksToCheck.length} non-placeholder links`);`
- ⚠️ **Line 240** (Generic Placeholders): `<div class="metric-label">Placeholder Links</div>`
- ⚠️ **Line 313** (Generic Placeholders): `// Verify links (placeholder for now)`
- ⚠️ **Line 322** (Generic Placeholders): `console.log('2. Fix placeholder URLs (example.com links)');`
- 🔸 **Line 322** (Example Domains): `console.log('2. Fix placeholder URLs (example.com links)');`

### 📁 `scripts/final-production-verification.js`

- ⚠️ **Line 54** (Generic Placeholders): `console.log(`   ✅ Database: ${tablesResult.rows[0].count} tables, ${dealsResult.rows[0].count} sample deals`);`

### 📁 `scripts/fix-placeholder-links.js`

- 🔸 **Line 11** (Example Domains): `'https://example.com/macbook-deal?utm_source=site&utm_medium=featured&utm_campaign=dotd':`
- 🔸 **Line 17** (Example Domains): `'https://example.com/iphone14-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':`
- 🔸 **Line 29** (Example Domains): `'https://example.com/airfryer-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':`
- 🔸 **Line 32** (Example Domains): `'https://example.com/kindle-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':`
- 🔸 **Line 35** (Example Domains): `'https://example.com/vacuum-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':`
- 🔸 **Line 38** (Example Domains): `'https://example.com/soundbar-deal?utm_source=site&utm_medium=archive&utm_campaign=grid':`
- ⚠️ **Line 73** (Generic Placeholders): `// Replace all placeholder links`
- ⚠️ **Line 74** (Generic Placeholders): `for (const [placeholder, realLink] of Object.entries(linkReplacements)) {`
- ⚠️ **Line 75** (Generic Placeholders): `if (content.includes(placeholder)) {`
- ⚠️ **Line 76** (Generic Placeholders): `content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), realLink);`
- 🔸 **Line 94** (Example Domains): `console.log(`\n✅ All example.com links replaced with real affiliate links!`);`

### 📁 `scripts/fix-social-media-links.js`

- ⚠️ **Line 4** (Generic Placeholders): `* Replace placeholder href="#" with real social media URLs + UTM tracking`
- ⚠️ **Line 145** (Generic Placeholders): `console.log(`   ℹ️  No social media placeholder links found`);`
- ⚠️ **Line 188** (Generic Placeholders): `console.log('\nℹ️  No placeholder social media links found to fix');`

### 📁 `scripts/generate-gsc-verification-file.js`

- ⚠️ **Line 20** (Generic Placeholders): `// Generate placeholder verification file`
- ⚠️ **Line 26** (Generic Placeholders): `console.log(`📁 Generated placeholder verification file: ${filename}`);`
- ⚠️ **Line 75** (Generic Placeholders): `instructions: 'Download from GSC, replace placeholder file, upload to root'`
- ⚠️ **Line 219** (Generic Placeholders): `console.log('   • google-site-verification-dealradarus.html (placeholder)');`
- ⚠️ **Line 229** (Generic Placeholders): `console.log('   - HTML file (recommended): Replace placeholder file');`

### 📁 `scripts/post-photo.js`

- ⚠️ **Line 30** (Generic Placeholders): `console.log('💡 QUICK TEST WITH PLACEHOLDER:');`
- ⚠️ **Line 31** (Generic Placeholders): `console.log('   Replace placeholder values in config/.env.local.json and run again');`
- ⚠️ **Line 37** (Generic Placeholders): `console.log(`🖼️  Photo: media/sample.jpg\n`);`
- ⚠️ **Line 55** (Generic Placeholders): `console.log('\nSTEP 2: Posting Sample Photo...');`
- ⚠️ **Line 57** (Generic Placeholders): `const photoPath = path.join(__dirname, 'media/sample.jpg');`

### 📁 `scripts/post-video.js`

- ⚠️ **Line 8** (Generic Placeholders): `const videoPath = path.join(__dirname, 'media/sample.mp4');`
- ⚠️ **Line 11** (Generic Placeholders): `console.log('📹 Using existing media/sample.mp4');`
- ⚠️ **Line 15** (Generic Placeholders): `console.log('📹 Creating sample video with ffmpeg...');`
- ⚠️ **Line 21** (Generic Placeholders): `const ffmpegCommand = `ffmpeg -f lavfi -i "color=blue:size=640x480:duration=3" -vf "drawtext=fontsize=30:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='Sample Video Test'" -c:v libx264 -t 3 -pix_`
- ⚠️ **Line 24** (Generic Placeholders): `console.log('✅ Sample video created successfully');`
- ⚠️ **Line 28** (Generic Placeholders): `console.log('⚠️  ffmpeg not available, creating placeholder video file');`
- ⚠️ **Line 33** (Generic Placeholders): `console.log('⚠️  Created placeholder file - real video posting requires actual MP4 file');`
- ⚠️ **Line 62** (Generic Placeholders): `console.log('💡 QUICK TEST WITH PLACEHOLDER:');`
- ⚠️ **Line 63** (Generic Placeholders): `console.log('   Replace placeholder values in config/.env.local.json and run again');`
- ⚠️ **Line 70** (Generic Placeholders): `// Create or use existing sample video`
- ⚠️ **Line 78** (Generic Placeholders): `console.log('2. Or manually add a valid MP4 file to media/sample.mp4');`
- ⚠️ **Line 101** (Generic Placeholders): `console.log('\nSTEP 2: Posting Sample Video...');`

### 📁 `scripts/production-deploy.js`

- ⚠️ **Line 62** (Generic Placeholders): `// Remove TODO comments for production`
- ⚠️ **Line 64** (Generic Placeholders): `pattern: /<!-- GSC Verification: meta name="google-site-verification" content="TODO" -->/g,`
- ⚠️ **Line 66** (Generic Placeholders): `description: 'Remove GSC TODO comment'`
- ⚠️ **Line 70** (Generic Placeholders): `pattern: /<!-- Facebook Pixel: TODO script snippet -->/g,`
- ⚠️ **Line 72** (Generic Placeholders): `description: 'Remove Facebook Pixel TODO comment'`
- ⚠️ **Line 141** (Generic Placeholders): `All placeholder values have been replaced with real production data.`

### 📁 `scripts/replace-affiliate-links.js`

- ⚠️ **Line 3** (Generic Placeholders): `* Replaces all placeholder links with real affiliate URLs`
- ⚠️ **Line 77** (Generic Placeholders): `// Replace placeholder links in content`
- 🔸 **Line 82** (Example Domains): `// Pattern 1: example.com URLs with deal identifiers`
- ⚠️ **Line 97** (Generic Placeholders): `// Pattern 2: Generic # placeholder links (convert to Amazon search)`
- ⚠️ **Line 194** (Generic Placeholders): `// Generate sample links`

### 📁 `scripts/setup-database-schema.js`

- ⚠️ **Line 77** (Generic Placeholders): `// Check sample data`
- ⚠️ **Line 79** (Generic Placeholders): `console.log(`📊 Sample deals inserted: ${dealsCount.rows[0].count}`);`
- ⚠️ **Line 98** (Generic Placeholders): `console.log('✅ Sample query successful:');`
- ⚠️ **Line 108** (Generic Placeholders): `console.log(`   📦 Sample deals: ${dealsCount.rows[0].count}`);`

### 📁 `scripts/test-redis-connection.js`

- 💡 **Line 44** (Test/Dev Patterns): `const testKey = `dealradarus_test_${Date.now()}`;`
- 💡 **Line 47** (Test/Dev Patterns): `const setResponse = await axios.post(`${restUrl}/set/${testKey}`, JSON.stringify(testValue), { headers });`
- 💡 **Line 49** (Test/Dev Patterns): `console.log(`   🔑 Key: ${testKey}`);`
- 💡 **Line 54** (Test/Dev Patterns): `const getResponse = await axios.get(`${restUrl}/get/${testKey}`, { headers });`
- 💡 **Line 91** (Test/Dev Patterns): `await axios.post(`${restUrl}/del/${testKey}`, {}, { headers });`

### 📁 `scripts/update-social-media.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Updates placeholder social media links with professional URLs`
- ⚠️ **Line 60** (Generic Placeholders): `// Replace TODO social media comment with actual links`
- ⚠️ **Line 61** (Generic Placeholders): `const todoPattern = /<!-- TODO: Update with verified social media URLs -->/g;`
- ⚠️ **Line 77** (Generic Placeholders): `Object.entries(placeholders).forEach(([placeholder, replacement]) => {`
- ⚠️ **Line 78** (Generic Placeholders): `if (content.includes(placeholder)) {`
- ⚠️ **Line 79** (Generic Placeholders): `content = content.replace(new RegExp(placeholder, 'g'), replacement);`

### 📁 `scripts/utils/link-extract.js`

- ⚠️ **Line 205** (Generic Placeholders): `// Check for placeholder URLs`
- 🔸 **Line 206** (Example Domains): `if (hostname.includes('example.com') || url.includes('example.com')) {`
- ⚠️ **Line 207** (Generic Placeholders): `issues.push('Placeholder URL - needs to be replaced with real affiliate link');`
- 🔸 **Line 210** (Example Domains): `// Check for localhost/development URLs`
- 🔸 **Line 211** (Example Domains): `if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {`

### 📁 `scripts/verify-all.js`

- 🔸 **Line 22** (Example Domains): `baseUrl: 'http://localhost:3001'`

### 📁 `server/api/verify-recaptcha.js`

- 🔸 **Line 133** (Example Domains): `(req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');`

### 📁 `server/app.js`

- 🔸 **Line 85** (Example Domains): `? ["'self'", "http://localhost:*", "ws://localhost:*"]`
- 🔸 **Line 108** (Example Domains): `? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']`
- 🔸 **Line 400** (Example Domains): `console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);`

### 📁 `server/cache/redis.js`

- 🔸 **Line 27** (Example Domains): `const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';`

### 📁 `server/contact.example.js`

- 🔸 **Line 40** (Example Domains): `// Skip rate limiting for localhost in development`
- 🔸 **Line 42** (Example Domains): `(req.ip === '127.0.0.1' || req.ip === '::1');`

### 📁 `server/database-setup.js`

- ⚠️ **Line 190** (Generic Placeholders): `4. **Create Test User**: Insert sample user record`

### 📁 `server/execute-migration.js`

- ⚠️ **Line 180** (Generic Placeholders): `password_hash: '$2b$10$test.hash.placeholder',`
- ⚠️ **Line 193** (Generic Placeholders): `// `, ['admin@dealradarus.com', '$2b$10$test.hash.placeholder', 'admin', true]);`
- ⚠️ **Line 269** (Generic Placeholders): `**Note**: Password hash is placeholder for testing: \`$2b$10$test.hash.placeholder\``
- ⚠️ **Line 308** (Generic Placeholders): `VALUES ('admin@dealradarus.com', '$2b$10$test.hash.placeholder', 'admin', true)`

### 📁 `server/jobs/alerts-processor.js`

- ⚠️ **Line 176** (Generic Placeholders): `image_url: 'https://via.placeholder.com/300x200',`

### 📁 `server/newsletter-handler.js`

- ⚠️ **Line 273** (Generic Placeholders): `for (const [placeholder, value] of Object.entries(replacements)) {`
- ⚠️ **Line 274** (Generic Placeholders): `payload = payload.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);`
- ⚠️ **Line 305** (Generic Placeholders): `for (const [placeholder, value] of Object.entries(replacements)) {`
- ⚠️ **Line 306** (Generic Placeholders): `finalEndpoint = finalEndpoint.replace(placeholder, value);`
- 🔸 **Line 434** (Example Domains): `const testEmail = 'test@example.com';`
- 🔸 **Line 435** (Example Domains): `const validation = handler.validateSubscriptionRequest(testEmail, '127.0.0.1');`
- 🔸 **Line 439** (Example Domains): `const rateLimit = handler.checkRateLimit(testEmail, '127.0.0.1');`

### 📁 `server/newsletter-server.js`

- 🔸 **Line 35** (Example Domains): `: ['http://localhost:3000', 'http://127.0.0.1:5500'],`
- 🔸 **Line 108** (Example Domains): `console.log(`Health check: http://localhost:${PORT}/health`);`
- 🔸 **Line 109** (Example Domains): `console.log(`Newsletter API: http://localhost:${PORT}/api/newsletter`);`

### 📁 `server/notifications/webhook.js`

- 🔸 **Line 391** (Example Domains): `// Block localhost and private IPs in production`
- 🔸 **Line 394** (Example Domains): `if (hostname === 'localhost' ||`

### 📁 `server/preflight-check.js`

- 💡 **Line 178** (Test/Dev Patterns): `const testKey = `preflight:test:${Date.now()}`;`
- 💡 **Line 181** (Test/Dev Patterns): `await this.redisClient.set(testKey, testValue, 'EX', 10);`
- 💡 **Line 182** (Test/Dev Patterns): `const retrievedValue = await this.redisClient.get(testKey);`
- 💡 **Line 203** (Test/Dev Patterns): `await this.redisClient.del(testKey);`
- 💡 **Line 348** (Test/Dev Patterns): `const testKey = 'dealradarus:v1:preflight:test:123';`
- 💡 **Line 349** (Test/Dev Patterns): `await this.redisClient.set(testKey, JSON.stringify({ test: true }), 'EX', 30);`
- 💡 **Line 350** (Test/Dev Patterns): `const cached = await this.redisClient.get(testKey);`
- 💡 **Line 354** (Test/Dev Patterns): `await this.redisClient.del(testKey);`
- 💡 **Line 363** (Test/Dev Patterns): `keyFormatValid: testKey.startsWith('dealradarus:v1:')`

### 📁 `server/recaptcha-server.js`

- 🔸 **Line 27** (Example Domains): `console.log(`🔒 reCAPTCHA Server running on http://localhost:${this.port}`);`

### 📁 `server/routes/metrics.js`

- ⚠️ **Line 413** (Generic Placeholders): `email: { status: 'healthy' }, // TODO: Add actual service health checks`

### 📁 `server/run-sql.js`

- ⚠️ **Line 66** (Generic Placeholders): `console.log('📊 Sample data:');`

### 📁 `server/smtp-handler.js`

- 🔸 **Line 345** (Example Domains): `email: 'test@example.com',`

### 📁 `server/test-mcp-connection.js`

- ⚠️ **Line 73** (Generic Placeholders): `console.log('🧪 Sample Data Test:');`
- ⚠️ **Line 76** (Generic Placeholders): `VALUES ('dev@dealradarus.com', '$2b$10$dummy.hash.for.testing')`
- ⚠️ **Line 87** (Generic Placeholders): `console.log('- Sample user insertion result');`

### 📁 `server/test/auth-flow-test.js`

- 🔸 **Line 11** (Example Domains): `this.baseURL = 'http://localhost:3001';`
- 💡 **Line 13** (Test/Dev Patterns): `this.testPassword = 'TestPass123!';`
- 💡 **Line 78** (Test/Dev Patterns): `password: this.testPassword,`
- 💡 **Line 100** (Test/Dev Patterns): `password: this.testPassword`
- 💡 **Line 169** (Test/Dev Patterns): `password: this.testPassword`

### 📁 `server/test/e2e-cache-validation.js`

- 🔸 **Line 12** (Example Domains): `this.baseUrl = 'http://localhost:3001';`

### 📁 `server/test/e2e-launcher.js`

- 🔸 **Line 68** (Example Domains): `await this.healthCheck('http://localhost:3001/health');`
- 🔸 **Line 84** (Example Domains): `url: 'http://localhost:3001',`
- 🔸 **Line 139** (Example Domains): `url: 'http://localhost:3000',`
- 🔸 **Line 247** (Example Domains): `CYPRESS_baseUrl: 'http://localhost:3000',`
- 🔸 **Line 248** (Example Domains): `CYPRESS_apiUrl: 'http://localhost:3001'`

### 📁 `server/test/filters-alerts-test.js`

- 🔸 **Line 9** (Example Domains): `const BASE_URL = 'http://localhost:3001';`

### 📁 `server/test/load-test.js`

- 🔸 **Line 14** (Example Domains): `this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';`

### 📁 `server/test/m36-e2e-test.js`

- 🔸 **Line 25** (Example Domains): `url: 'https://example.com/deal-123'`
- 💡 **Line 220** (Test/Dev Patterns): `VALUES (uuid_generate_v4(), $1, 'https://httpbin.org/post', 'test-secret', true, NOW())`

### 📁 `server/test/simple-cache-test.js`

- 🔸 **Line 12** (Example Domains): `this.baseUrl = 'http://localhost:3001';`

### 📁 `server/test/ugc-test.js`

- 🔸 **Line 12** (Example Domains): `this.baseURL = 'http://localhost:3001';`

### 📁 `src/App.js`

- ⚠️ **Line 21** (Generic Placeholders): `const [selectedDeal, setSelectedDeal] = React.useState('sample-deal-123');`

### 📁 `src/components/admin/ReportCard.js`

- ⚠️ **Line 202** (Generic Placeholders): `placeholder="Optional: Add reason for your decision..."`

### 📁 `src/components/comments/CommentCard.js`

- ⚠️ **Line 216** (Generic Placeholders): `placeholder="Write a reply..."`

### 📁 `src/components/comments/CommentForm.js`

- ⚠️ **Line 17** (Generic Placeholders): `placeholder = 'Write a comment...',`
- ⚠️ **Line 175** (Generic Placeholders): `placeholder={placeholder}`

### 📁 `src/components/comments/CommentThread.js`

- ⚠️ **Line 139** (Generic Placeholders): `placeholder={`Add a comment${reviewId ? ' to this review' : ' about this deal'}...`}`

### 📁 `src/components/reports/ReportModal.js`

- ⚠️ **Line 205** (Generic Placeholders): `placeholder={`

### 📁 `src/components/reviews/ReviewForm.js`

- ⚠️ **Line 198** (Generic Placeholders): `placeholder="Summarize your experience with this deal..."`
- ⚠️ **Line 221** (Generic Placeholders): `placeholder="Tell others about your experience with this deal. Was it good value? Did you encounter any issues? Be honest and helpful!"`

### 📁 `src/store/slices/commentsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `src/store/slices/reportsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `src/store/slices/reviewsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `src/utils/http.js`

- 🔸 **Line 5** (Example Domains): `? 'http://localhost:3000'`

### 📁 `test-recaptcha.html`

- ⚠️ **Line 197** (Generic Placeholders): `<input type="text" id="newsletter-name" name="name" placeholder="Your name">`
- ⚠️ **Line 202** (Generic Placeholders): `<input type="email" id="newsletter-email" name="email" required placeholder="your@email.com">`
- ⚠️ **Line 232** (Generic Placeholders): `<input type="text" id="comment-name" name="name" placeholder="Anonymous">`
- ⚠️ **Line 237** (Generic Placeholders): `<input type="email" id="comment-email" name="email" placeholder="your@email.com">`
- ⚠️ **Line 242** (Generic Placeholders): `<textarea id="comment-text" name="comment" rows="3" required placeholder="Share your thoughts..."></textarea>`
- 🔸 **Line 277** (Example Domains): `const response = await fetch('http://localhost:3003/', {`
- 🔸 **Line 303** (Example Domains): `const response = await fetch('http://localhost:3003/api/recaptcha-stats', {`

### 📁 `tests/placeholder-audit.test.js`

- ⚠️ **Line 3** (Generic Placeholders): `* M3.9 Enhanced Placeholder Audit - Test Suite`
- ⚠️ **Line 4** (Generic Placeholders): `* Comprehensive testing for placeholder detection and auto-fix functionality`
- ⚠️ **Line 10** (Generic Placeholders): `const PlaceholderAuditor = require('../tools/placeholder-audit');`
- ⚠️ **Line 26** (Generic Placeholders): `console.log('🧪 M3.9 Placeholder Audit Test Suite');`
- ⚠️ **Line 72** (Generic Placeholders): `* Test basic placeholder detection`
- ⚠️ **Line 75** (Generic Placeholders): `this.log('🔍 Testing basic placeholder detection...');`
- ⚠️ **Line 77** (Generic Placeholders): `// Test 1: JavaScript placeholder detection`
- ⚠️ **Line 78** (Generic Placeholders): `await this.runTest('JS Placeholder Detection', async () => {`
- 🔸 **Line 83** (Example Domains): `domain: "example.com",`
- 🚨 **Line 114** (Analytics Placeholders): `analyticsId: "G-TEST123456",`
- ⚠️ **Line 118** (Generic Placeholders): `key: "placeholder-key",`
- ⚠️ **Line 119** (Generic Placeholders): `secret: "change-me"`
- ⚠️ **Line 143** (Generic Placeholders): `API_KEY_HERE=placeholder`
- 💡 **Line 163** (Test/Dev Patterns): `API_KEY_HERE=test-key`
- 🔸 **Line 199** (Example Domains): `'postgres://localhost/test': 'postgres://user:pass@localhost:5432/fixed_db'`
- 🔸 **Line 213** (Example Domains): `domain: "example.com",`
- 🔸 **Line 222** (Example Domains): `'example.com': 'fixed-domain.com',`
- 🔸 **Line 230** (Example Domains): `!fixedContent.includes('example.com');`
- ⚠️ **Line 278** (Generic Placeholders): `const content = 'const placeholder = "your-api-key-here";\n'.repeat(100);`
- ⚠️ **Line 310** (Generic Placeholders): `execSync(`cd ${process.cwd()} && node tools/placeholder-audit.js --report ${this.testDir}/test-report.md`,`
- ⚠️ **Line 324** (Generic Placeholders): `fs.writeFileSync(testFile, 'API_KEY_HERE=placeholder\n');`
- ⚠️ **Line 327** (Generic Placeholders): `execSync(`cd ${process.cwd()} && node tools/placeholder-audit.js --report ${reportPath}`,`
- ⚠️ **Line 334** (Generic Placeholders): `fs.readFileSync(reportPath, 'utf8').includes('M3.9 Enhanced Placeholder Audit Report');`
- 🚨 **Line 348** (Hardcoded Credentials): `PASSWORD=123456`
- ⚠️ **Line 349** (Generic Placeholders): `API_KEY_HERE=placeholder`
- 🔸 **Line 350** (Example Domains): `DOMAIN=example.com`
- ⚠️ **Line 438** (Generic Placeholders): `console.log('🧪 M3.9 PLACEHOLDER AUDIT TEST RESULTS');`
- ⚠️ **Line 475** (Generic Placeholders): `console.log('🎉 All tests passed! M3.9 Placeholder Audit is working correctly.');`

### 📁 `tools/collect-secrets.js`

- ⚠️ **Line 24** (Generic Placeholders): `const PLACEHOLDER = /(example\.com|YOUR_[A-Z0-9_]+_HERE|G-XXXX|GTM-XXXX|change[_ -]?me|replace[_ -]?me|dummy|sample|test|xxxx|yyyy|zzz)/i;`
- 🚨 **Line 24** (Analytics Placeholders): `const PLACEHOLDER = /(example\.com|YOUR_[A-Z0-9_]+_HERE|G-XXXX|GTM-XXXX|change[_ -]?me|replace[_ -]?me|dummy|sample|test|xxxx|yyyy|zzz)/i;`
- 🚨 **Line 24** (GTM Placeholders): `const PLACEHOLDER = /(example\.com|YOUR_[A-Z0-9_]+_HERE|G-XXXX|GTM-XXXX|change[_ -]?me|replace[_ -]?me|dummy|sample|test|xxxx|yyyy|zzz)/i;`
- ⚠️ **Line 57** (Generic Placeholders): `// If it's a placeholder, it's not a real secret`
- ⚠️ **Line 58** (Generic Placeholders): `if (PLACEHOLDER.test(value)) return false;`
- ⚠️ **Line 99** (Generic Placeholders): `const isPlaceholder = !value || PLACEHOLDER.test(value);`
- ⚠️ **Line 129** (Generic Placeholders): `if (!PLACEHOLDER.test(value) && looksSecret(key, value)) {`
- ⚠️ **Line 140** (Generic Placeholders): `if (PLACEHOLDER.test(value)) {`
- ⚠️ **Line 229** (Generic Placeholders): `markdown += `| Key | Placeholder Value | File | Line |\n`;`
- ⚠️ **Line 232** (Generic Placeholders): `placeholders.forEach(placeholder => {`
- ⚠️ **Line 233** (Generic Placeholders): `const valuePreview = (placeholder.value || '').length > 80`
- ⚠️ **Line 234** (Generic Placeholders): `? (placeholder.value || '').slice(0, 77) + '...'`
- ⚠️ **Line 235** (Generic Placeholders): `: (placeholder.value || '');`
- ⚠️ **Line 237** (Generic Placeholders): `const location = placeholder.line`
- ⚠️ **Line 238** (Generic Placeholders): `? `\`${placeholder.file}:${placeholder.line}\```
- ⚠️ **Line 239** (Generic Placeholders): `: `\`${placeholder.file}\``;`
- ⚠️ **Line 241** (Generic Placeholders): `markdown += `| **${placeholder.key}** | \`${valuePreview}\` | ${location} | ${placeholder.line || ''} |\n`;`
- ⚠️ **Line 258** (Generic Placeholders): `markdown += `- Regular audit runs to prevent placeholder commits\n`;`
- ⚠️ **Line 259** (Generic Placeholders): `markdown += `- Implement pre-commit hooks to catch placeholder values\n\n`;`

### 📁 `tools/placeholder-audit.js`

- ⚠️ **Line 3** (Generic Placeholders): `* M3.9 Enhanced Placeholder Sweep - Enterprise Grade`
- ⚠️ **Line 4** (Generic Placeholders): `* - Comprehensive placeholder detection with advanced patterns`
- ⚠️ **Line 23** (Generic Placeholders): `const reportPath = args.includes('--report') ? args[args.indexOf('--report') + 1] : 'PLACEHOLDER-AUDIT.md';`
- ⚠️ **Line 61** (Generic Placeholders): `// Enhanced placeholder detection patterns`
- ⚠️ **Line 66** (Generic Placeholders): `pattern: /\b(placeholder|change[_-]?me|replace[_-]?me|to[_-]?be[_-]?filled|your[_-]?(key|id|token|domain|secret)|dummy|sample|tbd|todo|fixme|hack)\b/i,`
- ⚠️ **Line 88** (Generic Placeholders): `pattern: /(API_KEY|SECRET|TOKEN|PRIVATE_KEY|ACCESS_KEY|WEBHOOK_SIGNATURE_SECRET)\s*[=:]\s*(change.*|replace.*|test.*|dummy.*|sample.*|placeholder.*|your.*|xxx.*|yyy.*)/i,`
- 🔸 **Line 100** (Example Domains): `pattern: /(EMAIL_FROM|FROM_EMAIL|SMTP_USER)\s*[=:]\s*(no-reply@example\.com|test@.*|example@.*|admin@localhost)/i,`
- ⚠️ **Line 228** (Generic Placeholders): `this.log('🔍 Starting M3.9 Enhanced Placeholder Sweep...');`
- ⚠️ **Line 417** (Generic Placeholders): `// Scan for placeholder patterns`
- ⚠️ **Line 485** (Generic Placeholders): `// Check for placeholder values with enhanced patterns`
- ⚠️ **Line 487** (Generic Placeholders): `/^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i,`
- ⚠️ **Line 501** (Generic Placeholders): `message: `${validator.key} contains placeholder or missing real value in ${filePath}`,`
- ⚠️ **Line 502** (Generic Placeholders): `type: 'placeholder',`
- ⚠️ **Line 660** (Generic Placeholders): `// Check for placeholder patterns and suggest replacements`
- ⚠️ **Line 664** (Generic Placeholders): `/(placeholder|change.*|replace.*|your.*|example.*)/i`
- ⚠️ **Line 715** (Generic Placeholders): `// Common placeholder patterns`
- 🔸 **Line 722** (Example Domains): `replacement: (match) => fixMap['example.com'] ? `"${fixMap['example.com']}"` : match`
- 🔸 **Line 725** (Example Domains): `pattern: /"localhost:3000"/gi,`
- 🔸 **Line 726** (Example Domains): `replacement: (match) => fixMap['localhost:3000'] ? `"${fixMap['localhost:3000']}"` : match`
- ⚠️ **Line 781** (Generic Placeholders): `lines.push('# 🔍 M3.9 Enhanced Placeholder Audit Report');`
- ⚠️ **Line 836** (Generic Placeholders): `// Placeholder findings`
- ⚠️ **Line 838** (Generic Placeholders): `lines.push('## 🔍 Placeholder Findings');`
- ⚠️ **Line 874** (Generic Placeholders): `lines.push('2. **🔄 Replace Placeholders**: Update all placeholder values with production-ready configurations');`
- ⚠️ **Line 885** (Generic Placeholders): `lines.push('- Add pre-commit hooks to prevent placeholder commits');`
- ⚠️ **Line 893** (Generic Placeholders): `lines.push('*Generated by M3.9 Enhanced Placeholder Sweep - Enterprise Grade Security Audit*');`
- ⚠️ **Line 939** (Generic Placeholders): `console.log('📊 M3.9 PLACEHOLDER AUDIT RESULTS');`
- ⚠️ **Line 1050** (Generic Placeholders): `// Scan for placeholder patterns`
- ⚠️ **Line 1079** (Generic Placeholders): `return value && /^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i.test(value);`
- ⚠️ **Line 1084** (Generic Placeholders): `message: `${v.key} contains placeholder value in ${filePath}`,`
- ⚠️ **Line 1085** (Generic Placeholders): `type: 'placeholder'`

### 📁 `webpack.config.js`

- 🔸 **Line 65** (Example Domains): `target: 'http://localhost:3001',`
- 🔸 **Line 69** (Example Domains): `target: 'http://localhost:3001',`
- 🔸 **Line 73** (Example Domains): `target: 'http://localhost:3001',`
- 🔸 **Line 77** (Example Domains): `target: 'http://localhost:3001',`
- 🔸 **Line 81** (Example Domains): `target: 'http://localhost:3001',`
- 🔸 **Line 85** (Example Domains): `target: 'http://localhost:3001',`

## 💡 Recommendations

### Immediate Actions Required

1. **🚨 Fix Critical Issues**: Address all critical environment configuration errors immediately
2. **🔄 Replace Placeholders**: Update all placeholder values with production-ready configurations
3. **🔐 Security Review**: Ensure no sensitive data is hardcoded or exposed
4. **✅ Re-run Audit**: Execute audit again after fixes to verify resolution

### Best Practices

- Use environment-specific configuration files
- Implement proper secret management for production
- Add pre-commit hooks to prevent placeholder commits
- Regular audit runs in CI/CD pipeline
- Encrypt sensitive configuration data

---

*Generated by M3.9 Enhanced Placeholder Sweep - Enterprise Grade Security Audit*