#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG (sửa nếu khác) =====
REPO_DIR="/Users/admin/projects/deal-aggregator-facebook"
REMOTE="origin"
BASE="main"
BR="hotfix/remove-cicd-debugline"
SITE_ORIGIN="https://dealradarus.com"

# Tuỳ chọn (Cloudflare): export trước khi chạy
# export CF_API_TOKEN="***"
# export CF_ZONE_ID="***"

cd "$REPO_DIR"

say(){ printf "\n\033[1;36m%s\033[0m\n" "$*"; }
warn(){ printf "\n\033[1;33m%s\033[0m\n" "$*"; }
die(){ printf "\n\033[1;31m%s\033[0m\n" "$*"; exit 1; }
have(){ command -v "$1" >/dev/null 2>&1; }

say "🔄 Fetch & sync"
git fetch "$REMOTE" --prune
git checkout "$BR" || die "Không thấy nhánh $BR"
git rebase "$REMOTE/$BASE" || { warn "Rebase lỗi → dùng merge"; git merge --no-edit "$REMOTE/$BASE" || true; }

# Sanity: repo local không còn chuỗi lỗi
if grep -R "CI/CD Test" --include="*.html" . >/dev/null 2>&1; then
  die "❌ Local vẫn còn 'CI/CD Test'. Dừng để tránh mang lỗi lên prod."
fi

# ===== PR & Merge =====
if have gh; then
  say "🔗 Tạo/mở PR"
  if gh pr view "$BR" --head "$BR" >/dev/null 2>&1; then
    PRN=$(gh pr view "$BR" --json number -q '.number')
    say "ℹ️ Đã có PR #$PRN"
  else
    gh pr create --base "$BASE" --head "$BR" \
      --title "fix(html): remove stray CI/CD Test tail from all HTML" \
      --body "- Remove leftover debug line after </html> across all served variants\n- QA: grep live & multiple endpoints" || die "Tạo PR thất bại"
    PRN=$(gh pr view "$BR" --json number -q '.number')
  fi
  say "🤖 Bật auto-merge (squash) khi CI PASS"
  gh pr merge "$BR" --squash --auto || warn "Không bật auto-merge được (chờ CI hoặc thiếu quyền)."

  say "⏳ Chờ PR merge (tối đa ~8 phút, kiểm tra mỗi 15s)"
  for i in {1..32}; do
    MSTATE=$(gh pr view "$PRN" --json state -q '.state' || echo "UNKNOWN")
    [[ "$MSTATE" == "MERGED" ]] && { say "✅ PR đã merge"; break; }
    sleep 15
  done
  [[ "${MSTATE:-}" == "MERGED" ]] || die "❌ PR chưa merge. Hãy kiểm tra CI/permissions."
else
  warn "⚠️ gh CLI chưa cấu hình → hãy merge PR thủ công rồi chạy lại phần VERIFY bên dưới."
fi

# ===== Trigger deploy theo nền tảng phổ biến (best-effort) =====
say "🚀 Trigger deploy (best-effort)"
# GitHub Pages: giả định workflow pages
if have gh && gh workflow list --limit 200 | grep -qi "pages"; then
  gh workflow run "$(gh workflow list --limit 200 | awk 'NR==1{print $1}')" || true
fi
# Vercel / Netlify: nếu có CLI & token thì có thể thêm lệnh tương ứng.

# ===== Purge CDN (Cloudflare nếu có token & zone) =====
if [[ -n "${CF_API_TOKEN:-}" && -n "${CF_ZONE_ID:-}" ]]; then
  say "🧼 Purge Cloudflare cache"
  curl -fsS -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' >/dev/null && say "✅ Purged"
else
  warn "ℹ️ Bỏ qua purge Cloudflare (không có CF_API_TOKEN/CF_ZONE_ID)."
fi

# ===== VERIFY live (không phụ thuộc cache trình duyệt) =====
say "🧪 Verify live endpoints (grep không được trả về gì)"
fail=0
check(){
  local url="$1"
  if curl -fsS "$url" | grep -n "CI/CD Test" ; then
    printf "❌ STILL FOUND in %s\n" "$url"
    fail=1
  else
    printf "✅ Clean: %s\n" "$url"
  fi
}
sleep 10  # đệm nhỏ sau deploy/purge
check "$SITE_ORIGIN/"
check "$SITE_ORIGIN/index.html"
check "$SITE_ORIGIN/pages/index.html"
check "$SITE_ORIGIN/pages/deals.html"
check "$SITE_ORIGIN/pages/blog.html"

# ===== Kết luận =====
if [[ $fail -eq 0 ]]; then
  say "🎉 LIVE CLEAN — không còn 'CI/CD Test' ở production."
  cat > POST_DEPLOY_VERIFY.md <<MD
# ✅ Post-deploy verify — hotfix CI/CD line
- [x] Root: /
- [x] /index.html
- [x] /pages/index.html
- [x] /pages/deals.html
- [x] /pages/blog.html
All endpoints are clean (no 'CI/CD Test'). CDN purged: ${CF_ZONE_ID:+yes}${CF_ZONE_ID:-no}.
MD
else
  die "❌ Vẫn còn điểm chưa sạch. Hãy kiểm tra đường dẫn deploy thực tế (build/dist) hoặc CDN layer."
fi