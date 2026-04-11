#!/bin/bash
# Quick Metro Connection Verification & Installation Script

set -e

PROJECT_ROOT="/Users/netslayer/WebstormProjects/react-native-app"
ANDROID_DIR="$PROJECT_ROOT/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

echo "🔍 Metro Connection Fix - Verification Script"
echo "=============================================="
echo ""

# Step 1: Verify the fix is in place
echo "1️⃣  Verifying Metro entry point configuration..."
if grep -q "entryFile = file(\"../index.js\")" "$ANDROID_DIR/app/build.gradle"; then
    echo "✅ Metro entry point CONFIGURED in build.gradle"
    grep "entryFile" "$ANDROID_DIR/app/build.gradle"
else
    echo "❌ Metro entry point NOT found in build.gradle"
    exit 1
fi
echo ""

# Step 2: Check Metro is running
echo "2️⃣  Checking Metro bundler..."
if lsof -i :8081 2>/dev/null | grep -q node; then
    METRO_PID=$(lsof -i :8081 2>/dev/null | grep node | awk '{print $2}' | head -1)
    echo "✅ Metro running on port 8081 (PID: $METRO_PID)"
else
    echo "⚠️  Metro not running. Start with: npm start"
fi
echo ""

# Step 3: Check for APK
echo "3️⃣  Checking for debug APK..."
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    APK_DATE=$(ls -l "$APK_PATH" | awk '{print $6, $7, $8}')
    echo "✅ APK exists: $APK_SIZE (built: $APK_DATE)"
    echo "   Path: $APK_PATH"
else
    echo "⚠️  APK not found. Run: cd $ANDROID_DIR && bash ./gradlew assembleDebug"
fi
echo ""

# Step 4: Check device connection
echo "4️⃣  Checking device/emulator..."
DEVICE_COUNT=$(adb devices 2>/dev/null | grep -c "device$")
if [ $DEVICE_COUNT -gt 0 ]; then
    echo "✅ Device connected:"
    adb devices | grep device
else
    echo "⚠️  No device/emulator detected. Start with: emulator -avd <device_name>"
fi
echo ""

# Step 5: Verify port forwarding
echo "5️⃣  Setting up port forwarding..."
if adb reverse tcp:8081 tcp:8081 2>/dev/null; then
    echo "✅ Port 8081 forwarded for Metro"
else
    echo "⚠️  Could not set port forwarding"
fi
echo ""

# Step 6: If APK exists, offer to install
if [ -f "$APK_PATH" ]; then
    echo "6️⃣  Ready to install? Options:"
    echo "   a) Install APK: adb install -r \"$APK_PATH\""
    echo "   b) Launch app: adb shell am start -n com.cryptotokensapp/com.cryptotokensapp.MainActivity"
    echo "   c) View logs:  adb logcat | grep -E 'Unable to load|Exception|Bridge connected'"
    echo ""
    echo "To install and test:"
    echo "  adb install -r \"$APK_PATH\" && adb shell am start -n com.cryptotokensapp/com.cryptotokensapp.MainActivity"
fi

echo ""
echo "✅ Metro Connection Fix Verification Complete"
echo ""
echo "Summary:"
echo "  • entryFile configuration: ✅ IN PLACE"
echo "  • Metro bundler: $(lsof -i :8081 2>/dev/null | grep -q node && echo '✅ RUNNING' || echo '⏳ START NEEDED')"
echo "  • APK: $([ -f "$APK_PATH" ] && echo '✅ READY' || echo '⏳ BUILD NEEDED')"
echo "  • Device: $([[ $DEVICE_COUNT -gt 0 ]] && echo '✅ CONNECTED' || echo '⏳ CONNECT NEEDED')"
echo ""
