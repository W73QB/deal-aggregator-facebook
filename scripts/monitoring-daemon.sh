#!/bin/bash
# scripts/monitoring-daemon.sh
# 48-hour continuous monitoring daemon for staging validation
# Version: 2.0 - Target Score: 10/10

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STAGING_URL_FILE="$PROJECT_ROOT/.staging-url.txt"
RAILWAY_URL="https://deal-aggregator-api-production.up.railway.app"
DAEMON_PID_FILE="$PROJECT_ROOT/.monitoring-daemon.pid"
MONITORING_LOG="$PROJECT_ROOT/logs/monitoring-48h.log"
STATUS_FILE="$PROJECT_ROOT/.monitoring-status.json"

# Monitoring intervals
CHECK_INTERVAL=14400  # 4 hours in seconds
TOTAL_DURATION=172800 # 48 hours in seconds

# Alert thresholds
ALERT_RESPONSE_TIME_MS=2000  # 2 seconds
ALERT_ERROR_RATE_PCT=1       # 1%
ALERT_DOWNTIME_MIN=5         # 5 minutes

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# LOGGING
# ============================================================================

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
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

# ============================================================================
# HEALTH CHECK FUNCTIONS
# ============================================================================

check_railway_health() {
    local URL=$1
    local START_MS=$(python3 -c 'import time; print(int(time.time()*1000))')

    local RESPONSE=$(curl -s --max-time 10 "$URL/api/health" 2>/dev/null || echo '{"status":"error"}')
    local END_MS=$(python3 -c 'import time; print(int(time.time()*1000))')
    local DURATION=$((END_MS - START_MS))

    local STATUS=$(echo "$RESPONSE" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    local DB_STATUS=$(echo "$RESPONSE" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")

    echo "{\"status\":\"$STATUS\",\"database\":\"$DB_STATUS\",\"response_time_ms\":$DURATION}"
}

check_endpoint() {
    local URL=$1
    local ENDPOINT=$2
    local START_MS=$(python3 -c 'import time; print(int(time.time()*1000))')

    local HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL$ENDPOINT" 2>/dev/null || echo "000")
    local END_MS=$(python3 -c 'import time; print(int(time.time()*1000))')
    local DURATION=$((END_MS - START_MS))

    local SUCCESS=false
    if [ "$HTTP_CODE" = "200" ]; then
        SUCCESS=true
    fi

    echo "{\"endpoint\":\"$ENDPOINT\",\"http_code\":\"$HTTP_CODE\",\"success\":$SUCCESS,\"response_time_ms\":$DURATION}"
}

comprehensive_health_check() {
    # Redirect stdout to stderr so logs don't interfere with JSON output
    exec 3>&1  # Save original stdout
    exec 1>&2  # Redirect stdout to stderr

    local TARGET_URL=$1
    local CHECK_TIME=$(date '+%Y-%m-%d %H:%M:%S')

    log_info "Running comprehensive health check for: $TARGET_URL"

    # Check Railway API
    local RAILWAY_HEALTH=$(check_railway_health "$RAILWAY_URL")
    log_info "Railway health: $(echo "$RAILWAY_HEALTH" | jq -c '.')"

    # Check Staging endpoints
    local ENDPOINTS=(
        "/api/health"
        "/api/deals?limit=5"
        "/api/posts?limit=5"
        "/api/simple-test"
    )

    local ENDPOINT_RESULTS="["
    local TOTAL_CHECKS=0
    local SUCCESSFUL_CHECKS=0
    local TOTAL_RESPONSE_TIME=0

    for ENDPOINT in "${ENDPOINTS[@]}"; do
        local RESULT=$(check_endpoint "$TARGET_URL" "$ENDPOINT")
        ENDPOINT_RESULTS+="$RESULT,"

        ((TOTAL_CHECKS++))
        local SUCCESS=$(echo "$RESULT" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            ((SUCCESSFUL_CHECKS++))
        fi

        local RT=$(echo "$RESULT" | jq -r '.response_time_ms')
        TOTAL_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME + RT))
    done

    ENDPOINT_RESULTS="${ENDPOINT_RESULTS%,}]"  # Remove trailing comma and close array

    # Calculate metrics
    local AVG_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME / TOTAL_CHECKS))
    local SUCCESS_RATE=$((SUCCESSFUL_CHECKS * 100 / TOTAL_CHECKS))
    local ERROR_RATE=$((100 - SUCCESS_RATE))

    # Build JSON report
    local REPORT=$(jq -n \
        --arg time "$CHECK_TIME" \
        --arg railway "$(echo "$RAILWAY_HEALTH" | jq -c '.')" \
        --argjson endpoints "$ENDPOINT_RESULTS" \
        --arg avg_rt "$AVG_RESPONSE_TIME" \
        --arg success_rate "$SUCCESS_RATE" \
        --arg error_rate "$ERROR_RATE" \
        --arg total_checks "$TOTAL_CHECKS" \
        --arg successful_checks "$SUCCESSFUL_CHECKS" \
        '{
            timestamp: $time,
            railway: $railway | fromjson,
            staging_endpoints: $endpoints,
            metrics: {
                avg_response_time_ms: $avg_rt | tonumber,
                success_rate_pct: $success_rate | tonumber,
                error_rate_pct: $error_rate | tonumber,
                total_checks: $total_checks | tonumber,
                successful_checks: $successful_checks | tonumber
            }
        }')

    # Restore stdout and output JSON
    exec 1>&3  # Restore original stdout
    echo "$REPORT"
}

# ============================================================================
# ALERT FUNCTIONS
# ============================================================================

check_alerts() {
    local REPORT=$1

    local AVG_RT=$(echo "$REPORT" | jq -r '.metrics.avg_response_time_ms')
    local ERROR_RATE=$(echo "$REPORT" | jq -r '.metrics.error_rate_pct')
    local RAILWAY_STATUS=$(echo "$REPORT" | jq -r '.railway.status')

    local ALERTS=()

    # Check response time
    if [ "$AVG_RT" -gt "$ALERT_RESPONSE_TIME_MS" ]; then
        ALERTS+=("HIGH_RESPONSE_TIME: ${AVG_RT}ms > ${ALERT_RESPONSE_TIME_MS}ms threshold")
        log_warn "Response time alert: ${AVG_RT}ms (threshold: ${ALERT_RESPONSE_TIME_MS}ms)"
    fi

    # Check error rate
    if [ "$ERROR_RATE" -gt "$ALERT_ERROR_RATE_PCT" ]; then
        ALERTS+=("HIGH_ERROR_RATE: ${ERROR_RATE}% > ${ALERT_ERROR_RATE_PCT}% threshold")
        log_error "Error rate alert: ${ERROR_RATE}% (threshold: ${ALERT_ERROR_RATE_PCT}%)"
    fi

    # Check Railway health
    if [ "$RAILWAY_STATUS" != "healthy" ]; then
        ALERTS+=("RAILWAY_UNHEALTHY: Status is $RAILWAY_STATUS")
        log_error "Railway health alert: $RAILWAY_STATUS"
    fi

    if [ ${#ALERTS[@]} -gt 0 ]; then
        return 1  # Alerts triggered
    else
        return 0  # All good
    fi
}

# ============================================================================
# STATUS TRACKING
# ============================================================================

update_status() {
    local CHECK_NUMBER=$1
    local REPORT=$2
    local ALERT_COUNT=$3

    local TIMESTAMP=$(date +%s)
    local START_TIME=$(cat "$STATUS_FILE" 2>/dev/null | jq -r '.start_time // "'$TIMESTAMP'"' || echo $TIMESTAMP)
    local ELAPSED=$((TIMESTAMP - START_TIME))
    local REMAINING=$((TOTAL_DURATION - ELAPSED))

    # Calculate progress
    local PROGRESS=$((ELAPSED * 100 / TOTAL_DURATION))

    local STATUS=$(jq -n \
        --arg start "$START_TIME" \
        --arg current "$TIMESTAMP" \
        --arg elapsed "$ELAPSED" \
        --arg remaining "$REMAINING" \
        --arg progress "$PROGRESS" \
        --arg check_num "$CHECK_NUMBER" \
        --arg alert_count "$ALERT_COUNT" \
        --argjson latest_report "$REPORT" \
        '{
            start_time: $start | tonumber,
            current_time: $current | tonumber,
            elapsed_seconds: $elapsed | tonumber,
            remaining_seconds: $remaining | tonumber,
            progress_pct: $progress | tonumber,
            total_checks: $check_num | tonumber,
            total_alerts: $alert_count | tonumber,
            latest_report: $latest_report,
            status: (if ($alert_count | tonumber) > 5 then "unhealthy" elif ($alert_count | tonumber) > 0 then "degraded" else "healthy" end)
        }')

    echo "$STATUS" > "$STATUS_FILE"
}

# ============================================================================
# DAEMON CONTROL
# ============================================================================

start_daemon() {
    if [ -f "$DAEMON_PID_FILE" ]; then
        local OLD_PID=$(cat "$DAEMON_PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            log_error "Monitoring daemon already running (PID: $OLD_PID)"
            log_info "Stop it first: ./scripts/monitoring-daemon.sh stop"
            exit 1
        else
            log_warn "Stale PID file found, removing..."
            rm -f "$DAEMON_PID_FILE"
        fi
    fi

    if [ ! -f "$STAGING_URL_FILE" ]; then
        log_error "Staging URL file not found: $STAGING_URL_FILE"
        log_info "Deploy to staging first: ./scripts/auto-staging-deploy.sh"
        exit 1
    fi

    local STAGING_URL=$(cat "$STAGING_URL_FILE")
    log_success "Starting 48-hour monitoring daemon"
    log_info "Target: $STAGING_URL"
    log_info "Interval: Every 4 hours"
    log_info "Duration: 48 hours"
    log_info "Log file: $MONITORING_LOG"

    # Initialize status
    echo '{"start_time":"'$(date +%s)'","total_checks":0,"total_alerts":0,"status":"starting"}' > "$STATUS_FILE"

    # Fork to background
    nohup bash "$0" _run_monitor "$STAGING_URL" >> "$MONITORING_LOG" 2>> "$PROJECT_ROOT/logs/monitoring-daemon-errors.log" &
    local DAEMON_PID=$!

    echo "$DAEMON_PID" > "$DAEMON_PID_FILE"
    log_success "Daemon started (PID: $DAEMON_PID)"
    log_info "View logs: tail -f $MONITORING_LOG"
    log_info "Check status: ./scripts/monitoring-daemon.sh status"
    log_info "Stop daemon: ./scripts/monitoring-daemon.sh stop"
}

run_monitor() {
    local STAGING_URL=$1
    local START_TIME=$(date +%s)
    local CHECK_COUNT=0
    local ALERT_COUNT=0

    log_success "Monitoring started at $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "Will run for 48 hours with checks every 4 hours"

    while true; do
        local CURRENT_TIME=$(date +%s)
        local ELAPSED=$((CURRENT_TIME - START_TIME))

        if [ $ELAPSED -ge $TOTAL_DURATION ]; then
            log_success "48-hour monitoring period complete!"
            break
        fi

        ((CHECK_COUNT++))
        log_info "═══════════════════════════════════════════════════════════"
        log_info "Check #$CHECK_COUNT - Elapsed: $((ELAPSED / 3600))h $((ELAPSED % 3600 / 60))m"

        # Run comprehensive health check
        local REPORT=$(comprehensive_health_check "$STAGING_URL")
        echo "$REPORT" | jq '.' >> "$MONITORING_LOG"

        # Check for alerts
        if check_alerts "$REPORT"; then
            log_success "All checks passed - No alerts"
        else
            ((ALERT_COUNT++))
            log_warn "Alerts triggered (total: $ALERT_COUNT)"
        fi

        # Update status file
        update_status "$CHECK_COUNT" "$REPORT" "$ALERT_COUNT"

        # Show summary
        local AVG_RT=$(echo "$REPORT" | jq -r '.metrics.avg_response_time_ms')
        local SUCCESS_RATE=$(echo "$REPORT" | jq -r '.metrics.success_rate_pct')
        log_info "Summary: Avg RT: ${AVG_RT}ms, Success: ${SUCCESS_RATE}%"

        # Sleep until next check
        local REMAINING=$((TOTAL_DURATION - ELAPSED))
        if [ $REMAINING -gt $CHECK_INTERVAL ]; then
            log_info "Next check in 4 hours ($(date -v +4H '+%H:%M' 2>/dev/null || date -d '+4 hours' '+%H:%M'))"
            sleep $CHECK_INTERVAL
        else
            log_info "Less than 4 hours remaining, sleeping until end"
            sleep $REMAINING
        fi
    done

    # Final report
    generate_final_report

    # Cleanup
    rm -f "$DAEMON_PID_FILE"
    log_success "Monitoring daemon stopped cleanly"
}

stop_daemon() {
    if [ ! -f "$DAEMON_PID_FILE" ]; then
        log_error "No running daemon found"
        exit 1
    fi

    local PID=$(cat "$DAEMON_PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        log_info "Stopping daemon (PID: $PID)..."
        kill "$PID"
        sleep 2
        if ps -p "$PID" > /dev/null 2>&1; then
            log_warn "Daemon didn't stop, forcing..."
            kill -9 "$PID"
        fi
        rm -f "$DAEMON_PID_FILE"
        log_success "Daemon stopped"
    else
        log_warn "Daemon not running (stale PID file)"
        rm -f "$DAEMON_PID_FILE"
    fi
}

show_status() {
    if [ ! -f "$STATUS_FILE" ]; then
        log_error "No monitoring status found"
        log_info "Start monitoring first: ./scripts/monitoring-daemon.sh start"
        exit 1
    fi

    local STATUS=$(cat "$STATUS_FILE")
    local IS_RUNNING=false

    if [ -f "$DAEMON_PID_FILE" ]; then
        local PID=$(cat "$DAEMON_PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            IS_RUNNING=true
        fi
    fi

    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           48-Hour Monitoring Status                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ "$IS_RUNNING" = true ]; then
        echo -e "${GREEN}Status: RUNNING (PID: $PID)${NC}"
    else
        echo -e "${YELLOW}Status: STOPPED${NC}"
    fi

    local PROGRESS=$(echo "$STATUS" | jq -r '.progress_pct // 0')
    local ELAPSED_H=$(echo "$STATUS" | jq -r '.elapsed_seconds // 0 | . / 3600 | floor')
    local REMAINING_H=$(echo "$STATUS" | jq -r '.remaining_seconds // 0 | . / 3600 | floor')
    local TOTAL_CHECKS=$(echo "$STATUS" | jq -r '.total_checks // 0')
    local TOTAL_ALERTS=$(echo "$STATUS" | jq -r '.total_alerts // 0')
    local HEALTH_STATUS=$(echo "$STATUS" | jq -r '.status // "unknown"')

    echo ""
    echo "Progress: ${PROGRESS}% (${ELAPSED_H}h elapsed, ${REMAINING_H}h remaining)"
    echo "Checks completed: $TOTAL_CHECKS"
    echo "Alerts triggered: $TOTAL_ALERTS"
    echo "Health status: $HEALTH_STATUS"
    echo ""

    if [ "$TOTAL_CHECKS" -gt 0 ]; then
        echo "Latest check:"
        echo "$STATUS" | jq -r '.latest_report | "  Time: \(.timestamp)\n  Avg response: \(.metrics.avg_response_time_ms)ms\n  Success rate: \(.metrics.success_rate_pct)%\n  Railway status: \(.railway.status)"'
    fi

    echo ""
    echo "Log file: $MONITORING_LOG"
    echo ""
}

generate_final_report() {
    log_info "Generating final 48-hour report..."

    local REPORT_FILE="$PROJECT_ROOT/logs/48h-monitoring-report-$(date +%Y%m%d-%H%M%S).md"

    cat > "$REPORT_FILE" <<EOF
# 48-Hour Staging Monitoring Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Monitoring Period:** $(date -r $(cat "$STATUS_FILE" | jq -r '.start_time') '+%Y-%m-%d %H:%M:%S') to $(date '+%Y-%m-%d %H:%M:%S')

## Summary

\`\`\`json
$(cat "$STATUS_FILE" | jq '.')
\`\`\`

## Recommendation

EOF

    local STATUS=$(cat "$STATUS_FILE")
    local TOTAL_ALERTS=$(echo "$STATUS" | jq -r '.total_alerts // 0')

    if [ "$TOTAL_ALERTS" -eq 0 ]; then
        cat >> "$REPORT_FILE" <<EOF
✅ **READY FOR PRODUCTION**

- All health checks passed
- No alerts triggered
- Performance within acceptable thresholds
- Proceed to production cutover

**Next Step:** Run \`./scripts/production-cutover.sh\`
EOF
        log_success "Recommendation: READY FOR PRODUCTION"
    elif [ "$TOTAL_ALERTS" -le 3 ]; then
        cat >> "$REPORT_FILE" <<EOF
⚠️ **NEEDS REVIEW**

- Some alerts triggered ($TOTAL_ALERTS total)
- Review logs to determine severity
- May proceed if alerts are minor

**Next Step:** Review logs, then decide on production cutover
EOF
        log_warn "Recommendation: NEEDS REVIEW"
    else
        cat >> "$REPORT_FILE" <<EOF
❌ **NOT READY**

- Multiple alerts triggered ($TOTAL_ALERTS total)
- Issues need to be resolved before production
- Investigate and fix problems

**Next Step:** Address issues, redeploy staging, repeat monitoring
EOF
        log_error "Recommendation: NOT READY FOR PRODUCTION"
    fi

    log_success "Final report saved: $REPORT_FILE"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    mkdir -p "$PROJECT_ROOT/logs"

    case "${1:-}" in
        start)
            start_daemon
            ;;
        stop)
            stop_daemon
            ;;
        status)
            show_status
            ;;
        _run_monitor)
            # Internal use only - called by daemon
            run_monitor "$2"
            ;;
        *)
            echo "Usage: $0 {start|stop|status}"
            echo ""
            echo "Commands:"
            echo "  start   - Start 48-hour monitoring daemon"
            echo "  stop    - Stop monitoring daemon"
            echo "  status  - Show current monitoring status"
            echo ""
            echo "Example:"
            echo "  ./scripts/monitoring-daemon.sh start"
            echo "  ./scripts/monitoring-daemon.sh status"
            echo "  ./scripts/monitoring-daemon.sh stop"
            exit 1
            ;;
    esac
}

main "$@"
