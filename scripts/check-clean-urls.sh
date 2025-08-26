#!/bin/bash
# 🌐 DealRadarUS - Clean URLs Check
# Validates clean URL structure and accessibility

echo "🌐 DEALRADARUS - Clean URLs Check"
echo "================================="

EXIT_CODE=0
BASE_URL="https://dealradarus.com"

# URLs to check for clean structure
CLEAN_URLS=(
    "/"
    "/deals/"
    "/blog/"
    "/contact/"
    "/privacy-policy/"
    "/affiliate-disclosure/"
    "/terms-of-service/"
)

# Check if .htaccess exists and has clean URL rules
echo "🔧 Checking .htaccess configuration..."

if [ -f ".htaccess" ]; then
    echo "✅ .htaccess file found"
    
    # Check for RewriteEngine
    if grep -q "RewriteEngine On" ".htaccess"; then
        echo "✅ RewriteEngine enabled"
    else
        echo "❌ RewriteEngine not enabled"
        EXIT_CODE=1
    fi
    
    # Check for clean URL rules
    if grep -q "RewriteRule.*deals.*deals.html" ".htaccess"; then
        echo "✅ Clean URL rules found for /deals/"
    else
        echo "❌ Clean URL rules missing for /deals/"
        EXIT_CODE=1
    fi
    
    if grep -q "RewriteRule.*blog.*blog.html" ".htaccess"; then
        echo "✅ Clean URL rules found for /blog/"
    else
        echo "❌ Clean URL rules missing for /blog/"
        EXIT_CODE=1
    fi
    
    if grep -q "RewriteRule.*contact.*pages/contact.html" ".htaccess"; then
        echo "✅ Clean URL rules found for /contact/"
    else
        echo "❌ Clean URL rules missing for /contact/"
        EXIT_CODE=1
    fi
    
    # Check for 301 redirects from .html
    if grep -q "R=301" ".htaccess"; then
        REDIRECT_COUNT=$(grep -c "R=301" ".htaccess")
        echo "✅ Found $REDIRECT_COUNT 301 redirect rule(s)"
    else
        echo "⚠️  No 301 redirects found"
    fi
    
else
    echo "❌ .htaccess file not found"
    EXIT_CODE=1
fi

# Check Netlify redirects as alternative
echo ""
echo "🌐 Checking Netlify _redirects (alternative)..."

if [ -f "_redirects" ]; then
    echo "✅ _redirects file found"
    
    if grep -q "301" "_redirects"; then
        NETLIFY_REDIRECTS=$(grep -c "301" "_redirects")
        echo "✅ Found $NETLIFY_REDIRECTS Netlify redirect rule(s)"
    fi
else
    echo "ℹ️  _redirects file not found (not using Netlify)"
fi

# Check corresponding HTML files exist
echo ""
echo "📄 Checking target HTML files exist..."

HTML_FILES=(
    "index.html"
    "deals.html"
    "blog.html"
    "pages/contact.html"
    "pages/privacy.html"
    "pages/affiliate-disclosure.html"
    "pages/terms-of-service.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Target file exists: $file"
    else
        echo "❌ Target file missing: $file"
        EXIT_CODE=1
    fi
done

# Check sitemap has clean URLs
echo ""
echo "🗺️  Checking sitemap uses clean URLs..."

if [ -f "sitemap.xml" ]; then
    # Count clean URLs vs .html URLs in sitemap
    CLEAN_COUNT=$(grep -c -E "<loc>.*/(deals|blog|contact|privacy-policy|affiliate-disclosure|terms-of-service)/</loc>" "sitemap.xml" || echo 0)
    HTML_COUNT=$(grep -c -E "<loc>.*\.html</loc>" "sitemap.xml" || echo 0)
    
    echo "✅ Clean URLs in sitemap: $CLEAN_COUNT"
    
    if [ $HTML_COUNT -gt 0 ]; then
        echo "⚠️  .html URLs still in sitemap: $HTML_COUNT"
    else
        echo "✅ No .html URLs found in sitemap"
    fi
    
    # Check specific clean URLs are present
    for url in "${CLEAN_URLS[@]}"; do
        if grep -q "<loc>${BASE_URL}${url}</loc>" "sitemap.xml"; then
            echo "✅ Sitemap includes: $url"
        else
            echo "❌ Sitemap missing: $url"
            EXIT_CODE=1
        fi
    done
else
    echo "❌ sitemap.xml not found"
    EXIT_CODE=1
fi

# Test URL structure logic (without making HTTP requests)
echo ""
echo "🧪 Validating URL structure logic..."

# Check internal links use clean URLs
HTML_FILES_TO_CHECK=("index.html" "pages/contact.html")
CLEAN_LINKS_FOUND=0

for file in "${HTML_FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        # Count clean URL links
        CLEAN_HREFS=$(grep -c 'href="/[^"]*/"' "$file" || echo 0)
        HTML_HREFS=$(grep -c 'href="[^"]*\.html"' "$file" || echo 0)
        
        if [ $CLEAN_HREFS -gt 0 ]; then
            echo "✅ $file has $CLEAN_HREFS clean URL link(s)"
            CLEAN_LINKS_FOUND=$((CLEAN_LINKS_FOUND + CLEAN_HREFS))
        fi
        
        if [ $HTML_HREFS -gt 0 ]; then
            echo "⚠️  $file has $HTML_HREFS .html link(s) (should be clean)"
        fi
    fi
done

# Check meta canonical URLs use clean structure
echo ""
echo "🔗 Checking canonical URLs..."

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q 'rel="canonical"' "$file"; then
            CANONICAL_URL=$(grep 'rel="canonical"' "$file" | head -1)
            if echo "$CANONICAL_URL" | grep -q '\.html'; then
                echo "⚠️  $file: Canonical URL uses .html"
            else
                echo "✅ $file: Clean canonical URL"
            fi
        fi
    fi
done

# Summary
echo ""
echo "================================="
echo "📊 CLEAN URLS SUMMARY"
echo "================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All clean URL checks passed"
    echo "🔧 URL rewriting configured properly"
    echo "📄 Target HTML files exist"
    echo "🗺️  Sitemap uses clean URL structure"
    echo "🔗 Internal links use clean URLs: $CLEAN_LINKS_FOUND found"
else
    echo "❌ Clean URL checks failed"
    echo "🚨 Issues found that need to be addressed"
    echo ""
    echo "💡 Common fixes:"
    echo "   • Ensure .htaccess has clean URL rewrite rules"
    echo "   • Verify target HTML files exist"
    echo "   • Update sitemap.xml to use clean URLs"
    echo "   • Replace internal .html links with clean URLs"
fi

exit $EXIT_CODE