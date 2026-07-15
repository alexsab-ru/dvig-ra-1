#!/usr/bin/env bash
set -euo pipefail

# Деплой статической сборки сайта в бакет Yandex Object Storage.
#
# Использование:
#   ./scripts/deploy-yc.sh              # pnpm build + загрузка в бакет
#   ./scripts/deploy-yc.sh --no-build   # загрузить уже собранный dist/ без пересборки
#   YC_BUCKET=other.bucket ./scripts/deploy-yc.sh
#
# Требуется авторизованный yc CLI (yc init).

BUCKET="${YC_BUCKET:-www.dvig-ra.ru}"
DIST_DIR="${DIST_DIR:-dist}"
DO_BUILD=true

for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=false ;;
    *) echo "Неизвестный аргумент: $arg" >&2; exit 1 ;;
  esac
done

# yc может быть не в PATH (стандартная установка — в ~/yandex-cloud/bin)
if ! command -v yc >/dev/null 2>&1; then
  if [ -x "$HOME/yandex-cloud/bin/yc" ]; then
    export PATH="$HOME/yandex-cloud/bin:$PATH"
  else
    echo "yc CLI не найден. Установите: https://yandex.cloud/ru/docs/cli/quickstart" >&2
    exit 1
  fi
fi

cd "$(dirname "$0")/.."

if $DO_BUILD; then
  echo "==> Сборка (pnpm build)"
  pnpm build
fi

if [ ! -f "$DIST_DIR/index.html" ]; then
  echo "В $DIST_DIR нет index.html — сборка отсутствует или не удалась" >&2
  exit 1
fi

if [ -f "$DIST_DIR/sitemap-0.xml" ] && [ ! -f "$DIST_DIR/sitemap.xml" ]; then
  cp "$DIST_DIR/sitemap-0.xml" "$DIST_DIR/sitemap.xml"
fi

echo "==> Загрузка $DIST_DIR/ в s3://$BUCKET/"
yc storage s3 cp --recursive "$DIST_DIR/" "s3://$BUCKET/"

echo "==> Готово: http://$BUCKET.website.yandexcloud.net"
