#!/bin/bash
# scripts/rollback-staging.sh
# Quick rollback for staging deployment
# Version: 2.0 - Target Score: 10/10

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_BRANCH_FILE="$PROJECT_ROOT/.staging-backup-branch.txt"
STAGING_URL_FILE="$PROJECT_ROOT/.staging-url.txt"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║              Staging Deployment Rollback                   ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}⚠️  WARNING: This will rollback the staging deployment${NC}"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${BLUE}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}▶ Step 1: Removing environment variable...${NC}"
if vercel env rm NEXT_PUBLIC_API_URL preview --yes 2>/dev/null; then
    echo -e "${GREEN}✅ Environment variable removed${NC}"
else
    echo -e "${YELLOW}⚠️  Variable may not exist (continuing)${NC}"
fi

echo ""
echo -e "${BLUE}▶ Step 2: Redeploying staging without external API...${NC}"
vercel --pre --force

echo ""
echo -e "${BLUE}▶ Step 3: Cleaning up temporary files...${NC}"
rm -f "$STAGING_URL_FILE"
echo -e "${GREEN}✅ Staging URL file removed${NC}"

if [ -f "$BACKUP_BRANCH_FILE" ]; then
    BACKUP_BRANCH=$(cat "$BACKUP_BRANCH_FILE")
    echo -e "${BLUE}Backup branch available: $BACKUP_BRANCH${NC}"
    echo -e "${BLUE}To restore: git checkout $BACKUP_BRANCH${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Rollback Complete                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Staging deployment has been rolled back${NC}"
echo -e "${BLUE}API routes will now use Vercel's internal routes${NC}"
echo ""
