#!/bin/bash

# Antigravity Dev Container Verification Script
# Chạy script này trong Dev Container để verify setup

set -e

echo "🔍 ANTIGRAVITY DEV CONTAINER VERIFICATION"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test function
test_check() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test function with expected output
test_check_output() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"

    echo -n "Testing: $test_name... "

    actual=$(eval "$test_command" 2>&1 || echo "")

    if [[ "$actual" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC} ($actual)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected, Got: $actual)"
        ((FAILED++))
        return 1
    fi
}

echo "1️⃣  BASIC SYSTEM CHECKS"
echo "----------------------"

# Check user
test_check_output "Current user is 'vscode'" "whoami" "vscode"

# Check Node.js version
NODE_VERSION=$(node --version 2>&1 | grep -oE '[0-9]+' | head -1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "Testing: Node.js version ≥18... ${GREEN}✓ PASSED${NC} (v$NODE_VERSION)"
    ((PASSED++))
else
    echo -e "Testing: Node.js version ≥18... ${RED}✗ FAILED${NC} (v$NODE_VERSION)"
    ((FAILED++))
fi

# Check npm
test_check "npm is installed" "which npm"

echo ""
echo "2️⃣  DIRECTORY CHECKS"
echo "-------------------"

# Check directories exist
test_check "~/.antigravity exists" "[ -d ~/.antigravity ]"
test_check "~/.npm exists" "[ -d ~/.npm ]"
test_check "~/.config exists" "[ -d ~/.config ]"
test_check "~/.vscode-server exists" "[ -d ~/.vscode-server ]"

echo ""
echo "3️⃣  PERMISSION CHECKS"
echo "--------------------"

# Check directory permissions
test_check "~/.antigravity is writable" "[ -w ~/.antigravity ]"
test_check "~/.antigravity is readable" "[ -r ~/.antigravity ]"
test_check "~/.antigravity is executable" "[ -x ~/.antigravity ]"

# Check ownership
ANTIGRAVITY_OWNER=$(stat -c '%U' ~/.antigravity 2>/dev/null || stat -f '%Su' ~/.antigravity 2>/dev/null)
if [ "$ANTIGRAVITY_OWNER" = "vscode" ]; then
    echo -e "Testing: ~/.antigravity owned by vscode... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Testing: ~/.antigravity owned by vscode... ${RED}✗ FAILED${NC} (Owner: $ANTIGRAVITY_OWNER)"
    ((FAILED++))
fi

# Test write capability
test_check "Can write to ~/.antigravity" "touch ~/.antigravity/test_write.tmp && rm ~/.antigravity/test_write.tmp"

echo ""
echo "4️⃣  WORKSPACE CHECKS"
echo "-------------------"

# Check workspace directory
WORKSPACE_DIR="/workspaces/$(basename $(pwd))"
if [ -d "/workspaces" ]; then
    test_check "Workspace directory accessible" "[ -d /workspaces ]"
    test_check "Workspace is writable" "[ -w . ]"
else
    echo -e "${YELLOW}⚠ WARNING: Not in standard /workspaces directory${NC}"
fi

echo ""
echo "5️⃣  ENVIRONMENT VARIABLES"
echo "------------------------"

# Check env vars
test_check "ANTIGRAVITY_HOME is set" "[ ! -z \"$ANTIGRAVITY_HOME\" ]"
test_check "NODE_ENV is set" "[ ! -z \"$NODE_ENV\" ]"

if [ ! -z "$ANTIGRAVITY_HOME" ]; then
    echo "   ANTIGRAVITY_HOME = $ANTIGRAVITY_HOME"
fi

echo ""
echo "6️⃣  ANTIGRAVITY SERVER CHECKS"
echo "----------------------------"

# Check log file
if [ -f ~/.antigravity/server.log ]; then
    echo -e "Testing: server.log exists... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))

    # Show last log entry
    LAST_LOG=$(tail -1 ~/.antigravity/server.log 2>/dev/null || echo "No logs")
    echo "   Last log: $LAST_LOG"

    # Check for errors in logs
    ERROR_COUNT=$(grep -ic "error\|exception\|failed" ~/.antigravity/server.log 2>/dev/null || echo "0")
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo -e "Testing: No errors in server.log... ${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "Testing: No errors in server.log... ${YELLOW}⚠ WARNING${NC} ($ERROR_COUNT errors found)"
    fi
else
    echo -e "Testing: server.log exists... ${YELLOW}⚠ WARNING${NC} (Log file not created yet)"
fi

echo ""
echo "7️⃣  NPM & DEPENDENCIES"
echo "---------------------"

# Check package.json
test_check "package.json exists" "[ -f package.json ]"

# Check node_modules
if [ -d node_modules ]; then
    echo -e "Testing: node_modules exists... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))

    # Count installed packages
    PKG_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l | xargs)
    echo "   Installed packages: $PKG_COUNT"
else
    echo -e "Testing: node_modules exists... ${YELLOW}⚠ WARNING${NC} (Run 'npm install')"
fi

# Check if critical packages are installed
if [ -d node_modules ]; then
    test_check "next is installed" "[ -d node_modules/next ]"
    test_check "react is installed" "[ -d node_modules/react ]"
fi

echo ""
echo "8️⃣  DOCKER VOLUME CHECKS"
echo "-----------------------"

# Check if volumes are mounted
if mount | grep -q "antigravity-data"; then
    echo -e "Testing: antigravity-data volume mounted... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Testing: antigravity-data volume mounted... ${YELLOW}⚠ INFO${NC} (Using container filesystem)"
fi

if mount | grep -q "npm-cache"; then
    echo -e "Testing: npm-cache volume mounted... ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Testing: npm-cache volume mounted... ${YELLOW}⚠ INFO${NC} (Using container filesystem)"
fi

echo ""
echo "9️⃣  PROCESS CHECKS"
echo "-----------------"

# Check for Antigravity processes
ANTIGRAVITY_PROCS=$(ps aux | grep -i antigravity | grep -v grep | wc -l | xargs)
if [ "$ANTIGRAVITY_PROCS" -gt 0 ]; then
    echo -e "Testing: Antigravity processes running... ${GREEN}✓ PASSED${NC} ($ANTIGRAVITY_PROCS processes)"
    ((PASSED++))
else
    echo -e "Testing: Antigravity processes running... ${YELLOW}⚠ INFO${NC} (Extension may not be started yet)"
fi

# Check for Node processes
NODE_PROCS=$(ps aux | grep node | grep -v grep | wc -l | xargs)
echo "   Node.js processes: $NODE_PROCS"

echo ""
echo "🔟  PORT CHECKS"
echo "--------------"

# Check if ports are available
test_check "Port 3000 available or in use" "! lsof -i:3000 > /dev/null 2>&1 || lsof -i:3000 > /dev/null 2>&1"
test_check "Port 8000 available or in use" "! lsof -i:8000 > /dev/null 2>&1 || lsof -i:8000 > /dev/null 2>&1"

echo ""
echo "=========================================="
echo "📊 VERIFICATION RESULTS"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED! (100%)${NC}"
    echo ""
    echo "🎉 Your Dev Container is properly configured for Antigravity!"
    echo ""
    echo "Next steps:"
    echo "  1. Open VS Code Command Palette (Cmd+Shift+P)"
    echo "  2. Run 'Antigravity: Show Status' to verify extension"
    echo "  3. Run 'npm run dev' to start development server"
    echo ""
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠ MOSTLY PASSED ($SUCCESS_RATE%)${NC}"
    echo ""
    echo "Some checks failed but core functionality should work."
    echo "Check the warnings above for details."
    echo ""
    exit 0
else
    echo -e "${RED}✗ VERIFICATION FAILED ($SUCCESS_RATE%)${NC}"
    echo ""
    echo "❌ Critical issues detected. Please fix the failed checks above."
    echo ""
    echo "Common fixes:"
    echo "  • Run: chmod -R 755 ~/.antigravity ~/.config ~/.vscode-server"
    echo "  • Run: sudo chown -R vscode:vscode ~/"
    echo "  • Rebuild container: Cmd+Shift+P -> 'Rebuild Container'"
    echo ""
    exit 1
fi
