#!/bin/zsh
set -euo pipefail
set +x

SECRETS_FILE="${BDFZ_SECRETS_FILE:-$HOME/.secrets.env}"
KEYSTORE_PATH="${BDFZ_ANDROID_KEYSTORE_PATH:-$HOME/.android/bdfz-companion-release.keystore}"
KEY_ALIAS="${BDFZ_ANDROID_KEY_ALIAS:-bdfz-release}"

if [[ -e "$KEYSTORE_PATH" ]]; then
  print -u2 "Refusing to overwrite existing keystore: $KEYSTORE_PATH"
  exit 1
fi
if [[ -f "$SECRETS_FILE" ]] && grep -q '^export BDFZ_ANDROID_' "$SECRETS_FILE"; then
  print -u2 "BDFZ Android signing entries already exist in $SECRETS_FILE"
  exit 1
fi

mkdir -p "${KEYSTORE_PATH:h}"
touch "$SECRETS_FILE"
chmod 600 "$SECRETS_FILE"

PASSWORD="$(openssl rand -hex 32)"
keytool -genkeypair \
  -keystore "$KEYSTORE_PATH" \
  -storetype PKCS12 \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -dname 'CN=BDFZ Companion, OU=Mobile, O=ieduer, C=CN' \
  -storepass "$PASSWORD" \
  -keypass "$PASSWORD" >/dev/null
chmod 600 "$KEYSTORE_PATH"

{
  printf '\n# BDFZ Companion Android release signing\n'
  printf 'export BDFZ_ANDROID_KEYSTORE_PATH=%q\n' "$KEYSTORE_PATH"
  printf 'export BDFZ_ANDROID_KEY_ALIAS=%q\n' "$KEY_ALIAS"
  printf 'export BDFZ_ANDROID_KEYSTORE_PASSWORD=%q\n' "$PASSWORD"
  printf 'export BDFZ_ANDROID_KEY_PASSWORD=%q\n' "$PASSWORD"
} >> "$SECRETS_FILE"

unset PASSWORD
print "Created the BDFZ Companion release keystore and saved references in $SECRETS_FILE"
