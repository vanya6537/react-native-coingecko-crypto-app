#!/bin/bash
# Start Android emulator and install APK for testing
# Usage: ./scripts/emulator-setup.sh [--install] [--run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📱 Android Emulator Setup${NC}"

# Check if emulator exists
EMULATOR_AVD="${EMULATOR_AVD:-Pixel_3a_API_33_arm64-v8a}"
echo -e "${YELLOW}Looking for emulator: $EMULATOR_AVD${NC}"

if ! echo "$PATH" | grep -q emulator; then
  echo -e "${RED}✗ Android emulator not in PATH${NC}"
  echo "  Check ANDROID_HOME and PATH settings"
  echo "  Expected: \$ANDROID_HOME/emulator in PATH"
  exit 1
fi

# Check if emulator AVD exists
if ! emulator -list-avds 2>/dev/null | grep -q "$EMULATOR_AVD"; then
  echo -e "${RED}✗ Emulator AVD not found: $EMULATOR_AVD${NC}"
  echo "  Available AVDs:"
  emulator -list-avds | sed 's/^/    /'
  exit 1
fi

echo -e "${GREEN}✓ Emulator AVD found${NC}"

# Parse arguments
INSTALL=false
RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --install)
      INSTALL=true
      shift
      ;;
    --run)
      RUN=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Start emulator if not running
if ! adb devices 2>/dev/null | grep -q "emulator"; then
  echo -e "${YELLOW}Starting emulator...${NC}"
  emulator -avd "$EMULATOR_AVD" -no-snapshot -no-window > /tmp/emulator.log 2>&1 &
  EMULATOR_PID=$!
  echo "PID: $EMULATOR_PID"
  
  # Wait for emulator to boot
  echo -e "${YELLOW}Waiting for emulator to boot (up to 60s)...${NC}"
  WAIT_TIME=0
  MAX_WAIT=60
  while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q 1; then
      echo -e "${GREEN}✓ Emulator booted${NC}"
      break
    fi
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    echo -n "."
  done
  
  if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo -e "${RED}✗ Emulator boot timeout${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ Emulator already running${NC}"
fi

# Install APK if requested
if [ "$INSTALL" = true ]; then
  echo -e "${YELLOW}Installing APK...${NC}"
  BUILD_DIR="$ANDROID_DIR/app/build/outputs/apk/debug"
  APK="$BUILD_DIR/app-debug.apk"
  
  if [ ! -f "$APK" ]; then
    echo -e "${YELLOW}APK not found. Building...${NC}"
    "$SCRIPT_DIR/scripts/build-android.sh"
  fi
  
  adb install -r "$APK"
  echo -e "${GREEN}✓ APK installed${NC}"
fi

# Run app if requested
if [ "$RUN" = true ]; then
  echo -e "${YELLOW}Launching app...${NC}"
  adb shell am start -n com.cryptotokensapp/.MainActivity
  echo -e "${GREEN}✓ App launched${NC}"
fi

echo -e "${GREEN}✓ Emulator setup complete${NC}"
