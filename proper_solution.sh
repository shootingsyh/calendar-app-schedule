#!/bin/bash

# Proper solution for running react-native with the existing project adb script
# This uses only the adb script that's already in the project folder
# without setting ANDROID_HOME or pointing to Windows SDK paths directly

echo "=== Running React Native with Project's ADB Script ==="

# Make sure we're in the right directory
cd /home/shootingsyh/coder_space/calender_app/CalendarApp

# Verify our custom adb script works
echo "1. Verifying custom adb script..."
if [ -x "./adb" ]; then
    echo "   Custom adb script found and executable"
    ./adb version
else
    echo "   ERROR: Custom adb script not found or not executable"
    exit 1
fi

# Check that emulator is connected
echo "2. Checking emulator connection..."
./adb devices

# Build the APK using Gradle
echo "3. Building APK..."
cd android && ./gradlew assembleDebug

# Install the APK using our project's adb script
echo "4. Installing APK on emulator..."
cd .. && ./adb install android/app/build/outputs/apk/debug/app-debug.apk

# Start Metro bundler
echo "5. Starting Metro bundler..."
npx react-native start --port 8081 --host 0.0.0.0 --no-interactive &

# Wait for Metro to start
sleep 3

# Set up port forwarding 
echo "6. Setting up port forwarding..."
./adb reverse tcp:8081 tcp:8081

# Launch the app manually
echo "7. Launching app manually..."
./adb shell am start -n com.calendarapp/com.calendarapp.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo ""
echo "=== SUCCESS ==="
echo "The app should now be running on the emulator."
echo "The solution uses only the project's adb script without setting ANDROID_HOME."