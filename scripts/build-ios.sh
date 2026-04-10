#!/bin/bash
# Build iOS app for React Native project
# Usage: ./scripts/build-ios.sh [--clean] [--release] [--simulator] [--device]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  React Native iOS Build${NC}"
echo "Project: $SCRIPT_DIR"
echo ""

# Parse arguments
CLEAN=false
BUILD_TYPE="debug"
DESTINATION="simulator"
SCHEME="CryptoTokensApp"

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
    --simulator)
      DESTINATION="simulator"
      shift
      ;;
    --device)
      DESTINATION="device"
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

# Check if Xcode is properly set up
echo -e "${YELLOW}Checking Xcode setup...${NC}"
if ! command -v xcodebuild &> /dev/null; then
  echo -e "${RED}❌ Error: xcodebuild not found${NC}"
  echo "You need to install the full Xcode IDE (not just Command Line Tools)"
  echo "Install from: https://developer.apple.com/download/ or Mac App Store"
  echo ""
  echo "After installing Xcode, run:"
  echo "  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

XCODE_VERSION=$(xcodebuild -version | head -1)
echo -e "${GREEN}✓ Xcode: $XCODE_VERSION${NC}"

# Check CocoaPods
echo -e "${YELLOW}Checking CocoaPods...${NC}"
if ! command -v pod &> /dev/null; then
  echo -e "${RED}❌ CocoaPods not installed${NC}"
  echo "Installing CocoaPods..."
  sudo gem install cocoapods
fi

POD_VERSION=$(pod --version)
echo -e "${GREEN}✓ CocoaPods: $POD_VERSION${NC}"

# Clean build directory if requested
if [ "$CLEAN" = true ]; then
  echo -e "${YELLOW}Cleaning build directory...${NC}"
  rm -rf "$IOS_DIR/build"
  rm -rf "$IOS_DIR/Pods"
  rm -rf "$IOS_DIR/Podfile.lock"
fi

# Install CocoaPods dependencies
echo -e "${YELLOW}Installing CocoaPods dependencies...${NC}"
cd "$IOS_DIR"
pod install --repo-update

cd "$SCRIPT_DIR"

# Build configuration
CONFIGURATION="Debug"
if [ "$BUILD_TYPE" = "release" ]; then
  CONFIGURATION="Release"
fi

# Build for simulator or device
echo -e "${YELLOW}Building iOS app ($CONFIGURATION)...${NC}"

if [ "$DESTINATION" = "simulator" ]; then
  echo "Building for iOS Simulator..."
  
  # Get available simulator
  SIMULATOR_DEVICE=$(xcrun simctl list devices available iPhone | grep -m1 "(" | sed 's/.*(\([^)]*\)).*/\1/')
  
  if [ -z "$SIMULATOR_DEVICE" ]; then
    echo -e "${RED}❌ No available iOS simulator found${NC}"
    echo "Create a simulator in Xcode or use:"
    echo "  xcrun simctl create <name> com.apple.CoreSimulator.SimDeviceType.iPhone-15"
    exit 1
  fi
  
  echo -e "${GREEN}Using simulator: $SIMULATOR_DEVICE${NC}"
  
  xcodebuild \
    -workspace "$IOS_DIR/Pods/Pods.xcworkspace" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -derivedDataPath "$IOS_DIR/build" \
    -sdk iphonesimulator \
    -destination "generic/platform=iOS Simulator" \
    build
    
  BUILD_PRODUCT="$IOS_DIR/build/Build/Products/${CONFIGURATION}-iphonesimulator/$SCHEME.app"
  
else
  # Device build
  echo "Building for iOS Device..."
  
  xcodebuild \
    -workspace "$IOS_DIR/Pods/Pods.xcworkspace" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -derivedDataPath "$IOS_DIR/build" \
    -sdk iphoneos \
    build
    
  BUILD_PRODUCT="$IOS_DIR/build/Build/Products/${CONFIGURATION}-iphoneos/$SCHEME.app"
fi

if [ -d "$BUILD_PRODUCT" ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
  echo "Build output: $BUILD_PRODUCT"
else
  echo -e "${RED}❌ Build failed - no app found${NC}"
  exit 1
fi
