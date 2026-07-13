#!/bin/zsh
set -euo pipefail
set +x

ROOT="${0:A:h:h}"
CONFIG="$ROOT/ops/r2-multipart-upload/wrangler.jsonc"
SECRETS_FILE="${BDFZ_SECRETS_FILE:-$HOME/.secrets.env}"
REPO='ieduer/bdfz-companion'

if (( $# < 5 || ($# - 2) % 3 != 0 )); then
  print -u2 'Usage: scripts/import-r2-from-github.zsh <tag> <manifest> <artifact-name> <r2-key> <content-type> [...]'
  exit 2
fi

TAG="$1"
MANIFEST="$2"
shift 2
if [[ "$TAG" != v<->.<->.<-> || ! -f "$MANIFEST" ]]; then
  print -u2 'Invalid tag or manifest.'
  exit 1
fi

for command in curl jq openssl rg wrangler; do
  command -v "$command" >/dev/null || { print -u2 "$command is required"; exit 1; }
done

set -a
set +u
source "$SECRETS_FILE"
set -u
set +a
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  print -u2 'CLOUDFLARE_API_TOKEN is not configured.'
  exit 1
fi

WORKER_NAME="bdfz-apk-up-$(date +%s)-${RANDOM}"
TEMP_DIR="$(mktemp -d /private/tmp/bdfz-r2-import.XXXXXX)"
TOKEN_FILE="$TEMP_DIR/upload-token"
CURL_CONFIG="$TEMP_DIR/curl.conf"
DEPLOY_LOG="$TEMP_DIR/deploy.log"
WRANGLER_LOG_PATH="$TEMP_DIR/wrangler.log"
export WRANGLER_LOG_PATH
WORKER_CREATED=0

cleanup() {
  local exit_code=$?
  set +e
  if (( WORKER_CREATED )); then
    wrangler delete "$WORKER_NAME" --force >/dev/null 2>&1
  fi
  unset UPLOAD_TOKEN
  rm -rf "$TEMP_DIR"
  exit $exit_code
}
trap cleanup EXIT INT TERM

openssl rand -hex 32 | tr -d '\r\n' > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
UPLOAD_TOKEN="$(<"$TOKEN_FILE")"
printf 'silent\nshow-error\nconnect-timeout = 10\nmax-time = 300\nheader = "Authorization: Bearer %s"\n' "$UPLOAD_TOKEN" > "$CURL_CONFIG"
chmod 600 "$CURL_CONFIG"

wrangler deploy --config "$CONFIG" --name "$WORKER_NAME" --keep-vars | tee "$DEPLOY_LOG"
WORKER_CREATED=1
wrangler secret put UPLOAD_TOKEN --config "$CONFIG" --name "$WORKER_NAME" < "$TOKEN_FILE" >/dev/null
BASE_URL="$(sed $'s/\033\\[[0-9;]*m//g' "$DEPLOY_LOG" | rg -o 'https://[^[:space:]]+\.workers\.dev' | tail -1)"
[[ -n "$BASE_URL" ]] || { print -u2 'Could not determine temporary Worker URL.'; exit 1; }

for attempt in {1..45}; do
  if curl --config "$CURL_CONFIG" "$BASE_URL/health" | jq -e '.ready == true and .authorized == true and .tokenLength == 64' >/dev/null 2>&1; then
    break
  fi
  (( attempt == 45 )) && { print -u2 'Temporary import Worker did not become ready.'; exit 1; }
  sleep 1
done

while (( $# )); do
  ARTIFACT_NAME="$1"
  KEY="$2"
  CONTENT_TYPE="$3"
  shift 3
  [[ "$KEY" == apps/bdfz-companion/* && "$KEY" != *'..'* ]] || { print -u2 "Invalid R2 key: $KEY"; exit 1; }

  ARTIFACT="$(jq -ec --arg name "$ARTIFACT_NAME" '.artifacts[] | select(.name == $name)' "$MANIFEST")"
  EXPECTED_SIZE="$(jq -er '.size' <<< "$ARTIFACT")"
  STAGING_REF="$(jq -er '.stagingRef | select(test("^release-assets-v[0-9]+\\.[0-9]+\\.[0-9]+-[0-9]+$"))' "$MANIFEST")"
  SOURCE="$(jq -r --arg ref "$STAGING_REF" --arg repo "$REPO" '"https://raw.githubusercontent.com/\($repo)/\($ref)/\(.path)"' <<< "$ARTIFACT")"
  IMPORT_BODY="$(jq -nc --arg key "$KEY" --arg contentType "$CONTENT_TYPE" --arg source "$SOURCE" '{key:$key,contentType:$contentType,source:$source}')"
  IMPORT_RESPONSE="$(curl --config "$CURL_CONFIG" -H 'content-type: application/json' --data "$IMPORT_BODY" "$BASE_URL/import")"
  if ! jq -e '.size and .importedSize' <<< "$IMPORT_RESPONSE" >/dev/null; then
    if jq -e . <<< "$IMPORT_RESPONSE" >/dev/null 2>&1; then
      IMPORT_ERROR="$(jq -r '.error // "unknown error"' <<< "$IMPORT_RESPONSE")"
    else
      IMPORT_ERROR="$(print -r -- "$IMPORT_RESPONSE" | tr '\r\n' ' ' | cut -c1-300)"
    fi
    print -u2 "Import failed for $KEY: $IMPORT_ERROR"
    exit 1
  fi
  REMOTE_SIZE="$(jq -er '.size' <<< "$IMPORT_RESPONSE")"
  IMPORTED_SIZE="$(jq -er '.importedSize' <<< "$IMPORT_RESPONSE")"
  if [[ "$REMOTE_SIZE" != "$EXPECTED_SIZE" || "$IMPORTED_SIZE" != "$EXPECTED_SIZE" ]]; then
    print -u2 "Size mismatch for $KEY: expected=$EXPECTED_SIZE remote=$REMOTE_SIZE imported=$IMPORTED_SIZE"
    exit 1
  fi
  print "Imported $KEY ($REMOTE_SIZE bytes)"
done
