#!/bin/bash
# iOS Setup Script - Configure environment for iOS development
# Usage: ./scripts/ios-setup.sh [--install-xcode] [--run-emulator]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📱 iOS Environment Setup${NC}"
echo "Project: $SCRIPT_DIR"
echo ""

# Parse arguments
INSTALL_XCODE=false
RUN_EMULATOR=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --install-xcode)
      INSTALL_XCODE=true
      shift
      ;;
    --run-emulator)
      RUN_EMULATOR=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check Node version
echo -e "${YELLOW}Step 1/5: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not installed${NC}"
  exit 1
fi

source ~/.nvm/nvm.sh
nvm use 20 || nvm use

echo -e "${GREEN}✓ Node.js: $(node -v)${NC}"
npm --version | sed 's/^/✓ npm: /'

# Check Xcode
echo -e "${YELLOW}Step 2/5: Checking Xcode setup...${NC}"

if ! command -v xcodebuild &> /dev/null; then
  echo -e "${RED}❌ xcodebuild not found - Xcode not properly configured${NC}"
  echo ""
  echo "The full Xcode IDE is required (not just Command Line Tools)"
  echo ""
  
  if [ "$INSTALL_XCODE" = true ]; then
    echo -e "${YELLOW}Attempting to install Xcode...${NC}"
    
    # Try using mas (Mac App Store CLI) if available
    if command -v mas &> /dev/null; then
      echo "Installing Xcode from Mac App Store..."
      mas install 497799835  # Xcode App Store ID
    else
      echo "Install options:"
      echo "1. Download from Apple Developer: https://developer.apple.com/download/"
      echo "2. Or Mac App Store: https://apps.apple.com/us/app/xcode/id497799835"
      echo ""
      echo "After installation, run:"
      echo "  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
      exit 1
    fi
  else
    echo "To install Xcode, download from:"
    echo "  👉 https://apps.apple.com/ca/app/xcode/id497799835 (Mac App Store)"
    echo "  👉 https://developer.apple.com/download/ (Apple Developer)"
    echo ""
    echo "Or run this script with --install-xcode flag"
    exit 1
  fi
fi

XCODE_VERSION=$(xcodebuild -version | head -1)
echo -e "${GREEN}✓ $XCODE_VERSION${NC}"

# Check Xcode path
echo -e "${YELLOW}Checking Xcode path...${NC}"
XCODE_PATH=$(xcode-select -p)
if [[ "$XCODE_PATH" == *"/CommandLineTools"* ]]; then
  echo -e "${YELLOW}⚠ Xcode path is set to Command Line Tools only${NC}"
  echo "Setting Xcode to full IDE..."
  
  if [ -d "/Applications/Xcode.app/Contents/Developer" ]; then
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    echo -e "${GREEN}✓ Xcode path updated${NC}"
  else
    echo -e "${RED}❌ /Applications/Xcode.app not found${NC}"
    exit 1
  fi
fi

# Check CocoaPods
echo -e "${YELLOW}Step 3/5: Checking CocoaPods...${NC}"

if ! command -v pod &> /dev/null; then
  echo -e "${YELLOW}Installing CocoaPods...${NC}"
  sudo gem install cocoapods
fi

POD_VERSION=$(pod --version)
echo -e "${GREEN}✓ CocoaPods: $POD_VERSION${NC}"

# Install iOS dependencies
echo -e "${YELLOW}Step 4/5: Installing iOS dependencies...${NC}"

cd "$IOS_DIR"

if [ -f "Podfile.lock" ]; then
  echo "Updating existing pods..."
  pod install --repo-update
else
  echo "Installing pods from Podfile..."
  pod install --repo-update
fi

cd "$SCRIPT_DIR"

echo -e "${GREEN}✓ CocoaPods dependencies installed${NC}"

# Check simulator
echo -e "${YELLOW}Step 5/5: Checking iOS Simulator...${NC}"

SIMULATOR_COUNT=$(xcrun simctl list devices available | grep -c "iPhone" || echo 0)

if [ "$SIMULATOR_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠ No available simulators found${NC}"
  echo "Creating default iPhone 15 simulator..."
  
  xcrun simctl create "iPhone 15" com.apple.CoreSimulator.SimDeviceType.iPhone-15 com.apple.CoreSimulator.SimRuntime.iOS-18-0
  
  echo -e "${GREEN}✓ Simulator created${NC}"
fi

# List available simulators
echo "Available simulators:"
xcrun simctl list devices available iPhone | grep "iPhone" | head -3 | sed 's/^/  /'

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start Metro bundler: npm start"
echo "  2. Build and run iOS app: npm run ios"
echo "     or use: ./scripts/build-ios.sh --simulator"
echo ""

if [ "$RUN_EMULATOR" = true ]; then
  echo -e "${YELLOW}Launching iOS Simulator...${NC}"
  open -a "Simulator"
  sleep 2
  
  SIMULATOR_UDID=$(xcrun simctl list devices available | grep "iPhone" | head -1 | grep -oE '\([A-F0-9-]+\)' | tr -d '()')
  if [ -n "$SIMULATOR_UDID" ]; then
    xcrun simctl boot "$SIMULATOR_UDID"
    echo -e "${GREEN}✓ Simulator launched${NC}"
  fi
fi
