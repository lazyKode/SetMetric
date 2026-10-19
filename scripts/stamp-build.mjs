// CI-only version bump; run before `expo prebuild`, keep bundle identifiers fixed.
import fs from 'node:fs';
const file = new URL('../app.json', import.meta.url);
const root = JSON.parse(fs.readFileSync(file, 'utf8'));
const run = Number.parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
if (!Number.isSafeInteger(run) || run < 1 || run > 100000000) {
  throw new Error('Invalid GITHUB_RUN_NUMBER');
}
root.expo.android ??= {};
root.expo.ios ??= {};
root.expo.android.versionCode = 1000 + run;
root.expo.ios.buildNumber = String(1000 + run);
fs.writeFileSync(file, `${JSON.stringify(root, null, 2)}\n`);
console.log(`SetMetric CI build ${1000 + run}`);
