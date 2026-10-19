# SetMetric — install on iPhone and Android

This build uses the same GitHub Actions → iPhone IPA/Android APK approach as your Aarti Sangrah project.

Open **INSTALL_FROM_WINDOWS.md** for Windows + GitHub + Sideloadly steps.

**Do not merge these files into Aarti Sangrah.** Create a separate repository; push the contents of this SetMetric directory, including hidden `.github` folder.

In GitHub > Actions > **Build SetMetric iPhone and Android Apps** > Run workflow > both.

Artifacts: `SetMetric-iPhone-for-Windows` (unsigned IPA for Sideloadly) and `SetMetric-Android-APK` (Android installer).

For reliable Android updates with workout history intact, do the one-time Android signing secrets setup before the first install.
