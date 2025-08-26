#!/bin/bash
# 📋 DealRadarUS - Terms of Service Existence Check
# Validates Terms of Service page exists and is properly linked

echo "📋 DEALRADARUS - Terms of Service Check"
echo "======================================="

EXIT_CODE=0

# Check if Terms of Service page exists
echo "🔍 Checking for Terms of Service page..."

if [ -f "pages/terms-of-service.html" ]; then
    echo "✅ Terms of Service page found: pages/terms-of-service.html"
    
    # Check if it contains required email
    if grep -q "deals@dealradarus.com" "pages/terms-of-service.html"; then
        echo "✅ ToS contains required email address"
    else
        echo "❌ ToS missing required email address (deals@dealradarus.com)"
        EXIT_CODE=1
    fi
    
    # Check page structure
    if grep -q "<h1" "pages/terms-of-service.html"; then
        echo "✅ ToS has proper heading structure"
    else
        echo "❌ ToS missing main heading"
        EXIT_CODE=1
    fi
    
    # Check for last updated date
    if grep -q -i "last updated\|updated:" "pages/terms-of-service.html"; then
        echo "✅ ToS contains last updated information"
    else
        echo "⚠️  ToS missing last updated date"
    fi
    
else
    echo "❌ Terms of Service page not found"
    EXIT_CODE=1
fi

# Check footer links in main pages
echo ""
echo "🔗 Checking footer links to Terms of Service..."

PAGES_TO_CHECK=("index.html" "pages/contact.html" "deals.html" "blog.html")
LINKED_PAGES=0

for page in "${PAGES_TO_CHECK[@]}"; do
    if [ -f "$page" ]; then
        if grep -q -E "(terms-of-service|Terms of Service)" "$page"; then
            echo "✅ $page contains ToS link"
            LINKED_PAGES=$((LINKED_PAGES + 1))
        else
            echo "❌ $page missing ToS link"
            EXIT_CODE=1
        fi
    else
        echo "⚠️  $page not found (skipping)"
    fi
done

# Check sitemap inclusion
echo ""
echo "🗺️  Checking sitemap inclusion..."

if [ -f "sitemap.xml" ]; then
    if grep -q "terms-of-service" "sitemap.xml"; then
        echo "✅ ToS included in sitemap.xml"
    else
        echo "❌ ToS not found in sitemap.xml"
        EXIT_CODE=1
    fi
else
    echo "❌ sitemap.xml not found"
    EXIT_CODE=1
fi

# Check robots.txt doesn't block ToS
echo ""
echo "🤖 Checking robots.txt..."

if [ -f "robots.txt" ]; then
    if grep -q "Disallow.*terms" "robots.txt"; then
        echo "❌ robots.txt blocks Terms of Service"
        EXIT_CODE=1
    else
        echo "✅ robots.txt allows Terms of Service"
    fi
else
    echo "⚠️  robots.txt not found"
fi

# Summary
echo ""
echo "======================================="
echo "📊 TERMS OF SERVICE SUMMARY"
echo "======================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All Terms of Service checks passed"
    echo "📄 ToS page exists and is properly integrated"
    echo "🔗 Footer links verified: $LINKED_PAGES pages"
    echo "🗺️  Sitemap inclusion confirmed"
else
    echo "❌ Terms of Service checks failed"
    echo "🚨 Issues found that need to be addressed"
fi

exit $EXIT_CODE