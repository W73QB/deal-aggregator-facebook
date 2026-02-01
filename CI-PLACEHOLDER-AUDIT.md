# 🔍 M3.9 Enhanced Placeholder Audit Report

**Generated:** 2025-11-27T23:28:00.737Z
**Duration:** 1991ms
**Environment:** development

## 📊 Executive Summary

- **Files Scanned:** 1833
- **Files with Placeholders:** 319
- **Total Placeholders Found:** 1746
- **Environment Validation Errors:** 32

## ⚠️ Issues by Severity

- **🔸 MEDIUM:** 804 issues
- **⚠️ HIGH:** 793 issues
- **🚨 CRITICAL:** 148 issues
- **💡 LOW:** 33 issues

## 🚨 Critical Environment Issues

- **WEBHOOK_SIGNATURE_SECRET** in `.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.example
- **DATABASE_URL** in `.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- **JWT_SECRET** in `.env.example`: JWT_SECRET contains placeholder or missing real value in .env.example
- **SESSION_SECRET** in `.env.example`: SESSION_SECRET contains placeholder or missing real value in .env.example
- **JWT_SECRET** in `.env.template`: JWT_SECRET contains placeholder or missing real value in .env.template
- **SESSION_SECRET** in `.env.template`: SESSION_SECRET contains placeholder or missing real value in .env.template
- **WEBHOOK_SIGNATURE_SECRET** in `.env.test`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.test
- **JWT_SECRET** in `.env.test`: JWT_SECRET contains placeholder or missing real value in .env.test
- **SESSION_SECRET** in `.env.test`: SESSION_SECRET contains placeholder or missing real value in .env.test
- **DATABASE_URL** in `.env.vercel.production`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.vercel.production: "postgresql://neondb_owner:npg_DOvMB0x2AJut@ep-bold..."
- **WEBHOOK_SIGNATURE_SECRET** in `backups/backup-1758269696007/config/.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- **DATABASE_URL** in `backups/backup-1758269696007/config/.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in backups/backup-1758269696007/config/.env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- **JWT_SECRET** in `backups/backup-1758269696007/config/.env.example`: JWT_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- **SESSION_SECRET** in `backups/backup-1758269696007/config/.env.example`: SESSION_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- **JWT_SECRET** in `backups/backup-1758269696007/config/.env.template`: JWT_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.template
- **SESSION_SECRET** in `backups/backup-1758269696007/config/.env.template`: SESSION_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.template
- **WEBHOOK_SIGNATURE_SECRET** in `external-api/.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in external-api/.env.example
- **JWT_SECRET** in `external-api/.env.example`: JWT_SECRET contains placeholder or missing real value in external-api/.env.example
- **SESSION_SECRET** in `external-api/.env.example`: SESSION_SECRET contains placeholder or missing real value in external-api/.env.example
- **REDIS_URL** in `external-api/.env.example`: Missing mandatory environment variable REDIS_URL for production environment
- **JWT_SECRET** in `external-api/.env.example`: Missing mandatory environment variable JWT_SECRET for production environment
- **SMTP_HOST** in `external-api/.env.example`: Missing mandatory environment variable SMTP_HOST for production environment
- **SMTP_USER** in `external-api/.env.example`: Missing mandatory environment variable SMTP_USER for production environment
- **SMTP_PASS** in `external-api/.env.example`: Missing mandatory environment variable SMTP_PASS for production environment

## ❌ Environment Validation Errors

- 🔸 **SENTRY_DSN** in `.env.example`: SENTRY_DSN sai định dạng URL DSN của Sentry in .env.example: "https://xxx@xxx.ingest.sentry.io/xxx..."
- 🚨 **WEBHOOK_SIGNATURE_SECRET** in `.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.example
- 🚨 **DATABASE_URL** in `.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- 🚨 **JWT_SECRET** in `.env.example`: JWT_SECRET contains placeholder or missing real value in .env.example
- 🚨 **SESSION_SECRET** in `.env.example`: SESSION_SECRET contains placeholder or missing real value in .env.example
- 🚨 **JWT_SECRET** in `.env.template`: JWT_SECRET contains placeholder or missing real value in .env.template
- 🚨 **SESSION_SECRET** in `.env.template`: SESSION_SECRET contains placeholder or missing real value in .env.template
- 🚨 **WEBHOOK_SIGNATURE_SECRET** in `.env.test`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in .env.test
- 🚨 **JWT_SECRET** in `.env.test`: JWT_SECRET contains placeholder or missing real value in .env.test
- 🚨 **SESSION_SECRET** in `.env.test`: SESSION_SECRET contains placeholder or missing real value in .env.test
- ⚠️ **EMAIL_FROM** in `.env.vercel.production`: EMAIL_FROM phải là địa chỉ email hợp lệ in .env.vercel.production: "deals@dealradarus.com\n..."
- 🚨 **DATABASE_URL** in `.env.vercel.production`: DATABASE_URL sai định dạng PostgreSQL connection string in .env.vercel.production: "postgresql://neondb_owner:npg_DOvMB0x2AJut@ep-bold..."
- 🔸 **SENTRY_DSN** in `backups/backup-1758269696007/config/.env.example`: SENTRY_DSN sai định dạng URL DSN của Sentry in backups/backup-1758269696007/config/.env.example: "https://xxx@xxx.ingest.sentry.io/xxx..."
- 🚨 **WEBHOOK_SIGNATURE_SECRET** in `backups/backup-1758269696007/config/.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- 🚨 **DATABASE_URL** in `backups/backup-1758269696007/config/.env.example`: DATABASE_URL sai định dạng PostgreSQL connection string in backups/backup-1758269696007/config/.env.example: "postgres://USER:PASSWORD@ep-xxx.aws.neon.tech/neon..."
- 🚨 **JWT_SECRET** in `backups/backup-1758269696007/config/.env.example`: JWT_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- 🚨 **SESSION_SECRET** in `backups/backup-1758269696007/config/.env.example`: SESSION_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.example
- 🚨 **JWT_SECRET** in `backups/backup-1758269696007/config/.env.template`: JWT_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.template
- 🚨 **SESSION_SECRET** in `backups/backup-1758269696007/config/.env.template`: SESSION_SECRET contains placeholder or missing real value in backups/backup-1758269696007/config/.env.template
- ⚠️ **GA4_MEASUREMENT_ID** in `external-api/.env.example`: GA4_MEASUREMENT_ID contains placeholder or missing real value in external-api/.env.example
- ⚠️ **GTM_CONTAINER_ID** in `external-api/.env.example`: GTM_CONTAINER_ID contains placeholder or missing real value in external-api/.env.example
- 🚨 **WEBHOOK_SIGNATURE_SECRET** in `external-api/.env.example`: WEBHOOK_SIGNATURE_SECRET contains placeholder or missing real value in external-api/.env.example
- ⚠️ **EMAIL_FROM** in `external-api/.env.example`: EMAIL_FROM contains placeholder or missing real value in external-api/.env.example
- ⚠️ **FRONTEND_BASE_URL** in `external-api/.env.example`: FRONTEND_BASE_URL contains placeholder or missing real value in external-api/.env.example
- ⚠️ **REDIS_URL** in `external-api/.env.example`: REDIS_URL contains placeholder or missing real value in external-api/.env.example
- 🚨 **JWT_SECRET** in `external-api/.env.example`: JWT_SECRET contains placeholder or missing real value in external-api/.env.example
- 🚨 **SESSION_SECRET** in `external-api/.env.example`: SESSION_SECRET contains placeholder or missing real value in external-api/.env.example
- 🚨 **REDIS_URL** in `external-api/.env.example`: Missing mandatory environment variable REDIS_URL for production environment
- 🚨 **JWT_SECRET** in `external-api/.env.example`: Missing mandatory environment variable JWT_SECRET for production environment
- 🚨 **SMTP_HOST** in `external-api/.env.example`: Missing mandatory environment variable SMTP_HOST for production environment
- 🚨 **SMTP_USER** in `external-api/.env.example`: Missing mandatory environment variable SMTP_USER for production environment
- 🚨 **SMTP_PASS** in `external-api/.env.example`: Missing mandatory environment variable SMTP_PASS for production environment

## 🔍 Placeholder Findings

### 📁 `.env.example`

- 🚨 **Line 12** (API Key Placeholders): `JWT_SECRET=YOUR_JWT_SECRET_MINIMUM_64_CHARACTERS_FOR_PRODUCTION_SECURITY`
- 🚨 **Line 34** (API Key Placeholders): `SESSION_SECRET=YOUR_SESSION_SECRET_MINIMUM_32_CHARACTERS_FOR_SECURITY`
- 🚨 **Line 39** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 40** (GTM Placeholders): `GTM_CONTAINER_ID=GTM-XXXXXXX`
- 🚨 **Line 64** (API Key Placeholders): `WEBHOOK_SIGNATURE_SECRET=YOUR_WEBHOOK_SIGNATURE_SECRET_MINIMUM_32_CHARACTERS`
- 🔸 **Line 67** (Example Domains): `FRONTEND_BASE_URL=http://localhost:3000`

### 📁 `.env.template`

- 🚨 **Line 14** (API Key Placeholders): `JWT_SECRET=YOUR_JWT_SECRET_MINIMUM_64_CHARACTERS_FOR_SECURITY`
- 🚨 **Line 38** (API Key Placeholders): `SESSION_SECRET=YOUR_SESSION_SECRET_MINIMUM_32_CHARACTERS`
- 🚨 **Line 47** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 48** (GTM Placeholders): `GTM_CONTAINER_ID=GTM-XXXXXXX`
- 🔸 **Line 49** (Sentry Placeholders): `SENTRY_DSN=`
- 🚨 **Line 58** (API Key Placeholders): `CRON_SECRET=YOUR_CRON_SECRET_KEY`
- 🚨 **Line 61** (API Key Placeholders): `UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN`
- 🚨 **Line 67** (API Key Placeholders): `FB_APP_SECRET=YOUR_FACEBOOK_APP_SECRET`
- 🚨 **Line 68** (API Key Placeholders): `FB_PAGE_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN`
- 🚨 **Line 70** (API Key Placeholders): `FACEBOOK_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN`

### 📁 `.env.test`

- 🔸 **Line 10** (Example Domains): `FRONTEND_URL=http://localhost:3000`
- 🔸 **Line 11** (Example Domains): `REACT_APP_API_BASE_URL=http://localhost:3002`
- 💡 **Line 17** (Test/Dev Patterns): `DATABASE_URL=postgresql://test_user:test_password@localhost:5432/dealradarus_test?sslmode=disable`
- 💡 **Line 18** (Test/Dev Patterns): `DATABASE_URL_POOLER=postgresql://test_user:test_password@localhost:5432/dealradarus_test?sslmode=disable`
- 🚨 **Line 23** (API Key Placeholders): `JWT_SECRET=test_jwt_secret_for_testing_only_minimum_64_characters_long_secure_string_abcdef123456`
- 🚨 **Line 24** (API Key Placeholders): `SESSION_SECRET=test_session_secret_minimum_32_characters_long_for_testing_security`
- 🚨 **Line 25** (API Key Placeholders): `WEBHOOK_SIGNATURE_SECRET=test_webhook_signature_secret_minimum_32_characters_for_testing`
- 🚨 **Line 37** (Hardcoded Credentials): `SMTP_PASS=test_pass`
- ⚠️ **Line 38** (Email Placeholders): `FROM_EMAIL=test@dealradarus.com`
- 🚨 **Line 44** (API Key Placeholders): `FACEBOOK_APP_SECRET=test_facebook_app_secret_here`
- 🚨 **Line 46** (API Key Placeholders): `FB_PAGE_ACCESS_TOKEN=test_page_access_token_for_testing`
- 🚨 **Line 47** (API Key Placeholders): `FACEBOOK_WEBHOOK_VERIFY_TOKEN=test_webhook_verify_token`
- 🔸 **Line 52** (Example Domains): `REDIS_URL=redis://127.0.0.1:6379`
- 🔸 **Line 53** (Example Domains): `UPSTASH_REDIS_REST_URL=http://localhost:8080`
- 🚨 **Line 54** (API Key Placeholders): `UPSTASH_REDIS_REST_TOKEN=test_redis_token`
- 🚨 **Line 59** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 88** (API Key Placeholders): `CRON_SECRET=test_cron_secret_disabled_in_testing`

### 📁 `PRODUCTION-READINESS-FINAL-REPORT.md`

- ⚠️ **Line 33** (Generic Placeholders): `> "A hardcoded JWT_SECRET in the .vercel_env_temp file. A placeholder FB_PAGE_ACCESS_TOKEN was also found in a test file."`

### 📁 `PROJECT_WORKLOG_SESSION_JOURNAL.md`

- 🔸 **Line 23** (Example Domains): `$ curl localhost:3000/api/health  # Returns correct health check`
- 🔸 **Line 24** (Example Domains): `$ curl localhost:3000/api/posts   # Returns correct posts data`
- 🔸 **Line 276** (Example Domains): `- External API fully functional on localhost:3001`

### 📁 `__tests__/README-ROUTING-TEST.md`

- 🔸 **Line 23** (Example Domains): `curl http://localhost:3000/api/health        # Should return health status`
- 🔸 **Line 25** (Example Domains): `curl http://localhost:3000/api/posts         # Should return blog posts`

### 📁 `__tests__/api-endpoint-validation.js`

- 🔸 **Line 6** (Example Domains): `const API_BASE = 'http://localhost:3000';`

### 📁 `__tests__/api/deals-cache.test.js`

- 🔸 **Line 47** (Example Domains): `image: 'https://example.com/deal.png',`
- 🔸 **Line 55** (Example Domains): `affiliate_url: 'https://example.com/deal',`

### 📁 `__tests__/api/deals-favorites.test.js`

- 🔸 **Line 11** (Example Domains): `req.user = { id: 1, email: 'test@example.com', email_verified: true };`
- 🔸 **Line 71** (Example Domains): `image: 'https://example.com/image.jpg',`
- 🔸 **Line 79** (Example Domains): `affiliate_url: 'https://example.com/deal',`
- 🔸 **Line 99** (Example Domains): `image: 'https://example.com/image.jpg',`

### 📁 `__tests__/api/deals.test.js`

- 🔸 **Line 25** (Example Domains): `image: 'http://example.com/image.png',`
- 🔸 **Line 33** (Example Domains): `affiliate_url: 'http://example.com/deal',`
- 🔸 **Line 50** (Example Domains): `expect(response.body.data).toHaveProperty('image', 'http://example.com/image.png');`
- 🔸 **Line 70** (Example Domains): `image: 'http://example.com/image.png',`
- 🔸 **Line 78** (Example Domains): `affiliate_url: 'http://example.com/deal',`

### 📁 `__tests__/components/ErrorBoundary.test.js`

- 🔸 **Line 36** (Example Domains): `let currentHref = 'http://localhost:3000';`
- 🔸 **Line 43** (Example Domains): `currentHref = 'http://localhost:3000';`
- 🔸 **Line 56** (Example Domains): `origin: 'http://localhost:3000'`

### 📁 `__tests__/components/ui/AuthButtons.test.js`

- 🔸 **Line 98** (Example Domains): `email: 'john@example.com',`
- 🔸 **Line 101** (Example Domains): `avatar: 'https://example.com/avatar.jpg'`
- 🔸 **Line 126** (Example Domains): `expect(screen.getByText('john@example.com')).toBeInTheDocument();`
- 🔸 **Line 276** (Example Domains): `email: 'john@example.com',`

### 📁 `__tests__/components/ui/OptimizedImage.test.js`

- ⚠️ **Line 12** (Generic Placeholders): `return function MockImage({ src, alt, width, height, fill, className, priority, quality, placeholder, blurDataURL, ...props }) {`
- ⚠️ **Line 34** (Generic Placeholders): `// Handle placeholder`
- ⚠️ **Line 35** (Generic Placeholders): `if (placeholder !== undefined) {`
- ⚠️ **Line 36** (Generic Placeholders): `imgProps.placeholder = placeholder;`
- ⚠️ **Line 176** (Generic Placeholders): `test('uses default placeholder blur', () => {`
- ⚠️ **Line 180** (Generic Placeholders): `expect(image).toHaveAttribute('placeholder', 'blur');`
- ⚠️ **Line 183** (Generic Placeholders): `test('uses custom placeholder when provided', () => {`
- ⚠️ **Line 184** (Generic Placeholders): `render(<OptimizedImage {...defaultProps} placeholder="empty" />);`
- ⚠️ **Line 187** (Generic Placeholders): `expect(image).toHaveAttribute('placeholder', 'empty');`
- ⚠️ **Line 237** (Generic Placeholders): `placeholder="empty"`
- ⚠️ **Line 244** (Generic Placeholders): `expect(image).toHaveAttribute('placeholder', 'empty');`

### 📁 `__tests__/components/ui/SearchBox.test.js`

- ⚠️ **Line 609** (Generic Placeholders): `expect(input).toHaveAttribute('placeholder', 'Search deals...');`

### 📁 `__tests__/contexts/AuthContext.test.js`

- 🔸 **Line 52** (Example Domains): `onClick={() => auth.login('test@example.com', 'password')}`
- 🔸 **Line 96** (Example Domains): `const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };`
- 🔸 **Line 129** (Example Domains): `expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');`
- 🔸 **Line 133** (Example Domains): `'http://localhost:5000/api/auth/login',`
- 🔸 **Line 138** (Example Domains): `body: JSON.stringify({ email: 'test@example.com', password: 'password' })`
- 🔸 **Line 208** (Example Domains): `const mockUser = { id: 1, email: 'test@example.com' };`
- 🔸 **Line 245** (Example Domains): `const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };`
- 🔸 **Line 261** (Example Domains): `expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');`
- 🔸 **Line 285** (Example Domains): `const mockUser = { id: 1, email: 'test@example.com' };`
- 🔸 **Line 317** (Example Domains): `'http://localhost:5000/api/auth/refresh',`

### 📁 `__tests__/hooks/useDeals.simple.test.js`

- 🔸 **Line 75** (Example Domains): `'http://localhost:5000/api/deals',`
- 🔸 **Line 92** (Example Domains): `expect.stringContaining('http://localhost:5000/api/deals'),`

### 📁 `__tests__/hooks/useDeals.test.js`

- 🔸 **Line 85** (Example Domains): `image: 'https://example.com/image1.jpg',`
- 🔸 **Line 94** (Example Domains): `affiliateUrl: 'https://example.com/affiliate',`
- 🔸 **Line 391** (Example Domains): `expect.stringContaining('http://localhost:5000/api/deals'),`

### 📁 `__tests__/hooks/useFavorites.test.js`

- 🔸 **Line 53** (Example Domains): `'http://localhost:5000/api/deals/deal-123/favorite',`
- 🔸 **Line 92** (Example Domains): `'http://localhost:5000/api/deals/deal-123/favorite',`

### 📁 `__tests__/pages/login.test.js`

- 🔸 **Line 125** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 138** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 143** (Example Domains): `expect(mockLogin).toHaveBeenCalledWith('test@example.com', '123');`
- 🔸 **Line 158** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 163** (Example Domains): `expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');`
- 🔸 **Line 176** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 199** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 220** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'test@example.com' } });`
- 🔸 **Line 285** (Example Domains): `fireEvent.change(emailInput, { target: { value: 'new@example.com' } });`

### 📁 `__tests__/vercel-routing-issue.test.js`

- 🔸 **Line 22** (Example Domains): `: 'http://localhost:3000';`

### 📁 `assets/products/comprehensive-image-replacer.js`

- ⚠️ **Line 4** (Generic Placeholders): `* Comprehensive Image Replacer - Replace ALL placeholder images`
- ⚠️ **Line 78** (Generic Placeholders): `// Find ALL placeholder patterns`
- ⚠️ **Line 160** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images across all files!`);`
- ⚠️ **Line 162** (Generic Placeholders): `console.log('\n✅ All placeholder images have been replaced.');`

### 📁 `assets/products/dist-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace placeholder images in dist directory with real product URLs`
- ⚠️ **Line 121** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in dist files!`);`
- ⚠️ **Line 123** (Generic Placeholders): `console.log('\n✅ All placeholder images in dist files are already replaced.');`

### 📁 `assets/products/enhanced-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace remaining placeholder images with real CDN URLs`
- ⚠️ **Line 60** (Generic Placeholders): `// Find all remaining placeholder SVG images`
- ⚠️ **Line 81** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);`
- ⚠️ **Line 124** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} more placeholder images!`);`
- ⚠️ **Line 126** (Generic Placeholders): `console.log('\n✅ All placeholder images have been replaced with real product photos.');`

### 📁 `assets/products/final-fixes.js`

- ⚠️ **Line 8** (Generic Placeholders): `// 1. Replace Soundbar SVG placeholder`
- ⚠️ **Line 26** (Generic Placeholders): `// Replace soundbar placeholder`
- ⚠️ **Line 31** (Generic Placeholders): `console.log(`✅ ${filePath}: Fixed ${soundbarReplacements} soundbar placeholder(s)`);`
- ⚠️ **Line 113** (Generic Placeholders): `console.log('  - Soundbar placeholder → Real Samsung soundbar image');`

### 📁 `assets/products/final-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace all remaining placeholder images with real CDN URLs`
- ⚠️ **Line 20** (Generic Placeholders): `// Blog placeholder images`
- ⚠️ **Line 56** (Generic Placeholders): `// Find all remaining placeholder images (SVG and placehold.co)`
- ⚠️ **Line 82** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);`
- ⚠️ **Line 126** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} final placeholder images!`);`
- ⚠️ **Line 128** (Generic Placeholders): `console.log('\n✅ All placeholder images have been successfully replaced.');`

### 📁 `assets/products/image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replaces placeholder SVG images with actual product image URLs`
- ⚠️ **Line 64** (Generic Placeholders): `// Find all placeholder SVG images`
- ⚠️ **Line 85** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder with real image`);`
- ⚠️ **Line 128** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images with real product photos.`);`
- ⚠️ **Line 130** (Generic Placeholders): `console.log('\n⚠️  No placeholder images found to replace.');`

### 📁 `assets/products/pages-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace placeholder images in pages/ directory with real product URLs`
- ⚠️ **Line 120** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in pages/!`);`
- ⚠️ **Line 122** (Generic Placeholders): `console.log('\n✅ All placeholder images in pages/ are already replaced.');`

### 📁 `automation/advanced-blog-engine.cjs`

- 🚨 **Line 266** (Analytics Placeholders): `<script async src="https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03"></script>`
- 🚨 **Line 271** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03');`
- ⚠️ **Line 445** (Generic Placeholders): `<input type="email" name="email" placeholder="Your email address" required`

### 📁 `automation/daily-automation-master.cjs`

- 🚨 **Line 438** (Analytics Placeholders): `<script async src="https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03"></script>`
- 🚨 **Line 443** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03');`
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

### 📁 `backup/legacy-html-files/about.html`

- 🚨 **Line 23** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 31** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 32** (Analytics Placeholders): `gtag("config", "G-9ZVTTTBD03", {`

### 📁 `backup/legacy-html-files/affiliate-disclosure.html`

- 🚨 **Line 37** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 45** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 46** (Analytics Placeholders): `gtag("config", "G-9ZVTTTBD03", {`

### 📁 `backup/legacy-html-files/affiliate-shopping-tips.html`

- 🚨 **Line 19** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 27** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- ⚠️ **Line 371** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `backup/legacy-html-files/blog.html`

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

### 📁 `backup/legacy-html-files/contact.html`

- 🚨 **Line 73** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 81** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 82** (Analytics Placeholders): `gtag("config", "G-9ZVTTTBD03", {`

### 📁 `backup/legacy-html-files/deals.html`

- ⚠️ **Line 125** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 465** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 468** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `backup/legacy-html-files/home.html`

- ⚠️ **Line 15** (Generic Placeholders): `<!-- Facebook Pixel: TODO script snippet -->`
- ⚠️ **Line 92** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 193** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=iPhone+14" alt="iPhone 14 Pro Max Refurbished" class="deal-image">`
- ⚠️ **Line 204** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Amazon+Echo" alt="Amazon Echo Dot 5th Generation" class="deal-image">`
- ⚠️ **Line 215** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Gaming+Monitor" alt="27 inch Gaming Monitor 144Hz" class="deal-image">`
- ⚠️ **Line 226** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=AirPods+Pro" alt="AirPods Pro 2nd Generation" class="deal-image">`
- ⚠️ **Line 248** (Generic Placeholders): `<input type="email" id="newsletter-email" name="email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `backup/legacy-html-files/index.html`

- 🚨 **Line 20** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 28** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 29** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- ⚠️ **Line 128** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 358** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `backup/legacy-html-files/privacy.html`

- 🚨 **Line 23** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 31** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 32** (Analytics Placeholders): `gtag("config", "G-9ZVTTTBD03", {`

### 📁 `backup/legacy-html-files/seo-trending-deals-2025.html`

- 🚨 **Line 19** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 27** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- ⚠️ **Line 333** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `backup/legacy-html-files/template.html`

- 🚨 **Line 19** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 27** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- ⚠️ **Line 263** (Generic Placeholders): `<input type="email" placeholder="Your email address" required>`

### 📁 `backup/legacy-html-files/terms-of-service.html`

- 🚨 **Line 25** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 36** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`

### 📁 `backup/legacy-html-files/test-ga4.html`

- 🚨 **Line 20** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 28** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 54** (Analytics Placeholders): `<li><strong>Measurement ID:</strong> G-9ZVTTTBD03</li>`

### 📁 `backup/legacy-html-files/test-recaptcha.html`

- ⚠️ **Line 197** (Generic Placeholders): `<input type="text" id="newsletter-name" name="name" placeholder="Your name">`
- ⚠️ **Line 202** (Generic Placeholders): `<input type="email" id="newsletter-email" name="email" required placeholder="your@email.com">`
- ⚠️ **Line 232** (Generic Placeholders): `<input type="text" id="comment-name" name="name" placeholder="Anonymous">`
- ⚠️ **Line 237** (Generic Placeholders): `<input type="email" id="comment-email" name="email" placeholder="your@email.com">`
- ⚠️ **Line 242** (Generic Placeholders): `<textarea id="comment-text" name="comment" rows="3" required placeholder="Share your thoughts..."></textarea>`
- 🔸 **Line 277** (Example Domains): `const response = await fetch('http://localhost:3003/', {`
- 🔸 **Line 303** (Example Domains): `const response = await fetch('http://localhost:3003/api/recaptcha-stats', {`

### 📁 `backups/backup-1758269696007/assets/public/blog.html`

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

### 📁 `backups/backup-1758269696007/assets/public/deals.html`

- ⚠️ **Line 125** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 465** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 468** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `backups/backup-1758269696007/assets/public/index.html`

- 🚨 **Line 21** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 29** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 30** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- ⚠️ **Line 129** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 359** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `backups/backup-1758269696007/assets/public/products/comprehensive-image-replacer.js`

- ⚠️ **Line 4** (Generic Placeholders): `* Comprehensive Image Replacer - Replace ALL placeholder images`
- ⚠️ **Line 78** (Generic Placeholders): `// Find ALL placeholder patterns`
- ⚠️ **Line 160** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images across all files!`);`
- ⚠️ **Line 162** (Generic Placeholders): `console.log('\n✅ All placeholder images have been replaced.');`

### 📁 `backups/backup-1758269696007/assets/public/products/dist-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace placeholder images in dist directory with real product URLs`
- ⚠️ **Line 121** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in dist files!`);`
- ⚠️ **Line 123** (Generic Placeholders): `console.log('\n✅ All placeholder images in dist files are already replaced.');`

### 📁 `backups/backup-1758269696007/assets/public/products/enhanced-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace remaining placeholder images with real CDN URLs`
- ⚠️ **Line 60** (Generic Placeholders): `// Find all remaining placeholder SVG images`
- ⚠️ **Line 81** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);`
- ⚠️ **Line 124** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} more placeholder images!`);`
- ⚠️ **Line 126** (Generic Placeholders): `console.log('\n✅ All placeholder images have been replaced with real product photos.');`

### 📁 `backups/backup-1758269696007/assets/public/products/final-fixes.js`

- ⚠️ **Line 8** (Generic Placeholders): `// 1. Replace Soundbar SVG placeholder`
- ⚠️ **Line 26** (Generic Placeholders): `// Replace soundbar placeholder`
- ⚠️ **Line 31** (Generic Placeholders): `console.log(`✅ ${filePath}: Fixed ${soundbarReplacements} soundbar placeholder(s)`);`
- ⚠️ **Line 113** (Generic Placeholders): `console.log('  - Soundbar placeholder → Real Samsung soundbar image');`

### 📁 `backups/backup-1758269696007/assets/public/products/final-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace all remaining placeholder images with real CDN URLs`
- ⚠️ **Line 20** (Generic Placeholders): `// Blog placeholder images`
- ⚠️ **Line 56** (Generic Placeholders): `// Find all remaining placeholder images (SVG and placehold.co)`
- ⚠️ **Line 82** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder: ${realImageUrl.substring(0, 50)}...`);`
- ⚠️ **Line 126** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} final placeholder images!`);`
- ⚠️ **Line 128** (Generic Placeholders): `console.log('\n✅ All placeholder images have been successfully replaced.');`

### 📁 `backups/backup-1758269696007/assets/public/products/image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replaces placeholder SVG images with actual product image URLs`
- ⚠️ **Line 64** (Generic Placeholders): `// Find all placeholder SVG images`
- ⚠️ **Line 85** (Generic Placeholders): `console.log(`  ✅ Replaced placeholder with real image`);`
- ⚠️ **Line 128** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images with real product photos.`);`
- ⚠️ **Line 130** (Generic Placeholders): `console.log('\n⚠️  No placeholder images found to replace.');`

### 📁 `backups/backup-1758269696007/assets/public/products/pages-image-replacer.js`

- ⚠️ **Line 5** (Generic Placeholders): `* Replace placeholder images in pages/ directory with real product URLs`
- ⚠️ **Line 120** (Generic Placeholders): `console.log(`\n🎯 Success! Replaced ${this.replacements} placeholder images in pages/!`);`
- ⚠️ **Line 122** (Generic Placeholders): `console.log('\n✅ All placeholder images in pages/ are already replaced.');`

### 📁 `backups/backup-1758269696007/config/.env.example`

- 🚨 **Line 12** (API Key Placeholders): `JWT_SECRET=YOUR_JWT_SECRET_MINIMUM_64_CHARACTERS_FOR_PRODUCTION_SECURITY`
- 🚨 **Line 34** (API Key Placeholders): `SESSION_SECRET=YOUR_SESSION_SECRET_MINIMUM_32_CHARACTERS_FOR_SECURITY`
- 🚨 **Line 39** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 40** (GTM Placeholders): `GTM_CONTAINER_ID=GTM-XXXXXXX`
- 🚨 **Line 64** (API Key Placeholders): `WEBHOOK_SIGNATURE_SECRET=YOUR_WEBHOOK_SIGNATURE_SECRET_MINIMUM_32_CHARACTERS`
- 🔸 **Line 67** (Example Domains): `FRONTEND_BASE_URL=http://localhost:3000`

### 📁 `backups/backup-1758269696007/config/.env.template`

- 🚨 **Line 14** (API Key Placeholders): `JWT_SECRET=YOUR_JWT_SECRET_MINIMUM_64_CHARACTERS_FOR_SECURITY`
- 🚨 **Line 38** (API Key Placeholders): `SESSION_SECRET=YOUR_SESSION_SECRET_MINIMUM_32_CHARACTERS`
- 🚨 **Line 47** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 48** (GTM Placeholders): `GTM_CONTAINER_ID=GTM-XXXXXXX`
- 🔸 **Line 49** (Sentry Placeholders): `SENTRY_DSN=`
- 🚨 **Line 58** (API Key Placeholders): `CRON_SECRET=YOUR_CRON_SECRET_KEY`
- 🚨 **Line 61** (API Key Placeholders): `UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN`
- 🚨 **Line 67** (API Key Placeholders): `FB_APP_SECRET=YOUR_FACEBOOK_APP_SECRET`
- 🚨 **Line 68** (API Key Placeholders): `FB_PAGE_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN`
- 🚨 **Line 70** (API Key Placeholders): `FACEBOOK_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN`

### 📁 `backups/backup-1758269696007/config/next.config.js`

- ⚠️ **Line 16** (Generic Placeholders): `'via.placeholder.com',`

### 📁 `backups/backup-1758269696007/config/package.json`

- ⚠️ **Line 45** (Generic Placeholders): `"audit:placeholders": "node tools/placeholder-audit.js --verbose",`
- ⚠️ **Line 46** (Generic Placeholders): `"audit:placeholders:fix": "node tools/placeholder-audit.js --verbose --fix",`
- ⚠️ **Line 47** (Generic Placeholders): `"audit:placeholders:report": "node tools/placeholder-audit.js --verbose --report PLACEHOLDER-AUDIT-REPORT.md",`
- ⚠️ **Line 48** (Generic Placeholders): `"audit:placeholders:ci": "node tools/placeholder-audit.js --report CI-PLACEHOLDER-AUDIT.md",`
- ⚠️ **Line 49** (Generic Placeholders): `"precommit:audit": "node tools/placeholder-audit.js",`

### 📁 `components/Layout.js`

- ⚠️ **Line 286** (Generic Placeholders): `placeholder="Your email"`

### 📁 `components/admin/ReportCard.js`

- ⚠️ **Line 202** (Generic Placeholders): `placeholder="Optional: Add reason for your decision..."`

### 📁 `components/comments/CommentCard.js`

- ⚠️ **Line 236** (Generic Placeholders): `placeholder="Write a reply..."`

### 📁 `components/comments/CommentForm.js`

- ⚠️ **Line 17** (Generic Placeholders): `placeholder = 'Write a comment...',`
- ⚠️ **Line 175** (Generic Placeholders): `placeholder={placeholder}`

### 📁 `components/comments/CommentThread.js`

- ⚠️ **Line 139** (Generic Placeholders): `placeholder={`Add a comment${reviewId ? ' to this review' : ' about this deal'}...`}`

### 📁 `components/pages/BlogPage.js`

- ⚠️ **Line 128** (Generic Placeholders): `<input type="email" placeholder="Your email" required />`
- ⚠️ **Line 212** (Generic Placeholders): `<input type="email" placeholder="Enter your email address" required />`

### 📁 `components/pages/BlogPostPage.js`

- ⚠️ **Line 209** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `components/pages/ContactPage.js`

- ⚠️ **Line 117** (Generic Placeholders): `placeholder="Your full name"`
- ⚠️ **Line 130** (Generic Placeholders): `placeholder="your.email@example.com"`
- ⚠️ **Line 163** (Generic Placeholders): `placeholder="Tell us how we can help you..."`
- ⚠️ **Line 210** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `components/pages/DealsPage.js`

- ⚠️ **Line 378** (Generic Placeholders): `placeholder="Enter your email"`

### 📁 `components/pages/HomePage.js`

- ⚠️ **Line 110** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `components/reports/ReportModal.js`

- ⚠️ **Line 205** (Generic Placeholders): `placeholder={`

### 📁 `components/reviews/ReviewForm.js`

- ⚠️ **Line 198** (Generic Placeholders): `placeholder="Summarize your experience with this deal..."`
- ⚠️ **Line 221** (Generic Placeholders): `placeholder="Tell others about your experience with this deal. Was it good value? Did you encounter any issues? Be honest and helpful!"`

### 📁 `components/search/AdvancedSearch.js`

- ⚠️ **Line 106** (Generic Placeholders): `placeholder="Search for deals, products, brands..."`

### 📁 `components/ui/OptimizedImage.js`

- ⚠️ **Line 14** (Generic Placeholders): `placeholder = 'blur',`
- ⚠️ **Line 33** (Generic Placeholders): `placeholder={placeholder}`
- ⚠️ **Line 46** (Generic Placeholders): `placeholder={placeholder}`

### 📁 `components/ui/SearchBox.js`

- 🔸 **Line 12** (Example Domains): `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';`
- ⚠️ **Line 114** (Generic Placeholders): `placeholder="Search deals..."`
- ⚠️ **Line 205** (Generic Placeholders): `.search-input::placeholder {`

### 📁 `config/.env.dealradarus.json`

- 🚨 **Line 30** (Analytics Placeholders): `"ga4_measurement_id": "G-9ZVTTTBD03",`

### 📁 `config/deal-verifier.config.json`

- 🔸 **Line 36** (Example Domains): `"blockedDomains": ["dealradarus.com", "localhost", "127.0.0.1"],`

### 📁 `config/real-values-mapping.js`

- ⚠️ **Line 2** (Generic Placeholders): `* Real Values Mapping for Placeholder Replacement`
- 💡 **Line 11** (Test/Dev Patterns): `'YOUR_SECRET_KEY': 'dev-secret-key-67890',`
- 🔸 **Line 12** (Example Domains): `'YOUR_DATABASE_URL': 'postgresql://user:pass@localhost:5432/dealradar_dev',`
- 🔸 **Line 13** (Example Domains): `'YOUR_REDIS_URL': 'redis://localhost:6379/0',`
- 🔸 **Line 14** (Example Domains): `'YOUR_FRONTEND_URL': 'http://localhost:3000',`
- 🔸 **Line 15** (Example Domains): `'YOUR_DOMAIN': 'localhost:3001',`
- 💡 **Line 33** (Test/Dev Patterns): `'YOUR_SECRET_KEY': 'test-secret-key-67890',`
- 🔸 **Line 35** (Example Domains): `'YOUR_REDIS_URL': 'redis://localhost:6380/0',`
- 🔸 **Line 36** (Example Domains): `'YOUR_FRONTEND_URL': 'http://localhost:3001',`
- 🔸 **Line 37** (Example Domains): `'YOUR_DOMAIN': 'localhost:3001',`
- 🚨 **Line 48** (Analytics Placeholders): `'GA4_MEASUREMENT_ID': 'G-XXXXXXXXXX',`
- 🚨 **Line 56** (GTM Placeholders): `'GTM_CONTAINER_ID': 'GTM-XXXXXXX',`
- 🔸 **Line 125** (Example Domains): `'example.com': 'dealradarus.com',`
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
- ⚠️ **Line 194** (Generic Placeholders): `'your-api-key-here',`
- ⚠️ **Line 196** (Generic Placeholders): `'api-key-placeholder',`
- 🔸 **Line 205** (Example Domains): `'postgresql://user:password@localhost:5432/database',`
- 🔸 **Line 206** (Example Domains): `'mysql://user:password@localhost:3306/database',`
- 🔸 **Line 207** (Example Domains): `'mongodb://localhost:27017/database'`
- ⚠️ **Line 263** (Generic Placeholders): `export const getRealValue = (placeholder, environment = 'development') => {`
- ⚠️ **Line 264** (Generic Placeholders): `if (realValuesMapping.environments[environment] && realValuesMapping.environments[environment][placeholder]) {`
- ⚠️ **Line 265** (Generic Placeholders): `return realValuesMapping.environments[environment][placeholder];`
- ⚠️ **Line 268** (Generic Placeholders): `if (realValuesMapping.services[service][placeholder]) {`
- ⚠️ **Line 269** (Generic Placeholders): `return realValuesMapping.services[service][placeholder];`
- ⚠️ **Line 272** (Generic Placeholders): `if (realValuesMapping.common[placeholder]) {`
- ⚠️ **Line 273** (Generic Placeholders): `return realValuesMapping.common[placeholder];`
- ⚠️ **Line 275** (Generic Placeholders): `if (realValuesMapping.domains[placeholder]) {`
- ⚠️ **Line 276** (Generic Placeholders): `return realValuesMapping.domains[placeholder];`
- ⚠️ **Line 278** (Generic Placeholders): `if (realValuesMapping.database[placeholder]) {`
- ⚠️ **Line 279** (Generic Placeholders): `return realValuesMapping.database[placeholder];`
- ⚠️ **Line 284** (Generic Placeholders): `export const getSecurityLevel = (placeholder) => {`
- ⚠️ **Line 285** (Generic Placeholders): `const lowerPlaceholder = placeholder.toLowerCase();`

### 📁 `cypress.config.cjs`

- 🔸 **Line 5** (Example Domains): `baseUrl: 'http://localhost:3000',`
- 🔸 **Line 43** (Example Domains): `apiUrl: 'http://localhost:5000',`

### 📁 `cypress/e2e/basic.cy.js`

- 🔸 **Line 24** (Example Domains): `cy.request('http://localhost:5000/health').then((response) => {`

### 📁 `cypress/support/commands.js`

- ⚠️ **Line 211** (Generic Placeholders): `'input[placeholder*="title"]': 'review-title',`
- ⚠️ **Line 212** (Generic Placeholders): `'textarea[placeholder*="review"]': 'review-content',`
- ⚠️ **Line 213** (Generic Placeholders): `'textarea[placeholder*="comment"]': 'comment-textarea',`

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
- ⚠️ **Line 60** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 65** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 70** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 75** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 80** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 85** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 90** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 95** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 100** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 105** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 110** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 115** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 120** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 125** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 130** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 135** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 140** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 145** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 150** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 155** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 160** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 165** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 170** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 175** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 180** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- ⚠️ **Line 185** (Generic Placeholders): `• Blocked domain detected: example.com<br>• Placeholder URL - needs to be replaced with real affiliate link`
- 🔸 **Line 293** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 299** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 304** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 310** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 315** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 321** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 326** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 332** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 337** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 343** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 348** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 354** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 359** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 365** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 370** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 376** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 381** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 387** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 436** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 442** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 447** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 453** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 458** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 464** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 469** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 475** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 480** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 486** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 491** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 497** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 502** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 508** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 513** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 519** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 524** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 530** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 623** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07VT259S5?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 629** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 634** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 640** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 645** (Example Domains): `<td><a href="https://www.amazon.com/dp/B08KTZ8249?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 651** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 656** (Example Domains): `<td><a href="https://www.amazon.com/dp/B01JKQR78Y?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 662** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 667** (Example Domains): `<td><a href="https://www.amazon.com/dp/B07MCTQHCV?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 673** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 678** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BN72FYFG?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 684** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 689** (Example Domains): `<td><a href="https://www.amazon.com/dp/B09B8V1LZ3?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 695** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 700** (Example Domains): `<td><a href="https://www.amazon.com/dp/B088MLC2MY?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 706** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`
- 🔸 **Line 711** (Example Domains): `<td><a href="https://www.amazon.com/dp/B0BDHWDR12?tag=dealradarus-20&linkCode=osi&th=1&psc=1" target="_blank">example.com</a></td>`
- ⚠️ **Line 717** (Generic Placeholders): `<td>Blocked domain detected: example.com, Placeholder URL - needs to be replaced with real affiliate link</td>`

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
- 🔸 **Line 123** (Example Domains): `"example.com": "yourdomain.com",`
- 🚨 **Line 124** (Analytics Placeholders): `"G-XXXXXXXXXX": "G-YOURTRACKINGID"`
- ⚠️ **Line 135** (Generic Placeholders): `- `placeholder`, `change-me`, `replace-me`, `to-be-filled``
- ⚠️ **Line 136** (Generic Placeholders): `- `your-*`, `dummy`, `sample`, `tbd`, `todo`, `fixme``
- 🚨 **Line 139** (Analytics Placeholders): `- **Google Analytics**: `G-XXXXXXXXXX`, `G-TEST*`, `UA-*``
- 🚨 **Line 140** (GTM Placeholders): `- **Google Tag Manager**: `GTM-XXXXXXX`, `GTM-TEST*``
- 🔸 **Line 142** (Example Domains): `- **URLs**: `example.com`, `localhost`, `127.0.0.1``
- 🔸 **Line 143** (Example Domains): `- **Emails**: `*@example.com`, `test@*`, `admin@localhost``
- 🔸 **Line 144** (Example Domains): `- **Databases**: Test connection strings, `localhost` databases`
- 🚨 **Line 147** (Hardcoded Credentials): `- Hardcoded credentials: `password=123456`, `pass=admin``
- 🚨 **Line 167** (Hardcoded Credentials): `| **Critical** | Hardcoded credentials, production secrets | `password=123456`, weak JWT secrets |`
- ⚠️ **Line 209** (Generic Placeholders): `API_KEY_HERE=your-api-key-here`
- 🔸 **Line 214** (Example Domains): `DATABASE_URL=postgresql://user:pass@localhost:5432/dealradar_dev`
- ⚠️ **Line 220** (Generic Placeholders): `"apiKey": "your-api-key-here",`
- 🔸 **Line 221** (Example Domains): `"domain": "example.com"`
- ⚠️ **Line 255** (Generic Placeholders): `- name: Placeholder Audit`
- ⚠️ **Line 269** (Generic Placeholders): `echo "❌ Placeholder audit failed. Fix issues before committing."`
- ⚠️ **Line 317** (Generic Placeholders): `node tools/placeholder-audit.js --fix secrets/fix-map.encrypted`
- ⚠️ **Line 345** (Generic Placeholders): `- **Cause**: Placeholder audit found in running server logs`
- ⚠️ **Line 370** (Generic Placeholders): `// In tools/placeholder-audit.js`
- ⚠️ **Line 384** (Generic Placeholders): `curl -X POST $SLACK_WEBHOOK -d '{"text":"🚨 Critical security issues found in placeholder audit!"}'`
- ⚠️ **Line 419** (Generic Placeholders): `2. **During development**: Use meaningful placeholder names`
- ⚠️ **Line 449** (Generic Placeholders): `**M3.9 Enhanced Placeholder Audit - Enterprise Grade Security Tool**`

### 📁 `docs/VERCEL-ROUTING-ISSUE.md`

- 🔸 **Line 20** (Example Domains): `curl http://localhost:3000/api/health`
- 🔸 **Line 23** (Example Domains): `curl http://localhost:3000/api/analytics`
- 🔸 **Line 26** (Example Domains): `curl http://localhost:3000/api/errors`

### 📁 `docs/VERCEL-SUPPORT-TICKET.md`

- 🔸 **Line 22** (Example Domains): `curl http://localhost:3000/api/health`
- 🔸 **Line 25** (Example Domains): `curl http://localhost:3000/api/analytics`
- ⚠️ **Line 299** (Generic Placeholders): `### Follow-up #1 - [Date TBD]`

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

### 📁 `docs/archive/deal-aggregator/core/crawl/crawl-multi-sources.js`

- ⚠️ **Line 85** (Generic Placeholders): `image: `https://via.placeholder.com/300x300?text=${sourceConfig.name}+${i + 1}`,`

### 📁 `docs/archive/deal-aggregator/core/process/enrich-deals.js`

- ⚠️ **Line 142** (Generic Placeholders): `// Show sample caption`
- ⚠️ **Line 143** (Generic Placeholders): `console.log('\n=== SAMPLE CAPTION ===');`
- ⚠️ **Line 145** (Generic Placeholders): `console.log('\n=== SAMPLE AFFILIATE URL ===');`

### 📁 `docs/archive/deal-aggregator/core/utils/__tests__/config.test.js`

- ⚠️ **Line 141** (Generic Placeholders): `FB_PAGE_ID: 'YOUR_PAGE_ID', // Default placeholder`
- ⚠️ **Line 153** (Generic Placeholders): `FB_PAGE_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN' // Default placeholder`

### 📁 `docs/archive/deal-aggregator/core/utils/__tests__/facebook-api.test.js`

- 🔸 **Line 107** (Example Domains): `link: 'https://example.com'`
- 🔸 **Line 112** (Example Domains): `link: 'https://example.com',`

### 📁 `docs/archive/deal-aggregator/core/utils/config.js`

- ⚠️ **Line 2** (Generic Placeholders): `* TODO: CONFIG UTILITY MODULE`
- ⚠️ **Line 21** (Generic Placeholders): `* TODO IMPLEMENTATION:`

### 📁 `docs/archive/deal-aggregator/data/logs/feasibility-multi-sources.md`

- ⚠️ **Line 14** (Generic Placeholders): `| Source | Region | Attempted | Success | Sample Deals | Status |`
- ⚠️ **Line 40** (Generic Placeholders): `- **Screenshot Success:** 100% (10/10 placeholder images created)`
- ⚠️ **Line 55** (Generic Placeholders): `- Page ID: ❌ Placeholder value detected`
- ⚠️ **Line 56** (Generic Placeholders): `- Access Token: ❌ Placeholder value detected`
- ⚠️ **Line 178** (Generic Placeholders): `- `./media/` - 10 product screenshots (placeholder format)`

### 📁 `docs/archive/deal-aggregator/data/logs/feasibility-report-final.md`

- ⚠️ **Line 112** (Generic Placeholders): `| **≥6 raw deals** | ✅ **8 deals** | US: 5, UK: 3 in `raw-sample.jsonl` |`
- ⚠️ **Line 126** (Generic Placeholders): `1. `raw-sample.jsonl` - Raw deal data (8 items)`
- ⚠️ **Line 127** (Generic Placeholders): `2. `enriched-sample.jsonl` - Processed deals (4 items)`

### 📁 `docs/archive/deal-aggregator/data/logs/summary-dryrun.md`

- ⚠️ **Line 15** (Generic Placeholders): `- **Source File**: `~/mcp/playwright-mcp/output/deals/raw-sample.jsonl``
- ⚠️ **Line 24** (Generic Placeholders): `- **Source File**: `~/mcp/playwright-mcp/output/deals/enriched-sample.jsonl``
- ⚠️ **Line 70** (Generic Placeholders): `1. **Raw Data**: `/Users/admin/mcp/playwright-mcp/output/deals/raw-sample.jsonl` (8 deals)`
- ⚠️ **Line 71** (Generic Placeholders): `2. **Enriched Data**: `/Users/admin/mcp/playwright-mcp/output/deals/enriched-sample.jsonl` (4 deals)`

### 📁 `docs/archive/deal-aggregator/docs/README.md`

- ⚠️ **Line 60** (Generic Placeholders): `- [ ] **Cập nhật Config**: Replace placeholder values trong .env.local.json`

### 📁 `docs/archive/deal-aggregator/docs/mcp-setup-complete.md`

- 🔸 **Line 142** (Example Domains): `# postgresql://username:password@localhost:5432/dealradarus_db`

### 📁 `docs/archive/deal-aggregator/platforms/facebook/facebook-post.js`

- ⚠️ **Line 64** (Generic Placeholders): `// TODO: For real posting, use: await facebookAPI.postMessage({ message: deal.caption, link: deal.affiliateUrl })`

### 📁 `docs/archive/deal-aggregator/platforms/facebook/test-facebook-access.js`

- ⚠️ **Line 105** (Generic Placeholders): `console.log('❌ Environment contains placeholder values');`

### 📁 `docs/archive/deal-aggregator/platforms/facebook/test-media-post.js`

- ⚠️ **Line 21** (Generic Placeholders): `const photoPath = path.join(__dirname, '../../../media/sample.jpg');`
- ⚠️ **Line 47** (Generic Placeholders): `console.log('SKIPPED: `ffmpeg` is not available in the environment to create a sample video file.');`
- ⚠️ **Line 50** (Generic Placeholders): `const videoPath = path.join(__dirname, '../../../media/sample.mp4');`

### 📁 `docs/archive/deal-aggregator/platforms/website/js/shared/__tests__/dom-utils.test.js`

- 💡 **Line 101** (Test/Dev Patterns): `const saved = saveState('testKey', testState);`
- 💡 **Line 104** (Test/Dev Patterns): `const loaded = loadState('testKey');`
- 💡 **Line 127** (Test/Dev Patterns): `const result = saveState('testKey', { test: 'data' });`

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/about.html`

- ⚠️ **Line 47** (Generic Placeholders): `<h2>Our Team (TODO: Add real team photos/bios)</h2>`

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/blog.html`

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

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/contact.html`

- ⚠️ **Line 44** (Generic Placeholders): `<p><strong>Phone:</strong> (555) 123-4567 (TODO: Add real phone number or remove)</p>`

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/deals.html`

- ⚠️ **Line 66** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 361** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 364** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/index.html`

- ⚠️ **Line 91** (Generic Placeholders): `<input type="text" id="search-input" placeholder="Search deals..." class="search-input" aria-label="Search for deals">`
- ⚠️ **Line 192** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=iPhone+14" alt="iPhone 14 Pro Max Refurbished" class="deal-image">`
- ⚠️ **Line 203** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Amazon+Echo" alt="Amazon Echo Dot 5th Generation" class="deal-image">`
- ⚠️ **Line 214** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=Gaming+Monitor" alt="27 inch Gaming Monitor 144Hz" class="deal-image">`
- ⚠️ **Line 225** (Generic Placeholders): `<img src="https://via.placeholder.com/300x200/1A73E8/ffffff?text=AirPods+Pro" alt="AirPods Pro 2nd Generation" class="deal-image">`
- ⚠️ **Line 245** (Generic Placeholders): `<!-- TODO: Connect newsletter form to backend service (Mailchimp/ConvertKit) -->`
- ⚠️ **Line 248** (Generic Placeholders): `<input type="email" id="newsletter-email" placeholder="Enter your email address" required aria-describedby="newsletter-note">`

### 📁 `docs/archive/deal-aggregator/platforms/website/pages/privacy.html`

- ⚠️ **Line 39** (Generic Placeholders): `<p><strong>TODO: This is a template. It requires a full review by a legal professional.</strong></p>`

### 📁 `docs/archive/deal-aggregator/scripts/post-test-message.js`

- ⚠️ **Line 28** (Generic Placeholders): `console.log(`🔑 Token: ${FB_ACCESS_TOKEN.length > 20 ? '[Valid length]' : '[Placeholder]'}`);`

### 📁 `docs/archive/deal-aggregator/scripts/setup-mcp-stack.sh`

- 🔸 **Line 148** (Example Domains): `"POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/dealradarus_db"`
- 🔸 **Line 221** (Example Domains): `sed -i.bak "s|postgresql://username:password@localhost:5432/dealradarus_db|$POSTGRES_URL|g" "$HOME/Library/Application Support/Claude/claude_desktop_config.json"`
- ⚠️ **Line 327** (Generic Placeholders): `-- Insert sample data for testing`
- ⚠️ **Line 405** (Generic Placeholders): `// Check for placeholder values`

### 📁 `docs/archive/handoff/claude_worklog.md`

- ⚠️ **Line 15** (Generic Placeholders): `- `media/sample.jpg` - Sample image file exists`
- ⚠️ **Line 27** (Generic Placeholders): `- `FB_PAGE_ID`: Currently set to placeholder "YOUR_PAGE_ID"`
- ⚠️ **Line 28** (Generic Placeholders): `- `FB_PAGE_ACCESS_TOKEN`: Currently set to placeholder "YOUR_ACCESS_TOKEN"`
- ⚠️ **Line 36** (Generic Placeholders): `- **Result:** ❌ OAuthException (code 190) - Expected with placeholder tokens`
- ⚠️ **Line 40** (Generic Placeholders): `- **Result:** ❌ OAuthException (code 190) - Expected with placeholder tokens`
- ⚠️ **Line 41** (Generic Placeholders): `- **Media Status:** Sample image exists at media/sample.jpg`
- ⚠️ **Line 54** (Generic Placeholders): `- Automatic sample video creation (3-second MP4 with text overlay)`
- ⚠️ **Line 93** (Generic Placeholders): `- Sample image available at media/sample.jpg`
- ⚠️ **Line 102** (Generic Placeholders): `- Page ID and Access Token are placeholder values`

### 📁 `docs/archive/handoff/qa_worklog.md`

- ⚠️ **Line 13** (Generic Placeholders): `- `/sitemap.xml` - CREATED - 7 main pages mapped (using example.com placeholder)`
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
- 🚨 **Line 147** (Analytics Placeholders): `- **GA4 Tracking ID:** G-ABCD123456 (placeholder format)`
- ⚠️ **Line 149** (Generic Placeholders): `- **Facebook Pixel ID:** 1234567890123456 (placeholder format)`
- ⚠️ **Line 159** (Generic Placeholders): `- **Tracking:** Full analytics implementation with realistic placeholder IDs`
- ⚠️ **Line 171** (Generic Placeholders): `All placeholder systems ready for production configuration.`

### 📁 `docs/deployment/DEPLOYMENT-CHECKLIST.md`

- 🚨 **Line 47** (API Key Placeholders): `GEMINI_API_KEY=your_production_key`
- 🚨 **Line 50** (API Key Placeholders): `JWT_SECRET=your_production_jwt_secret`
- 🚨 **Line 51** (API Key Placeholders): `NEXTAUTH_SECRET=your_nextauth_secret`
- 🔸 **Line 100** (Example Domains): `curl http://localhost:3000/health`
- 🔸 **Line 103** (Example Domains): `curl http://localhost:3000/api/deals`
- 🔸 **Line 104** (Example Domains): `curl http://localhost:3000/`
- 🔸 **Line 113** (Example Domains): `curl http://localhost:5000/health`
- 🔸 **Line 116** (Example Domains): `curl http://localhost:5000/api/deals`

### 📁 `docs/deployment/DEPLOYMENT_STATUS.md`

- ⚠️ **Line 223** (Generic Placeholders): `## ✅ TODO - Next Steps`

### 📁 `docs/deployment/DEPLOYMENT_STATUS_SUMMARY.md`

- 🔸 **Line 34** (Example Domains): `- Local testing verified: `http://localhost:3001``

### 📁 `docs/deployment/FINAL-DEPLOYMENT-GUIDE.md`

- ⚠️ **Line 206** (Generic Placeholders): `- **Analytics Events/Hour**: Baseline TBD`

### 📁 `docs/deployment/OPTION-A-DEPLOYMENT-REPORT.md`

- 🚨 **Line 208** (Analytics Placeholders): `- ✅ Google Analytics: G-9ZVTTTBD03`

### 📁 `docs/deployment/PRODUCTION-DEPLOYMENT-FINAL.md`

- 🚨 **Line 111** (API Key Placeholders): `VERCEL_TOKEN=your_token npm run purge:cache`

### 📁 `docs/deployment/PRODUCTION-DEPLOYMENT-SUCCESS-REPORT.md`

- 🚨 **Line 156** (Analytics Placeholders): `- **Google Analytics:** G-9ZVTTTBD03`

### 📁 `docs/deployment/PRODUCTION-DEPLOYMENT-SUMMARY.md`

- 🚨 **Line 12** (Analytics Placeholders): `📊 Google Analytics: G-9ZVTTTBD03`
- ⚠️ **Line 28** (Generic Placeholders): `All placeholder values have been replaced with real production data.`

### 📁 `docs/deployment/PRODUCTION-LAUNCH-CHECKLIST.md`

- 🚨 **Line 5** (Analytics Placeholders): `- ✅ **Google Analytics G4** - Tracking thực với ID: G-9ZVTTTBD03`
- ⚠️ **Line 27** (Generic Placeholders): `**Trạng thái**: ❌ Placeholder hiện tại`
- ⚠️ **Line 43** (Generic Placeholders): `**Trạng thái**: ❌ Placeholder links`

### 📁 `docs/deployment/PRODUCTION_CUTOVER_PLAN.md`

- ⚠️ **Line 6** (Generic Placeholders): `**Target Date:** [TBD - After staging validation]`

### 📁 `docs/deployment/PRODUCTION_GUIDE.md`

- 🔸 **Line 87** (Example Domains): `DB_HOST=localhost`
- 🚨 **Line 91** (Hardcoded Credentials): `DB_PASS=password`
- 🚨 **Line 94** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 95** (Analytics Placeholders): `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🚨 **Line 98** (API Key Placeholders): `JWT_SECRET=your-secure-jwt-secret`

### 📁 `docs/deployment/STAGING-DEPLOYMENT-EXECUTION.md`

- 🚨 **Line 418** (API Key Placeholders): `3. VERCEL_TOKEN=xxx vercel --yes  ✅ COMPLETED`

### 📁 `docs/deployment/WEBSITE-LAUNCH-COMPLETE.md`

- 🚨 **Line 14** (Analytics Placeholders): `- **✅ Real Measurement ID**: `G-9ZVTTTBD03``

### 📁 `docs/features/FULL-AUTOMATION-GUIDE.md`

- 🚨 **Line 50** (Analytics Placeholders): `- Google Analytics: `G-9ZVTTTBD03``

### 📁 `docs/features/RECAPTCHA-DEPLOYMENT-SUMMARY.md`

- 🔸 **Line 215** (Example Domains): `- **Server Status**: `http://localhost:3003/``

### 📁 `docs/features/RECAPTCHA-IMPLEMENTATION-GUIDE.md`

- 🔸 **Line 61** (Example Domains): `# Server runs on http://localhost:3003`
- 🔸 **Line 62** (Example Domains): `# API endpoint: http://localhost:3003/api/verify-recaptcha`
- 🔸 **Line 208** (Example Domains): `- [ ] Test from actual domain (not localhost)`

### 📁 `docs/infrastructure/DB-CONNECT-REPORT.md`

- ⚠️ **Line 95** (Generic Placeholders): `4. **Create Test User**: Insert sample user record`

### 📁 `docs/infrastructure/DB-VERIFICATION-INSTRUCTIONS.md`

- ⚠️ **Line 58** (Generic Placeholders): `-- Xem sample data (nếu có)`

### 📁 `docs/infrastructure/GA4-SETUP-SUMMARY.md`

- 🚨 **Line 6** (Analytics Placeholders): `- **Measurement ID**: `G-9ZVTTTBD03` ✅`
- 🚨 **Line 16** (Analytics Placeholders): `<script async src="https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03"></script>`
- 🚨 **Line 23** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`
- 🚨 **Line 150** (Analytics Placeholders): `2. Verify property `G-9ZVTTTBD03` is receiving data`
- 🚨 **Line 156** (GTM Placeholders): `- Container ID: `GTM-XXXXXXX` (to be configured)`
- 🚨 **Line 206** (Analytics Placeholders): `**Measurement ID**: `G-9ZVTTTBD03``

### 📁 `docs/infrastructure/GSC-VERIFICATION-FIXED.md`

- ⚠️ **Line 6** (Generic Placeholders): `- Comment cũ: `content="TODO"``
- ⚠️ **Line 60** (Generic Placeholders): `**Expected result**: Phải thấy verification code thật, không phải placeholder`

### 📁 `docs/infrastructure/RAILWAY_NEXT_STEPS.md`

- 🔸 **Line 199** (Example Domains): `# http://localhost:3000`
- 🔸 **Line 242** (Example Domains): `curl http://localhost:3001/api/health`

### 📁 `docs/marketing/AFFILIATE-LINKS-SUMMARY.md`

- ⚠️ **Line 7** (Generic Placeholders): `- **Links Replaced**: 34+ placeholder links`
- ⚠️ **Line 10** (Generic Placeholders): `- **Success Rate**: 100% placeholder removal`
- ⚠️ **Line 146** (Generic Placeholders): `- All placeholder links replaced with real affiliate URLs`
- ⚠️ **Line 182** (Generic Placeholders): `✅ **All placeholder links successfully replaced with monetized affiliate URLs**`

### 📁 `docs/marketing/TRAFFIC-GENERATION-ROADMAP.md`

- 🚨 **Line 237** (Analytics Placeholders): `- Google Analytics 4: Already configured (G-9ZVTTTBD03)`

### 📁 `docs/reference/COST_TRACKING.md`

- ⚠️ **Line 25** (Generic Placeholders): `| Written Data | TBD | 512 MB/month | TBD | $0 |`
- ⚠️ **Line 160** (Generic Placeholders): `- **Uptime > 99.9%:** ⏳ TBD (need 30 days data)`

### 📁 `docs/reports/CHATGPT_ASSESSMENT_ANALYSIS.md`

- ⚠️ **Line 224** (Generic Placeholders): `- ✅ Claude todo list tracked Phase 3 tasks`
- 🔸 **Line 362** (Example Domains): `curl https://[staging-url]/api/newsletter -X POST -d '{"email":"test@example.com"}'`

### 📁 `docs/reports/CHATGPT_CODE_REVIEW.md`

- 🔸 **Line 120** (Example Domains): `return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';`
- 🔸 **Line 124** (Example Domains): `? 'http://localhost:5000/api'`
- 🔸 **Line 135** (Example Domains): `- ✅ **EXCELLENT**: Solves production pointing to localhost:5000`
- 🔸 **Line 150** (Example Domains): `2. SSR: INTERNAL_API_URL or localhost:3000/api`
- 🔸 **Line 151** (Example Domains): `3. Dev: localhost:5000/api`
- 🔸 **Line 157** (Example Domains): `// ❌ Hardcoded localhost:5000`
- 🔸 **Line 158** (Example Domains): `const API_BASE_URL = 'http://localhost:5000/api';`
- 🔸 **Line 181** (Example Domains): `return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';`
- 🔸 **Line 185** (Example Domains): `? 'http://localhost:5000/api'`
- 🔸 **Line 193** (Example Domains): `- ✅ **EXCELLENT**: Prevents login calls to localhost:5000 in production`
- ⚠️ **Line 228** (Generic Placeholders): `- `tools/placeholder-audit.js` - Function declaration placement`
- 🔸 **Line 245** (Example Domains): `1. Dev: http://localhost:3000/login`

### 📁 `docs/reports/PHASE_3_4_STATUS_REPORT.md`

- 🔸 **Line 19** (Example Domains): `- ✅ Local testing verified (localhost:3001)`
- 🔸 **Line 173** (Example Domains): `curl http://localhost:3000/api/posts`

### 📁 `docs/reports/RAILWAY_INTEGRATION_TROUBLESHOOTING.md`

- 🔸 **Line 103** (Example Domains): `return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';`
- 🔸 **Line 108** (Example Domains): `? 'http://localhost:5000/api'`

### 📁 `docs/reports/SYSTEM-STATUS-REPORT.md`

- 🚨 **Line 97** (Analytics Placeholders): `- ✅ Google Analytics: `G-9ZVTTTBD03` - Active`
- 🚨 **Line 173** (Analytics Placeholders): `- 📈 Measurement ID: `G-9ZVTTTBD03``

### 📁 `docs/reports/gsc-submission-checklist.json`

- ⚠️ **Line 11** (Generic Placeholders): `"instructions": "Download from GSC, replace placeholder file, upload to root"`

### 📁 `docs/security/SECURITY-AUDIT-REPORT.md`

- ⚠️ **Line 39** (Generic Placeholders): `- **After**: Replaced with placeholder `YOUR_SMTP_APP_PASSWORD_OR_ACCOUNT_PASSWORD``
- ⚠️ **Line 41** (Generic Placeholders): `- **After**: Strong placeholder text with proper security guidance`

### 📁 `docs/testing/MANUAL_TESTING_GUIDE.md`

- 🔸 **Line 76** (Example Domains): `- [ ] Enter **valid email** (e.g., "test@example.com")`

### 📁 `docs/testing/e2e-error-analysis.md`

- 🔸 **Line 28** (Example Domains): `- **Evidence**: Cypress unable to verify server running at localhost:3000`

### 📁 `external-api/.env.example`

- 🚨 **Line 16** (API Key Placeholders): `# SENDGRID_API_KEY=your-sendgrid-key`

### 📁 `external-api/ENV_VARS_TEMPLATE.md`

- 🔸 **Line 203** (Example Domains): `curl http://localhost:3001/api/health`

### 📁 `external-api/RAILWAY_DEPLOYMENT.md`

- 🔸 **Line 288** (Example Domains): `'http://localhost:3000',`
- 🔸 **Line 289** (Example Domains): `'http://localhost:3001'`

### 📁 `external-api/README.md`

- 🔸 **Line 54** (Example Domains): `# Server runs on http://localhost:3001`
- 🔸 **Line 107** (Example Domains): `4. **Test locally**: `curl http://localhost:3001/api/[endpoint]``
- ⚠️ **Line 119** (Generic Placeholders): `| 🔴 High | `/api/health` | routes/health.js | TODO | Needs DB connection |`
- ⚠️ **Line 120** (Generic Placeholders): `| 🔴 High | `/api/posts` | routes/posts.js | TODO | Static data, easy |`
- ⚠️ **Line 121** (Generic Placeholders): `| 🔴 High | `/api/deals` | routes/deals.js | TODO | Needs DB |`
- ⚠️ **Line 122** (Generic Placeholders): `| 🟡 Medium | `/api/analytics` | routes/analytics.js | TODO | Needs DB, POST only |`
- ⚠️ **Line 123** (Generic Placeholders): `| 🟡 Medium | `/api/errors` | routes/errors.js | TODO | Needs DB, POST only |`
- ⚠️ **Line 124** (Generic Placeholders): `| 🟡 Medium | `/api/errors/summary` | routes/errors/summary.js | TODO | Nested route, needs DB |`
- ⚠️ **Line 125** (Generic Placeholders): `| 🟢 Low | `/api/newsletter` | routes/newsletter.js | TODO | Email service |`
- ⚠️ **Line 126** (Generic Placeholders): `| 🟢 Low | `/api/auth/me` | routes/auth/me.js | TODO | Auth check |`
- 🔸 **Line 245** (Example Domains): `curl http://localhost:3001/api/posts`
- 🔸 **Line 261** (Example Domains): `curl http://localhost:3001/api/posts`
- 🔸 **Line 262** (Example Domains): `curl http://localhost:3001/api/health`
- 🔸 **Line 263** (Example Domains): `curl http://localhost:3001/api/deals`
- 🔸 **Line 266** (Example Domains): `curl -X POST http://localhost:3001/api/analytics \`
- 🔸 **Line 277** (Example Domains): `BASE_URL="http://localhost:3001"`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/README.md`

- 🔸 **Line 196** (Example Domains): `It is **not recommended** to override this property unless you are also overriding the `remote_path`. This is the versioned name of the remote tarball containing the binary `.node` module and any supp`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/install.js`

- ⚠️ **Line 136** (Generic Placeholders): `gyp.todo.push({ name: 'build', args: args });`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/main.js`

- ⚠️ **Line 19** (Generic Placeholders): `if (prog.todo.length === 0) {`
- ⚠️ **Line 67** (Generic Placeholders): `const command = prog.todo.shift();`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/node-pre-gyp.js`

- ⚠️ **Line 147** (Generic Placeholders): `const commands = this.todo = [];`
- ⚠️ **Line 184** (Generic Placeholders): `this.todo = napi.expand_commands(this.package_json, this.opts, commands);`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/rebuild.js`

- ⚠️ **Line 17** (Generic Placeholders): `gyp.todo.unshift(commands[i - 1]);`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/reinstall.js`

- ⚠️ **Line 14** (Generic Placeholders): `gyp.todo.unshift(`

### 📁 `external-api/node_modules/@mapbox/node-pre-gyp/lib/util/versioning.js`

- ⚠️ **Line 125** (Generic Placeholders): `TODO: use semver module instead of custom version parsing`

### 📁 `external-api/node_modules/accepts/README.md`

- 🔸 **Line 125** (Example Domains): `curl -I -H'Accept: text/html' http://localhost:3000/`

### 📁 `external-api/node_modules/agent-base/dist/src/index.js`

- 🔸 **Line 87** (Example Domains): `opts.host = 'localhost';`

### 📁 `external-api/node_modules/agent-base/node_modules/debug/src/browser.js`

- ⚠️ **Line 111** (Generic Placeholders): `* TODO: add a `localStorage` variable to explicitly enable/disable colors`

### 📁 `external-api/node_modules/agent-base/src/index.ts`

- 🔸 **Line 200** (Example Domains): `opts.host = 'localhost';`

### 📁 `external-api/node_modules/are-we-there-yet/README.md`

- ⚠️ **Line 125** (Generic Placeholders): `* var subItem = tracker.newItem(**name**, **todo**, **weight**)`
- ⚠️ **Line 130** (Generic Placeholders): `var subItem = tracker.addUnit(new Tracker(name, todo), weight)`
- ⚠️ **Line 133** (Generic Placeholders): `* var subStream = tracker.newStream(**name**, **todo**, **weight**)`
- ⚠️ **Line 138** (Generic Placeholders): `var subStream = tracker.addUnit(new TrackerStream(name, todo), weight)`
- ⚠️ **Line 149** (Generic Placeholders): `* var tracker = new Tracker(**name**, **todo**)`
- ⚠️ **Line 153** (Generic Placeholders): `* **todo** *(optional)* The amount of work todo (a number). Defaults to 0.`
- ⚠️ **Line 163** (Generic Placeholders): `* tracker.addWork(**todo**)`
- ⚠️ **Line 165** (Generic Placeholders): `* **todo** A number to add to the amount of work to be done.`
- ⚠️ **Line 175** (Generic Placeholders): `Will never increase the work completed past the amount of work todo. That is,`
- ⚠️ **Line 203** (Generic Placeholders): `* tracker.addWork(**todo**)`
- ⚠️ **Line 205** (Generic Placeholders): `* **todo** Increase the expected overall size by **todo** bytes.`

### 📁 `external-api/node_modules/are-we-there-yet/lib/tracker-group.js`

- ⚠️ **Line 82** (Generic Placeholders): `TrackerGroup.prototype.newItem = function (name, todo, weight) {`
- ⚠️ **Line 83** (Generic Placeholders): `return this.addUnit(new Tracker(name, todo), weight)`
- ⚠️ **Line 86** (Generic Placeholders): `TrackerGroup.prototype.newStream = function (name, todo, weight) {`
- ⚠️ **Line 87** (Generic Placeholders): `return this.addUnit(new TrackerStream(name, todo), weight)`

### 📁 `external-api/node_modules/are-we-there-yet/lib/tracker.js`

- ⚠️ **Line 5** (Generic Placeholders): `var Tracker = module.exports = function (name, todo) {`
- ⚠️ **Line 8** (Generic Placeholders): `this.workTodo = todo || 0`

### 📁 `external-api/node_modules/body-parser/lib/types/json.js`

- ⚠️ **Line 77** (Generic Placeholders): `// TODO: maybe make this configurable or part of "strict" option`
- ⚠️ **Line 172** (Generic Placeholders): `message: e.message.replace(JSON_SYNTAX_REGEXP, function (placeholder) {`
- ⚠️ **Line 173** (Generic Placeholders): `return str.substring(index, index + placeholder.length)`

### 📁 `external-api/node_modules/call-bind-apply-helpers/index.js`

- ⚠️ **Line 9** (Generic Placeholders): `/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */`

### 📁 `external-api/node_modules/chokidar/index.js`

- ⚠️ **Line 119** (Generic Placeholders): `// TODO: this is not equal to path-normalize module - investigate why`

### 📁 `external-api/node_modules/chokidar/lib/fsevents-handler.js`

- ⚠️ **Line 15** (Generic Placeholders): `// TODO: real check`
- ⚠️ **Line 503** (Generic Placeholders): `// TODO: Strange thing: "should not choke on an ignored watch path" will be failed without 2 ready calls -__-`

### 📁 `external-api/node_modules/chokidar/lib/nodefs-handler.js`

- ⚠️ **Line 36** (Generic Placeholders): `// TODO: emit errors properly. Example: EMFILE on Macos.`
- ⚠️ **Line 258** (Generic Placeholders): `// TODO`

### 📁 `external-api/node_modules/color-support/index.js`

- ⚠️ **Line 100** (Generic Placeholders): `// TODO: add more term programs`

### 📁 `external-api/node_modules/cookie/README.md`

- ⚠️ **Line 208** (Generic Placeholders): `res.write('<input placeholder="enter your name" name="name"> <input type="submit" value="Set Name">');`

### 📁 `external-api/node_modules/cors/README.md`

- 🔸 **Line 78** (Example Domains): `origin: 'http://example.com',`
- 🔸 **Line 83** (Example Domains): `res.json({msg: 'This is CORS-enabled for only example.com.'})`
- 🔸 **Line 194** (Example Domains): `- `String` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.`
- 🔸 **Line 195** (Example Domains): `- `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/`

### 📁 `external-api/node_modules/debug/src/browser.js`

- ⚠️ **Line 36** (Generic Placeholders): `* TODO: add a `localStorage` variable to explicitly enable/disable colors`

### 📁 `external-api/node_modules/debug/src/node.js`

- ⚠️ **Line 178** (Generic Placeholders): `// Hack to have stream not keep the event loop alive.`
- ⚠️ **Line 200** (Generic Placeholders): `// FIXME Should probably have an option in net.Socket to create a`
- ⚠️ **Line 202** (Generic Placeholders): `// we'll just add this hack and set the `readable` member to false.`
- ⚠️ **Line 208** (Generic Placeholders): `// FIXME Hack to have stream not keep the event loop alive.`

### 📁 `external-api/node_modules/dotenv/README-es.md`

- ⚠️ **Line 69** (Generic Placeholders): `Eso es todo. `process.env` ahora tiene las claves y los valores que definiste en tu archivo `.env`:`
- ⚠️ **Line 328** (Generic Placeholders): `Sí! `dotenv.config()` devuelve un objeto que representa el archivo `.env` analizado. Esto te da todo lo que necesitas para poder establecer valores en `process.env`. Por ejemplo:`
- ⚠️ **Line 350** (Generic Placeholders): `> Cuando se ejecuta un módulo que contiene una sentencia `import`, los módulos que importa serán cargados primero, y luego se ejecuta cada bloque del módulo en un recorrido en profundidad del gráfico `

### 📁 `external-api/node_modules/dotenv/README.md`

- 🔸 **Line 178** (Example Domains): `DATABASE_URL="postgres://$(whoami)@localhost/my_database"`
- 🔸 **Line 187** (Example Domains): `DATABASE_URL postgres://yourusername@localhost/my_database`

### 📁 `external-api/node_modules/dotenv/lib/main.d.ts`

- 🔸 **Line 14** (Example Domains): `* @param src - contents to be parsed. example: `'DB_HOST=localhost'``
- 🔸 **Line 15** (Example Domains): `* @returns an object with keys and values based on `src`. example: `{ DB_HOST : 'localhost' }``

### 📁 `external-api/node_modules/encodeurl/README.md`

- 🔸 **Line 60** (Example Domains): `href.host = 'localhost'`

### 📁 `external-api/node_modules/express/History.md`

- ⚠️ **Line 2985** (Generic Placeholders): `* Removed generation of dummy test file from `express(1)``
- ⚠️ **Line 3578** (Generic Placeholders): `* Added flash() example to sample upload app`
- ⚠️ **Line 3644** (Generic Placeholders): `* Updated sample chat app to show messages on load`

### 📁 `external-api/node_modules/express/Readme.md`

- 🔸 **Line 109** (Example Domains): `View the website at: http://localhost:3000`

### 📁 `external-api/node_modules/express/lib/request.js`

- 🔸 **Line 384** (Example Domains): `* For example, if the domain is "tobi.ferrets.example.com":`
- ⚠️ **Line 452** (Generic Placeholders): `// TODO: change req.host to return host in next major`

### 📁 `external-api/node_modules/express/lib/response.js`

- 🔸 **Line 81** (Example Domains): `*      next: 'http://api.example.com/users?page=2',`
- 🔸 **Line 82** (Example Domains): `*      last: 'http://api.example.com/users?page=5'`
- 🔸 **Line 734** (Example Domains): `*    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);`
- 🔸 **Line 906** (Example Domains): `*    res.location('http://example.com');`
- 🔸 **Line 939** (Example Domains): `*    res.redirect('http://example.com');`
- 🔸 **Line 940** (Example Domains): `*    res.redirect(301, 'http://example.com');`

### 📁 `external-api/node_modules/express/lib/router/index.js`

- ⚠️ **Line 64** (Generic Placeholders): `* Map the given param placeholder `name`(s) to the given callback.`
- ⚠️ **Line 72** (Generic Placeholders): `* being that the value of the placeholder is passed, in this case the _id_`

### 📁 `external-api/node_modules/fs-minipass/node_modules/minipass/index.js`

- ⚠️ **Line 36** (Generic Placeholders): `// TODO remove when Node v8 support drops`

### 📁 `external-api/node_modules/glob/common.js`

- ⚠️ **Line 102** (Generic Placeholders): `// TODO: is an absolute `cwd` supposed to be resolved against `root`?`

### 📁 `external-api/node_modules/https-proxy-agent/node_modules/debug/src/browser.js`

- ⚠️ **Line 111** (Generic Placeholders): `* TODO: add a `localStorage` variable to explicitly enable/disable colors`

### 📁 `external-api/node_modules/iconv-lite/README.md`

- ⚠️ **Line 26** (Generic Placeholders): `buf = iconv.encode("Sample input string", 'win1251');`

### 📁 `external-api/node_modules/iconv-lite/encodings/dbcs-codec.js`

- ⚠️ **Line 348** (Generic Placeholders): `// TODO: What if we have no default? (resCode == undefined)`
- ⚠️ **Line 420** (Generic Placeholders): `// See todo above.`
- ⚠️ **Line 472** (Generic Placeholders): `// TODO: Callback with seq.`

### 📁 `external-api/node_modules/iconv-lite/encodings/dbcs-data.js`

- ⚠️ **Line 64** (Generic Placeholders): `// TODO: KDDI extension to Shift_JIS`
- ⚠️ **Line 65** (Generic Placeholders): `// TODO: IBM CCSID 942 = CP932, but F0-F9 custom chars and other char changes.`
- ⚠️ **Line 66** (Generic Placeholders): `// TODO: IBM CCSID 943 = Shift_JIS = CP932 with original Shift_JIS lower 128 chars.`

### 📁 `external-api/node_modules/iconv-lite/lib/extend-node.js`

- ⚠️ **Line 169** (Generic Placeholders): `// TODO: Set _charsWritten.`

### 📁 `external-api/node_modules/ipaddr.js/README.md`

- 🔸 **Line 210** (Example Domains): `addr.toString(); // => "127.0.0.1"`
- 🔸 **Line 224** (Example Domains): `var addr = ipaddr.parse("127.0.0.1");`

### 📁 `external-api/node_modules/mime-types/index.js`

- ⚠️ **Line 54** (Generic Placeholders): `// TODO: use media-typer`
- ⚠️ **Line 78** (Generic Placeholders): `// TODO: should this even be in this module?`
- ⚠️ **Line 91** (Generic Placeholders): `// TODO: use content-type or other module`
- ⚠️ **Line 112** (Generic Placeholders): `// TODO: use media-typer`

### 📁 `external-api/node_modules/mime/src/test.js`

- ⚠️ **Line 46** (Generic Placeholders): `// TODO: Uncomment once #157 is resolved`

### 📁 `external-api/node_modules/minimatch/minimatch.js`

- ⚠️ **Line 491** (Generic Placeholders): `// TODO: It would probably be faster to determine this`
- ⚠️ **Line 590** (Generic Placeholders): `// Hack to work around lack of negative lookbehind in JS`

### 📁 `external-api/node_modules/minipass/index.js`

- ⚠️ **Line 48** (Generic Placeholders): `// TODO remove when Node v8 support drops`

### 📁 `external-api/node_modules/minipass/index.mjs`

- ⚠️ **Line 48** (Generic Placeholders): `// TODO remove when Node v8 support drops`

### 📁 `external-api/node_modules/minizlib/node_modules/minipass/index.js`

- ⚠️ **Line 36** (Generic Placeholders): `// TODO remove when Node v8 support drops`

### 📁 `external-api/node_modules/node-addon-api/tools/conversion.js`

- ⚠️ **Line 73** (Generic Placeholders): `// TODO: Other attribute combinations`
- ⚠️ **Line 111** (Generic Placeholders): `// TODO: Properly handle this`

### 📁 `external-api/node_modules/node-fetch/README.md`

- 🔸 **Line 357** (Example Domains): ``url` should be an absolute url, such as `https://example.com/`. A path-relative URL (`/file/under/root`) or protocol-relative URL (`//can-be-http-or-https.com/`) will result in a rejected `Promise`.`
- ⚠️ **Line 406** (Generic Placeholders): `If no agent is specified, the default agent provided by Node.js is used. Note that [this changed in Node.js 19](https://github.com/nodejs/node/blob/4267b92604ad78584244488e7f7508a690cb80d0/lib/_http_a`

### 📁 `external-api/node_modules/node-fetch/lib/index.es.js`

- ⚠️ **Line 998** (Generic Placeholders): `// http.request() only supports string as Host header. This hack makes`
- ⚠️ **Line 1687** (Generic Placeholders): `// a hack for old IIS and Apache servers`

### 📁 `external-api/node_modules/node-fetch/lib/index.js`

- ⚠️ **Line 1002** (Generic Placeholders): `// http.request() only supports string as Host header. This hack makes`
- ⚠️ **Line 1691** (Generic Placeholders): `// a hack for old IIS and Apache servers`

### 📁 `external-api/node_modules/node-fetch/lib/index.mjs`

- ⚠️ **Line 996** (Generic Placeholders): `// http.request() only supports string as Host header. This hack makes`
- ⚠️ **Line 1685** (Generic Placeholders): `// a hack for old IIS and Apache servers`

### 📁 `external-api/node_modules/nodemon/README.md`

- 🔸 **Line 49** (Example Domains): `nodemon ./server.js localhost 8080`
- ⚠️ **Line 99** (Generic Placeholders): `A further example of options can be seen in [sample-nodemon.md](https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md)`

### 📁 `external-api/node_modules/nodemon/doc/cli/help.txt`

- ⚠️ **Line 19** (Generic Placeholders): `See also the sample: https://github.com/remy/nodemon/wiki/Sample-nodemon.json`

### 📁 `external-api/node_modules/nodemon/lib/monitor/run.js`

- ⚠️ **Line 286** (Generic Placeholders): `// FIXME decide whether or not we need to decide the encoding`

### 📁 `external-api/node_modules/nodemon/node_modules/debug/src/browser.js`

- ⚠️ **Line 111** (Generic Placeholders): `* TODO: add a `localStorage` variable to explicitly enable/disable colors`

### 📁 `external-api/node_modules/nopt/CHANGELOG.md`

- ⚠️ **Line 57** (Generic Placeholders): `The code sample in the README had `many2: [ oneThing ]`, and now it has`

### 📁 `external-api/node_modules/npmlog/README.md`

- ⚠️ **Line 158** (Generic Placeholders): `## log.newItem(name, todo, weight)`
- ⚠️ **Line 161** (Generic Placeholders): `* `todo` {Number} Optional; total amount of work to be done. Default 0.`
- ⚠️ **Line 168** (Generic Placeholders): `## log.newStream(name, todo, weight)`

### 📁 `external-api/node_modules/object-inspect/.eslintrc`

- ⚠️ **Line 15** (Generic Placeholders): `"strict": 0, // TODO`

### 📁 `external-api/node_modules/parseurl/README.md`

- 🔸 **Line 67** (Example Domains): `Parsing URL "http://localhost:8888/foo/bar?user=tj&pet=fluffy"`

### 📁 `external-api/node_modules/path-to-regexp/index.js`

- ⚠️ **Line 17** (Generic Placeholders): `* which will contain the placeholder`

### 📁 `external-api/node_modules/pg-connection-string/index.js`

- ⚠️ **Line 29** (Generic Placeholders): `// The URL is invalid so try again with a dummy host`

### 📁 `external-api/node_modules/pg-pool/index.js`

- ⚠️ **Line 60** (Generic Placeholders): `// TODO - document that once the pool emits an error`
- ⚠️ **Line 355** (Generic Placeholders): `// TODO(bmc): expose a proper, public interface _queryable and _ending`

### 📁 `external-api/node_modules/pg-protocol/dist/buffer-reader.js`

- ⚠️ **Line 9** (Generic Placeholders): `// TODO(bmc): support non-utf8 encoding?`

### 📁 `external-api/node_modules/pg-protocol/dist/parser.js`

- ⚠️ **Line 230** (Generic Placeholders): `// TODO(bmc): maybe better types here`

### 📁 `external-api/node_modules/pg-protocol/src/buffer-reader.ts`

- ⚠️ **Line 6** (Generic Placeholders): `// TODO(bmc): support non-utf8 encoding?`

### 📁 `external-api/node_modules/pg-protocol/src/parser.ts`

- ⚠️ **Line 309** (Generic Placeholders): `// TODO(bmc): maybe better types here`

### 📁 `external-api/node_modules/pg-types/test/types.js`

- 🔸 **Line 149** (Example Domains): `['127.0.0.1', '127.0.0.1'],`
- 🔸 **Line 440** (Example Domains): `['{127.0.0.1,fd00:1::40e,1.2.3.4}', function (t, value) {`
- 🔸 **Line 441** (Example Domains): `t.deepEqual(value, ['127.0.0.1', 'fd00:1::40e', '1.2.3.4']);`

### 📁 `external-api/node_modules/pg/lib/client.js`

- ⚠️ **Line 206** (Generic Placeholders): `// TODO(bmc): deprecate pgpass "built in" integration since this.password can be a function`
- ⚠️ **Line 330** (Generic Placeholders): `// TODO(bmc): this is swallowing errors - we shouldn't do this`

### 📁 `external-api/node_modules/pg/lib/connection.js`

- ⚠️ **Line 12** (Generic Placeholders): `// TODO(bmc) support binary mode at some point`

### 📁 `external-api/node_modules/pg/lib/defaults.js`

- 🔸 **Line 4** (Example Domains): `// database host. defaults to localhost`
- 🔸 **Line 5** (Example Domains): `host: 'localhost',`

### 📁 `external-api/node_modules/pg/lib/native/client.js`

- ⚠️ **Line 37** (Generic Placeholders): `// for the time being. TODO: deprecate all this jazz`

### 📁 `external-api/node_modules/pg/lib/query.js`

- ⚠️ **Line 210** (Generic Placeholders): `// TODO refactor this poor encapsulation`

### 📁 `external-api/node_modules/proxy-addr/README.md`

- 🔸 **Line 36** (Example Domains): `proxyaddr(req, function (addr) { return addr === '127.0.0.1' })`
- 🔸 **Line 45** (Example Domains): `proxyaddr(req, '127.0.0.1')`
- 🔸 **Line 71** (Example Domains): ``127.0.0.1`).`

### 📁 `external-api/node_modules/proxy-addr/index.js`

- 🔸 **Line 42** (Example Domains): `loopback: ['127.0.0.1/8', '::1/128'],`

### 📁 `external-api/node_modules/qs/test/stringify.js`

- ⚠️ **Line 516** (Generic Placeholders): `{ skip: 'TODO: figure out what this should do' }`
- ⚠️ **Line 1216** (Generic Placeholders): `{ skip: 'TODO: figure out what this should do' }`

### 📁 `external-api/node_modules/readable-stream/lib/_stream_readable.js`

- ⚠️ **Line 84** (Generic Placeholders): `// This is a hack to make sure that our error handler is attached before any`
- ⚠️ **Line 87** (Generic Placeholders): `// the prependListener() method. The goal is to eventually remove this hack.`
- ⚠️ **Line 324** (Generic Placeholders): `// TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.`

### 📁 `external-api/node_modules/readable-stream/lib/_stream_transform.js`

- ⚠️ **Line 184** (Generic Placeholders): `// TODO(BridgeAR): Write a test for these two error cases`

### 📁 `external-api/node_modules/readable-stream/lib/_stream_writable.js`

- ⚠️ **Line 265** (Generic Placeholders): `// TODO: defer error events consistently everywhere, not just the cb`

### 📁 `external-api/node_modules/semver/README.md`

- ⚠️ **Line 612** (Generic Placeholders): `TODO: Make sure that all of these items are documented (classes aren't,`

### 📁 `external-api/node_modules/semver/classes/range.js`

- ⚠️ **Line 489** (Generic Placeholders): `// TODO build?`

### 📁 `external-api/node_modules/send/README.md`

- 🔸 **Line 244** (Example Domains): `// Transfer arbitrary files from within /www/example.com/public/*`
- 🔸 **Line 302** (Example Domains): `// /www/example.com/public/*`

### 📁 `external-api/node_modules/send/node_modules/encodeurl/README.md`

- 🔸 **Line 81** (Example Domains): `href.host = 'localhost'`

### 📁 `external-api/node_modules/side-channel-list/index.js`

- ⚠️ **Line 111** (Generic Placeholders): `// @ts-expect-error TODO: figure out why this is erroring`

### 📁 `external-api/node_modules/side-channel-map/index.js`

- ⚠️ **Line 66** (Generic Placeholders): `// @ts-expect-error TODO: figure out why TS is erroring here`

### 📁 `external-api/node_modules/side-channel-weakmap/index.js`

- ⚠️ **Line 81** (Generic Placeholders): `// @ts-expect-error TODO: figure out why this is erroring`

### 📁 `external-api/node_modules/side-channel/index.js`

- ⚠️ **Line 41** (Generic Placeholders): `// @ts-expect-error TODO: figure out why this is erroring`

### 📁 `external-api/node_modules/string-width/index.d.ts`

- ⚠️ **Line 23** (Generic Placeholders): `// TODO: remove this in the next major version, refactor the whole definition to:`

### 📁 `external-api/node_modules/string-width/index.js`

- ⚠️ **Line 46** (Generic Placeholders): `// TODO: remove this in the next major version`

### 📁 `external-api/node_modules/tar/lib/mkdir.js`

- ⚠️ **Line 4** (Generic Placeholders): `// TODO: This should probably be a class, not functionally`

### 📁 `external-api/node_modules/unpipe/index.js`

- ⚠️ **Line 51** (Generic Placeholders): `// Node.js 0.8 hack`

### 📁 `external-api/node_modules/whatwg-url/lib/URL-impl.js`

- ⚠️ **Line 24** (Generic Placeholders): `// TODO: query stuff`
- ⚠️ **Line 164** (Generic Placeholders): `// TODO: query stuff`

### 📁 `external-api/node_modules/whatwg-url/lib/url-state-machine.js`

- 🔸 **Line 989** (Example Domains): `if (host === "localhost") {`
- ⚠️ **Line 1075** (Generic Placeholders): `// TODO: If c is not a URL code point and not "%", parse error.`
- ⚠️ **Line 1097** (Generic Placeholders): `// TODO: Add: not a URL code point`
- ⚠️ **Line 1122** (Generic Placeholders): `const buffer = new Buffer(this.buffer); // TODO: Use encoding override instead`
- ⚠️ **Line 1138** (Generic Placeholders): `// TODO: If c is not a URL code point and not "%", parse error.`
- ⚠️ **Line 1156** (Generic Placeholders): `// TODO: If c is not a URL code point and not "%", parse error.`

### 📁 `external-api/routes/auth/me.js`

- ⚠️ **Line 11** (Generic Placeholders): `// TODO: Implement proper JWT validation when auth system is fully integrated`

### 📁 `external-api/server.js`

- 🔸 **Line 23** (Example Domains): `// Allow requests from Vercel domains and localhost`
- 🔸 **Line 29** (Example Domains): `'http://localhost:3000',`
- 🔸 **Line 30** (Example Domains): `'http://localhost:3001'`

### 📁 `force-deploy-1757834853.txt`

- ⚠️ **Line 1** (Generic Placeholders): `Dummy change to force deployment`

### 📁 `ga4-guard-snippet.txt`

- 🚨 **Line 10** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 18** (Analytics Placeholders): `// Cấu hình cơ bản - chỉ G-9ZVTTTBD03`
- 🚨 **Line 19** (Analytics Placeholders): `gtag("config", "G-9ZVTTTBD03", {`

### 📁 `hooks/useApi.js`

- 🔸 **Line 8** (Example Domains): `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';`

### 📁 `hooks/useFavorites.js`

- 🔸 **Line 9** (Example Domains): `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';`

### 📁 `lib/store/slices/commentsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `lib/store/slices/reportsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `lib/store/slices/reviewsSlice.js`

- 🔸 **Line 4** (Example Domains): `const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';`

### 📁 `lib/utils/apiConfig.js`

- 🔸 **Line 20** (Example Domains): `return process.env.INTERNAL_API_URL || 'http://localhost:3000/api';`
- 🔸 **Line 25** (Example Domains): `? 'http://localhost:5000/api'`

### 📁 `lighthouse-after.json`

- 🔸 **Line 3** (Example Domains): `"requestedUrl": "http://localhost:3000/",`
- 🔸 **Line 4** (Example Domains): `"mainDocumentUrl": "http://localhost:3000/",`
- 🔸 **Line 5** (Example Domains): `"finalDisplayedUrl": "http://localhost:3000/",`
- 🔸 **Line 6** (Example Domains): `"finalUrl": "http://localhost:3000/",`
- ⚠️ **Line 280** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 288** (Example Domains): `"description": "Fetch API cannot load http://localhost:5000/api/auth/me. Refused to connect because it violates the document's Content Security Policy.",`
- 🔸 **Line 299** (Example Domains): `"description": "Fetch API cannot load http://localhost:5000/api/auth/me. Refused to connect because it violates the document's Content Security Policy.",`
- 🔸 **Line 310** (Example Domains): `"description": "Refused to connect to 'http://localhost:5000/api/auth/me' because it violates the following Content Security Policy directive: \"connect-src 'self' https://www.google-analytics.com htt`
- 🔸 **Line 321** (Example Domains): `"description": "Refused to connect to 'http://localhost:5000/api/auth/me' because it violates the following Content Security Policy directive: \"connect-src 'self' https://www.google-analytics.com htt`
- 🔸 **Line 362** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 452** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 461** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 723** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 729** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 735** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 759** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 918** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 932** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 935** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 949** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 952** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 966** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 969** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 983** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 986** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 1000** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1003** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_buildManifest.js",`
- 🔸 **Line 1017** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1020** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_ssgManifest.js",`
- 🔸 **Line 1034** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1037** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 1051** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1054** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_devMiddlewareManifest.json",`
- 🔸 **Line 1068** (Example Domains): `"entity": "localhost"`
- ⚠️ **Line 1071** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- ⚠️ **Line 1085** (Generic Placeholders): `"entity": "placeholder.com"`
- 🔸 **Line 1088** (Example Domains): `"url": "http://localhost:3000/favicon.ico",`
- 🔸 **Line 1102** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1105** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationToast_js.js",`
- 🔸 **Line 1119** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1122** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 1136** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1139** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 1153** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1156** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 1170** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1173** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 1187** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1190** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-latin.woff2",`
- 🔸 **Line 1204** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1207** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 1221** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1224** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 1238** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1247** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1253** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1259** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1265** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1271** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1277** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1283** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1317** (Example Domains): `"origin": "http://localhost:3000",`
- 🔸 **Line 1352** (Example Domains): `"origin": "http://localhost:3000",`
- ⚠️ **Line 1633** (Generic Placeholders): `"entity": "placeholder.com",`
- ⚠️ **Line 1638** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 1831** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 1841** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1865** (Example Domains): `"http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 1867** (Example Domains): `"http://localhost:3000/",`
- 🔸 **Line 2029** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 2040** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 2051** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 2276** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 2282** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 2297** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 2303** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 2309** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 2315** (Example Domains): `"name": "http://localhost:3000/_next/static/development/_buildManifest.js",`
- 🔸 **Line 2321** (Example Domains): `"name": "http://localhost:3000/_next/static/development/_ssgManifest.js",`
- 🔸 **Line 2327** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationToast_js.js",`
- 🔸 **Line 2333** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 2339** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 2345** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 3644** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 3648** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 3652** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 3656** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 3660** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 3664** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-latin.woff2",`
- 🔸 **Line 3668** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 3672** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 3676** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 3680** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 3757** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 3880** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 4224** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4233** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4243** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4253** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4263** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4273** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4283** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4293** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4303** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4313** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4489** (Example Domains): `"url": "http://localhost:5000/api/auth/me"`
- 🔸 **Line 4856** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 4869** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 4882** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 5408** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 5414** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 5421** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 5427** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 5433** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 5504** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 6695** (Example Domains): `"name": "localhost",`
- 🔸 **Line 6697** (Example Domains): `"http://localhost:3000"`
- ⚠️ **Line 6703** (Generic Placeholders): `"name": "placeholder.com",`
- ⚠️ **Line 6705** (Generic Placeholders): `"https://via.placeholder.com"`

### 📁 `lighthouse-final.json`

- 🔸 **Line 3** (Example Domains): `"requestedUrl": "http://localhost:3000/",`
- 🔸 **Line 4** (Example Domains): `"mainDocumentUrl": "http://localhost:3000/",`
- 🔸 **Line 5** (Example Domains): `"finalDisplayedUrl": "http://localhost:3000/",`
- 🔸 **Line 6** (Example Domains): `"finalUrl": "http://localhost:3000/",`
- ⚠️ **Line 258** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 269** (Example Domains): `"url": "http://localhost:3000/_next/data/m6_wEJoTQT32LQyvu81_0/index.json",`
- 🔸 **Line 277** (Example Domains): `"description": "Fetch API cannot load http://localhost:5000/api/auth/me. Refused to connect because it violates the document's Content Security Policy.",`
- 🔸 **Line 280** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 288** (Example Domains): `"description": "Refused to connect to 'http://localhost:5000/api/auth/me' because it violates the following Content Security Policy directive: \"connect-src 'self' https://www.google-analytics.com htt`
- 🔸 **Line 291** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 329** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 434** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 694** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 700** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 712** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 718** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main-37803d900332a8f9.js",`
- 🔸 **Line 877** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 891** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 894** (Example Domains): `"url": "http://localhost:3000/_next/static/css/1c78e31477ed0541.css",`
- 🔸 **Line 909** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 912** (Example Domains): `"url": "http://localhost:3000/_next/static/css/025d42a665d7e45d.css",`
- 🔸 **Line 927** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 930** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack-a7f302f43a06c17f.js",`
- 🔸 **Line 944** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 947** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 961** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 964** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-c0d76f48-3f2ae32efaa5397e.js",`
- 🔸 **Line 978** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 981** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-7237a82e-41bde908ffa3f15c.js",`
- 🔸 **Line 995** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 998** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-406ec44c-ae1bb1b918062f63.js",`
- 🔸 **Line 1012** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1015** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-ad6a2f20-f676d8c3e40f583f.js",`
- 🔸 **Line 1029** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1032** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-00833fa6-68b208eb3a94b3ab.js",`
- 🔸 **Line 1046** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1049** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-c67ab43f-ca96a524126638c5.js",`
- 🔸 **Line 1063** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1066** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-b49fab05-a4ad75e321c35d11.js",`
- 🔸 **Line 1080** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1083** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-052d92a9-f27a5b95a69ad19d.js",`
- 🔸 **Line 1097** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1100** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-ea1fa831-6dee2d8521a8a99d.js",`
- 🔸 **Line 1114** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1117** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 1131** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1134** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-d91c2bd6-febb21b367cfc24b.js",`
- 🔸 **Line 1148** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1151** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-42bbf998-00ec364adc67b1e8.js",`
- 🔸 **Line 1165** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1168** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-2898f16f-f7497e81360490ae.js",`
- 🔸 **Line 1182** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1185** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-fa70753b-7c8d3b78e3df954b.js",`
- 🔸 **Line 1199** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1202** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-eb2fbf4c-8921425103bec05f.js",`
- 🔸 **Line 1216** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1219** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main-37803d900332a8f9.js",`
- 🔸 **Line 1233** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1236** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 1250** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1253** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/common-56a496a777753972.js",`
- 🔸 **Line 1267** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1270** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index-0777246bb11df8bd.js",`
- 🔸 **Line 1284** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1287** (Example Domains): `"url": "http://localhost:3000/_next/static/m6_wEJoTQT32LQyvu81_0/_buildManifest.js",`
- 🔸 **Line 1301** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1304** (Example Domains): `"url": "http://localhost:3000/_next/static/m6_wEJoTQT32LQyvu81_0/_ssgManifest.js",`
- 🔸 **Line 1318** (Example Domains): `"entity": "localhost"`
- ⚠️ **Line 1321** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- ⚠️ **Line 1335** (Generic Placeholders): `"entity": "placeholder.com"`
- 🔸 **Line 1338** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/467.26b2da3b4dc0a416.js",`
- 🔸 **Line 1352** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1355** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/695.907c6bc95f60073e.js",`
- 🔸 **Line 1369** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1372** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/105.eddc15a7f9eb0c25.js",`
- 🔸 **Line 1386** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1389** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/621.e9e4edf824d0e08e.js",`
- 🔸 **Line 1403** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1406** (Example Domains): `"url": "http://localhost:3000/favicon.ico",`
- 🔸 **Line 1420** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1423** (Example Domains): `"url": "http://localhost:3000/_next/data/m6_wEJoTQT32LQyvu81_0/index.json",`
- 🔸 **Line 1437** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1440** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/login-aa9bc66d35ce2a2b.js",`
- 🔸 **Line 1454** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1457** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/signup-8498fed8707b0b1f.js",`
- 🔸 **Line 1471** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1474** (Example Domains): `"url": "http://localhost:3000/_next/static/css/025d42a665d7e45d.css",`
- 🔸 **Line 1488** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1491** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/login-aa9bc66d35ce2a2b.js",`
- 🔸 **Line 1505** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1508** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/signup-8498fed8707b0b1f.js",`
- 🔸 **Line 1522** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1531** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1537** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1543** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1549** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1555** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1561** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1567** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1573** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1579** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1585** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1591** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1597** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1603** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1609** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1615** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1621** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1627** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1633** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1639** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1645** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1651** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1657** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1663** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1669** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1675** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1681** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1715** (Example Domains): `"origin": "http://localhost:3000",`
- 🔸 **Line 1750** (Example Domains): `"origin": "http://localhost:3000",`
- ⚠️ **Line 2019** (Generic Placeholders): `"entity": "placeholder.com",`
- ⚠️ **Line 2024** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 2238** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 2243** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 2248** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-eb2fbf4c-8921425103bec05f.js",`
- 🔸 **Line 2253** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 2272** (Example Domains): `"http://localhost:3000/",`
- 🔸 **Line 2273** (Example Domains): `"http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 2274** (Example Domains): `"http://localhost:3000/_next/static/chunks/vendors-eb2fbf4c-8921425103bec05f.js",`
- 🔸 **Line 2275** (Example Domains): `"http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 2615** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/webpack-a7f302f43a06c17f.js",`
- 🔸 **Line 2621** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 2627** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-c0d76f48-3f2ae32efaa5397e.js",`
- 🔸 **Line 2633** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-7237a82e-41bde908ffa3f15c.js",`
- 🔸 **Line 2639** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-406ec44c-ae1bb1b918062f63.js",`
- 🔸 **Line 2645** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-ad6a2f20-f676d8c3e40f583f.js",`
- 🔸 **Line 2651** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-00833fa6-68b208eb3a94b3ab.js",`
- 🔸 **Line 2657** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-c67ab43f-ca96a524126638c5.js",`
- 🔸 **Line 2663** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-b49fab05-a4ad75e321c35d11.js",`
- 🔸 **Line 2669** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-052d92a9-f27a5b95a69ad19d.js",`
- 🔸 **Line 2675** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-ea1fa831-6dee2d8521a8a99d.js",`
- 🔸 **Line 2681** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 2687** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-d91c2bd6-febb21b367cfc24b.js",`
- 🔸 **Line 2693** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-42bbf998-00ec364adc67b1e8.js",`
- 🔸 **Line 2699** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-2898f16f-f7497e81360490ae.js",`
- 🔸 **Line 2705** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-fa70753b-7c8d3b78e3df954b.js",`
- 🔸 **Line 2711** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/vendors-eb2fbf4c-8921425103bec05f.js",`
- 🔸 **Line 2717** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/main-37803d900332a8f9.js",`
- 🔸 **Line 2723** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 2729** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/common-56a496a777753972.js",`
- 🔸 **Line 2735** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/index-0777246bb11df8bd.js",`
- 🔸 **Line 2741** (Example Domains): `"name": "http://localhost:3000/_next/static/m6_wEJoTQT32LQyvu81_0/_buildManifest.js",`
- 🔸 **Line 2747** (Example Domains): `"name": "http://localhost:3000/_next/static/m6_wEJoTQT32LQyvu81_0/_ssgManifest.js",`
- 🔸 **Line 2753** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/467.26b2da3b4dc0a416.js",`
- 🔸 **Line 2759** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/695.907c6bc95f60073e.js",`
- 🔸 **Line 2765** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/105.eddc15a7f9eb0c25.js",`
- 🔸 **Line 2771** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/621.e9e4edf824d0e08e.js",`
- 🔸 **Line 2777** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/login-aa9bc66d35ce2a2b.js",`
- 🔸 **Line 2783** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/signup-8498fed8707b0b1f.js",`
- 🔸 **Line 4063** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/framework-a6e0b7e30f98059a.js",`
- 🔸 **Line 4067** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4071** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-2898f16f-f7497e81360490ae.js",`
- 🔸 **Line 4075** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app-21b4abd4268952f1.js",`
- 🔸 **Line 4079** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-c0d76f48-3f2ae32efaa5397e.js",`
- 🔸 **Line 4083** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-fa70753b-7c8d3b78e3df954b.js",`
- 🔸 **Line 4087** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-406ec44c-ae1bb1b918062f63.js",`
- 🔸 **Line 4091** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-ad6a2f20-f676d8c3e40f583f.js",`
- 🔸 **Line 4095** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-052d92a9-f27a5b95a69ad19d.js",`
- 🔸 **Line 4099** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-eb2fbf4c-8921425103bec05f.js",`
- 🔸 **Line 4527** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4536** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4546** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4556** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4566** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4576** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4586** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4596** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/vendors-f67df17f-5225f2c478d8579f.js",`
- 🔸 **Line 4772** (Example Domains): `"url": "http://localhost:5000/api/auth/me"`
- 🔸 **Line 5696** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 6950** (Example Domains): `"name": "localhost",`
- 🔸 **Line 6952** (Example Domains): `"http://localhost:3000"`
- ⚠️ **Line 6958** (Generic Placeholders): `"name": "placeholder.com",`
- ⚠️ **Line 6960** (Generic Placeholders): `"https://via.placeholder.com"`

### 📁 `lighthouse-report.json`

- 🔸 **Line 3** (Example Domains): `"requestedUrl": "http://localhost:3000/",`
- 🔸 **Line 4** (Example Domains): `"mainDocumentUrl": "http://localhost:3000/",`
- 🔸 **Line 5** (Example Domains): `"finalDisplayedUrl": "http://localhost:3000/",`
- 🔸 **Line 6** (Example Domains): `"finalUrl": "http://localhost:3000/",`
- ⚠️ **Line 280** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 288** (Example Domains): `"description": "Fetch API cannot load http://localhost:5000/api/auth/me. Refused to connect because it violates the document's Content Security Policy.",`
- 🔸 **Line 299** (Example Domains): `"description": "Fetch API cannot load http://localhost:5000/api/auth/me. Refused to connect because it violates the document's Content Security Policy.",`
- 🔸 **Line 310** (Example Domains): `"description": "Refused to connect to 'http://localhost:5000/api/auth/me' because it violates the following Content Security Policy directive: \"connect-src 'self' https://www.google-analytics.com htt`
- 🔸 **Line 321** (Example Domains): `"description": "Refused to connect to 'http://localhost:5000/api/auth/me' because it violates the following Content Security Policy directive: \"connect-src 'self' https://www.google-analytics.com htt`
- 🔸 **Line 362** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 452** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 461** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 723** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 729** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 735** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 759** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 918** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 932** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 935** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 949** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 952** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 966** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 969** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 983** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 986** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 1000** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1003** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_buildManifest.js",`
- 🔸 **Line 1017** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1020** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_ssgManifest.js",`
- 🔸 **Line 1034** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1037** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 1051** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1054** (Example Domains): `"url": "http://localhost:3000/_next/static/development/_devMiddlewareManifest.json",`
- 🔸 **Line 1068** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1071** (Example Domains): `"url": "http://localhost:3000/favicon.ico",`
- 🔸 **Line 1085** (Example Domains): `"entity": "localhost"`
- ⚠️ **Line 1088** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- ⚠️ **Line 1102** (Generic Placeholders): `"entity": "placeholder.com"`
- 🔸 **Line 1105** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationToast_js.js",`
- 🔸 **Line 1119** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1122** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 1136** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1139** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 1153** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1156** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 1170** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1173** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 1187** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1190** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-latin.woff2",`
- 🔸 **Line 1204** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1207** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 1221** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1224** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 1238** (Example Domains): `"entity": "localhost"`
- 🔸 **Line 1247** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1253** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1259** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1265** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1271** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1277** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1283** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1317** (Example Domains): `"origin": "http://localhost:3000",`
- 🔸 **Line 1352** (Example Domains): `"origin": "http://localhost:3000",`
- ⚠️ **Line 1621** (Generic Placeholders): `"entity": "placeholder.com",`
- ⚠️ **Line 1626** (Generic Placeholders): `"url": "https://via.placeholder.com/300x200",`
- 🔸 **Line 1819** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 1829** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 1848** (Example Domains): `"http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 1850** (Example Domains): `"http://localhost:3000/",`
- 🔸 **Line 1966** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 1977** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 1988** (Example Domains): `"scriptUrl": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 2213** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 2219** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 2234** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 2240** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 2246** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 2252** (Example Domains): `"name": "http://localhost:3000/_next/static/development/_buildManifest.js",`
- 🔸 **Line 2258** (Example Domains): `"name": "http://localhost:3000/_next/static/development/_ssgManifest.js",`
- 🔸 **Line 2264** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationToast_js.js",`
- 🔸 **Line 2270** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 2276** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 2282** (Example Domains): `"name": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 3581** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 3585** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/_app.js",`
- 🔸 **Line 3589** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/pages/index.js",`
- 🔸 **Line 3593** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_NotificationCenter_js.js",`
- 🔸 **Line 3597** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 3601** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-latin.woff2",`
- 🔸 **Line 3605** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 3609** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 3613** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_reports_ReportModal_js.js",`
- 🔸 **Line 3617** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/_pages-dir-browser_components_ui_ConsentBanner_js.js",`
- 🔸 **Line 3694** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 3817** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/webpack.js",`
- 🔸 **Line 4161** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4170** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4180** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4190** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4200** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4210** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4220** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4230** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4240** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4250** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 4426** (Example Domains): `"url": "http://localhost:5000/api/auth/me"`
- 🔸 **Line 4793** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 4806** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 4819** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 4832** (Example Domains): `"frameUrl": "http://localhost:3000/"`
- 🔸 **Line 5307** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5316** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5326** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5336** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5346** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5356** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5366** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5376** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5386** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5396** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/main.js",`
- 🔸 **Line 5459** (Example Domains): `"url": "http://localhost:3000/",`
- 🔸 **Line 5465** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-latin.woff2",`
- 🔸 **Line 5472** (Example Domains): `"url": "http://localhost:3000/__nextjs_font/geist-mono-latin.woff2",`
- 🔸 **Line 5478** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 5484** (Example Domains): `"url": "http://localhost:3000/__nextjs_original-stack-frames",`
- 🔸 **Line 5490** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 5561** (Example Domains): `"url": "http://localhost:3000/_next/static/chunks/react-refresh.js",`
- 🔸 **Line 6752** (Example Domains): `"name": "localhost",`
- 🔸 **Line 6754** (Example Domains): `"http://localhost:3000"`
- ⚠️ **Line 6760** (Generic Placeholders): `"name": "placeholder.com",`
- ⚠️ **Line 6762** (Generic Placeholders): `"https://via.placeholder.com"`

### 📁 `monitoring/error-tracker.cjs`

- 🔸 **Line 174** (Example Domains): `console.log(`📊 Error Tracker running on http://localhost:${port}/monitoring`);`

### 📁 `monitoring/errors/2025-09-20-low.json`

- 🔸 **Line 1** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`
- 🔸 **Line 4** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`
- 🔸 **Line 5** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`
- 🔸 **Line 6** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`
- 🔸 **Line 7** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`

### 📁 `monitoring/errors/2025-09-21-low.json`

- 🔸 **Line 1** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`
- 🔸 **Line 2** (Example Domains): `{"type":"network_error","message":"Network request failed: Failed to fetch","url":"http://localhost:5000/api/auth/me","stack":"TypeError: Failed to fetch\n    at window.fetch (webpack-internal:///(pag`

### 📁 `next.config.js`

- ⚠️ **Line 16** (Generic Placeholders): `'via.placeholder.com',`

### 📁 `package.json`

- ⚠️ **Line 45** (Generic Placeholders): `"audit:placeholders": "node tools/placeholder-audit.js --verbose",`
- ⚠️ **Line 46** (Generic Placeholders): `"audit:placeholders:fix": "node tools/placeholder-audit.js --verbose --fix",`
- ⚠️ **Line 47** (Generic Placeholders): `"audit:placeholders:report": "node tools/placeholder-audit.js --verbose --report PLACEHOLDER-AUDIT-REPORT.md",`
- ⚠️ **Line 48** (Generic Placeholders): `"audit:placeholders:ci": "node tools/placeholder-audit.js --report CI-PLACEHOLDER-AUDIT.md",`
- ⚠️ **Line 49** (Generic Placeholders): `"precommit:audit": "node tools/placeholder-audit.js",`

### 📁 `pages/api/auth/me.js`

- 🔸 **Line 8** (Example Domains): `const allowed = ['http://localhost:3000', 'https://dealradarus.com'];`
- ⚠️ **Line 22** (Generic Placeholders): `// TODO: Implement proper JWT validation when auth system is fully integrated`

### 📁 `pages/favorites.js`

- ⚠️ **Line 231** (Generic Placeholders): `src={deal.image || '/placeholder-deal.jpg'}`
- ⚠️ **Line 234** (Generic Placeholders): `e.target.src = '/placeholder-deal.jpg';`

### 📁 `pages/forgot-password.js`

- ⚠️ **Line 147** (Generic Placeholders): `placeholder="Enter your email address"`

### 📁 `pages/login.js`

- ⚠️ **Line 130** (Generic Placeholders): `placeholder="Enter your email"`
- ⚠️ **Line 150** (Generic Placeholders): `placeholder="Enter your password"`

### 📁 `pages/profile.js`

- ⚠️ **Line 183** (Generic Placeholders): `placeholder="Enter your first name"`
- ⚠️ **Line 199** (Generic Placeholders): `placeholder="Enter your last name"`

### 📁 `pages/reset-password.js`

- ⚠️ **Line 205** (Generic Placeholders): `placeholder="Enter your new password"`
- ⚠️ **Line 248** (Generic Placeholders): `placeholder="Confirm your new password"`

### 📁 `pages/search.js`

- ⚠️ **Line 165** (Generic Placeholders): `placeholder="$0"`
- ⚠️ **Line 175** (Generic Placeholders): `placeholder="$999"`
- ⚠️ **Line 225** (Generic Placeholders): `src={deal.image || '/placeholder-deal.jpg'}`
- ⚠️ **Line 228** (Generic Placeholders): `e.target.src = '/placeholder-deal.jpg';`

### 📁 `pages/signup.js`

- ⚠️ **Line 198** (Generic Placeholders): `placeholder="First name"`
- ⚠️ **Line 217** (Generic Placeholders): `placeholder="Last name"`
- ⚠️ **Line 237** (Generic Placeholders): `placeholder="Enter your email"`
- ⚠️ **Line 257** (Generic Placeholders): `placeholder="Enter your password"`
- ⚠️ **Line 300** (Generic Placeholders): `placeholder="Confirm your password"`

### 📁 `scripts/README-deal-checker.md`

- ⚠️ **Line 9** (Generic Placeholders): `- ✅ **Issue Detection**: Identifies placeholder URLs, invalid domains, missing parameters`
- ⚠️ **Line 59** (Generic Placeholders): `- 🚨 **Placeholder URLs**: example.com links that need replacement`
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

### 📁 `scripts/final-production-verification.js`

- ⚠️ **Line 54** (Generic Placeholders): `console.log(`   ✅ Database: ${tablesResult.rows[0].count} tables, ${dealsResult.rows[0].count} sample deals`);`

### 📁 `scripts/fix-ga4-issues.js`

- 🚨 **Line 26** (Analytics Placeholders): `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';`
- 🚨 **Line 34** (Analytics Placeholders): `gtag('config', 'G-9ZVTTTBD03', {`

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

### 📁 `scripts/production-deploy-phased.js`

- 🚨 **Line 60** (Analytics Placeholders): `googleAnalyticsId: 'G-9ZVTTTBD03',`
- ⚠️ **Line 234** (Generic Placeholders): `pattern: /<!-- GSC Verification: meta name="google-site-verification" content="TODO" -->/g,`
- ⚠️ **Line 236** (Generic Placeholders): `description: 'Remove GSC TODO comment'`
- ⚠️ **Line 239** (Generic Placeholders): `pattern: /<!-- Facebook Pixel: TODO script snippet -->/g,`
- ⚠️ **Line 241** (Generic Placeholders): `description: 'Remove Facebook Pixel TODO comment'`

### 📁 `scripts/production-deploy.js`

- 🚨 **Line 18** (Analytics Placeholders): `googleAnalyticsId: 'G-9ZVTTTBD03',`
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

### 📁 `scripts/setup-git-hooks.sh`

- 🚨 **Line 17** (Analytics Placeholders): `echo "  - Only G-9ZVTTTBD03 is allowed"`

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

### 📁 `server/add-missing-columns.js`

- ⚠️ **Line 113** (Generic Placeholders): `console.log('📄 Sample deal with all columns:', {`
- ⚠️ **Line 133** (Generic Placeholders): `console.log('🌱 Adding sample deal for testing...');`
- ⚠️ **Line 142** (Generic Placeholders): `'Sample deal to test E2E functionality',`
- ⚠️ **Line 143** (Generic Placeholders): `'https://via.placeholder.com/300x200',`
- ⚠️ **Line 145** (Generic Placeholders): `true, 'Test Store', 'test,sample,e2e', 10, true`
- ⚠️ **Line 153** (Generic Placeholders): `console.log(`  ✅ Sample deal created with ID: ${result.rows[0].id}`);`
- ⚠️ **Line 155** (Generic Placeholders): `console.log('  ⏭️  Sample data already exists');`
- ⚠️ **Line 159** (Generic Placeholders): `console.error('❌ Adding sample data failed:', error.message);`

### 📁 `server/app.cjs`

- 🔸 **Line 79** (Example Domains): `'http://localhost:3000',`
- 🔸 **Line 80** (Example Domains): `'http://localhost:5000',`
- 🔸 **Line 244** (Example Domains): `console.log(`📊 Health check: http://localhost:${PORT}/health`);`
- 🔸 **Line 245** (Example Domains): `console.log(`📚 API docs: http://localhost:${PORT}/api`);`

### 📁 `server/apply-full-schema.js`

- ⚠️ **Line 145** (Generic Placeholders): `console.log('📄 Sample deal structure:', {`

### 📁 `server/cache/redis.js`

- 🔸 **Line 27** (Example Domains): `const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';`

### 📁 `server/contact.example.js`

- 🔸 **Line 40** (Example Domains): `// Skip rate limiting for localhost in development`
- 🔸 **Line 42** (Example Domains): `(req.ip === '127.0.0.1' || req.ip === '::1');`

### 📁 `server/database-setup.js`

- ⚠️ **Line 201** (Generic Placeholders): `4. **Create Test User**: Insert sample user record`

### 📁 `server/fix-missing-image-column.js`

- ⚠️ **Line 76** (Generic Placeholders): `console.log('📄 Sample deal:', {`

### 📁 `server/jobs/alerts-processor.js`

- ⚠️ **Line 176** (Generic Placeholders): `image_url: 'https://via.placeholder.com/300x200',`

### 📁 `server/newsletter-handler.js`

- ⚠️ **Line 273** (Generic Placeholders): `for (const [placeholder, value] of Object.entries(replacements)) {`
- ⚠️ **Line 274** (Generic Placeholders): `payload = payload.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);`
- ⚠️ **Line 305** (Generic Placeholders): `for (const [placeholder, value] of Object.entries(replacements)) {`
- ⚠️ **Line 306** (Generic Placeholders): `finalEndpoint = finalEndpoint.replace(placeholder, value);`
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

### 📁 `server/test/e2e-launcher.cjs`

- 🔸 **Line 68** (Example Domains): `await this.healthCheck('http://localhost:5000/health');`
- 🔸 **Line 84** (Example Domains): `url: 'http://localhost:5000',`
- 🔸 **Line 139** (Example Domains): `url: 'http://localhost:3000',`
- 🔸 **Line 247** (Example Domains): `CYPRESS_baseUrl: 'http://localhost:3000',`
- 🔸 **Line 248** (Example Domains): `CYPRESS_apiUrl: 'http://localhost:5000'`

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

### 📁 `test-new-schema.cjs`

- ⚠️ **Line 145** (Generic Placeholders): `'https://via.placeholder.com/300x200',`
- ⚠️ **Line 182** (Generic Placeholders): `const sample = result.rows[0];`
- ⚠️ **Line 183** (Generic Placeholders): `console.log('   📄 Sample result:', {`
- ⚠️ **Line 184** (Generic Placeholders): `title: sample.title,`
- ⚠️ **Line 185** (Generic Placeholders): `image: sample.image ? 'present' : 'null',`
- ⚠️ **Line 186** (Generic Placeholders): `sale_price: sample.sale_price,`
- ⚠️ **Line 187** (Generic Placeholders): `discount: sample.discount,`
- ⚠️ **Line 188** (Generic Placeholders): `rating: sample.rating,`
- ⚠️ **Line 189** (Generic Placeholders): `featured: sample.featured,`
- ⚠️ **Line 190** (Generic Placeholders): `savings_amount: sample.savings_amount`

### 📁 `tests/placeholder-audit.test.js`

- ⚠️ **Line 3** (Generic Placeholders): `* M3.9 Enhanced Placeholder Audit - Test Suite`
- ⚠️ **Line 4** (Generic Placeholders): `* Comprehensive testing for placeholder detection and auto-fix functionality`
- ⚠️ **Line 10** (Generic Placeholders): `const PlaceholderAuditor = require('../tools/placeholder-audit');`
- ⚠️ **Line 26** (Generic Placeholders): `console.log('🧪 M3.9 Placeholder Audit Test Suite');`
- ⚠️ **Line 72** (Generic Placeholders): `* Test basic placeholder detection`
- ⚠️ **Line 75** (Generic Placeholders): `this.log('🔍 Testing basic placeholder detection...');`
- ⚠️ **Line 77** (Generic Placeholders): `// Test 1: JavaScript placeholder detection`
- ⚠️ **Line 78** (Generic Placeholders): `await this.runTest('JS Placeholder Detection', async () => {`
- ⚠️ **Line 82** (Generic Placeholders): `apiKey: "your-api-key-here",`
- 🚨 **Line 84** (Analytics Placeholders): `gaId: "G-XXXXXXXXXX"`
- ⚠️ **Line 97** (Generic Placeholders): `API_KEY_HERE=your-api-key-here`
- 🚨 **Line 113** (Analytics Placeholders): `analyticsId: "G-TEST123456",`
- 🚨 **Line 114** (GTM Placeholders): `tagManagerId: "GTM-XXXXXXX"`
- ⚠️ **Line 117** (Generic Placeholders): `key: "placeholder-key",`
- ⚠️ **Line 118** (Generic Placeholders): `secret: "change-me"`
- 🔸 **Line 131** (Example Domains): `const domain = "localhost"; // This should only be reported as 'Generic Placeholders' (high), not 'Example Domains' (medium)`
- ⚠️ **Line 155** (Generic Placeholders): `API_KEY_HERE=placeholder`
- 💡 **Line 175** (Test/Dev Patterns): `API_KEY_HERE=test-key`
- ⚠️ **Line 176** (Database Placeholders): `DATABASE_URL=postgres://user:pass@localhost:5432/test`
- ⚠️ **Line 197** (Generic Placeholders): `API_KEY_HERE=your-api-key-here`
- 🚨 **Line 199** (Analytics Placeholders): `GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
- 🔸 **Line 210** (Example Domains): `'DATABASE_URL': 'postgres://user:pass@localhost:5432/fixed_db',`
- ⚠️ **Line 218** (Generic Placeholders): `!fixedContent.includes('your-api-key-here');`
- ⚠️ **Line 226** (Generic Placeholders): `api: "your-api-key-here",`
- 🚨 **Line 227** (Analytics Placeholders): `tracking: "G-XXXXXXXXXX"`
- 🔸 **Line 234** (Example Domains): `'example.com': 'fixed-domain.com',`
- 🔸 **Line 242** (Example Domains): `!fixedContent.includes('example.com');`
- ⚠️ **Line 259** (Generic Placeholders): `apiKey: "your-api-key-here",`
- ⚠️ **Line 290** (Generic Placeholders): `const content = 'const placeholder = "your-api-key-here";\n'.repeat(100);`
- ⚠️ **Line 322** (Generic Placeholders): `execSync(`cd ${process.cwd()} && node tools/placeholder-audit.js --report ${this.testDir}/test-report.md`,`
- ⚠️ **Line 336** (Generic Placeholders): `fs.writeFileSync(testFile, 'API_KEY_HERE=placeholder\n');`
- ⚠️ **Line 339** (Generic Placeholders): `execSync(`cd ${process.cwd()} && node tools/placeholder-audit.js --report ${reportPath}`,`
- ⚠️ **Line 346** (Generic Placeholders): `fs.readFileSync(reportPath, 'utf8').includes('M3.9 Enhanced Placeholder Audit Report');`
- 🚨 **Line 360** (Hardcoded Credentials): `PASSWORD=123456`
- ⚠️ **Line 361** (Generic Placeholders): `API_KEY_HERE=placeholder`
- 🔸 **Line 362** (Example Domains): `DOMAIN=example.com`
- ⚠️ **Line 449** (Generic Placeholders): `console.log('🧪 M3.9 PLACEHOLDER AUDIT TEST RESULTS');`
- ⚠️ **Line 486** (Generic Placeholders): `console.log('🎉 All tests passed! M3.9 Placeholder Audit is working correctly.');`

### 📁 `tools/collect-secrets.js`

- 🚨 **Line 24** (Analytics Placeholders): `const PLACEHOLDER = /(example\.com|YOUR_[A-Z0-9_]+_HERE|G-XXXX|GTM-XXXX|change[_ -]?me|replace[_ -]?me|dummy|sample|test|xxxx|yyyy|zzz)/i;`
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
- ⚠️ **Line 26** (Generic Placeholders): `const reportPath = args.includes('--report') ? args[args.indexOf('--report') + 1] : 'PLACEHOLDER-AUDIT.md';`
- ⚠️ **Line 64** (Generic Placeholders): `// Enhanced placeholder detection patterns`
- ⚠️ **Line 69** (Generic Placeholders): `pattern: /\b(placeholder|change[_-]?me|replace[_-]?me|to[_-]?be[_-]?filled|your-api-key-here|dummy|sample|tbd|todo|fixme|hack)\b/i,`
- ⚠️ **Line 91** (Generic Placeholders): `pattern: /(API_KEY|SECRET|TOKEN|PRIVATE_KEY|ACCESS_KEY|WEBHOOK_SIGNATURE_SECRET)\s*[=:]\s*(change.*|replace.*|test.*|dummy.*|sample.*|placeholder.*|your.*|xxx.*|yyy.*)/i,`
- 🔸 **Line 103** (Example Domains): `pattern: /(EMAIL_FROM|FROM_EMAIL|SMTP_USER)\s*[=:]\s*(no-reply@example\.com|test@.*|example@.*|admin@localhost)/i,`
- 🚨 **Line 143** (Analytics Placeholders): `message: 'GA4_MEASUREMENT_ID phải dạng G-[A-Z0-9]{8,} (ví dụ: G-XXXXXXXXXX)',`
- 🚨 **Line 150** (GTM Placeholders): `message: 'GTM_CONTAINER_ID phải dạng GTM-[A-Z0-9]{6,} (ví dụ: GTM-XXXXXXX)',`
- ⚠️ **Line 231** (Generic Placeholders): `this.log('🔍 Starting M3.9 Enhanced Placeholder Sweep...');`
- ⚠️ **Line 427** (Generic Placeholders): `// Scan for placeholder patterns`
- ⚠️ **Line 501** (Generic Placeholders): `// Check for placeholder values with enhanced patterns`
- ⚠️ **Line 503** (Generic Placeholders): `/^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i,`
- ⚠️ **Line 517** (Generic Placeholders): `message: `${validator.key} contains placeholder or missing real value in ${filePath}`,`
- ⚠️ **Line 518** (Generic Placeholders): `type: 'placeholder',`
- ⚠️ **Line 676** (Generic Placeholders): `// Check for placeholder patterns and suggest replacements`
- ⚠️ **Line 680** (Generic Placeholders): `/(placeholder|change.*|replace.*|your.*|example.*)/i`
- ⚠️ **Line 731** (Generic Placeholders): `// Common placeholder patterns`
- 🔸 **Line 738** (Example Domains): `replacement: (match) => fixMap['example.com'] ? `"${fixMap['example.com']}"` : match`
- 🔸 **Line 741** (Example Domains): `pattern: /"localhost:3000"/gi,`
- 🔸 **Line 742** (Example Domains): `replacement: (match) => fixMap['localhost:3000'] ? `"${fixMap['localhost:3000']}"` : match`
- 🚨 **Line 745** (Analytics Placeholders): `pattern: /G-XXXXXXXXXX/gi,`
- 🚨 **Line 749** (GTM Placeholders): `pattern: /GTM-XXXXXXX/gi,`
- ⚠️ **Line 797** (Generic Placeholders): `lines.push('# 🔍 M3.9 Enhanced Placeholder Audit Report');`
- ⚠️ **Line 852** (Generic Placeholders): `// Placeholder findings`
- ⚠️ **Line 854** (Generic Placeholders): `lines.push('## 🔍 Placeholder Findings');`
- ⚠️ **Line 890** (Generic Placeholders): `lines.push('2. **🔄 Replace Placeholders**: Update all placeholder values with production-ready configurations');`
- ⚠️ **Line 901** (Generic Placeholders): `lines.push('- Add pre-commit hooks to prevent placeholder commits');`
- ⚠️ **Line 909** (Generic Placeholders): `lines.push('*Generated by M3.9 Enhanced Placeholder Sweep - Enterprise Grade Security Audit*');`
- ⚠️ **Line 955** (Generic Placeholders): `console.log('📊 M3.9 PLACEHOLDER AUDIT RESULTS');`
- ⚠️ **Line 1073** (Generic Placeholders): `// Scan for placeholder patterns`
- ⚠️ **Line 1108** (Generic Placeholders): `return value && /^(placeholder|change.*|replace.*|test.*|dummy.*|sample.*|example.*|your.*|xxx.*|yyy.*)$/i.test(value);`
- ⚠️ **Line 1113** (Generic Placeholders): `message: `${v.key} contains placeholder value in ${filePath}`,`
- ⚠️ **Line 1114** (Generic Placeholders): `type: 'placeholder'`

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