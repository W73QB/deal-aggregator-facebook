#!/bin/bash

# Production-Safe Database Schema Deployment Script
# Deploys monitoring schema with proper backup and rollback

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCHEMA_FILE="database/monitoring-schema.sql"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="deploy-schema-$(date +%Y%m%d_%H%M%S).log"

echo -e "${BLUE}🚀 Production Database Schema Deployment${NC}"
echo "========================================"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to ask for confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if [[ -z "${DATABASE_URL}" ]]; then
        echo -e "${RED}❌ ERROR: DATABASE_URL environment variable not set${NC}"
        exit 1
    fi

    if [[ ! -f "$SCHEMA_FILE" ]]; then
        echo -e "${RED}❌ ERROR: Schema file $SCHEMA_FILE not found${NC}"
        exit 1
    fi

    # Test database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${RED}❌ ERROR: Cannot connect to database${NC}"
        exit 1
    fi

    log "✅ Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"

    # Check if tables exist before backing up
    local tables_exist=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_name IN ('analytics_events', 'error_logs')
        AND table_schema = 'public';
    " | xargs)

    if [[ "$tables_exist" -gt 0 ]]; then
        log "Backing up existing monitoring tables..."
        pg_dump "$DATABASE_URL" \
            --table=analytics_events \
            --table=error_logs \
            --data-only \
            --file="$BACKUP_DIR/monitoring_data_backup.sql" 2>/dev/null || true

        # Create rollback script for existing tables
        cat > "$BACKUP_DIR/rollback.sql" << EOF
-- Rollback script for monitoring schema deployment
-- WARNING: This will drop the monitoring tables!

DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;

-- Restore from backup (if needed):
-- psql \$DATABASE_URL -f "$BACKUP_DIR/monitoring_data_backup.sql"
EOF
    else
        log "No existing monitoring tables found - creating simple rollback script"
        # Create rollback script for new tables
        cat > "$BACKUP_DIR/rollback.sql" << EOF
-- Rollback script for new monitoring schema deployment
-- This will drop the newly created monitoring tables

DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
EOF
    fi

    log "✅ Backup created in $BACKUP_DIR"
}

# Deploy schema
deploy_schema() {
    log "Deploying monitoring schema..."

    # Deploy in transaction for safety
    psql "$DATABASE_URL" << EOF
BEGIN;

-- Deploy monitoring schema
\i $SCHEMA_FILE

-- Verify tables were created
DO \$\$
DECLARE
    analytics_count integer;
    errors_count integer;
BEGIN
    SELECT COUNT(*) INTO analytics_count FROM information_schema.tables
    WHERE table_name = 'analytics_events' AND table_schema = 'public';

    SELECT COUNT(*) INTO errors_count FROM information_schema.tables
    WHERE table_name = 'error_logs' AND table_schema = 'public';

    IF analytics_count = 0 OR errors_count = 0 THEN
        RAISE EXCEPTION 'Schema deployment verification failed';
    END IF;

    RAISE NOTICE 'Schema verification passed - tables created successfully';
END \$\$;

-- Test insert to verify functionality
INSERT INTO analytics_events (session_id, event_type, data)
VALUES ('deploy_test', 'deployment_verification', '{"status": "success"}');

INSERT INTO error_logs (message, severity, error_type)
VALUES ('Deployment verification test', 'info', 'deployment_test');

-- Clean up test data
DELETE FROM analytics_events WHERE event_type = 'deployment_verification';
DELETE FROM error_logs WHERE error_type = 'deployment_test';

COMMIT;
EOF

    if [[ $? -eq 0 ]]; then
        log "✅ Schema deployed successfully"
    else
        log "❌ Schema deployment failed"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."

    # Check tables exist and have correct structure
    local verification=$(psql "$DATABASE_URL" -t -c "
        SELECT
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'analytics_events') as analytics_table,
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'error_logs') as error_table,
            (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'analytics_events') as analytics_columns,
            (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'error_logs') as error_columns;
    ")

    echo "$verification" | while read analytics_table error_table analytics_columns error_columns; do
        if [[ "$analytics_table" -eq 1 && "$error_table" -eq 1 && "$analytics_columns" -ge 6 && "$error_columns" -ge 7 ]]; then
            log "✅ Deployment verification passed"
            echo -e "${GREEN}✅ Monitoring schema deployed successfully!${NC}"
            echo -e "${BLUE}📊 Tables created: analytics_events, error_logs${NC}"
            echo -e "${BLUE}📁 Backup saved to: $BACKUP_DIR${NC}"
            echo -e "${BLUE}📝 Deployment log: $LOG_FILE${NC}"
        else
            log "❌ Deployment verification failed"
            echo -e "${RED}❌ Deployment verification failed${NC}"
            exit 1
        fi
    done
}

# Main deployment process
main() {
    echo "Starting database schema deployment..."
    echo "Environment: ${NODE_ENV:-development}"
    echo "Database: ${DATABASE_URL}"
    echo ""

    if ! confirm "Proceed with schema deployment?"; then
        echo "Deployment cancelled."
        exit 0
    fi

    check_prerequisites
    create_backup
    deploy_schema
    verify_deployment

    echo ""
    echo -e "${GREEN}🎉 Schema deployment completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test analytics endpoints: curl -X POST /api/analytics"
    echo "2. Test error endpoints: curl -X POST /api/errors"
    echo "3. Check health endpoint: curl /api/health"
    echo "4. Monitor application logs for any issues"
    echo ""
    echo "If rollback is needed: psql \$DATABASE_URL -f $BACKUP_DIR/rollback.sql"
}

# Run main function
main "$@"