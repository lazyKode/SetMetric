# SetMetric 1.4 · Simple Plan Edition

- Quick 4-screen setup: **Goal → Your fitness → Weekly availability → Muscle focus**.
- Preselected sensible defaults; numeric measurements and health/sport details are optional expandable fields.
- Pick **all 10 muscle groups** with one tap, or any combination. Unselected muscles are not excluded from balanced training.
- New streamlined **Today**, **My Week**, **Progress** navigation, redesigned summary and readable weekly cards.
- Separate strength, muscle, fitness, sport, and fat-loss goal recommendations, with optional short cardio.
- Evidence methodology and limitations documented in `TRAINING_RESEARCH_AND_RULES.md`.
- Questionnaire answers saved so you do not have to reenter everything to update your schedule.
- Unit tests cover 270 training combinations, all-focus handling, novice/sport day recommendations and goal-specific starting techniques.

## How to install

1. Upload the **contents of this project** into your SetMetric GitHub repository (keep the `.github` directory).
2. Go to **Actions → Build SetMetric iPhone and Android Apps → Run workflow → both**.
3. iPhone: download `SetMetric-iPhone-for-Windows` and use Sideloadly on Windows to sign/install the unsigned IPA. Android: download `SetMetric-Android-APK` and install the APK.
4. This ZIP is **source**, not a compiled binary. Native builds must succeed before installation. Keep your existing Android signing keystore to preserve workout data across updates.

## Unverified

Native device builds and end-to-end phone usability have not been rechecked in this local execution environment. These require GitHub Actions or the Android/iOS build toolchains.
