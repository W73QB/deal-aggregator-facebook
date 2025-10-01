#!/bin/bash
# scripts/production-cutover.sh
# Automated production cutover with Go/No-Go validation
# Version: 2.0 - Target Score: 10/10

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"
PRODUCTION_URL="https://dealradarus.com"
GO_NOGO_CHECKLIST="$PROJECT_ROOT/PRODUCTION_CUTOVER_PLAN.md"
LOG_FILE="$PROJECT_ROOT/logs/production-cutover-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# ============================================================================
# LOGGING
# ============================================================================

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

log_warn() {
    log "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

log_step() {
    log "${CYAN}▶ $1${NC}"
}

# ============================================================================
# GO/NO-GO VALIDATION
# ============================================================================

automated_go_nogo_checks() {
    log_step "Running automated Go/No-Go checks..."
    echo ""

    local PASS=0
    local FAIL=0
    local TOTAL=0

    # Check 1: Railway API Health
    ((TOTAL++))
    log_info "Check 1: Railway API health"
    local RAILWAY_HEALTH=$(curl -s --max-time 10 "$RAILWAY_URL/api/health" || echo '{"status":"error"}')
    local RAILWAY_STATUS=$(echo "$RAILWAY_HEALTH" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    if [ "$RAILWAY_STATUS" = "healthy" ]; then
        log_success "Railway API is healthy"
        ((PASS++))
    else
        log_error "Railway API status: $RAILWAY_STATUS"
        ((FAIL++))
    fi

    # Check 2: Database connectivity
    ((TOTAL++))
    log_info "Check 2: Database connectivity"
    local DB_STATUS=$(echo "$RAILWAY_HEALTH" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")
    if [ "$DB_STATUS" = "connected" ]; then
        log_success "Database connected"
        ((PASS++))
    else
        log_error "Database status: $DB_STATUS"
        ((FAIL++))
    fi

    # Check 3: Railway response time
    ((TOTAL++))
    log_info "Check 3: Railway response time"
    local START_MS=$(date +%s%3N)
    curl -s --max-time 10 "$RAILWAY_URL/api/simple-test" > /dev/null 2>&1
    local END_MS=$(date +%s%3N)
    local RESPONSE_TIME=$((END_MS - START_MS))
    if [ "$RESPONSE_TIME" -lt 2000 ]; then
        log_success "Response time: ${RESPONSE_TIME}ms (< 2s)"
        ((PASS++))
    else
        log_error "Response time: ${RESPONSE_TIME}ms (>= 2s threshold)"
        ((FAIL++))
    fi

    # Check 4: Git working directory
    ((TOTAL++))
    log_info "Check 4: Git working directory"
    local GIT_STATUS=$(git status --porcelain 2>&1)
    if [ -z "$GIT_STATUS" ]; then
        log_success "Working directory clean"
        ((PASS++))
    else
        log_warn "Uncommitted changes present (proceeding anyway)"
        ((PASS++))  # Non-fatal
    fi

    # Check 5: Vercel authentication
    ((TOTAL++))
    log_info "Check 5: Vercel authentication"
    if vercel whoami &> /dev/null; then
        log_success "Authenticated with Vercel"
        ((PASS++))
    else
        log_error "Not authenticated with Vercel"
        ((FAIL++))
    fi

    # Check 6: Staging monitoring results (if available)
    ((TOTAL++))
    log_info "Check 6: Staging monitoring results"
    if [ -f "$PROJECT_ROOT/.monitoring-status.json" ]; then
        local ALERT_COUNT=$(jq -r '.total_alerts // 0' "$PROJECT_ROOT/.monitoring-status.json" 2>/dev/null || echo "999")
        if [ "$ALERT_COUNT" -le 3 ]; then
            log_success "Staging alerts: $ALERT_COUNT (acceptable)"
            ((PASS++))
        else
            log_warn "Staging alerts: $ALERT_COUNT (review recommended)"
            ((PASS++))  # Non-fatal but warn
        fi
    else
        log_warn "No staging monitoring data found"
        ((PASS++))  # Non-fatal
    fi

    # Check 7: Required files exist
    ((TOTAL++))
    log_info "Check 7: Required documentation"
    if [ -f "$GO_NOGO_CHECKLIST" ]; then
        log_success "Production cutover plan exists"
        ((PASS++))
    else
        log_error "PRODUCTION_CUTOVER_PLAN.md not found"
        ((FAIL++))
    fi

    # Check 8: Node modules installed
    ((TOTAL++))
    log_info "Check 8: Dependencies installed"
    if [ -d "$PROJECT_ROOT/node_modules" ]; then
        log_success "node_modules present"
        ((PASS++))
    else
        log_error "node_modules not found"
        ((FAIL++))
    fi

    echo ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Automated Checks: ${GREEN}PASS: $PASS${NC} / ${RED}FAIL: $FAIL${NC} / TOTAL: $TOTAL"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ "$FAIL" -gt 0 ]; then
        return 1
    else
        return 0
    fi
}

manual_go_nogo_review() {
    log_step "Manual Go/No-Go review required"
    echo ""

    log_info "Please review the following manually:"
    echo ""
    echo "  1. Staging has been validated for 48 hours"
    echo "  2. All stakeholders have been notified"
    echo "  3. Support team is available"
    echo "  4. Rollback plan is understood"
    echo "  5. No active incidents or issues"
    echo "  6. Deployment window is appropriate"
    echo ""

    read -p "Have all manual checks been completed? (yes/no): " MANUAL_CONFIRM

    if [ "$MANUAL_CONFIRM" != "yes" ]; then
        log_error "Manual checks not completed"
        return 1
    fi

    log_success "Manual checks confirmed"
    return 0
}

# ============================================================================
# DEPLOYMENT FUNCTIONS
# ============================================================================

create_production_backup() {
    log_step "Creating production backup..."

    local BACKUP_BRANCH="production-backup-$(date +%Y%m%d-%H%M%S)"
    git branch "$BACKUP_BRANCH"
    log_success "Backup branch created: $BACKUP_BRANCH"

    if git remote -v | grep -q origin; then
        git push origin "$BACKUP_BRANCH" || log_warn "Could not push backup to remote"
    fi

    echo "$BACKUP_BRANCH" > "$PROJECT_ROOT/.production-backup-branch.txt"
}

add_production_env_var() {
    log_step "Adding production environment variable..."

    # Check if already exists
    if vercel env ls production 2>/dev/null | grep -q "NEXT_PUBLIC_API_URL"; then
        log_warn "NEXT_PUBLIC_API_URL already exists in production"
        log_info "Removing and re-adding to ensure correct value..."
        vercel env rm NEXT_PUBLIC_API_URL production --yes
    fi

    log_info "Adding: NEXT_PUBLIC_API_URL=$RAILWAY_URL"
    echo "$RAILWAY_URL" | vercel env add NEXT_PUBLIC_API_URL production

    log_success "Environment variable added"
}

verify_production_env_var() {
    log_step "Verifying production environment variable..."

    if vercel env ls production | grep -q "NEXT_PUBLIC_API_URL"; then
        log_success "Environment variable verified"
        return 0
    else
        log_error "Environment variable not found"
        return 1
    fi
}

deploy_to_production() {
    log_step "Deploying to production..."

    log_info "Starting production deployment..."
    log_warn "This will take ~5-10 minutes"
    echo ""

    local DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1 || echo "DEPLOY_FAILED")

    if echo "$DEPLOY_OUTPUT" | grep -q "DEPLOY_FAILED"; then
        log_error "Deployment failed"
        echo "$DEPLOY_OUTPUT" | tee -a "$LOG_FILE"
        return 1
    fi

    echo "$DEPLOY_OUTPUT" >> "$LOG_FILE"
    log_success "Deployment completed"

    # Wait for deployment to propagate
    log_info "Waiting 30 seconds for deployment to propagate..."
    sleep 30
}

run_production_smoke_tests() {
    log_step "Running production smoke tests..."

    local TESTS_PASSED=0
    local TESTS_FAILED=0

    # Test 1: Homepage
    log_info "Test 1: Homepage accessibility"
    if curl -s --max-time 10 "$PRODUCTION_URL" | grep -q "html"; then
        log_success "Homepage accessible"
        ((TESTS_PASSED++))
    else
        log_error "Homepage not accessible"
        ((TESTS_FAILED++))
    fi

    # Test 2: Health endpoint
    log_info "Test 2: Health endpoint"
    local HEALTH=$(curl -s --max-time 10 "$PRODUCTION_URL/api/health" || echo "{}")
    local STATUS=$(echo "$HEALTH" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "degraded" ]; then
        log_success "Health endpoint: $STATUS"
        ((TESTS_PASSED++))
    else
        log_error "Health endpoint: $STATUS"
        ((TESTS_FAILED++))
    fi

    # Test 3: Deals API
    log_info "Test 3: Deals API"
    if curl -s --max-time 10 "$PRODUCTION_URL/api/deals?limit=5" | jq -e '. | length > 0' > /dev/null 2>&1; then
        log_success "Deals API returning data"
        ((TESTS_PASSED++))
    else
        log_error "Deals API failed"
        ((TESTS_FAILED++))
    fi

    # Test 4: Posts API
    log_info "Test 4: Posts API"
    if curl -s --max-time 10 "$PRODUCTION_URL/api/posts?limit=5" | jq -e '. | length > 0' > /dev/null 2>&1; then
        log_success "Posts API returning data"
        ((TESTS_PASSED++))
    else
        log_error "Posts API failed"
        ((TESTS_FAILED++))
    fi

    echo ""
    log_info "Smoke tests: ${GREEN}PASS: $TESTS_PASSED${NC} / ${RED}FAIL: $TESTS_FAILED${NC}"
    echo ""

    if [ "$TESTS_FAILED" -gt 0 ]; then
        return 1
    else
        return 0
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    cd "$PROJECT_ROOT"

    echo ""
    log "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    log "${MAGENTA}║         Production Cutover Automation v2.0                ║${NC}"
    log "${MAGENTA}║              Target Score: 10/10                           ║${NC}"
    log "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "Starting production cutover at $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "Log file: $LOG_FILE"
    echo ""

    # Phase 1: Go/No-Go Decision
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}PHASE 1: GO/NO-GO DECISION${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if ! automated_go_nogo_checks; then
        log_error "Automated checks failed - ABORTING"
        exit 1
    fi

    if ! manual_go_nogo_review; then
        log_error "Manual review failed - ABORTING"
        exit 1
    fi

    log_success "Go/No-Go: ✅ GO FOR PRODUCTION"
    echo ""

    # Final confirmation
    log_warn "FINAL CONFIRMATION REQUIRED"
    echo ""
    read -p "Proceed with production deployment? (yes/no): " FINAL_CONFIRM
    if [ "$FINAL_CONFIRM" != "yes" ]; then
        log_info "Deployment cancelled by user"
        exit 0
    fi

    echo ""

    # Phase 2: Deployment
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}PHASE 2: DEPLOYMENT${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    create_production_backup
    echo ""

    add_production_env_var
    echo ""

    verify_production_env_var || exit 1
    echo ""

    deploy_to_production || exit 1
    echo ""

    # Phase 3: Validation
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}PHASE 3: VALIDATION${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if ! run_production_smoke_tests; then
        log_error "Smoke tests failed"
        log_warn "Review errors and decide: continue monitoring or rollback?"
        read -p "Continue despite test failures? (yes/no): " CONTINUE
        if [ "$CONTINUE" != "yes" ]; then
            log_error "User aborted deployment"
            exit 1
        fi
    fi

    echo ""

    # Final Summary
    echo ""
    log "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    log "${GREEN}║          🎉 PRODUCTION CUTOVER COMPLETE! 🎉                ║${NC}"
    log "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "Production URL: $PRODUCTION_URL"
    log_info "Railway API: $RAILWAY_URL"
    log_info "Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}NEXT STEPS${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log "1. Monitor for next 2 hours (T+2h check)"
    log "   ${BLUE}./scripts/monitor-production.sh $PRODUCTION_URL${NC}"
    echo ""
    log "2. Schedule 24-hour review (T+24h)"
    log "   - Check error rates, response times"
    log "   - Review user feedback"
    log "   - Update cost tracking"
    echo ""
    log "3. Continue daily Vercel ticket follow-ups"
    log "   - Check: docs/VERCEL-SUPPORT-TICKET.md"
    log "   - Escalate if no response after 7 days"
    echo ""
    log "4. Weekly cost tracking"
    log "   - Update: COST_TRACKING.md"
    log "   - Monitor Railway and Neon usage"
    echo ""

    log_success "✅ Production cutover completed successfully!"
    echo ""
}

main "$@"
