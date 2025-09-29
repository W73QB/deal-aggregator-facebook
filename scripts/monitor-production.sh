#!/bin/bash

# Production Monitoring Script
# Continuous monitoring of production deployment health and performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"https://dealradarus.com"}
DATABASE_URL=${DATABASE_URL:-""}
MONITOR_DURATION=${MONITOR_DURATION:-7200} # 2 hours in seconds
CHECK_INTERVAL=${CHECK_INTERVAL:-60} # 60 seconds
LOG_FILE="production-monitoring-$(date +%Y%m%d_%H%M%S).log"

echo -e "${BLUE}📊 PRODUCTION MONITORING STARTED${NC}"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Monitor Duration: ${MONITOR_DURATION}s ($(($MONITOR_DURATION / 3600))h)"
echo "Check Interval: ${CHECK_INTERVAL}s"
echo "Log File: $LOG_FILE"
echo "Start Time: $(date)"
echo ""

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check health endpoint
check_health() {
    local response=$(curl -s --max-time 10 "$DOMAIN/api/health" 2>/dev/null)
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN/api/health" 2>/dev/null)

    if [[ "$status_code" == "200" ]] && echo "$response" | grep -q '"status".*"healthy"'; then
        return 0
    else
        return 1
    fi
}

# Function to check response time
check_response_time() {
    local start_time=$(date +%s)
    curl -s --max-time 10 "$DOMAIN/api/health" > /dev/null 2>&1
    local end_time=$(date +%s)
    local response_time=$(((end_time - start_time) * 1000)) # Convert to milliseconds
    echo $response_time
}

# Function to check database connectivity
check_database() {
    if [[ -z "$DATABASE_URL" ]]; then
        echo "DATABASE_URL not set - skipping database checks"
        return 1
    fi

    local result=$(psql "$DATABASE_URL" -t -c "SELECT 1;" 2>/dev/null | xargs)
    if [[ "$result" == "1" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to get analytics metrics
get_analytics_metrics() {
    if [[ -z "$DATABASE_URL" ]]; then
        return 1
    fi

    local metrics=$(psql "$DATABASE_URL" -t -c "
        SELECT
            COUNT(*) as total_events,
            COUNT(DISTINCT session_id) as unique_sessions,
            EXTRACT(EPOCH FROM (MAX(occurred_at) - MIN(occurred_at)))/60 as time_span_minutes
        FROM analytics_events
        WHERE occurred_at > NOW() - INTERVAL '1 hour';" 2>/dev/null)

    echo "$metrics"
}

# Function to get error metrics
get_error_metrics() {
    if [[ -z "$DATABASE_URL" ]]; then
        return 1
    fi

    local error_count=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*)
        FROM error_logs
        WHERE created_at > NOW() - INTERVAL '1 hour'
        AND severity IN ('error', 'critical');" 2>/dev/null | xargs)

    echo "${error_count:-0}"
}

# Initialize monitoring variables
START_TIME=$(date +%s)
CHECK_COUNT=0
HEALTH_FAILURES=0
RESPONSE_TIME_WARNINGS=0
DATABASE_FAILURES=0
TOTAL_RESPONSE_TIME=0

echo -e "${YELLOW}Starting continuous monitoring...${NC}"
echo ""

# Main monitoring loop
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))

    # Check if monitoring duration exceeded
    if [[ $ELAPSED_TIME -gt $MONITOR_DURATION ]]; then
        break
    fi

    ((CHECK_COUNT++))

    echo -e "${BLUE}--- Check #$CHECK_COUNT ($(date '+%H:%M:%S')) ---${NC}"

    # Health check
    if check_health; then
        echo -e "✅ ${GREEN}Health Check: PASS${NC}"
        log_with_timestamp "HEALTH_CHECK: PASS"
    else
        echo -e "❌ ${RED}Health Check: FAIL${NC}"
        log_with_timestamp "HEALTH_CHECK: FAIL"
        ((HEALTH_FAILURES++))
    fi

    # Response time check
    RESPONSE_TIME=$(check_response_time)
    TOTAL_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME + RESPONSE_TIME))

    if [[ $RESPONSE_TIME -lt 500 ]]; then
        echo -e "✅ ${GREEN}Response Time: ${RESPONSE_TIME}ms${NC}"
        log_with_timestamp "RESPONSE_TIME: ${RESPONSE_TIME}ms - GOOD"
    elif [[ $RESPONSE_TIME -lt 1000 ]]; then
        echo -e "⚠️  ${YELLOW}Response Time: ${RESPONSE_TIME}ms (WARNING)${NC}"
        log_with_timestamp "RESPONSE_TIME: ${RESPONSE_TIME}ms - WARNING"
        ((RESPONSE_TIME_WARNINGS++))
    else
        echo -e "❌ ${RED}Response Time: ${RESPONSE_TIME}ms (CRITICAL)${NC}"
        log_with_timestamp "RESPONSE_TIME: ${RESPONSE_TIME}ms - CRITICAL"
        ((RESPONSE_TIME_WARNINGS++))
    fi

    # Database connectivity check
    if check_database; then
        echo -e "✅ ${GREEN}Database: Connected${NC}"
        log_with_timestamp "DATABASE: Connected"

        # Get analytics metrics
        ANALYTICS_METRICS=$(get_analytics_metrics)
        if [[ -n "$ANALYTICS_METRICS" ]]; then
            echo -e "📊 ${BLUE}Analytics (1h): $ANALYTICS_METRICS${NC}"
            log_with_timestamp "ANALYTICS_METRICS: $ANALYTICS_METRICS"
        fi

        # Get error metrics
        ERROR_COUNT=$(get_error_metrics)
        if [[ "$ERROR_COUNT" -gt 0 ]]; then
            echo -e "⚠️  ${YELLOW}Errors (1h): $ERROR_COUNT${NC}"
            log_with_timestamp "ERROR_COUNT: $ERROR_COUNT"
        else
            echo -e "✅ ${GREEN}Errors (1h): $ERROR_COUNT${NC}"
            log_with_timestamp "ERROR_COUNT: $ERROR_COUNT"
        fi

    else
        echo -e "❌ ${RED}Database: Connection Failed${NC}"
        log_with_timestamp "DATABASE: Connection Failed"
        ((DATABASE_FAILURES++))
    fi

    # Calculate progress
    PROGRESS=$((ELAPSED_TIME * 100 / MONITOR_DURATION))
    echo -e "📈 Progress: ${PROGRESS}% (${ELAPSED_TIME}s / ${MONITOR_DURATION}s)"

    echo ""

    # Sleep until next check
    sleep $CHECK_INTERVAL
done

# Final report
AVERAGE_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME / CHECK_COUNT))
HEALTH_SUCCESS_RATE=$(((CHECK_COUNT - HEALTH_FAILURES) * 100 / CHECK_COUNT))
DATABASE_SUCCESS_RATE=$(((CHECK_COUNT - DATABASE_FAILURES) * 100 / CHECK_COUNT))

echo ""
echo -e "${BLUE}📊 MONITORING SUMMARY${NC}"
echo "========================================"
echo "Total Duration: ${MONITOR_DURATION}s ($(($MONITOR_DURATION / 3600))h)"
echo "Total Checks: $CHECK_COUNT"
echo ""

echo -e "${YELLOW}Health Check Results:${NC}"
echo "  Successes: $((CHECK_COUNT - HEALTH_FAILURES))/$CHECK_COUNT"
echo "  Failures: $HEALTH_FAILURES"
echo "  Success Rate: ${HEALTH_SUCCESS_RATE}%"

echo ""
echo -e "${YELLOW}Response Time Results:${NC}"
echo "  Average Response Time: ${AVERAGE_RESPONSE_TIME}ms"
echo "  Warnings/Critical: $RESPONSE_TIME_WARNINGS"

echo ""
echo -e "${YELLOW}Database Results:${NC}"
echo "  Connection Successes: $((CHECK_COUNT - DATABASE_FAILURES))/$CHECK_COUNT"
echo "  Connection Failures: $DATABASE_FAILURES"
echo "  Success Rate: ${DATABASE_SUCCESS_RATE}%"

echo ""
echo -e "${YELLOW}Overall Assessment:${NC}"

# Determine overall health
OVERALL_STATUS="HEALTHY"
STATUS_COLOR=$GREEN

if [[ $HEALTH_FAILURES -gt $((CHECK_COUNT / 10)) ]]; then # More than 10% failures
    OVERALL_STATUS="UNHEALTHY"
    STATUS_COLOR=$RED
elif [[ $RESPONSE_TIME_WARNINGS -gt $((CHECK_COUNT / 5)) ]] || [[ $DATABASE_FAILURES -gt 0 ]]; then # More than 20% warnings or any DB failures
    OVERALL_STATUS="DEGRADED"
    STATUS_COLOR=$YELLOW
fi

echo -e "Status: ${STATUS_COLOR}$OVERALL_STATUS${NC}"

if [[ "$OVERALL_STATUS" == "HEALTHY" ]]; then
    echo -e "${GREEN}✅ Production deployment is stable and performing well${NC}"
    echo ""
    echo "Recommendations:"
    echo "• Continue normal monitoring"
    echo "• No immediate action required"
    echo "• Review logs periodically"

elif [[ "$OVERALL_STATUS" == "DEGRADED" ]]; then
    echo -e "${YELLOW}⚠️  Production deployment shows performance issues${NC}"
    echo ""
    echo "Recommendations:"
    echo "• Investigate response time issues"
    echo "• Check database connection stability"
    echo "• Monitor for 24 hours"
    echo "• Consider scaling if issues persist"

else
    echo -e "${RED}❌ Production deployment requires immediate attention${NC}"
    echo ""
    echo "Critical Actions Required:"
    echo "• Investigate health check failures immediately"
    echo "• Check application and database logs"
    echo "• Contact on-call engineer"
    echo "• Consider rollback if issues are severe"
fi

echo ""
echo "Full monitoring log saved to: $LOG_FILE"
echo "Monitoring completed at: $(date)"

# Exit with appropriate code
if [[ "$OVERALL_STATUS" == "HEALTHY" ]]; then
    exit 0
elif [[ "$OVERALL_STATUS" == "DEGRADED" ]]; then
    exit 1
else
    exit 2
fi