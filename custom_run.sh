#!/bin/bash

# Wrapper script to make npx react-native work with custom adb
# This script properly sets up the environment for React Native CLI to use our custom adb

# Set environment variables for Android SDK
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

# Use the custom adb wrapper for the React Native CLI
echo "Setting up environment for React Native with custom adb..."

# Make sure our custom adb script is executable
chmod +x ./adb

# First, let's make sure we can access adb directly
echo "Checking adb access..."
if [ -x "/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    echo "Windows adb.exe is accessible"
else
    echo "Windows adb.exe not accessible"
    exit 1
fi

# Try to set up the environment properly
echo "Running React Native CLI with custom adb..."

# Run with explicit environment variables - making sure to use absolute path to adb
ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk" \
PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH" \
npx react-native run-android --no-packager

echo "Completed React Native run with custom adb setup"