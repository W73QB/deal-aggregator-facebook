#!/bin/bash
# Quick Google Search Console Setup for DealRadarUS

echo "🔍 DealRadarUS - Google Search Console Quick Setup"
echo "================================================="

# Step 1: Validate files exist
echo "Step 1: Validating required files..."
[ -f "sitemap.xml" ] && echo "✅ sitemap.xml found" || echo "❌ sitemap.xml missing"
[ -f "robots.txt" ] && echo "✅ robots.txt found" || echo "❌ robots.txt missing"

# Step 2: Show URLs to test
echo ""
echo "Step 2: Test these URLs before GSC submission:"
echo "https://dealradarus.com/"
echo "https://dealradarus.com/sitemap.xml"  
echo "https://dealradarus.com/robots.txt"

# Step 3: GSC submission reminder
echo ""
echo "Step 3: Manual GSC setup required:"
echo "1. Visit: https://search.google.com/search-console"
echo "2. Add property: https://dealradarus.com"
echo "3. Complete verification (HTML file/DNS/Meta tag)"
echo "4. Submit sitemap: sitemap.xml"
echo "5. Request indexing for key pages"

echo ""
echo "✅ Setup files generated. Complete manual GSC setup when ready."