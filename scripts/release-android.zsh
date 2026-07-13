#!/bin/zsh
set -euo pipefail
set +x

ROOT="${0:A:h:h}"
MODE="${1:---build-only}"
REPO="ieduer/bdfz-companion"
BUCKET="blog-images"
R2_PREFIX="apps/bdfz-companion"
PUBLIC_BASE="https://img.bdfz.net/$R2_PREFIX"
SECRETS_FILE="${BDFZ_SECRETS_FILE:-$HOME/.secrets.env}"

if [[ "$MODE" != '--build-only' && "$MODE" != '--publish' ]]; then
  print -u2 'Usage: npm run release:android -- --build-only|--publish'
  exit 2
fi

cd "$ROOT"
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  print -u2 'Release requires a clean committed worktree.'
  exit 1
fi

set -a
set +u
source "$SECRETS_FILE"
set -u
set +a
for name in BDFZ_ANDROID_KEYSTORE_PATH BDFZ_ANDROID_KEY_ALIAS BDFZ_ANDROID_KEYSTORE_PASSWORD BDFZ_ANDROID_KEY_PASSWORD; do
  if [[ -z "${(P)name:-}" ]]; then
    print -u2 "$name is not configured. Run scripts/bootstrap-android-signing.zsh once."
    exit 1
  fi
done

VERSION="$(node -p "require('./app.json').expo.version")"
VERSION_CODE="$(node -p "require('./app.json').expo.android.versionCode")"
TAG="v$VERSION"
APK_NAME="BDFZ-v$VERSION-$VERSION_CODE.apk"
OUTPUT_DIR="$ROOT/dist/releases"
APK_PATH="$OUTPUT_DIR/$APK_NAME"
METADATA_PATH="$OUTPUT_DIR/latest.json"

npm run verify
npx expo prebuild --clean --platform android --no-install
node scripts/configure-android-signing.mjs

(
  cd android
  NODE_ENV=production ./gradlew --no-daemon clean assembleRelease
)

mkdir -p "$OUTPUT_DIR"
cp android/app/build/outputs/apk/release/app-release.apk "$APK_PATH"

ANDROID_SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
APKSIGNER="$(find "$ANDROID_SDK/build-tools" -maxdepth 2 -type f -name apksigner 2>/dev/null | sort | tail -1)"
if [[ -z "$APKSIGNER" ]]; then
  print -u2 'Android apksigner was not found.'
  exit 1
fi
"$APKSIGNER" verify --verbose --print-certs "$APK_PATH"

SHA256="$(shasum -a 256 "$APK_PATH" | awk '{print $1}')"
RELEASED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
node -e 'const fs=require("fs"); const [file,version,code,sha,date,url,release]=process.argv.slice(1); fs.writeFileSync(file, JSON.stringify({version,versionCode:Number(code),sha256:sha,releasedAt:date,downloadUrl:url,githubRelease:release}, null, 2)+"\n")' \
  "$METADATA_PATH" "$VERSION" "$VERSION_CODE" "$SHA256" "$RELEASED_AT" "$PUBLIC_BASE/latest.apk" "https://github.com/$REPO/releases/tag/$TAG"

print "Built $APK_PATH"
print "SHA-256 $SHA256"
if [[ "$MODE" == '--build-only' ]]; then
  exit 0
fi

for command in gh wrangler; do
  command -v "$command" >/dev/null || { print -u2 "$command is required for publishing"; exit 1; }
done
if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  print -u2 "GitHub release $TAG already exists. Bump the app version before publishing."
  exit 1
fi

gh release create "$TAG" "$APK_PATH" \
  --repo "$REPO" \
  --title "BDFZ $VERSION" \
  --notes "Signed Android release. SHA-256: $SHA256"

wrangler r2 object put "$BUCKET/$R2_PREFIX/releases/$APK_NAME" \
  --file "$APK_PATH" --content-type application/vnd.android.package-archive --remote
wrangler r2 object put "$BUCKET/$R2_PREFIX/latest.apk" \
  --file "$APK_PATH" --content-type application/vnd.android.package-archive --remote
wrangler r2 object put "$BUCKET/$R2_PREFIX/latest.json" \
  --file "$METADATA_PATH" --content-type application/json --remote

print "Published https://github.com/$REPO/releases/tag/$TAG"
print "Published $PUBLIC_BASE/latest.apk"
