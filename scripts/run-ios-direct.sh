#!/bin/bash
# Direct iOS build and run script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"
PROJECT_DIR="$IOS_DIR/CryptoTokensApp"

echo "🚀 Building and running iOS app..."

# Build for simulator
echo "Building..."
cd "$PROJECT_DIR"
xcodebuild \
  -workspace CryptoTokensApp.xcworkspace \
  -scheme CryptoTokensApp \
  -configuration Debug \
  -derivedDataPath build \
  -sdk iphonesimulator \
  -arch x86_64 \
  build

APP_PATH="$PROJECT_DIR/build/Build/Products/Debug-iphonesimulator/CryptoTokensApp.app"

echo "✓ Build complete"
echo ""

#Get first available simulator or create one
SIM_ID=$(xcrun simctl list devices | grep "iPhone" | grep -i "booted\|shutdown" | head -1 | grep -oE '\([A-F0-9-]+\)' | tr -d '()')

if [ -z "$SIM_ID" ]; then
  echo "Creating iPhone 15 simulator..."
  SIM_ID=$(xcrun simctl create "iPhone 15" com.apple.CoreSimulator.SimDeviceType.iPhone-15 com.apple.CoreSimulator.SimRuntime.iOS-18-0)
fi

echo "Simulator: $SIM_ID"
echo ""

# Boot simulator
echo "Booting simulator..."
xcrun simctl boot "$SIM_ID" 2>&1 || true
sleep 3

# Install app
echo "Installing app..."
xcrun simctl install "$SIM_ID" "$APP_PATH"

# Launch app
echo "Launching app..."
xcrun simctl launch "$SIM_ID" com.cryptotokens.app

echo ""
echo "✅ iOS app running!"
echo ""
echo "Metro bundler should be running at localhost:8081"
echo "To reload the app, press 'r' in the Metro terminal"
