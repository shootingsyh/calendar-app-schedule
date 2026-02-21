# Solution: Making npx react-native run-android work with custom adb wrapper

## Problem
The `npx react-native run-android` command fails when using a custom adb wrapper because:
1. The React Native CLI's `getAdbPath()` function only looks for adb in `ANDROID_HOME` or uses default `adb` command
2. It doesn't recognize or use our custom wrapper script

## Root Cause
In `/node_modules/@react-native-community/cli-platform-android/build/commands/runAndroid/getAdbPath.js`:
```javascript
function getAdbPath() {
  return process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb') : 'adb';
}
```

## Solutions

### Solution 1: Set ANDROID_HOME Environment Variable (Recommended)
```bash
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
npx react-native run-android
```

### Solution 2: Create a symbolic link to make adb point to our wrapper
```bash
# Create a temporary directory for our custom adb
mkdir -p /tmp/custom-adb
# Create a symlink to our wrapper
ln -sf /home/shootingsyh/coder_space/calender_app/CalendarApp/adb /tmp/custom-adb/adb
# Add to PATH
export PATH="/tmp/custom-adb:$PATH"
npx react-native run-android
```

### Solution 3: Use the existing working approach (What I've already verified works)
```bash
# Build manually
cd android && ./gradlew assembleDebug

# Install manually using our custom adb
cd .. && ./adb install android/app/build/outputs/apk/debug/app-debug.apk

# Start Metro
npx react-native start --port 8081 --host 0.0.0.0 --no-interactive &

# Set up port forwarding
./adb reverse tcp:8081 tcp:8081

# Start app manually
./adb shell am start -n com.calendarapp/com.calendarapp.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER
```

## Verification
I've already verified that Solution 3 works correctly:
- The app builds successfully
- The app installs correctly on the emulator
- The app launches and runs properly
- No errors in logs
- Visual confirmation through screenshot

## Recommendation
For ongoing development, use Solution 3 (manual approach) or Solution 1 (proper environment setup) to ensure compatibility with the React Native CLI.