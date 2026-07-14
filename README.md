# BDFZ Companion

BDFZ Companion is the Android/iOS shell for BDFZ learning, reading, community, tools, User Center session sync, and in-app feedback. It is built with Expo Router and React Native.

## Download

- Latest Android APK: <https://img.bdfz.net/apps/bdfz-companion/latest.apk>
- Release metadata: <https://img.bdfz.net/apps/bdfz-companion/latest.json>
- Versioned builds: [GitHub Releases](https://github.com/ieduer/bdfz-companion/releases)

The Android app checks the R2 metadata on startup and when returning to the foreground, at most once every six hours. Users can also run a manual check from **Me → Check for updates**; downloads always open the fixed R2 APK URL in the system browser.

## Local development

Requirements: Node.js, npm, JDK 17, Android SDK/ADB, and an Android device or emulator.

```bash
npm ci
npm run verify
npm run android
```

Book extraction looks for sibling reader repositories next to this checkout. Override that workspace with `BDFZ_WORKSPACE_ROOT=<PATH>`.

## Security model

- Native session values are stored with `expo-secure-store` and are never printed or exposed through page JavaScript.
- User Center keeps its browser cookie `HttpOnly`; login crosses into the app through a 90-second, one-time handoff code that is exchanged by the native client.
- Embedded navigation is limited to trusted BDFZ/RDFZ HTTPS hosts.
- HTTP and mixed content are blocked in WebView. The one legacy HTTP cinema entry opens externally without a session bridge.
- The app does not request notification permission or collect a device push token.
- Release APKs require a private, non-repository signing key.

See [SECURITY.md](SECURITY.md) and [the verification standard](docs/verification_standard.md).

## Android release

One-time signing setup on the trusted release Mac:

```bash
zsh scripts/bootstrap-android-signing.zsh
```

For every release, bump the matching version in `app.json`, `package.json`, and `package-lock.json`, increment `expo.android.versionCode`, commit the source, then run:

```bash
npm run release:android -- --publish
```

This creates signed `arm64-v8a` and legacy `armeabi-v7a` APKs, publishes both in the GitHub Release and R2, and advances the fixed `latest.apk` URL to the arm64 build. Versioned artifacts use a short-lived `release-assets-*` Git branch and a temporary, token-protected R2 multipart Worker; the fixed APK is uploaded from the locally verified artifact, and the workflow removes the temporary branch and Worker after verified assembly. No Cloudflare credential is copied to GitHub. Run `--build-only` to build and verify without external writes.

The release script refuses to build when the three source version fields differ.

The fixed latest URL serves `arm64-v8a`; the versioned legacy APK serves `armeabi-v7a`. Use a development build for x86/x86_64 emulators.

## License

[MIT](LICENSE)
