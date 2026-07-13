# Security and Privacy Review — 2026-07-12

Scope: application source, generated Android configuration, dependency manifests, repository history, WebView/session bridge, network endpoints, feedback client, release signing, and public documentation.

## Remediated findings

### High — arbitrary WebView navigation and session bridge

- Location: `app/webview.tsx`, `services/urlPolicy.ts`, `services/auth.ts`
- Evidence: the prior route accepted an arbitrary URL parameter and attempted to read or inject the User Center session through page JavaScript. Because the production cookie is correctly `HttpOnly`, login could appear successful while the native app remained a guest; weakening the cookie would instead have exposed the session to WebView script.
- Impact: a crafted app link or untrusted navigation could expose or replace session state.
- Remediation: embedded pages are restricted to approved BDFZ/RDFZ HTTPS roots; external HTTPS navigation leaves the WebView; file access, mixed content, extra windows, geolocation, and third-party cookies are disabled. User Center now issues a random 90-second, one-time native handoff code. D1 stores only its HMAC, browser-origin exchange attempts are rejected, and the native client consumes it before saving a newly minted session in SecureStore. Existing native sessions enter BDFZ WebViews through the server-side `/api/session/bridge`, which restores an `HttpOnly` cookie without `document.cookie` injection.
- Status: remediated and covered by `scripts/test-url-policy.mjs`.

### Medium — cleartext service embedded with account bridge

- Location: `constants/sites.ts`, generated Android manifest
- Evidence: the cinema entry used HTTP on port 8765 and Android contained a cleartext exception.
- Impact: network content could be modified in transit while rendered inside the app.
- Remediation: the exception was removed; WebView blocks HTTP and mixed content; this legacy entry opens only in the system browser without session injection.
- Status: remediated. The service itself remains HTTP and should migrate to HTTPS.

### Medium — unused notification permission and device token logging

- Location: former `services/push.ts`, `app/_layout.tsx`
- Evidence: startup requested notification permission and printed the native push token although no server registration or product flow used it.
- Impact: unnecessary device identifier handling and permission prompting.
- Remediation: startup registration, logging code, and notification/device dependencies were removed.
- Status: remediated.

### Medium — public release used debug signing configuration

- Location: generated `android/app/build.gradle`
- Evidence: Expo's generated release build was configured with the Android debug key.
- Impact: a debug-signed public APK cannot provide a trustworthy long-term update identity.
- Remediation: releases now regenerate native code, inject an environment-backed private release signing block, verify the APK signature, and refuse publication from a dirty worktree or duplicate version.
- Status: remediated by the release workflow; signing files and passwords remain outside the repository.

### Low — operator-specific metadata in scripts and verification notes

- Location: `scripts/extract_books.js`, former verification evidence
- Evidence: absolute home paths, a physical-device serial, local screenshot paths, and test feedback identifiers were present.
- Impact: avoidable operator/workstation disclosure in a public repository.
- Remediation: paths are repository-relative or configurable; device identifiers, feedback identifiers, and temporary paths were removed.
- Status: remediated.

### Low — unnecessary generated Android permissions

- Location: `app.json`, generated merged manifest
- Evidence: Expo prebuild declared overlay, vibration, and legacy external-storage permissions although the app does not use those capabilities.
- Impact: unnecessary permission surface and misleading install metadata.
- Remediation: all four permissions are explicitly blocked in the public Expo configuration and checked in the final merged manifest.
- Status: remediated.

## Dependency status

`npm audit` reports no high or critical advisories. Remaining moderate advisories are in the Expo/React Native tooling dependency graph and require upstream-compatible upgrades; automatic major-version remediation was not applied. Recheck on every release with `npm audit --omit=dev` and `npx expo install --check`.

## Residual risk

- Trusted web applications execute JavaScript inside WebView and therefore remain part of the app's security boundary.
- A compromised trusted User Center page could request a short-lived handoff code, but cannot exchange it from browser JavaScript; codes are single-use, expire after 90 seconds, and are stored server-side only as HMAC values.
- The legacy cinema endpoint remains cleartext in the external browser until its operator provides HTTPS.
- The Android signing keystore is a long-lived update identity and must be backed up in the approved secret store; loss prevents compatible updates.
