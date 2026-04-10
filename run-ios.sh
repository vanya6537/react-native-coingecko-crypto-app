#!/bin/bash
# Build and run iOS app - Direct approach
set -e

cd "$(dirname "$0")"
PROJECT_ROOT="$PWD"
IOS_APP_PATH="$PROJECT_ROOT/ios/CryptoTokensApp/build/Build/Products/Debug-iphonesimulator/CryptoTokensApp.app"

echo "📱 Building iOS App..."
cd "$PROJECT_ROOT/ios/CryptoTokensApp"

xcodebuild \
  -workspace CryptoTokensApp.xcworkspace \
  -scheme CryptoTokensApp \
  -configuration Debug \
  -derivedDataPath build \
  -sdk iphonesimulator \
  -arch x86_64 \
  build

# Get simulator UDID
SIMULATOR_UDID=$(xcrun simctl list devices | grep "iPhone 15 Pro" | grep -oE '\([A-F0-9-]+\)' | head -1 | tr -d '()')

if [ -z "$SIMULATOR_UDID" ]; then
  echo "❌ No iPhone 15 Pro simulator found"
  exit 1
fi

echo "📲 Installing app on simulator: $SIMULATOR_UDID"
xcrun simctl install "$SIMULATOR_UDID" "$IOS_APP_PATH"

echo "🚀 Launching app..."
xcrun simctl launch "$SIMULATOR_UDID" com.cryptotokens.app

echo "✅ App launched!"
