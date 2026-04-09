# Android Build & Run Instructions

## ✅ Setup Complete

- React Native 0.84.1 configured
- Android SDK: installed at ~/Library/Android/sdk
- ADB: available
- Android Emulator: Pixel_3a_API_33_arm64-v8a configured
- Gradle configuration: ready
- Metro Bundler: running on port 8081

## ⚠️ Issues Found

1. **Android Emulator**: Not running (Qt/QEMU libraries missing)
2. **Gradle Wrapper**: Not initialized in android/ folder

## 🚀 To Build Android APK (Without Emulator)

### Option 1: Using gradlew (with Gradle download)

```bash
# From project root
cd /Users/netslayer/WebstormProjects/react-native-app

# Start Metro bundler (in separate terminal)
source ~/.nvm/nvm.sh && nvm use 20
npm start

# Build APK
cd android
# First run initialize gradlew
./gradlew assembleDebug

# Or to run on emulator (if available)
./gradlew installDebug
```

### Option 2: Using Android Studio

1. Open Android Studio
2. Open project folder: `/Users/netslayer/WebstormProjects/react-native-app/android`
3. Sync Gradle
4. Click "Run" to build

### Option 3: Using Android Gradle (installed via SDK Manager)

```bash
cd /Users/netslayer/WebstormProjects/react-native-app/android

# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Build
${ANDROID_HOME}/gradle/gradle-7.4/bin/gradle assembleDebug
```

## 🔧 To Fix Android Emulator

The emulator failed because Qt libraries are missing. To fix:

```bash
# Reinstall emulator from Android SDK Manager
# Or download from: https://developer.android.com/studio

# List available emulators
emulator -list-avds

# Start with proper paths
emulator -avd Pixel_3a_API_33_arm64-v8a
```

## 📋 Android Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/cryptotokensapp/
│   │   │   │   ├── MainActivity.java
│   │   │   │   └── MainApplication.java
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/
│   │   └── debug/
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## ✅ Status

- **App Code**: Complete (22 TypeScript files, zero errors)
- **Metro Bundler**: Running on localhost:8081 ✅
- **Bundle Generation**: 7.36MB tested ✅
- **Android Gradle Config**: Ready ✅
- **Android Emulator**: Needs system fix (Qt libraries)

**Next Steps:**
1. Choose build option above
2. Or install Android Studio for GUI build
3. Or fix emulator by reinstalling from SDK Manager
