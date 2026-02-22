# CalendarApp

A React Native calendar application with comprehensive schedule management.

## Prerequisites

- Node.js (v22 or later)
- Android SDK with platform-tools (adb should be available in PATH)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### Starting Metro Server

```bash
npx react-native start
```

### Run on Android

Ensure an Android emulator or device is connected, then run:
```bash
npx react-native run-android
```

## App Features

- Basic calendar view using react-native-calendars
- Date selection functionality
- Month navigation
- Week numbers display
- Complete schedule management system (new feature)

## Schedule Management Features

This app now includes a complete schedule management system with:

### Core Features:
- Create, read, update, delete (CRUD) schedules
- One-time and recurring schedule support
- Local data persistence
- Reminder notifications for upcoming schedules
- Integration with Google/Apple calendars
- Date and time selection with recurrence patterns

### Usage:
1. Tap "Schedule" button in main app to access schedule management
2. Tap on any date to create a new schedule
3. Set recurrence patterns for regular events
4. Configure reminders for upcoming schedules
5. Sync with device calendars

## Troubleshooting

### App can't connect to Metro

1. Make sure Metro is running: `npx react-native start`
2. Set up ADB reverse: `adb reverse tcp:8081 tcp:8081`
3. Reload the app from the dev menu (shake device or press Ctrl+M)

### Build fails with SDK location error

Make sure `android/local.properties` exists with the correct SDK path for your system.

### App crashes on startup

1. Check that Metro is running
2. Try clearing the cache: `npx react-native start --reset-cache`

### Standard build troubleshooting

If `npx react-native run-android` fails:

1. Verify device/emulator connection: `adb devices`
2. Clean and rebuild: `cd android && ./gradlew clean assembleDebug`
3. Metro reachable: Use `adb reverse tcp:8081 tcp:8081` if needed


