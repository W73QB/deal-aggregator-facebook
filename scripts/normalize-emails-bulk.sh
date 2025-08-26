#!/bin/bash
# 📧 DealRadarUS - Bulk Email Normalization Script
# Normalize ALL emails to deals@dealradarus.com

echo "📧 DEALRADARUS - Bulk Email Normalization to deals@dealradarus.com"
echo "=================================================================="

TARGET_EMAIL="deals@dealradarus.com"

# File extensions to process
EXTENSIONS=("*.html" "*.htm" "*.js" "*.jsx" "*.ts" "*.tsx" "*.css" "*.scss" "*.md" "*.mdx" "*.json" "*.yml" "*.yaml" "*.xml" "*.txt")

# Email patterns to replace (dealradarus.com domain only)
OLD_EMAILS=(
    "support@dealradarus.com"
    "contact@dealradarus.com" 
    "info@dealradarus.com"
    "admin@dealradarus.com"
    "hello@dealradarus.com"
    "sales@dealradarus.com"
    "help@dealradarus.com"
    "service@dealradarus.com"
)

# PHASE 1: DRY RUN
echo "🔍 PHASE 1: DRY RUN ANALYSIS"
echo "============================"

# Find all files to process
FILES_TO_PROCESS=()
for ext in "${EXTENSIONS[@]}"; do
    while IFS= read -r -d '' file; do
        FILES_TO_PROCESS+=("$file")
    done < <(find . -name "$ext" -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./build/*" -not -path "./coverage/*" -print0)
done

echo "📁 Found ${#FILES_TO_PROCESS[@]} files to analyze"
echo

# Check for occurrences
TOTAL_REPLACEMENTS=0
declare -A FILE_COUNTS
declare -A EMAIL_COUNTS

for email in "${OLD_EMAILS[@]}"; do
    echo "🔍 Searching for: $email"
    EMAIL_COUNT=0
    
    for file in "${FILES_TO_PROCESS[@]}"; do
        if [[ -f "$file" ]]; then
            COUNT=$(grep -c "$email" "$file" 2>/dev/null || echo 0)
            if [[ $COUNT -gt 0 ]]; then
                FILE_COUNTS["$file"]=$((${FILE_COUNTS["$file"]:-0} + COUNT))
                EMAIL_COUNT=$((EMAIL_COUNT + COUNT))
                echo "   📄 $file: $COUNT occurrences"
            fi
        fi
    done
    
    if [[ $EMAIL_COUNT -gt 0 ]]; then
        EMAIL_COUNTS["$email"]=$EMAIL_COUNT
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + EMAIL_COUNT))
        echo "   ✅ Total found: $EMAIL_COUNT"
    else
        echo "   ✅ None found"
    fi
    echo
done

# Check for mailto: patterns
echo "🔍 Searching for: mailto: patterns"
MAILTO_COUNT=0
for email in "${OLD_EMAILS[@]}"; do
    MAILTO_PATTERN="mailto:$email"
    for file in "${FILES_TO_PROCESS[@]}"; do
        if [[ -f "$file" ]]; then
            COUNT=$(grep -c "$MAILTO_PATTERN" "$file" 2>/dev/null || echo 0)
            if [[ $COUNT -gt 0 ]]; then
                FILE_COUNTS["$file"]=$((${FILE_COUNTS["$file"]:-0} + COUNT))
                MAILTO_COUNT=$((MAILTO_COUNT + COUNT))
                echo "   📄 $file: $COUNT mailto: occurrences"
            fi
        fi
    done
done

if [[ $MAILTO_COUNT -gt 0 ]]; then
    TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + MAILTO_COUNT))
    echo "   ✅ Total mailto: found: $MAILTO_COUNT"
fi

echo
echo "📊 DRY RUN SUMMARY:"
echo "=================="
echo "🔄 Total replacements needed: $TOTAL_REPLACEMENTS"
echo "📁 Files with changes: ${#FILE_COUNTS[@]}"
echo

if [[ $TOTAL_REPLACEMENTS -eq 0 ]]; then
    echo "✅ No email normalization needed - all emails are already correct!"
    exit 0
fi

echo "📋 Files requiring changes:"
for file in "${!FILE_COUNTS[@]}"; do
    echo "   $file: ${FILE_COUNTS[$file]} replacement(s)"
done

echo
echo "⏳ Starting actual replacements in 3 seconds..."
sleep 3

# PHASE 2: APPLY CHANGES
echo
echo "🔧 PHASE 2: APPLYING CHANGES"
echo "============================"

PROCESSED_FILES=0
ACTUAL_REPLACEMENTS=0

for email in "${OLD_EMAILS[@]}"; do
    echo "🔄 Replacing: $email → $TARGET_EMAIL"
    
    for file in "${FILES_TO_PROCESS[@]}"; do
        if [[ -f "$file" ]]; then
            # Replace direct email
            if grep -q "$email" "$file" 2>/dev/null; then
                sed -i.bak "s/$email/$TARGET_EMAIL/g" "$file"
                COUNT=$(grep -c "$email" "$file.bak" 2>/dev/null || echo 0)
                if [[ $COUNT -gt 0 ]]; then
                    echo "   ✅ $file: $COUNT replacement(s)"
                    ACTUAL_REPLACEMENTS=$((ACTUAL_REPLACEMENTS + COUNT))
                    PROCESSED_FILES=$((PROCESSED_FILES + 1))
                fi
                rm -f "$file.bak"
            fi
            
            # Replace mailto: patterns
            MAILTO_PATTERN="mailto:$email"
            MAILTO_REPLACEMENT="mailto:$TARGET_EMAIL"
            if grep -q "$MAILTO_PATTERN" "$file" 2>/dev/null; then
                sed -i.bak "s|$MAILTO_PATTERN|$MAILTO_REPLACEMENT|g" "$file"
                COUNT=$(grep -c "$MAILTO_PATTERN" "$file.bak" 2>/dev/null || echo 0)
                if [[ $COUNT -gt 0 ]]; then
                    echo "   ✅ $file: $COUNT mailto: replacement(s)"
                    ACTUAL_REPLACEMENTS=$((ACTUAL_REPLACEMENTS + COUNT))
                fi
                rm -f "$file.bak"
            fi
        fi
    done
    echo
done

echo "💾 Applied $ACTUAL_REPLACEMENTS total replacements across files"

# PHASE 3: VERIFICATION
echo
echo "🔍 PHASE 3: POST-CHANGE VERIFICATION"
echo "===================================="

REMAINING_OLD=0
NEW_EMAIL_COUNT=0

# Check for remaining old emails
echo "🔍 Checking for remaining old email patterns..."
for email in "${OLD_EMAILS[@]}"; do
    COUNT=$(grep -r "$email" --include="*.html" --include="*.js" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git . | wc -l)
    if [[ $COUNT -gt 0 ]]; then
        echo "⚠️  Found $COUNT remaining: $email"
        REMAINING_OLD=$((REMAINING_OLD + COUNT))
    fi
done

# Count new target emails
echo "🔍 Counting target email occurrences..."
NEW_EMAIL_COUNT=$(grep -r "$TARGET_EMAIL" --include="*.html" --include="*.js" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git . | wc -l)

echo
echo "📊 VERIFICATION RESULTS:"
echo "======================="
echo "❌ Remaining old emails: $REMAINING_OLD"
echo "✅ Target emails found: $NEW_EMAIL_COUNT"

# FINAL SUMMARY
echo
echo "=================================================================="
echo "📧 EMAIL NORMALIZATION - FINAL SUMMARY"  
echo "=================================================================="
echo "🎯 Target email: $TARGET_EMAIL"
echo "🔄 Total replacements applied: $ACTUAL_REPLACEMENTS"
echo "✅ Target emails in codebase: $NEW_EMAIL_COUNT"
echo "❌ Remaining old emails: $REMAINING_OLD"
echo

echo "📋 CHECKLIST:"
if [[ $REMAINING_OLD -eq 0 ]]; then
    echo "   ✅ No old email patterns remaining"
else
    echo "   ❌ $REMAINING_OLD old email patterns still found"
fi

if [[ $NEW_EMAIL_COUNT -gt 0 ]]; then
    echo "   ✅ Target email found in codebase ($NEW_EMAIL_COUNT occurrences)"
else
    echo "   ❌ Target email not found in codebase"
fi

if [[ $ACTUAL_REPLACEMENTS -gt 0 ]]; then
    echo "   ✅ Successfully applied $ACTUAL_REPLACEMENTS replacements"
else
    echo "   ❌ No replacements were applied"
fi

echo
if [[ $REMAINING_OLD -eq 0 && $NEW_EMAIL_COUNT -gt 0 ]]; then
    echo "🎉 EMAIL NORMALIZATION COMPLETED SUCCESSFULLY!"
    echo
    echo "🚀 READY FOR GIT COMMIT:"
    echo "   git add -A"
    echo "   git commit -m \"chore(email): normalize all project emails to deals@dealradarus.com\""
else
    echo "⚠️  Email normalization completed with issues - please review above"
fi

echo
echo "=================================================================="