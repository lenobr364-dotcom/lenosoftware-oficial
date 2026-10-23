#!/usr/bin/env bash
# Backup rápido: SQLite + prisma + configs + messages (sem .env — segredos).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$ROOT/backups/chemvault-$STAMP"
mkdir -p "$DEST"
echo "Backup -> $DEST"

if [[ -f "$ROOT/prisma/dev.db" ]]; then
  cp -a "$ROOT/prisma/dev.db" "$DEST/dev.db"
  echo "  + prisma/dev.db"
elif [[ -f "$ROOT/dev.db" ]]; then
  cp -a "$ROOT/dev.db" "$DEST/dev.db"
  echo "  + dev.db"
fi

if [[ -d "$ROOT/prisma" ]]; then
  mkdir -p "$DEST/prisma"
  [[ -f "$ROOT/prisma/schema.prisma" ]] && cp -a "$ROOT/prisma/schema.prisma" "$DEST/prisma/"
  [[ -d "$ROOT/prisma/migrations" ]] && cp -a "$ROOT/prisma/migrations" "$DEST/prisma/"
  echo "  + prisma/"
fi

for f in package.json package-lock.json next.config.ts tsconfig.json .env.example middleware.ts; do
  [[ -f "$ROOT/$f" ]] && cp -a "$ROOT/$f" "$DEST/" && echo "  + $f"
done

[[ -d "$ROOT/messages" ]] && cp -a "$ROOT/messages" "$DEST/messages" && echo "  + messages/"
echo "Done."
