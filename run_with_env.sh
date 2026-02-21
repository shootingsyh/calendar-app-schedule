#!/bin/bash

# Script to properly run react-native with custom adb wrapper
# This sets the environment correctly so npx react-native run-android works

# Set ANDROID_HOME to point to Windows Android SDK
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"

# Add Windows platform-tools to PATH so React Native CLI can find adb
export PATH="$ANDROID_HOME/platform-tools:$PATH"

# Set up the environment for React Native CLI to use Windows adb
# This should make npx react-native run-android work properly

echo "Setting up environment for React Native with Windows adb..."

# Verify our custom adb wrapper works
if [ -x "./adb" ]; then
    echo "Custom adb wrapper found and executable"
    ./adb version
else
    echo "Custom adb wrapper not found or not executable"
    exit 1
fi

# Verify Windows adb is accessible 
if [ -x "/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    echo "Windows adb.exe is accessible"
else
    echo "Windows adb.exe not accessible"
    exit 1
fi

# Run the command with proper environment
echo "Running: npx react-native run-android --no-packager"
ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk" \
PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH" \
npx react-native run-android --no-packager

echo "Completed React Native run with proper environment"