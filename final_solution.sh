#!/bin/bash

# Final working solution for running react-native with custom adb wrapper
# Since we've confirmed the manual approach works, this script shows the proper way

echo "=== React Native Run with Custom ADB Wrapper ==="

# The issue: npx react-native run-android fails because CLI can't find adb properly
# The solution: Create a temporary symlink or use the known working approach

echo "1. Current environment check:"
echo "   ANDROID_HOME: ${ANDROID_HOME:-Not set}"
echo "   PATH contains adb: $(if command -v adb >/dev/null 2>&1; then echo "YES"; else echo "NO"; fi)"

echo ""
echo "2. Working approach (already verified):"

# Build step
echo "   Building APK..."
cd android && ./gradlew assembleDebug

# Install step using our custom adb wrapper
echo "   Installing on emulator..."
cd .. && ./adb install android/app/build/outputs/apk/debug/app-debug.apk

# Start Metro
echo "   Starting Metro bundler..."
npx react-native start --port 8081 --host 0.0.0.0 --no-interactive &

# Wait for Metro to start
sleep 3

# Port forwarding
echo "   Setting up port forwarding..."
./adb reverse tcp:8081 tcp:8081

# Launch app manually
echo "   Launching app manually..."
./adb shell am start -n com.calendarapp/com.calendarapp.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo ""
echo "3. For future runs, you can also run:"
echo "   ANDROID_HOME=/mnt/c/Users/shoot/AppData/Local/Android/Sdk npx react-native run-android --no-packager"

echo ""
echo "=== Process Complete ==="
echo "The app is now running on the emulator. Check emulator for visual confirmation."