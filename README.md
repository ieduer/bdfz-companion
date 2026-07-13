# BDFZ Companion

BDFZ Companion is the Android/iOS shell for BDFZ learning, reading, community, tools, User Center session sync, and in-app feedback. It is built with Expo Router and React Native.

## Download

- Latest Android APK: <https://img.bdfz.net/apps/bdfz-companion/latest.apk>
- Release metadata: <https://img.bdfz.net/apps/bdfz-companion/latest.json>
- Versioned builds: [GitHub Releases](https://github.com/ieduer/bdfz-companion/releases)

## Local development

Requirements: Node.js, npm, JDK 17, Android SDK/ADB, and an Android device or emulator.

```bash
npm ci
npm run verify
npm run android
```

Book extraction looks for sibling reader repositories next to this checkout. Override that workspace with `BDFZ_WORKSPACE_ROOT=<PATH>`.

## Security model

- Session values are stored with `expo-secure-store` and are never printed.
- Only structurally valid User Center sessions from `my.bdfz.net` or `uc.bdfz.net` may cross the WebView bridge.
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

For every release, bump `expo.version` and `expo.android.versionCode`, commit the source, then run:

```bash
npm run release:android -- --publish
```

This creates a signed GitHub Release and uploads the same APK to the versioned R2 key and the fixed `latest.apk` URL. Run `--build-only` to build and verify without external writes.

## License

[MIT](LICENSE)
