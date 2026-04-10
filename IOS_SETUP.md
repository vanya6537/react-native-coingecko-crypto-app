# 🍎 iOS Development Guide

## Prerequisites

### 1. Full Xcode IDE (Required)
The full Xcode IDE is **required** - Command Line Tools alone are not sufficient.

**Install options:**
- **Mac App Store**: https://apps.apple.com/ca/app/xcode/id497799835
- **Apple Developer**: https://developer.apple.com/download/

### 2. CocoaPods
```bash
sudo gem install cocoapods
```

### 3. Node.js 22.11.0
```bash
# Using nvm
nvm install 22.11.0
nvm use 22.11.0
```

---

## 🚀 Quick Start

### Step 1: One-time Setup
```bash
# Set up iOS environment, install dependencies
bash scripts/ios-setup.sh

# Optional: Install Xcode if not already installed
bash scripts/ios-setup.sh --install-xcode
```

### Step 2: Start Development
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build and run on simulator
bash scripts/run-ios.sh
```

**That's it!** The app will build and launch on the default iOS Simulator.

---

## 📋 Available Scripts

### `ios-setup.sh` - Initial Setup
Install and configure the iOS environment.

**Usage:**
```bash
# Standard setup
bash scripts/ios-setup.sh

# Install Xcode automatically (if available)
bash scripts/ios-setup.sh --install-xcode

# Setup and launch simulator
bash scripts/ios-setup.sh --run-emulator
```

**What it does:**
- ✅ Checks Node.js 20 is installed
- ✅ Verifies Xcode is properly configured
- ✅ Installs/updates CocoaPods
- ✅ Installs iOS dependencies via Pod
- ✅ Creates iOS Simulator if needed
- ✅ Displays available simulators

### `build-ios.sh` - Build Only
Build the iOS app without running it.

**Usage:**
```bash
# Debug build for simulator (default)
bash scripts/build-ios.sh

# Release build
bash scripts/build-ios.sh --release

# Device build (requires provisioning profiles)
bash scripts/build-ios.sh --device

# Clean build
bash scripts/build-ios.sh --clean

# Combine options
bash scripts/build-ios.sh --clean --release
```

### `run-ios.sh` - Build & Run
Complete build and launch on simulator.

**Usage:**
```bash
# Build and run (debug)
bash scripts/run-ios.sh

# Build and run (release)
bash scripts/run-ios.sh --release

# Clean build and run
bash scripts/run-ios.sh --clean
```

---

## 🔧 Common Tasks

### Update Dependencies
```bash
cd ios
pod update
```

### Clean Everything
```bash
# Remove pods and build files
bash scripts/build-ios.sh --clean
```

### Create New Simulator
```bash
xcrun simctl create "iPhone 15" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15 \
  com.apple.CoreSimulator.SimRuntime.iOS-18-0
```

### List All Simulators
```bash
xcrun simctl list devices
```

### Boot Specific Simulator
```bash
UDID="<simulator-udid>"
xcrun simctl boot "$UDID"
```

---

## 🐛 Troubleshooting

### "xcodebuild not found" Error
**Problem**: Command Line Tools are installed, but not full Xcode.

**Solution:**
```bash
# 1. Install full Xcode from Mac App Store or Apple Developer
# 2. Then run:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 3. Verify:
xcodebuild -version
```

### "CocoaPods could not find Xcode project" Error
**Problem**: The Xcode project file (.xcodeproj) is missing.

**Solution:**
```bash
# Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Pod File Conflicts
```bash
# Update pod repo
pod repo update

# Install pods again
pod install --repo-update
```

### Simulator Won't Launch
```bash
# 1. Boot the simulator
xcrun simctl boot <UDID>

# 2. Or launch directly
open -a Simulator

# 3. If stuck, erase and restart
xcrun simctl erase <UDID>
```

---

## 📝 Xcode Command Line Usage

### Build for Simulator
```bash
xcodebuild \
  -workspace ios/Pods/Pods.xcworkspace \
  -scheme CryptoTokensApp \
  -configuration Debug \
  -derivedDataPath ios/build \
  -sdk iphonesimulator \
  -destination "generic/platform=iOS Simulator" \
  build
```

### Build for Device
```bash
xcodebuild \
  -workspace ios/Pods/Pods.xcworkspace \
  -scheme CryptoTokensApp \
  -configuration Debug \
  -derivedDataPath ios/build \
  -sdk iphoneos \
  build
```

### Install on Simulator
```bash
xcrun simctl install <UDID> <APP_PATH>
```

### Launch App
```bash
xcrun simctl launch <UDID> com.your.app.bundle.id
```

---

## 📚 Resources

- [React Native iOS Guide](https://reactnative.dev/docs/ios-setup)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [CocoaPods Guide](https://guides.cocoapods.org/)
- [Apple Developer](https://developer.apple.com)

---

## ✅ Project Info

- **App Name**: CryptoTokensApp
- **Min iOS Version**: 12.0
- **Supported Modules**:
  - React Navigation
  - React Native Screens
  - React Native Gesture Handler
  - React Native Reanimated
  - React Native SVG
  - React Native MMKV
  - Safe Area Context

---

## 🎯 Next Steps

1. ✅ Run `bash scripts/ios-setup.sh` to configure environment
2. ✅ Run `npm start` to start Metro bundler
3. ✅ Run `bash scripts/run-ios.sh` to build and launch app
4. 🎉 Develop!
