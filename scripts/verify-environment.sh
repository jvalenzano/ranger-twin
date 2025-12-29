#!/bin/bash
# RANGER Environment Verification
# Run this to validate your development setup

set -e

echo "=========================================="
echo "RANGER Environment Verification"
echo "=========================================="
echo ""

ERRORS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Python Version
echo "Checking Python..."
if command -v python3 &> /dev/null; then
    PY_VERSION=$(python3 --version | cut -d' ' -f2)
    PY_MAJOR=$(echo $PY_VERSION | cut -d'.' -f1)
    PY_MINOR=$(echo $PY_VERSION | cut -d'.' -f2)
    if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 11 ]; then
        check_pass "Python $PY_VERSION (>=3.11 required)"
    else
        check_fail "Python $PY_VERSION (>=3.11 required)"
    fi
else
    check_fail "Python not found"
fi

# Node Version
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | tr -d 'v')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        check_pass "Node.js $NODE_VERSION (>=20 required)"
    else
        check_fail "Node.js $NODE_VERSION (>=20 required)"
    fi
else
    check_fail "Node.js not found"
fi

# Virtual Environment
echo "Checking Python virtual environment..."
if [ -d ".venv" ]; then
    check_pass "Virtual environment exists (.venv/)"
else
    check_warn "No .venv directory - run: python -m venv .venv"
fi

# Environment Variables
echo "Checking environment variables..."
if [ -n "$GOOGLE_API_KEY" ]; then
    check_pass "GOOGLE_API_KEY is set"
else
    check_fail "GOOGLE_API_KEY not set"
fi

# GCP Auth
echo "Checking GCP authentication..."
if gcloud auth application-default print-access-token &> /dev/null; then
    check_pass "GCP Application Default Credentials configured"
else
    check_warn "GCP ADC not configured - run: gcloud auth application-default login"
fi

# Python Dependencies
echo "Checking Python dependencies..."
if [ -f "requirements.txt" ]; then
    if pip show google-adk &> /dev/null; then
        check_pass "Core Python dependencies installed"
    else
        check_fail "Python dependencies missing - run: pip install -r requirements.txt"
    fi
else
    check_fail "requirements.txt not found"
fi

# Node Dependencies
echo "Checking Node dependencies..."
if [ -d "apps/command-console/node_modules" ]; then
    check_pass "Node dependencies installed"
else
    check_warn "Node dependencies missing - run: cd apps/command-console && npm install"
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All critical checks passed!${NC}"
else
    echo -e "${RED}$ERRORS critical check(s) failed${NC}"
    exit 1
fi
echo "=========================================="
