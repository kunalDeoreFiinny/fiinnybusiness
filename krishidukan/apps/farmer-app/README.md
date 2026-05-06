# KrishiDukan Farmer App

Cross-platform mobile app (Android + iOS) built with Expo SDK 51 + React Native 0.74.

## Prerequisites

- Node 18+ and pnpm
- For Android: Android Studio + Android SDK (or Expo Go on a physical device)
- For iOS: macOS + Xcode (or Expo Go on a physical device)
- Expo account (`npx expo login`) for EAS Build
- EAS CLI: `pnpm add -g eas-cli`

## Setup

1. Install workspace dependencies (run once at repo root):
   ```bash
   pnpm install
   ```

2. Fill in `app.json` → `expo.extra.firebase*` fields with your Firebase config.

## Run in dev (Expo Go)

```bash
pnpm --filter @krishidukan/farmer-app start            # opens Metro DevTools
pnpm --filter @krishidukan/farmer-app android          # opens on Android emulator
pnpm --filter @krishidukan/farmer-app ios              # opens on iOS simulator (macOS only)
pnpm --filter @krishidukan/farmer-app web              # opens in browser
```

Scan the QR code with the **Expo Go** app on your phone to test instantly.

## Build native APK / IPA (EAS Build)

```bash
cd apps/farmer-app
eas login                       # one-time
eas build:configure             # links your Expo project
pnpm build:android              # cloud build → APK / AAB
pnpm build:ios                  # cloud build → IPA (requires Apple Developer account)
pnpm build:all                  # builds both platforms
```

## Build native projects locally (advanced)

```bash
pnpm prebuild                   # generates ./android and ./ios native projects
cd android && ./gradlew assembleDebug      # local Android APK
# iOS: open ios/krishidukan-farmer.xcworkspace in Xcode
```

## Build profiles (eas.json)

- **development** — dev client with hot reload, internal distribution
- **preview** — APK/IPA for QA testers, internal distribution
- **production** — AAB/IPA signed for Play Store / App Store

## Phone OTP

Phone-OTP login uses `expo-firebase-recaptcha`. Enable Phone Sign-In in
Firebase Auth console → Sign-in method → Phone, and add your test numbers.

For production native builds, switch to `@react-native-firebase/auth` for
silent OTP verification (no reCAPTCHA modal).
