#!/bin/bash

# Script to run react-native with custom adb wrapper
# This addresses the issue where npx react-native run-android fails 
# because the React Native CLI doesn't respect our custom adb wrapper

# Set the ANDROID_HOME to point to our Windows SDK
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"

# Run the react-native command with custom adb
# We'll set the adb path explicitly by modifying the command
cd /home/shootingsyh/coder_space/calender_app/CalendarApp

echo "Running React Native with custom adb wrapper..."

# First, build the app using Gradle directly
echo "Building the app..."
cd android && ./gradlew assembleDebug

# Install the app using our custom adb wrapper
echo "Installing the app..."
cd ..
./adb install android/app/build/outputs/apk/debug/app-debug.apk

# Start the Metro bundler
echo "Starting Metro bundler..."
npx react-native start --port 8081 --host 0.0.0.0 --no-interactive &

# Wait a moment for Metro to start
sleep 3

# Set up port forwarding
echo "Setting up port forwarding..."
./adb reverse tcp:8081 tcp:8081

# Manually start the app using our custom adb
echo "Starting the app manually..."
./adb shell am start -n com.calendarapp/com.calendarapp.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo "App should now be running on the emulator. Check the emulator for visual confirmation."