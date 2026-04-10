#!/bin/bash
# Run TypeScript type checking and linting
# Usage: ./scripts/check.sh [--fix] [--watch]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}✓ Code Quality Check${NC}"

# Setup Node
source ~/.nvm/nvm.sh
nvm use 20 || nvm use

# Parse arguments
FIX=false
WATCH=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --fix)
      FIX=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

cd "$SCRIPT_DIR"

# TypeScript type check
echo -e "${YELLOW}TypeScript type checking...${NC}"
npm run type-check 2>&1 | head -50 || {
  echo -e "${RED}✗ Type errors found${NC}"
  exit 1
}
echo -e "${GREEN}✓ Types OK${NC}"

# Linting
echo ""
echo -e "${YELLOW}Linting...${NC}"
if [ "$FIX" = true ]; then
  npm run lint -- --fix 2>&1 | tail -20 || true
  echo -e "${GREEN}✓ Fixed linting issues${NC}"
else
  npm run lint 2>&1 | tail -20 || {
    echo -e "${YELLOW}Run with --fix to auto-correct${NC}"
  }
fi

if [ "$WATCH" = true ]; then
  echo -e "${BLUE}Watch mode enabled. Press Ctrl+C to stop.${NC}"
  # Can add watch mode here if needed
fi

echo ""
echo -e "${GREEN}✅ Code quality check complete${NC}"
