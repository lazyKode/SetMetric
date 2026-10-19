# SetMetric v1.3.1 — Simplified fitness assessment

## What is included

Full React Native/Expo source for iOS and Android, including the new six-step
onboarding questionnaire, workout schedule generator, workout logging,
assets, and GitHub Actions build workflow.

## Build status

The source includes a fix for TypeScript TS2769 in src/assessment.tsx:
percentage widths must use the React Native typed percentage format.
The Android SDK setup action is v4, avoiding the deprecated `tools` SDK
package installation from the v3 action.

Core generator tests (four tests, 270 profile combinations) and TypeScript
syntax parsing passed during preparation. The iOS and Android native builds
for this redesigned version have not yet been run to completion.

The separate SetMetric-iPhone-for-Windows.zip and SetMetric-Android-APK.zip
provided in the conversation are installable packages from an earlier
successful 1.2-era GitHub build. They do NOT contain the new questionnaire.

## Windows installation after GitHub builds succeed

1. Extract this ZIP and copy all contents of the SetMetric folder, including
   .github, into your cloned SetMetric repository.
2. Commit and push using GitHub Desktop.
3. Open your repository's Actions tab. Run the Build SetMetric iPhone and
   Android Apps workflow with platform=both.
4. Download SetMetric-iPhone-for-Windows and SetMetric-Android-APK artifacts.
5. iPhone: extract the unsigned IPA and sign/install via Sideloadly on Windows.
   Android: extract and install the signed APK.

Before installing a replacement Android APK, note that the default temporary
signing certificate changes with each CI run. To update in-place, configure
a permanent keystore using the included documentation. Back up any locally
stored workout data before uninstalling the old app.

## Current limitations

The questionnaire records current/future sports, body measurements, age,
gender, stamina and strength, but only some of these inputs drive the simple
first-pass training recommendation; comprehensive sport-specific periodization
and clinical fitness/medical screening are not included.
