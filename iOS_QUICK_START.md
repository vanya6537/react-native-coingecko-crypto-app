# ⚡ iOS Setup & Build - Quick Reference

## What I've Created

### 📁 New Shell Scripts (in `scripts/` directory):

1. **`ios-setup.sh`** - One-time iOS environment configuration
   ```bash
   bash scripts/ios-setup.sh
   ```
   - Checks/installs Xcode, CocoaPods, Node.js
   - Installs iOS dependencies via CocoaPods
   - Creates iOS Simulator if needed
   - Optional flags: `--install-xcode`, `--run-emulator`

2. **`build-ios.sh`** - Build iOS app without running
   ```bash
   bash scripts/build-ios.sh [--clean] [--release] [--device]
   ```
   - Compiles the iOS app
   - Outputs to `ios/build/` directory
   - Supports debug/release builds and simulator/device targets

3. **`run-ios.sh`** - Build and launch on simulator
   ```bash
   bash scripts/run-ios.sh [--clean] [--release]
   ```
   - Builds the app
   - Installs on simulator
   - Launches automatically
   - Starts Metro bundler if not already running

### 📚 Documentation:

- **`IOS_SETUP.md`** - Complete iOS development guide with troubleshooting

---

## ⚠️ Current Blocker: Full Xcode Required

The iOS app **cannot be built yet** because your Mac has:
- ✅ Command Line Tools
- ❌ **Missing**: Full Xcode IDE (~15 GB)

### Install Full Xcode:
1. **Mac App Store**: https://apps.apple.com/ca/app/xcode/id497799835
2. **Apple Developer**: https://developer.apple.com/download/

After installation:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

---

## 🚀 Once Xcode is Installed:

### First Time (5 min):
```bash
bash scripts/ios-setup.sh
```

### Development (2 terminals):
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build & Run
bash scripts/run-ios.sh
```

### Or, in one command:
```bash
npm run ios  # React Native built-in command
```

---

## 📋 Script Options

### `ios-setup.sh`
```bash
bash scripts/ios-setup.sh                    # Standard setup
bash scripts/ios-setup.sh --run-emulator     # Setup + launch simulator
bash scripts/ios-setup.sh --install-xcode    # Try automated install (if `mas` available)
```

### `build-ios.sh`
```bash
bash scripts/build-ios.sh                    # Debug build for simulator
bash scripts/build-ios.sh --clean            # Remove build artifacts first
bash scripts/build-ios.sh --release          # Release build
bash scripts/build-ios.sh --device           # Build for physical device
```

### `run-ios.sh`
```bash
bash scripts/run-ios.sh                      # Build & run (debug)
bash scripts/run-ios.sh --clean              # Clean build & run
bash scripts/run-ios.sh --release            # Build & run (release)
```

---

## 🎯 Project Info

- **Scheme**: `CryptoTokensApp`
- **Min iOS Target**: 12.0
- **Build System**: Xcode + CocoaPods
- **Dependencies**: 
  - React Native 0.84.1
  - React Navigation
  - React Native Screens
  - React Native Gesture Handler
  - React Native Reanimated
  - React Native SVG
  - React Native MMKV

---

## ✅ Checklist

- [ ] Xcode installed from App Store / Apple Developer
- [ ] Run: `bash scripts/ios-setup.sh`
- [ ] Run: `npm start` (Terminal 1)
- [ ] Run: `bash scripts/run-ios.sh` (Terminal 2)
- [ ] 🎉 App appears in simulator!

---

## 🔗 Related Files

- [IOS_SETUP.md](IOS_SETUP.md) - Detailed iOS development guide
- [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) - General build instructions
- [scripts/build-ios.sh](scripts/build-ios.sh) - Build script
- [scripts/ios-setup.sh](scripts/ios-setup.sh) - Setup script
- [scripts/run-ios.sh](scripts/run-ios.sh) - Run script
- [scripts/build-android.sh](scripts/build-android.sh) - Android equivalent
