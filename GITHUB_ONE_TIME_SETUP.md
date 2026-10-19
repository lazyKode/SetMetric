# SetMetric — install just like Aarti Sangrah

The SetMetric repository has not yet been created in your GitHub account. To keep Aarti Sangrah untouched, first create **a new private repository** named `SetMetric` in the same GitHub account:

https://github.com/new

Choose repository name **SetMetric** and visibility **Private**. Leave "Add a README file" and starter files **unchecked** so the repository starts empty.

Then either:

1. Import the contents of this package (including the hidden `.github` folder) to your new repository using GitHub Desktop, GitKraken, or `git` from Windows; or
2. Return to ChatGPT and say **"I created the SetMetric repository — upload the app"**. With GitHub connected, ChatGPT can place the source files in the new repo.

After the source is on GitHub, open:

https://github.com/lazyKode/SetMetric/actions

Choose **Build SetMetric iPhone and Android Apps** → **Run workflow** → **both**. When both jobs succeed, download the **SetMetric-iPhone-for-Windows** and **SetMetric-Android-APK** artifacts.

**iPhone:** Extract the `.ipa` and sign/install it using Sideloadly on your Windows PC, just as you do with Aarti Sangrah. It is unsigned until then. A free Apple ID usually needs refreshing after seven days.

**Android:** Extract and install `SetMetric-Android.apk`. For updates that preserve workout data, first create and securely store a permanent signing key using `scripts/setup-android-keystore.ps1` and set the four Android repository secrets described in `INSTALL_FROM_WINDOWS.md`. A no-secrets APK uses a fresh test key each run and is **not update-compatible**.

This package contains source and CI instructions, not a prebuilt APK or IPA. An actual hosted GitHub build must pass before those packages exist.
