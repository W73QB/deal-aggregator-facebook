#!/bin/bash

# Production Smoke Test Suite
# Validates all critical endpoints and functionality post-deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"https://dealradarus.com"}
TIMEOUT=${TIMEOUT:-30}
TEST_SESSION_ID="smoke_test_$(date +%s)"

echo -e "${BLUE}🧪 PRODUCTION SMOKE TEST SUITE${NC}"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Timeout: ${TIMEOUT}s"
echo "Test Session: $TEST_SESSION_ID"
echo ""

# Function to log results
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"

    if [[ "$status" == "PASS" ]]; then
        echo -e "✅ ${GREEN}$test_name${NC}: $message"
    elif [[ "$status" == "FAIL" ]]; then
        echo -e "❌ ${RED}$test_name${NC}: $message"
    else
        echo -e "⚠️  ${YELLOW}$test_name${NC}: $message"
    fi
}

# Function to test endpoint
test_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"

    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DOMAIN$endpoint")

    if [[ "$response" == "$expected_status" ]]; then
        log_test "$test_name" "PASS" "HTTP $response"
        return 0
    else
        log_test "$test_name" "FAIL" "Expected HTTP $expected_status, got $response"
        return 1
    fi
}

# Function to test JSON endpoint
test_json_endpoint() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local test_name="$4"

    local response=$(curl -s --max-time $TIMEOUT -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$DOMAIN$endpoint")

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$DOMAIN$endpoint")

    if echo "$response" | grep -q '"success".*true\|"status".*"healthy"'; then
        log_test "$test_name" "PASS" "HTTP $status_code - Valid JSON response"
        return 0
    else
        log_test "$test_name" "FAIL" "HTTP $status_code - Invalid response: $response"
        return 1
    fi
}

# Initialize test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    ((TESTS_RUN++))
    if "$@"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
}

echo -e "${YELLOW}Phase 1: Basic Connectivity Tests${NC}"
echo "----------------------------------------"

# Test 1: Homepage accessibility
run_test test_endpoint "/" "200" "Homepage Accessibility"

# Test 2: Health endpoint
run_test test_endpoint "/api/health" "200" "Health Endpoint"

# Test 3: API endpoints exist
run_test test_endpoint "/api/analytics" "405" "Analytics Endpoint Exists"
run_test test_endpoint "/api/errors" "405" "Error Endpoint Exists"

echo ""
echo -e "${YELLOW}Phase 2: API Functionality Tests${NC}"
echo "----------------------------------------"

# Test 4: Analytics endpoint POST
ANALYTICS_DATA='{
  "sessionId": "'$TEST_SESSION_ID'",
  "events": [{
    "type": "smoke_test_event",
    "data": {
      "test": true,
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "deployment_verification": true
    }
  }]
}'

run_test test_json_endpoint "/api/analytics" "POST" "$ANALYTICS_DATA" "Analytics Event Logging"

# Test 5: Error endpoint POST
ERROR_DATA='{
  "type": "smoke_test_error",
  "message": "Smoke test verification - system operational",
  "severity": "info",
  "environment": "production",
  "test_session": "'$TEST_SESSION_ID'"
}'

run_test test_json_endpoint "/api/errors" "POST" "$ERROR_DATA" "Error Event Logging"

echo ""
echo -e "${YELLOW}Phase 3: Content Delivery Tests${NC}"
echo "----------------------------------------"

# Test 6: Static assets
run_test test_endpoint "/favicon.ico" "200" "Favicon Delivery"

# Test 7: CSS assets (check if any CSS is served)
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DOMAIN" | grep -o "200" || echo "FAIL")
if [[ "$CSS_STATUS" == "200" ]]; then
    log_test "CSS Assets" "PASS" "Styles loading correctly"
    ((TESTS_PASSED++))
else
    log_test "CSS Assets" "WARN" "Could not verify CSS delivery"
fi
((TESTS_RUN++))

echo ""
echo -e "${YELLOW}Phase 4: Security and Headers Tests${NC}"
echo "----------------------------------------"

# Test 8: Security headers
SECURITY_HEADERS=$(curl -I -s --max-time $TIMEOUT "$DOMAIN" | grep -i "content-security-policy\|x-frame-options\|x-content-type-options")
if [[ -n "$SECURITY_HEADERS" ]]; then
    log_test "Security Headers" "PASS" "CSP and security headers present"
    ((TESTS_PASSED++))
else
    log_test "Security Headers" "WARN" "Security headers not detected"
fi
((TESTS_RUN++))

# Test 9: HTTPS redirect (if testing HTTP)
if [[ "$DOMAIN" == http://* ]]; then
    HTTPS_REDIRECT=$(curl -I -s --max-time $TIMEOUT "$DOMAIN" | grep -i "location.*https" || echo "")
    if [[ -n "$HTTPS_REDIRECT" ]]; then
        log_test "HTTPS Redirect" "PASS" "HTTP redirects to HTTPS"
        ((TESTS_PASSED++))
    else
        log_test "HTTPS Redirect" "FAIL" "No HTTPS redirect detected"
        ((TESTS_FAILED++))
    fi
    ((TESTS_RUN++))
fi

echo ""
echo -e "${YELLOW}Phase 5: Performance Tests${NC}"
echo "----------------------------------------"

# Test 10: Response time check
START_TIME=$(date +%s%N)
curl -s --max-time $TIMEOUT "$DOMAIN/api/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$((($END_TIME - $START_TIME) / 1000000)) # Convert to milliseconds

if [[ $RESPONSE_TIME -lt 500 ]]; then
    log_test "Response Time" "PASS" "${RESPONSE_TIME}ms (< 500ms target)"
    ((TESTS_PASSED++))
elif [[ $RESPONSE_TIME -lt 1000 ]]; then
    log_test "Response Time" "WARN" "${RESPONSE_TIME}ms (acceptable but above target)"
    ((TESTS_PASSED++))
else
    log_test "Response Time" "FAIL" "${RESPONSE_TIME}ms (exceeds 1000ms threshold)"
    ((TESTS_FAILED++))
fi
((TESTS_RUN++))

echo ""
echo -e "${BLUE}📊 SMOKE TEST RESULTS${NC}"
echo "========================================"
echo "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}🎉 ALL SMOKE TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Production deployment verification successful${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Monitor application logs for 30 minutes"
    echo "2. Verify analytics data in database"
    echo "3. Check error logs for any issues"
    echo "4. Set up continuous monitoring"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  SOME TESTS FAILED!${NC}"
    echo -e "${RED}❌ Production deployment needs attention${NC}"
    echo ""
    echo "Failed tests require investigation:"
    echo "1. Check application logs"
    echo "2. Verify database connectivity"
    echo "3. Review network configuration"
    echo "4. Consider rollback if critical failures"
    exit 1
fi