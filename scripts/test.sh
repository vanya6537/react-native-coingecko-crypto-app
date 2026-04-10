#!/bin/bash
# Quick test script: type-check, lint, and run tests
# Usage: ./scripts/test.sh [--coverage]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Running Tests${NC}"

# Setup Node
source ~/.nvm/nvm.sh
nvm use 20 || nvm use

# Parse arguments
COVERAGE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --coverage)
      COVERAGE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

cd "$SCRIPT_DIR"

# Run check first
echo -e "${YELLOW}Running code quality checks...${NC}"
"$SCRIPT_DIR/scripts/check.sh" || true

# Run Jest tests
echo ""
echo -e "${YELLOW}Running Jest tests...${NC}"

if [ "$COVERAGE" = true ]; then
  npm test -- --coverage 2>&1 | tail -50
else
  npm test 2>&1 | tail -50
fi

echo ""
echo -e "${GREEN}✅ Tests complete${NC}"
