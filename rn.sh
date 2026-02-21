#!/bin/bash

# Simple utility to run react-native commands with custom adb setup
# Usage: ./rn.sh <command>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <react-native-command>"
    echo "Example: $0 run-android"
    exit 1
fi

# Set environment variables for Android SDK
export ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk"
export PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH"

# Make sure our custom adb script is executable
chmod +x ./adb

# Run the command with proper environment
echo "Running: npx react-native $1"
ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk" \
PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH" \
npx react-native "$1"

echo "Completed: npx react-native $1"