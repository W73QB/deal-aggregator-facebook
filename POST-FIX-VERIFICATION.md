# POST-FIX-VERIFICATION.md
**DealRadarUS Post-Implementation Verification Checklist**  
**Date**: 2025-08-26  
**Status**: CHECKLIST ONLY - TO BE EXECUTED AFTER FIX APPROVAL

> ⚠️ **IMPORTANT**: These commands should be run **AFTER** implementing chosen remediation option. **DO NOT execute these commands now**.

## PHASE 1: URL STRUCTURE VERIFICATION

### 1.1 Clean URLs Must Return 200
```bash
# EXECUTE AFTER FIX:
echo "Testing clean URLs..."
curl -I https://dealradarus.com/ | grep "200"
curl -I https://dealradarus.com/deals/ | grep "200"  
curl -I https://dealradarus.com/blog/ | grep "200"
curl -I https://dealradarus.com/contact/ | grep "200"
curl -I https://dealradarus.com/affiliate-disclosure/ | grep "200"
curl -I https://dealradarus.com/privacy-policy/ | grep "200"
curl -I https://dealradarus.com/terms-of-service/ | grep "200"

# Category pages
curl -I https://dealradarus.com/deals/refurbished/ | grep "200"
curl -I https://dealradarus.com/deals/smart-home/ | grep "200"
curl -I https://dealradarus.com/deals/open-box/ | grep "200"
curl -I https://dealradarus.com/deals/trending/ | grep "200"
```

### 1.2 .html Files Must Redirect (301 or 308)
```bash
# EXECUTE AFTER FIX:
echo "Testing .html redirects..."
curl -I https://dealradarus.com/deals.html | grep -E "(301|308)"
curl -I https://dealradarus.com/blog.html | grep -E "(301|308)"
curl -I https://dealradarus.com/pages/contact.html | grep -E "(301|308)"
curl -I https://dealradarus.com/pages/affiliate-disclosure.html | grep -E "(301|308)"
curl -I https://dealradarus.com/pages/privacy.html | grep -E "(301|308)"
curl -I https://dealradarus.com/pages/terms-of-service.html | grep -E "(301|308)"
```

### 1.3 Verify Redirect Destinations
```bash
# EXECUTE AFTER FIX:
echo "Checking redirect targets..."
curl -I https://dealradarus.com/deals.html | grep "Location:" | grep "/deals/"
curl -I https://dealradarus.com/pages/contact.html | grep "Location:" | grep "/contact/"
# Should show proper clean URL destinations
```

## PHASE 2: CONTENT VALIDATION

### 2.1 Placeholder Links Must Be Zero
```bash
# EXECUTE AFTER FIX - MUST RETURN 0:
echo "Counting example.com occurrences..."
curl -s https://dealradarus.com/ | grep -c "example.com"
# Expected result: 0

# If not zero, list them:
curl -s https://dealradarus.com/ | grep "example.com"
```

### 2.2 Email Consistency Check
```bash
# EXECUTE AFTER FIX:
echo "Verifying email consistency..."
curl -s https://dealradarus.com/ | grep -c "deals@dealradarus.com"
# Expected: 1 or more

# Check for old email patterns (should return nothing):
curl -s https://dealradarus.com/ | grep -E "support@|contact@|info@|admin@|hello@"
# Expected: no output
```

## PHASE 3: SEO & SITEMAP VALIDATION

### 3.1 Sitemap URLs Must Return 200
```bash
# EXECUTE AFTER FIX:
echo "Validating sitemap URLs..."
curl -s https://dealradarus.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | while read url; do
    echo -n "Testing $url: "
    curl -o /dev/null -s -w "%{http_code}\n" "$url"
done
# All should return 200
```

### 3.2 Robots.txt Accessibility
```bash
# EXECUTE AFTER FIX:
echo "Testing robots.txt..."
curl -I https://dealradarus.com/robots.txt | grep "200"
curl -s https://dealradarus.com/robots.txt | grep "Sitemap:"
# Should show sitemap declaration
```

### 3.3 No Duplicate URLs in Sitemap
```bash
# EXECUTE AFTER FIX:
echo "Checking for sitemap duplicates..."
curl -s https://dealradarus.com/sitemap.xml | grep "<loc>" | sort | uniq -d
# Expected: no output (no duplicates)
```

## PHASE 4: ANALYTICS & TRACKING

### 4.1 GA4 Single Load Check
```bash
# EXECUTE AFTER FIX (requires browser dev tools):
# 1. Open https://dealradarus.com/ in Chrome
# 2. Open DevTools → Network tab
# 3. Filter by "gtag" or "googletagmanager" 
# 4. Reload page
# 5. Verify only ONE gtag request (no duplicates)
```

### 4.2 Meta Pixel Load Check  
```bash
# EXECUTE AFTER FIX (requires browser dev tools):
# 1. Open https://dealradarus.com/ in Chrome
# 2. Open DevTools → Network tab
# 3. Filter by "facebook" or "fbevents"
# 4. Reload page  
# 5. Verify Meta Pixel loads correctly
```

### 4.3 Event Tracking Test
```bash
# EXECUTE AFTER FIX (manual browser test):
# 1. Click on deals@dealradarus.com email link
# 2. Check DevTools → Network → XHR 
# 3. Should see GA4 event: email_click
# 4. Fill out contact form (if working)
# 5. Should see GA4 event: form_submit
```

## PHASE 5: PERFORMANCE VALIDATION

### 5.1 Lighthouse Scores (if lighthouse CLI available)
```bash
# EXECUTE AFTER FIX (if lighthouse installed):
lighthouse https://dealradarus.com/ --only-categories=performance,seo,accessibility --chrome-flags="--headless" --output=json | jq '.categories | to_entries[] | {category: .key, score: (.value.score * 100)}'

# Target scores:
# Performance: >90
# SEO: >90  
# Accessibility: >85
```

### 5.2 Core Web Vitals Check
```bash
# EXECUTE AFTER FIX (manual browser test):
# 1. Open Chrome DevTools
# 2. Go to Lighthouse tab
# 3. Run performance audit on:
#    - https://dealradarus.com/ (homepage)
#    - https://dealradarus.com/deals/ (deals page)  
#    - https://dealradarus.com/contact/ (contact page)

# Target metrics:
# LCP (Largest Contentful Paint): ≤ 2.5s
# CLS (Cumulative Layout Shift): ≤ 0.1  
# INP (Interaction to Next Paint): ≤ 200ms
```

## PHASE 6: ERROR HANDLING

### 6.1 404 Page Functionality
```bash
# EXECUTE AFTER FIX:
echo "Testing 404 handling..."
curl -s https://dealradarus.com/nonexistent-page | grep -i "404\|not found"
curl -I https://dealradarus.com/nonexistent-page | grep "404"
# Should serve proper 404 page with correct status
```

### 6.2 500 Error Handling (if applicable)
```bash
# EXECUTE AFTER FIX (server-dependent):
# Test depends on hosting platform
# For Vercel: errors typically return 404 or redirect
# For Apache: may have custom 500 page
```

## PHASE 7: SECURITY HEADERS

### 7.1 Security Headers Present
```bash
# EXECUTE AFTER FIX:
echo "Checking security headers..."
curl -I https://dealradarus.com/ | grep -i "strict-transport-security"
curl -I https://dealradarus.com/ | grep -i "x-content-type-options"
curl -I https://dealradarus.com/ | grep -i "x-frame-options"
curl -I https://dealradarus.com/ | grep -i "referrer-policy"
# All should be present
```

### 7.2 HTTPS Enforcement
```bash
# EXECUTE AFTER FIX:
echo "Testing HTTPS enforcement..."
curl -I http://dealradarus.com/ | grep -E "(301|302|308)" 
curl -I http://dealradarus.com/ | grep -i "location:" | grep "https://"
# Should redirect HTTP → HTTPS
```

## PHASE 8: ACCESSIBILITY VALIDATION

### 8.1 Basic A11y Checks (manual)
```bash
# EXECUTE AFTER FIX (manual browser test):
# 1. Navigate with Tab key through all interactive elements
# 2. Check focus visible on all focusable elements
# 3. Verify all images have alt attributes
# 4. Check heading structure (H1 → H2 → H3 logical order)
# 5. Test with screen reader (if available)
```

### 8.2 Color Contrast (manual)
```bash
# EXECUTE AFTER FIX (manual/tool):
# Use browser extension like "WAVE" or "axe DevTools"
# Check color contrast ratios meet WCAG AA standards
# Minimum: 4.5:1 for normal text, 3:1 for large text
```

## CHECKLIST SUMMARY

### ✅ MUST PASS (Critical)
- [ ] All clean URLs return 200 status  
- [ ] All .html files redirect properly (301/308)
- [ ] Zero "example.com" occurrences on homepage
- [ ] All sitemap URLs return 200 status
- [ ] No duplicate URLs in sitemap
- [ ] GA4 loads once (no duplicates)
- [ ] Security headers present
- [ ] HTTPS enforced

### ✅ SHOULD PASS (Important)  
- [ ] Lighthouse Performance >90
- [ ] LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- [ ] Email consistency maintained
- [ ] 404/500 pages work correctly
- [ ] Basic accessibility compliance

### ✅ NICE TO HAVE (Optional)
- [ ] Meta Pixel loads correctly  
- [ ] Event tracking functional
- [ ] All A11y tests pass
- [ ] Color contrast WCAG AA compliant

## EXECUTION TIMELINE

### Immediate (0-15 minutes after deployment):
- URL structure tests
- Placeholder link validation  
- Sitemap verification

### Short-term (15-60 minutes after deployment):
- Performance testing
- Analytics validation
- Security checks

### Medium-term (1-24 hours after deployment):
- SEO crawl test
- User experience validation
- Error handling verification

---

**IMPORTANT**: 
1. Run these checks in **production environment only**
2. **Document any failures** for immediate resolution
3. **Notify stakeholders** of verification results  
4. **Schedule follow-up** audit in 7 days to confirm stability

**Contact**: deals@dealradarus.com for verification questions