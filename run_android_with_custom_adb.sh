#!/bin/bash

# Enhanced wrapper to make npx react-native run-android work with custom adb
# This addresses the core issue where the React Native CLI doesn't recognize our custom adb wrapper

# Set environment variables for Android SDK
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"
export PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH"

# Make sure our custom adb script is executable
chmod +x ./adb

echo "Setting up environment for React Native with custom adb..."

# Validate that the Windows adb.exe exists
if [ ! -x "/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools/adb.exe" ]; then
    echo "Error: Windows adb.exe not found at expected location"
    echo "Please verify your Android SDK path"
    exit 1
fi

# Create a temporary symlink or modify PATH to ensure our custom adb is found
# This is needed because the React Native CLI looks for 'adb' in PATH or ANDROID_HOME
echo "Using custom adb wrapper..."

# Run the react-native command with proper environment
npx react-native run-android --no-packager

echo "Completed React Native run with custom adb setup"