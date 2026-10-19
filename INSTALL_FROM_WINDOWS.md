# Install SetMetric just like Aarti Sangrah (Windows → iPhone + Android)

This repository includes a GitHub Actions workflow named **Build SetMetric iPhone and Android Apps**. It builds:

- **`SetMetric-iPhone-for-Windows`** artifact → `SetMetric-iPhone-unsigned.ipa`, for installing with **Sideloadly on Windows**.
- **`SetMetric-Android-APK`** artifact → `SetMetric-Android.apk`, install directly on Android.

These are native app packages with the JavaScript bundle embedded, **not Expo Go projects**. Neither requires a Mac on your desk. The GitHub iOS build uses a hosted Mac. The iPhone IPA is **unsigned** until Sideloadly signs it on Windows using your Apple ID.

## First time only — put SetMetric in its own GitHub repository

1. Extract the **SetMetric-GitHub-Installable-v1.2.zip** file on your Windows computer.
2. Create a **new private GitHub repository** for SetMetric; **do not copy these files into the Aarti Sangrah repository**.
3. Open the extracted `SetMetric` folder. Copy **everything inside**, including the hidden `.github` directory and its `.github/workflows/build-iphone-android.yml` file, into the root of the new repository. On Windows, File Explorer > View > Show > Hidden items reveals `.github` when needed.
4. Commit and push the files using GitHub Desktop or GitKraken, whichever you use. Do **not** upload the enclosing `SetMetric` folder as a nested folder; the repository root must contain `package.json`, `app.json`, and `.github`.
5. On GitHub, open the new repository > **Actions** and choose **Build SetMetric iPhone and Android Apps** > **Run workflow** > choose **both** > **Run workflow**.
6. Once both jobs finish successfully, open the workflow run page and download the two artifacts under **Artifacts**. Unzip each artifact once to get the IPA and APK.

The initial Android APK is signed and installable even without signing secrets; **however**, without a permanent keystore it uses a different temporary signing certificate on each run. To reliably install future APK updates over the old app **without losing your saved workout history**, configure Android signing before depending on local data. See the signing section below.

## Install on your iPhone — same as Aarti Sangrah

1. Connect your iPhone to your Windows computer with USB; unlock it and tap **Trust** if prompted.
2. Open **Sideloadly** on Windows (the same application you use for Aarti Sangrah).
3. Drag `SetMetric-iPhone-unsigned.ipa` into Sideloadly and use the same personal Apple ID you already use for sideloading.
4. Select your iPhone and click **Start**. Sideloadly signs and installs SetMetric on your iPhone. Follow any requested iOS trust/Developer Mode prompts.
5. After installing, SetMetric appears as its own app icon, separate from Aarti Sangrah.

**Your free Apple personal team is supported via Sideloadly**, not via App Store/TestFlight distribution. The free signing period is typically **7 days**, so you need to refresh/re-sideload before expiry. The free Apple ID also has a **three actively sideloaded apps** limit, which may matter alongside Aarti Sangrah and Duck. Sideloadly offers automatic refresh when your Windows PC is available. Always sign updates using the **same Apple ID and same app bundle ID** to preserve locally saved workout history; avoid deleting the old app.

## Install on Android

1. Download the **SetMetric-Android-APK** artifact and extract `SetMetric-Android.apk`.
2. Transfer it to your Android device, tap the APK file, and allow **Install unknown apps** for your chosen installer when Android asks.
3. Open SetMetric from your phone's home screen.

**Important:** If you plan to install repeated Android updates and keep workout data, configure your own permanent signing key (below). If you see *App not installed* after a later update, the most likely cause is that the signing certificate changed. Uninstalling would delete locally stored SetMetric data; back up before doing so.

## Android updates that preserve training history — one-time signing setup

Android requires all updates of the same package to be signed by **the same private key**. The GitHub-hosted runner's default test key cannot be relied upon across builds. The workflow supports four GitHub repository secrets to make your signing persistent:

| GitHub Actions repository secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 representation of your **private** Android `.jks` keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Password you set for the keystore |
| `ANDROID_KEY_ALIAS` | `setmetric` |
| `ANDROID_KEY_PASSWORD` | The key password (often the same as the keystore password for PKCS12) |

To create the key on your Windows PC, install JDK 17+ if `keytool` is not available, and in PowerShell run:

```powershell
cd SetMetric
powershell -ExecutionPolicy Bypass -File .\scripts\setup-android-keystore.ps1
```

The script prompts you to choose a signing password, creates `scripts/setmetric-release.jks`, and copies its Base64 to your clipboard. Open your new GitHub repo > **Settings > Secrets and variables > Actions > New repository secret** and create those four secrets. Paste the copied Base64 into `ANDROID_KEYSTORE_BASE64`. Save the `.jks` and passwords in a private backup. **Do not put `.jks` in the repository or post it in chat.**

**Set the secrets before the first Android installation if you want seamless future updates.** Once you have installed an APK signed with the test key, a new separately signed version cannot upgrade it without uninstalling.

The app identifier stays `com.setmetric.gym`. Do not change that identifier or the signing key after users start logging workouts. This manual CI signing procedure is for direct personal APK distribution, not public Play Store release automation.

## Build only one platform

Actions > Build SetMetric iPhone and Android Apps > Run workflow > platform:
- `both` — iPhone IPA **and** Android APK.
- `iphone` — unsigned IPA only.
- `android` — APK only.

Each GitHub Actions run increments the internal iOS build number and Android `versionCode` automatically. There is no Expo account, EAS subscription, Mac at home, Apple paid developer membership, or Google Play listing required for this installation process.

## If a workflow fails

- Open the failed workflow run, select **iPhone IPA (Windows / Sideloadly)** or **Android APK**, and expand the red failed step to read the actual error. The iPhone job also uploads `SetMetric-iPhone-build-log` if Xcode compilation fails.
- Verify `.github/workflows/build-iphone-android.yml` sits in the **repository root**. GitHub does not recognize Actions workflows hidden in a nested project folder.
- **iOS:** The IPA is unsigned on purpose. You must install it with Sideloadly, not tap it directly on an iPhone. The hosted build needs a working macOS GitHub Actions runner and Xcode.
- **Android:** `app-release.apk` embeds the JS bundle. A debug APK from ordinary Gradle `assembleDebug` would normally require a development server; this workflow intentionally uses `assembleRelease`.
- **Android signing:** If all four signing secrets are absent, the workflow creates a temporary test keystore so the release APK is installable (with warning). All four secrets are required for stable signing.
- **GitHub limits:** Private-repo macOS Actions minutes can be metered or quota-limited. GitHub may change hosted runner software or artifact limits.

## Updating SetMetric later

Make changes in this **same** SetMetric GitHub repository; push; use **Actions > Build SetMetric iPhone and Android Apps > Run workflow** again. Download fresh artifacts. Keep SetMetric's bundle/package ID and Apple ID / Android signing key unchanged so you can install over the existing app without deliberately erasing locally saved data. For important training history, keep your own backups: this v1 app has no cloud synchronization.
