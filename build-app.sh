#!/bin/bash
# Build script for React Native Calendar App

echo "Building Android app..."
cd android
./gradlew assembleDebug
echo "APK built successfully at: android/app/build/outputs/apk/debug/app-debug.apk"