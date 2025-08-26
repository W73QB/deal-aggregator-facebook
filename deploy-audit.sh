#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIG ======
OWNER="W73QB"
REPO="deal-aggregator-facebook"
BRANCH="main"
SITE="https://dealradarus.com"

FILES=(
  "index.html"
  "home.html"
  "pages/index.html"
  "pages/deals.html"
  "pages/blog.html"
)

say(){ printf "\n\033[1;36m%s\033[0m\n" "$*"; }
ok(){ printf "\033[1;32m%s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m%s\033[0m\n" "$*"; }
err(){ printf "\033[1;31m%s\033[0m\n" "$*"; }

say "🚀 Deploy Audit Report for $REPO → $SITE"
TMPDIR=$(mktemp -d)

for f in "${FILES[@]}"; do
  say "🔍 Kiểm tra file: $f"

  # Lấy bản từ GitHub main branch
  RAW_URL="https://raw.githubusercontent.com/$OWNER/$REPO/$BRANCH/$f"
  curl -fsSL "$RAW_URL" -o "$TMPDIR/local.html" || { warn "⚠️ Không tìm thấy $f trong repo"; continue; }

  # Lấy bản từ production
  URL="$SITE/$f"
  [[ "$f" == "index.html" ]] && URL="$SITE/"   # homepage đặc biệt
  curl -fsSL "$URL" -o "$TMPDIR/live.html" || { err "❌ Không lấy được $URL"; continue; }

  # So sánh
  if diff -q "$TMPDIR/local.html" "$TMPDIR/live.html" >/dev/null; then
    ok "✅ KHỚP với repo ($f)"
  else
    err "❌ KHÔNG KHỚP ($f)"
    echo "   → Khác biệt (show 10 dòng cuối diff):"
    diff -u "$TMPDIR/local.html" "$TMPDIR/live.html" | tail -n 10
  fi

  # Kiểm tra còn debug line?
  if grep -q "CI/CD Test" "$TMPDIR/live.html"; then
    err "   ⚠️ LIVE site vẫn chứa 'CI/CD Test'"
  fi

  # Kiểm tra placeholder link?
  if grep -q "example.com" "$TMPDIR/live.html"; then
    err "   ⚠️ LIVE site vẫn chứa placeholder link"
  fi
done

say "📊 Audit hoàn tất"
rm -rf "$TMPDIR"