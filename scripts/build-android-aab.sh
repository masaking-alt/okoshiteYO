#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"

if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "ERROR: android/ ディレクトリが見つかりません: $ANDROID_DIR" >&2
  exit 1
fi

cd "$ANDROID_DIR"

GRADLE_ARGS=(":app:bundleRelease")

# build.gradle の release signingConfigs は Gradle property を見ています（findProperty）。
# ローカルで keystore を使って署名したい場合は、環境変数から -P に変換して渡します。
if [[ -n "${OKOSHITEYO_UPLOAD_STORE_FILE:-}" ]]; then
  missing=()
  [[ -n "${OKOSHITEYO_UPLOAD_STORE_PASSWORD:-}" ]] || missing+=("OKOSHITEYO_UPLOAD_STORE_PASSWORD")
  [[ -n "${OKOSHITEYO_UPLOAD_KEY_ALIAS:-}" ]] || missing+=("OKOSHITEYO_UPLOAD_KEY_ALIAS")
  [[ -n "${OKOSHITEYO_UPLOAD_KEY_PASSWORD:-}" ]] || missing+=("OKOSHITEYO_UPLOAD_KEY_PASSWORD")

  if (( ${#missing[@]} > 0 )); then
    echo "ERROR: keystore は指定されていますが、以下の環境変数が未設定です:" >&2
    for key in "${missing[@]}"; do
      echo "  - ${key}" >&2
    done
    exit 1
  fi

  GRADLE_ARGS+=(
    "-POKOSHITEYO_UPLOAD_STORE_FILE=${OKOSHITEYO_UPLOAD_STORE_FILE}"
    "-POKOSHITEYO_UPLOAD_STORE_PASSWORD=${OKOSHITEYO_UPLOAD_STORE_PASSWORD}"
    "-POKOSHITEYO_UPLOAD_KEY_ALIAS=${OKOSHITEYO_UPLOAD_KEY_ALIAS}"
    "-POKOSHITEYO_UPLOAD_KEY_PASSWORD=${OKOSHITEYO_UPLOAD_KEY_PASSWORD}"
  )
else
  echo "ERROR: 署名情報が未設定です。このスクリプトは Play Store 用AAB生成を目的としているため中断します。" >&2
  echo "  対応:" >&2
  echo "    1) upload keystore を作成（例: android/app/okoshiteyo-upload.jks）" >&2
  echo "    2) 以下の環境変数を設定して再実行:" >&2
  echo "       - OKOSHITEYO_UPLOAD_STORE_FILE" >&2
  echo "       - OKOSHITEYO_UPLOAD_STORE_PASSWORD" >&2
  echo "       - OKOSHITEYO_UPLOAD_KEY_ALIAS" >&2
  echo "       - OKOSHITEYO_UPLOAD_KEY_PASSWORD" >&2
  echo "  どうしても debug 署名の release ビルドが欲しい場合は:" >&2
  echo "       OKOSHITEYO_ALLOW_DEBUG_SIGNED_RELEASE=true を -P で渡してください（アップロード不可）。" >&2
  exit 1
fi

./gradlew "${GRADLE_ARGS[@]}"

OUTPUT_DIR="$ANDROID_DIR/app/build/outputs/bundle/release"
LATEST_AAB="$(ls -t "$OUTPUT_DIR"/*.aab 2>/dev/null | head -n 1 || true)"
if [[ -n "$LATEST_AAB" ]]; then
  echo "DONE: ${LATEST_AAB}"
else
  echo "DONE: AAB が見つかりませんでした。出力先を確認してください: ${OUTPUT_DIR}" >&2
fi
