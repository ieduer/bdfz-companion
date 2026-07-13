#!/bin/zsh
set -euo pipefail
set +x

ROOT="${0:A:h:h}"
REPO_SSH='git@github.com:ieduer/bdfz-companion.git'

if (( $# < 2 )); then
  print -u2 'Usage: scripts/stage-release-apks.zsh <tag> <apk> [...]'
  exit 2
fi

TAG="$1"
shift
if [[ "$TAG" != v<->.<->.<-> ]]; then
  print -u2 "Invalid tag: $TAG"
  exit 1
fi

for command in git jq node; do
  command -v "$command" >/dev/null || { print -u2 "$command is required"; exit 1; }
done

STAGING_REF="release-assets-$TAG-$(date +%s)"
TEMP_DIR="$(mktemp -d /private/tmp/bdfz-gh-stage.XXXXXX)"
STAGING_REPO="$TEMP_DIR/repo"
MANIFEST="$ROOT/dist/releases/parts-manifest.json"
cleanup() { rm -rf "$TEMP_DIR"; }
trap cleanup EXIT INT TERM

mkdir -p "$STAGING_REPO/artifacts"
ARTIFACTS='[]'

for APK in "$@"; do
  if [[ ! -f "$APK" || "${APK:e}" != apk ]]; then
    print -u2 "Invalid APK: $APK"
    exit 1
  fi
  NAME="${APK:t}"
  if [[ ! "$NAME" =~ '^[A-Za-z0-9._-]+$' ]]; then
    print -u2 "Invalid APK name: $NAME"
    exit 1
  fi

  cp "$APK" "$STAGING_REPO/artifacts/$NAME"
  SHA256="$(shasum -a 256 "$APK" | awk '{print $1}')"
  SIZE="$(stat -f '%z' "$APK")"
  ARTIFACTS="$(jq -c \
    --arg name "$NAME" \
    --arg path "artifacts/$NAME" \
    --arg sha256 "$SHA256" \
    --argjson size "$SIZE" \
    '. + [{name:$name,path:$path,sha256:$sha256,size:$size}]' <<< "$ARTIFACTS")"
done

node -e 'const fs=require("fs"); const [file,tag,stagingRef,artifacts]=process.argv.slice(1); fs.writeFileSync(file, JSON.stringify({schemaVersion:1,tag,stagingRef,artifacts:JSON.parse(artifacts)}, null, 2)+"\n")' \
  "$STAGING_REPO/parts-manifest.json" "$TAG" "$STAGING_REF" "$ARTIFACTS"

(
  cd "$STAGING_REPO"
  git init --initial-branch="$STAGING_REF"
  git config user.name 'BDFZ Release Automation'
  git config user.email 'release@bdfz.net'
  git add artifacts parts-manifest.json
  git commit -m "stage $TAG release assets"
  git remote add origin "$REPO_SSH"
  git push origin "HEAD:refs/heads/$STAGING_REF"
)

cp "$STAGING_REPO/parts-manifest.json" "$MANIFEST"
print "$MANIFEST"
