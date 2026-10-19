# SetMetric

**Intelligent Strength Training** — a cross-platform, offline-first bodybuilding schedule generator and workout logger for iOS and Android.

This is an independent app built with Expo SDK 57, React Native and TypeScript. It is inspired by the *type of functionality* in popular workout planners such as Alpha Progression; it does **not** use that app's code, imagery, branding, licensed exercise videos or data.

## What works in this version (v1)

- Personalized weekly workout generation for hypertrophy, strength and recomposition.
- Beginner, intermediate and advanced experience levels.
- 2–7 selected weekly days. For 7 days, Sunday is deliberately an active recovery day.
- Auto-select / Full Body / Upper-Lower / Push-Pull-Legs / Body-Part splits.
- Full gym, dumbbells/bodyweight, or band/bodyweight equipment filters.
- 30–90 minutes **per session**, 1–3 sessions per day, balanced or high-volume options.
- Up to 3 priority muscle groups and optional armwrestling-specific grip drills.
- Exercise library with technique cues, muscle filters, text search, and custom exercises.
- Plan-day details and exercise replacements, additions, removals, rep and set adjustment.
- Start/resume individual sessions, log each set's load, reps and reps in reserve (RIR).
- Workout rest timer while the app remains active.
- Progressive overload guidance based on the last saved set for each movement (conservative heuristic, not automatic coaching).
- Local offline persistence of the plan, training profile, active workout and session history.
- Six-week training-volume/consistency graphs, estimated one-rep maxima, workout history.
- kg/lb preference with conversion of previously logged weights.
- Shareable **CSV text** through the device share sheet.
- Dark design, custom icon, iOS/Android app configuration.

**Not yet included:** exercise demonstration videos, AI chat, authentication, cross-device synchronization, HealthKit/Health Connect integration, notifications, background rest timer, plate calculator, PDF plans, actual CSV-file export, subscriptions, or live individualized coaching. Those would require additional development. The app does not diagnose injuries or verify safe loading.

## Install on iPhone and Android from Windows (Aarti Sangrah-style)

**Recommended:** follow [`INSTALL_FROM_WINDOWS.md`](INSTALL_FROM_WINDOWS.md) to use GitHub Actions and download the installable IPA/APK just as you do for Aarti Sangrah. You do **not** need to run Expo on your phone or own a Mac. Sideloadly re-signs the unsigned iPhone IPA with your own Apple ID. For reliable Android updates, set up your private signing key once.

## Run on a Windows PC or Mac

Prerequisites: Node.js **22.13+**, npm, a phone or simulator, and internet access for installing dependencies. (Expo SDK 57 uses React Native 0.86.)

```powershell
cd SetMetric
npm install
npx expo install --fix
npm start
```

Use Expo Go to scan the QR code if its installed version supports SDK 57. Otherwise create and install an Expo development build (see below). Your phone and computer should generally be on the same network; `npx expo start --tunnel` can help with network restrictions.

On a supported Android emulator you can also run `npm run android`; on a Mac with a supported iOS simulator you can run `npm run ios`. Running `npm run ios` requires macOS, but **cloud iOS builds can be requested from Windows**.

## Android APK from Windows, using EAS

1. Create a free Expo account at <https://expo.dev/>, then log in:

```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

2. Follow the displayed cloud build URL and install the resulting `.apk` on your Android phone. Expo's cloud build/usage policies may apply.

> In `eas.json`, `preview` is already configured with `android.buildType=apk`. The `production` profile is for a Play Store `.aab` after you set up your developer credentials.

## iOS from Windows, using EAS

You cannot compile a native iOS binary locally on Windows. Expo's **EAS Build** service can build iOS in the cloud.

- For iPhone internal distribution: `eas build --platform ios --profile preview`, with an Apple Developer membership, device registration and correct provisioning.
- For App Store / TestFlight: `eas build --platform ios --profile production` followed by Apple App Store Connect/TestFlight submission.
- A free Apple personal team is not sufficient for normal EAS cloud distribution or TestFlight. Expo Go can be used for development if compatible, without app publication.

Ensure the current Apple bundle identifier `com.setmetric.gym` and Android package `com.setmetric.gym` are suitable for your ownership/registration; update them before publishing.

## Check the project

```powershell
npm run check
npm test
```

`npm test` compiles the pure TypeScript workout generator and runs Node built-in tests across **270 combinations** of schedules, splits, equipment and daily sessions. `npm run check` validates the React Native app's TypeScript after dependencies have been installed.

## Architecture

```text
App.tsx             Navigation, plan editing, session logging, progress & UI
src/types.ts        Type definitions and settings
src/exercises.ts    Exercise catalog, equipment rules & technique descriptions
src/generator.ts    Split templates, schedule generator, progression & chart logic
src/storage.ts      AsyncStorage persistence
src/ui.tsx          Shared dark theme and controls
assets/             Icon, adaptive icon and splash artwork
```

There is no backend or network upload of workout history. If you delete the app, the locally stored training history may be lost. Share your CSV data periodically and keep device backups.

## Training safety and interpretation

Training volume is a **starting template**, not a prescription. Multi-session/high-volume settings can produce an extremely demanding schedule and should be used only when appropriate to recovery and experience. For 7 selected days, Sunday is designated recovery to avoid prescribing seven high-load sessions. Load suggestions are deliberately simple and should always be overridden by technique, fatigue and symptoms. Choose pain-free movements and consult an appropriate professional for known injuries or medical restrictions.

## Branding note

*SetMetric* is a proposed working product name. A web search did not surface an obvious identical fitness listing, but that does not establish trademark, domain or app-store availability. Perform appropriate clearance checks before selling or publicly distributing the app.
