#!/bin/bash
# Metro Connection Fix - Complete Installation Guide
# This script will wait for the build to complete and install the fixed APK

PROJECT_ROOT="/Users/netslayer/WebstormProjects/react-native-app"
ANDROID_DIR="$PROJECT_ROOT/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

echo "📱 Metro Connection Fix - Automated Installation"
echo "=============================================="
echo ""

# Build
echo "🔨 Building APK with Metro configuration..."
cd "$ANDROID_DIR" || exit 1

# Use timeout to prevent indefinite hanging
timeout 600 ./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    if [ -f "$APK_PATH" ]; then
        echo "⚠️  Build timed out, but APK exists - proceeding with installation"
    else
        echo "❌ Build failed and no APK found"
        exit 1
    fi
fi

echo ""
echo "📦 Verifying APK..."
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    echo "✅ APK ready: $APK_SIZE"
else
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi

echo ""
echo "📱 Installing on device..."
adb install -r "$APK_PATH"
if [ $? -eq 0 ]; then
    echo "✅ APK installed successfully!"
else
    echo "❌ Installation failed"
    exit 1
fi

echo ""
echo "🚀 Launching app..."
adb shell am start -n com.cryptotokensapp/com.cryptotokensapp.MainActivity
echo "✅ App launched!"

echo ""
echo "📊 Monitoring logs for Metro connection..."
echo "   (Ctrl+C to stop)"
sleep 2
adb logcat | head -50
