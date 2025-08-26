# 🔍 Google Search Console Setup for DealRadarUS

## Overview
**Domain:** `dealradarus.com`  
**Sitemap:** `https://dealradarus.com/sitemap.xml`  
**Robots.txt:** `https://dealradarus.com/robots.txt`

## Step 1: Domain Verification

### Method 1: HTML File Verification (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" → "URL prefix"
3. Enter: `https://dealradarus.com`
4. Choose "HTML file" verification method
5. Download the verification file (e.g., `google1234567890abcdef.html`)
6. Upload to website root directory
7. Click "Verify"

### Method 2: DNS TXT Record Verification
1. Add DNS TXT record to `dealradarus.com`:
   ```
   TXT record: google-site-verification=YOUR_VERIFICATION_CODE
   ```
2. Wait for DNS propagation (up to 24 hours)
3. Click "Verify" in Search Console

### Method 3: Meta Tag Verification (Backup)
Add this meta tag to all HTML pages `<head>` section:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

## Step 2: Submit Sitemap

1. In Google Search Console, go to "Sitemaps" (left sidebar)
2. Click "Add a new sitemap"
3. Enter: `sitemap.xml`
4. Click "Submit"

**Expected result:** 11 URLs should be discovered and indexed

## Step 3: Submit URL Structure

Submit individual important pages:
```
https://dealradarus.com/
https://dealradarus.com/deals/
https://dealradarus.com/blog/
https://dealradarus.com/contact/
```

1. Go to "URL Inspection" tool
2. Enter each URL
3. Click "Request indexing" for each

## Step 4: Set Up Enhanced Features

### A. Core Web Vitals Monitoring
- Monitor LCP, FID, CLS metrics
- Set up alerts for performance issues
- Track mobile vs desktop performance

### B. Search Performance Tracking  
- Monitor click-through rates (CTR)
- Track keyword rankings
- Analyze search queries driving traffic

### C. Coverage Reports
- Monitor for crawl errors
- Check for blocked resources
- Verify clean URL structure implementation

## Step 5: Additional Configuration

### robots.txt Validation
Verify robots.txt is accessible and formatted correctly:
```
User-agent: *
Allow: /
Sitemap: https://dealradarus.com/sitemap.xml
```

### URL Parameters
Configure URL parameters if using tracking:
- `utm_source`, `utm_medium`, `utm_campaign` → Don't affect indexing
- Category parameters → Let Googlebot decide

### International Targeting
Set geographic target to United States:
1. Go to "Legacy tools and reports" → "International Targeting"
2. Select "United States" as target country

## Step 6: Monitoring & Alerts

Set up email alerts for:
- New crawl errors
- Security issues  
- Manual actions
- Significant traffic drops

## Verification Checklist

- [ ] Property verified in Google Search Console
- [ ] Sitemap submitted and processed (11 URLs)
- [ ] robots.txt accessible and valid
- [ ] Key pages requested for indexing
- [ ] Core Web Vitals monitoring active
- [ ] Geographic targeting set to US
- [ ] Email alerts configured
- [ ] URL structure clean (no .html extensions)

## Expected Timeline

- **Day 1:** Property verification and sitemap submission
- **Day 2-3:** Initial crawling and URL discovery
- **Week 1:** First performance data available
- **Week 2-4:** Full indexing and ranking establishment

## Troubleshooting

### Common Issues:
1. **Verification failed:** Check file permissions, DNS propagation
2. **Sitemap errors:** Validate XML format, check URL accessibility  
3. **Crawl errors:** Review robots.txt, fix broken internal links
4. **Indexing delays:** Submit individual URLs, check for penalties

### Support Resources:
- [Google Search Console Help](https://support.google.com/webmasters)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Search Console API](https://developers.google.com/webmasters/search-console-api-original)

---

## Next Steps After Setup

1. **Monitor Performance:** Weekly GSC reports review
2. **Optimize Based on Data:** Improve CTR for low-performing pages
3. **Submit New Content:** Add new deal pages and blog posts
4. **Technical SEO:** Monitor Core Web Vitals and fix issues
5. **Content Strategy:** Analyze search queries for content ideas

**🎯 Goal:** Achieve full indexing of 11 URLs within 2 weeks and establish baseline performance metrics for ongoing SEO optimization.