#!/bin/bash
# Metro Connection Fix - Build and Install Script

set -e

cd "$(dirname "$0")"

echo "🔧 Metro Connection Fix Script"
echo "=============================="
echo ""

# Step 1: Ensure Node environment
echo "1️⃣  Setting up Node environment..."
source ~/.nvm/nvm.sh
nvm use 20
echo "✅ Node v$(node -v), npm v$(npm -v)"
echo ""

# Step 2: Build debug APK with Metro entry point fix
echo "2️⃣  Building debug APK (with entryFile = ../index.js)..."
cd android
bash ./gradlew clean assembleDebug
BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ Build failed with status $BUILD_STATUS"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 3: Verify APK exists
echo "3️⃣  Verifying APK..."
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    echo "✅ APK ready: $APK_SIZE"
else
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi
echo ""

cd ..

# Step 4: Check for device/emulator
echo "4️⃣  Checking for connected device/emulator..."
DEVICE_COUNT=$(adb devices 2>/dev/null | grep -c "device")
if [ $DEVICE_COUNT -lt 1 ]; then
    echo "⚠️  No device/emulator detected. Please connect or start emulator."
    echo "   Command: emulator -avd <device_name>"
    exit 1
fi
adb devices
echo ""

# Step 5: Set up port forwarding
echo "5️⃣  Setting up port forwarding..."
adb reverse tcp:8081 tcp:8081
echo "✅ Port 8081 reversed for Metro"
echo ""

# Step 6: Install APK
echo "6️⃣  Installing APK on device..."
adb install -r "android/$APK_PATH"
echo "✅ APK installed"
echo ""

# Step 7: Launch app
echo "7️⃣  Launching app..."
adb shell am start -n com.cryptotokensapp/com.cryptotokensapp.MainActivity
echo ""

# Step 8: Monitor logs
echo "8️⃣  Monitoring app logs (Ctrl+C to cancel)..."
echo "   Looking for successful Metro connection..."
echo ""
sleep 2
adb logcat -e "AppRegistry|Bridge connected|loadJSBundleFromAssets" | grep -E "AppRegistry|loadJSBundleFromAssets" | head -20

echo ""
echo "✅ Metro Fix Applied!"
echo "📱 The app should now connect to Metro bundler on localhost:8081"
echo ""
echo "If you see 'Unable to load script', check:"
echo "  1. Metro is running: npm start"
echo "  2. Port forwarding: adb reverse tcp:8081 tcp:8081"
echo "  3. Device is connected: adb devices"
