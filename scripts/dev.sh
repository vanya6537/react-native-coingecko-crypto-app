#!/bin/bash
# Full dev setup: Metro bundler + Gradle build + Emulator + Install + Run
# Usage: ./scripts/dev.sh [--clean] [--metro-only]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 React Native Dev Environment${NC}"
echo ""

# Setup Node
source ~/.nvm/nvm.sh
nvm use 20 || nvm use

# Parse arguments
CLEAN=false
METRO_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      shift
      ;;
    --metro-only)
      METRO_ONLY=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Cleanup if requested
if [ "$CLEAN" = true ]; then
  echo -e "${YELLOW}Cleaning previous build artifacts...${NC}"
  cd "$SCRIPT_DIR/android"
  ./gradlew clean >/dev/null 2>&1
  echo -e "${GREEN}✓ Cleaned${NC}"
fi

# Start Metro bundler in background
echo -e "${YELLOW}Starting Metro bundler...${NC}"
cd "$SCRIPT_DIR"
npx expo-metro-config 2>/dev/null || true
npx react-native start --reset-cache > /tmp/metro.log 2>&1 &
METRO_PID=$!
echo -e "  Metro PID: $METRO_PID"
sleep 3
echo -e "${GREEN}✓ Metro running${NC}"

# If metro-only mode, just wait
if [ "$METRO_ONLY" = true ]; then
  echo -e "${BLUE}Metro running in foreground. Press Ctrl+C to stop.${NC}"
  wait $METRO_PID
  exit 0
fi

# Build APK
echo ""
echo -e "${YELLOW}Building Android APK...${NC}"
cd "$SCRIPT_DIR/android"
./gradlew assembleDebug --no-daemon -q --warning-mode=summary 2>&1 | grep -v "deprecated" | grep -v "^$" || true
echo -e "${GREEN}✓ Build complete${NC}"

# Setup emulator
echo ""
echo -e "${YELLOW}Setting up emulator...${NC}"
"$SCRIPT_DIR/scripts/emulator-setup.sh" --install --run

echo ""
echo -e "${GREEN}✅ Dev environment ready!${NC}"
echo ""
echo "Metro Bundler: http://localhost:8081"
echo "Emulator: Running on localhost:5555"
echo ""
echo -e "${YELLOW}To stop Metro, press Ctrl+C in this terminal${NC}"
echo -e "${YELLOW}To view Metro logs: tail -f /tmp/metro.log${NC}"

# Keep script running with Metro
wait $METRO_PID
