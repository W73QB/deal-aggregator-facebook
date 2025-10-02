#!/bin/bash
# scripts/preflight-checks.sh
# Comprehensive pre-deployment validation
# Version: 2.0
# Score target: 10/10

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Pre-Flight Validation for Staging Deployment       ║${NC}"
echo -e "${BLUE}║                  Target Score: 10/10                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check status
check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    PASS=$((PASS + 1))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "${RED}   → $2${NC}"
    FAIL=$((FAIL + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    echo -e "${YELLOW}   → $2${NC}"
    WARN=$((WARN + 1))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 1: Environment & Tools Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1.1 Check Node.js version
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        check_pass "Node.js v$NODE_VERSION (>= 18.x required)"
    else
        check_fail "Node.js v$NODE_VERSION" "Upgrade to Node.js 18.x or higher"
    fi
else
    check_fail "Node.js not found" "Install Node.js 18.x or higher"
fi

# 1.2 Check Vercel CLI
echo -n "Checking Vercel CLI... "
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    check_pass "Vercel CLI v$VERCEL_VERSION installed"
else
    check_fail "Vercel CLI not found" "Run: npm i -g vercel"
fi

# 1.3 Check Railway CLI
echo -n "Checking Railway CLI... "
if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --help 2>&1 | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "present")
    check_pass "Railway CLI $RAILWAY_VERSION installed"
else
    check_fail "Railway CLI not found" "Already should be installed from Phase 3"
fi

# 1.4 Check jq (for JSON parsing)
echo -n "Checking jq (JSON processor)... "
if command -v jq &> /dev/null; then
    check_pass "jq installed"
else
    check_fail "jq not found" "Run: brew install jq (macOS) or apt-get install jq (Linux)"
fi

# 1.5 Check curl
echo -n "Checking curl... "
if command -v curl &> /dev/null; then
    check_pass "curl installed"
else
    check_fail "curl not found" "Should be pre-installed on most systems"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 2: Authentication & Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 Check Vercel authentication
echo -n "Checking Vercel authentication... "
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami 2>&1 | tail -1)
    check_pass "Authenticated as: $VERCEL_USER"
else
    check_fail "Not authenticated with Vercel" "Run: vercel login"
fi

# 2.2 Check Railway authentication
echo -n "Checking Railway authentication... "
if railway whoami &> /dev/null; then
    check_pass "Authenticated with Railway"
else
    check_fail "Not authenticated with Railway" "Run: railway login"
fi

# 2.3 Check Railway project link
echo -n "Checking Railway project link... "
if railway status &> /dev/null; then
    PROJECT_ID=$(railway status 2>&1 | sed -n 's/.*Project: *\([a-f0-9-]*\).*/\1/p' || echo "")
    if [ -n "$PROJECT_ID" ]; then
        check_pass "Linked to Railway project: $PROJECT_ID"
    else
        check_warn "Railway project linked" "Could not extract project ID"
    fi
else
    check_fail "Not linked to Railway project" "Run: railway link (from external-api/ directory)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 3: Git Repository State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Check git status
echo -n "Checking git working directory... "
GIT_STATUS=$(git status --porcelain 2>&1)
if [ -z "$GIT_STATUS" ]; then
    check_pass "Working directory clean"
else
    MODIFIED_COUNT=$(echo "$GIT_STATUS" | grep -c '^' || echo 0)
    check_warn "Working directory has $MODIFIED_COUNT uncommitted changes" "Consider committing or stashing"
fi

# 3.2 Check current branch
echo -n "Checking current branch... "
CURRENT_BRANCH=$(git branch --show-current)
check_pass "On branch: $CURRENT_BRANCH"

# 3.3 Check remote repository
echo -n "Checking remote repository... "
if git remote -v | grep -q origin; then
    REMOTE_URL=$(git remote get-url origin)
    check_pass "Remote origin: $REMOTE_URL"
else
    check_warn "No remote 'origin' configured" "Remote backup will be skipped"
fi

# 3.4 Check for unpushed commits
echo -n "Checking unpushed commits... "
UNPUSHED=$(git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH --oneline 2>/dev/null | wc -l || echo 0)
if [ "$UNPUSHED" -eq 0 ]; then
    check_pass "No unpushed commits"
else
    check_warn "$UNPUSHED unpushed commits" "Consider pushing before deployment"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 4: Railway API Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"

# 4.1 Check Railway API reachability
echo -n "Checking Railway API reachability... "
if curl -s --max-time 10 "$RAILWAY_URL/api/simple-test" &> /dev/null; then
    check_pass "Railway API reachable"
else
    check_fail "Railway API unreachable" "Check Railway deployment status"
fi

# 4.2 Check health endpoint
echo -n "Checking Railway health endpoint... "
HEALTH_RESPONSE=$(curl -s --max-time 10 "$RAILWAY_URL/api/health" || echo '{"status":"error"}')
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
if [ "$HEALTH_STATUS" = "healthy" ]; then
    check_pass "Health status: healthy"
elif [ "$HEALTH_STATUS" = "degraded" ]; then
    check_warn "Health status: degraded" "Database may not be connected"
else
    check_fail "Health status: $HEALTH_STATUS" "Check Railway logs"
fi

# 4.3 Check database connectivity
echo -n "Checking database connectivity... "
DB_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")
if [ "$DB_STATUS" = "connected" ]; then
    check_pass "Database: connected"
else
    check_warn "Database: $DB_STATUS" "May impact data-dependent endpoints"
fi

# 4.4 Check API response times
echo -n "Checking API response times... "
START_TIME=$(date +%s)
curl -s --max-time 10 "$RAILWAY_URL/api/simple-test" &> /dev/null
CURL_STATUS=$?
END_TIME=$(date +%s)
RESPONSE_TIME=$((END_TIME - START_TIME))
if [ "$CURL_STATUS" -eq 0 ]; then
    if [ "$RESPONSE_TIME" -lt 3 ]; then
        check_pass "Response time: ~${RESPONSE_TIME}s (healthy)"
    else
        check_warn "Response time: ~${RESPONSE_TIME}s" "Slower than expected"
    fi
else
    check_fail "API request failed" "Could not reach endpoint"
fi

# 4.5 Check all critical endpoints
echo -n "Checking critical endpoints... "
ENDPOINTS=("/api/deals" "/api/posts" "/api/health")
ENDPOINT_FAILS=0
for ENDPOINT in "${ENDPOINTS[@]}"; do
    if ! curl -s --max-time 10 "$RAILWAY_URL$ENDPOINT" | jq . &> /dev/null; then
        ((ENDPOINT_FAILS++))
    fi
done
if [ "$ENDPOINT_FAILS" -eq 0 ]; then
    check_pass "All 3 critical endpoints responding"
else
    check_fail "$ENDPOINT_FAILS endpoints failing" "Check Railway logs"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 5: Required Files & Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 5.1 Check smoke-test.sh
echo -n "Checking scripts/smoke-test.sh... "
if [ -f "scripts/smoke-test.sh" ]; then
    if [ -x "scripts/smoke-test.sh" ]; then
        check_pass "Exists and executable"
    else
        check_warn "Exists but not executable" "Run: chmod +x scripts/smoke-test.sh"
    fi
else
    check_fail "Not found" "Required for validation"
fi

# 5.2 Check monitor-production.sh
echo -n "Checking scripts/monitor-production.sh... "
if [ -f "scripts/monitor-production.sh" ]; then
    if [ -x "scripts/monitor-production.sh" ]; then
        check_pass "Exists and executable"
    else
        check_warn "Exists but not executable" "Run: chmod +x scripts/monitor-production.sh"
    fi
else
    check_fail "Not found" "Required for monitoring"
fi

# 5.3 Check documentation files
echo -n "Checking required documentation... "
REQUIRED_DOCS=(
    "STAGING-DEPLOYMENT-EXECUTION.md"
    "PRODUCTION_CUTOVER_PLAN.md"
    "PHASE_7_MONITORING_SETUP.md"
    "COST_TRACKING.md"
)
MISSING_DOCS=0
for DOC in "${REQUIRED_DOCS[@]}"; do
    if [ ! -f "$DOC" ]; then
        ((MISSING_DOCS++))
    fi
done
if [ "$MISSING_DOCS" -eq 0 ]; then
    check_pass "All 4 required docs present"
else
    check_fail "$MISSING_DOCS documentation files missing" "Phase 7 incomplete?"
fi

# 5.4 Check .env files
echo -n "Checking environment configuration... "
ENV_FILES=(".env.production" ".env.staging")
MISSING_ENV=0
for ENV_FILE in "${ENV_FILES[@]}"; do
    if [ ! -f "$ENV_FILE" ]; then
        ((MISSING_ENV++))
    fi
done
if [ "$MISSING_ENV" -eq 0 ]; then
    check_pass ".env.production and .env.staging present"
else
    check_warn "$MISSING_ENV .env files missing" "May be created during deployment"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 6: Deployment Readiness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6.1 Check if already deployed to staging
echo -n "Checking existing staging deployment... "
if [ -f ".staging-url.txt" ]; then
    EXISTING_URL=$(cat .staging-url.txt)
    check_warn "Staging already deployed: $EXISTING_URL" "Will be overwritten"
else
    check_pass "No existing staging deployment"
fi

# 6.2 Check Vercel project link
echo -n "Checking Vercel project link... "
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(jq -r '.projectId' .vercel/project.json 2>/dev/null || echo "")
    if [ -n "$PROJECT_ID" ]; then
        check_pass "Linked to Vercel project: $PROJECT_ID"
    else
        check_fail "Invalid .vercel/project.json" "Run: vercel link"
    fi
else
    check_fail ".vercel/project.json not found" "Run: vercel link"
fi

# 6.3 Check node_modules
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(ls node_modules | wc -l)
    check_pass "node_modules present ($MODULE_COUNT packages)"
else
    check_fail "node_modules not found" "Run: npm install"
fi

# 6.4 Check package.json scripts
echo -n "Checking package.json scripts... "
if [ -f "package.json" ]; then
    if grep -q '"build":' package.json && grep -q '"start":' package.json; then
        check_pass "build and start scripts defined"
    else
        check_fail "Missing required scripts" "Check package.json"
    fi
else
    check_fail "package.json not found" "Not in project root?"
fi

# 6.5 Check for build errors
echo -n "Testing build process... "
if npm run build &> /tmp/preflight-build.log; then
    check_pass "Build successful"
    rm -f /tmp/preflight-build.log
else
    check_fail "Build failed" "Check: /tmp/preflight-build.log"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SECTION 7: System Resources"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 7.1 Check disk space
echo -n "Checking disk space... "
AVAILABLE_GB=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G.*//')
if [ "${AVAILABLE_GB%.*}" -gt 5 ]; then
    check_pass "Available: ${AVAILABLE_GB}GB (> 5GB required)"
else
    check_warn "Available: ${AVAILABLE_GB}GB" "Low disk space"
fi

# 7.2 Check memory
echo -n "Checking available memory... "
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    FREE_MB=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//' | awk '{print $1 * 4096 / 1024 / 1024}')
    check_pass "Available: ${FREE_MB%.*}MB"
else
    # Linux
    FREE_MB=$(free -m | awk 'NR==2 {print $7}')
    if [ "$FREE_MB" -gt 1000 ]; then
        check_pass "Available: ${FREE_MB}MB"
    else
        check_warn "Available: ${FREE_MB}MB" "Low memory"
    fi
fi

# 7.3 Check internet connectivity
echo -n "Checking internet connectivity... "
if ping -c 1 vercel.com &> /dev/null; then
    check_pass "Internet connected"
else
    check_fail "Cannot reach vercel.com" "Check network connection"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FINAL RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASS${NC}:    $PASS"
echo -e "${YELLOW}⚠️  WARN${NC}:    $WARN"
echo -e "${RED}❌ FAIL${NC}:    $FAIL"
echo ""

TOTAL=$((PASS + WARN + FAIL))
SCORE=$((PASS * 100 / TOTAL))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "READINESS SCORE: ${BLUE}${SCORE}%${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ PRE-FLIGHT CHECKS PASSED                   ║${NC}"
    echo -e "${GREEN}║         Ready to proceed with staging deployment          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next step: Run ./scripts/auto-staging-deploy.sh"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ PRE-FLIGHT CHECKS FAILED                   ║${NC}"
    echo -e "${RED}║        Fix errors above before proceeding                  ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
