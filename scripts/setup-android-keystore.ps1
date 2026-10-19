# One-time local setup on Windows. Java 17+ (keytool) required.
# DO NOT upload this key to GitHub. Only the Base64 value goes into Actions Secrets.
$ErrorActionPreference = 'Stop'
$keystore = Join-Path $PSScriptRoot 'setmetric-release.jks'
if (Test-Path $keystore) {
    throw "Keystore already exists: $keystore. Keep this original! Replacing it prevents future Android APK updates."
}
$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
    throw "Java keytool not found. Install JDK 17, restart PowerShell, and run this script again."
}
Write-Host "Create a private Android signing key for SetMetric. Save its password in your password manager."
Write-Host "Use the same password for both the keystore and key if prompted."
& keytool -genkeypair -v -storetype PKCS12 -keystore $keystore -alias setmetric -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=SetMetric, O=Personal App'
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $keystore)) {
    throw "Key generation failed."
}
[Convert]::ToBase64String([IO.File]::ReadAllBytes($keystore)) | Set-Clipboard
Write-Host ""
Write-Host "Signing keystore generated: $keystore"
Write-Host "Base64 signing key copied to clipboard: paste into GitHub secret ANDROID_KEYSTORE_BASE64."
Write-Host "Also add: ANDROID_KEYSTORE_PASSWORD (your password), ANDROID_KEY_ALIAS = setmetric, ANDROID_KEY_PASSWORD (same password for PKCS12)."
Write-Host "Back up the .jks file and passwords privately. Never commit it to GitHub."
