# CalendarApp

A React Native calendar application for Android.

## Prerequisites

- Node.js (v22 or later)
- Android SDK with emulator running on Windows
- WSL (Windows Subsystem for Linux)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### Starting Metro Server

Start Metro server in WSL:
```bash
npx react-native start --port 8081 --host 0.0.0.0
```

### Running with Custom ADB

To run the app using the custom adb wrapper:
```bash
./run_android_with_custom_adb.sh
```

Or directly:
```bash
ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk" \
PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH" \
npx react-native run-android --no-packager
```

## App Features

- Basic calendar view using react-native-calendars
- Date selection functionality
- Month navigation
- Week numbers display

## Troubleshooting

### App can't connect to Metro

1. Make sure Metro is running: `npx react-native start --port 8081 --host 0.0.0.0`
2. Set up ADB reverse from Windows (run in Windows PowerShell/CMD):
   ```cmd
   adb reverse tcp:8081 tcp:8081
   ```
3. Reload the app from the dev menu (shake device or press Ctrl+M)

### Build fails with SDK location error

Make sure `android/local.properties` exists with:
```
sdk.dir=/home/shootingsyh/Android/Sdk
```

### App crashes on startup

1. Check that Metro is running
2. Make sure the WSL IP is correct in REACT_NATIVE_PACKAGER_HOSTNAME
3. Try clearing the cache: `npx react-native start --reset-cache`

### npx react-native run-android fails with custom adb

If you encounter issues running `npx react-native run-android`, use one of these approaches:

1. Use the dedicated script:
   ```bash
   ./run_android_with_custom_adb.sh
   ```

2. Set environment variables manually:
   ```bash
   ANDROID_HOME="/mnt/c/Users/shoot/AppData/Local/Android/Sdk" \
   PATH="/mnt/c/Users/shoot/AppData/Local/Android/Sdk/platform-tools:$PATH" \
   npx react-native run-android --no-packager
   ```

3. Use the utility script:
   ```bash
   ./rn.sh run-android
   ```

## Architecture

This app is designed to run with:
- Metro bundler running in WSL
- Android emulator running on Windows
- ADB connection through Windows IP for WSL

