# BDFZ Companion Verification Standard

Last verified: 2026-07-12 PDT

## 1. Source of truth

- App source: this repository
- Android package: `net.bdfz.companion`
- Central feedback API: `POST https://my.bdfz.net/api/feedback`
- Latest APK: `https://img.bdfz.net/apps/bdfz-companion/latest.apk`
- Version metadata: `https://img.bdfz.net/apps/bdfz-companion/latest.json`

Telegram credentials remain server-side in User Center's managed secret bindings. Never embed a bot token, chat ID, User Center session, release keystore, or signing password in the APK or repository.

## 2. Health probe

```bash
curl -sSI https://my.bdfz.net/site-auth.js
curl -sS https://my.bdfz.net/api/session | jq '{authenticated}'
curl -sS https://nav.bdfz.net/sites.json | jq 'type'
curl -sSI https://img.bdfz.net/20250503004.webp
curl -sS https://img.bdfz.net/apps/bdfz-companion/latest.json | jq '{version, versionCode, abi, sha256, downloadUrl}'
curl -sSI https://img.bdfz.net/apps/bdfz-companion/latest.apk
```

All shared-hub probes must succeed before and after a release.

## 3. Update and feedback contract checks

`latest.json` must contain a three-part numeric version, positive integer `versionCode`, `arm64-v8a` ABI, lowercase SHA-256, release timestamp, and the exact fixed download URL `https://img.bdfz.net/apps/bdfz-companion/latest.apk`. The app rejects malformed metadata and never opens a download URL supplied by another host.

On Android, the app checks this metadata at launch and on foreground activation, with a six-hour in-process interval, and exposes a manual check under Me. Automatic network failures stay silent; the manual check reports them without exposing response bodies.

The app sends `siteKey=bdfz-companion`, category, severity, title, description, optional contact, and non-identifying app/platform context. A successful response contains `ok`, `stored`, a feedback ID, and the server-side Telegram delivery status.

The API accepts authenticated and guest submissions and rate-limits repeated submissions. Do not use a real write probe unless an end-to-end test is explicitly in scope; do not publish feedback contents or identifiers.

## 4. Build and install

```bash
npm ci
npm run verify
npm run release:android -- --build-only
adb -s <DEVICE_ID> install -r dist/releases/<APK_FILE>
adb -s <DEVICE_ID> shell am force-stop net.bdfz.companion
adb -s <DEVICE_ID> shell am start -W -n net.bdfz.companion/.MainActivity
```

The release build must use the private BDFZ release keystore. A debug-signed APK is never publishable.

## 5. Dependency regression

1. Launch the installed APK and confirm Home, Learn, Community, Tools, and Me remain reachable.
2. Open Me -> `意見反饋` and verify the form has no horizontal overflow.
3. Open `連接用戶中心`, log in, accept the success dialog, return to Me, and confirm the page changes from guest to the authenticated profile. Confirm no token appears in page JavaScript or logs.
4. Confirm an untrusted deep-link URL is blocked and the HTTP cinema entry opens only in the system browser.
5. Open Me -> `檢查更新`, confirm the installed version/build match the APK manifest, and confirm `重新下載` opens the fixed R2 APK URL in the system browser.
6. Run `npm run verify`, `npm audit --omit=dev`, and the shared-hub probes.
7. Verify the GitHub release APK and fixed R2 APK have the same SHA-256 and signing certificate.

## 6. Backup and restore

Before a release, retain the prior APK hash, Git tag, GitHub release, R2 versioned object, and Worker version. Versioned R2 objects are immutable release evidence; only the `latest.apk` and `latest.json` pointers advance.

## 7. Rollback

- App: reinstall the previous versioned APK. Android requires the same signing key.
- GitHub: mark the faulty release as a prerelease or delete it, then publish a higher version.
- R2: copy the prior versioned APK back to `apps/bdfz-companion/latest.apk` and restore its metadata.
- User Center Worker: use the documented Worker version rollback command from the private operations runbook.

## 8. Release command

After keeping `app.json`, `package.json`, and `package-lock.json` versions identical, incrementing `expo.android.versionCode`, and committing a clean source tree:

```bash
npm run release:android -- --publish
```

The script verifies the source, regenerates Android, injects signing configuration using environment variable names only, builds and verifies both APKs, creates the GitHub release, stages bounded chunks on a temporary Git branch, imports versioned/fixed R2 objects through a temporary authenticated multipart Worker, assembles Release assets in GitHub Actions, then removes the temporary branch and Worker.

The fixed public APK contains `arm64-v8a`; a separately signed versioned legacy APK contains `armeabi-v7a`. x86/x86_64 are development-emulator targets and are intentionally excluded from public release artifacts.
