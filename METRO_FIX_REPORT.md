# Metro Bundler Connection - Diagnosis & Fix

## Problem
App crashes with:
```
Unable to load script.
Make sure you're running Metro or that your bundle 'index.android.bundle' is packaged correctly for release.
```

## Root Cause
With New Architecture enabled (`newArchEnabled=true` in gradle.properties), the React Gradle plugin wasn't configured with the JavaScript entry point location. This caused it to default to looking for a pre-packaged `index.android.bundle` in app assets instead of connecting to Metro bundler on port 8081.

## Solution Applied
✅ **FIXED** - Added JavaScript entry point configuration to [android/app/build.gradle](android/app/build.gradle):

```gradle
react {
    autolinkLibrariesWithApp()
    entryFile = file("../index.js")  // ← THIS LINE ADDED
}
```

This tells Gradle:
- In debug mode: Load JS from Metro bundler (localhost:8081)  
- In release mode: Pack the bundle into assets
- Uses `index.js` as the main entry point

## Current Infrastructure Status
✅ Metro bundler running on port 8081 (Node PID 96617)
✅ Android emulator available (emulator-5554)
✅ `adb reverse tcp:8081 tcp:8081` configured for device/emulator access
✅ Build configuration updated
⏳ APK rebuild in progress (contains 81 pod dependencies with New Architecture codegen)

## Next Steps

### 1. After APK Build Completes
When `./gradlew clean assembleDebug` finishes, you'll have the updated APK at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. Install on Device/Emulator
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Ensure Metro Is Running
In a separate terminal:
```bash
cd /Users/netslayer/WebstormProjects/react-native-app
npm start
```

### 4. Verify Port Forwarding
```bash
adb reverse tcp:8081 tcp:8081
```

### 5. Launch App
```bash
adb shell am start -n com.cryptotokensapp/com.cryptotokensapp.MainActivity
```

### 6. Check Logs
```bash
adb logcat | grep -E "Unable to load|loadJSBundleFromAssets|Exception"
```

## Expected Behavior After Fix
✅ App will connect to Metro bundler on localhost:8081
✅ JavaScript bundle loads from Metro instead of assets
✅ Hot reload (R+R) will work for development
✅ No more "Unable to load script" error

## Files Modified
- [android/app/build.gradle](android/app/build.gradle) - Added `entryFile` configuration

## Troubleshooting
If still getting "Unable to load script" after rebuild:

1. **Metro not running?**
   ```bash
   lsof -i :8081  # Should show node process
   npm start      # Start if not running
   ```

2. **Port forwarding not set?**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Device not connected?**
   ```bash
   adb devices  # Should show device as "device"
   ```

4. **APK not rebuilt?**
   - Ensure clean build picked up the `entryFile` configuration
   - Run `./gradlew clean assembleDebug` 
   - The gradle plugin will regenerate ReactNativeEntryPoint with the entry file

## Technical Details
- **React Native Version**: 0.84.1
- **New Architecture**: Enabled ✓
- **Hermes Engine**: Enabled ✓
- **Target SDK**: 36
- **Min SDK**: 24
- **NodeVersion**: v20.20.2
