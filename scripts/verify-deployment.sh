#!/bin/bash
# scripts/verify-deployment.sh
# Quick verification tool for deployments
# Version: 1.0

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get target URL
TARGET_URL="${1:-}"

if [ -z "$TARGET_URL" ]; then
    # Try to auto-detect
    if [ -f ".staging-url.txt" ]; then
        TARGET_URL=$(cat .staging-url.txt)
        echo -e "${BLUE}Auto-detected staging URL: $TARGET_URL${NC}"
    else
        echo "Usage: $0 <URL>"
        echo ""
        echo "Examples:"
        echo "  $0 https://deal-aggregator-facebook-abc123.vercel.app  # Staging"
        echo "  $0 https://dealradarus.com                             # Production"
        exit 1
    fi
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              Quick Deployment Verification                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Target: $TARGET_URL${NC}"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
run_test() {
    local TEST_NAME=$1
    local TEST_COMMAND=$2

    ((TOTAL_TESTS++))
    echo -n "Testing: $TEST_NAME... "

    if eval "$TEST_COMMAND" &> /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Test 1: Homepage accessibility
run_test "Homepage" "curl -s --max-time 10 '$TARGET_URL' | grep -q 'html'"

# Test 2: Health endpoint
run_test "Health endpoint" "curl -s --max-time 10 '$TARGET_URL/api/health' | jq -e '.status' > /dev/null"

# Test 3: Deals API
run_test "Deals API" "curl -s --max-time 10 '$TARGET_URL/api/deals?limit=5' | jq -e '. | length > 0' > /dev/null"

# Test 4: Posts API
run_test "Posts API" "curl -s --max-time 10 '$TARGET_URL/api/posts?limit=5' | jq -e 'if type==\"array\" then length > 0 elif type==\"object\" then .posts | length > 0 else false end' > /dev/null"

# Test 5: Simple test endpoint
run_test "Simple test" "curl -s --max-time 10 '$TARGET_URL/api/simple-test' | jq '.' > /dev/null"

# Test 6: Response time check
echo -n "Testing: Response time... "
START_MS=$(date +%s%3N)
curl -s --max-time 10 "$TARGET_URL/api/health" > /dev/null 2>&1 || true
END_MS=$(date +%s%3N)
RESPONSE_TIME=$((END_MS - START_MS))

((TOTAL_TESTS++))
if [ "$RESPONSE_TIME" -lt 2000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${RESPONSE_TIME}ms)"
    ((PASSED_TESTS++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${RESPONSE_TIME}ms > 2s threshold)"
    ((PASSED_TESTS++))  # Non-fatal
fi

# Test 7: Check if using Railway API
echo -n "Testing: Railway API usage... "
HEALTH_RESPONSE=$(curl -s --max-time 10 "$TARGET_URL/api/health" 2>/dev/null || echo '{}')
API_SOURCE=$(echo "$HEALTH_RESPONSE" | jq -r '.source // "unknown"' 2>/dev/null || echo "unknown")

((TOTAL_TESTS++))
if echo "$HEALTH_RESPONSE" | grep -q "railway\|external" || [ "$API_SOURCE" != "unknown" ]; then
    echo -e "${GREEN}✅ PASS${NC} (External API detected)"
    ((PASSED_TESTS++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} (May be using Vercel routes)"
    ((PASSED_TESTS++))  # Non-fatal warning
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Results: ${GREEN}PASS: $PASSED_TESTS${NC} / ${RED}FAIL: $FAILED_TESTS${NC} / TOTAL: $TOTAL_TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ ALL TESTS PASSED!                          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Deployment is healthy and ready to use."
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ SOME TESTS FAILED                          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Review failed tests above and troubleshoot."
    exit 1
fi
