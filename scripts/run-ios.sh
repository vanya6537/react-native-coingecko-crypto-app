#!/bin/bash
# Complete iOS build and run script
# Usage: ./scripts/run-ios.sh [--clean] [--release]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building & Running iOS App${NC}"
echo ""

# Parse arguments
CLEAN=false
RELEASE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      shift
      ;;
    --release)
      RELEASE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Ensure setup is complete
echo -e "${YELLOW}Verifying iOS environment...${NC}"
if ! command -v xcodebuild &> /dev/null; then
  echo -e "${RED}❌ iOS environment not configured${NC}"
  echo ""
  echo "Run setup first:"
  echo "  ./scripts/ios-setup.sh"
  exit 1
fi

# Ensure Metro bundler is running
echo -e "${YELLOW}Checking Metro bundler...${NC}"
if ! curl -s http://localhost:8081/favicon.ico > /dev/null 2>&1; then
  echo -e "${YELLOW}Starting Metro bundler in background...${NC}"
  cd "$SCRIPT_DIR"
  source ~/.nvm/nvm.sh
  nvm use 20 || nvm use
  npm start &
  METRO_PID=$!
  echo -e "${GREEN}✓ Metro started (PID: $METRO_PID)${NC}"
  sleep 3
fi

# Build arguments
BUILD_ARGS=""
if [ "$CLEAN" = true ]; then
  BUILD_ARGS="$BUILD_ARGS --clean"
fi
if [ "$RELEASE" = true ]; then
  BUILD_ARGS="$BUILD_ARGS --release"
fi

# Run build script
echo -e "${BLUE}Running build script...${NC}"
bash "$SCRIPT_DIR/scripts/build-ios.sh" $BUILD_ARGS

echo ""
echo -e "${GREEN}✅ iOS app built successfully!${NC}"
echo ""
echo "Launching in simulator..."
echo ""

# Use React Native's run-ios command for final installation and launch
cd "$SCRIPT_DIR"
source ~/.nvm/nvm.sh
nvm use 20 || nvm use

if [ "$RELEASE" = true ]; then
  npm run ios -- --configuration Release
else
  npm run ios
fi
