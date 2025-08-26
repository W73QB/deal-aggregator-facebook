#!/bin/bash
# 📋 DealRadarUS - Form Validation CI Check
# Validates HTML forms for required security and validation attributes

echo "📋 DEALRADARUS - Form Validation Check"
echo "======================================"

EXIT_CODE=0
FORMS_FOUND=0
ISSUES_FOUND=0

# Find all HTML files with forms
echo "🔍 Searching for forms in HTML files..."

find . -name "*.html" -not -path "./.git/*" -not -path "./node_modules/*" | while read file; do
    if grep -q "<form" "$file"; then
        FORMS_FOUND=$((FORMS_FOUND + 1))
        echo "📄 Checking: $file"
        
        # Check for forms
        while IFS= read -r line_num; do
            echo "   📋 Form found at line $line_num"
            
            # Get the form element and check for required attributes
            FORM_HTML=$(sed -n "${line_num}p" "$file")
            
            # Check for method attribute
            if ! echo "$FORM_HTML" | grep -q 'method='; then
                echo "   ❌ Missing method attribute"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
            
            # Check for action attribute
            if ! echo "$FORM_HTML" | grep -q 'action='; then
                echo "   ❌ Missing action attribute"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
            
        done < <(grep -n "<form" "$file" | cut -d: -f1)
        
        # Check for required input fields
        if ! grep -q 'required' "$file"; then
            echo "   ⚠️  No required attributes found in form fields"
        else
            REQUIRED_COUNT=$(grep -c 'required' "$file")
            echo "   ✅ Found $REQUIRED_COUNT required field(s)"
        fi
        
        # Check for email type inputs
        if ! grep -q 'type="email"' "$file"; then
            echo "   ⚠️  No email type inputs found"
        else
            EMAIL_COUNT=$(grep -c 'type="email"' "$file")
            echo "   ✅ Found $EMAIL_COUNT email input(s)"
        fi
        
        # Check for honeypot fields
        if grep -q 'website_url\|website-url' "$file"; then
            echo "   ✅ Honeypot field found"
        else
            echo "   ⚠️  No honeypot field detected"
        fi
        
        # Check for validation patterns
        if grep -q 'pattern=' "$file"; then
            PATTERN_COUNT=$(grep -c 'pattern=' "$file")
            echo "   ✅ Found $PATTERN_COUNT validation pattern(s)"
        fi
        
        # Check for minlength/maxlength attributes
        if grep -q -E 'minlength=|maxlength=' "$file"; then
            LENGTH_COUNT=$(grep -c -E 'minlength=|maxlength=' "$file")
            echo "   ✅ Found $LENGTH_COUNT length validation(s)"
        fi
        
        # Check for ARIA labels and error handling
        if grep -q 'aria-describedby=' "$file"; then
            ARIA_COUNT=$(grep -c 'aria-describedby=' "$file")
            echo "   ✅ Found $ARIA_COUNT ARIA description(s)"
        fi
        
        if grep -q 'role="alert"' "$file"; then
            ALERT_COUNT=$(grep -c 'role="alert"' "$file")
            echo "   ✅ Found $ALERT_COUNT error alert(s)"
        fi
        
        echo ""
    fi
done

# Summary
echo "======================================"
echo "📊 FORM VALIDATION SUMMARY"
echo "======================================"
echo "📋 Forms found: $FORMS_FOUND"
echo "❌ Issues found: $ISSUES_FOUND"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ All forms pass validation checks"
    exit 0
else
    echo "❌ Forms have validation issues"
    exit 1
fi