#!/bin/bash

# Direct solution to make npx react-native run-android work with custom adb
# This approach creates a temporary PATH that prioritizes our custom adb

# Set up the environment properly
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"
export PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH"

# Test that we can access adb properly
echo "Testing adb access..."
if command -v adb >/dev/null 2>&1; then
    echo "adb found in PATH"
    adb version
else
    echo "adb not found in PATH"
    exit 1
fi

echo ""
echo "Running npx react-native run-android with proper environment..."
echo "ANDROID_HOME=$ANDROID_HOME"
echo "PATH=$PATH"

# Run with explicit environment variables to ensure the CLI uses the right adb
npx react-native run-android --no-packager

echo ""
echo "If this command works without 'adb not found' errors, it's using the correct adb."