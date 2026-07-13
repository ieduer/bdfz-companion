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
```

All shared-hub probes must succeed before and after a release.

## 3. Feedback contract check

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
5. Run `npm run verify`, `npm audit --omit=dev`, and the shared-hub probes.
6. Verify the GitHub release APK and fixed R2 APK have the same SHA-256 and signing certificate.

## 6. Backup and restore

Before a release, retain the prior APK hash, Git tag, GitHub release, R2 versioned object, and Worker version. Versioned R2 objects are immutable release evidence; only the `latest.apk` and `latest.json` pointers advance.

## 7. Rollback

- App: reinstall the previous versioned APK. Android requires the same signing key.
- GitHub: mark the faulty release as a prerelease or delete it, then publish a higher version.
- R2: copy the prior versioned APK back to `apps/bdfz-companion/latest.apk` and restore its metadata.
- User Center Worker: use the documented Worker version rollback command from the private operations runbook.

## 8. Release command

After bumping both `expo.version` and `expo.android.versionCode`, and committing a clean source tree:

```bash
npm run release:android -- --publish
```

The script verifies the source, regenerates Android, injects signing configuration using environment variable names only, builds and verifies the APK, creates the GitHub release, then uploads the versioned and fixed R2 objects.

The public APK contains `arm64-v8a` and `armeabi-v7a`; x86/x86_64 are development-emulator targets and are intentionally excluded from the release artifact.
