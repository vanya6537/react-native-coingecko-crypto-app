#!/bin/bash
# Build Android debug APK for React Native app
# Usage: ./scripts/build-android.sh [--clean] [--release] [--scan]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  React Native Android Build${NC}"
echo "Project: $SCRIPT_DIR"
echo ""

# Parse arguments
CLEAN=false
BUILD_TYPE="debug"
SCAN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      shift
      ;;
    --release)
      BUILD_TYPE="release"
      shift
      ;;
    --scan)
      SCAN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check Node version
echo -e "${YELLOW}Checking Node.js version...${NC}"
source ~/.nvm/nvm.sh
nvm use 20 || nvm use

# Clean if requested
if [ "$CLEAN" = true ]; then
  echo -e "${YELLOW}Cleaning previous build...${NC}"
  cd "$ANDROID_DIR"
  ./gradlew clean
  cd "$SCRIPT_DIR"
fi

# Assemble APK
echo -e "${YELLOW}Building ${BUILD_TYPE} APK...${NC}"
cd "$ANDROID_DIR"

if [ "$SCAN" = true ]; then
  ./gradlew assemble${BUILD_TYPE^} --scan --no-daemon
else
  ./gradlew assemble${BUILD_TYPE^} --no-daemon -q
fi

# Report success
BUILD_DIR="$ANDROID_DIR/app/build/outputs/apk/${BUILD_TYPE}"
if [ -f "$BUILD_DIR/app-${BUILD_TYPE}.apk" ]; then
  echo -e "${GREEN}✓ APK built successfully!${NC}"
  echo "Location: $BUILD_DIR/app-${BUILD_TYPE}.apk"
  ls -lh "$BUILD_DIR/app-${BUILD_TYPE}.apk"
else
  echo -e "${YELLOW}Warning: APK not found at expected location${NC}"
  find "$ANDROID_DIR/app/build/outputs" -name "*.apk" 2>/dev/null | head -5
fi

echo ""
echo -e "${GREEN}✓ Build complete${NC}"
