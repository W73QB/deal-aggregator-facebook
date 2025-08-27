#!/bin/bash
# GSC Post-Verification Setup & Monitoring
# Run this after GSC verification is complete

echo "🚀 GSC Post-Verification Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dealradarus.com"
BASE_URL="https://$DOMAIN"
LOG_FILE="./data/gsc-setup.log"

# Ensure data directory exists
mkdir -p ./data

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Step 1: Verify GSC Setup Prerequisites
echo -e "${BLUE}Step 1: Verifying Prerequisites${NC}"
echo "=================================="

# Check required files
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 found${NC}"
        log "✅ File check passed: $1"
        return 0
    else
        echo -e "${RED}❌ $1 missing${NC}"
        log "❌ File check failed: $1"
        return 1
    fi
}

prerequisites_ok=true

check_file "sitemap.xml" || prerequisites_ok=false
check_file "robots.txt" || prerequisites_ok=false
check_file "index.html" || prerequisites_ok=false

echo ""

if [ "$prerequisites_ok" != true ]; then
    echo -e "${RED}❌ Prerequisites check failed. Fix missing files before continuing.${NC}"
    log "❌ Prerequisites check failed"
    exit 1
fi

# Step 2: Test Live URLs
echo -e "${BLUE}Step 2: Testing Live URLs${NC}"
echo "=========================="

test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" | grep -q "^[23]"; then
        echo -e "${GREEN}✅ OK${NC}"
        log "✅ URL test passed: $url"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        log "❌ URL test failed: $url"
        return 1
    fi
}

# Test critical URLs
test_url "$BASE_URL/" "Homepage"
test_url "$BASE_URL/sitemap.xml" "Sitemap"
test_url "$BASE_URL/robots.txt" "Robots.txt"
test_url "$BASE_URL/deals/" "Deals page"
test_url "$BASE_URL/blog/" "Blog page"
test_url "$BASE_URL/contact/" "Contact page"

echo ""

# Step 3: Sitemap Validation
echo -e "${BLUE}Step 3: Sitemap Content Validation${NC}"
echo "==================================="

sitemap_content=$(curl -s "$BASE_URL/sitemap.xml" 2>/dev/null)
if [ $? -eq 0 ]; then
    url_count=$(echo "$sitemap_content" | grep -c "<url>" || echo "0")
    
    if [ "$url_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Sitemap valid with $url_count URLs${NC}"
        log "✅ Sitemap validation passed: $url_count URLs"
    else
        echo -e "${YELLOW}⚠️  Sitemap accessible but may be empty${NC}"
        log "⚠️  Sitemap validation warning: empty or invalid"
    fi
else
    echo -e "${RED}❌ Cannot fetch sitemap content${NC}"
    log "❌ Sitemap content fetch failed"
fi

echo ""

# Step 4: Generate GSC Submission URLs
echo -e "${BLUE}Step 4: Generating GSC Submission URLs${NC}"
echo "======================================"

cat > ./data/gsc-submission-urls.txt << 'EOF'
# GSC URL Submission List for DealRadarUS
# Copy these URLs to GSC URL Inspection tool

# Priority Pages (Submit First)
https://dealradarus.com/
https://dealradarus.com/deals/
https://dealradarus.com/blog/

# Secondary Pages
https://dealradarus.com/contact/
https://dealradarus.com/affiliate-disclosure/
https://dealradarus.com/privacy-policy/
https://dealradarus.com/terms-of-service/

# Category Pages
https://dealradarus.com/deals/refurbished/
https://dealradarus.com/deals/smart-home/
https://dealradarus.com/deals/open-box/
https://dealradarus.com/deals/trending/
EOF

echo -e "${GREEN}✅ GSC submission URLs generated: ./data/gsc-submission-urls.txt${NC}"
log "✅ GSC submission URLs generated"

# Step 5: Create Monitoring Schedule
echo -e "${BLUE}Step 5: Setting up Monitoring Schedule${NC}"
echo "====================================="

cat > ./data/gsc-monitoring-schedule.md << 'EOF'
# GSC Monitoring Schedule for DealRadarUS

## Week 1 (Daily Checks)
- [ ] Day 1: Verify property appears in GSC dashboard
- [ ] Day 2: Check sitemap submission status
- [ ] Day 3: Monitor initial crawling activity  
- [ ] Day 4: Check for crawl errors
- [ ] Day 5: Verify key pages discovered
- [ ] Day 6: Review search analytics (if available)
- [ ] Day 7: Check Core Web Vitals status

## Week 2-4 (Every 2-3 days)
- [ ] Monitor indexing progress
- [ ] Check search performance data
- [ ] Review any new crawl errors
- [ ] Track Core Web Vitals improvements
- [ ] Monitor sitemap processing status

## Monthly (Ongoing)
- [ ] Review search analytics trends
- [ ] Check Core Web Vitals performance
- [ ] Update sitemap if site structure changes
- [ ] Review and fix any crawl errors
- [ ] Analyze top search queries
- [ ] Check mobile usability issues

## Automated Monitoring
Run these commands weekly:
```bash
# GSC health check
node scripts/gsc-monitoring.js

# Site performance check  
./scripts/gsc-post-verification.sh

# Link verification
node scripts/deal-link-checker.js
```
EOF

echo -e "${GREEN}✅ Monitoring schedule created: ./data/gsc-monitoring-schedule.md${NC}"
log "✅ Monitoring schedule created"

# Step 6: Run Technical Health Check
echo -e "${BLUE}Step 6: Running Technical Health Check${NC}"
echo "====================================="

if [ -f "./scripts/gsc-monitoring.js" ]; then
    echo "Running detailed technical checks..."
    node scripts/gsc-monitoring.js
else
    echo -e "${YELLOW}⚠️  gsc-monitoring.js not found, skipping detailed checks${NC}"
fi

# Step 7: Generate Completion Report
echo ""
echo -e "${BLUE}Step 7: Generating Completion Report${NC}"
echo "===================================="

cat > ./data/gsc-post-verification-report.md << EOF
# GSC Post-Verification Report
**Generated**: $(date)
**Domain**: $DOMAIN
**Status**: Setup Complete

## ✅ Completed Actions
1. Prerequisites validated
2. Live URL testing complete
3. Sitemap content validated
4. GSC submission URLs prepared
5. Monitoring schedule established
6. Technical health check executed

## 📋 Next Manual Steps
1. **GSC Dashboard**: Visit https://search.google.com/search-console
2. **Add Property**: Add https://$DOMAIN if not already done
3. **Submit Sitemap**: Add sitemap.xml in Sitemaps section
4. **URL Inspection**: Submit priority URLs from ./data/gsc-submission-urls.txt
5. **Enable Alerts**: Set up email notifications for critical issues

## 🔍 Monitoring Commands
\`\`\`bash
# Weekly health check
./scripts/gsc-post-verification.sh

# Detailed monitoring  
node scripts/gsc-monitoring.js

# Link verification
node scripts/deal-link-checker.js
\`\`\`

## 📊 Expected Timeline
- **Verification**: Complete ✅
- **Sitemap Processing**: 1-3 days
- **Initial Indexing**: 1-2 weeks  
- **Full Analytics**: 2-4 weeks

## 📁 Generated Files
- ./data/gsc-submission-urls.txt - URLs for manual submission
- ./data/gsc-monitoring-schedule.md - Monitoring checklist
- ./data/gsc-setup.log - Setup activity log
EOF

echo -e "${GREEN}✅ Post-verification report: ./data/gsc-post-verification-report.md${NC}"
log "✅ Post-verification report generated"

echo ""
echo -e "${GREEN}🎉 GSC Post-Verification Setup Complete!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📋 Manual Actions Required:${NC}"
echo "1. Submit sitemap.xml in GSC"
echo "2. Use URL Inspection tool for priority pages" 
echo "3. Set up email alerts in GSC"
echo "4. Monitor for 1-2 weeks for initial indexing"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC} Run this script weekly to verify ongoing health"
echo -e "${BLUE}📁 Files:${NC} Check ./data/ directory for generated resources"

log "✅ GSC post-verification setup completed successfully"